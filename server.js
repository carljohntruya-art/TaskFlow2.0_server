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

// Security Middleware
app.use(helmet());

// CORS configuration - Allow frontend origin only
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || env.FRONTEND_ORIGIN,
  credentials: true,        // Required for cookies cross-domain
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser & Cookie parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// HTTP request logger
if (env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate Limiting for Auth routes (max 10 req/15min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

app.use('/api/auth/', authLimiter);

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

    // Add Error Middlewares
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
