import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@utils/cn';

interface CollapsibleSectionProps {
  title: string;
  defaultExpanded?: boolean;
  badge?: string | number;
  children: React.ReactNode;
  className?: string;
  onExpandChange?: (expanded: boolean) => void; // Strategic: for telemetry tracking
}

/**
 * CollapsibleSection - Reusable expandable/collapsible section component
 * 
 * Features:
 * - Smooth animation on expand/collapse
 * - Optional badge for metadata (e.g., item count)
 * - Accessible with keyboard navigation
 * - Customizable styling via className
 * 
 * Usage:
 * ```tsx
 * <CollapsibleSection title="Details" defaultExpanded badge="5">
 *   <div>Content here</div>
 * </CollapsibleSection>
 * ```
 */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  defaultExpanded = false,
  badge,
  children,
  className,
  onExpandChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onExpandChange?.(newState);
  };

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden', className)}>
      {/* Header - Clickable */}
      <button
        onClick={handleToggle}
        className={cn(
          'w-full flex items-center justify-between',
          'px-6 py-4',
          'bg-card hover:bg-muted/50',
          'transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
        )}
        aria-expanded={isExpanded}
        aria-controls="collapsible-content"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {badge !== undefined && (
            <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-muted-foreground transition-transform duration-300',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {/* Content - Expandable */}
      <div
        id="collapsible-content"
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-6 py-4 border-t border-border bg-card">
          {children}
        </div>
      </div>
    </div>
  );
};
