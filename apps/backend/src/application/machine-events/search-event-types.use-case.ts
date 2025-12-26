import { MachineEventTypeRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import type { MachineEventType } from '@packages/domain';

/**
 * Use Case: Buscar tipos de eventos para autocomplete
 * 
 * Responsabilidades:
 * 1. Buscar tipos de eventos por término (case-insensitive)
 * 2. Ordenar por popularidad (timesUsed descendente)
 * 3. Filtrar solo tipos activos
 * 4. Limitar resultados para performance
 * 
 * Propósito:
 * - Autocomplete en UI mientras usuario escribe
 * - Sugerencias inteligentes basadas en popularidad
 * - Respuesta rápida (<100ms)
 * 
 * Patrón:
 * - Thin wrapper del repositorio
 * - Cache-friendly (resultados cacheable por término)
 * - NO requiere autenticación (público)
 */
export class SearchEventTypesUseCase {
  private eventTypeRepository: MachineEventTypeRepository;

  constructor() {
    this.eventTypeRepository = new MachineEventTypeRepository();
  }

  /**
   * Ejecuta búsqueda de tipos de eventos
   * 
   * @param query - Término de búsqueda (búsqueda en normalizedName)
   * @param limit - Máximo de resultados (default: 10)
   * @param includeSystem - Incluir tipos generados por sistema (default: true)
   * 
   * @returns Promise con array de tipos ordenados por popularidad
   */
  async execute(
    query: string,
    limit: number = 10,
    includeSystem: boolean = true
  ): Promise<MachineEventType[]> {
    logger.debug({ 
      query, 
      limit,
      includeSystem
    }, 'Searching machine event types');

    try {
      // 1. Normalizar query
      const normalizedQuery = query.toLowerCase().trim();

      if (!normalizedQuery) {
        // Query vacío: retornar tipos más populares
        const popularTypes = await this.eventTypeRepository.findMostUsed(limit);
        
        if (!includeSystem) {
          return popularTypes.filter(type => !type.systemGenerated);
        }
        
        return popularTypes;
      }

      // 2. Buscar tipos que coincidan con el query
      const matchingTypes = await this.eventTypeRepository.searchByTerm(normalizedQuery, limit * 2);

      // 3. Filtrar tipos de sistema si es necesario
      let filteredTypes = matchingTypes;
      if (!includeSystem) {
        filteredTypes = matchingTypes.filter(type => !type.systemGenerated);
      }

      // 4. Limitar resultados
      const results = filteredTypes.slice(0, limit);

      logger.debug({ 
        query,
        resultsFound: results.length
      }, 'Event types search completed');

      return results;

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        query
      }, 'Event types search failed');
      
      // No throw: retornar array vacío en caso de error (UX graceful degradation)
      return [];
    }
  }

  // ============================================================================
  // MÉTODOS ESTRATÉGICOS (Comentados para futuras features)
  // ============================================================================

  /**
   * TODO: Búsqueda con ML fuzzy matching (tolerancia a typos)
   * 
   * @param query - Término con posibles typos
   * @param limit - Máximo de resultados
   * @returns Promise con tipos ordenados por relevancia
   * 
   * Propósito:
   * - Usuario escribe "mantenimient" (falta 'o') → encontrar "Mantenimiento"
   * - Usuario escribe "reparacion" (sin tilde) → encontrar "Reparación"
   * - Mejora UX con búsqueda tolerante a errores
   * 
   * Algoritmos:
   * - Levenshtein distance (distancia de edición)
   * - Soundex (similitud fonética)
   * - N-grams (similitud de subcadenas)
   * 
   * Implementación:
   * async searchFuzzy(
   *   query: string,
   *   limit: number = 10,
   *   threshold: number = 0.7
   * ): Promise<Array<{ type: MachineEventType; score: number }>> {
   *   // 1. Obtener todos los tipos activos
   *   // 2. Calcular score de similitud con cada tipo
   *   // 3. Filtrar por threshold (>= 0.7)
   *   // 4. Ordenar por score descendente
   *   // 5. Retornar top N con score
   * }
   */

  /**
   * TODO: Autocompletado contextual basado en últimos eventos
   * 
   * @param query - Término de búsqueda
   * @param userId - ID del usuario
   * @param limit - Máximo de resultados
   * @returns Promise con tipos personalizados
   * 
   * Propósito:
   * - Priorizar tipos que el usuario ha usado recientemente
   * - Aprendizaje de preferencias del usuario
   * 
   * Lógica:
   * 1. Obtener últimos 20 eventos creados por usuario (en todas las máquinas)
   * 2. Extraer tipos más frecuentes del usuario
   * 3. Combinar con búsqueda global
   * 4. Retornar: Tipos del usuario primero, luego tipos globales
   * 
   * Ejemplo:
   * - Usuario A siempre reporta "Mantenimiento Preventivo" y "Lubricación"
   * - Usuario A busca "man" → "Mantenimiento Preventivo" primero (personalizado)
   * - Usuario B busca "man" → "Mantenimiento Correctivo" primero (global popular)
   * 
   * Implementación:
   * async searchContextual(
   *   query: string,
   *   userId: string,
   *   limit: number = 10
   * ): Promise<MachineEventType[]> {
   *   // 1. Buscar eventos recientes del usuario (aggregation en todas las máquinas)
   *   // 2. Contar frecuencia de tipos usados por usuario
   *   // 3. Buscar tipos que coincidan con query
   *   // 4. Ordenar: Frecuencia usuario * timesUsed global
   *   // 5. Retornar top N personalizados
   * }
   */

  /**
   * TODO: Trending types (tipos en tendencia)
   * 
   * @param period - Período de análisis ('7d', '30d', '90d')
   * @param limit - Máximo de resultados
   * @returns Promise con tipos en tendencia
   * 
   * Propósito:
   * - Detectar tipos con crecimiento rápido en uso
   * - Dashboard admin: "Tipos más reportados este mes"
   * - Insights de industria: "¿Qué están reportando otros?"
   * 
   * Lógica:
   * - Comparar timesUsed actual vs período anterior
   * - Calcular tasa de crecimiento (%)
   * - Ordenar por mayor crecimiento
   * 
   * Ejemplo:
   * - "Rotura de motor" pasó de 10 usos a 50 usos en 30 días (400% crecimiento)
   * - Dashboard muestra alerta: "Aumento de roturas de motor en la flota"
   * - Admin puede investigar causa común
   * 
   * Implementación:
   * async getTrendingTypes(
   *   period: '7d' | '30d' | '90d',
   *   limit: number = 10
   * ): Promise<Array<{
   *   type: MachineEventType;
   *   currentUsage: number;
   *   previousUsage: number;
   *   growthRate: number;
   * }>> {
   *   // Requiere tracking histórico de timesUsed
   *   // Alternativa: Analizar timestamps de eventos createdAt
   *   // Contar eventos por tipo en período actual vs anterior
   * }
   */

  /**
   * TODO: Sugerencias por categoría/contexto
   * 
   * @param category - Categoría de sugerencias ('maintenance', 'incident', 'routine')
   * @param limit - Máximo de resultados
   * @returns Promise con tipos relevantes a la categoría
   * 
   * Propósito:
   * - UI con tabs: "Mantenimiento" | "Incidentes" | "Rutina"
   * - Usuario selecciona categoría → ve tipos relevantes
   * 
   * Categorías:
   * - Maintenance: "Mantenimiento Preventivo", "Lubricación", "Cambio de aceite"
   * - Incident: "Rotura", "Falla eléctrica", "Sobrecalentamiento"
   * - Routine: "Inspección diaria", "Limpieza", "Check previo"
   * 
   * Requiere:
   * - Agregar campo 'category' a MachineEventType (enum)
   * - O inferir categoría por keywords en nombre (ML classification)
   * 
   * Implementación:
   * async getByCategory(
   *   category: 'maintenance' | 'incident' | 'routine',
   *   limit: number = 10
   * ): Promise<MachineEventType[]> {
   *   // Opción 1: Filtrar por campo category (si existe)
   *   // Opción 2: Keywords matching (ML básico)
   *   // Opción 3: Clasificación manual de tipos populares
   * }
   */
}
