import { useState, useCallback, useEffect, useReducer } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  MachineRegistrationData,
  MachineRegistrationSchema,
  defaultMachineRegistrationData,
  validateMachineStep,
  CreateMachineRequest,
  CreateMachineResponse,
} from '@packages/contracts';
import { machineService } from '../../services/api/machineService';
import { getSessionToken } from '../../store/slices/authSlice';
import { useAuthStore } from '../../store/slices/authSlice';
import { WizardStep } from '../../components/forms/wizard';
import { BasicInfoStep, TechnicalSpecsStep, ConfirmationStep } from '../../screens/machines/machine-registration/steps';
import { useZodForm } from '../../hooks/useZodForm';
import { useMachineTypes } from '../../hooks';
import type { MachineTypeResponse } from '@packages/contracts';

// TODO: Importar desde @useCases cuando esté implementado
// import { CreateMachineUseCase } from '@useCases/machines';

export interface MachineRegistrationViewModel {
  // Form state
  form: UseFormReturn<MachineRegistrationData>;
  
  // Wizard state
  wizardSteps: WizardStep<MachineRegistrationData>[];
  forceUpdate: () => void;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  showSuccessModal: boolean;
  serverMessage: string | null;
  
  // Actions
  handleWizardSubmit: (wizardData: MachineRegistrationData) => Promise<void>;
  handleSuccessModalClose: () => void;
  handleCancel: () => void;
  reset: () => void;
  // Machine types data (for selects)
  machineTypeList?: MachineTypeResponse[];
  machineTypesLoading: boolean;
  machineTypesError: boolean;
  refetchMachineTypes: () => Promise<unknown> | void;
}

/**
 * ViewModel para el registro de máquinas siguiendo patrón MVVM
 * 
 * RESPONSABILIDADES:
 * - Gestionar estado del wizard multi-step con RHF integration
 * - Validar datos por step usando schemas de contracts
 * - Orquestar use cases de creación de máquina
 * - Manejar UI state (modals, loading, errors)
 * - Transformar datos entre UI format y domain format
 * 
 * FEATURES IMPLEMENTADAS:
 * ✅ React Hook Form con validación Zod
 * ✅ Wizard configuration con steps y validaciones
 * ✅ Modal de éxito con redirección
 * ✅ Manejo de errores granular
 * ✅ Sincronización perfecta wizard <-> RHF
 */
export function useMachineRegistrationViewModel(): MachineRegistrationViewModel {
  // React Hook Form con Zod validation
  const form = useZodForm<MachineRegistrationData>({
    schema: MachineRegistrationSchema,
    defaultValues: defaultMachineRegistrationData,
    mode: 'onChange', // Validate on change for better UX
  });

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  // Force re-render when form state changes to make validation reactive
  const [, forceUpdateReducer] = useReducer(x => x + 1, 0);
  const forceUpdate = useCallback(() => forceUpdateReducer(), []);

  // Subscribe to form state changes for wizard reactivity
  useEffect(() => {
    const subscription = form.watch(() => {
      forceUpdateReducer(); // Force wizard to re-evaluate isValid functions
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Configuración de los steps del wizard
  const wizardSteps: WizardStep<MachineRegistrationData>[] = [
    {
      title: 'Información Básica',
      description: 'Datos principales de la máquina',
      component: BasicInfoStep,
      isValid: () => {
        // 1. Check for validation errors (handle nested structure)
        const basicInfoErrors = form.formState.errors.basicInfo;
        const hasErrors = basicInfoErrors && Object.keys(basicInfoErrors).length > 0;
        
        // 2. Check if ALL required fields have values
        const formValues = form.getValues();
        const basicInfo = formValues.basicInfo;
        const hasRequiredValues = basicInfo?.serialNumber?.trim() && 
                                  basicInfo?.brand?.trim() && 
                                  basicInfo?.modelName?.trim() && 
                                  basicInfo?.machineTypeId?.trim() && 
                                  basicInfo?.name?.trim();
        
        // 3. Both conditions must be met
        return !hasErrors && !!hasRequiredValues;
      },
    },
    {
      title: 'Especificaciones Técnicas',
      description: 'Detalles técnicos y ubicación',
      component: TechnicalSpecsStep,
      isValid: () => {
        // 1. Check for validation errors
        const techErrors = form.formState.errors.technicalSpecs;
        const hasErrors = techErrors && Object.keys(techErrors).length > 0;
        
        // 2. Check if basic required fields have values
        const formValues = form.getValues();
        const hasRequiredTechValues = formValues.technicalSpecs?.year;
        
        // 3. Tech specs require at least year, rest is optional
        return !hasErrors && !!hasRequiredTechValues;
      },
    },
    {
      title: 'Confirmación',
      description: 'Revisar y confirmar los datos',
      component: ConfirmationStep,
      isValid: () => Object.keys(form.formState.errors).length === 0, // Summary step - valid only if no errors
    },
  ];

  // Fetch machine types (moved to ViewModel to keep screen presentational)
  const {
    data: machineTypeList,
    isLoading: machineTypesLoading,
    isError: machineTypesError,
    refetch: refetchMachineTypes,
  } = useMachineTypes();

  /**
   * Handle wizard submit - main business logic
   */
  const handleWizardSubmit = useCallback(async (wizardData: MachineRegistrationData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setServerMessage(null);
    
    try {
      // Use form.getValues() as single source of truth
      const currentFormData = form.getValues();
      
      // Trigger validation
      const isValid = await form.trigger();
      if (!isValid) {
        throw new Error('Los datos no son válidos');
      }

      console.log('📤 Submitting machine registration:', currentFormData);
      
      // Map wizard data to API request format
      const payload = mapWizardDataToDomain(currentFormData);
      console.log('📦 Mapped payload:', payload);
      
      // Get token from auth store
      const token = getSessionToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
      }
      
      // Build headers with Authorization
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      
      console.log('🔐 Sending request with Authorization header');
      
      // Call API to create machine
      const response = await machineService.createMachine(payload, headers);
      const responseData = response.data;
      
      console.log('✅ Machine registered successfully:', responseData);
      
      // Set success message from server response
      setServerMessage(
        `Máquina "${responseData.brand} ${responseData.modelName}" registrada exitosamente con ID: ${responseData.id}`
      );
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('❌ Error registering machine:', error);
      
      // Set error both in ViewModel and RHF
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al registrar la máquina';
      setError(errorMessage);
      form.setError('root', { message: errorMessage });
      
      throw error; // Re-throw to be handled by wizard
    } finally {
      setIsLoading(false);
    }
  }, [form]);

  /**
   * Handle success modal close with navigation
   */
  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
    
    // Reset form and state
    form.reset(defaultMachineRegistrationData);
    setError(null);
    setServerMessage(null);
    
    // TODO: Navigate to dashboard when router is available
    // navigate('/dashboard/machines');
    console.log('Navigation to dashboard would happen here');
  }, [form]);

  /**
   * Handle cancel action
   */
  const handleCancel = useCallback(() => {
    form.reset(defaultMachineRegistrationData);
    setError(null);
  }, [form]);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    form.reset(defaultMachineRegistrationData);
    setError(null);
    setIsLoading(false);
    setShowSuccessModal(false);
  }, [form]);

  return {
    // Form state
    form,
    
    // Wizard state
    wizardSteps,
    forceUpdate,
    
    // UI State
    isLoading,
    error,
    showSuccessModal,
    serverMessage,
    // Machine types from hook
    machineTypeList,
    machineTypesLoading,
    machineTypesError,
    refetchMachineTypes,
    
    // Actions
    handleWizardSubmit,
    handleSuccessModalClose,
    handleCancel,
    reset,
  };
}

/**
 * Mapea los datos del wizard UI a formato del dominio
 * 
 * @param wizardData - Datos del wizard
 * @returns Datos en formato CreateMachineRequest
 */
function mapWizardDataToDomain(wizardData: MachineRegistrationData): CreateMachineRequest {
  // Get current user ID from auth store
  const currentUserId = useAuthStore.getState().user?.id;
  
  if (!currentUserId) {
    throw new Error('No se pudo obtener el ID del usuario autenticado');
  }
  
  return {
    serialNumber: wizardData.basicInfo.serialNumber,
    brand: wizardData.basicInfo.brand,
    modelName: wizardData.basicInfo.modelName,
    machineTypeId: wizardData.basicInfo.machineTypeId,
    ownerId: wizardData.basicInfo.ownerId || currentUserId,
    createdById: wizardData.basicInfo.createdById || currentUserId,
    specs: {
      year: wizardData.technicalSpecs.year,
      operatingHours: wizardData.technicalSpecs.operatingHours,
      fuelType: wizardData.technicalSpecs.fuelType as any, // Type conversion for fuel type
      // TODO: Map additional specs fields when backend supports them
      // attachments: wizardData.technicalSpecs.attachments,
      // specialFeatures: wizardData.technicalSpecs.specialFeatures,
    },
    // TODO: Implement location mapping when backend supports full location object
    // location: wizardData.technicalSpecs.currentLocation ? {
    //   siteName: wizardData.technicalSpecs.currentLocation,
    //   lastUpdated: new Date().toISOString(),
    // } : undefined,
    nickname: wizardData.basicInfo.nickname,
    initialStatus: wizardData.technicalSpecs.isActive ? 'ACTIVE' : 'MAINTENANCE',
  };
}

// TODO: Implementar mapper inverso para edición
// function mapDomainToWizardData(machine: CreateMachineResponse): MachineRegistrationData { ... }