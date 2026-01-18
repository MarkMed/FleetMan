import { useState, useCallback, useEffect, useReducer, useMemo, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  MachineRegistrationData,
  MachineRegistrationSchema,
  CreateMachineResponse,
  UpdateMachineRequest,
} from '@contracts';
import { getSessionToken } from '../../store/slices/authSlice';
import { WizardStep } from '../../components/forms/wizard';
import { TechnicalSpecsStep } from '../../screens/machines/machine-registration/steps';
import { PhotoStepEdit, BasicInfoStepEdit, ConfirmationStepEdit } from '../../screens/machines/machine-edit/steps';
import { useZodForm } from '../../hooks/useZodForm';
import { useMachine, useUpdateMachine } from '../../hooks/useMachines';
import { useMachineTypes } from '../../hooks';
import type { MachineTypeResponse } from '@contracts';
import { toast } from '@components/ui';
import { modal } from '@helpers/modal';
import { uploadImageToCloudinary } from '../../services/cloudinary/cloudinaryService';

export interface MachineEditViewModel {
  // Form state
  form: UseFormReturn<MachineRegistrationData>;
  
  // Wizard state
  wizardSteps: WizardStep<MachineRegistrationData>[];
  forceUpdate: () => void;
  
  // UI State
  isLoading: boolean;
  isLoadingMachineData: boolean;
  error: string | null;
  
  // Photo file management
  photoFile: File | null;
  setPhotoFile: (file: File | null) => void;
  existingPhotoUrl: string | null;
  
  // Photo edit state flags
  shouldRemovePhoto: boolean;
  setShouldRemovePhoto: (value: boolean) => void;
  
  // Machine data
  machine?: CreateMachineResponse;
  
  // TODO: Strategic feature - Track field changes
  // changedFields?: Set<string>; // Track which fields were modified
  // Purpose: Show "unsaved changes" warning and optimize API payload (send only changed fields)
  
  // TODO: Strategic feature - Draft auto-save
  // autoSaveDraft?: () => void; // Save draft to localStorage every 30s
  // loadDraft?: () => void; // Restore draft on mount
  // Purpose: Prevent data loss if user closes browser accidentally
  
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
 * ViewModel para la edición de máquinas siguiendo patrón MVVM
 *
 * RESPONSABILIDADES:
 * - Cargar datos de máquina existente desde API
 * - Pre-poblar wizard form con datos actuales
 * - Gestionar estado del wizard multi-step con RHF integration
 * - Validar datos por step usando schemas de contracts
 * - Orquestar use case de actualización de máquina
 * - Manejar UI state (loading, errors)
 * - Transformar datos entre UI format y domain format
 * - Gestionar upload de foto a Cloudinary (solo si cambió)
 * - Gestionar eliminación de foto (setear URL a '')
 *
 * DIFERENCIAS CON REGISTRATION:
 * • Carga machine existente con useMachine(id)
 * • Pre-pobla form con mapMachineToWizardData()
 * • Usa PhotoStepEdit con botones Cambiar/Eliminar
 * • Deshabilita serialNumber (inmutable)
 * • Llama a useUpdateMachine() en vez de useCreateMachine()
 * • Solo sube foto a Cloudinary si hay File nuevo
 * • Si shouldRemovePhoto=true, envía machinePhotoUrl=''
 * 
 * FLUJO DE SUBMIT:
 * 1. Validar datos del formulario
 * 2. Si shouldRemovePhoto=true: setear machinePhotoUrl a ''
 * 3. Si existe photoFile nuevo: Upload a Cloudinary con modal de feedback
 * 4. En caso de error: Modal con opciones (Reintentar/Mantener Foto Actual/Cancelar)
 * 5. Actualizar form con nueva URL de Cloudinary (o '' si eliminó)
 * 6. Actualizar máquina en backend con todos los datos
 * 7. Invalidar cache y redirección a detalles
 */
export function useMachineEditViewModel(machineId: string): MachineEditViewModel {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Load existing machine data
  const {
    data: machine,
    isLoading: isLoadingMachineData,
    isError: isMachineError,
    error: machineError,
  } = useMachine(machineId);

  // React Hook Form con Zod validation
  const form = useZodForm<MachineRegistrationData>({
    schema: MachineRegistrationSchema,
    defaultValues: {}, // Will be populated when machine loads
    mode: 'onChange',
  });

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Photo file management
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [shouldRemovePhoto, setShouldRemovePhoto] = useState(false);

  // Update mutation
  const updateMutation = useUpdateMachine(machineId);

  // Cleanup: Revoke object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (photoFile) {
        setPhotoFile(null);
      }
    };
  }, [photoFile]);

  // Pre-populate form when machine data loads
  useEffect(() => {
    if (machine && !form.formState.isDirty) {
      const formData = mapMachineToWizardData(machine);
      form.reset(formData);
      
      // Store existing photo URL for comparison
      setExistingPhotoUrl(machine.machinePhotoUrl || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machine]);
  // Nota: form es estable (mismo objeto de RHF), no debería estar en dependencias

  // Handle machine load errors
  useEffect(() => {
    if (isMachineError) {
      const errorMessage = machineError instanceof Error 
        ? machineError.message 
        : t('machines.edit.error.loadFailed');
      setError(errorMessage);
      toast.error({
        title: t('machines.edit.error.title'),
        description: errorMessage,
      });
    }
  }, [isMachineError, machineError, t]);

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

  // Configuración de los steps del wizard (reusa 3 steps, PhotoStepEdit customizado)
  // Memoizado para evitar recrear el array en cada render
  const wizardSteps: WizardStep<MachineRegistrationData>[] = useMemo(() => [
    {
      title: 'Información Básica',
      description: 'Datos principales de la máquina',
      component: BasicInfoStepEdit, // Use edit wrapper with isEditMode=true
      isValid: () => {
        const basicInfoErrors = form.formState.errors.basicInfo;
        const hasErrors = basicInfoErrors && Object.keys(basicInfoErrors).length > 0;
        
        const formValues = form.getValues();
        const basicInfo = formValues.basicInfo;
        const hasRequiredValues = basicInfo?.serialNumber?.trim() && 
                                  basicInfo?.brand?.trim() && 
                                  basicInfo?.modelName?.trim() && 
                                  basicInfo?.machineTypeId?.trim() && 
                                  basicInfo?.name?.trim();
        
        return !hasErrors && !!hasRequiredValues;
      },
    },
    {
      title: 'Foto de la Máquina',
      description: 'Imagen representativa',
      component: PhotoStepEdit, // ← Custom step for editing
      isValid: () => {
        // Always valid - photo is optional in edit mode
        // User can: keep existing, change, or remove
        return true;
      },
    },
    {
      title: 'Especificaciones Técnicas',
      description: 'Detalles técnicos y ubicación',
      component: TechnicalSpecsStep,
      isValid: () => {
        const techErrors = form.formState.errors.technicalSpecs;
        const hasErrors = techErrors && Object.keys(techErrors).length > 0;
        
        const formValues = form.getValues();
        const hasRequiredTechValues = formValues.technicalSpecs?.year;
        
        return !hasErrors && !!hasRequiredTechValues;
      },
    },
    {
      title: 'Confirmación',
      description: 'Revisar y confirmar los cambios',
      component: ConfirmationStepEdit,
      isValid: () => Object.keys(form.formState.errors).length === 0,
    },
  ], []);
  // Nota: form no necesita estar en dependencias - las funciones isValid capturan form por closure
  // Si form estuviera en deps, wizardSteps se recrearía en cada form change, causando loops infinitos

  // Fetch machine types (for dropdown in BasicInfoStep)
  const {
    data: machineTypeList,
    isLoading: machineTypesLoading,
    isError: machineTypesError,
    refetch: refetchMachineTypes,
  } = useMachineTypes();

  /**
   * Handle wizard submit - main business logic for UPDATE
   * 
   * Flow:
   * 1. Validate form data
   * 2. If shouldRemovePhoto: set machinePhotoUrl to ''
   * 3. If photoFile exists (new photo): Upload to Cloudinary
   * 4. Update machine in backend with all data
   * 5. Invalidate cache and redirect
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
        throw new Error(t('machines.edit.error.invalidData'));
      }

      // ============================================
      // STEP 1: Handle photo changes
      // ============================================
      let finalPhotoUrl: string | undefined = existingPhotoUrl || '';

      if (shouldRemovePhoto) {
        // User wants to remove photo
        console.log('🗑️ Removing photo');
        finalPhotoUrl = '';
      } else if (photoFile) {
        // User selected a new photo - upload to Cloudinary
        try {
          modal.showLoading(t('machines.edit.uploadingPhoto'));
          
          console.log('📤 Uploading new photo to Cloudinary...', {
            fileName: photoFile.name,
            fileSize: (photoFile.size / 1024 / 1024).toFixed(2) + 'MB',
          });
          
          finalPhotoUrl = await uploadImageToCloudinary(photoFile);
          
          console.log('✅ Photo uploaded to Cloudinary:', finalPhotoUrl);
          
          modal.showFeedback({
            title: t('machines.edit.photoSaved'),
            variant: 'success',
            dismissible: true,
          });
          
          await new Promise(resolve => setTimeout(resolve, 1500));
          modal.hide();
          
        } catch (uploadError) {
          console.error('❌ Error uploading photo to Cloudinary:', uploadError);
          
          modal.hide();
          
          const shouldContinue = await modal.confirm({
            title: t('machines.edit.uploadError.title'),
            description: t('machines.edit.uploadError.message'),
            confirmText: t('machines.edit.uploadError.keepCurrent'),
            cancelText: t('machines.edit.uploadError.cancel'),
            action: 'warning',
          });
          
          if (!shouldContinue) {
            throw new Error(t('machines.edit.error.cancelled'));
          }
          
          // User chose to keep current photo
          finalPhotoUrl = existingPhotoUrl || '';
          console.log('ℹ️ User chose to keep current photo');
        }
      } else {
        // No changes to photo - keep existing
        finalPhotoUrl = existingPhotoUrl || '';
      }
      
      // ============================================
      // STEP 2: Update form with final photo URL
      // ============================================
      if (finalPhotoUrl !== undefined) {
        form.setValue('technicalSpecs.machinePhotoUrl', finalPhotoUrl);
        currentFormData.technicalSpecs.machinePhotoUrl = finalPhotoUrl;
      }
      
      // ============================================
      // STEP 3: Update machine in backend
      // ============================================
      modal.showLoading(t('machines.edit.savingData'));
      
      // Map wizard data to API request format
      const payload = mapWizardDataToUpdateRequest(currentFormData);
      
      // Call mutation to update machine
      await updateMutation.mutateAsync(payload);
      
      // ============================================
      // STEP 4: Cleanup and redirect
      // ============================================
      modal.showLoading(t('machines.edit.loading'));
      setTimeout(() => {
        modal.hide();
        
        // Clean up photo file from memory
        setPhotoFile(null);
        setShouldRemovePhoto(false);
        
        // Navigate to machine details
        navigate(`/machines/${machineId}`);
        
        // Show success toast
        toast.success({
          title: t('machines.edit.success.title'),
          description: t('machines.edit.success.message'),
        });
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error updating machine:', error);
      
      modal.hide();
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : t('machines.edit.error.unknown');
      
      setError(errorMessage);
      
      toast.error({
        title: t('machines.edit.error.title'),
        description: errorMessage,
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [form, navigate, t, photoFile, existingPhotoUrl, shouldRemovePhoto, machineId]);
  // Nota: updateMutation.mutateAsync es estable, no necesita estar en dependencias

  /**
   * Handle cancel action
   */
  const handleCancel = useCallback(() => {
    if (machine) {
      const formData = mapMachineToWizardData(machine);
      form.reset(formData);
    }
    setError(null);
    setPhotoFile(null);
    setShouldRemovePhoto(false);
  }, [form, machine]);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    if (machine) {
      const formData = mapMachineToWizardData(machine);
      form.reset(formData);
    }
    setError(null);
    setIsLoading(false);
    setPhotoFile(null);
    setShouldRemovePhoto(false);
  }, [form, machine]);

  // DEBUG: Detectar qué dependencia está cambiando
  const prevDeps = useRef({
    form,
    wizardSteps,
    forceUpdate,
    isLoading,
    isLoadingMachineData,
    error,
    photoFile,
    existingPhotoUrl,
    shouldRemovePhoto,
    machine,
    machineTypeList,
    machineTypesLoading,
    machineTypesError,
    handleWizardSubmit,
    handleCancel,
    reset,
  });

  useEffect(() => {
    const prev = prevDeps.current;
    const current = {
      form,
      wizardSteps,
      forceUpdate,
      isLoading,
      isLoadingMachineData,
      error,
      photoFile,
      existingPhotoUrl,
      shouldRemovePhoto,
      machine,
      machineTypeList,
      machineTypesLoading,
      machineTypesError,
      handleWizardSubmit,
      handleCancel,
      reset,
    };

    prevDeps.current = current;
  });

  // Memoizar el objeto retornado para evitar re-renders innecesarios del contexto
  return useMemo(() => ({
    // Form state
    form,
    
    // Wizard state
    wizardSteps,
    forceUpdate,
    
    // UI State
    isLoading,
    isLoadingMachineData,
    error,
    
    // Photo file management
    photoFile,
    setPhotoFile,
    existingPhotoUrl,
    shouldRemovePhoto,
    setShouldRemovePhoto,
    
    // Machine data
    machine,
    
    // Machine types from hook
    machineTypeList,
    machineTypesLoading,
    machineTypesError,
    refetchMachineTypes,
    
    // Actions
    handleWizardSubmit,
    handleCancel,
    reset,
  }), [
    form,
    wizardSteps,
    forceUpdate,
    isLoading,
    isLoadingMachineData,
    error,
    photoFile,
    existingPhotoUrl,
    shouldRemovePhoto,
    machine,
    machineTypeList,
    machineTypesLoading,
    machineTypesError,
    handleWizardSubmit,
    handleCancel,
    reset,
    // Nota: setPhotoFile, setShouldRemovePhoto, refetchMachineTypes son funciones
    // estables que no cambian, no necesitan estar en dependencias
  ]);
}

/**
 * Mapea los datos de la máquina (API response) al formato del wizard
 * 
 * @param machine - Datos de la máquina desde API
 * @returns Datos en formato MachineRegistrationData
 */
function mapMachineToWizardData(machine: CreateMachineResponse): MachineRegistrationData {
  return {
    basicInfo: {
      serialNumber: machine.serialNumber,
      brand: machine.brand,
      modelName: machine.modelName,
      machineTypeId: machine.machineTypeId,
      name: machine.nickname || `${machine.brand} ${machine.modelName}`,
      description: '', // Not stored in backend currently
      nickname: machine.nickname || '',
      ownerId: machine.ownerId,
      createdById: machine.createdById,
    },
    technicalSpecs: {
      year: machine.specs?.year || new Date().getFullYear(),
      operatingHours: machine.specs?.operatingHours || 0,
      fuelType: machine.specs?.fuelType as any,
      attachments: [], // TODO: Implement when backend supports
      specialFeatures: [], // TODO: Implement when backend supports
      currentLocation: machine.location?.siteName || '',
      isActive: machine.status === 'ACTIVE',
      assignedTo: machine.assignedTo || '',
      usageSchedule: machine.usageSchedule ? {
        dailyHours: machine.usageSchedule.dailyHours,
        operatingDays: [...machine.usageSchedule.operatingDays], // Clone array
      } : undefined,
      machinePhotoUrl: machine.machinePhotoUrl || '',
    },
    addPhotoLater: false, // Reset for edit mode
  };
}

/**
 * Mapea los datos del wizard UI a formato de actualización
 * 
 * @param wizardData - Datos del wizard
 * @returns Datos en formato UpdateMachineRequest
 */
function mapWizardDataToUpdateRequest(wizardData: MachineRegistrationData): UpdateMachineRequest {
  return {
    // Basic info
    brand: wizardData.basicInfo.brand,
    modelName: wizardData.basicInfo.modelName,
    nickname: wizardData.basicInfo.name,
    
    // Assignment
    assignedTo: wizardData.technicalSpecs.assignedTo,
    
    // Photo URL
    machinePhotoUrl: wizardData.technicalSpecs.machinePhotoUrl || '',
    
    // Specs (nested partial update)
    specs: {
      year: wizardData.technicalSpecs.year,
      operatingHours: wizardData.technicalSpecs.operatingHours,
      fuelType: wizardData.technicalSpecs.fuelType as any,
    },
    
    // Location (nested partial update) - NO incluir lastUpdated (lo maneja el backend)
    location: wizardData.technicalSpecs.currentLocation ? {
      siteName: wizardData.technicalSpecs.currentLocation,
    } : undefined,
    
    // Usage schedule
    usageSchedule: wizardData.technicalSpecs.usageSchedule,
  };
}
