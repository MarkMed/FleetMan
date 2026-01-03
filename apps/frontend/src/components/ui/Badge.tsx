import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@utils/cn';

/**
 * Badge variants using CVA (class-variance-authority)
 * 
 * Variants:
 * - default: Neutral gray badge
 * - success: Green badge for positive states
 * - warning: Yellow/orange badge for caution states
 * - destructive: Red badge for errors/critical states
 * - secondary: Muted badge for less emphasis
 * - outline: Transparent with border only
 * 
 * Sizes:
 * - sm: Small badge (text-xs, px-2)
 * - default: Standard badge (text-sm, px-2.5)
 * - lg: Large badge (text-base, px-3)
 */
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        success:
          'border-transparent bg-success text-success-foreground hover:bg-success/80',
        warning:
          'border-transparent bg-warning text-warning-foreground hover:bg-warning/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'text-foreground border-border hover:bg-accent',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        default: 'text-sm px-2.5 py-0.5',
        lg: 'text-base px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Visual style variant of the badge
   * @default "default"
   */
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'secondary' | 'outline';
  /**
   * Size of the badge
   * @default "default"
   */
  size?: 'sm' | 'default' | 'lg';
}

/**
 * Badge Component
 * 
 * Versatile badge component for displaying status, tags, counts, and labels.
 * Built with CVA for consistent variant styling.
 * 
 * @example
 * ```tsx
 * // Status badge
 * <Badge variant="success">Active</Badge>
 * 
 * // Count badge
 * <Badge variant="secondary">12</Badge>
 * 
 * // Tag badge
 * <Badge variant="outline">React</Badge>
 * 
 * // Size variants
 * <Badge size="sm">Small</Badge>
 * <Badge size="lg">Large</Badge>
 * ```
 */
function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

// ============================================
// POST-MVP: Enhanced Badge Features (Commented)
// ============================================

/**
 * Interactive Badge with onClick
 * Useful for filter tags, removable tags
 * 
 * Props: onRemove callback, isDismissible boolean
 * Shows X icon when hoverable
 */
// export interface InteractiveBadgeProps extends BadgeProps {
//   onRemove?: () => void;
//   isDismissible?: boolean;
// }

/**
 * Badge with Icon
 * Shows icon before or after text
 * 
 * Props: icon (ReactNode), iconPosition ('left' | 'right')
 */
// export interface IconBadgeProps extends BadgeProps {
//   icon?: React.ReactNode;
//   iconPosition?: 'left' | 'right';
// }

/**
 * Badge with Dot indicator
 * Shows colored dot for online/offline/busy status
 * 
 * Props: dotColor string, showDot boolean
 */
// export interface DotBadgeProps extends BadgeProps {
//   dotColor?: string;
//   showDot?: boolean;
// }

/**
 * Animated Badge
 * Pulse animation for notifications, live status
 * 
 * Props: animate ('pulse' | 'bounce' | 'ping')
 */
// export interface AnimatedBadgeProps extends BadgeProps {
//   animate?: 'pulse' | 'bounce' | 'ping';
// }
