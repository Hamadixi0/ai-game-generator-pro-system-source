const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// API Endpoints
app.get('/', (req, res) => {
  res.send('Welcome to AI Game Generator Pro API!');
});

app.post('/generate-game', (req, res) => {
  const { gameName, platform } = req.body;
  // Logic to generate game code
  res.json({ message: `Game ${gameName} for ${platform} is being generated.` });
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});