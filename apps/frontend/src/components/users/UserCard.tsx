import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { UserPublicProfile } from '@packages/contracts';
import { Card, BodyText, Badge, Button } from '@components/ui';
import { Building2, Shield, UserPlus, ArrowRight, CheckCircle } from 'lucide-react';
import { ROUTES } from '@constants';

interface UserCardProps {
  user: UserPublicProfile;
  /**
   * Optional className for custom styling
   */
  className?: string;
  
  /**
   * Callback when user clicks "Add Contact" button
   * Module 1: Logs to console (placeholder)
   * Module 2: Will trigger addContactMutation
   */
  onAddContact?: (userId: string) => void;
  
  /**
   * Module 2: Flag indicating user is already a contact
   * When true, button shows "Ya es contacto" and is disabled
   */
  isContact?: boolean;
  
  /**
   * Module 2: Flag indicating add contact mutation is in progress
   * When true, button shows "Agregando..." and is disabled
   */
  isAddingContact?: boolean;
  
  // POST-MVP: Optional callbacks for future interaction (Module 3+)
  // onClick?: (user: UserPublicProfile) => void; // View full profile modal
  // onViewMachines?: (userId: string) => void; // View user's machines (clients)
  // onMessage?: (userId: string) => void; // Send direct message (Module 3: Messaging)
}

/**
 * UserCard Component
 * 
 * Displays user public profile in minimalist card format for discovery.
 * Shows: company name, user type badge, verification status (providers).
 * 
 * Sprint #12 - Module 1: User Communication System (User Discovery)
 * MVP: Read-only display (no interaction buttons - those go in Module 2)
 * 
 * Design:
 * - Minimalist layout with clear visual hierarchy
 * - Type badge (CLIENT | PROVIDER) with appropriate colors
 * - Verified badge for providers (shield icon)
 * - Service areas for providers (max 3 visible with overflow indicator)
 * - Building icon for company identity
 * 
 * @example
 * ```tsx
 * <UserCard user={user} />
 * 
 * // With custom styling
 * <UserCard user={user} className="hover:shadow-lg" />
 * ```
 */
export const UserCard: React.FC<UserCardProps> = ({
  user,
  className = '',
  onAddContact,
  isContact = false,
  isAddingContact = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Type badge colors
  const typeBadgeVariant = user.type === 'CLIENT' ? 'success' : 'warning';

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


      {/* Tags Section - Show for all users if present (Sprint #13 Task 10.2) */}
      {user.profile.tags && user.profile.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {user.profile.tags.map((tag, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              size="sm"
              className="text-xs"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
      {/* Bio Section - Show for all users if present (Sprint #13 Task 10.2) */}
      {user.profile.bio && (
        <div className="mt-3 pt-3 border-t">
          <BodyText size="small" className="text-muted-foreground line-clamp-2">
            {user.profile.bio}
          </BodyText>
        </div>
      )}

      {/* Interaction Section (Module 2: Contact Management) */}
      {onAddContact && (
        <div className="mt-4 pt-3 border-t">
          <div className="flex gap-2 justify-center">
            {/* Primary Button: Add Contact / Already Contact */}
            <Button 
              size="sm"
              variant={isContact ? "ghost" : "outline"}
              onPress={() => onAddContact(user.id)}
              disabled={isContact || isAddingContact}
              className={isContact ? "text-success disabled:opacity-100" : "flex-1"}
            >
              {isContact ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {isAddingContact 
                ? t('users.discovery.addingContact')
                : isContact
                  ? t('users.discovery.alreadyContact')
                  : t('users.discovery.addContact')
              }
            </Button>
            
            {/* Secondary Button: Navigate to My Contacts (only when already contact) */}
            {isContact && (
              <Button
                size="sm"
                variant="outline"
                onPress={() => navigate(ROUTES.MY_CONTACTS)}
              >
                <span className="whitespace-nowrap">
                  {t('users.discovery.viewInContacts')}
                </span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* TODO Module 3+: Additional interaction buttons */}
      {/* <Button onClick={() => onMessage?.(user.id)}>Send Message</Button> */}
      {/* <Button onClick={() => onClick?.(user)}>View Profile</Button> */}
      
      {/* TODO: Bio Expansion Feature (Strategic Enhancement)
       * When bio is longer than 2 lines (line-clamp-2), add "Read more" button
       * Opens full profile modal with complete bio, all tags, service areas, etc.
       * 
       * @example
       * {user.profile.bio && isBioTruncated && (
       *   <Button 
       *     size="sm" 
       *     variant="ghost" 
       *     onClick={() => onViewFullProfile?.(user)}
       *     className="mt-1"
       *   >
       *     {t('users.discovery.readMore')}
       *   </Button>
       * )}
       */}
      
      {/* TODO: Quick Actions Menu (Optional Enhancement)
       * Add dropdown menu with additional actions for contacts:
       * - Send Message (Module 3)
       * - View Full Profile
       * - Add Note
       * - Mark as Favorite
       * - Share Contact Info
       * 
       * @example
       * {isContact && (
       *   <DropdownMenu>
       *     <DropdownMenuTrigger asChild>
       *       <Button size="sm" variant="ghost">
       *         <MoreVertical className="w-4 h-4" />
       *       </Button>
       *     </DropdownMenuTrigger>
       *     <DropdownMenuContent>
       *       <DropdownMenuItem onClick={() => onMessage?.(user.id)}>
       *         <MessageCircle className="w-4 h-4 mr-2" />
       *         Send Message
       *       </DropdownMenuItem>
       *       <DropdownMenuItem onClick={() => onAddNote?.(user.id)}>
       *         <FileText className="w-4 h-4 mr-2" />
       *         Add Note
       *       </DropdownMenuItem>
       *     </DropdownMenuContent>
       *   </DropdownMenu>
       * )}
       */}
    </Card>
  );
};

// =============================================================================
// FUTURE ENHANCEMENTS (Strategic, commented for post-MVP)
// =============================================================================

/**
 * TODO: UserCardSkeleton for loading states
 * Shimmer effect while users are being fetched
 * 
 * @example
 * {isLoading && <UserCardSkeleton count={6} />}
 */
// export const UserCardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
//   return (
//     <>
//       {Array.from({ length: count }).map((_, i) => (
//         <Card key={i} className="p-4 animate-pulse">
//           <div className="h-5 bg-muted rounded w-3/4 mb-3" />
//           <div className="h-4 bg-muted rounded w-1/2" />
//         </Card>
//       ))}
//     </>
//   );
// };

/**
 * TODO: UserCardExpanded with detailed modal
 * Show full profile with stats, rating, contact info when clicked
 * 
 * @example
 * <UserCardExpanded user={user} onClose={handleClose} />
 */
// interface UserCardExpandedProps {
//   user: UserPublicProfile;
//   stats?: { machineCount: number; rating: number }; // From useUserStats hook
//   onClose: () => void;
//   onAddContact: (userId: string) => void;
// }
