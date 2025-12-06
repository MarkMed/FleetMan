import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from '@components/ui';
import type {
  QuickCheckItemUI,
  QuickCheckItemInput,
  QuickCheckMode,
  QuickCheckItemResult,
  QuickCheckResult,
  EvaluationStats,
  QuickCheckEvaluations,
} from '@models/QuickCheck';
import type { CreateQuickCheckRecord } from '@contracts';
import { quickCheckService } from '@services/api/quickCheckService';
import { getSessionToken } from '@store/slices/authSlice';

// localStorage key helper
const getStorageKey = (machineId: string) => `quickcheck_${machineId}`;

/**
 * ViewModel para QuickCheck con state machine (EDITING → EXECUTING → COMPLETED)
 * 
 * Responsabilidades:
 * - Gestionar estados de UI (mode)
 * - CRUD de items del checklist
 * - Track de evaluaciones por item
 * - Cálculo automático de stats y resultado
 * - Persistencia en localStorage
 * - Control de modal
 */
export function useQuickCheckViewModel() {
  const { id: machineId } = useParams<{ id: string }>();
  
  if (!machineId) {
    throw new Error('Machine ID is required');
  }

  // ===== State =====
  const [mode, setMode] = useState<QuickCheckMode>('EDITING');
  const [items, setItems] = useState<QuickCheckItemUI[]>([]);
  const [evaluations, setEvaluations] = useState<QuickCheckEvaluations>({});
  const [observations, setObservations] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // ===== Load items from localStorage on mount =====
  useEffect(() => {
    const loadItems = () => {
      try {
        const stored = localStorage.getItem(getStorageKey(machineId));
        if (stored) {
          const parsedItems = JSON.parse(stored) as QuickCheckItemUI[];
          setItems(parsedItems);
          
          // Initialize evaluations for all items
          const initialEvaluations: QuickCheckEvaluations = {};
          parsedItems.forEach(item => {
            initialEvaluations[item.id] = null;
          });
          setEvaluations(initialEvaluations);
        }
      } catch (err) {
        console.error('Error loading QuickCheck items:', err);
        setError('Error al cargar los items del QuickCheck');
      }
    };

    loadItems();
  }, [machineId]);

  // ===== Save items to localStorage whenever they change =====
  const saveItems = useCallback((newItems: QuickCheckItemUI[]) => {
    try {
      localStorage.setItem(getStorageKey(machineId), JSON.stringify(newItems));
    } catch (err) {
      console.error('Error saving QuickCheck items:', err);
      toast.error({
        title: 'Error',
        description: 'No se pudieron guardar los items',
      });
    }
  }, [machineId]);

 // ===== CRUD Operations =====
  const addItem = useCallback((data: QuickCheckItemInput) => {
    const newItem: QuickCheckItemUI = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      name: data.name,
      description: data.description,
    };

    setItems(prev => {
      const updated = [...prev, newItem];
      saveItems(updated);
      return updated;
    });

    // Initialize evaluation for new item
    setEvaluations(prev => ({ ...prev, [newItem.id]: null }));

    toast.success({
      title: 'Item agregado',
      description: `"${data.name}" fue agregado exitosamente`,
    });

    setIsModalOpen(false);
  }, [saveItems]);

  const editItem = useCallback((id: string, data: QuickCheckItemInput) => {
    setItems(prev => {
      const updated = prev.map(item =>
        item.id === id
          ? { ...item, name: data.name, description: data.description }
          : item
      );
      saveItems(updated);
      return updated;
    });

    toast.success({
      title: 'Item actualizado',
      description: 'Los cambios fueron guardados',
    });

    setIsModalOpen(false);
    setEditingItemId(null);
  }, [saveItems]);

  const deleteItem = useCallback((id: string) => {
    setItems(prev => {
      const itemToDelete = prev.find(item => item.id === id);
      if (!itemToDelete) return prev;

      const updated = prev.filter(item => item.id !== id);
      saveItems(updated);

      toast.success({
        title: 'Item eliminado',
        description: `"${itemToDelete.name}" fue eliminado`,
      });

      return updated;
    });

    // Remove evaluation for deleted item
    setEvaluations(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  }, [saveItems]);

  // ===== Evaluation Management =====
  const setEvaluation = useCallback((itemId: string, status: QuickCheckItemResult) => {
    setEvaluations(prev => ({
      ...prev,
      [itemId]: status,
    }));
  }, []);

  // ===== Calculate Stats (memoized) =====
  const stats: EvaluationStats = useMemo(() => {
    const total = items.length;
    const values = Object.values(evaluations);

    return {
      total,
      aprobados: values.filter(v => v === 'approved').length,
      desaprobados: values.filter(v => v === 'disapproved').length,
      omitidos: values.filter(v => v === 'omitted').length,
      pendientes: total - values.filter(v => v !== null).length,
    };
  }, [items.length, evaluations]);

  // ===== Calculate Overall Result (memoized) =====
  const overallResult: QuickCheckResult = useMemo(() => {
    if (stats.pendientes > 0) return 'notInitiated';
    if (stats.desaprobados > 0) return 'disapproved';
    return 'approved';
  }, [stats]);

  // ===== Validations =====
  const canStartExecution = useMemo(() => items.length > 0, [items.length]);

  const canSubmit = useMemo(
    () => mode === 'EXECUTING' && stats.pendientes === 0 && items.length > 0,
    [mode, stats.pendientes, items.length]
  );

  // ===== Actions =====
  const startExecution = useCallback(() => {
    if (!canStartExecution) {
      toast.error({
        title: 'Sin items',
        description: 'Debes agregar al menos un item antes de iniciar',
      });
      return;
    }

    setMode('EXECUTING');
    toast.success({
      title: 'Ejecución iniciada',
      description: 'Evalúa cada item del QuickCheck',
    });
  }, [canStartExecution]);

  const cancelExecution = useCallback(() => {
    // Reset all evaluations
    const resetEvaluations: QuickCheckEvaluations = {};
    items.forEach(item => {
      resetEvaluations[item.id] = null;
    });
    setEvaluations(resetEvaluations);
    setMode('EDITING');

    toast.info({
      title: 'Ejecución cancelada',
      description: 'Las evaluaciones fueron descartadas',
    });
  }, [items]);

  const submitQuickCheck = useCallback(async () => {
    if (!canSubmit) {
      toast.error({
        title: 'Evaluación incompleta',
        description: 'Debes evaluar todos los items antes de finalizar',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get auth token
      const token = getSessionToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      // Prepare payload using CreateQuickCheckRecord from contracts
      const payload: CreateQuickCheckRecord = {
        result: overallResult,
        quickCheckItems: items.map(item => ({
          name: item.name,
          description: item.description,
          result: evaluations[item.id]!, // Already QuickCheckItemResult ('approved'|'disapproved'|'omitted')
        })),
        observations: observations.trim() || undefined,
      };

      console.log('Submitting QuickCheck:', payload);

      // Make API call
      const response = await quickCheckService.addQuickCheck(
        machineId,
        payload,
        { Authorization: `Bearer ${token}` }
      );

      console.log('QuickCheck submitted successfully:', response);

      toast.success({
        title: '¡QuickCheck completado!',
        description: `Resultado: ${overallResult === 'approved' ? 'Aprobado' : overallResult === 'disapproved' ? 'Desaprobado' : 'No iniciado'}`,
      });

      // Reset state after successful submit
      setMode('EDITING');
      const resetEvaluations: QuickCheckEvaluations = {};
      items.forEach(item => {
        resetEvaluations[item.id] = null;
      });
      setEvaluations(resetEvaluations);
      setObservations('');

    } catch (err) {
      console.error('Error submitting QuickCheck:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast.error({
        title: 'Error',
        description: 'No se pudo completar el QuickCheck. Intenta nuevamente.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [canSubmit, machineId, items, evaluations, observations, overallResult]);

  const reset = useCallback(() => {
    setMode('EDITING');
    const resetEvaluations: QuickCheckEvaluations = {};
    items.forEach(item => {
      resetEvaluations[item.id] = null;
    });
    setEvaluations(resetEvaluations);
    setObservations('');
    setError(null);
  }, [items]);

  // ===== Modal Controls =====
  const openModal = useCallback((modalType: 'create' | 'edit', itemId?: string) => {
    setModalMode(modalType);
    setEditingItemId(itemId || null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItemId(null);
  }, []);

  // ===== Get editing item data =====
  const editingItem = useMemo(
    () => (editingItemId ? items.find(item => item.id === editingItemId) : undefined),
    [editingItemId, items]
  );

  return {
    // Machine context
    machineId,

    // UI State
    mode,
    setMode,

    // Items management
    items,
    addItem,
    editItem,
    deleteItem,

    // Evaluations
    evaluations,
    setEvaluation,

    // Observations
    observations,
    setObservations,

    // Summary
    stats,
    overallResult,

    // Validations
    canStartExecution,
    canSubmit,

    // Actions
    startExecution,
    cancelExecution,
    submitQuickCheck,
    reset,

    // UI state
    isLoading,
    error,

    // Modal control
    isModalOpen,
    modalMode,
    editingItemId,
    editingItem,
    openModal,
    closeModal,
  };
}

export type QuickCheckViewModel = ReturnType<typeof useQuickCheckViewModel>;
