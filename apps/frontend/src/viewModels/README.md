# ViewModels Directory

## Propósito
Implementa la capa de ViewModels en la arquitectura MVVM. Los ViewModels actúan como intermediarios entre las vistas (components/screens) y la lógica de negocio (useCases), proporcionando un estado observable y transformaciones de datos específicas para la UI.

## Concepto de ViewModel

### Responsabilidades
1. **Gestión de Estado de Vista**: Mantener el estado específico de cada pantalla
2. **Orquestación de Use Cases**: Coordinar múltiples casos de uso
3. **Transformación de Datos**: Adaptar datos del dominio para la UI
4. **Validación de Input**: Validar entrada del usuario antes de enviar a use cases
5. **Manejo de Estados Async**: Loading, error, success states

### Diferencia con Hooks
- **Hooks**: Funcionalidad específica y reutilizable
- **ViewModels**: Lógica completa de una pantalla específica
- **Hooks** son consumidos por **ViewModels**

## Estructura de Archivos

```
viewModels/
├── index.ts                    # Barrel exports
├── auth/
│   ├── LoginViewModel.ts       # ViewModel para pantalla de login
│   ├── RegisterViewModel.ts    # ViewModel para pantalla de registro
│   └── index.ts                # Exports de auth ViewModels
├── dashboard/
│   ├── DashboardViewModel.ts   # ViewModel para dashboard principal
│   ├── StatsViewModel.ts       # ViewModel para estadísticas
│   └── index.ts                # Exports de dashboard ViewModels
├── machines/
│   ├── MachinesListViewModel.ts # ViewModel para lista de máquinas
│   ├── MachineDetailViewModel.ts # ViewModel para detalle de máquina
│   ├── MachineFormViewModel.ts  # ViewModel para formulario de máquina
│   └── index.ts                # Exports de machines ViewModels
├── maintenance/
│   ├── MaintenanceListViewModel.ts # ViewModel para lista de mantenimientos
│   ├── MaintenanceCalendarViewModel.ts # ViewModel para calendario
│   ├── MaintenanceFormViewModel.ts # ViewModel para formulario
│   └── index.ts                # Exports de maintenance ViewModels
├── quickcheck/
│   ├── QuickCheckListViewModel.ts # ViewModel para lista de chequeos
│   ├── QuickCheckFormViewModel.ts # ViewModel para formulario de chequeo
│   └── index.ts                # Exports de quickcheck ViewModels
├── notifications/
│   ├── NotificationsViewModel.ts # ViewModel para centro de notificaciones
│   ├── NotificationSettingsViewModel.ts # ViewModel para configuración
│   └── index.ts                # Exports de notifications ViewModels
├── shared/
│   ├── BaseViewModel.ts        # Clase base para ViewModels
│   ├── ListViewModel.ts        # ViewModel base para listas
│   ├── FormViewModel.ts        # ViewModel base para formularios
│   └── index.ts                # Exports de shared ViewModels
└── types/
    ├── ViewModelTypes.ts       # Tipos comunes de ViewModels
    └── index.ts                # Exports de tipos
```

## ViewModels Planificados

### `LoginViewModel.ts`
**Responsabilidades**:
- Estado del formulario de login
- Validación de credenciales
- Manejo de errores de autenticación
- Navegación post-login

```typescript
export class LoginViewModel {
  // Estado observable
  private readonly _formData = signal<LoginFormData>({ email: '', password: '' });
  private readonly _isSubmitting = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  
  // Use Cases
  constructor(
    private loginUseCase: LoginUseCase,
    private navigationService: NavigationService
  ) {}
  
  // Getters reactivos
  get formData() { return this._formData.asReadonly(); }
  get isSubmitting() { return this._isSubmitting.asReadonly(); }
  get error() { return this._error.asReadonly(); }
  
  // Acciones
  async login() {
    this._isSubmitting.set(true);
    this._error.set(null);
    
    try {
      const result = await this.loginUseCase.execute(this._formData());
      if (result.isSuccess) {
        this.navigationService.navigateTo('/dashboard');
      } else {
        this._error.set(result.error.message);
      }
    } catch (error) {
      this._error.set('Error inesperado');
    } finally {
      this._isSubmitting.set(false);
    }
  }
  
  updateFormData(data: Partial<LoginFormData>) {
    this._formData.update(current => ({ ...current, ...data }));
  }
}
```

### `MachinesListViewModel.ts`
**Responsabilidades**:
- Lista paginada de máquinas
- Filtros y búsqueda
- Acciones en lote
- Estados de carga y error

```typescript
export class MachinesListViewModel extends ListViewModel<Machine> {
  private readonly _filters = signal<MachineFilters>({});
  private readonly _selectedMachines = signal<string[]>([]);
  
  constructor(
    private getMachinesUseCase: GetMachinesUseCase,
    private deleteMachineUseCase: DeleteMachineUseCase
  ) {
    super();
  }
  
  get filters() { return this._filters.asReadonly(); }
  get selectedMachines() { return this._selectedMachines.asReadonly(); }
  
  async loadMachines() {
    await this.loadItems(() => 
      this.getMachinesUseCase.execute({
        filters: this._filters(),
        pagination: this.pagination()
      })
    );
  }
  
  updateFilters(filters: Partial<MachineFilters>) {
    this._filters.update(current => ({ ...current, ...filters }));
    this.resetPagination();
    this.loadMachines();
  }
  
  async deleteMachine(id: string) {
    const result = await this.deleteMachineUseCase.execute(id);
    if (result.isSuccess) {
      this.removeItem(id);
    }
    return result;
  }
}
```

### `DashboardViewModel.ts`
**Responsabilidades**:
- Métricas y estadísticas del dashboard
- Datos agregados de múltiples dominios
- Refresh automático de datos
- Accesos rápidos

```typescript
export class DashboardViewModel {
  private readonly _stats = signal<DashboardStats | null>(null);
  private readonly _recentActivity = signal<ActivityItem[]>([]);
  private readonly _isLoading = signal<boolean>(true);
  
  constructor(
    private getDashboardStatsUseCase: GetDashboardStatsUseCase,
    private getRecentActivityUseCase: GetRecentActivityUseCase
  ) {}
  
  get stats() { return this._stats.asReadonly(); }
  get recentActivity() { return this._recentActivity.asReadonly(); }
  get isLoading() { return this._isLoading.asReadonly(); }
  
  async loadDashboardData() {
    this._isLoading.set(true);
    
    try {
      const [statsResult, activityResult] = await Promise.all([
        this.getDashboardStatsUseCase.execute(),
        this.getRecentActivityUseCase.execute()
      ]);
      
      if (statsResult.isSuccess) {
        this._stats.set(statsResult.value);
      }
      
      if (activityResult.isSuccess) {
        this._recentActivity.set(activityResult.value);
      }
    } finally {
      this._isLoading.set(false);
    }
  }
  
  // Auto-refresh cada 5 minutos
  startAutoRefresh() {
    return setInterval(() => this.loadDashboardData(), 5 * 60 * 1000);
  }
}
```

## Base Classes

### `BaseViewModel.ts`
**Propósito**: Funcionalidad común para todos los ViewModels

```typescript
export abstract class BaseViewModel {
  protected readonly _isLoading = signal<boolean>(false);
  protected readonly _error = signal<string | null>(null);
  
  get isLoading() { return this._isLoading.asReadonly(); }
  get error() { return this._error.asReadonly(); }
  
  protected setLoading(loading: boolean) {
    this._isLoading.set(loading);
  }
  
  protected setError(error: string | null) {
    this._error.set(error);
  }
  
  protected async executeWithLoading<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    this.setLoading(true);
    this.setError(null);
    
    try {
      return await operation();
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Error desconocido');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }
}
```

### `ListViewModel.ts`
**Propósito**: Funcionalidad común para listas paginadas

```typescript
export abstract class ListViewModel<T> extends BaseViewModel {
  protected readonly _items = signal<T[]>([]);
  protected readonly _pagination = signal<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  get items() { return this._items.asReadonly(); }
  get pagination() { return this._pagination.asReadonly(); }
  
  protected async loadItems(
    loader: () => Promise<PaginatedResponse<T>>
  ) {
    return this.executeWithLoading(async () => {
      const response = await loader();
      this._items.set(response.data);
      this._pagination.set(response.pagination);
    });
  }
  
  async nextPage() {
    const current = this._pagination();
    if (current.page < current.totalPages) {
      this._pagination.update(p => ({ ...p, page: p.page + 1 }));
      await this.refresh();
    }
  }
  
  async previousPage() {
    const current = this._pagination();
    if (current.page > 1) {
      this._pagination.update(p => ({ ...p, page: p.page - 1 }));
      await this.refresh();
    }
  }
  
  abstract refresh(): Promise<void>;
}
```

## Integración con React

### Hook Pattern
```typescript
export const useLoginViewModel = () => {
  const viewModel = useMemo(() => new LoginViewModel(
    container.get(LoginUseCase),
    container.get(NavigationService)
  ), []);
  
  return viewModel;
};
```

### Component Usage
```typescript
export const LoginScreen: React.FC = () => {
  const viewModel = useLoginViewModel();
  
  const formData = useSignal(viewModel.formData);
  const isSubmitting = useSignal(viewModel.isSubmitting);
  const error = useSignal(viewModel.error);
  
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    await viewModel.login();
  }, [viewModel]);
  
  return (
    <form onSubmit={handleSubmit}>
      {/* UI components */}
    </form>
  );
};
```

## Principios de Desarrollo

### 1. Single Responsibility
- Un ViewModel por pantalla principal
- Separar concerns complejos en múltiples ViewModels
- Composición sobre herencia cuando sea apropiado

### 2. Observable State
- Usar signals para estado observable
- Immutable updates
- Granular subscriptions

### 3. Separation of Concerns
- ViewModels no conocen detalles de UI
- UI no conoce detalles de negocio
- Use Cases encapsulan lógica de dominio

### 4. Testability
- ViewModels fáciles de testear unitariamente
- Mocking de dependencies con DI
- Estado observable facilita testing

## Testing

### Unit Tests
```typescript
describe('LoginViewModel', () => {
  let viewModel: LoginViewModel;
  let mockLoginUseCase: jest.Mocked<LoginUseCase>;
  let mockNavigationService: jest.Mocked<NavigationService>;
  
  beforeEach(() => {
    mockLoginUseCase = createMockLoginUseCase();
    mockNavigationService = createMockNavigationService();
    viewModel = new LoginViewModel(mockLoginUseCase, mockNavigationService);
  });
  
  test('should login successfully', async () => {
    // Setup
    mockLoginUseCase.execute.mockResolvedValue(Success(mockUser));
    viewModel.updateFormData({ email: 'test@test.com', password: 'password' });
    
    // Execute
    await viewModel.login();
    
    // Verify
    expect(mockLoginUseCase.execute).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password'
    });
    expect(mockNavigationService.navigateTo).toHaveBeenCalledWith('/dashboard');
  });
});
```

## Convenciones

### Nomenclatura
- ViewModels: `{Screen}ViewModel.ts`
- Hooks: `use{Screen}ViewModel`
- Methods: verbos en presente (`login`, `updateData`)

### Dependency Injection
- Usar un DI container para resolver dependencies
- Inyectar Use Cases y Services en constructor
- Facilitar testing con mocking