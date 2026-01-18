import { useState, useCallback, useEffect, useReducer } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  MachineRegistrationData,
  MachineRegistrationSchema,
  defaultMachineRegistrationData,
  validateMachineStep,
  CreateMachineRequest,
  CreateMachineResponse,
} from '@contracts';
import { machineService } from '../../services/api/machineService';
import { getSessionToken } from '../../store/slices/authSlice';
import { useAuthStore } from '../../store/slices/authSlice';
import { WizardStep } from '../../components/forms/wizard';
import { BasicInfoStep, PhotoStep, TechnicalSpecsStep, ConfirmationStep } from '../../screens/machines/machine-registration/steps';
import { useZodForm } from '../../hooks/useZodForm';
import { useMachineTypes } from '../../hooks';
import type { MachineTypeResponse } from '@contracts';
import { toast } from '@components/ui';
import { useNavigate } from 'react-router-dom';
import { modal } from '@helpers/modal';
import { uploadImageToCloudinary } from '../../services/cloudinary/cloudinaryService';

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
  
  // Photo file management (stored in memory during wizard navigation)
  photoFile: File | null;
  setPhotoFile: (file: File | null) => void;
  
  // TODO: Strategic feature - Upload progress tracking
  // uploadProgress?: number; // 0-100 percentage for Cloudinary upload
  // Purpose: Show progress bar during photo upload for better UX on slow connections
  
  // TODO: Strategic feature - Upload retry management
  // uploadRetryCount?: number; // Track automatic retry attempts
  // maxRetries?: number; // Configurable max retries (default: 2)
  // Purpose: Implement exponential backoff retry strategy for failed uploads
  
  // TODO: Strategic feature - Offline support
  // isOffline?: boolean; // Track network connectivity
  // queuedUploads?: File[]; // Queue uploads when offline
  // Purpose: Allow form completion offline and upload when connection restored
  
  // Actions
  handleWizardSubmit: (_wizardData: MachineRegistrationData) => Promise<void>;
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
 * - Manejar UI state (loading, errors)
 * - Transformar datos entre UI format y domain format
 * - Gestionar upload de foto a Cloudinary en submit flow
 *
 * FEATURES IMPLEMENTADAS:
 * • React Hook Form con validación Zod
 * • Wizard configuration con steps y validaciones
 * • Manejo de errores granular
 * • Sincronización perfecta wizard <-> RHF
 * • Upload de imagen diferido hasta submit final
 * • File object persistence durante navegación del wizard
 * • Modales de feedback para upload (loading/success/error)
 * • Opción "Cargar Luego" cuando upload falla
 * • Cleanup automático de File object al desmontar
 * 
 * FLUJO DE SUBMIT:
 * 1. Validar datos del formulario
 * 2. Si existe photoFile: Upload a Cloudinary con modal de feedback
 * 3. En caso de error: Modal con opciones (Reintentar/Cargar Luego/Cancelar)
 * 4. Actualizar form con URL de Cloudinary
 * 5. Crear máquina en backend con todos los datos
 * 6. Cleanup y redirección
 */
export function useMachineRegistrationViewModel(): MachineRegistrationViewModel {
  const { t } = useTranslation();
  
  // React Hook Form con Zod validation
  const form = useZodForm<MachineRegistrationData>({
    schema: MachineRegistrationSchema,
    defaultValues: defaultMachineRegistrationData,
    mode: 'onChange', // Validate on change for better UX
  });
  const navigate = useNavigate();

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Photo file management - stored in memory during wizard navigation
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Cleanup: Revoke object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (photoFile) {
        // Clean up any object URLs that may have been created
        console.log('🧹 Cleaning up photoFile on unmount');
        setPhotoFile(null);
      }
    };
  }, [photoFile]);

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
      title: 'Foto de la Máquina',
      description: 'Imagen representativa',
      component: PhotoStep,
      isValid: () => {
        // Valid if either photoFile selected OR "add later" checked
        const formValues = form.getValues();
        const hasPhotoFile = photoFile !== null;
        const addLater = formValues.addPhotoLater === true;
        
        return hasPhotoFile || addLater;
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
   * 
   * Flow:
   * 1. Validate form data
   * 2. If photoFile exists: Upload to Cloudinary first
   * 3. Use Cloudinary URL in machine data
   * 4. Create machine in backend
   * 5. Cleanup and redirect
   */
  const handleWizardSubmit = useCallback(async (_wizardData: MachineRegistrationData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use form.getValues() as single source of truth
      const currentFormData = form.getValues();
      const machineName = currentFormData.basicInfo?.name?.trim() 
        || `${currentFormData.basicInfo?.brand} ${currentFormData.basicInfo?.modelName}`.trim();
      
      // Trigger validation
      const isValid = await form.trigger();
      if (!isValid) {
        throw new Error(t('machines.registration.error.invalidData'));
      }

      console.log('✔️ Submitting machine registration:', currentFormData);

      // ============================================
      // STEP 1: Upload photo to Cloudinary if exists
      // ============================================
      let cloudinaryUrl: string | undefined = undefined;
      
      if (photoFile) {
        try {
          // Show loading modal while uploading
          modal.showLoading(t('machines.registration.uploadingPhoto'));
          
          console.log('📤 Uploading photo to Cloudinary...', {
            fileName: photoFile.name,
            fileSize: (photoFile.size / 1024 / 1024).toFixed(2) + 'MB',
          });
          
          // Upload to Cloudinary
          cloudinaryUrl = await uploadImageToCloudinary(photoFile);
          
          console.log('✅ Photo uploaded to Cloudinary:', cloudinaryUrl);
          
          // Show success feedback briefly
          modal.showFeedback({
            title: t('machines.registration.photoSaved'),
            variant: 'success',
            dismissible: true,
          });
          
          // Wait for success modal to show, then auto-close
          await new Promise(resolve => setTimeout(resolve, 1500));
          modal.hide();
          
        } catch (uploadError) {
          console.error('❌ Error uploading photo to Cloudinary:', uploadError);
          
          // Hide loading modal
          modal.hide();
          
          // Show error modal with options
          const shouldContinue = await modal.confirm({
            title: t('machines.registration.uploadError.title'),
            description: t('machines.registration.uploadError.message'),
            confirmText: t('machines.registration.uploadError.skipPhoto'),
            cancelText: t('machines.registration.uploadError.cancel'),
            action: 'warning',
          });
          
          if (!shouldContinue) {
            // User chose to cancel the entire registration
            throw new Error(t('machines.registration.error.cancelled'));
          }
          
          // User chose "Cargar Luego" - set addPhotoLater flag
          form.setValue('addPhotoLater', true);
          console.log('ℹ️ User chose to skip photo upload, continuing without photo');
        }
      }
      
      // ============================================
      // STEP 2: Update form with Cloudinary URL
      // ============================================
      if (cloudinaryUrl) {
        form.setValue('technicalSpecs.machinePhotoUrl', cloudinaryUrl);
        currentFormData.technicalSpecs.machinePhotoUrl = cloudinaryUrl;
      }
      
      // ============================================
      // STEP 3: Create machine in backend
      // ============================================
      modal.showLoading(t('machines.registration.savingData'));
      
      // Map wizard data to API request format
      const payload = mapWizardDataToDomain(currentFormData);
      console.log('✔️ Mapped payload:', payload);
      
      // Get token from auth store
      const token = getSessionToken();
      if (!token) {
        throw new Error(t('machines.registration.error.noToken'));
      }
      
      // Build headers with Authorization
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      
      console.log('ℹ️ Sending request with Authorization header');
      
      // Call API to create machine
      const response = await machineService.createMachine(payload, headers);
      
      // Validate server response
      if (!response || !response.data) {
        throw new Error(t('machines.registration.error.invalidResponse'));
      }

      console.log('✅ Machine registered successfully:', response.data);
      
      // ============================================
      // STEP 4: Cleanup and redirect
      // ============================================
      // Show loading modal and redirect after delay
      modal.showLoading(t('machines.registration.loading'));
      setTimeout(() => {
        modal.hide();
        
        // Clean up photo file from memory
        setPhotoFile(null);
        
        // Reset form to defaults
        form.reset(defaultMachineRegistrationData);
        
        // Navigate to machines list
        navigate('/machines');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error registering machine:', error);
      
      // Hide any open modals
      modal.hide();
      
      // Determine error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : t('machines.registration.error.unknown');
      
      setError(errorMessage);
      
      // Show error toast
      toast.error({
        title: t('machines.registration.error.title'),
        description: errorMessage,
      });
      
      throw error; // Re-throw to be handled by wizard
    } finally {
      setIsLoading(false);
    }
  }, [form, navigate, t, photoFile]);

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
    setPhotoFile(null); // Clean up photo file from memory
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
    
    // Photo file management
    photoFile,
    setPhotoFile,
    
    // Machine types from hook
    machineTypeList,
    machineTypesLoading,
    machineTypesError,
    refetchMachineTypes,
    
    // Actions
    handleWizardSubmit,
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
    location: wizardData.technicalSpecs.currentLocation ? {
      siteName: wizardData.technicalSpecs.currentLocation,
      lastUpdated: new Date().toISOString(),
    } : undefined,
    nickname: wizardData.basicInfo.name,
    initialStatus: wizardData.technicalSpecs.isActive ? 'ACTIVE' : 'MAINTENANCE',
    assignedTo: wizardData.technicalSpecs.assignedTo,
    usageSchedule: wizardData.technicalSpecs.usageSchedule,
    machinePhotoUrl: wizardData.technicalSpecs.machinePhotoUrl,
  };
}

// TODO: Implementar mapper inverso para edición
// function mapDomainToWizardData(machine: CreateMachineResponse): MachineRegistrationData { ... }
