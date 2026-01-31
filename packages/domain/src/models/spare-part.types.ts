/**
 * Spare Part Types & Interfaces
 * Sprint #15/16 - Task 7.1: Alta/edición repuesto (RF-012/014)
 * 
 * Interface pública para SparePart (Repuesto)
 * Entidad independiente con referencia a machineId
 * 
 * DRY/SSOT: Usar en dominio, contracts y persistencia
 */

/**
 * Interface for SparePart entity
 * 
 * Estructura mínima v0.0.1:
 * - name: Nombre del repuesto (ej: "Filtro de Aceite", "Correa de Transmisión")
 * - serialId: Número de serie o código de parte (ej: "F-1234", "ABC-XYZ-789")
 * - amount: Cantidad disponible en inventario
 * - machineId: Referencia a la máquina asociada
 * 
 * @example
 * {
 *   id: "abc123",
 *   name: "Filtro de Aceite",
 *   serialId: "F-1234",
 *   amount: 5,
 *   machineId: "machine-xyz",
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * }
 */
export interface ISparePart {
  readonly id: string;
  readonly name: string;
  readonly serialId: string;
  readonly amount: number;
  readonly machineId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  
  // =============================================================================
  // 🔮 FUTURE ENHANCEMENTS (Commented for v0.0.2+)
  // =============================================================================
  
  /**
   * TODO (v0.0.2): Part metadata
   * - partNumber?: string; // Número de parte del fabricante
   * - manufacturer?: string; // Fabricante del repuesto
   * - supplier?: string; // Proveedor de donde se adquiere
   * - unitCost?: number; // Costo unitario
   * - minStockLevel?: number; // Nivel mínimo de stock para alerta
   * - notes?: string; // Notas adicionales
   */
  
  /**
   * TODO (v0.0.3): Usage tracking
   * - lastUsedAt?: Date; // Última vez que se usó
   * - timesUsed?: number; // Contador de usos
   * - location?: string; // Ubicación física del repuesto
   */
  
  /**
   * TODO (v0.0.4): Integration with events
   * - linkedEventIds?: string[]; // Eventos donde se usó este repuesto
   * - linkedMaintenanceIds?: string[]; // Mantenimientos donde se usó
   */
}
