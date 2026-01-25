import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardContent, BodyText, Heading3, Badge } from '@components/ui';
import { Mail, User, Building, Phone, MapPin, FileText, Tag, Globe, Bell, Users, Briefcase } from 'lucide-react';
import type { CompleteRegistrationData } from '../../../../types/registration.types';

/**
 * ConfirmationStep - Step 6 (Final) of Complete Registration Wizard
 * Sprint #14 Task 2.1b
 * 
 * Review all entered information before final submission.
 * Displays organized summary of all data from previous steps.
 * 
 * Features:
 * - Organized by sections
 * - Only shows non-empty optional fields
 * - Visual indicators with icons
 * - Terms & conditions agreement reminder
 */
export const ConfirmationStep: React.FC = () => {
  const { t } = useTranslation();
  const { getValues } = useFormContext<CompleteRegistrationData>();
  const data = getValues();

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">
          {t('auth.register.wizard.confirmation.title')}
        </h2>
        <BodyText className="text-muted-foreground mt-2">
          {t('auth.register.wizard.confirmation.description')}
        </BodyText>
      </div>

      {/* Data review sections */}
      <div className="space-y-4">
        {/* Credentials Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <Heading3>{t('auth.register.wizard.credentials.title')}</Heading3>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">{t('auth.email')}</dt>
                <dd className="font-medium">{data.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">{t('auth.password')}</dt>
                <dd className="font-medium">••••••••</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* User Type Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {data.type === 'CLIENT' ? (
                <Users className="h-5 w-5 text-primary" />
              ) : (
                <Briefcase className="h-5 w-5 text-primary" />
              )}
              <Heading3>{t('auth.register.wizard.userType.title')}</Heading3>
            </div>
          </CardHeader>
          <CardContent>
            <Badge variant={data.type === 'CLIENT' ? 'default' : 'secondary'} className="text-base px-4 py-2">
              {data.type === 'CLIENT' ? (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  {t('auth.register.clientType')}
                </>
              ) : (
                <>
                  <Briefcase className="h-4 w-4 mr-2" />
                  {t('auth.register.providerType')}
                </>
              )}
            </Badge>
          </CardContent>
        </Card>

        {/* Professional Info Section */}
        {(data.professionalInfo?.companyName || data.professionalInfo?.phone || data.professionalInfo?.address) && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                <Heading3>{t('auth.register.wizard.professionalInfo.title')}</Heading3>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                {data.professionalInfo.companyName && (
                  <div className="flex items-start gap-3">
                    <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <dt className="text-sm text-muted-foreground">{t('profile.edit.fields.companyName')}</dt>
                      <dd className="font-medium">{data.professionalInfo.companyName}</dd>
                    </div>
                  </div>
                )}
                {data.professionalInfo.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <dt className="text-sm text-muted-foreground">{t('profile.edit.fields.phone')}</dt>
                      <dd className="font-medium">{data.professionalInfo.phone}</dd>
                    </div>
                  </div>
                )}
                {data.professionalInfo.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <dt className="text-sm text-muted-foreground">{t('profile.edit.fields.address')}</dt>
                      <dd className="font-medium">{data.professionalInfo.address}</dd>
                    </div>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Profile Completion Section (if provided) */}
        {(data.profileCompletion?.bio || (data.profileCompletion?.tags && data.profileCompletion.tags.length > 0)) && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <Heading3>{t('auth.register.wizard.profileCompletion.title')}</Heading3>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                {data.profileCompletion.bio && (
                  <div>
                    <dt className="text-sm text-muted-foreground mb-1">{t('profile.edit.fields.bio')}</dt>
                    <dd className="text-sm leading-relaxed">{data.profileCompletion.bio}</dd>
                  </div>
                )}
                {data.profileCompletion.tags && data.profileCompletion.tags.length > 0 && (
                  <div>
                    <dt className="text-sm text-muted-foreground mb-2">{t('profile.edit.fields.tags')}</dt>
                    <dd className="flex gap-2 flex-wrap">
                      {data.profileCompletion.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="gap-1">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Preferences Section (if provided) */}
        {data.preferences && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <Heading3>{t('auth.register.wizard.preferences.title')}</Heading3>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                {data.preferences.language && (
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {t('auth.register.wizard.preferences.language')}
                    </dt>
                    <dd className="font-medium">
                      {data.preferences.language === 'es' ? '🇪🇸 Español' : '🇺🇸 English'}
                    </dd>
                  </div>
                )}
                {data.preferences.notifications && (
                  <div>
                    <dt className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                      <Bell className="h-4 w-4" />
                      {t('auth.register.wizard.preferences.notifications')}
                    </dt>
                    <dd className="space-y-1 ml-6">
                      {data.preferences.notifications.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="success" className="h-5 w-5 p-0 flex items-center justify-center">✓</Badge>
                          {t('settings.notifications.email')}
                        </div>
                      )}
                      {data.preferences.notifications.maintenanceAlerts && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="success" className="h-5 w-5 p-0 flex items-center justify-center">✓</Badge>
                          {t('settings.notifications.maintenanceAlerts')}
                        </div>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
        </Card>
        )}
      </div>

      {/* Terms & Conditions */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <BodyText size="small" className="text-center">
            {t('auth.register.wizard.confirmation.termsAgreement')}
          </BodyText>
        </CardContent>
      </Card>

      {/* Final action hint */}
      <div className="text-center">
        <BodyText size="small" className="text-muted-foreground">
          {t('auth.register.wizard.confirmation.finalActionHint')}
        </BodyText>
      </div>
    </div>
  );
};

// TODO: Strategic features for confirmation step
// - Edit buttons per section to jump back to specific step
// - PDF export of registration data for user records
// - Email verification preview
// - Estimated profile completion percentage
// - "What happens next?" onboarding preview
