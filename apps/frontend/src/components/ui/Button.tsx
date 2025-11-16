import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]',
  {
    variants: {
      variant: {
        filled: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-sm',
        success: 'bg-success text-success-foreground hover:bg-success/90 hover:shadow-md',
        warning: 'bg-warning text-warning-foreground hover:bg-warning/90 hover:shadow-md',
        link: 'text-primary underline-offset-4 hover:underline hover:text-primary/80',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'filled',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'type'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  /**
   * Callback function executed when button is pressed.
   * Automatically prevented if button is disabled or loading.
   */
  onPress?: () => void;
  /**
   * Visual style variant of the button.
   * @default "filled"
   */
  variant?: 'filled' | 'ghost' | 'outline' | 'destructive' | 'secondary' | 'success' | 'warning' | 'link';
  /**
   * HTML button type attribute for form submission behavior.
   * @default "button"
   */
  htmlType?: 'submit' | 'reset' | 'button';
  /**
   * Disables the button and prevents onPress execution.
   * @default false
   */
  disabled?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'filled', 
    size, 
    asChild = false, 
    loading = false, 
    disabled = false, 
    htmlType = 'button',
    onPress,
    children, 
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    /**
     * Handles button click events with validation.
     * For submit buttons, allows natural form submission.
     * For other buttons, prevents default and executes onPress.
     */
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      // For submit buttons, allow natural form submission
      if (htmlType === 'submit') {
        // Don't prevent default - let the form handle submission
        return;
      }
      
      // For other button types, prevent default and handle with onPress
      event.preventDefault();
      
      // Prevent execution if button is disabled, loading, or no callback
      if (disabled || loading || !onPress) {
        return;
      }
      
      onPress();
    };
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        type={htmlType}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin transition-all duration-200"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };