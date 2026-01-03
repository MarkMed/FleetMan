import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, BodyText, Badge } from '@components/ui';
import { Plus, X } from 'lucide-react';

interface RelatedPartsInputProps {
  /**
   * Current list of related parts
   */
  value: string[];
  /**
   * Callback when parts list changes
   */
  onChange: (parts: string[]) => void;
  /**
   * Maximum number of parts allowed (contract limit: 50)
   */
  maxParts?: number;
  /**
   * Optional error message
   */
  error?: string;
  /**
   * Optional className for custom styling
   */
  className?: string;
}

/**
 * RelatedPartsInput Component
 * 
 * Dynamic tag-style input for adding/removing related spare parts.
 * Enforces contract validation (max 50 parts, min 1 char per part).
 * 
 * Sprint #11: Used in CreateEditAlarmModal form
 * 
 * UX Pattern:
 * - Type part name → Press Enter or click "+" → Tag appears
 * - Click X on tag → Removes part
 * - Shows count: "3 / 50 partes"
 * 
 * @example
 * ```tsx
 * const [parts, setParts] = useState<string[]>([]);
 * 
 * <RelatedPartsInput
 *   value={parts}
 *   onChange={setParts}
 *   maxParts={50}
 * />
 * ```
 */
export const RelatedPartsInput: React.FC<RelatedPartsInputProps> = ({
  value,
  onChange,
  maxParts = 50,
  error,
  className = '',
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');

  /**
   * Add a new part to the list
   * Validations: non-empty, not duplicate, not exceed max
   */
  const handleAddPart = () => {
    const trimmedValue = inputValue.trim();
    
    // Validation: empty
    if (!trimmedValue) {
      return;
    }

    // Validation: duplicate
    if (value.includes(trimmedValue)) {
      return;
    }

    // Validation: max limit
    if (value.length >= maxParts) {
      return;
    }

    // Add part
    onChange([...value, trimmedValue]);
    setInputValue(''); // Clear input
  };

  /**
   * Remove a part from the list
   */
  const handleRemovePart = (index: number) => {
    const newParts = value.filter((_, i) => i !== index);
    onChange(newParts);
  };

  /**
   * Handle Enter key press
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPart();
    }
  };

  const isAtMaxCapacity = value.length >= maxParts;

  return (
    <div className={className}>
      {/* Input Row */}
      <div className="flex gap-2 mb-2">
        <Input
          type="text"
          placeholder={t('maintenance.alarms.relatedPartsPlaceholder')}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAtMaxCapacity}
          className="flex-1"
        />
        <Button
          htmlType="button"
          variant="outline"
          size="sm"
          onPress={handleAddPart}
          disabled={!inputValue.trim() || isAtMaxCapacity}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('maintenance.alarms.addPart')}
        </Button>
      </div>

      {/* Tags Display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-md min-h-[60px]">
          {value.map((part, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <span>{part}</span>
              <button
                type="button"
                onClick={() => handleRemovePart(index)}
                className="
                  ml-1 rounded-full p-0.5 
                  hover:bg-destructive/20 
                  transition-colors
                "
                aria-label={`Remove ${part}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Counter + Messages */}
      <div className="flex items-center justify-between mt-2">
        <BodyText size="small" className="text-muted-foreground">
          {value.length} / {maxParts} {t('maintenance.alarms.relatedParts').toLowerCase()}
        </BodyText>
        
        {isAtMaxCapacity && (
          <BodyText size="small" className="text-warning">
            {t('maintenance.alarms.form.partsMax')}
          </BodyText>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <BodyText size="small" className="text-destructive mt-1">
          {error}
        </BodyText>
      )}
    </div>
  );
};

// ============================================
// POST-MVP: Enhanced Features (Commented)
// ============================================

/**
 * RelatedPartsInput with Autocomplete
 * Suggests existing parts from database (SpareParts entity)
 * 
 * Props: suggestedParts (string[]) from API
 * Shows dropdown with existing parts + "Create new" option
 */
// export const RelatedPartsAutocomplete: React.FC<RelatedPartsInputProps & AutocompleteProps> = ({ ... }) => { }

/**
 * RelatedPartsInput with Category Grouping
 * Groups parts by category (Filters, Oils, Electrical, etc.)
 * 
 * Props: parts (Array<{ name, category }>)
 * Displays tags grouped by category with color coding
 */
// export const CategorizedPartsInput: React.FC<RelatedPartsInputProps & CategoryProps> = ({ ... }) => { }

/**
 * RelatedPartsInput with Stock Info
 * Shows if part is in stock or needs ordering
 * 
 * Props: partsInventory (Map<partName, { inStock, quantity }>)
 * Displays badge with stock status next to each tag
 */
// export const PartsInputWithStock: React.FC<RelatedPartsInputProps & StockProps> = ({ ... }) => { }

/**
 * Bulk Import from Template
 * Load parts list from maintenance task templates
 * 
 * Props: templates (Array<{ name, parts[] }>)
 * Button: "Load from template" → Dropdown with templates
 */
// export const PartsInputWithTemplates: React.FC<RelatedPartsInputProps & TemplateProps> = ({ ... }) => { }
