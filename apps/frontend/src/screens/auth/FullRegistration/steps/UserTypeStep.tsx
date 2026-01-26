import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, BodyText, Heading3 } from '@components/ui';
import { Users, Briefcase } from 'lucide-react';
import { cn } from '@utils/cn';
import type { CompleteRegistrationData } from '../../../../types/registration.types';

/**
 * UserTypeStep - Step 2 of Complete Registration Wizard
 * Sprint #14 Task 2.1b
 * 
 * User type selection (CLIENT vs PROVIDER):
 * - CLIENT: Usuario de maquinaria que solicita servicios
 * - PROVIDER: Usuario que ofrece servicios a usuarios de maquinaria
 * 
 * Features:
 * - Visual cards with icons
 * - Active state highlighting
 * - Helpful descriptions
 * - Conditional requirements hint (PROVIDER needs company name)
 */
export const UserTypeStep: React.FC = () => {
  const { t } = useTranslation();
  const { control, watch, formState: { errors } } = useFormContext<CompleteRegistrationData>();
  
  const selectedType = watch('type');

  return (
    <div className="space-y-6">

      {/* User Type Selection */}
      <Controller
        name="type"
        control={control}
        rules={{
          required: t('validation.required')
        }}
        render={({ field }) => (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CLIENT Card */}
              <Card
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-lg',
                  'border-2',
                  selectedType === 'CLIENT' 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                )}
                onClick={() => field.onChange('CLIENT')}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Icon */}
                    <div className={cn(
                      'p-4 rounded-full',
                      selectedType === 'CLIENT' 
                        ? 'bg-primary/10' 
                        : 'bg-muted'
                    )}>
                      <Users className={cn(
                        'h-10 w-10',
                        selectedType === 'CLIENT' 
                          ? 'text-primary' 
                          : 'text-muted-foreground'
                      )} />
                    </div>

                    {/* Title */}
                    <Heading3>{t('auth.register.clientType')}</Heading3>

                    {/* Description */}
                    <BodyText size="small" className="text-muted-foreground">
                      {t('auth.register.clientTypeDescExtended')}
                    </BodyText>

                    {/* Features for this type */}
                    <ul className="text-left text-sm text-muted-foreground space-y-1">
                      <li>✓ {t('auth.register.clientFeature1')}</li>
                      <li>✓ {t('auth.register.clientFeature2')}</li>
                      <li>✓ {t('auth.register.clientFeature3')}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* PROVIDER Card */}
              <Card
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-lg',
                  'border-2',
                  selectedType === 'PROVIDER' 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                )}
                onClick={() => field.onChange('PROVIDER')}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Icon */}
                    <div className={cn(
                      'p-4 rounded-full',
                      selectedType === 'PROVIDER' 
                        ? 'bg-primary/10' 
                        : 'bg-muted'
                    )}>
                      <Briefcase className={cn(
                        'h-10 w-10',
                        selectedType === 'PROVIDER' 
                          ? 'text-primary' 
                          : 'text-muted-foreground'
                      )} />
                    </div>

                    {/* Title */}
                    <Heading3>{t('auth.register.providerType')}</Heading3>

                    {/* Description */}
                    <BodyText size="small" className="text-muted-foreground">
                      {t('auth.register.providerTypeDescExtended')}
                    </BodyText>

                    {/* Features for this type */}
                    <ul className="text-left text-sm text-muted-foreground space-y-1">
                      <li>✓ {t('auth.register.providerFeature1')}</li>
                      <li>✓ {t('auth.register.providerFeature2')}</li>
                      <li>✓ {t('auth.register.providerFeature3')}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Error message */}
            {errors.type && (
              <p className="text-sm text-destructive text-center">{errors.type.message}</p>
            )}
          </div>
        )}
      />
    </div>
  );
};
