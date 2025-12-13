import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button, Card } from '@components/ui';
import { useModalStore } from '@store/slices/modalSlice';
import { useQuickCheckViewModel } from '../../viewModels/machines/useQuickCheckViewModel';
import {
  QuickCheckEmptyState,
  QuickCheckItemModal,
  QuickCheckItemCard,
  QuickCheckSummary,
  ResponsibleInfoModal,
} from '@components/quickcheck';

export const QuickCheckScreen: React.FC = () => {
  const { id: machineId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showModal, hideModal } = useModalStore();

  const vm = useQuickCheckViewModel();

  // Handle modal open/close
  const handleOpenModal = (mode: 'create' | 'edit', itemId?: string) => {
    vm.openModal(mode, itemId);
    
    /**
     * CRITICAL FIX: React State Timing Issue - MODAL CON EDICIÓN DE DATOS
     * 
     * PROBLEMA:
     * - vm.openModal() llama a setEditingItemId(itemId) internamente
     * - React state updates son ASÍNCRONOS (no bloquean ejecución)
     * - showModal() se ejecuta INMEDIATAMENTE después, pero el state aún no se actualizó
     * - Por lo tanto, vm.editingItem (que depende de editingItemId) sigue siendo undefined
     * 
     * SOLUCIÓN:
     * - En lugar de esperar a que React actualice vm.editingItem (via editingItemId state)
     * - Buscamos directamente en vm.items usando el itemId que YA tenemos como parámetro
     * - vm.items ya está disponible en memoria (no depende del state que acabamos de setear)
     * 
     * RESULTADO:
     * - Modo CREATE: initialData = undefined → Form vacío ✅
     * - Modo EDIT: initialData = item encontrado → Form pre-llenado ✅
     * - Sin race conditions, sin timing issues
     */
    const initialData = mode === 'edit' && itemId 
      ? vm.items.find(item => item.id === itemId)
      : undefined;
    
    showModal({
      title: '', // Modal component handles title
      content: (
        <QuickCheckItemModal
          mode={mode}
          initialData={initialData}
          onSubmit={(data) => {
            if (mode === 'create') {
              vm.addItem(data);
            } else if (itemId) {
              vm.editItem(itemId, data);
            }
            hideModal();
          }}
          onCancel={() => {
            vm.closeModal();
            hideModal();
          }}
        />
      ),
      showCloseButton: true,
      dismissible: true,
      size: 'md',
      showConfirm: false,
      showCancel: false,
    });
  };

  // Handle delete with confirmation
  const handleDeleteItem = async (itemId: string) => {
    const item = vm.items.find(i => i.id === itemId);
    if (!item) return;

    // Use a ref to track if component is still mounted
    let isMounted = true;

    try {
      const confirmed = await useModalStore.getState().showConfirmation({
        title: 'Eliminar item',
        description: `¿Estás seguro de que deseas eliminar "${item.name}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      });

      if (isMounted && confirmed) {
        vm.deleteItem(itemId);
      }
    } finally {
      isMounted = false;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link to="/machines" className="hover:text-foreground">Máquinas</Link>
          <span>/</span>
          <Link to={`/machines/${machineId}`} className="hover:text-foreground">Detalle</Link>
          <span>/</span>
          <span className="text-foreground">QuickCheck</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              QuickCheck de Seguridad
            </h1>
            <p className="text-muted-foreground mt-1">
              {vm.mode === 'EDITING' && 'Define y administra los items de verificación'}
              {vm.mode === 'EXECUTING' && 'Evalúa cada item del checklist'}
              {vm.mode === 'COMPLETED' && 'Revisa el resultado de la evaluación'}
            </p>
          </div>
          <Button
            variant="outline"
            size="default"
            className="gap-2"
            onPress={() => navigate(`/machines/${machineId}/quickcheck/history`)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ver Historial
          </Button>
        </div>
      </div>

      <Card className="p-6">
        {/* EDITING MODE - Sin items */}
        {vm.mode === 'EDITING' && vm.items.length === 0 && (
          <QuickCheckEmptyState onAddFirstItem={() => handleOpenModal('create')} />
        )}

        {/* EDITING MODE - Con items */}
        {vm.mode === 'EDITING' && vm.items.length > 0 && (
          <div className="space-y-6">
            {/* Header with add button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Items de verificación ({vm.items.length})
                </h2>
                <p className="text-sm text-muted-foreground">
                  Gestiona los items que se verificarán en cada QuickCheck
                </p>
              </div>
              <Button 
                variant="outline" 
                size="default"
                onPress={() => handleOpenModal('create')}
                className="gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar item
              </Button>
            </div>

            {/* Items list */}
            <div className="space-y-3">
              {vm.items.map((item, index) => (
                <QuickCheckItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  mode="EDITING"
                  onEdit={() => handleOpenModal('edit', item.id)}
                  onDelete={() => handleDeleteItem( item.id)}
                />
              ))}
            </div>

            {/* Start execution button */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                variant="filled"
                size="lg"
                onPress={vm.startExecution}
                disabled={!vm.canStartExecution}
                className="gap-2"
              >
                Iniciar Prevención
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Button>
            </div>
          </div>
        )}

        {/* EXECUTING MODE */}
        {vm.mode === 'EXECUTING' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Ejecutando QuickCheck
                </h2>
                <p className="text-sm text-muted-foreground">
                  Evalúa cada item como Aprobado, Desaprobado u Omitido
                </p>
              </div>
              <Button
                variant="outline"
                size="default"
                onPress={vm.cancelExecution}
              >
                Cancelar
              </Button>
            </div>

            {/* Summary */}
            <QuickCheckSummary stats={vm.stats} overallResult={vm.overallResult} />

            {/* Items evaluation */}
            <div className="space-y-3">
              {vm.items.map((item, index) => (
                <QuickCheckItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  mode="EXECUTING"
                  status={vm.evaluations[item.id]}
                  onStatusChange={(status) => vm.setEvaluation(item.id, status)}
                />
              ))}
            </div>

            {/* Observations textarea */}
            <div className="space-y-2">
              <label htmlFor="observations" className="block text-sm font-medium text-foreground">
                Observaciones (opcional)
              </label>
              <textarea
                id="observations"
                rows={4}
                value={vm.observations}
                onChange={(e) => vm.setObservations(e.target.value)}
                placeholder="Agrega cualquier observación relevante sobre la evaluación..."
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {vm.observations.length} caracteres
              </p>
            </div>

            {/* Submit button */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                size="lg"
                onPress={vm.cancelExecution}
                disabled={vm.isLoading}
              >
                Descartar
              </Button>
              <Button
                variant="filled"
                size="lg"
                onPress={() => vm.setIsResponsibleModalOpen(true)}
                disabled={!vm.canSubmit || vm.isLoading}
                className="gap-2"
              >
                {vm.isLoading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Finalizar y Enviar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Error state */}
        {vm.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-950/20 dark:border-red-800">
            {vm.error}
          </div>
        )}
      </Card>

      {/* Responsible Info Modal - Sprint 8 */}
      <ResponsibleInfoModal
        isOpen={vm.isResponsibleModalOpen}
        onClose={() => vm.setIsResponsibleModalOpen(false)}
        onSubmit={(data) => {
          vm.setResponsibleName(data.name);
          vm.setResponsibleWorkerId(data.workerId);
          vm.submitQuickCheck();
        }}
        initialName={vm.responsibleName}
        initialWorkerId={vm.responsibleWorkerId}
      />
    </div>
  );
};