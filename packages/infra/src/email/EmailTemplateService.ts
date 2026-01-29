import * as fs from 'fs/promises';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { Result, ok, err, DomainError } from '@packages/domain';

/**
 * Servicio para renderizar templates de email usando Handlebars
 * 
 * Sprint #15 - Task 0.16: Email Infrastructure Setup
 * Pattern: Template Method Pattern - Define estructura de emails reutilizable
 * 
 * Responsabilidades:
 * 1. Cargar templates .hbs desde filesystem
 * 2. Compilar templates con Handlebars
 * 3. Renderizar templates con datos dinámicos
 * 4. Aplicar layout base (base.hbs) con estilos
 * 
 * Estructura de templates:
 * - apps/backend/src/templates/base.hbs (layout wrapper común)
 * - apps/backend/src/templates/password-reset.hbs (contenido específico)
 * - apps/backend/src/templates/notification-digest.hbs (futuro)
 * 
 * @example
 * ```typescript
 * const service = new EmailTemplateService('./templates');
 * 
 * const result = await service.render('password-reset', {
 *   userName: 'Juan Pérez',
 *   resetLink: 'https://app.com/reset/token123'
 * });
 * 
 * if (result.success) {
 *   console.log(result.data); // HTML completo renderizado
 * }
 * ```
 */
export class EmailTemplateService {
  private templatesPath: string;
  private compiledTemplates: Map<string, Handlebars.TemplateDelegate<any>>;
  private baseTemplate: Handlebars.TemplateDelegate<any> | null;

  /**
   * @param templatesPath - Ruta absoluta a la carpeta de templates
   */
  constructor(templatesPath: string) {
    this.templatesPath = templatesPath;
    this.compiledTemplates = new Map();
    this.baseTemplate = null;
    
    // Registrar helpers de Handlebars para uso común
    this.registerHelpers();
  }

  /**
   * Renderiza un template con datos y lo envuelve en el layout base
   * 
   * @param templateName - Nombre del template sin extensión (ej: 'password-reset')
   * @param data - Datos dinámicos para el template (variables Handlebars)
   * @returns Result<string, DomainError> - HTML renderizado o error
   */
  async render(templateName: string, data: Record<string, any>): Promise<Result<string, DomainError>> {
    try {
      // 1. Cargar y compilar base template si no existe
      if (!this.baseTemplate) {
        const baseResult = await this.loadBaseTemplate();
        if (!baseResult.success) {
          return err(baseResult.error);
        }
      }

      // 2. Cargar y compilar template específico si no está en cache
      if (!this.compiledTemplates.has(templateName)) {
        const loadResult = await this.loadTemplate(templateName);
        if (!loadResult.success) {
          return err(loadResult.error);
        }
      }

      // 3. Renderizar template específico con datos
      const template = this.compiledTemplates.get(templateName)!;
      const contentHtml = template(data);

      // 4. Envolver contenido en base template
      const finalHtml = this.baseTemplate!({
        ...data,
        content: contentHtml, // Variable {{content}} en base.hbs
      });

      return ok(finalHtml);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Template rendering failed';
      return err(DomainError.create('TEMPLATE_RENDER_ERROR', `Failed to render template '${templateName}': ${errorMessage}`));
    }
  }

  /**
   * Carga y compila el template base (base.hbs)
   * @private
   */
  private async loadBaseTemplate(): Promise<Result<void, DomainError>> {
    try {
      const basePath = path.join(this.templatesPath, 'base.hbs');
      const baseContent = await fs.readFile(basePath, 'utf-8');
      this.baseTemplate = Handlebars.compile(baseContent);
      return ok(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return err(DomainError.create('TEMPLATE_NOT_FOUND', `Failed to load base template: ${errorMessage}`));
    }
  }

  /**
   * Carga y compila un template específico
   * Cachea el template compilado para evitar re-compilación
   * @private
   */
  private async loadTemplate(templateName: string): Promise<Result<void, DomainError>> {
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const compiled = Handlebars.compile(templateContent);
      this.compiledTemplates.set(templateName, compiled);
      return ok(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return err(DomainError.create('TEMPLATE_NOT_FOUND', `Template '${templateName}' not found: ${errorMessage}`));
    }
  }

  /**
   * Registra helpers de Handlebars personalizados
   * Helpers disponibles en todos los templates
   * @private
   */
  private registerHelpers(): void {
    // Helper para formatear fechas
    Handlebars.registerHelper('formatDate', (date: Date | string) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    });

    // Helper para formatear fechas con hora
    Handlebars.registerHelper('formatDateTime', (date: Date | string) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    });

    // Helper para comparaciones (ej: {{#if (eq status "active")}})
    Handlebars.registerHelper('eq', (a: any, b: any) => a === b);

    // Helper para capitalizar texto
    Handlebars.registerHelper('capitalize', (str: string) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    });

    // TODO: Helpers estratégicos para futuro
    // Handlebars.registerHelper('currency', (amount: number) => `$${amount.toFixed(2)}`);
    // Handlebars.registerHelper('truncate', (str: string, length: number) => str.substring(0, length) + '...');
    // Handlebars.registerHelper('join', (arr: string[], separator: string) => arr.join(separator));
  }

  /**
   * Limpia el cache de templates compilados
   * Útil en development para recargar templates sin reiniciar
   * 
   * TODO: Método estratégico para hot-reload en desarrollo
   * clearCache(): void {
   *   this.compiledTemplates.clear();
   *   this.baseTemplate = null;
   * }
   */

  /**
   * Pre-compila todos los templates al iniciar
   * Mejora performance en producción evitando compilación lazy
   * 
   * TODO: Método estratégico para production optimization
   * async precompileAll(templateNames: string[]): Promise<Result<void, DomainError>> {
   *   for (const name of templateNames) {
   *     const result = await this.render(name, {});
   *     if (!result.success) {
   *       return err(result.error);
   *     }
   *   }
   *   return ok(undefined);
   * }
   */
}
