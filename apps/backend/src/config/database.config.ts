import mongoose from 'mongoose';
import { config } from './env.config.js';
import { logger } from './logger.config.js';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodb.uri, {
      // Opciones recomendadas para Mongoose 8.x
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      bufferCommands: false, // Disable mongoose buffering
    });

    logger.info('📦 Connected to MongoDB successfully');

    // Manejar eventos de conexión
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('📦 MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('📦 MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('📦 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error({ error }, 'Failed to connect to MongoDB:');
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('📦 Disconnected from MongoDB');
  } catch (error) {
    logger.error({ error }, 'Error disconnecting from MongoDB:');
  }
};