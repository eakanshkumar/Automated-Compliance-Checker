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

// CORS Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', // local frontend
    process.env.FRONTEND_URL, // production frontend
  ],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/scrape', scrapeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Project Prakriti API is running!' });
});

// Root route for Render
app.get('/', (req, res) => {
  res.json({ 
    message: 'Project Prakriti Backend API',
    status: 'Running ✅',
    environment: process.env.NODE_ENV
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
