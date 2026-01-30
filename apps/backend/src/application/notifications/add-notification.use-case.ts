import path from 'path';
import { UserId, NotificationCreatedEvent } from '@packages/domain';
import { UserRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import { config } from '../../config/env.config';
import type { AddNotificationRequest } from '@packages/contracts';
import { eventBus } from '../../infrastructure/events';
import { EmailService } from '@packages/infra';
import { NodemailerTransport, EmailTemplateService } from '@packages/infra';
import { NotificationTranslatorService } from '../../services/i18n/notification-translator.service';

/**
 * Use Case: Add Notification to User
 * 
 * Responsabilidades:
 * 1. Validar formato de userId
 * 2. Decidir si persistir según sourceType (MESSAGING = ephemeral, otros = persistent)
 * 3. Delegar creación de notificación al repositorio (si aplica)
 * 4. Emitir evento SSE SIEMPRE (real-time push)
 * 5. 🆕 Sprint #15 Task 8.7: Enviar email si usuario tiene preferencia activada (fire-and-forget)
 * 6. Log de errores sin bloquear operación principal
 * 
 * Estrategia de Notificaciones:
 * - MESSAGING: Solo SSE (ephemeral) - Mensajes ya están en collection messages, NO email
 * - QUICKCHECK/MAINTENANCE/EVENT/SYSTEM: DB + SSE + Email - Requieren historial persistente
 * 
 * Email Rate Limiting (Sprint #15 Task 8.7):
 * - Máximo 5 emails por hora por usuario
 * - In-memory tracking con Map<userId, timestamp[]>
 * - Si se excede el límite, se loggea pero no se envía email (graceful degradation)
 * 
 * Patrón de uso:
 * - Este use case es INTERNO, llamado por otros features (QuickCheck, Events, Maintenance, Messaging)
 * - Fire-and-forget: errores se loggean pero no se propagan
 * - No expuesto en REST API directamente
 * 
 * Sprint #9 - Sistema de Notificaciones
 * Sprint #12 Module 3 - Agregado soporte para notificaciones efímeras
 * Sprint #15 Task 8.7 - Agregado envío de emails con rate limiting
 */
export class AddNotificationUseCase {
  private userRepository: UserRepository;
  private emailService: EmailService;
  
  // Rate limiting: in-memory storage (userId -> timestamps de emails enviados)
  // TODO: Para producción escalable, migrar a Redis con TTL automático
  private static emailRateLimitMap = new Map<string, number[]>();
  private static readonly MAX_EMAILS_PER_HOUR = 5;
  private static readonly RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hora

  constructor() {
    this.userRepository = new UserRepository();
    
    // Inicializar email infrastructure (patrón de ForgotPasswordUseCase)
    const emailTransport = new NodemailerTransport({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      secure: config.email.smtp.secure,
      auth: {
        user: config.email.smtp.auth.user,
        pass: config.email.smtp.auth.pass
      },
      from: config.email.from
    });

    const templatesPath = path.join(__dirname, '../../templates');
    const templateService = new EmailTemplateService(templatesPath);

    this.emailService = new EmailService(emailTransport, templateService);
  }

  /**
   * Ejecuta el caso de uso de agregar notificación
   * 
   * Estrategia de persistencia:
   * - MESSAGING: Solo SSE (ephemeral) - No persiste en DB
   * - Otros tipos: DB + SSE - Persiste para historial
   * 
   * @param userId - ID del usuario que recibirá la notificación
   * @param notification - Datos de la notificación (type, message, actionUrl, sourceType)
   * @returns Promise<void> - Fire-and-forget, errores se loggean internamente
   */
  async execute(
    userId: string,
    notification: AddNotificationRequest
  ): Promise<void> {
    try {
      // 1. Validar formato de userId
      const userIdResult = UserId.create(userId);
      if (!userIdResult.success) {
        logger.error({ 
          userId, 
          error: userIdResult.error.message 
        }, 'Invalid userId format when adding notification');
        return; // Silent fail - no bloquear operación principal
      }

      // 2. Decidir si persistir en DB según sourceType
      // Notificaciones de MESSAGING son efímeras (solo SSE)
      // porque el mensaje ya está persistido en collection messages
      const shouldPersist = notification.sourceType !== 'MESSAGING';
      
      if (shouldPersist) {
        // 2a. Persistir notificación en DB (para historial)
        const addResult = await this.userRepository.addNotification(
          userIdResult.data,
          {
            notificationType: notification.notificationType,
            message: notification.message,
            actionUrl: notification.actionUrl,
            sourceType: notification.sourceType,
            metadata: notification.metadata
          }
        );

        if (!addResult.success) {
          logger.error({ 
            userId,
            error: addResult.error.message,
            notificationType: notification.notificationType,
            sourceType: notification.sourceType
          }, 'Failed to persist notification to DB');
          return; // Silent fail
        }

        logger.info({ 
          userId,
          notificationType: notification.notificationType,
          sourceType: notification.sourceType,
          persisted: true
        }, 'Notification persisted to DB successfully');
      } else {
        // 2b. Notificación efímera (solo SSE, no DB)
        logger.debug({ 
          userId,
          notificationType: notification.notificationType,
          sourceType: notification.sourceType,
          persisted: false,
          reason: 'Ephemeral notification (message already in messages collection)'
        }, 'Skipping DB persistence for ephemeral notification');
      }

      // 3. Emit domain event for real-time push via SSE
      // EventBus → SSEManager → Push to all connected devices
      // Esto se ejecuta SIEMPRE (tanto para notificaciones persistentes como efímeras)
      // 
      // Note: addNotification returns Result<void>, so we construct event from input data.
      // For ephemeral notifications (MESSAGING), the notification ID doesn't matter
      // For persistent notifications, MongoDB generates subdocument _id
      try {
        eventBus.emit('notification-created', new NotificationCreatedEvent(
          userId,
          shouldPersist ? 'generated_by_db' : 'ephemeral_not_persisted', // Distinguish ephemeral vs persistent
          notification.notificationType,
          notification.message,
          new Date(), // Current timestamp
          notification.actionUrl,
          notification.sourceType,
          notification.metadata
        ));

        logger.debug({
          userId,
          notificationType: notification.notificationType,
          sourceType: notification.sourceType,
          sseEmitted: true,
          persisted: shouldPersist
        }, 'Domain event emitted: notification-created (SSE push)');
      } catch (eventError) {
        // Event emission failure shouldn't break notification creation
        // For persistent notifications: SSE is nice-to-have, DB persistence is critical
        // For ephemeral notifications: SSE is critical since there's no DB backup
        const errorMessage = eventError instanceof Error ? eventError.message : 'Unknown error';
        logger.error({
          userId,
          error: errorMessage,
          sourceType: notification.sourceType,
          persisted: shouldPersist
        }, 'Failed to emit notification-created event (SSE push failed)');
      }

      // 4. 🆕 Sprint #15 Task 8.7: Send email notification (fire-and-forget)
      // Solo enviar email si:
      // - NO es notificación efímera (MESSAGING)
      // - Usuario tiene emailNotifications activado
      // - No se excede rate limit (5 emails/hora)
      if (notification.sourceType !== 'MESSAGING') {
        this.sendEmailNotification(userId, notification)
          .catch(emailError => {
            logger.warn({
              userId,
              error: emailError instanceof Error ? emailError.message : 'Unknown error',
              notificationType: notification.notificationType,
              sourceType: notification.sourceType
            }, '⚠️ Failed to send email notification (non-blocking)');
          });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ 
        userId,
        error: errorMessage,
        notificationType: notification.notificationType
      }, 'Unexpected error adding notification');
      // No re-throw - fire-and-forget pattern
    }
  }

  /**
   * 🆕 Sprint #15 Task 8.7: Enviar notificación por email
   * 
   * Responsabilidades:
   * 1. Validar userId y obtener usuario desde DB
   * 2. Verificar preferencia emailNotifications del usuario
   * 3. Aplicar rate limiting (max 5 emails por hora)
   * 4. Construir datos para template (colores, helpers, metadata)
   * 5. Enviar email via EmailService.sendTemplatedEmail()
   * 
   * Fire-and-forget: errores se loggean pero no se propagan
   * 
   * @param userId - ID del usuario destinatario
   * @param notification - Datos de la notificación
   */
  private async sendEmailNotification(
    userId: string,
    notification: AddNotificationRequest
  ): Promise<void> {
    try {
      // 1. Validar userId y obtener usuario
      const userIdResult = UserId.create(userId);
      if (!userIdResult.success) {
        logger.debug({ userId }, 'Invalid userId format for email notification (skipping)');
        return;
      }

      const userResult = await this.userRepository.findById(userIdResult.data);
      if (!userResult.success) {
        logger.debug({ userId }, 'User not found for email notification (skipping)');
        return;
      }

      const user = userResult.data;
      const userPublicData = user.toPublicData();

      // 2. Verificar preferencia de email notifications
      // Default: true (opt-out approach) si el campo no existe
      const emailNotificationsEnabled = userPublicData.profile?.emailNotifications ?? true;
      
      if (!emailNotificationsEnabled) {
        logger.debug({ 
          userId,
          reason: 'User opted out of email notifications'
        }, 'Skipping email notification (user preference)');
        return;
      }

      // 3. Rate limiting: verificar que no se exceda el límite de emails por hora
      const canSendEmail = this.checkRateLimit(userId);
      if (!canSendEmail) {
        logger.warn({
          userId,
          limit: AddNotificationUseCase.MAX_EMAILS_PER_HOUR,
          windowHours: 1
        }, 'Email rate limit exceeded (skipping email)');
        return;
      }

      // 4. Construir datos para template
      const userName = userPublicData.profile?.companyName || userPublicData.email;
      
      // Colores dinámicos según notificationType
      const notificationColors = this.getNotificationColors(notification.notificationType);
      
      // Helpers booleanos para template (Handlebars if statements)
      const templateHelpers = {
        isSuccess: notification.notificationType === 'success',
        isWarning: notification.notificationType === 'warning',
        isError: notification.notificationType === 'error',
        isInfo: notification.notificationType === 'info',
        isNewMessage: notification.notificationType === 'new_message'
      };

      // Full actionUrl (si es relativo, convertir a absoluto)
      const fullActionUrl = notification.actionUrl 
        ? notification.actionUrl.startsWith('http') 
          ? notification.actionUrl 
          : `${config.app.baseUrl}${notification.actionUrl}`
        : undefined;

      // 4a. 🆕 Sprint #15 Task 8.7: Translate notification key to English message
      // Backend sends i18n keys (e.g., 'notification.machine.created')
      // Translate with metadata interpolation before sending to email template
      const translatedMessage = NotificationTranslatorService.translate(
        notification.message, // i18n key
        notification.metadata  // Variables for {{interpolation}}
      );

      logger.debug({
        userId,
        originalKey: notification.message,
        translatedMessage,
        hasTranslation: NotificationTranslatorService.hasTranslation(notification.message)
      }, 'Notification message translated for email');

      const templateData = {
        userName,
        message: translatedMessage, // ← Translated message (was: notification.message)
        notificationDate: new Date(),
        sourceType: notification.sourceType,
        actionUrl: fullActionUrl,
        metadata: notification.metadata,
        appBaseUrl: config.app.baseUrl,
        supportEmail: 'support@fleetman.com', // TODO: Mover a config
        year: new Date().getFullYear(),
        ...notificationColors,
        ...templateHelpers
      };
      
      // 5. Enviar email via EmailService
      const emailResult = await this.emailService.sendTemplatedEmail(
        'notification',
        userPublicData.email,
        this.getEmailSubject(notification, translatedMessage), // ← Pass translated message
        templateData
      );

      if (!emailResult.success) {
        logger.error({
          userId,
          error: emailResult.error.message,
          notificationType: notification.notificationType
        }, 'Failed to send email notification');
        return;
      }

      // 6. Registrar email enviado para rate limiting
      this.recordEmailSent(userId);

      logger.info({
        userId,
        email: userPublicData.email,
        notificationType: notification.notificationType,
        sourceType: notification.sourceType
      }, '📧 Email notification sent successfully');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({
        userId,
        error: errorMessage,
        notificationType: notification.notificationType
      }, 'Unexpected error sending email notification');
      // No re-throw - fire-and-forget
    }
  }

  /**
   * Verificar rate limit para envío de emails
   * Máximo 5 emails por hora por usuario
   * 
   * @param userId - ID del usuario
   * @returns true si puede enviar email, false si excede el límite
   */
  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const timestamps = AddNotificationUseCase.emailRateLimitMap.get(userId) || [];

    // Filtrar timestamps dentro de la ventana de 1 hora
    const recentTimestamps = timestamps.filter(
      ts => now - ts < AddNotificationUseCase.RATE_LIMIT_WINDOW_MS
    );

    // Actualizar mapa con timestamps recientes (limpiar antiguos)
    AddNotificationUseCase.emailRateLimitMap.set(userId, recentTimestamps);

    // Verificar si excede el límite
    return recentTimestamps.length < AddNotificationUseCase.MAX_EMAILS_PER_HOUR;
  }

  /**
   * Registrar que se envió un email (para rate limiting)
   * 
   * @param userId - ID del usuario
   */
  private recordEmailSent(userId: string): void {
    const timestamps = AddNotificationUseCase.emailRateLimitMap.get(userId) || [];
    timestamps.push(Date.now());
    AddNotificationUseCase.emailRateLimitMap.set(userId, timestamps);
  }

  /**
   * Obtener colores para template según notificationType
   * 
   * @param notificationType - Tipo de notificación
   * @returns Colores para background, border y button
   */
  private getNotificationColors(notificationType: string): {
    messageBackgroundColor: string;
    messageBorderColor: string;
    buttonColor: string;
  } {
    switch (notificationType) {
      case 'success':
        return {
          messageBackgroundColor: '#d1fae5',
          messageBorderColor: '#10b981',
          buttonColor: '#10b981'
        };
      case 'warning':
        return {
          messageBackgroundColor: '#fef3c7',
          messageBorderColor: '#f59e0b',
          buttonColor: '#f59e0b'
        };
      case 'error':
        return {
          messageBackgroundColor: '#fee2e2',
          messageBorderColor: '#ef4444',
          buttonColor: '#ef4444'
        };
      case 'new_message':
        return {
          messageBackgroundColor: '#dbeafe',
          messageBorderColor: '#3b82f6',
          buttonColor: '#3b82f6'
        };
      default: // 'info'
        return {
          messageBackgroundColor: '#dbeafe',
          messageBorderColor: '#3b82f6',
          buttonColor: '#3b82f6'
        };
    }
  }

  /**
   * Generar subject del email según notificación
   * 
   * @param notification - Datos de la notificación
   * @returns Subject del email
   */
  /**
   * 🆕 Sprint #15 Task 8.7: Generate email subject with translated message
   * 
   * @param notification - Notification request with i18n key
   * @param translatedMessage - Already translated message (English)
   * @returns Email subject with [SOURCE] prefix and translated preview
   */
  private getEmailSubject(
    notification: AddNotificationRequest, 
    translatedMessage: string
  ): string {
    const prefix = notification.sourceType 
      ? `[${notification.sourceType.toUpperCase()}]` 
      : '[FleetMan]';

    // Truncar mensaje traducido si es muy largo (max 50 chars en subject)
    const messagePreview = translatedMessage.length > 50
      ? `${translatedMessage.substring(0, 50)}...`
      : translatedMessage;

    return `${prefix} ${messagePreview}`;
  }

  // =============================================================================
  // 🔮 POST-MVP: FEATURES ESTRATÉGICOS (COMENTADOS)
  // =============================================================================

  /**
   * TODO: Batch Ephemeral Notifications
   * Agregar método para enviar notificaciones efímeras en batch (múltiples usuarios)
   * Use case: Broadcast de mantenimiento planificado a todos los usuarios afectados
   * 
   * @example
   * async executeBatch(
   *   userIds: string[],
   *   notification: AddNotificationRequest
   * ): Promise<{ success: number; failed: number }> {
   *   const results = await Promise.allSettled(
   *     userIds.map(id => this.execute(id, notification))
   *   );
   *   return {
   *     success: results.filter(r => r.status === 'fulfilled').length,
   *     failed: results.filter(r => r.status === 'rejected').length
   *   };
   * }
   */

  /**
   * TODO: TTL para Notificaciones Efímeras en Redis
   * Si necesitas garantizar entrega de notificaciones efímeras incluso si SSE falla,
   * considera almacenar temporalmente en Redis con TTL de 5 minutos
   * 
   * Flujo:
   * 1. Intenta SSE push
   * 2. Si falla, guarda en Redis con TTL
   * 3. Cuando usuario reconecta, recupera de Redis
   * 4. Después de entrega exitosa o TTL expira, borra de Redis
   * 
   * @example
   * if (!shouldPersist && sseEmitFailed) {
   *   await redisClient.setex(
   *     `ephemeral_notif:${userId}:${Date.now()}`,
   *     300, // 5 minutes TTL
   *     JSON.stringify(notification)
   *   );
   * }
   */

  /**
   * TODO: Rate Limiting para MESSAGING
   * Prevenir spam de mensajes/notificaciones
   * Límite sugerido: 50 mensajes por hora por usuario
   * 
   * @example
   * if (notification.sourceType === 'MESSAGING') {
   *   const rateLimitKey = `msg_rate:${userId}`;
   *   const msgCount = await redisClient.incr(rateLimitKey);
   *   if (msgCount === 1) {
   *     await redisClient.expire(rateLimitKey, 3600); // 1 hour
   *   }
   *   if (msgCount > 50) {
   *     logger.warn({ userId }, 'Message rate limit exceeded');
   *     throw new Error('RATE_LIMIT_EXCEEDED');
   *   }
   * }
   */

  /**
   * TODO: Configuración Dinámica de Tipos Efímeros
   * Permitir configurar qué sourceTypes son efímeros vs persistentes
   * mediante feature flags o config file
   * 
   * @example
   * const EPHEMERAL_SOURCES = ['MESSAGING', 'TYPING_INDICATOR', 'PRESENCE'];
   * const shouldPersist = !EPHEMERAL_SOURCES.includes(notification.sourceType);
   */

  /**
   * TODO: Metrics para Monitoreo
   * Agregar métricas de Prometheus/StatsD para tracking
   * 
   * Métricas sugeridas:
   * - notifications_sent_total{source_type, persisted}
   * - notifications_sse_failures_total{source_type}
   * - notifications_db_failures_total{source_type}
   * - notification_processing_duration_seconds{source_type}
   * - notifications_email_sent_total{source_type, notification_type} // 🆕 Sprint #15
   * - notifications_email_failures_total{source_type, notification_type} // 🆕 Sprint #15
   * - notifications_email_rate_limited_total{user_id} // 🆕 Sprint #15
   * 
   * @example
   * metrics.increment('notifications_sent_total', {
   *   source_type: notification.sourceType,
   *   persisted: shouldPersist.toString()
   * });
   * 
   * metrics.increment('notifications_email_sent_total', {
   *   source_type: notification.sourceType,
   *   notification_type: notification.notificationType
   * });
   */

  /**
   * TODO (Sprint #15 Task 8.7): Migrar Rate Limiting a Redis
   * Actualmente usa Map in-memory (no escala horizontalmente)
   * 
   * Beneficios de Redis:
   * - TTL automático (no necesita cleanup manual)
   * - Persistencia entre reinicios
   * - Compartido entre múltiples instancias de backend (horizontal scaling)
   * - Comandos atómicos (INCR + EXPIRE)
   * 
   * @example
   * async checkRateLimitRedis(userId: string): Promise<boolean> {
   *   const key = `email_rate:${userId}`;
   *   const count = await redisClient.incr(key);
   *   if (count === 1) {
   *     await redisClient.expire(key, 3600); // 1 hour TTL
   *   }
   *   return count <= MAX_EMAILS_PER_HOUR;
   * }
   */

  /**
   * TODO (Sprint #15 Task 8.7): Notification Digest Emails
   * Agrupar múltiples notificaciones en un solo email diario/semanal
   * Reduce inbox noise para usuarios con alta frecuencia de notificaciones
   * 
   * Estrategia:
   * - Cronjob diario/semanal que agrupa notificaciones no enviadas
   * - Template digest.hbs con lista de notificaciones
   * - User preference: "Immediate", "Daily", "Weekly", "Never"
   * - Tabla de pending_email_notifications o Redis queue
   * 
   * @example
   * interface DigestPreference {
   *   enabled: boolean;
   *   frequency: 'immediate' | 'daily' | 'weekly';
   *   time: string; // "09:00" - hora preferida para recibir digest
   * }
   * 
   * // En UserProfile:
   * emailNotificationDigest?: DigestPreference;
   */

  /**
   * TODO (Sprint #15 Task 8.7): Email Templates A/B Testing
   * Experimentar con diferentes diseños de emails para mejorar engagement
   * 
   * Métricas a trackear:
   * - Open rate (requiere pixel tracking)
   * - Click-through rate (requiere tracking links)
   * - Unsubscribe rate
   * 
   * Variantes a testear:
   * - CTA button color/text
   * - Subject line variations
   * - Email length (short vs detailed)
   * - Personalization level
   * 
   * Herramientas: SendGrid Email Activity API, Postmark Webhooks
   */

  /**
   * TODO (Sprint #15 Task 8.7): Unsubscribe Management
   * Permitir a usuarios darse de baja de emails con un click (sin login)
   * 
   * Implementación:
   * 1. Generar token único por usuario (JWT con exp=never, claim: userId)
   * 2. Incluir link en footer de emails: /unsubscribe?token=xxx
   * 3. Endpoint público que valida token y actualiza emailNotifications=false
   * 4. Página de confirmación con opción de resubscribe
   * 
   * Cumplimiento legal:
   * - CAN-SPAM Act (USA): Unsubscribe link obligatorio en emails comerciales
   * - GDPR (EU): Derecho a retirar consentimiento
   * 
   * @example
   * // En template footer:
   * <a href="{{appBaseUrl}}/unsubscribe?token={{unsubscribeToken}}">
   *   Dejar de recibir notificaciones por email
   * </a>
   */

  /**
   * TODO (Sprint #15 Task 8.7): Rich Email Content
   * Mejorar templates con contenido dinámico avanzado
   * 
   * Features estratégicos:
   * - Botones inline de acción (Approve/Reject mantenimiento)
   * - Imágenes de máquinas (desde Cloudinary)
   * - Gráficos de estado de máquina (chart.js server-side render)
   * - Timeline de eventos relacionados
   * - Mapa de ubicación de máquina (Google Maps Static API)
   * 
   * Consideraciones:
   * - Aumenta tamaño del email (impacto en deliverability)
   * - Compatibilidad con clientes de email (Gmail, Outlook, etc.)
   * - Requiere fallbacks para clientes sin soporte HTML
   */

  /**
   * TODO (Sprint #15 Task 8.7): Email Localization (i18n)
   * Enviar emails en el idioma preferido del usuario
   * 
   * Implementación:
   * 1. Agregar campo `preferredLanguage` a UserProfile ('es' | 'en')
   * 2. Crear templates duplicados: notification.es.hbs, notification.en.hbs
   * 3. O usar i18next para interpolación: t('notification.title', { lng: userLang })
   * 4. Traducir subjects, CTAs, footers
   * 
   * @example
   * const templateName = `notification.${user.preferredLanguage || 'es'}`;
   * await emailService.sendTemplatedEmail(templateName, ...);
   */
}
