// =============================================================================
// DOCUMENT ↔ DOMAIN MAPPERS
// =============================================================================
// Mappers to convert between Mongoose Documents and Domain Entities
// Maintains separation between persistence layer and domain layer

export * from './machine.mapper';
export * from './notification.mapper';

// TODO: Implement remaining domain mappers:
// export * from './user.mapper';
// export * from './machine-event.mapper';
// export * from './machine-event-type.mapper';
// export * from './maintenance-reminder.mapper';