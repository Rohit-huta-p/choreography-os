import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import config from './config/env.js';
import connectDB from './config/db.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import canvasRoutes from './routes/canvas.routes.js';
import performanceRoutes from './routes/performance.routes.js';
import performerRoutes from './routes/performer.routes.js';
import propRoutes from './routes/prop.routes.js';
import showflowRoutes from './routes/showflow.routes.js';
import taskRoutes from './routes/task.routes.js';
import searchRoutes from './routes/search.routes.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use('/api/v1', apiLimiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/projects', canvasRoutes);
app.use('/api/v1/projects', performanceRoutes);
app.use('/api/v1/projects', performerRoutes);
app.use('/api/v1/projects', propRoutes);
app.use('/api/v1/projects', showflowRoutes);
app.use('/api/v1/projects', taskRoutes);
app.use('/api/v1/projects', searchRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start server
const start = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
  });
};

start();

export default app;
