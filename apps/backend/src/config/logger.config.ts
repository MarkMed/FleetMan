import pino from 'pino';
import { config } from './env.config.js';

// Configuración del logger basada en el ambiente
const loggerConfig = pino({
  level: config.isDevelopment ? 'debug' : 'info',
  transport: config.isDevelopment 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

export const logger = loggerConfig;

// Helper para logging de requests HTTP
export const createRequestLogger = () => {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      };

      if (res.statusCode >= 400) {
        logger.warn(logData, 'HTTP Request');
      } else {
        logger.info(logData, 'HTTP Request');
      }
    });

    next();
  };
};