import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, BodyText, Button } from '@components/ui';
import { ChevronRight, MoreVertical } from 'lucide-react';
import { formatDateShort } from '@utils';

/**
 * Type for spare part entity
 */
interface SparePart {
  id: string;
  name: string;
  serialId: string;
  amount: number;
  machineId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface SparePartCardProps {
  sparePart: SparePart;
  /**
   * Callback when "Ver" button is clicked
   */
  onView: (sparePart: SparePart) => void;
  /**
   * Callback when "Options" button is clicked
   */
  onOptions: (sparePart: SparePart) => void;
  /**
   * Optional className for custom styling
   */
  className?: string;
}

/**
 * SparePartCard Component
 * 
 * Displays spare part summary in minimalist card format.
 * Shows: name (truncated), serialId, amount.
 * Actions: "Ver" (view details) and "Options" (edit/delete menu).
 * 
 * Sprint #15/16 Task 7.1: Spare Parts Frontend
 * 
 * Design Notes:
 * - Name truncated with line-clamp-1 to handle long names
 * - Amount displays with unit label for clarity
 * - Low stock visual indicator when amount < 5 (future enhancement)
 * - Options menu via MoreVertical icon (matches ChatOptionsModal pattern)
 * 
 * @example
 * ```tsx
 * <SparePartCard
 *   sparePart={part}
 *   onView={vm.actions.handleViewPart}
 *   onOptions={vm.actions.handleOpenOptions}
 * />
 * ```
 */
export const SparePartCard: React.FC<SparePartCardProps> = ({
  sparePart,
  onView,
  onOptions,
  className = '',
}) => {
  const { t, i18n } = useTranslation();

  // 🔮 POST-MVP: Low stock indicator (amount < threshold)
  // const isLowStock = sparePart.amount < 5;

  return (
    <Card 
      className={`
        p-4 hover:shadow-md transition-shadow
        ${className}
      `}
    >
      {/* Header: Name (truncated) */}
      <div className="mb-3">
        <BodyText 
          weight="medium" 
          className="text-foreground line-clamp-1"
          title={sparePart.name} // Full name on hover
        >
          {sparePart.name}
        </BodyText>
      </div>

      {/* Metadata Grid */}
      <div className="space-y-2 mb-4">
        
        {/* Date of creation */}
        <div className="flex justify-between items-center">
          <BodyText size="regular" className="text-muted-foreground">
            {t('common.createdAt')}:
          </BodyText>
          <BodyText size="regular" weight="medium" className="text-foreground">
            {formatDateShort(sparePart.createdAt, i18n.language)}
          </BodyText>
        </div>

        {/* Serial ID */}
        <div className="flex justify-between items-center">
          <BodyText size="regular" className="text-muted-foreground">
            {t('spareParts.serialId')}:
          </BodyText>
          <BodyText size="regular" weight="medium" className="text-foreground">
            {sparePart.serialId}
          </BodyText>
        </div>

        {/* Amount */}
        <div className="flex justify-between items-center">
          <BodyText size="regular" className="text-muted-foreground">
            {t('spareParts.amount')}:
          </BodyText>
          <BodyText 
            size="regular" 
            weight="medium" 
            className="text-foreground"
            // 🔮 POST-MVP: Low stock indicator
            // className={isLowStock ? 'text-warning' : 'text-foreground'}
          >
            {sparePart.amount} {t('spareParts.units')}
          </BodyText>
        </div>
      </div>

      {/* Actions: Ver + Options */}
      <div className="flex gap-2 pt-3 border-t border-border">
        {/* Ver Details Button (Primary action) */}
        <Button
          variant="filled"
          className="flex-1 justify-between"
          onPress={() => onView(sparePart)}
        >
          <BodyText>{t('common.view')}</BodyText>
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>

        {/* Options Menu Button (Secondary action) */}
        <Button
          variant="outline"
          onPress={() => onOptions(sparePart)}
          aria-label={t('common.actions')}
        >
          <BodyText>{t('common.actions')}</BodyText>
          <MoreVertical className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </Card>
  );
};

// 🔮 POST-MVP: Enhanced features (commented)

/**
 * TODO (v0.0.2): Low stock visual indicator
 * - Show warning badge when amount < threshold
 * - Change amount text color to warning
 * - Add alert icon
 * 
 * UI Addition:
 * {isLowStock && (
 *   <Badge variant="warning" size="sm" className="absolute top-2 right-2">
 *     <AlertTriangle className="h-3 w-3 mr-1" />
 *     {t('spareParts.lowStock')}
 *   </Badge>
 * )}
 */

/**
 * TODO (v0.0.3): Part photo thumbnail
 * - Display small photo thumbnail
 * - Fallback to icon if no photo
 * - Click to view full photo
 * 
 * UI Addition:
 * <div className="aspect-square w-16 h-16 rounded-md overflow-hidden mb-3">
 *   {sparePart.photoUrl ? (
 *     <img src={sparePart.photoUrl} alt={sparePart.name} className="w-full h-full object-cover" />
 *   ) : (
 *     <div className="w-full h-full bg-muted flex items-center justify-center">
 *       <Package className="h-8 w-8 text-muted-foreground" />
 *     </div>
 *   )}
 * </div>
 */

/**
 * TODO (v0.0.4): Quick actions on hover
 * - Show quick +1/-1 amount buttons on hover
 * - Inline amount adjustment without opening modal
 * - Optimistic UI update
 * 
 * State:
 * const [isHovered, setIsHovered] = useState(false);
 * 
 * UI Addition (in amount row):
 * {isHovered && (
 *   <div className="flex gap-1">
 *     <Button size="sm" variant="ghost" onClick={() => onAmountChange(amount - 1)}>-</Button>
 *     <Button size="sm" variant="ghost" onClick={() => onAmountChange(amount + 1)}>+</Button>
 *   </div>
 * )}
 */

/**
 * TODO (v0.0.5): Last updated timestamp
 * - Show relative time since last update
 * - Format: "Actualizado hace 2 días"
 * - Use date-fns or similar library
 * 
 * UI Addition:
 * <BodyText size="small" className="text-muted-foreground mt-2">
 *   {t('common.updatedAt')}: {formatDistanceToNow(sparePart.updatedAt, { addSuffix: true })}
 * </BodyText>
 */
