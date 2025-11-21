// =============================================================================
// PERSISTENCE LAYER ENTRY POINT
// =============================================================================
// This package provides concrete persistence implementations for the domain

// Export concrete repository implementations
export * from "./repositories";

// Export models for scripts and utilities (seeds, migrations, etc.)
export * from "./models";

// TODO: Export mappers when implemented  
// export * from "./mappers";

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