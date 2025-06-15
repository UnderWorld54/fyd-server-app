import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';

import { connectDB } from './config/database';
import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

import { errorHandler, notFound } from './middleware/errorHandler';

// Configuration
dotenv.config();

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.connectDatabase();
    this.initializeMiddleware();
    this.initializeSwagger();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private async connectDatabase(): Promise<void> {
    await connectDB();
  }

  private initializeMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(morgan('combined'));

    /*
    this.app.use(rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 500, // 100 requêtes par IP
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: 'Too many requests, please try again later.'
      }
    }));
    */

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeSwagger(): void {
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  private initializeRoutes(): void {
    // Route de santé
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
      });
    });

    // Routes API
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
  }

  private initializeErrorHandling(): void {
    this.app.use(notFound);
    this.app.use(errorHandler);
  }
}

export default App;