import * as React from 'react';
import { cn } from '@utils/cn';
import { Eye, EyeOff } from 'lucide-react';

export interface InputFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onBlur' | 'style'> {
  /**
   * Label text displayed above the input field
   */
  label?: string;
  /**
   * Placeholder text shown when input is empty
   */
  placeholder?: string;
  /**
   * Icon component to display on the left side of the input
   * Should be a React component (e.g., from lucide-react)
   */
  icon?: React.ComponentType<{ className?: string }>;
  /**
   * Current value of the input field
   */
  value?: string;
  /**
   * Callback function called when input value changes
   * @param text - The new input value
   */
  onChangeText?: (text: string) => void;
  /**
   * Callback function called when input loses focus
   * @param text - The current input value when blurred
   */
  onBlur?: (text: string) => void;
  /**
   * When true, input content is hidden (for passwords)
   * Automatically adds a toggle visibility button
   * @default false
   */
  secureTextEntry?: boolean;
  /**
   * HTML input type for different keyboard behaviors
   * @default "default"
   */
  keyboardType?: 'default' | 'email' | 'numeric' | 'tel' | 'url' | 'search';
  /**
   * Error message to display below the input
   * When provided, input will show error styling
   */
  error?: string;
  /**
   * When true, input is disabled and non-interactive
   * @default false
   */
  disabled?: boolean;
  /**
   * Custom CSS classes for styling the input element
   */
  style?: string;
  /**
   * Whether the field is required (shows * in label)
   * @default false
   */
  required?: boolean;
  /**
   * Helper text displayed below the input (when no error is present)
   */
  helperText?: string;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({
    className,
    label,
    placeholder,
    icon: Icon,
    value,
    onChangeText,
    onBlur: onBlurProp,
    secureTextEntry = false,
    keyboardType = 'default',
    error,
    disabled = false,
    style,
    required = false,
    helperText,
    ...rest
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    /**
     * Maps keyboardType to HTML input type
     */
    const getInputType = (): string => {
      if (secureTextEntry && !showPassword) return 'password';
      if (secureTextEntry && showPassword) return 'text';
      
      switch (keyboardType) {
        case 'email': return 'email';
        case 'numeric': return 'number';
        case 'tel': return 'tel';
        case 'url': return 'url';
        case 'search': return 'search';
        default: return 'text';
      }
    };

    /**
     * Handles input value changes
     */
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      onChangeText?.(newValue);
    };

    /**
     * Handles input blur events
     */
    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlurProp?.(event.target.value);
    };

    /**
     * Handles input focus events
     */
    const handleFocus = () => {
      setIsFocused(true);
    };

    /**
     * Toggles password visibility
     */
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const hasError = !!error;
    const hasHelperText = !!helperText && !hasError;
    
    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <label className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            hasError ? 'text-destructive' : 'text-foreground'
          )}>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {Icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground transition-colors duration-200">
              <Icon className="h-4 w-4" />
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            type={getInputType()}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              // Base styles with smooth transitions
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
              // Focus animation
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-ring',
              // Icon padding
              Icon && 'pl-10',
              // Password toggle padding
              secureTextEntry && 'pr-10',
              // Error state
              hasError && 'border-destructive focus-visible:ring-destructive focus-visible:border-destructive',
              // Custom styles
              style,
              className
            )}
            {...rest}
          />

          {/* Password Toggle Button */}
          {secureTextEntry && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              disabled={disabled}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:text-foreground disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Error Message */}
        {hasError && (
          <p className="text-sm text-destructive font-medium" role="alert">
            {error}
          </p>
        )}

        {/* Helper Text */}
        {hasHelperText && (
          <p className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export { InputField };