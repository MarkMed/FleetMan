// Auth contracts
export * from "./auth.contract";

// Common types
export * from "./common.types";

// User contracts
export * from "./user.contract";

// Machine contracts
export * from "./machine.contract";

// Machine Registration contracts
export * from "./machine-registration.contract";

// Machine Type contracts
export * from "./machine-type.contract";

// Machine Event Type contracts
export * from "./machine-event-type.contract";

// Machine Event contracts
export * from "./machine-event.contract";

// Dashboard contracts
export * from "./dashboard.contract";

// Maintenance Alarm contracts (Sprint #11)
export * from "./maintenance-alarm.contract";

// Spare Part contracts (Sprint #15/16 Task 7.1)
export * from "./spare-part.contract";

// QuickCheck contracts
export * from "./quickcheck.contract";

// Notification contracts (Sprint #9)
export * from "./notification.contract";

// User Discovery contracts (Sprint #12 - Module 1)
// SSOT Architecture: PaginatedUsers es el tipo base, DiscoverUsersResponse = composición
// Use Cases retornan PaginatedUsers, Controllers envuelven en ApiResponse<PaginatedUsers>
export * from "./user-discovery.contract";

// Contact Management contracts (Sprint #12 - Module 2)
export * from "./contact.contract";

// Message contracts (Sprint #12 - Module 3 - Messaging System)
// SSOT Architecture: ConversationHistoryResponse es el tipo base
// Use Cases retornan ConversationHistoryResponse, Controllers envuelven en ApiResponse<ConversationHistoryResponse>
export * from "./message.contract";

// User Statistics contracts (Sprint #12 - User Stats Feature)
export * from "./user-stats.contract";

// Re-export DayOfWeek from domain for convenience
export { DayOfWeek } from "@packages/domain";