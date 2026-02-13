import React from 'react';
import { BasicInfoStep } from '../../machine-registration/steps/BasicInfoStep';

/**
 * BasicInfoStepEdit - Wrapper for BasicInfoStep in edit mode
 * 
 * This wrapper passes isEditMode=true to BasicInfoStep to disable
 * immutable fields (serialNumber remains immutable; machineTypeName is editable)
 */
export function BasicInfoStepEdit(props: any) {
  return <BasicInfoStep {...props} isEditMode={true} />;
}
