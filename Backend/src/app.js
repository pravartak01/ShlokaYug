const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
require('dotenv').config();

// Import route modules
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courses');

// Phase 2 Routes - Enrollment & Payment System
const enrollmentRoutes = require('./routes/enrollments');
const paymentRoutes = require('./routes/payments');
const subscriptionRoutes = require('./routes/subscriptions');

// const userRoutes = require('./routes/userRoutes');
// const shlokaRoutes = require('./routes/shlokaRoutes');
// const chandasRoutes = require('./routes/chandasRoutes');
// const audioRoutes = require('./routes/audioRoutes');
// const aiRoutes = require('./routes/aiRoutes');
// const communityRoutes = require('./routes/communityRoutes');
// const liveSessionRoutes = require('./routes/liveSessionRoutes');
// const gamificationRoutes = require('./routes/gamificationRoutes');
// const adminRoutes = require('./routes/adminRoutes');
// const notificationRoutes = require('./routes/notificationRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const validateRequest = require('./middleware/validateRequest');

// Import database connection
const connectDB = require('./config/database');

// Import services
const { initializeCloudinary } = require('./config/cloudinary');

const app = express();

// Trust proxy for accurate client IP
app.set('trust proxy', 1);

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        scriptSrc: ["'self'"],
        mediaSrc: ["'self'", 'https://res.cloudinary.com'],
        connectSrc: ["'self'", 'https://api.gemini.google.com'],
      },
    },
  })
);

// CORS configuration
app.use(
  cors({
    origin(origin, callback) {
      // In development, allow all origins
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }

      const allowedOrigins = [
        process.env.FRONTEND_URL,
        process.env.MOBILE_APP_URL,
        'http://localhost:3000',
        'http://localhost:19006', // Expo web
        'exp://localhost:19000', // Expo mobile
        'http://localhost:5173', // Vite dev server (Website)
        // Vite dev server (Web-App)
      ].filter(Boolean);

      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600, // Cache preflight for 10 minutes
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(
  hpp({
    whitelist: ['tags', 'category', 'difficulty'], // Allow duplicate query params for these fields
  })
);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ShlokaYug Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API Routes
const API_VERSION = process.env.API_VERSION || 'v1';

app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/courses`, courseRoutes);

// Phase 2 Routes - Enrollment & Payment System
app.use(`/api/${API_VERSION}/enrollments`, enrollmentRoutes);
app.use(`/api/${API_VERSION}/payments`, paymentRoutes);
app.use(`/api/${API_VERSION}/subscriptions`, subscriptionRoutes);

// app.use(`/api/${API_VERSION}/users`, userRoutes);
// app.use(`/api/${API_VERSION}/shlokas`, shlokaRoutes);
// app.use(`/api/${API_VERSION}/chandas`, chandasRoutes);
// app.use(`/api/${API_VERSION}/audio`, audioRoutes);
// app.use(`/api/${API_VERSION}/ai`, aiRoutes);
// app.use(`/api/${API_VERSION}/live-sessions`, liveSessionRoutes);
// app.use(`/api/${API_VERSION}/gamification`, gamificationRoutes);
// app.use(`/api/${API_VERSION}/admin`, adminRoutes);
// app.use(`/api/${API_VERSION}/notifications`, notificationRoutes);

// Swagger documentation (in development)
if (process.env.NODE_ENV === 'development') {
  // const swaggerUi = require('swagger-ui-express');
  // const swaggerDocument = require('../docs/swagger.json');

  // app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Redirect root to swagger docs in development
  console.log('Swagger docs will be available at /api-docs when implemented');
}

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Initialize services
async function initializeServices() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB connected successfully');

    // Initialize Cloudinary
    initializeCloudinary();
    console.log('✅ Cloudinary configured successfully');
    
    console.log('🚀 All services initialized successfully');
  } catch (error) {
    console.error('❌ Service initialization failed:', error.message);
    process.exit(1);
  }
}

// Start server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

if (require.main === module) {
  initializeServices()
    .then(() => {
      const server = app.listen(PORT, HOST, () => {
        console.log(`
🕉️  ShlokaYug Backend API Server
📍 Running on ${HOST}:${PORT}
🌍 Environment: ${process.env.NODE_ENV}
📚 API Version: ${API_VERSION}
${process.env.NODE_ENV === 'development' ? `📖 Documentation: http://localhost:${PORT}/api-docs` : ''}
🙏 Sanskrit Learning Platform Backend Ready!
      `);
      });

      // Handle WebSocket connections for real-time features
      const http = require('http');
      const socketIo = require('socket.io');

      const httpServer = http.createServer(app);
      const io = socketIo(httpServer, {
        cors: {
          origin: [
            process.env.FRONTEND_URL,
            process.env.MOBILE_APP_URL,
            'http://localhost:3000',
            'http://localhost:19006',
          ].filter(Boolean),
          credentials: true,
        },
      });

      // Socket.IO setup (basic for now)
      io.on('connection', (socket) => {
        console.log('🔌 User connected:', socket.id);

        socket.on('disconnect', () => {
          console.log('📴 User disconnected:', socket.id);
        });
      });

      // Graceful shutdown
      process.on('SIGTERM', () => {
        console.log('SIGTERM received. Shutting down gracefully...');
        server.close(() => {
          mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed.');
            process.exit(0);
          });
        });
      });

      process.on('SIGINT', () => {
        console.log('SIGINT received. Shutting down gracefully...');
        server.close(() => {
          mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed.');
            process.exit(0);
          });
        });
      });
    })
    .catch((error) => {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    });
}

module.exports = app;
