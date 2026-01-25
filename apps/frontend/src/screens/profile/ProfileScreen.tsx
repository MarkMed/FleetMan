import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/AuthProvider';
import { Heading1, Heading2, BodyText, Button, Card, Badge, Skeleton } from '@components/ui';
import { User, Mail, Phone, Calendar, Shield, Edit, Building2, MapPin, Tag } from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // Loading state
  if (isLoading || !user) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Heading1 size="headline" className="tracking-tight text-foreground">
            {t('profile.title')}
          </Heading1>
          <BodyText className="text-muted-foreground">
            {t('profile.subtitle')}
          </BodyText>
        </div>
        <Button variant="filled" size="default" onPress={handleEditProfile}>
          <Edit className="w-4 h-4 mr-2" />
          {t('profile.editProfile')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <div className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-12 h-12 text-primary" />
              </div>
              <div>
                <Heading2 size="large" weight="bold" className="text-foreground">
                  {user.profile?.companyName || t('profile.noCompanyName')}
                </Heading2>
                <BodyText size="small" className="text-muted-foreground">
                  {user.type === 'CLIENT' ? t('profile.client') : t('profile.provider')}
                </BodyText>
              </div>
              <div className="w-full pt-4 border-t border-border space-y-2">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <BodyText size="small">{t('profile.activeAccount')}</BodyText>
                </div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <BodyText size="small">
                    {t('profile.memberSince')} {new Date(user.createdAt).toLocaleDateString('es-ES', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </BodyText>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Information Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <div className="p-6">
              <Heading2 size="large" weight="bold" className="mb-4">
                {t('profile.contactInformation')}
              </Heading2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <BodyText size="small" className="text-muted-foreground">
                      {t('auth.email')}
                    </BodyText>
                    <BodyText weight="medium" className="text-foreground">
                      {user.email}
                    </BodyText>
                  </div>
                </div>
                
                {user.profile?.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <BodyText size="small" className="text-muted-foreground">
                        {t('profile.phone')}
                      </BodyText>
                      <BodyText weight="medium" className="text-foreground">
                        {user.profile.phone}
                      </BodyText>
                    </div>
                  </div>
                )}

                {user.profile?.companyName && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <BodyText size="small" className="text-muted-foreground">
                        {t('profile.company')}
                      </BodyText>
                      <BodyText weight="medium" className="text-foreground">
                        {user.profile.companyName}
                      </BodyText>
                    </div>
                  </div>
                )}

                {user.profile?.address && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <BodyText size="small" className="text-muted-foreground">
                        {t('profile.address')}
                      </BodyText>
                      <BodyText weight="medium" className="text-foreground">
                        {user.profile.address}
                      </BodyText>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Bio Section - NEW Sprint #13 */}
          {user.profile?.bio && (
            <Card>
              <div className="p-6">
                <Heading2 size="large" weight="bold" className="mb-3">
                  {t('profile.bio')}
                </Heading2>
                <BodyText className="text-foreground whitespace-pre-wrap">
                  {user.profile.bio}
                </BodyText>
              </div>
            </Card>
          )}

          {/* Tags Section - NEW Sprint #13 */}
          {user.profile?.tags && user.profile.tags.length > 0 && (
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-5 h-5 text-primary" />
                  <Heading2 size="large" weight="bold">
                    {t('profile.tags')}
                  </Heading2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.profile.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
