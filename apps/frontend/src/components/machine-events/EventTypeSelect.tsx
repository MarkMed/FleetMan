import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { EventType } from '@services/api/machineEventService';
import { Spinner } from '@components/ui/Spinner';

interface EventTypeSelectProps {
  value: string;
  onChange: (typeId: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Precargados tipos de eventos (pasados desde el padre) */
  eventTypes: EventType[];
  /** Loading state para tipos de eventos */
  isLoadingTypes?: boolean;
  /** Callback para crear nuevo tipo (opcional - crowdsourcing) */
  onCreateType?: (name: string) => Promise<EventType>;
  /** Si está creando un nuevo tipo */
  isCreatingType?: boolean;
}

/**
 * Select dropdown optimizado para selección de tipo de evento
 *
 * OPTIMIZACIÓN: No hace llamadas API por keystroke
 * - Recibe tipos precargados como prop desde el padre
 * - Filtra localmente mientras el usuario escribe
 * - Dropdown simple con search incorporado
 * - Crowdsourcing: Crear nuevo tipo on-the-fly (opcional)
 * - Auto-asignación: Nuevo tipo creado queda seleccionado automáticamente
 *
 * Performance: 0 llamadas API durante búsqueda
 *
 * @example
 * ```tsx
 * // En el padre (ViewModel o Screen):
 * const { data: eventTypes = [], isLoading } = usePopularEventTypes(100, false);
 *
 * // En el componente:
 * <EventTypeSelect
 *   value={selectedTypeId}
 *   onChange={setTypeId}
 *   eventTypes={eventTypes}
 *   isLoadingTypes={isLoading}
 *   onCreateType={handleCreateType}
 * />
 * ```
 *
 * TODO: Características estratégicas futuras
 * - [ ] Agrupar tipos por categoría (Mecánico, Eléctrico, etc.)
 * - [ ] Mostrar badge de "Nuevo" para tipos creados recientemente
 * - [ ] Favoritos del usuario (estrella para marcar/desmarcar)
 * - [ ] Ordenamiento configurable (alfabético, más usados, reciente)
 * - [ ] Vista compacta vs expandida (con descripción de cada tipo)
 * - [ ] Multi-select para reportar múltiples tipos a la vez
 * - [ ] Sugerencias inteligentes basadas en máquina/historial
 */
export const EventTypeSelect: React.FC<EventTypeSelectProps> = ({
  value,
  onChange,
  error,
  placeholder,
  disabled = false,
  eventTypes = [],
  isLoadingTypes = false,
  onCreateType,
  isCreatingType = false,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // DEBUG: Log props received
  console.log('[EventTypeSelect] Props:', {
    eventTypesCount: eventTypes.length,
    isLoadingTypes,
    hasOnCreateType: !!onCreateType,
    isCreatingType,
    currentValue: value,
    sampleTypes: eventTypes.slice(0, 3).map(t => ({ id: t.id, name: t.name })),
  });

  // Filtrar tipos localmente
  const filteredTypes = searchTerm.trim()
    ? eventTypes.filter((type) =>
        type.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
      )
    : eventTypes;

  // Limitar resultados mostrados para performance
  const displayedTypes = filteredTypes.slice(0, 50);

  // Tipo seleccionado actual
  const selectedType = eventTypes.find((type) => type.id === value);
  const displayValue = selectedType?.name || '';

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset índice seleccionado cuando cambian resultados
  useEffect(() => {
    setSelectedIndex(0);
  }, [displayedTypes.length]);

  // Auto-scroll del item seleccionado con teclado
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const selectedElement = dropdownRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      selectedElement?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex, isOpen]);

  const handleSelect = (typeId: string) => {
    const selectedType = eventTypes.find(t => t.id === typeId);
    console.log('[EventTypeSelect.handleSelect] Type selected:', {
      typeId,
      typeName: selectedType?.name,
    });
    
    onChange(typeId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateNewType = async () => {
    if (!searchTerm.trim() || !onCreateType) return;

    console.log('[EventTypeSelect.handleCreateNewType] Creating new type:', searchTerm.trim());

    try {
      const newType = await onCreateType(searchTerm.trim());
      
      console.log('[EventTypeSelect.handleCreateNewType] New type created:', newType);
      console.log('[EventTypeSelect.handleCreateNewType] Auto-assigning type ID:', newType.id);
      
      // Auto-asignación: Nuevo tipo queda seleccionado automáticamente
      onChange(newType.id);
      setIsOpen(false);
      setSearchTerm('');
    } catch (error) {
      console.error('[EventTypeSelect.handleCreateNewType] Error creating event type:', error);
      // Error manejado por el callback del padre
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
        } else if (searchTerm.trim() && onCreateType) {
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

  const showCreateOption = searchTerm.trim() && 
                          displayedTypes.length === 0 && 
                          onCreateType;

  return (
    <div ref={containerRef} className="relative">
      {/* Input/Display */}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-2 pl-10 pr-10
            border rounded-lg text-left
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-white
            focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
            ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            ${isOpen ? 'ring-2 ring-primary-500' : ''}
          `}
        >
          <span className={displayValue ? '' : 'text-gray-500 dark:text-gray-400'}>
            {displayValue || placeholder || t('common.select')}
          </span>
        </button>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <ChevronDown
          className={`
            absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none
            transition-transform
            ${isOpen ? 'rotate-180' : ''}
          `}
        />
        {value && !isOpen && (
          <Check className="absolute right-10 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500 pointer-events-none" />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
          {/* Search input interno */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('machines.events.autocomplete.search', {
                defaultValue: 'Search event types...',
              })}
              autoFocus
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Lista de opciones */}
          <div ref={dropdownRef} className="max-h-60 overflow-y-auto">
            {isLoadingTypes ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size={32} />
              </div>
            ) : displayedTypes.length > 0 ? (
              <ul className="py-1">
                {displayedTypes.map((type, index) => (
                  <li key={type.id}>
                    <button
                      type="button"
                      data-index={index}
                      onClick={() => handleSelect(type.id)}
                      className={`
                        w-full px-4 py-2 text-left text-sm
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
                        <span className="truncate flex-1">{type.name}</span>
                        {type.timesUsed > 0 && (
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {type.timesUsed} {t('common.uses', { defaultValue: 'uses' })}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : showCreateOption ? (
              // No results - Ofrecer crear nuevo tipo
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
                  disabled={isCreatingType}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {isCreatingType ? (
                    <>
                      <Spinner size={16} />
                      <span>{t('common.creating')}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>
                        {t('machines.events.autocomplete.createNew', {
                          defaultValue: 'Create "{{term}}"',
                          term: searchTerm,
                        })}
                      </span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              // Empty state
              <div className="py-8 px-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm.trim()
                    ? t('machines.events.noResults', {
                        defaultValue: 'No results found',
                      })
                    : t('machines.events.noTypes', {
                        defaultValue: 'No event types available',
                      })}
                </p>
              </div>
            )}
          </div>

          {/* Footer info */}
          {!isLoadingTypes && displayedTypes.length > 0 && filteredTypes.length > 50 && (
            <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              {t('machines.events.showing', {
                defaultValue: 'Showing {{count}} of {{total}} types',
                count: displayedTypes.length,
                total: filteredTypes.length,
              })}
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};
