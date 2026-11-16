const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB, getDbStatus, loadFileStore, saveFileStore } = require('./config/db');
const { seedInitialDecisions } = require('./services/seedService');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const decisionRoutes = require('./routes/decisionRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Initialize in-memory / persistent fallback stores
const initialStores = loadFileStore();
app.locals.fallbackUsers = initialStores.users;
app.locals.fallbackDecisions = initialStores.decisions;
app.locals.persistStore = () => {
  saveFileStore(app.locals.fallbackUsers, app.locals.fallbackDecisions);
};

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static frontend path
const frontendDist = path.join(__dirname, '../frontend/dist');

// Serve static assets with high-performance HTTP caching (immutable hashed assets)
app.use(
  '/assets',
  express.static(path.join(frontendDist, 'assets'), {
    maxAge: '1y',
    immutable: true,
  })
);

app.use(
  express.static(frontendDist, {
    maxAge: '1h',
  })
);

// Health Check Endpoints (Required for Railway / Docker / Kubernetes)
app.get(['/health', '/api/health'], (req, res) => {
  const dbStatus = getDbStatus();
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'DECISION MATRIX Intelligence API',
    version: '1.0.0',
    uptime: process.uptime(),
    database: dbStatus,
    aiProvider: process.env.AI_PROVIDER || 'gemini',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.AI_API_KEY),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/decisions', decisionRoutes);
app.use('/api/users', userRoutes);

// Catch-all route to serve Frontend SPA index.html
app.use((req, res, next) => {
  // If request is for an unhandled /api/* route, return 404 JSON
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: `API route ${req.url} not found.` });
  }

  const indexPath = path.join(frontendDist, 'index.html');
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // If frontend dist not yet built
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>DECISION MATRIX API</title></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background: #0b0f19; color: #f8fafc; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; background: #131b2e; padding: 32px; border-radius: 12px; border: 1px solid #1e293b;">
              <h1 style="color: #38bdf8; margin-top: 0;">⚡ DECISION MATRIX API</h1>
              <p>Decision Intelligence Backend is active and running on port <strong>${process.env.PORT || 5000}</strong>.</p>
              <p>Endpoints:</p>
              <ul>
                <li><a href="/api/health" style="color: #60a5fa;">/api/health</a> - System Health & AI Status</li>
                <li><a href="/api/decisions" style="color: #60a5fa;">/api/decisions</a> - Decisions Data</li>
                <li><a href="/api/decisions/criteria" style="color: #60a5fa;">/api/decisions/criteria</a> - 14 Multi-Dimensional Criteria</li>
              </ul>
            </div>
          </body>
        </html>
      `);
    }
  });
});

// Centralized Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server and Database
const startServer = async () => {
  await connectDB();
  await seedInitialDecisions(app.locals);

  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 DECISION MATRIX Server listening on port: ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });

  return server;
};

startServer();

module.exports = app;
