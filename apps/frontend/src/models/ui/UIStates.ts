// API State management types
export interface LoadingState {
  isLoading: true;
  error: null;
  data: null;
}

export interface ErrorState<TError = string> {
  isLoading: false;
  error: TError;
  data: null;
}

export interface SuccessState<TData> {
  isLoading: false;
  error: null;
  data: TData;
}

export type AsyncState<TData, TError = string> = LoadingState | ErrorState<TError> | SuccessState<TData>;

// Common UI states
export interface BaseUIState {
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
}

// Form field state
export interface FieldState<T> {
  value: T;
  error?: string;
  touched: boolean;
  focused: boolean;
}

// Modal states
export interface ModalState {
  isOpen: boolean;
  variant: 'info' | 'warning' | 'error' | 'success' | 'confirm';
  title?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// Toast notification states
export interface ToastState {
  id: string;
  variant: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  duration?: number;
  isVisible: boolean;
}

// Navigation states
export interface NavigationState {
  currentPath: string;
  previousPath?: string;
  canGoBack: boolean;
  isNavigating: boolean;
}

// Theme and preferences
export interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
}

// Pagination state
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Search and filter state
export interface SearchState {
  query: string;
  filters: Record<string, any>;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  resultsCount: number;
}

// Sidebar state
export interface SidebarState {
  isCollapsed: boolean;
  activeSection?: string;
  hoveredItem?: string;
}