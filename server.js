const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'AI Game Generator Pro API',
    version: '1.0.0',
    endpoints: {
      '/api/generate': 'POST - Generate game code',
      '/api/status': 'GET - Check system status'
    }
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.post('/api/generate', (req, res) => {
  const { platform, description } = req.body;
  
  if (!platform || !description) {
    return res.status(400).json({
      error: 'Platform and description are required'
    });
  }
  
  res.json({
    message: 'Game generation started',
    platform,
    description,
    status: 'processing'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎮 AI Game Generator Pro server running on port ${PORT}`);
});

module.exports = app;