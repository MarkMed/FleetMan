import { Result } from '../errors';
import { DomainError } from '../errors';

/**
 * Datos para enviar un email
 * Representa un mensaje email completo con destinatario, asunto y contenido
 * 
 * Sprint #15 - Task 0.16: Email Infrastructure Setup
 */
export interface EmailData {
  to: string;           // Email del destinatario
  subject: string;      // Asunto del email
  html: string;         // Contenido HTML del email (ya renderizado desde template)
  // TODO: Método estratégico - Soporte para múltiples destinatarios
  // cc?: string[];     // Copia a múltiples destinatarios (Carbon Copy)
  // bcc?: string[];    // Copia oculta (Blind Carbon Copy)
  // TODO: Método estratégico - Adjuntos de archivos
  // attachments?: Array<{ filename: string; content: Buffer | string; contentType?: string }>;
  // TODO: Método estratégico - Plain text fallback para clientes sin HTML
  // text?: string;     // Versión texto plano del email (fallback)
}

/**
 * Interfaz de transporte de emails (DIP - Dependency Inversion Principle)
 * 
 * Define el contrato para enviar emails sin depender de implementación específica
 * Permite cambiar de provider (Nodemailer, SendGrid, AWS SES, etc.) sin modificar domain
 * 
 * Sprint #15 - Task 0.16: Email Infrastructure Setup
 * Pattern: Dependency Inversion Principle (DIP) - Domain no depende de infrastructure
 * 
 * Implementaciones:
 * - NodemailerTransport (SMTP genérico con Nodemailer)
 * - SendGridTransport (futuro - SDK oficial de SendGrid)
 * - AWSTransport (futuro - AWS SES para producción)
 * - MockEmailTransport (testing - no envía emails reales)
 */
export interface IEmailTransport {
  /**
   * Envía un email usando el transport configurado
   * 
   * @param emailData - Datos del email a enviar
   * @returns Result<void, DomainError> - Success si se envió correctamente, Fail con error de infraestructura
   * 
   * Errores posibles:
   * - EMAIL_SEND_FAILED: Fallo en el envío (SMTP unreachable, credenciales inválidas, etc.)
   * - INVALID_EMAIL_ADDRESS: Email del destinatario inválido
   * - RATE_LIMIT_EXCEEDED: Provider bloqueó por límite de envíos (ej: Mailtrap sandbox)
   * 
   * @example
   * ```typescript
   * const result = await emailTransport.sendEmail({
   *   to: 'user@example.com',
   *   subject: 'Restablecer contraseña',
   *   html: '<h1>Hola!</h1><p>Tu link de reset...</p>'
   * });
   * 
   * if (!result.success) {
   *   logger.error('Failed to send email', result.error);
   * }
   * ```
   */
  sendEmail(emailData: EmailData): Promise<Result<void, DomainError>>;

  // TODO: Método estratégico - Validar configuración de transport
  // validateConfig(): Promise<Result<void, DomainError>>; // Verifica que SMTP credentials sean correctos
  
  // TODO: Método estratégico - Verificar estado de provider
  // healthCheck(): Promise<Result<{ isHealthy: boolean; latencyMs: number }, DomainError>>;
  
  // TODO: Método estratégico - Batch sending para notificaciones masivas
  // sendBatch(emails: EmailData[]): Promise<Result<{ successCount: number; failedEmails: string[] }, DomainError>>;
}
