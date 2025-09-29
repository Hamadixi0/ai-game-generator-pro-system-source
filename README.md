# 🎮 AI Game Generator Pro - Complete System

**Professional AI-powered game generation system supporting multiple platforms**

## 🚀 Features

- **Multi-Platform Support**: Flutter, React Native, Unity, Web
- **AI-Powered Generation**: OpenAI GPT-4 integration
- **Mobile Build Pipeline**: Codemagic CI/CD integration
- **Professional Architecture**: Enterprise-grade code structure
- **Complete Templates**: Ready-to-use game templates
- **API-First Design**: RESTful API for all operations

## 📱 Supported Platforms

### Flutter Games
- Flame engine integration
- Mobile-optimized performance
- Cross-platform compatibility
- Professional UI components

### React Native Games
- Game engine integration
- Native performance
- iOS and Android support
- Modern React patterns

### Unity Games
- C# script generation
- 2D and 3D support
- Professional game architecture
- Component-based design

### Web Games
- HTML5 Canvas
- Modern JavaScript
- Responsive design
- Cross-browser compatibility

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/Hamadixi0/ai-game-generator-pro-system-source.git
cd ai-game-generator-pro-system-source

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your OpenAI API key

# Start the server
npm start
```

## 🔧 Configuration

Create a `.env` file with:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
NODE_ENV=development
```

## 📡 API Endpoints

### Generate Game
```http
POST /api/generate
Content-Type: application/json

{
  "platform": "flutter",
  "description": "A space shooter game with power-ups",
  "gameType": "arcade"
}
```

### System Status
```http
GET /api/status
```

### Health Check
```http
GET /
```

## 🏗️ Architecture

```
src/
├── agents/
│   ├── GameCodeGenerator.js    # Main AI game generator
│   ├── GitHubIntegrator.js      # GitHub API integration
│   └── MobileAppBuilder.js      # Mobile build pipeline
├── templates/
│   ├── flutter/                 # Flutter game templates
│   ├── react-native/           # React Native templates
│   ├── unity/                  # Unity script templates
│   └── web/                    # Web game templates
├── utils/
│   ├── fileManager.js          # File operations
│   └── validators.js           # Input validation
└── config/
    └── database.js             # Database configuration
```

## 🚀 Mobile Builds

This system integrates with Codemagic for automated mobile builds:

- **Automatic APK Generation**: Android builds via Codemagic
- **iOS App Store Builds**: iOS builds with proper signing
- **CI/CD Pipeline**: Automated testing and deployment
- **Build Notifications**: Real-time build status updates

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run in development mode
npm run dev
```

## 📚 Game Templates

The system includes professional game templates for:

- **Arcade Games**: Classic arcade-style games
- **Puzzle Games**: Logic and puzzle-based games
- **Action Games**: Fast-paced action games
- **Strategy Games**: Turn-based and real-time strategy
- **Educational Games**: Learning and educational content

## 🔐 Security

- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization
- Rate limiting
- Environment variable protection

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API examples

---

**Built with ❤️ using AI and modern web technologies**