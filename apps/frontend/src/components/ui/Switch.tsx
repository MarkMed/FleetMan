import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@utils/cn';

/**
 * Switch Component
 * 
 * Toggle switch component built with Radix UI.
 * Used for binary on/off states (e.g., enable/disable features).
 * 
 * Pattern: Follows Checkbox.tsx structure (Radix UI wrapper)
 * 
 * @example
 * ```tsx
 * // Controlled switch
 * const [isActive, setIsActive] = useState(true);
 * <Switch checked={isActive} onCheckedChange={setIsActive} />
 * 
 * // With label
 * <div className="flex items-center gap-2">
 *   <Switch id="notifications" />
 *   <Label htmlFor="notifications">Enable notifications</Label>
 * </div>
 * 
 * // Disabled state
 * <Switch disabled checked />
 * ```
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };

// ============================================
// POST-MVP: Enhanced Switch Features (Commented)
// ============================================

/**
 * Switch with Label Component
 * Combines switch with label and description
 * 
 * Props: label (string), description (string), checked, onCheckedChange
 * Layout: Label above or beside switch
 */
// export interface SwitchWithLabelProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
//   label: string;
//   description?: string;
//   labelPosition?: 'top' | 'left' | 'right';
// }

/**
 * Switch with Icons
 * Shows different icons for on/off states
 * 
 * Props: checkedIcon (ReactNode), uncheckedIcon (ReactNode)
 * Example: Sun icon (light mode) / Moon icon (dark mode)
 */
// export interface IconSwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
//   checkedIcon?: React.ReactNode;
//   uncheckedIcon?: React.ReactNode;
// }

/**
 * Switch Group
 * Multiple switches with shared state management
 * 
 * Props: options (Array<{ id, label, checked }>), onChange
 * Useful for feature toggles, settings pages
 */
// export interface SwitchGroupProps {
//   options: Array<{ id: string; label: string; description?: string; checked: boolean }>;
//   onChange: (id: string, checked: boolean) => void;
// }

/**
 * Animated Switch
 * Enhanced animations (spring, bounce) for state transitions
 * 
 * Props: animation ('spring' | 'bounce' | 'fade')
 * Uses Framer Motion or CSS transitions
 */
// export interface AnimatedSwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
//   animation?: 'spring' | 'bounce' | 'fade';
// }
