// =============================================================================
// PERSISTENCE LAYER MODELS - Internal Mongoose Models
// =============================================================================
// These models are NOT exported from the package to maintain encapsulation
// Only repositories and mappers should use these models directly

// Export all Mongoose models for internal package use
export * from './user.model';
export * from './machine.model';
export * from './machine-type.model';
export * from './machine-event.model';
export * from './machine-event-type.model';
export * from './message.model'; // 🆕 Sprint #12 Module 3 - Message model
export * from './spare-part.model'; // 🆕 Sprint #15/16 Task 7.1 - Spare Part model

// Re-export commonly used types for convenience
export type { Document, Types } from 'mongoose';

// TODO: Future models to implement:
// - NotificationDocument & NotificationModel
// - MaintenanceReminderDocument & MaintenanceReminderModel  
// - QuickCheckDocument & QuickCheckModel
// - QuickCheckItemDocument & QuickCheckItemModel
// - InternalMessageDocument & InternalMessageModel
// - RepuestoDocument & RepuestoModel