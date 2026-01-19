import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui';
import { UserProfileEditData } from '../../../types/user.types';

/**
 * Paso 3: Confirmación y resumen de la información del perfil
 * Componente de solo lectura que muestra un resumen de todos los cambios antes de guardar
 */
export function ProfileConfirmationStep() {
  const { 
    control, 
    formState: { errors }
  } = useFormContext<UserProfileEditData>();
  
  const { t } = useTranslation();
  
  // Watch all form values for real-time updates
  const data = useWatch({ control });
  const { basicInfo, bioAndTags } = data;

  // Helper para mostrar valores con fallback
  const displayValue = (value: any, fallback?: string) => {
    return value ?? (fallback || t('common.notSpecified'));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t('profile.edit.confirmation.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('profile.edit.confirmation.subtitle')}
        </p>
      </div>

      {/* Información básica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-info/10 rounded-full flex items-center justify-center">
              <span className="text-info font-semibold">1</span>
            </div>
            <span>{t('profile.edit.steps.basicInfo.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('profile.edit.fields.companyName')}
              </dt>
              <dd className="text-sm text-foreground">
                {displayValue(basicInfo?.companyName)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('profile.edit.fields.phone')}
              </dt>
              <dd className="text-sm text-foreground">
                {displayValue(basicInfo?.phone)}
              </dd>
            </div>
            {basicInfo?.address && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">
                  {t('profile.edit.fields.address')}
                </dt>
                <dd className="text-sm text-foreground">{basicInfo.address}</dd>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bio y Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
              <span className="text-success font-semibold">2</span>
            </div>
            <span>{t('profile.edit.steps.bioAndTags.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bioAndTags?.bio && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('profile.edit.fields.bio')}
              </dt>
              <dd className="text-sm text-foreground whitespace-pre-wrap">{bioAndTags.bio}</dd>
            </div>
          )}
          {bioAndTags?.tags && bioAndTags.tags.length > 0 && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('profile.edit.fields.tags')}
              </dt>
              <dd className="text-sm text-foreground">
                <div className="flex flex-wrap gap-2 mt-1">
                  {bioAndTags.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </dd>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Errores globales */}
      {errors && Object.keys(errors).length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
          <h4 className="text-destructive font-medium mb-2">
            {t('profile.edit.confirmation.errorsFound')}
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field} className="text-destructive text-sm">
                {field}: {error?.message || t('common.validationError')}
              </li>
            ))}
          </ul>
          <p className="text-destructive text-sm mt-2">
            {t('profile.edit.confirmation.goBackToFix')}
          </p>
        </div>
      )}

      {/* Mensaje final */}
      <div className="bg-info/10 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-info" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-info">
              {t('profile.edit.confirmation.infoMessage')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
