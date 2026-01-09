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

// Maintenance Alarm contracts (Sprint #11)
export * from "./maintenance-alarm.contract";

// QuickCheck contracts
export * from "./quickcheck.contract";

// Notification contracts (Sprint #9)
export * from "./notification.contract";

// User Discovery contracts (Sprint #12 - Module 1)
// SSOT Architecture: PaginatedUsers es el tipo base, DiscoverUsersResponse = composición
// Use Cases retornan PaginatedUsers, Controllers envuelven en ApiResponse<PaginatedUsers>
export * from "./user-discovery.contract";

// Re-export DayOfWeek from domain for convenience
export { DayOfWeek } from "@packages/domain";