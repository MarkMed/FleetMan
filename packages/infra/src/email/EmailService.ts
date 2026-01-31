import { IEmailTransport, EmailData, Result, ok, err, DomainError } from '@packages/domain';
import { EmailTemplateService } from './EmailTemplateService';

/**
 * Servicio orquestador para envío de emails
 * 
 * Sprint #15 - Task 0.16: Email Infrastructure Setup
 * Pattern: Facade Pattern - Proporciona interfaz simplificada para email subsystem
 * 
 * Responsabilidades:
 * 1. Coordinar EmailTemplateService (renderizado) + IEmailTransport (envío)
 * 2. Proporcionar métodos de alto nivel para casos de uso comunes
 * 3. Manejar logging y error tracking de emails
 * 
 * Casos de uso soportados:
 * - sendPasswordResetEmail() - Task 2.4: Password Recovery
 * - sendNotificationDigestEmail() - Task 8.7: Digest Emails (futuro)
 * - sendWelcomeEmail() - Onboarding (futuro)
 * 
 * @example
 * ```typescript
 * const emailService = new EmailService(transport, templateService);
 * 
 * const result = await emailService.sendPasswordResetEmail({
 *   to: 'user@example.com',
 *   userName: 'Juan Pérez',
 *   resetLink: 'https://app.com/reset/token123'
 * });
 * ```
 */
export class EmailService {
  constructor(
    private emailTransport: IEmailTransport,
    private templateService: EmailTemplateService
  ) {}

  /**
   * Envía email de recuperación de contraseña
   * Sprint #15 - Task 2.4: Password Recovery Flow
   * 
   * @param params - Parámetros del email
   * @returns Result<void, DomainError> - Success si se envió, Fail con error
   */
  async sendPasswordResetEmail(params: {
    to: string;           // Email del destinatario
    userName: string;     // Nombre del usuario (companyName)
    resetLink: string;    // Link completo de reset (con token)
  }): Promise<Result<void, DomainError>> {
    try {
      // 1. Renderizar template con datos
      const renderResult = await this.templateService.render('password-reset', {
        userName: params.userName,
        resetLink: params.resetLink,
        // Variables adicionales disponibles en template
        year: new Date().getFullYear(),
        supportEmail: 'support@fleetman.com', // TODO: Sacar de config
      });

      if (!renderResult.success) {
        return err(renderResult.error);
      }

      // 2. Preparar datos del email
      const emailData: EmailData = {
        to: params.to,
        subject: 'Restablecer tu contraseña - FleetMan',
        html: renderResult.data,
      };

      // 3. Enviar email usando transport
      const sendResult = await this.emailTransport.sendEmail(emailData);
      
      if (!sendResult.success) {
        return err(sendResult.error);
      }

      return ok(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return err(DomainError.create('EMAIL_SEND_FAILED', `Failed to send password reset email: ${errorMessage}`));
    }
  }

  // TODO: Método estratégico - Email de bienvenida
  // async sendWelcomeEmail(params: {
  //   to: string;
  //   userName: string;
  //   userType: 'CLIENT' | 'PROVIDER';
  // }): Promise<Result<void, DomainError>> {
  //   const renderResult = await this.templateService.render('welcome', {
  //     userName: params.userName,
  //     userType: params.userType,
  //     loginLink: `${process.env.APP_BASE_URL}/login`,
  //   });
  //   
  //   if (!renderResult.success) return err(renderResult.error);
  //   
  //   return this.emailTransport.sendEmail({
  //     to: params.to,
  //     subject: '¡Bienvenido a FleetMan! 🚀',
  //     html: renderResult.data,
  //   });
  // }

  // TODO: Método estratégico - Email de confirmación de cuenta
  // async sendAccountVerificationEmail(params: {
  //   to: string;
  //   userName: string;
  //   verificationLink: string;
  // }): Promise<Result<void, DomainError>> {
  //   const renderResult = await this.templateService.render('verify-account', {
  //     userName: params.userName,
  //     verificationLink: params.verificationLink,
  //   });
  //   
  //   if (!renderResult.success) return err(renderResult.error);
  //   
  //   return this.emailTransport.sendEmail({
  //     to: params.to,
  //     subject: 'Confirma tu cuenta - FleetMan',
  //     html: renderResult.data,
  //   });
  // }

  /**
   * Envía email con digest de notificaciones
   * Sprint #15 - Task 8.7: Notification Digest Emails (Would Have - futuro)
   * 
   * TODO: Implementar cuando se trabaje Task 8.7
   * 
   * @param params - Parámetros del digest
   * @returns Result<void, DomainError>
   */
  // async sendNotificationDigestEmail(params: {
  //   to: string;
  //   userName: string;
  //   notifications: Array<{
  //     type: string;
  //     message: string;
  //     actionUrl: string;
  //     createdAt: Date;
  //   }>;
  //   period: 'daily' | 'weekly';
  // }): Promise<Result<void, DomainError>> {
  //   const renderResult = await this.templateService.render('notification-digest', {
  //     userName: params.userName,
  //     notifications: params.notifications,
  //     period: params.period,
  //     totalNotifications: params.notifications.length,
  //     dashboardLink: `${process.env.APP_BASE_URL}/dashboard`,
  //   });
  //   
  //   if (!renderResult.success) return err(renderResult.error);
  //   
  //   return this.emailTransport.sendEmail({
  //     to: params.to,
  //     subject: `Tu resumen ${params.period === 'daily' ? 'diario' : 'semanal'} de FleetMan`,
  //     html: renderResult.data,
  //   });
  // }

  /**
   * Método genérico para enviar emails con template personalizado
   * Útil para casos de uso no predefinidos
   * 
   * @param templateName - Nombre del template a usar
   * @param to - Email del destinatario
   * @param subject - Asunto del email
   * @param data - Datos para el template
   * @returns Result<void, DomainError>
   */
  async sendTemplatedEmail(
    templateName: string,
    to: string,
    subject: string,
    data: Record<string, any>
  ): Promise<Result<void, DomainError>> {
    try {
      // Renderizar template
      const renderResult = await this.templateService.render(templateName, data);
      if (!renderResult.success) {
        return err(renderResult.error);
      }

      // Enviar email
      const sendResult = await this.emailTransport.sendEmail({
        to,
        subject,
        html: renderResult.data,
      });

      return sendResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return err(DomainError.create('EMAIL_SEND_FAILED', `Failed to send templated email: ${errorMessage}`));
    }
  }

  /**
   * Envía un email simple sin template (HTML directo)
   * Útil para testing o emails muy simples
   * 
   * @param to - Email del destinatario
   * @param subject - Asunto del email
   * @param html - Contenido HTML del email
   * @returns Result<void, DomainError>
   */
  async sendRawEmail(to: string, subject: string, html: string): Promise<Result<void, DomainError>> {
    return this.emailTransport.sendEmail({ to, subject, html });
  }
}
