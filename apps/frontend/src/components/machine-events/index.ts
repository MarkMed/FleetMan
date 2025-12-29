/**
 * Barrel Export: Machine Events Components
 * 
 * Centralized exports for all machine event related components.
 */

export { EventsList } from './EventsList';
export { EventItem } from './EventItem';
export { EventFilters } from './EventFilters';
export { EventDetailModal } from './EventDetailModal';
export { EventTypeSelect } from './EventTypeSelect'; // Dropdown optimizado (sin API calls por keystroke)
export { EventTypeAutocomplete } from './EventTypeAutocomplete'; // @deprecated - Mantener por compatibilidad, usar EventTypeSelect
export { ReportEventModal } from './ReportEventModal';
