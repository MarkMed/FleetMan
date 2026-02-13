/**
 * Machine Type Suggestions
 * 
 * Lista de tipos de máquina comunes para sugerencias en UI (Combobox/Autocomplete).
 * 
 * IMPORTANTE: Esta lista es solo para UX - no limita lo que el usuario puede ingresar.
 * Los usuarios pueden escribir cualquier tipo personalizado (free-text 2-50 caracteres).
 * 
 * Casos de uso:
 * - Dropdown/Combobox en formulario de registro de máquina
 * - Autocompletado para agilizar entrada de datos
 * - Sugerencias en búsqueda/filtrado
 * 
 * Estrategia de contenido:
 * - Incluir tipos más comunes en industria de manejo de materiales
 * - Mantener nombres en español (mercado principal)
 * - Ordenar alfabéticamente para fácil localización
 * - Máximo 10-15 sugerencias (evitar overwhelm)
 */

export const MACHINE_TYPE_SUGGESTIONS = [
  'Apisonadora',
  'Autoelevador',
  'Carretilla Elevadora',
  'Excavadora',
  'Grúa',
  'Minicargadora',
  'Montacargas',
  'Pala Cargadora',
  'Plataforma Elevadora',
  'Retroexcavadora',
  'Tractor',
  'Transpaleta',
  'Zorra Hidráulica'
] as const;

/**
 * TODO: Feature estratégica - Sugerencias dinámicas basadas en tipos más usados
 * 
 * En lugar de lista hardcoded, consultar tipos más frecuentes del usuario/organización.
 * 
 * Beneficios:
 * - Personalización por industria (construcción vs logística)
 * - Aprende de patrones del usuario
 * - Reduce fricción en entrada repetitiva
 * 
 * Implementación:
 * - Endpoint: GET /api/v1/machines/type-suggestions?userId={id}&limit=10
 * - Agregación MongoDB: Agrupar por machineTypeName, contar, ordenar por frecuencia
 * - Caché en frontend (localStorage o React Query con staleTime largo)
 * - Fallback a MACHINE_TYPE_SUGGESTIONS si no hay datos
 * 
 * Ejemplo query:
 * ```typescript
 * const { data: suggestions } = useQuery({
 *   queryKey: ['machineTypeSuggestions', userId],
 *   queryFn: () => machineService.getTypeSuggestions(userId),
 *   staleTime: 1000 * 60 * 60 * 24, // 24 horas
 *   placeholderData: MACHINE_TYPE_SUGGESTIONS
 * });
 * ```
 */

/**
 * TODO: Feature estratégica - Sugerencias contextuales por sector
 * 
 * Diferentes listas según el sector/industria del usuario.
 * 
 * Ejemplo:
 * ```typescript
 * export const MACHINE_TYPE_SUGGESTIONS_BY_SECTOR = {
 *   CONSTRUCTION: ['Excavadora', 'Retroexcavadora', 'Bulldozer', 'Grúa torre'],
 *   LOGISTICS: ['Autoelevador', 'Transpaleta', 'Apilador', 'Carretilla'],
 *   AGRICULTURE: ['Tractor', 'Cosechadora', 'Sembradora', 'Pulverizadora'],
 *   MINING: ['Excavadora minera', 'Camión minero', 'Perforadora', 'Cargador frontal']
 * } as const;
 * ```
 * 
 * Uso:
 * ```typescript
 * const userSector = user.organization?.sector || 'CONSTRUCTION';
 * const suggestions = MACHINE_TYPE_SUGGESTIONS_BY_SECTOR[userSector] || MACHINE_TYPE_SUGGESTIONS;
 * ```
 */

/**
 * TODO: Feature estratégica - Aliases y búsqueda fuzzy
 * 
 * Mapear términos similares/sinónimos para mejorar búsqueda.
 * 
 * Ejemplo:
 * ```typescript
 * export const MACHINE_TYPE_ALIASES: Record<string, string[]> = {
 *   'Autoelevador': ['autoelevador', 'elevador', 'forklift', 'montacargas'],
 *   'Excavadora': ['excavadora', 'pala excavadora', 'excavator', 'retro'],
 *   'Grúa': ['grua', 'crane', 'grúa torre', 'grúa móvil']
 * };
 * ```
 * 
 * Búsqueda fuzzy con Fuse.js:
 * ```typescript
 * import Fuse from 'fuse.js';
 * 
 * const fuse = new Fuse(MACHINE_TYPE_SUGGESTIONS, {
 *   threshold: 0.3, // Tolerancia a errores de tipeo
 *   includeScore: true
 * });
 * 
 * const results = fuse.search(userInput); // "exca" → "Excavadora"
 * ```
 */
