import type { IMachineRepository } from '@packages/domain';
import { MachineId, DomainError } from '@packages/domain';
import type { GetQuickCheckItemsTemplateResponse, QuickCheckItemTemplate } from '@packages/contracts';

/**
 * Use Case: Obtener plantilla de ítems derivada del último QuickCheck
 * 
 * ESTRATEGIA: En vez de mantener catálogos duplicados de ítems por máquina,
 * reutilizamos los ítems del último QuickCheck ejecutado.
 * 
 * FLUJO:
 * 1. Buscar último QuickCheck de la máquina (ordenado por fecha DESC)
 * 2. Si existe: Extraer quickCheckItems y remover campo 'result' (template)
 * 3. Si NO existe: Retornar array vacío (frontend crea items desde cero)
 * 
 * VENTAJAS:
 * - Zero duplicación de almacenamiento (reutiliza historial existente)
 * - Self-documenting: Último QuickCheck refleja ítems actuales
 * - Evolutivo: Si checklist cambia, se adapta automáticamente
 * - No requiere migración de datos
 */
export class GetQuickCheckItemsTemplateUseCase {
  constructor(
    private readonly machineRepository: IMachineRepository
  ) {}

  async execute(machineId: string, userId: string): Promise<GetQuickCheckItemsTemplateResponse> {
    try {
      // 1. Validar machineId
      const machineIdVO = MachineId.create(machineId);
      if (!machineIdVO.success) {
        throw new Error('Invalid machine ID format');
      }

      // 2. Validar que la máquina existe y que el usuario tiene acceso
      const machineResult = await this.machineRepository.findById(machineIdVO.data);
      if (!machineResult.success) {
        throw new Error(`Machine with ID ${machineId} not found`);
      }

      const machine = machineResult.data;

      // 3. Validar acceso del usuario (owner o provider asignado)
      const isOwner = machine.ownerId.getValue() === userId;
      const isAssignedProvider = machine.assignedProviderId?.getValue() === userId;

      if (!isOwner && !isAssignedProvider) {
        throw new Error('Access denied: you are not the owner or assigned provider');
      }

      // 4. Obtener último QuickCheck de la máquina
      const latestQuickCheckResult = await this.machineRepository.getLatestQuickCheck(machineIdVO.data);
      
      if (!latestQuickCheckResult.success) {
        throw latestQuickCheckResult.error;
      }

      const latestQuickCheck = latestQuickCheckResult.data;

      // 5a. CASO: NO hay QuickChecks previos (máquina nueva o sin historial)
      if (!latestQuickCheck || !latestQuickCheck.quickCheckItems || latestQuickCheck.quickCheckItems.length === 0) {
        return {
          success: true,
          message: 'No previous QuickChecks found. Start from scratch.',
          data: {
            items: [],
            hasTemplate: false
            // sourceQuickCheckDate no se incluye (no hay fuente)
          }
        };
      }

      // 5b. CASO: Existe QuickCheck previo → Derivar template
      // Mapear items: Solo extraer name + description (omitir 'result')
      const templateItems: QuickCheckItemTemplate[] = latestQuickCheck.quickCheckItems.map(item => ({
        name: item.name,
        description: item.description
        // NOTE: 'result' se omite intencionalmente - usuario lo completará
      }));

      return {
        success: true,
        message: `Template derived from latest QuickCheck (${templateItems.length} items)`,
        data: {
          items: templateItems,
          sourceQuickCheckDate: latestQuickCheck.date, // Para auditoría/debugging
          hasTemplate: true
        }
      };

    } catch (error: any) {
      // Preservar errores de dominio para manejo apropiado en controller
      if (error instanceof DomainError) {
        throw error;
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Error getting QuickCheck items template: ${String(error)}`);
    }
  }

  // TODO: Método estratégico para considerar en el futuro:
  // async executeWithMerge(machineId: string, customItems: QuickCheckItemTemplate[]): Promise<GetQuickCheckItemsTemplateResponse> {
  //   // Fusionar template derivado con ítems custom del usuario
  //   // Útil si el usuario quiere agregar/modificar algunos ítems del template
  //   // Caso de uso: QuickCheck especial con ítems adicionales puntuales
  // }

  // TODO: Cache strategy para optimizar:
  // - Cachear resultado por machineId (TTL: 1 hora)
  // - Invalidar cache al agregar nuevo QuickCheck
  // - Beneficio: Reduce carga en MongoDB para máquinas con alta frecuencia de consultas
}
