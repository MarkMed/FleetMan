// Punto de entrada del paquete de Infra no-DB (mailer, scheduler, clock, logger).

// Sprint #15 - Email Infrastructure
export * from './email/NodemailerTransport';
export * from './email/EmailTemplateService';
export * from './email/EmailService';

export function initInfra() {
  return { ok: true };
}
