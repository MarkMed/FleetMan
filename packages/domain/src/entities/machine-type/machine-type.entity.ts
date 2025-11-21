
/**
 * Entidad mínima para MachineType: id, name y languages
 */
export class MachineType {
  private constructor(
    private readonly _id: string,
    private _name: string,
    private _languages: string[]
  ) {}

  /**
   * Crea una nueva instancia de MachineType
   * @param name Nombre del tipo de máquina (único, case-insensitive)
   * @param language Idioma ISO 639-1 (ej: 'es', 'en')
   * @param id Opcional, generado por la DB
   * @param languages Opcional, para reconstituir desde persistencia
   */
  public static create(name: string, language: string, id?: string, languages?: string[]): MachineType {
    // Validación mínima: no vacío, longitud razonable
    if (!name || name.trim().length < 2 || name.trim().length > 50) {
      throw new Error('El nombre del tipo de máquina es requerido (2-50 caracteres)');
    }
    if (!language || language.trim().length !== 2) {
      throw new Error('El idioma es requerido y debe ser ISO 639-1 (2 letras)');
    }
    // Si se proveen languages (reconstitución), se usan; si no, se inicializa con el idioma dado
    const langs = languages && languages.length > 0 ? [...new Set(languages.map(l => l.trim().toLowerCase()))] : [language.trim().toLowerCase()];
    return new MachineType(id ?? '', name.trim(), langs);
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get languages(): string[] {
    return [...this._languages];
  }

  /**
   * Agrega un idioma si no existe
   */
  public addLanguage(language: string) {
    const lang = language.trim().toLowerCase();
    if (!this._languages.includes(lang)) {
      this._languages.push(lang);
    }
  }

  /**
   * Permite actualizar el nombre (con validación)
   */
  public updateName(newName: string) {
    if (!newName || newName.trim().length < 2 || newName.trim().length > 50) {
      throw new Error('El nombre del tipo de máquina es requerido (2-50 caracteres)');
    }
    this._name = newName.trim();
  }

  /**
   * Compara el nombre (case-insensitive)
   */
  public hasName(name: string): boolean {
    return this._name.localeCompare(name.trim(), undefined, { sensitivity: 'accent' }) === 0;
  }

  /**
   * Serializa para API/JSON
   */
  public toJSON(): object {
    return {
      id: this._id,
      name: this._name,
      languages: this._languages
    };
  }
}