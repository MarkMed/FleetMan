import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@utils/cn';

/**
 * Typography variant configuration using CVA (Class Variance Authority)
 * This centralizes all text sizing, weight, and color styling decisions
 * following the FleetMan design system
 */
const textVariants = cva(
  // Base classes applied to all text elements
  'leading-normal',
  {
    variants: {
      /**
       * Text size variants - covers full spectrum from tiny labels to headlines
       */
      size: {
        tiny: 'text-xs',        // 12px - Small labels, badges, captions
        small: 'text-sm',       // 14px - Secondary text, descriptions
        regular: 'text-base',   // 16px - Body text, default size
        medium: 'text-lg',      // 18px - Emphasized content, large buttons
        large: 'text-xl',       // 20px - Section headers, cards titles
        headline: 'text-3xl',   // 30px - Page titles, main headings
      },
      /**
       * Font weight variants for text hierarchy
       */
      weight: {
        light: 'font-light',    // 300 - Subtle text, large displays
        regular: 'font-normal', // 400 - Default body text
        medium: 'font-medium',  // 500 - Emphasized text, labels
        bold: 'font-bold',      // 700 - Headings, important content
      },
      /**
       * Color variants using design system tokens
       * Maps to CSS custom properties defined in globals.css
       */
      color: {
        textPrimary: 'text-foreground',           // Main text color
        textSecondary: 'text-muted-foreground',   // Secondary/subtle text
        textSuccess: 'text-success',              // Success states, positive indicators
        textWarning: 'text-warning',              // Warning states, attention needed
        textError: 'text-destructive',            // Error states, critical alerts
        textInfo: 'text-info',                    // Information, neutral highlights
        textWhite: 'text-white',                  // White text for dark backgrounds
        textMuted: 'text-muted-foreground',       // Disabled or placeholder text
      },
      /**
       * Text alignment options
       */
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify',
      },
    },
    defaultVariants: {
      size: 'regular',
      weight: 'regular',
      color: 'textPrimary',
      align: 'left',
    },
  }
);

/**
 * Maps semantic element types to their appropriate HTML tags
 * This ensures proper semantic markup for accessibility and SEO
 */
const elementTagMap = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  p: 'p',
  span: 'span',
  div: 'div',
  label: 'label',
} as const;

export interface TextBlockProps 
  extends Omit<React.HTMLAttributes<HTMLElement>, 'style'> {
  /**
   * Semantic element type - determines the HTML tag used
   * @default 'p'
   */
  as?: keyof typeof elementTagMap;
  /**
   * Text size variant
   * @default 'regular'
   */
  size?: 'tiny' | 'small' | 'regular' | 'medium' | 'large' | 'headline';
  /**
   * Font weight variant
   * @default 'regular'
   */
  weight?: 'light' | 'regular' | 'medium' | 'bold';
  /**
   * Text color variant using design system colors
   * @default 'textPrimary'
   */
  color?: 'textPrimary' | 'textSecondary' | 'textSuccess' | 'textWarning' | 'textError' | 'textInfo' | 'textWhite' | 'textMuted';
  /**
   * Text alignment
   * @default 'left'
   */
  align?: 'left' | 'center' | 'right' | 'justify';
  /**
   * Additional CSS classes for custom styling
   */
  style?: string;
  /**
   * Content to render inside the text element
   */
  children: React.ReactNode;
}

/**
 * TextBlock Component
 * 
 * A unified typography component that standardizes all text rendering across the FleetMan application.
 * Provides consistent sizing, weighting, coloring, and semantic markup for accessibility.
 * 
 * Features:
 * - Semantic HTML elements (h1-h6, p, span, div, label)
 * - Standardized size scale (tiny to headline)
 * - Design system color integration
 * - TypeScript safety with variant props
 * - Accessibility-first approach
 * 
 * Usage Examples:
 * ```tsx
 * <TextBlock as="h1" size="headline" weight="bold">Page Title</TextBlock>
 * <TextBlock as="p" color="textSecondary">Secondary description</TextBlock>
 * <TextBlock size="small" color="textMuted">Helper text</TextBlock>
 * ```
 */
const TextBlock = React.forwardRef<HTMLElement, TextBlockProps>(
  ({ 
    as = 'p',
    size = 'regular',
    weight = 'regular', 
    color = 'textPrimary',
    align = 'left',
    style,
    className,
    children,
    ...props 
  }, ref) => {
    
    const baseClassName = cn(
      textVariants({ size, weight, color, align }),
      style,
      className
    );
    
    // Render appropriate HTML element based on 'as' prop
    switch (as) {
      case 'h1':
        return <h1 ref={ref as React.Ref<HTMLHeadingElement>} className={baseClassName} {...props}>{children}</h1>;
      case 'h2':
        return <h2 ref={ref as React.Ref<HTMLHeadingElement>} className={baseClassName} {...props}>{children}</h2>;
      case 'h3':
        return <h3 ref={ref as React.Ref<HTMLHeadingElement>} className={baseClassName} {...props}>{children}</h3>;
      case 'h4':
        return <h4 ref={ref as React.Ref<HTMLHeadingElement>} className={baseClassName} {...props}>{children}</h4>;
      case 'h5':
        return <h5 ref={ref as React.Ref<HTMLHeadingElement>} className={baseClassName} {...props}>{children}</h5>;
      case 'h6':
        return <h6 ref={ref as React.Ref<HTMLHeadingElement>} className={baseClassName} {...props}>{children}</h6>;
      case 'span':
        return <span ref={ref as React.Ref<HTMLSpanElement>} className={baseClassName} {...props}>{children}</span>;
      case 'div':
        return <div ref={ref as React.Ref<HTMLDivElement>} className={baseClassName} {...props}>{children}</div>;
      case 'label':
        return <label ref={ref as React.Ref<HTMLLabelElement>} className={baseClassName} {...props}>{children}</label>;
      case 'p':
      default:
        return <p ref={ref as React.Ref<HTMLParagraphElement>} className={baseClassName} {...props}>{children}</p>;
    }
  }
);

TextBlock.displayName = 'TextBlock';

/**
 * Pre-configured text components for common use cases
 * These provide semantic shortcuts while maintaining design system consistency
 */

/**
 * Heading components with appropriate default styling
 */
export const Heading1: React.FC<Omit<TextBlockProps, 'as'>> = (props) => (
  <TextBlock as="h1" size="headline" weight="bold" {...props} />
);

export const Heading2: React.FC<Omit<TextBlockProps, 'as'>> = (props) => (
  <TextBlock as="h2" size="large" weight="bold" {...props} />
);

export const Heading3: React.FC<Omit<TextBlockProps, 'as'>> = (props) => (
  <TextBlock as="h3" size="medium" weight="medium" {...props} />
);

/**
 * Body text components
 */
export const BodyText: React.FC<Omit<TextBlockProps, 'as'>> = (props) => (
  <TextBlock as="p" size="regular" {...props} />
);

export const SmallText: React.FC<Omit<TextBlockProps, 'as'>> = (props) => (
  <TextBlock as="span" size="small" color="textSecondary" {...props} />
);

export const Label: React.FC<Omit<TextBlockProps, 'as'>> = (props) => (
  <TextBlock as="label" size="small" weight="medium" {...props} />
);

export { TextBlock, textVariants };