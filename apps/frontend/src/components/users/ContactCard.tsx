import React from 'react';
import { useTranslation } from 'react-i18next';
import type { UserPublicProfile } from '@packages/contracts';
import { Card, BodyText, Badge, Button } from '@components/ui';
import { Building2, Shield, MessageCircle, Trash2 } from 'lucide-react';

interface ContactCardProps {
  /**
   * Contact user profile
   */
  user: UserPublicProfile;
  
  /**
   * Optional className for custom styling
   */
  className?: string;
  
  /**
   * Callback when user clicks "Send Message" button
   * Module 2: Placeholder (disabled with tooltip)
   * Module 3: Will trigger message creation/navigation
   */
  onSendMessage?: (userId: string) => void;
  
  /**
   * Callback when user clicks "Remove Contact" button
   * Opens confirmation modal
   */
  onRemove: (userId: string) => void;
  
  // POST-MVP: Optional callbacks for future interaction
  // onClick?: (user: UserPublicProfile) => void; // View full profile modal
  // onViewMachines?: (userId: string) => void; // View user's machines
}

/**
 * ContactCard Component
 * 
 * Displays contact profile with action buttons for management.
 * Part of Sprint #12 - Module 2: User Communication System (Contact Management).
 * 
 * Differences from UserCard:
 * - Shows "Send Message" button (placeholder for Module 3)
 * - Shows "Remove Contact" button (destructive action)
 * - No "Add Contact" button (user is already a contact)
 * - Used in MyContactsScreen (not discovery)
 * 
 * Design:
 * - Reuses UserCard layout/style for consistency
 * - Action buttons in footer (Send Message + Remove)
 * - Remove button is ghost variant (less prominent)
 * - Send Message disabled with tooltip "Coming Soon"
 * 
 * @example
 * ```tsx
 * <ContactCard
 *   user={contact}
 *   onSendMessage={(userId) => console.log('Message:', userId)}
 *   onRemove={(userId) => setSelectedContact(userId)}
 * />
 * 
 * // In MyContactsScreen
 * {contacts.map(contact => (
 *   <ContactCard
 *     key={contact.id}
 *     user={contact}
 *     onSendMessage={vm.actions.handleSendMessage}
 *     onRemove={vm.actions.handleRemoveContact}
 *   />
 * ))}
 * ```
 */
export const ContactCard: React.FC<ContactCardProps> = ({
  user,
  className = '',
  onSendMessage,
  onRemove,
}) => {
  const { t } = useTranslation();

  // Type badge colors (same as UserCard)
  const typeBadgeVariant = user.type === 'CLIENT' ? 'secondary' : 'success';

  // Service areas display (max 3 visible)
  const visibleServiceAreas = user.serviceAreas?.slice(0, 3) || [];
  const hasMoreServiceAreas = (user.serviceAreas?.length || 0) > 3;
  const remainingCount = (user.serviceAreas?.length || 0) - 3;

  return (
    <Card 
      className={`
        p-4 hover:shadow-md transition-shadow cursor-default
        ${className}
      `}
    >
      {/* Header: Company Name + Type Badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Building2 className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <BodyText weight="medium" className="text-foreground truncate">
            {user.profile.companyName || t('users.discovery.noCompanyName')}
          </BodyText>
        </div>
        
        <Badge 
          variant={typeBadgeVariant} 
          size="sm"
        >
          {t(`users.type.${user.type.toLowerCase()}`)}
        </Badge>
      </div>

      {/* Provider-specific information */}
      {user.type === 'PROVIDER' && (
        <div className="space-y-2">
          {/* Verification Badge */}
          {user.isVerified && (
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-success" />
              <BodyText size="small" className="text-success">
                {t('users.discovery.verifiedProvider')}
              </BodyText>
            </div>
          )}

          {/* Service Areas */}
          {visibleServiceAreas.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {visibleServiceAreas.map((area, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  size="sm"
                >
                  {area}
                </Badge>
              ))}
              
              {hasMoreServiceAreas && (
                <Badge 
                  variant="outline" 
                  size="sm"
                  className="text-muted-foreground"
                >
                  {t('users.discovery.moreServiceAreas', { count: remainingCount })}
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons Section (Module 2: Contact Management) */}
      <div className="mt-4 pt-3 border-t flex gap-2">
        {/* Send Message Button (Placeholder for Module 3) */}
        {onSendMessage && (
          <Button
            size="sm"
            variant="outline"
            onPress={() => onSendMessage(user.id)}
            disabled={true} // TODO Module 3: Enable when messaging implemented
            className="flex-1"
            title={t('users.contacts.messagingComingSoon')}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {t('users.contacts.sendMessage')}
          </Button>
        )}
        
        {/* Remove Contact Button */}
        <Button
          size="sm"
          variant="ghost"
          onPress={() => onRemove(user.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {t('users.contacts.removeContact')}
        </Button>
      </div>
    </Card>
  );
};

// =============================================================================
// FUTURE ENHANCEMENTS (Strategic, commented for post-MVP)
// =============================================================================

/**
 * TODO: ContactCardSkeleton for loading states
 * 
 * @example
 * {isLoading && <ContactCardSkeleton count={3} />}
 */
// export const ContactCardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
//   return (
//     <>
//       {Array.from({ length: count }).map((_, i) => (
//         <Card key={i} className="p-4 animate-pulse">
//           <div className="h-5 bg-muted rounded w-3/4 mb-3" />
//           <div className="h-4 bg-muted rounded w-1/2 mb-3" />
//           <div className="flex gap-2 pt-3 border-t">
//             <div className="h-8 bg-muted rounded flex-1" />
//             <div className="h-8 bg-muted rounded w-32" />
//           </div>
//         </Card>
//       ))}
//     </>
//   );
// };

/**
 * TODO: Add contact metadata badges (last message date, interaction count)
 * Útil para mostrar contexto de interacción
 * 
 * @example
 * <Badge variant="outline" size="sm">
 *   Último mensaje: hace 2 días
 * </Badge>
 * <Badge variant="outline" size="sm">
 *   {messageCount} mensajes intercambiados
 * </Badge>
 */

/**
 * TODO: Add "View Profile" button to see full details
 * Opens modal with complete public profile + stats
 * 
 * @example
 * <Button variant="ghost" size="sm" onClick={() => onViewProfile(user)}>
 *   <Eye className="w-4 h-4 mr-2" />
 *   Ver perfil
 * </Button>
 */

/**
 * TODO: Add context menu (right-click) with more actions
 * Archive, Block, Favorite, Export, etc.
 * 
 * @example
 * <ContextMenu>
 *   <ContextMenuItem onSelect={() => onArchive(user.id)}>
 *     Archivar contacto
 *   </ContextMenuItem>
 *   <ContextMenuItem onSelect={() => onFavorite(user.id)}>
 *     Marcar como favorito
 *   </ContextMenuItem>
 * </ContextMenu>
 */
