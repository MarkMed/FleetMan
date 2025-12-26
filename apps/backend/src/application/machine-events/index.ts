/**
 * Machine Events Application Layer
 * 
 * Use Cases para sistema de eventos de máquina (Sprint #10)
 * 
 * Patrón:
 * - CreateMachineEventUseCase: Eventos reportados por usuario (crowdsourcing)
 * - GetMachineEventsHistoryUseCase: Historial paginado con filtros
 * - CreateMachineEventTypeUseCase: Tipos dinámicos (crowdsourcing como MachineType)
 * - SearchEventTypesUseCase: Autocomplete para UI
 * 
 * Arquitectura:
 * - Subdocumento pattern (Machine.eventsHistory) como QuickCheck
 * - Crowdsourcing pattern (MachineEventType) como MachineType
 * - Fire-and-forget para incremento de contadores
 * - NO genera notificaciones por defecto (evitar spam)
 */

export { CreateMachineEventUseCase } from './create-machine-event.use-case';
export { GetMachineEventsHistoryUseCase } from './get-machine-events-history.use-case';
export { CreateMachineEventTypeUseCase } from './create-machine-event-type.use-case';
export { SearchEventTypesUseCase } from './search-event-types.use-case';
export { UpdateEventTypeUseCase } from './update-event-type.use-case';
