import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/products.js';
import complianceRoutes from './routes/compliance.js';
import scrapeRoutes from './routes/scrape.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Middleware - Fixed with proper configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000', 
      'https://project-prakriti-frontend.vercel.app',
      'https://automated-compliance-checker.vercel.app' // Add your actual Vercel domain
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Request-Id']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/scrape', scrapeRoutes);

// Health check with CORS headers
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'Project Prakriti API is running!',
    timestamp: new Date().toISOString(),
    cors: 'Enabled'
  });
});

// Root route for Render
app.get('/', (req, res) => {
  res.json({ 
    message: 'Project Prakriti Backend API',
    status: 'Running ✅',
    environment: process.env.NODE_ENV,
    cors: 'Enabled for all required origins'
  });
});

// MongoDB connection with error handling
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`✅ CORS enabled for: localhost:5173, localhost:3000, project-prakriti-frontend.vercel.app`);
});