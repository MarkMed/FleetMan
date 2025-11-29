// /apps/backend/src/main.ts
// Punto de entrada del backend

import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { setupSwagger } from './config/swagger.config';
import { requestSanitization } from './middlewares/requestSanitization';
import routes from './routes';
import { connectDatabase } from './config/database.config';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
// app.use(cors({
//   origin: ['http://localhost:5173', 'http://localhost:3000'], // Vite dev server and backup
//   credentials: true,
//   optionsSuccessStatus: 200,
// }));
app.use(cors()); // Permitir todas las fuentes por ahora

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// XSS Sanitization middleware - aplicar después del body parsing
app.use(requestSanitization);

// Setup Swagger documentation
setupSwagger(app);

// API Routes v1
app.use('/api/v1', routes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current status of the API server
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * @swagger
 * /api:
 *   get:
 *     summary: API information
 *     description: Returns basic information about the FleetMan API
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiInfo'
 */
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'FleetMan API',
    version: '1.0.0',
    description: 'Fleet Management System API',
    environment: process.env.NODE_ENV || 'development',
  });
});

// TODO: Remove this line when routes are registered above
// app.use('/api/v1', routes);

// Función principal para inicializar la aplicación
(async () => {
  try {
    // 1. Conectar con DB
    await connectDatabase();
    
    // 2. Iniciar servidor HTTP
    app.listen(PORT, () => {
      console.log(`🚀 FleetMan Backend running on port ${PORT}`);
      console.log(`🌐 API available at http://localhost:${PORT}/api`);
      console.log(`❤️  Health check at http://localhost:${PORT}/health`);
      console.log(`📚 Swagger docs at http://localhost:${PORT}/api-docs`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    console.error("Error al inicializar la aplicación:", error);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  const { disconnectDatabase } = await import('./config/database.config');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  const { disconnectDatabase } = await import('./config/database.config');
  await disconnectDatabase();
  process.exit(0);
});