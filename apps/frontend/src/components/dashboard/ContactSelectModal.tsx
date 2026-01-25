import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Card, CardContent, BodyText, Badge, Skeleton, Button } from '@components/ui';
import { Search, User, Users } from 'lucide-react';
import { cn } from '@utils/cn';

/**
 * ContactSelectModal - Modal de selección de contacto
 * 
 * Presenta una lista de contactos del usuario para seleccionar uno
 * antes de navegar al chat correspondiente.
 * 
 * Sprint #14 Task 2.1c: QuickActions System
 * 
 * Features:
 * - Grid responsivo (1 col mobile, 2 cols desktop)
 * - Cards con avatar placeholder, nombre empresa, tipo de usuario
 * - Búsqueda opcional (si hay > 5 contactos)
 * - Empty state con CTA a descubrimiento
 * - Loading state con skeletons
 * - Hover states en cards
 * 
 * @example
 * ```tsx
 * <ContactSelectModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   contacts={contacts}
 *   onSelectContact={(userId) => navigate(`/messages/${userId}`)}
 * />
 * ```
 */

interface UserPublicProfile {
  id: string;
  profile: {
    companyName?: string;
    email: string;
  };
  type: 'CLIENT' | 'PROVIDER';
}

interface ContactSelectModalProps {
  /**
   * Estado de apertura del modal
   */
  open: boolean;
  
  /**
   * Callback para cambiar el estado del modal
   */
  onOpenChange: (open: boolean) => void;
  
  /**
   * Lista de contactos disponibles
   */
  contacts: UserPublicProfile[];
  
  /**
   * Callback ejecutado cuando el usuario selecciona un contacto
   */
  onSelectContact: (userId: string) => void;
  
  /**
   * Estado de carga (opcional)
   */
  isLoading?: boolean;
}

export const ContactSelectModal: React.FC<ContactSelectModalProps> = ({
  open,
  onOpenChange,
  contacts,
  onSelectContact,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar contactos por búsqueda
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    
    const query = searchQuery.toLowerCase();
    return contacts.filter(contact => 
      contact.profile.companyName?.toLowerCase().includes(query) ||
      contact.profile.email?.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

  // Determinar si mostrar búsqueda (si hay más de 5 contactos)
  const showSearch = contacts.length > 5;

  /**
   * Handler para selección de contacto
   */
  const handleContactClick = (userId: string) => {
    onSelectContact(userId);
    onOpenChange(false);
    setSearchQuery(''); // Reset search on close
  };

  /**
   * Generar avatar placeholder con primera letra del nombre
   */
  const getAvatarLetter = (contact: UserPublicProfile): string => {
    const name = contact.profile.companyName || contact.profile.email;
    return name.charAt(0).toUpperCase();
  };

  /**
   * Obtener color de fondo para el avatar según el tipo
   */
  const getAvatarBgColor = (type: string): string => {
    return type === 'PROVIDER' 
      ? 'bg-blue-500 text-white' 
      : 'bg-green-500 text-white';
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('quickActions.selectContact')}
      description={t('quickActions.selectContactDesc')}
    >
      <div className="flex flex-col gap-4">
        {/* Búsqueda (solo si hay > 5 contactos) */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State - Sin contactos */}
        {!isLoading && contacts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <BodyText weight="bold" className="mb-2">
              {t('quickActions.noContacts')}
            </BodyText>
            <BodyText size="small" className="text-muted-foreground mb-4">
              {t('quickActions.noContactsDesc')}
            </BodyText>
            <Button
              variant="filled"
              size="sm"
              onPress={() => {
                onOpenChange(false);
                // Strategic future: navigate to discovery
                // navigate(ROUTES.CONTACT_DISCOVERY);
              }}
            >
              {t('quickActions.discoverUsers')}
            </Button>
          </div>
        )}

        {/* Empty State - Sin resultados de búsqueda */}
        {!isLoading && contacts.length > 0 && filteredContacts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <BodyText weight="bold" className="mb-2">
              {t('common.noResults')}
            </BodyText>
            <BodyText size="small" className="text-muted-foreground">
              {t('common.tryDifferentSearch')}
            </BodyText>
          </div>
        )}

        {/* Lista de contactos */}
        {!isLoading && filteredContacts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
            {filteredContacts.map((contact) => (
              <Card
                key={contact.id}
                className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                onClick={() => handleContactClick(contact.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar placeholder con letra */}
                    <div 
                      className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center text-lg font-semibold",
                        getAvatarBgColor(contact.type)
                      )}
                    >
                      {getAvatarLetter(contact)}
                    </div>

                    {/* Información del contacto */}
                    <div className="flex-1 min-w-0">
                      <BodyText weight="bold" className="line-clamp-1">
                        {contact.profile.companyName || t('profile.noCompanyName')}
                      </BodyText>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={contact.type === 'PROVIDER' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {contact.type === 'PROVIDER' ? t('users.type.provider') : t('users.type.client')}
                        </Badge>
                      </div>

                      {/* Email como información secundaria */}
                      <BodyText size="small" className="text-muted-foreground line-clamp-1 mt-1">
                        {contact.profile.email}
                      </BodyText>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Strategic future: Filtros por tipo de usuario
      <div className="mt-4 pt-4 border-t border-border">
        <BodyText size="small" className="text-muted-foreground mb-2">
          {t('common.filter')}
        </BodyText>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">All</Button>
          <Button variant="outline" size="sm">Clients</Button>
          <Button variant="outline" size="sm">Providers</Button>
        </div>
      </div>
      */}

      {/* Strategic future: Contactos recientes
      <div className="mt-4 pt-4 border-t border-border">
        <BodyText size="small" className="text-muted-foreground mb-2">
          {t('quickActions.recentContacts')}
        </BodyText>
        <div className="flex gap-2 flex-wrap">
          {recentContacts.map(contact => (
            <Badge key={contact.id} variant="outline" className="cursor-pointer">
              {contact.name}
            </Badge>
          ))}
        </div>
      </div>
      */}
    </Modal>
  );
};
