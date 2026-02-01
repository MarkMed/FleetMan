import { type ISparePart } from '@packages/domain';
import { type ISparePartDocument } from '../models';

/**
 * Spare Part Mapper
 * Sprint #15/16 - Task 7.1: Alta/edición repuesto
 * 
 * Converts between Mongoose documents and domain objects
 * Maintains clean separation between persistence and domain layers
 * 
 * Pattern: Similar to MachineTypeRepository.toEntity()
 */
export class SparePartMapper {
  
  /**
   * Converts Mongoose document to domain interface
   * 
   * @param doc - Mongoose document from database
   * @returns Domain object (ISparePart)
   */
  static toDomain(doc: ISparePartDocument): ISparePart {
    return {
      id: doc.id, // Virtual getter from _id
      name: doc.name,
      serialId: doc.serialId,
      amount: doc.amount,
      machineId: doc.machineId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }
  
  /**
   * Converts domain interface to Mongoose document data
   * Used for creating new documents
   * 
   * @param sparePart - Domain object
   * @returns Document data (without _id, timestamps auto-generated)
   */
  static toDocument(sparePart: Omit<ISparePart, 'id' | 'createdAt' | 'updatedAt'>): any {
    return {
      name: sparePart.name,
      serialId: sparePart.serialId,
      amount: sparePart.amount,
      machineId: sparePart.machineId
    };
  }
  
  /**
   * Converts array of Mongoose documents to domain objects
   * 
   * @param docs - Array of Mongoose documents
   * @returns Array of domain objects
   */
  static toDomainArray(docs: ISparePartDocument[]): ISparePart[] {
    return docs.map(doc => this.toDomain(doc));
  }
  
  /**
   * Converts partial domain update to Mongoose update data
   * Filters out undefined values and readonly fields
   * 
   * @param updates - Partial domain object with updates
   * @returns Update data for Mongoose (only changed fields)
   */
  static toUpdateDocument(updates: Partial<Omit<ISparePart, 'id' | 'machineId' | 'createdAt' | 'updatedAt'>>): any {
    const updateData: any = {};
    
    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    
    if (updates.serialId !== undefined) {
      updateData.serialId = updates.serialId;
    }
    
    if (updates.amount !== undefined) {
      updateData.amount = updates.amount;
    }
    
    return updateData;
  }
}
