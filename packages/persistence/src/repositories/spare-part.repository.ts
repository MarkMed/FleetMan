import { type ISparePart } from '@packages/domain';
import { SparePartModel, type ISparePartDocument } from '../models';
import { SparePartMapper } from '../mappers/spare-part.mapper';

/**
 * Spare Part Repository
 * Sprint #15/16 - Task 7.1: Alta/edición repuesto (RF-012/014)
 * 
 * Handles all database operations for spare parts
 * Pattern: Similar to MachineTypeRepository
 * 
 * Responsibilities:
 * - CRUD operations on spare_parts collection
 * - Query spare parts by machine
 * - Validate unique constraints
 * - Map between domain and persistence layers
 */
export class SparePartRepository {
  
  /**
   * Find spare part by ID
   * 
   * @param id - Spare part ID
   * @returns Spare part or null if not found
   */
  async findById(id: string): Promise<ISparePart | null> {
    try {
      const doc = await SparePartModel.findById(id);
      return doc ? SparePartMapper.toDomain(doc) : null;
    } catch (error) {
      console.error('Error finding spare part by ID:', error, { id });
      return null;
    }
  }
  
  /**
   * Find all spare parts for a specific machine
   * 
   * @param machineId - Machine ID
   * @returns Array of spare parts (empty if none found)
   */
  async findByMachineId(machineId: string): Promise<ISparePart[]> {
    try {
      const docs = await SparePartModel
        .find({ machineId })
        .sort({ name: 1 }); // Sort alphabetically by name
      
      return SparePartMapper.toDomainArray(docs);
    } catch (error) {
      console.error('Error finding spare parts by machine ID:', error, { machineId });
      return [];
    }
  }
  
  /**
   * Find spare part by serial ID within a machine
   * Useful for checking duplicates before creation
   * 
   * @param machineId - Machine ID
   * @param serialId - Serial ID to search
   * @returns Spare part or null if not found
   */
  async findByMachineAndSerialId(machineId: string, serialId: string): Promise<ISparePart | null> {
    try {
      const doc = await SparePartModel.findOne({ 
        machineId,
        serialId: serialId.trim()
      });
      
      return doc ? SparePartMapper.toDomain(doc) : null;
    } catch (error) {
      console.error('Error finding spare part by machine and serial ID:', error, { machineId, serialId });
      return null;
    }
  }
  
  /**
   * Create new spare part
   * 
   * @param data - Spare part data (without id, timestamps)
   * @returns Created spare part
   * @throws Error if creation fails
   */
  async create(data: Omit<ISparePart, 'id' | 'createdAt' | 'updatedAt'>): Promise<ISparePart> {
    try {
      // Validate required fields
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('Spare part name is required');
      }
      
      if (!data.serialId || data.serialId.trim().length === 0) {
        throw new Error('Serial ID is required');
      }
      
      if (data.amount < 0) {
        throw new Error('Amount cannot be negative');
      }
      
      if (!data.machineId) {
        throw new Error('Machine ID is required');
      }
      
      // Check for duplicate serial ID in same machine
      const existing = await this.findByMachineAndSerialId(data.machineId, data.serialId);
      if (existing) {
        throw new Error(`Spare part with serial ID "${data.serialId}" already exists for this machine`);
      }
      
      // Create document
      const doc = await SparePartModel.create(SparePartMapper.toDocument(data));
      
      console.log('✅ Spare part created successfully:', { sparePartId: doc.id, machineId: data.machineId });
      
      return SparePartMapper.toDomain(doc);
      
    } catch (error: any) {
      console.error('Failed to create spare part:', error.message, { machineId: data.machineId });
      
      throw error;
    }
  }
  
  /**
   * Update spare part
   * Only updates provided fields (partial update)
   * 
   * @param id - Spare part ID
   * @param updates - Partial spare part data to update
   * @returns Updated spare part
   * @throws Error if spare part not found or update fails
   */
  async update(
    id: string, 
    updates: Partial<Omit<ISparePart, 'id' | 'machineId' | 'createdAt' | 'updatedAt'>>
  ): Promise<ISparePart> {
    try {
      // Validate at least one field to update
      if (Object.keys(updates).length === 0) {
        throw new Error('No fields to update');
      }
      
      // Find existing spare part
      const existing = await this.findById(id);
      if (!existing) {
        throw new Error(`Spare part with ID ${id} not found`);
      }
      
      // If serialId is being updated, check for duplicates
      if (updates.serialId && updates.serialId !== existing.serialId) {
        const duplicate = await this.findByMachineAndSerialId(
          existing.machineId,
          updates.serialId
        );
        
        if (duplicate && duplicate.id !== id) {
          throw new Error(`Spare part with serial ID "${updates.serialId}" already exists for this machine`);
        }
      }
      
      // Prepare update data
      const updateData = SparePartMapper.toUpdateDocument(updates);
      
      // Perform update
      const doc = await SparePartModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      
      if (!doc) {
        throw new Error(`Failed to update spare part with ID ${id}`);
      }
      
      console.log('✅ Spare part updated successfully:', { sparePartId: id });
      
      return SparePartMapper.toDomain(doc);
      
    } catch (error: any) {
      console.error('Failed to update spare part:', error.message, { sparePartId: id });
      
      throw error;
    }
  }
  
  /**
   * Delete spare part
   * 
   * @param id - Spare part ID
   * @returns true if deleted, false if not found
   * @throws Error if deletion fails
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await SparePartModel.findByIdAndDelete(id);
      
      if (!result) {
        console.warn('Spare part not found for deletion:', { sparePartId: id });
        return false;
      }
      
      console.log('✅ Spare part deleted successfully:', { sparePartId: id });
      
      return true;
      
    } catch (error: any) {
      console.error('Failed to delete spare part:', error.message, { sparePartId: id });
      
      throw error;
    }
  }
  
  /**
   * Delete all spare parts for a specific machine
   * Useful when machine is deleted
   * 
   * @param machineId - Machine ID
   * @returns Number of spare parts deleted
   */
  async deleteByMachineId(machineId: string): Promise<number> {
    try {
      const result = await SparePartModel.deleteMany({ machineId });
      
      console.log(`✅ Deleted ${result.deletedCount} spare parts for machine:`, { machineId, deletedCount: result.deletedCount });
      
      return result.deletedCount || 0;
      
    } catch (error: any) {
      console.error('Failed to delete spare parts by machine ID:', error.message, { machineId });
      
      throw error;
    }
  }
  
  /**
   * Count spare parts for a machine
   * 
   * @param machineId - Machine ID
   * @returns Number of spare parts
   */
  async countByMachineId(machineId: string): Promise<number> {
    try {
      return await SparePartModel.countDocuments({ machineId });
    } catch (error) {
      console.error('Error counting spare parts:', error, { machineId });
      return 0;
    }
  }
  
  // =============================================================================
  // 🔮 FUTURE METHODS (Commented for v0.0.2+)
  // =============================================================================
  
  /**
   * TODO (v0.0.2): Find spare parts with low stock
   * 
   * async findLowStock(machineId: string, threshold: number = 5): Promise<ISparePart[]> {
   *   const docs = await SparePartModel
   *     .find({ 
   *       machineId,
   *       amount: { $lte: threshold }
   *     })
   *     .sort({ amount: 1, name: 1 });
   *   
   *   return SparePartMapper.toDomainArray(docs);
   * }
   */
  
  /**
   * TODO (v0.0.3): Search spare parts by text
   * 
   * async search(machineId: string, query: string): Promise<ISparePart[]> {
   *   const docs = await SparePartModel
   *     .find({
   *       machineId,
   *       $text: { $search: query }
   *     })
   *     .sort({ score: { $meta: 'textScore' } });
   *   
   *   return SparePartMapper.toDomainArray(docs);
   * }
   */
  
  /**
   * TODO (v0.0.4): Get spare parts statistics
   * 
   * async getStatistics(machineId: string): Promise<{
   *   total: number;
   *   totalValue: number;
   *   lowStock: number;
   *   outOfStock: number;
   * }> {
   *   // Implementation with aggregation pipeline
   * }
   */
}
