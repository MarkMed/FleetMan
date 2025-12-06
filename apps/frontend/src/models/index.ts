// Domain models and contracts
export * from '@contracts';

// Form specific types
export * from './forms';

// UI specific types  
export * from './ui';

// Base types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// User related types
export interface User extends BaseEntity {
  email: string;
  name: string;
  phone?: string;
  role: 'client' | 'provider' | 'admin';
  isActive: boolean;
  lastLoginAt?: string;
}

export interface ClientUser extends User {
  role: 'client';
  companyName?: string;
  address?: string;
  providerUsers?: ProviderUser[];
}

export interface ProviderUser extends User {
  role: 'provider';
  businessName: string;
  serviceAreas: string[];
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
    whatsapp?: string;
  };
  clients?: ClientUser[];
}

// Machine related types
export interface MachineType extends BaseEntity {
  name: string;
  brand: string;
  category: string;
  specifications?: Record<string, any>;
}

export interface Machine extends BaseEntity {
  serialNumber: string;
  model: string;
  brand: string;
  year?: number;
  location?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'broken';
  ownerId: string; // ClientUser ID
  managedById?: string; // ProviderUser ID (if managed by provider)
  contactProviderId?: string; // ProviderUser ID for contact
  machineTypeId?: string;
  specifications?: Record<string, any>;
  purchaseDate?: string;
  warrantyExpiry?: string;
  hoursUsed?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  notes?: string;
}

// Maintenance related types
export interface MaintenanceReminder extends BaseEntity {
  machineId: string;
  title: string;
  description?: string;
  type: 'time' | 'hours' | 'both';
  intervalDays?: number;
  intervalHours?: number;
  lastExecutedAt?: string;
  nextDueDate?: string;
  nextDueHours?: number;
  isActive: boolean;
  createdById: string;
}

// Event related types
export interface MachineEvent extends BaseEntity {
  machineId: string;
  type: 'maintenance' | 'breakdown' | 'inspection' | 'repair' | 'quickcheck' | 'reminder' | 'manual';
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  hoursAtEvent?: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  cost?: number;
  performedById: string;
  relatedReminderId?: string;
  quickCheckData?: QuickCheckExecution;
  attachments?: string[];
  notes?: string;
}

// QuickCheck related types
export interface QuickCheckItem extends BaseEntity {
  quickCheckId: string;
  title: string;
  description?: string;
  order: number;
  isRequired: boolean;
}

export interface QuickCheck extends BaseEntity {
  machineId: string;
  title: string;
  description?: string;
  items: QuickCheckItem[];
  isActive: boolean;
  createdById: string;
}

export interface QuickCheckItemResult {
  itemId: string;
  status: 'ok' | 'fail' | 'omit';
  notes?: string;
}

export interface QuickCheckExecution extends BaseEntity {
  quickCheckId: string;
  machineId: string;
  executedById: string;
  results: QuickCheckItemResult[];
  overallStatus: 'passed' | 'failed' | 'partial';
  notes?: string;
  executedAt: string;
}

// Notification related types
export interface Notification extends BaseEntity {
  userId: string;
  type: 'maintenance_due' | 'maintenance_overdue' | 'quickcheck_failed' | 'machine_down' | 'reminder' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  relatedEntityType?: 'machine' | 'maintenance_reminder' | 'quickcheck' | 'event';
  relatedEntityId?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Legacy auth state (consider moving to ui/AuthStates.ts in future)
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}