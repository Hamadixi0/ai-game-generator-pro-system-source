const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

class GameCodeGenerator {
  constructor() {
    this.supportedPlatforms = ['flutter', 'react-native', 'unity', 'web'];
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateGame(params) {
    const { description, platform, gameType = 'arcade' } = params;
    
    if (!this.supportedPlatforms.includes(platform)) {
      throw new Error(`Platform ${platform} not supported. Supported: ${this.supportedPlatforms.join(', ')}`);
    }

    console.log(`Generating ${platform} game: ${description}`);
    
    try {
      const gameCode = await this.generateCodeWithAI(description, platform, gameType);
      const files = await this.createGameFiles(gameCode, platform);
      
      return {
        platform,
        gameType,
        description,
        files,
        status: 'generated',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Game generation failed:', error);
      throw new Error(`Game generation failed: ${error.message}`);
    }
  }

  async generateCodeWithAI(description, platform, gameType) {
    const prompt = `Generate a complete ${platform} ${gameType} game based on this description: ${description}.
    
    Requirements:
    - Complete, runnable code
    - Modern best practices
    - Clean architecture
    - Comments explaining key parts
    - Error handling
    
    Platform: ${platform}
    Game Type: ${gameType}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.7
    });

    return response.choices[0].message.content;
  }

  async createGameFiles(code, platform) {
    const files = {};
    
    switch (platform) {
      case 'flutter':
        files['lib/main.dart'] = code;
        files['pubspec.yaml'] = this.generateFlutterPubspec();
        break;
      case 'react-native':
        files['App.js'] = code;
        files['package.json'] = this.generateRNPackageJson();
        break;
      case 'unity':
        files['GameManager.cs'] = code;
        break;
      case 'web':
        files['index.html'] = this.generateWebHTML();
        files['game.js'] = code;
        files['style.css'] = this.generateWebCSS();
        break;
    }
    
    return files;
  }

  generateFlutterPubspec() {
    return `name: ai_generated_game
description: AI Generated Flutter Game
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flame: ^1.10.0

dev_dependencies:
  flutter_test:
    sdk: flutter

flutter:
  uses-material-design: true`;
  }

  generateRNPackageJson() {
    return JSON.stringify({
      name: 'AIGeneratedGame',
      version: '1.0.0',
      dependencies: {
        'react': '^18.2.0',
        'react-native': '^0.72.0',
        'react-native-game-engine': '^1.2.0'
      }
    }, null, 2);
  }

  generateWebHTML() {
    return `<!DOCTYPE html>
<html>
<head>
    <title>AI Generated Game</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <script src="game.js"></script>
</body>
</html>`;
  }

  generateWebCSS() {
    return `body {
  margin: 0;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #1a1a1a;
  font-family: Arial, sans-serif;
}

#gameCanvas {
  border: 2px solid #333;
  background: #000;
}`;
  }
}

module.exports = GameCodeGenerator;