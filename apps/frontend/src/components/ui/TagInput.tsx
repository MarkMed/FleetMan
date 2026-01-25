import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, BodyText, Badge } from '@components/ui';
import { Plus, X } from 'lucide-react';

export interface TagInputProps {
  /**
   * Label text displayed above the input
   */
  label?: string;
  /**
   * Current tags array
   */
  value: string[];
  /**
   * Callback when tags change
   */
  onChangeValue: (tags: string[]) => void;
  /**
   * Maximum number of tags allowed
   * @default 5
   */
  maxTags?: number;
  /**
   * Maximum length of each tag
   * @default 100
   */
  maxTagLength?: number;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Placeholder text for the input
   */
  placeholder?: string;
  /**
   * Helper text displayed below the input
   */
  helperText?: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Whether the input is disabled
   */
  disabled?: boolean;
  /**
   * Optional className for custom styling
   */
  className?: string;
}

/**
 * TagInput Component
 * 
 * Dynamic tag-style input for adding/removing tags.
 * Based on RelatedPartsInput pattern with tag-specific features.
 * 
 * Sprint #13: Used in Profile Editing (Bio & Tags)
 * 
 * Features:
 * - Auto-normalize to lowercase
 * - Type tag → Press Enter or click "+" → Tag appears
 * - Click X on tag → Removes tag
 * - Shows count: "3 / 5 tags"
 * - Prevents duplicates (case-insensitive)
 * - Enforces max length per tag
 * 
 * @example
 * ```tsx
 * const [tags, setTags] = useState<string[]>([]);
 * 
 * <TagInput
 *   label="Tags"
 *   value={tags}
 *   onChangeValue={setTags}
 *   maxTags={5}
 *   maxTagLength={100}
 * />
 * ```
 */
export const TagInput: React.FC<TagInputProps> = ({
  label,
  value,
  onChangeValue,
  maxTags = 5,
  maxTagLength = 100,
  error,
  placeholder,
  helperText,
  required = false,
  disabled = false,
  className = '',
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');

  /**
   * Add a new tag to the list
   * Validations: non-empty, not duplicate, not exceed max, length check
   * Auto-normalizes to lowercase for consistency
   */
  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();
    
    // Validation: empty
    if (!trimmedValue) {
      return;
    }

    // Validation: max length
    if (trimmedValue.length > maxTagLength) {
      return;
    }

    // Normalize to lowercase for tags (consistent with backend)
    const normalizedTag = trimmedValue.toLowerCase();

    // Validation: duplicate (case-insensitive to prevent near-duplicates)
    if (value.some(tag => tag.toLowerCase() === normalizedTag)) {
      return;
    }

    // Validation: max limit
    if (value.length >= maxTags) {
      return;
    }

    // Add tag
    onChangeValue([...value, normalizedTag]);
    setInputValue(''); // Clear input
  };

  /**
   * Remove a tag from the list
   */
  const handleRemoveTag = (index: number) => {
    const newTags = value.filter((_, i) => i !== index);
    onChangeValue(newTags);
  };

  /**
   * Handle Enter key press
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const isAtMaxCapacity = value.length >= maxTags;

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium mb-2">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
          {value.length > 0 && (
            <span className="text-muted-foreground ml-2">
              ({value.length}/{maxTags})
            </span>
          )}
        </label>
      )}

      {/* Helper Text */}
      {helperText && (
        <BodyText size="small" className="text-muted-foreground mb-2">
          {helperText}
        </BodyText>
      )}

      {/* Input Row */}
      <div className="flex gap-2 mb-2">
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isAtMaxCapacity}
          className="flex-1"
        />
        <Button
          htmlType="button"
          variant="outline"
          className="h-10 border-primary/90"
          onPress={handleAddTag}
          disabled={!inputValue.trim() || isAtMaxCapacity || disabled}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('common.add') || 'Add'}
        </Button>
      </div>

      {/* Tags Display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-md min-h-[60px]">
          {value.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(index)}
                className="
                  bg-destructive/10
                  ml-1 rounded-full p-0.5 
                  hover:bg-destructive/70 
                  transition-colors
                "
                aria-label={`Remove ${tag}`}
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Counter + Messages */}
      <div className="flex items-center justify-between mt-2">
        <BodyText size="small" className="text-muted-foreground">
          {value.length} / {maxTags} {t('common.tags') || 'tags'}
        </BodyText>
        
        {isAtMaxCapacity && (
          <BodyText size="small" className="text-warning">
            {t('profile.edit.validation.tagsMaxCount', { max: maxTags })}
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
