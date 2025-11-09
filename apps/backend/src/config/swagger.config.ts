import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

// Configuración base de Swagger
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FleetMan API',
      version: '1.0.0',
      description: 'API para el sistema de gestión de flotas FleetMan',
      contact: {
        name: 'FleetMan Team',
        email: 'support@fleetman.com',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.fleetman.com' 
          : `http://localhost:${process.env.PORT || 3001}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using Bearer scheme',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            message: {
              type: 'string',
              description: 'Detailed error description',
            },
            statusCode: {
              type: 'number',
              description: 'HTTP status code',
            },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'ok',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
            uptime: {
              type: 'number',
              description: 'Server uptime in seconds',
            },
            environment: {
              type: 'string',
              example: 'development',
            },
          },
        },
        ApiInfo: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'FleetMan API',
            },
            version: {
              type: 'string',
              example: '1.0.0',
            },
            description: {
              type: 'string',
              example: 'Fleet Management System API',
            },
            environment: {
              type: 'string',
              example: 'development',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.ts',           // Rutas principales
    './src/controllers/*.ts',      // Controladores
    './src/main.ts',              // Archivo principal para endpoints básicos
    './src/interfaces/http/*.ts', // Interfaces HTTP según arquitectura
  ],
};

// Generar especificación de Swagger
export const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Configurar Swagger UI
export const setupSwagger = (app: Express): void => {
  // Configuración personalizada de Swagger UI
  const swaggerUiOptions = {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0 }
      .swagger-ui .scheme-container { 
        background: #f8f9fa; 
        border: 1px solid #e9ecef; 
        border-radius: 4px; 
        padding: 10px; 
        margin: 10px 0; 
      }
    `,
    customSiteTitle: 'FleetMan API Documentation',
  };

  // Endpoint para servir la documentación de Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  // Endpoint para obtener el JSON de la especificación
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`📚 Swagger documentation available at http://localhost:${process.env.PORT || 3001}/api-docs`);
};

export default { swaggerSpec, setupSwagger };