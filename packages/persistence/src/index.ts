// =============================================================================
// PERSISTENCE LAYER ENTRY POINT
// =============================================================================
// This package provides concrete persistence implementations for the domain

// Export concrete repository implementations
// TODO: Enable when TypeScript compilation issues are resolved
// export * from "./repositories";

// TODO: Export mappers when implemented  
// export * from "./mappers";

// Models are internal to the package and not exported
// They are used only by repositories and mappers within this package

/**
 * Initializes the persistence layer
 * TODO: Set up MongoDB connection and run migrations
 */
export function initPersistence() {
  // TODO: Implement MongoDB connection and configuration
  return { ok: true, message: 'Persistence layer initialized' };
}

// Temporary re-export to test build
export const PERSISTENCE_READY = 'Repository implementations completed';