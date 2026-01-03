import * as React from 'react';
import { cn } from '@utils/cn';

/**
 * Input Component Props
 * 
 * Simple input element without label/error (unlike InputField).
 * Useful for inline inputs, custom form layouts, or when using React Hook Form directly.
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Optional error state styling
   * @default false
   */
  error?: boolean;
}

/**
 * Input Component
 * 
 * Basic styled input element without label/error wrapper.
 * Use this for custom form layouts or inline inputs.
 * 
 * For form fields with labels/errors, use InputField instead.
 * 
 * Pattern: Raw input wrapper (not form field wrapper like InputField)
 * 
 * @example
 * ```tsx
 * // Basic input
 * <Input type="text" placeholder="Enter name..." />
 * 
 * // With error styling
 * <Input type="email" error placeholder="Email address" />
 * 
 * // With React Hook Form
 * const { register } = useForm();
 * <Input {...register('username')} />
 * 
 * // Custom styled
 * <Input className="w-full" type="number" min={0} max={100} />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };

// ============================================
// POST-MVP: Enhanced Input Features (Commented)
// ============================================

/**
 * Input with Icon
 * Shows icon inside input (left or right)
 * 
 * Props: icon (ReactNode), iconPosition ('left' | 'right')
 * Example: Search icon, Lock icon, Eye icon for password
 */
// export interface IconInputProps extends InputProps {
//   icon?: React.ReactNode;
//   iconPosition?: 'left' | 'right';
// }

/**
 * Input with Clear Button
 * Shows X button to clear input value
 * 
 * Props: value, onClear callback
 * Shows only when input has value
 */
// export interface ClearableInputProps extends InputProps {
//   onClear?: () => void;
// }

/**
 * Input with Character Counter
 * Shows current/max character count
 * 
 * Props: maxLength, showCounter boolean
 * Example: "45 / 100" below input
 */
// export interface CountedInputProps extends InputProps {
//   showCounter?: boolean;
// }

/**
 * Masked Input
 * Format input as user types (phone, credit card, etc.)
 * 
 * Props: mask (string pattern), maskChar (placeholder char)
 * Example: (___) ___-____ for phone numbers
 * Library: react-input-mask or custom implementation
 */
// export interface MaskedInputProps extends InputProps {
//   mask?: string;
//   maskChar?: string;
// }

/**
 * Debounced Input
 * Delays onChange callback until user stops typing
 * 
 * Props: debounceMs (number), onDebouncedChange callback
 * Useful for search inputs, API calls
 */
// export interface DebouncedInputProps extends InputProps {
//   debounceMs?: number;
//   onDebouncedChange?: (value: string) => void;
// }
