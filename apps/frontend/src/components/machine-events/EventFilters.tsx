import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button, InputField, Select } from '@components/ui';
import { Filter, X } from 'lucide-react';
import type { GetEventsQuery } from '@services/api/machineEventService';

/**
 * EventFilters Component
 * 
 * Filter controls for machine events list.
 * Filters: system/manual, date range, search term.
 * 
 * @param filters - Current filter values
 * @param onFiltersChange - Callback when filters change (receives partial filter object)
 * @param onClear - Callback to clear all filters
 * 
 * @example
 * ```tsx
 * <EventFilters
 *   filters={vm.state.filters}
 *   onFiltersChange={vm.actions.handleFiltersChange}
 *   onClear={vm.actions.handleClearFilters}
 * />
 * ```
 */

interface EventFiltersProps {
  filters: GetEventsQuery;
  onFiltersChange: (filters: Partial<GetEventsQuery>) => void;
  onClear: () => void;
}

export function EventFilters({ filters, onFiltersChange, onClear }: EventFiltersProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = 
    filters.isSystemGenerated !== undefined ||
    filters.startDate !== undefined ||
    filters.endDate !== undefined ||
    (filters.searchTerm && filters.searchTerm.length > 0);

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">{t('machines.events.filters.title')}</span>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onPress={onClear}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              {t('common.clear')}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onPress={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? t('common.collapse') : t('common.expand')}
          </Button>
        </div>
      </div>

      {/* Quick Filters (always visible) */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Button
          variant={filters.isSystemGenerated === undefined ? 'filled' : 'outline'}
          size="sm"
          onPress={() => onFiltersChange({ isSystemGenerated: undefined })}
        >
          {t('machines.events.filters.all')}
        </Button>
        <Button
          variant={filters.isSystemGenerated === false ? 'filled' : 'outline'}
          size="sm"
          onPress={() => onFiltersChange({ isSystemGenerated: false })}
        >
          {t('machines.events.filters.manual')}
        </Button>
        <Button
          variant={filters.isSystemGenerated === true ? 'filled' : 'outline'}
          size="sm"
          onPress={() => onFiltersChange({ isSystemGenerated: true })}
        >
          {t('machines.events.filters.system')}
        </Button>
      </div>

      {/* Advanced Filters (collapsible) */}
      {isExpanded && (
        <div className="space-y-3 pt-3 border-t">
          {/* Search Input */}
          <InputField
            label={t('machines.events.filters.search')}
            placeholder={t('machines.events.filters.searchPlaceholder')}
            value={filters.searchTerm || ''}
            onChangeText={(value) => onFiltersChange({ searchTerm: value || undefined })}
          />

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <InputField
              type="date"
              label={t('machines.events.filters.startDate')}
              value={filters.startDate || ''}
              onChangeText={(value) => onFiltersChange({ startDate: value || undefined })}
            />
            <InputField
              type="date"
              label={t('machines.events.filters.endDate')}
              value={filters.endDate || ''}
              onChangeText={(value) => onFiltersChange({ endDate: value || undefined })}
            />
          </div>

          {/* Sort */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              label={t('machines.events.filters.sortBy')}
              value={filters.sortBy || 'createdAt'}
              onValueChange={(value) => onFiltersChange({ sortBy: value as any })}
              options={[
                { value: 'createdAt', label: t('machines.events.filters.sortByDate') },
                { value: 'title', label: t('machines.events.filters.sortByTitle') },
              ]}
            />
            <Select
              label={t('machines.events.filters.sortOrder')}
              value={filters.sortOrder || 'desc'}
              onValueChange={(value) => onFiltersChange({ sortOrder: value as any })}
              options={[
                { value: 'desc', label: t('machines.events.filters.newest') },
                { value: 'asc', label: t('machines.events.filters.oldest') },
              ]}
            />
          </div>
        </div>
      )}
    </Card>
  );
}

// TODO: Strategic feature - Event type filter
// Add autocomplete for filtering by specific event type:
// <EventTypeAutocomplete
//   value={filters.typeId}
//   onChange={(typeId) => onFiltersChange({ typeId })}
//   placeholder={t('machines.events.filters.selectType')}
//   allowClear
// />
