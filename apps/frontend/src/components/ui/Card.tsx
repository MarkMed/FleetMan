import * as React from 'react';
import { cn } from '@utils/cn';

/**
 * Card Component
 * 
 * A flexible container component that provides consistent styling for content blocks.
 * Based on the design system's card styling with proper spacing, borders, and backgrounds.
 * 
 * Used for:
 * - Statistics cards
 * - Content sections
 * - Action panels
 * - Information displays
 */

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // 'rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
      'rounded-lg border border-border bg-card text-card-foreground shadow-sm',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

/**
 * Card Header Component
 * Provides consistent spacing and styling for card headers
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

/**
 * Card Title Component
 * Styled heading for card headers with appropriate typography
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

/**
 * Card Description Component
 * Styled description text for card headers
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

/**
 * Card Content Component
 * Main content area with appropriate padding
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

/**
 * Card Footer Component
 * Footer area for actions or additional information
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
));
CardFooter.displayName = 'CardFooter';

/**
 * Stat Card Component
 * Pre-configured card specifically for displaying statistics
 * Common pattern in dashboards and analytics views
 */
interface StatCardProps {
  /**
   * Main statistic label
   */
  title: string;
  /**
   * The numerical value or main content
   */
  value: string | number;
  /**
   * Optional description or context
   */
  description?: string;
  /**
   * Optional icon component
   */
  icon?: React.ReactNode;
  /**
   * Color variant for the value text
   */
  valueColor?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /**
   * Additional CSS classes
   */
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  valueColor = 'default',
  className
}) => {
  const getValueColorClass = () => {
    switch (valueColor) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-destructive';
      case 'info':
        return 'text-info';
      default:
        return 'text-foreground';
    }
  };

  return (
    <Card className={cn('transition-all duration-200 hover:shadow-lg hover:-translate-y-1', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {icon && <div className="text-muted-foreground transition-transform duration-200 hover:scale-110">{icon}</div>}
        </div>
        <div className="space-y-1">
          <p className={cn('text-3xl font-bold transition-colors duration-200', getValueColorClass())}>
            {value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  StatCard,
};