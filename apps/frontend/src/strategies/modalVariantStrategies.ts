/**
 * Modal Variant Strategies
 * 
 * This file implements the Strategy pattern to handle different modal variants
 * in a scalable and maintainable way, replacing switch-case statements.
 * 
 * Each variant strategy defines:
 * - Border classes for colored borders
 * - Background accent classes
 * - Button variants for confirm/cancel
 * - Title color classes
 */

import type { ModalVariant } from '@store/slices/modalSlice';

/**
 * Interface for modal variant strategy
 */
export interface ModalVariantStrategy {
  /**
   * Get border classes for this variant when showColoredBorder is true
   */
  getBorderClasses(): string;
  
  /**
   * Get background accent classes for this variant when showColoredBorder is true
   */
  getBackgroundAccent(): string;
  
  /**
   * Get the confirm button variant for this modal type
   */
  getConfirmButtonVariant(): "destructive" | "warning" | "success" | "filled" | "ghost" | "link" | "outline" | "secondary";
  
  /**
   * Get the cancel button variant for this modal type
   */
  getCancelButtonVariant(): "destructive" | "warning" | "success" | "filled" | "ghost" | "link" | "outline" | "secondary";
  
  /**
   * Get title color classes for this variant
   */
  getTitleColorClasses(): string;
}

/**
 * Default modal variant strategy
 */
class DefaultModalStrategy implements ModalVariantStrategy {
  getBorderClasses(): string {
    return 'border-l-4 border-l-gray-400 border-t-gray-400/40 border-r-gray-400/40 border-b-gray-400/40';
  }

  getBackgroundAccent(): string {
    return 'bg-gradient-to-r from-gray-50/50 via-background to-background dark:from-gray-950/40 dark:via-background dark:to-background';
  }

  getConfirmButtonVariant(): "filled" {
    return 'filled';
  }

  getCancelButtonVariant(): "ghost" {
    return 'ghost';
  }

  getTitleColorClasses(): string {
    return ''; // Use default title color
  }
}

/**
 * Info modal variant strategy
 */
class InfoModalStrategy implements ModalVariantStrategy {
  getBorderClasses(): string {
    return 'border-l-4 border-l-blue-500 border-t-blue-500/40 border-r-blue-500/40 border-b-blue-500/40';
  }

  getBackgroundAccent(): string {
    return 'bg-gradient-to-r from-blue-50/50 via-background to-background dark:from-blue-950/40 dark:via-background dark:to-background';
  }

  getConfirmButtonVariant(): "filled" {
    return 'filled';
  }

  getCancelButtonVariant(): "ghost" {
    return 'ghost';
  }

  getTitleColorClasses(): string {
    return 'text-blue-600';
  }
}

/**
 * Warning modal variant strategy
 */
class WarningModalStrategy implements ModalVariantStrategy {
  getBorderClasses(): string {
    return 'border-l-4 border-l-yellow-500 border-t-yellow-500/40 border-r-yellow-500/40 border-b-yellow-500/40';
  }

  getBackgroundAccent(): string {
    return 'bg-gradient-to-r from-yellow-50/50 via-background to-background dark:from-yellow-950/40 dark:via-background dark:to-background';
  }

  getConfirmButtonVariant(): "warning" {
    return 'warning';
  }

  getCancelButtonVariant(): "ghost" {
    return 'ghost';
  }

  getTitleColorClasses(): string {
    return 'text-yellow-600';
  }
}

/**
 * Danger modal variant strategy
 */
class DangerModalStrategy implements ModalVariantStrategy {
  getBorderClasses(): string {
    return 'border-l-4 border-l-red-500 border-t-red-500/40 border-r-red-500/40 border-b-red-500/40';
  }

  getBackgroundAccent(): string {
    return 'bg-gradient-to-r from-red-50/50 via-background to-background dark:from-red-950/40 dark:via-background dark:to-background';
  }

  getConfirmButtonVariant(): "destructive" {
    return 'destructive';
  }

  getCancelButtonVariant(): "ghost" {
    return 'ghost';
  }

  getTitleColorClasses(): string {
    return 'text-destructive';
  }
}

/**
 * Success modal variant strategy
 */
class SuccessModalStrategy implements ModalVariantStrategy {
  getBorderClasses(): string {
    return 'border-l-4 border-l-green-500 border-t-green-500/40 border-r-green-500/40 border-b-green-500/40';
  }

  getBackgroundAccent(): string {
    return 'bg-gradient-to-r from-green-50/50 via-background to-background dark:from-green-950/40 dark:via-background dark:to-background';
  }

  getConfirmButtonVariant(): "success" {
    return 'success';
  }

  getCancelButtonVariant(): "ghost" {
    return 'ghost';
  }

  getTitleColorClasses(): string {
    return 'text-green-600';
  }
}

/**
 * Confirmation modal variant strategy
 */
class ConfirmationModalStrategy implements ModalVariantStrategy {
  getBorderClasses(): string {
    return 'border-l-4 border-l-blue-600 border-t-blue-600/40 border-r-blue-600/40 border-b-blue-600/40';
  }

  getBackgroundAccent(): string {
    return 'bg-gradient-to-r from-blue-50/50 via-background to-background dark:from-blue-950/40 dark:via-background dark:to-background';
  }

  getConfirmButtonVariant(): "filled" {
    return 'filled';
  }

  getCancelButtonVariant(): "ghost" {
    return 'ghost';
  }

  getTitleColorClasses(): string {
    return 'text-blue-600';
  }
}

/**
 * Modal Variant Strategy Factory
 * 
 * This factory creates and manages modal variant strategies,
 * eliminating the need for switch-case statements.
 */
class ModalVariantStrategyFactory {
  private strategies: Map<ModalVariant, ModalVariantStrategy> = new Map();

  constructor() {
    // Register all available strategies
    this.strategies.set('default', new DefaultModalStrategy());
    this.strategies.set('info', new InfoModalStrategy());
    this.strategies.set('warning', new WarningModalStrategy());
    this.strategies.set('danger', new DangerModalStrategy());
    this.strategies.set('success', new SuccessModalStrategy());
    this.strategies.set('confirmation', new ConfirmationModalStrategy());
  }

  /**
   * Get strategy for a specific modal variant
   * 
   * @param variant - The modal variant to get strategy for
   * @returns The appropriate strategy instance
   */
  getStrategy(variant: ModalVariant = 'default'): ModalVariantStrategy {
    const strategy = this.strategies.get(variant);
    
    if (!strategy) {
      console.warn(`Unknown modal variant: ${variant}. Falling back to default strategy.`);
      return this.strategies.get('default')!;
    }
    
    return strategy;
  }

  /**
   * Register a new custom strategy
   * 
   * @param variant - The variant name to register
   * @param strategy - The strategy implementation
   * 
   * @example
   * ```tsx
   * // Register a custom variant
   * modalStrategyFactory.registerStrategy('custom', new CustomModalStrategy());
   * ```
   */
  registerStrategy(variant: string, strategy: ModalVariantStrategy): void {
    this.strategies.set(variant as ModalVariant, strategy);
  }

  /**
   * Get all available variant names
   */
  getAvailableVariants(): string[] {
    return Array.from(this.strategies.keys());
  }
}

/**
 * Singleton instance of the modal variant strategy factory
 */
export const modalVariantStrategyFactory = new ModalVariantStrategyFactory();

/**
 * Export strategy classes for custom implementations
 * 
 * @example
 * ```tsx
 * // Creating a custom modal variant strategy
 * class CustomModalStrategy implements ModalVariantStrategy {
 *   getBorderClasses(): string {
 *     return 'border-l-4 border-l-purple-500 border-t-purple-500/40 border-r-purple-500/40 border-b-purple-500/40';
 *   }
 * 
 *   getBackgroundAccent(): string {
 *     return 'bg-gradient-to-r from-purple-50/50 via-background to-background dark:from-purple-950/40 dark:via-background dark:to-background';
 *   }
 * 
 *   getConfirmButtonVariant(): "filled" {
 *     return 'filled';
 *   }
 * 
 *   getCancelButtonVariant(): "ghost" {
 *     return 'ghost';
 *   }
 * 
 *   getTitleColorClasses(): string {
 *     return 'text-purple-600';
 *   }
 * }
 * 
 * // Register the custom strategy
 * modalVariantStrategyFactory.registerStrategy('custom', new CustomModalStrategy());
 * 
 * // Use the custom variant
 * modal.show({
 *   variant: 'custom' as ModalVariant,
 *   title: 'Custom Modal',
 *   showColoredBorder: true
 * });
 * ```
 */
export {
  DefaultModalStrategy,
  InfoModalStrategy,
  WarningModalStrategy,
  DangerModalStrategy,
  SuccessModalStrategy,
  ConfirmationModalStrategy,
};