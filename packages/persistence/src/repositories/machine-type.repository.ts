import { MachineType, type IMachineTypeRepository } from '@packages/domain';
import { MachineTypeModel, type IMachineTypeDocument } from '../models';

/**
 * Implementación del repositorio de MachineType
 * Incluye lógica inteligente de save para manejar multilenguaje
 */
export class MachineTypeRepository implements IMachineTypeRepository {
  
  /**
   * Convierte un documento de Mongoose a entidad de dominio
   */
  private toEntity(doc: IMachineTypeDocument): MachineType {
    return MachineType.create(
      doc.name,
      doc.languages[0], // El primer idioma (ya validado que existe al menos uno)
      doc.id,
      doc.languages
    );
  }

  /**
   * Busca un tipo de máquina por su ID
   */
  async findById(id: string): Promise<MachineType | null> {
    try {
      const doc = await MachineTypeModel.findById(id);
      return doc ? this.toEntity(doc) : null;
    } catch (error) {
      console.error('Error finding MachineType by ID:', error);
      return null;
    }
  }

  /**
   * Busca un tipo de máquina por nombre (case-insensitive)
   */
  async findByName(name: string): Promise<MachineType | null> {
    try {
      const doc = await MachineTypeModel.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
      });
      return doc ? this.toEntity(doc) : null;
    } catch (error) {
      console.error('Error finding MachineType by name:', error);
      return null;
    }
  }

  /**
   * Obtiene todos los tipos de máquina
   */
  async findAll(): Promise<MachineType[]> {
    try {
      const docs = await MachineTypeModel.find().sort({ name: 1 });
      return docs.map(doc => this.toEntity(doc));
    } catch (error) {
      console.error('Error finding all MachineTypes:', error);
      return [];
    }
  }

  /**
   * Busca tipos de máquina que tengan un idioma específico
   */
  async findByLanguage(language: string): Promise<MachineType[]> {
    try {
      const docs = await MachineTypeModel.find({ 
        languages: language.toLowerCase() 
      }).sort({ name: 1 });
      return docs.map(doc => this.toEntity(doc));
    } catch (error) {
      console.error('Error finding MachineTypes by language:', error);
      return [];
    }
  }

  /**
   * Guarda un tipo de máquina de forma inteligente:
   * - Si existe un registro con ese nombre (case-insensitive), agrega el idioma si no está presente
   * - Si no existe, crea un nuevo registro con el nombre y el idioma dado
   * 
   * Esta es la lógica clave que permite compartir tipos entre usuarios de distintos idiomas
   */
  async save(name: string, language: string): Promise<MachineType> {
    try {
      const normalizedName = name.trim();
      const normalizedLang = language.trim().toLowerCase();

      // Validaciones básicas
      if (normalizedName.length < 2 || normalizedName.length > 50) {
        throw new Error('El nombre debe tener entre 2 y 50 caracteres');
      }
      if (normalizedLang.length !== 2) {
        throw new Error('El idioma debe ser código ISO 639-1 (2 letras)');
      }

      // Buscar si existe (case-insensitive)
      const existing = await MachineTypeModel.findOne({
        name: { $regex: new RegExp(`^${normalizedName}$`, 'i') }
      });

      if (existing) {
        // Existe: agregar idioma si no está presente
        if (!existing.languages.includes(normalizedLang)) {
          existing.languages.push(normalizedLang);
          await existing.save();
        }
        return this.toEntity(existing);
      } else {
        // No existe: crear nuevo
        const doc = await MachineTypeModel.create({
          name: normalizedName,
          languages: [normalizedLang]
        });
        return this.toEntity(doc);
      }
    } catch (error: any) {
      // Si es error de duplicado (por race condition), reintentar una vez
      if (error.code === 11000) {
        const existing = await MachineTypeModel.findOne({
          name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        });
        if (existing && !existing.languages.includes(language.toLowerCase())) {
          existing.languages.push(language.toLowerCase());
          await existing.save();
        }
        if (existing) {
          return this.toEntity(existing);
        }
      }
      throw error;
    }
  }

  /**
   * Actualiza el nombre de un tipo de máquina
   */
  async updateName(id: string, newName: string): Promise<MachineType | null> {
    try {
      const doc = await MachineTypeModel.findById(id);
      if (!doc) {
        return null;
      }

      doc.name = newName.trim();
      await doc.save();
      return this.toEntity(doc);
    } catch (error) {
      console.error('Error updating MachineType name:', error);
      throw error;
    }
  }

  /**
   * Elimina físicamente un tipo de máquina
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await MachineTypeModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting MachineType:', error);
      return false;
    }
  }

  /**
   * Cuenta cuántas máquinas usan este tipo
   * TODO: Implementar cuando esté el modelo Machine
   */
  async countMachinesUsingType(id: string): Promise<number> {
    // Por ahora retorna 0, implementar cuando Machine esté listo
    return 0;
  }
}
