import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '@hooks/useDebounce';
import {
  useEventTypes,
  usePopularEventTypes,
  useCreateEventType,
} from '@hooks/useMachineEvents';
import { Spinner } from '@components/ui/Spinner';

interface EventTypeAutocompleteProps {
  value: string;
  onChange: (typeId: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Autocomplete input for event type selection with crowdsourcing
 *
 * Features:
 * - Search existing event types with debounced search
 * - Display popular types when input is empty
 * - Create new event type on-the-fly (crowdsourcing)
 * - Keyboard navigation (Arrow Up/Down, Enter, Escape)
 * - Click outside to close dropdown
 *
 * Pattern: Get-or-Create (backend handles deduplication)
 *
 * @example
 * <EventTypeAutocomplete
 *   value={selectedTypeId}
 *   onChange={(typeId) => setValue('typeId', typeId)}
 *   error={errors.typeId?.message}
 * />
 */
export const EventTypeAutocomplete: React.FC<EventTypeAutocompleteProps> = ({
  value,
  onChange,
  error,
  placeholder = 'Search event types...',
  disabled = false,
}) => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Queries
  const {
    data: searchResults = [],
    isLoading: isSearching,
  } = useEventTypes(debouncedSearch);

  const {
    data: popularTypes = [],
    isLoading: isLoadingPopular,
  } = usePopularEventTypes(10);

  const createTypeMutation = useCreateEventType();

  // Display search results if searching, otherwise popular types
  const displayedTypes = debouncedSearch.length > 0 ? searchResults : popularTypes;
  const isLoading = debouncedSearch.length > 0 ? isSearching : isLoadingPopular;

  // Selected type display name
  const selectedType = displayedTypes.find((type) => type.id === value);
  const displayValue = selectedType?.name || '';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selected index when dropdown opens/closes or results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [isOpen, displayedTypes.length]);

  const handleSelect = (typeId: string) => {
    onChange(typeId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateNewType = async () => {
    if (!searchTerm.trim()) return;

    try {
      const newType = await createTypeMutation.mutateAsync({
        name: searchTerm.trim(),
        language: i18n.language, // ES or EN
      });
      onChange(newType.id);
      setIsOpen(false);
      setSearchTerm('');
    } catch (error) {
      console.error('Error creating event type:', error);
      // Error is handled by mutation's onError callback
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < displayedTypes.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (displayedTypes.length > 0 && displayedTypes[selectedIndex]) {
          handleSelect(displayedTypes[selectedIndex].id);
        } else if (searchTerm.trim()) {
          handleCreateNewType();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : displayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-2 pl-10 pr-4
            border rounded-lg
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-white
            placeholder-gray-500 dark:placeholder-gray-400
            focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
          `}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        {value && (
          <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size={32} />
            </div>
          ) : displayedTypes.length > 0 ? (
            <ul className="py-1">
              {displayedTypes.map((type, index) => (
                <li key={type.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(type.id)}
                    className={`
                      w-full px-4 py-2 text-left
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      transition-colors
                      ${
                        index === selectedIndex
                          ? 'bg-gray-100 dark:bg-gray-700'
                          : ''
                      }
                      ${
                        type.id === value
                          ? 'text-primary-600 dark:text-primary-400 font-medium'
                          : 'text-gray-900 dark:text-white'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{type.name}</span>
                      {type.timesUsed > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {type.timesUsed} {t('common.uses')}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : searchTerm.trim() ? (
            // No results - offer to create new type
            <div className="py-4 px-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {t('machines.events.noTypeFound', {
                  defaultValue: 'No event type found for "{{term}}"',
                  term: searchTerm,
                })}
              </p>
              <button
                type="button"
                onClick={handleCreateNewType}
                disabled={createTypeMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {createTypeMutation.isPending ? (
                  <Spinner size={16} />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {t('machines.events.createNewType', {
                  defaultValue: 'Create "{{term}}"',
                  term: searchTerm.trim(),
                })}
              </button>
            </div>
          ) : (
            <div className="py-4 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
              {t('machines.events.startTyping', {
                defaultValue: 'Start typing to search or create event types',
              })}
            </div>
          )}
        </div>
      )}

      {/* TODO: Add recently used types section */}
      {/* TODO: Add category/tags for event types */}
    </div>
  );
};
