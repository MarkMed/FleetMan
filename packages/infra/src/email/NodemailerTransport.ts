import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import { IEmailTransport, EmailData, Result, ok, err, DomainError } from '@packages/domain';

/**
 * Configuración SMTP para Nodemailer Transport
 * Soporta cualquier proveedor SMTP (Gmail, Outlook, Mailtrap, etc.)
 * 
 * Sprint #15 - Task 0.16: Email Infrastructure Setup
 */
export interface SMTPConfig {
  host: string;        // SMTP server hostname (ej: smtp.mailtrap.io, smtp.gmail.com)
  port: number;        // Puerto SMTP (587 para TLS, 465 para SSL, 2525 para Mailtrap)
  secure: boolean;     // true para SSL (port 465), false para TLS (port 587)
  auth: {
    user: string;      // Usuario SMTP (email completo o username)
    pass: string;      // Contraseña o App Password
  };
  from: string;        // Email del remitente ("FleetMan <noreply@fleetman.com>")
}

/**
 * Implementación de IEmailTransport usando Nodemailer con SMTP
 * 
 * Patrón: Adapter Pattern - Adapta Nodemailer API a nuestra interfaz de dominio
 * Dependency Inversion Principle: Domain no conoce detalles de Nodemailer
 * 
 * Sprint #15 - Task 0.16: Email Infrastructure Setup
 * 
 * Proveedores SMTP soportados:
 * - ✅ Mailtrap (desarrollo - sandbox emails sin envío real)
 * - ✅ Gmail SMTP (con App Password habilitado)
 * - ✅ Outlook/Office365 SMTP
 * - ✅ SendGrid SMTP (alternativa a SDK)
 * - ✅ AWS SES SMTP (alternativa a SDK)
 * - ✅ Cualquier proveedor SMTP estándar
 * 
 * @example
 * ```typescript
 * const transport = new NodemailerTransport({
 *   host: 'smtp.mailtrap.io',
 *   port: 2525,
 *   secure: false,
 *   auth: { user: 'abc123', pass: 'xyz456' },
 *   from: 'FleetMan <noreply@fleetman.com>'
 * });
 * 
 * const result = await transport.sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Test Email',
 *   html: '<h1>Hello!</h1>'
 * });
 * ```
 */
export class NodemailerTransport implements IEmailTransport {
  private transporter: Transporter;
  private fromAddress: string;

  constructor(config: SMTPConfig) {
    // Crear transporter con configuración SMTP
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure, // true para 465 (SSL), false para 587 (TLS)
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
      // Configuración adicional para reliability
      pool: true, // Reutilizar conexiones SMTP
      maxConnections: 5, // Máximo 5 conexiones simultáneas
      maxMessages: 100, // Máximo 100 mensajes por conexión
      rateDelta: 1000, // 1 segundo entre mensajes
      rateLimit: 5, // Máximo 5 mensajes por segundo
    });

    this.fromAddress = config.from;
  }

  /**
   * Envía un email usando el transporter configurado
   * Implementa la interfaz IEmailTransport
   */
  async sendEmail(emailData: EmailData): Promise<Result<void, DomainError>> {
    try {
      // Validar datos del email antes de enviar
      const validation = this.validateEmailData(emailData);
      if (!validation.success) {
        return err(validation.error);
      }

      // Configurar opciones del email para Nodemailer
      const mailOptions: SendMailOptions = {
        from: this.fromAddress,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
      };

      // Enviar email usando Nodemailer
      await this.transporter.sendMail(mailOptions);

      return ok(undefined);
    } catch (error) {
      // Mapear errores de Nodemailer a DomainError
      const errorMessage = error instanceof Error ? error.message : 'Unknown email error';
      
      // Detectar tipos de errores específicos
      if (errorMessage.includes('Invalid email') || errorMessage.includes('EENVELOPE')) {
        return err(DomainError.create('INVALID_EMAIL_ADDRESS', `Invalid recipient email: ${emailData.to}`));
      }
      
      if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ETIMEDOUT')) {
        return err(DomainError.create('EMAIL_SEND_FAILED', `SMTP server unreachable: ${errorMessage}`));
      }
      
      if (errorMessage.includes('Authentication failed') || errorMessage.includes('EAUTH')) {
        return err(DomainError.create('EMAIL_SEND_FAILED', 'SMTP authentication failed. Check credentials.'));
      }
      
      if (errorMessage.includes('Rate limit') || errorMessage.includes('Too many')) {
        return err(DomainError.create('RATE_LIMIT_EXCEEDED', 'Email rate limit exceeded. Try again later.'));
      }

      // Error genérico de envío
      return err(DomainError.create('EMAIL_SEND_FAILED', `Failed to send email: ${errorMessage}`));
    }
  }

  /**
   * Valida los datos del email antes de enviar
   * @private
   */
  private validateEmailData(emailData: EmailData): Result<void, DomainError> {
    // Validar destinatario
    if (!emailData.to || emailData.to.trim().length === 0) {
      return err(DomainError.validation('Recipient email cannot be empty'));
    }
    
    // Validar formato básico de email (regex simple)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.to)) {
      return err(DomainError.create('INVALID_EMAIL_ADDRESS', `Invalid email format: ${emailData.to}`));
    }

    // Validar asunto
    if (!emailData.subject || emailData.subject.trim().length === 0) {
      return err(DomainError.validation('Email subject cannot be empty'));
    }

    // Validar contenido HTML
    if (!emailData.html || emailData.html.trim().length === 0) {
      return err(DomainError.validation('Email HTML content cannot be empty'));
    }

    return ok(undefined);
  }

  // TODO: Método estratégico - Verificar conexión SMTP
  // async verifyConnection(): Promise<Result<void, DomainError>> {
  //   try {
  //     await this.transporter.verify();
  //     return ok(undefined);
  //   } catch (error) {
  //     const errorMessage = error instanceof Error ? error.message : 'Connection verification failed';
  //     return err(DomainError.create('EMAIL_SEND_FAILED', `SMTP verification failed: ${errorMessage}`));
  //   }
  // }

  // TODO: Método estratégico - Cerrar conexión SMTP (cleanup)
  // async close(): Promise<void> {
  //   this.transporter.close();
  // }

  // TODO: Método estratégico - Health check del transporter
  // async healthCheck(): Promise<Result<{ isHealthy: boolean; latencyMs: number }, DomainError>> {
  //   const start = Date.now();
  //   const result = await this.verifyConnection();
  //   const latencyMs = Date.now() - start;
  //   return ok({ isHealthy: result.success, latencyMs });
  // }
}
