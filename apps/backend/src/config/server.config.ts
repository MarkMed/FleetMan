import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './env.config.js';
import { createRequestLogger, logger } from './logger.config.js';

export const createApp = (): express.Application => {
  const app = express();

  // Security middlewares
  app.use(helmet({
    contentSecurityPolicy: config.isDevelopment ? false : undefined,
    crossOriginEmbedderPolicy: false,
  }));

  // CORS configuration
  app.use(cors({
    origin: config.cors.origin,
    credentials: true,
    optionsSuccessStatus: 200, // Para legacy browsers
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
      error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // Request logging
  app.use(createRequestLogger());

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.env,
    });
  });

  // Basic API info endpoint
  app.get('/api', (req, res) => {
    res.status(200).json({
      name: 'FleetMan API',
      version: '1.0.0',
      description: 'Fleet Management System API',
      environment: config.env,
    });
  });

  return app;
};

export const startServer = (app: express.Application): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const server = app.listen(config.port, () => {
        logger.info(`🚀 Server running on port ${config.port} in ${config.env} mode`);
        logger.info(`🌐 API available at http://localhost:${config.port}/api`);
        logger.info(`❤️  Health check at http://localhost:${config.port}/health`);
        resolve();
      });

      server.on('error', (error: Error) => {
        logger.error({ error: error.message }, 'Server failed to start');
        reject(error);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => {
        logger.info('SIGTERM received, shutting down gracefully');
        server.close(() => {
          logger.info('Process terminated');
          process.exit(0);
        });
      });

    } catch (error) {
      logger.error({ error }, 'Error starting server');
      reject(error);
    }
  });
};