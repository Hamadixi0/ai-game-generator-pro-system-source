const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Routes
const gameRoutes = require('./routes/gameRoutes');
app.use('/api/games', gameRoutes);

module.exports = app;