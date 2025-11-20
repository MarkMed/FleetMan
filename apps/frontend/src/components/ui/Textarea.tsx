import React from 'react';
import { cn } from '@utils/cn';

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
  /**
   * Label text displayed above the textarea
   */
  label?: string;
  /**
   * Current value of the textarea
   */
  value?: string;
  /**
   * Callback function called when textarea value changes
   * @param text - The new textarea value
   */
  onChangeText?: (text: string) => void;
  /**
   * Original onChange handler (optional, for compatibility)
   */
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /**
   * Error message to display below the textarea
   */
  error?: string;
  /**
   * Whether the field is required (shows * in label)
   */
  required?: boolean;
  /**
   * Helper text displayed below the textarea
   */
  helperText?: string;
  /**
   * Maximum character count (shows character counter)
   */
  maxLength?: number;
  /**
   * Whether to show character counter
   */
  showCharacterCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    label,
    value = '',
    onChangeText,
    onChange,
    error,
    required = false,
    helperText,
    maxLength,
    showCharacterCount = false,
    disabled = false,
    ...rest
  }, ref) => {
    
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value;
      onChangeText?.(newValue);
      onChange?.(event);
    };

    const hasError = !!error;
    const hasHelperText = !!helperText && !hasError;
    const characterCount = value.length;
    const showCounter = showCharacterCount || !!maxLength;

    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <label className={cn(
            'text-sm font-medium leading-none',
            hasError ? 'text-destructive' : 'text-foreground'
          )}>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          maxLength={maxLength}
          className={cn(
            // Base styles
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200',
            'resize-vertical',
            // Error state
            hasError && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...rest}
        />

        {/* Footer section */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
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

          {/* Character Counter */}
          {showCounter && (
            <div className="ml-2 flex-shrink-0">
              <p className={cn(
                'text-xs',
                maxLength && characterCount > maxLength * 0.9 
                  ? 'text-destructive' 
                  : 'text-muted-foreground'
              )}>
                {characterCount}
                {maxLength && `/${maxLength}`}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };