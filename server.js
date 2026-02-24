require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const db = require('./config/db');
const User = require('./models/userModel');
const Task = require('./models/taskModel');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Build the list of allowed origins from the environment variable.
// FRONTEND_ORIGIN can be a comma-separated list, e.g.:
//   FRONTEND_ORIGIN=https://taskflow2-0.vercel.app,https://task-flow2-0-three.vercel.app
const rawOrigin = process.env.FRONTEND_ORIGIN || env.FRONTEND_ORIGIN || '';
const allowedOrigins = rawOrigin
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)
  .concat(['http://localhost:3000', 'http://localhost:5173']); // always allow local dev

console.log('[CORS] Allowed origins:', allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(new Error(`CORS policy: Origin '${origin}' is not allowed.`));
    }
  },
  credentials: true,        // Required for cookies cross-domain
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", ...allowedOrigins]
    }
  }
}));

// CORS — must come before routes so preflight OPTIONS requests are handled
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle preflight for all routes explicitly

// Body parser & Cookie parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// HTTP request logger
if (env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate Limiting — login & register only (not /me or /logout)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

const taskLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests' }
});
app.use('/api/tasks/', taskLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.send('TaskFlow API is running');
});

// Setup Database & Start Server
const startServer = async () => {
  try {
    // Check DB connection
    const client = await db.pool.connect();
    console.log('Connected to PostgreSQL Database');
    client.release();

    // Ensure tables exist
    await User.ensureTableExists();
    await Task.ensureTableExists();
    console.log('Database tables verified/created');

    // Add Error Middlewares (must be after routes)
    app.use(notFound);
    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
