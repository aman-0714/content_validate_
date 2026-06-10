require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const analysisRoutes = require('./routes/analysis.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const exportRoutes = require('./routes/export.routes');

const app = express();

app.set('trust proxy', 1);

connectDB();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const generalLimiter  = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many requests. Please wait 15 minutes and try again.' }
});

app.use('/api/', generalLimiter);
app.use('/api/analysis/analyze', analysisLimiter);

app.use('/api/auth',      authRoutes);
app.use('/api/analysis',  analysisRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/export',    exportRoutes);   // covers /:id/pdf, /:id/share, /shared/:token

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Content Idea Validator API is running', port: process.env.PORT });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});
