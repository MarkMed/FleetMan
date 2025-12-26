import { UserId, MachineEventType } from '@packages/domain';
import { MachineEventTypeRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';

/**
 * Use Case: Crear o obtener tipo de evento de máquina (patrón crowdsourcing)
 * 
 * Responsabilidades:
 * 1. Normalizar nombre del tipo (lowercase, trim)
 * 2. Verificar si tipo ya existe (case-insensitive)
 * 3. Si existe: retornar tipo existente
 * 4. Si no existe: crear nuevo tipo (crowdsourcing)
 * 
 * Patrón Crowdsourcing:
 * - Idéntico a CreateMachineTypeUseCase
 * - Usuarios crean tipos dinámicamente según necesidad
 * - Previene duplicados con normalizedName
 * - No requiere permisos especiales (todos pueden crear)
 * 
 * Ejemplo:
 * - Usuario A crea "Mantenimiento Preventivo"
 * - Usuario B escribe "mantenimiento preventivo" (minúsculas) → reutiliza tipo de A
 * - Usuario C escribe "Reparación" → crea nuevo tipo
 * - Todos los usuarios ahora tienen ambos tipos disponibles
 */
export class CreateMachineEventTypeUseCase {
  private eventTypeRepository: MachineEventTypeRepository;

  constructor() {
    this.eventTypeRepository = new MachineEventTypeRepository();
  }

  /**
   * Ejecuta el caso de uso de crear/obtener tipo de evento
   * 
   * @param name - Nombre del tipo de evento (e.g., "Mantenimiento Preventivo")
   * @param userId - ID del usuario creando el tipo (desde JWT)
   * @param language - Código de idioma ISO 639-1 (default: 'es')
   * @param systemGenerated - Si es tipo generado por sistema (default: false)
   * 
   * @returns Promise con el tipo de evento (existente o recién creado)
   */
  async execute(
    name: string,
    userId: string,
    language: string = 'es',
    systemGenerated: boolean = false
  ): Promise<MachineEventType> {
    logger.info({ 
      name, 
      userId,
      language,
      systemGenerated
    }, 'Creating or retrieving machine event type');

    try {
      // 1. Validar userId (solo para tipos user-generated)
      let userIdVO = null;
      if (!systemGenerated) {
        const userIdResult = UserId.create(userId);
        if (!userIdResult.success) {
          throw new Error(`Invalid user ID format: ${userIdResult.error.message}`);
        }
        userIdVO = userIdResult.data;
      }

      // 2. Normalizar nombre para búsqueda case-insensitive
      const normalizedName = name.toLowerCase().trim();

      // 3. Verificar si tipo ya existe
      const existingType = await this.eventTypeRepository.findByNormalizedName(normalizedName);

      if (existingType.success) {
        const eventType = existingType.data;
        
        // 3a. Tipo existe: Agregar idioma si no lo tiene
        if (!eventType.languages.includes(language)) {
          eventType.addLanguage(language);
          
          // Actualizar en BD (método save es upsert inteligente)
          await this.eventTypeRepository.save(eventType);

          logger.info({ 
            eventTypeId: eventType.id,
            language,
            normalizedName
          }, '🌐 Language added to existing event type');
        } else {
          logger.info({ 
            eventTypeId: eventType.id,
            normalizedName
          }, '♻️ Event type already exists, reusing');
        }

        return eventType;
      }

      // 4. Tipo no existe: Crear nuevo (crowdsourcing)
      const createResult = systemGenerated
        ? MachineEventType.createSystemType({ name, language })
        : MachineEventType.createUserType({ name, language, createdBy: userId });

      if (!createResult.success) {
        throw new Error(`Failed to create event type: ${createResult.error.message}`);
      }

      const newEventType = createResult.data;

      // 5. Guardar en repositorio
      const saveResult = await this.eventTypeRepository.save(newEventType);

      if (!saveResult.success) {
        throw new Error(`Failed to save event type: ${saveResult.error.message}`);
      }

      logger.info({ 
        eventTypeId: newEventType.id,
        name,
        systemGenerated
      }, '🆕 New machine event type created (crowdsourcing)');

      return newEventType;

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        name,
        userId
      }, 'Machine event type creation failed');
      
      throw error;
    }
  }

  // ============================================================================
  // MÉTODOS ESTRATÉGICOS (Comentados para futuras features)
  // ============================================================================

  /**
   * TODO: Fusionar tipos duplicados (merge event types)
   * 
   * @param sourceTypeId - ID del tipo a eliminar
   * @param targetTypeId - ID del tipo destino
   * @param adminUserId - ID del admin ejecutando merge
   * @returns Promise<void>
   * 
   * Propósito:
   * - Admin detecta tipos duplicados por typos ("Mantenimiento" vs "Mantencion")
   * - Fusionar tipos: Actualizar todos los eventos con sourceTypeId → targetTypeId
   * - Sumar timesUsed, fusionar languages, desactivar sourceType
   * 
   * Caso de uso:
   * - Usuario A crea "Mantenimiento" (correcto)
   * - Usuario B crea "Mantencion" (typo)
   * - 50 eventos usan "Mantencion"
   * - Admin fusiona: 50 eventos ahora usan "Mantenimiento"
   * - "Mantencion" se desactiva (soft delete)
   * 
   * Implementación:
   * async mergeEventTypes(
   *   sourceTypeId: string,
   *   targetTypeId: string,
   *   adminUserId: string
   * ): Promise<{ eventsUpdated: number }> {
   *   // 1. Validar que admin tiene permisos
   *   // 2. Cargar ambos tipos
   *   // 3. Actualizar todos los eventos en todas las máquinas
   *   //    Machine.updateMany({ 'eventsHistory.typeId': sourceTypeId }, 
   *   //                        { $set: { 'eventsHistory.$[].typeId': targetTypeId }})
   *   // 4. Sumar timesUsed al tipo destino
   *   // 5. Fusionar languages
   *   // 6. Desactivar sourceType
   *   // 7. Log de auditoría
   * }
   */

  /**
   * TODO: Traducción colaborativa de tipos (crowdsourced translations)
   * 
   * @param eventTypeId - ID del tipo
   * @param language - Código de idioma (e.g., 'en', 'pt')
   * @param translatedName - Nombre traducido
   * @param userId - ID del usuario proponiendo traducción
   * @returns Promise<void>
   * 
   * Propósito:
   * - Usuario bilingüe propone traducciones de tipos existentes
   * - Mejora UX para empresas multinacionales
   * - Community-driven i18n
   * 
   * Ejemplo:
   * - Tipo original: "Mantenimiento Preventivo" (es)
   * - Usuario bilingüe propone: "Preventive Maintenance" (en)
   * - Sistema agrega idioma al tipo
   * - Usuarios con idioma 'en' ven nombre traducido en autocomplete
   * 
   * Implementación:
   * async addTranslation(
   *   eventTypeId: string,
   *   language: string,
   *   translatedName: string,
   *   userId: string
   * ): Promise<void> {
   *   // 1. Cargar tipo existente
   *   // 2. Validar que idioma no existe ya
   *   // 3. Agregar idioma con nombre traducido
   *   // 4. Guardar actualización
   *   // 5. Log de contribución (gamification: usuario gana puntos)
   * }
   */

  /**
   * TODO: Sugerencias inteligentes de tipos basadas en machine context
   * 
   * @param machineId - ID de la máquina
   * @param userId - ID del usuario
   * @returns Promise con tipos sugeridos
   * 
   * Propósito:
   * - Sugerir tipos relevantes según historial de la máquina
   * - Reducir búsqueda en autocomplete (tipos más probables primero)
   * 
   * Lógica:
   * 1. Analizar eventsHistory de la máquina
   * 2. Obtener tipos más usados en ESA máquina específica
   * 3. Combinar con tipos globalmente populares
   * 4. Retornar top 10 sugerencias personalizadas
   * 
   * Ejemplo:
   * - Excavadora X tiene 30 eventos tipo "Mantenimiento Preventivo"
   * - Usuario crea nuevo evento en esa máquina
   * - Autocomplete muestra "Mantenimiento Preventivo" como primera sugerencia
   * 
   * Implementación:
   * async getSuggestedTypes(
   *   machineId: string,
   *   userId: string,
   *   limit: number = 10
   * ): Promise<MachineEventType[]> {
   *   // 1. Obtener eventsHistory de la máquina
   *   // 2. Contar frecuencia de cada typeId
   *   // 3. Obtener detalles de tipos más frecuentes
   *   // 4. Combinar con tipos globales populares (timesUsed)
   *   // 5. Deduplicar y retornar top N
   * }
   */
}
