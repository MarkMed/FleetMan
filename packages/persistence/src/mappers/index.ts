// =============================================================================
// DOCUMENT ↔ DOMAIN MAPPERS
// =============================================================================
// Mappers to convert between Mongoose Documents and Domain Entities
// Maintains separation between persistence layer and domain layer

export * from './machine.mapper';
export * from './notification.mapper';
export * from './machine-event.mapper'; // 🆕 Sprint #10: Subdocument mapper

// TODO: Implement remaining domain mappers:
// export * from './user.mapper';
// export * from './machine-event-type.mapper'; // NO necesario (conversion inline en repo, como MachineType)
// export * from './maintenance-reminder.mapper';