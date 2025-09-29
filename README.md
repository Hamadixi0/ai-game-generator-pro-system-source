# AI Game Generator Pro - Mobile App Creator System

Welcome to the AI Game Generator Pro system! This repository contains the complete source code for a production-ready system that generates mobile game applications using AI and integrates with GitHub, Adalo, and Codemagic for seamless development and deployment workflows.

## Features

- **AI-Powered Game Code Generation**: Automatically generate game code using OpenAI's GPT models.
- **Mobile App Templates**: Pre-built templates for Flutter and React Native.
- **GitHub Integration**: Manage repositories and upload generated code.
- **Adalo Integration**: Build and deploy mobile apps with Adalo.
- **Codemagic Integration**: Automate CI/CD pipelines for mobile apps.
- **Customizable Assets**: Generate sprites, sounds, and UI assets using AI.

## System Architecture

The system is divided into the following components:

1. **Main Application Files**:
   - `package.json`: Dependencies and scripts.
   - `server.js`: Main application entry point.
   - `app.js`: Express application setup.
   - `config/`: Configuration files for external APIs.
   - `routes/`: API route handlers.
   - `middleware/`: Authentication and validation middleware.

2. **Core System Components**:
   - `src/agents/`: AI agents for game code generation, GitHub integration, and mobile app building.
   - `src/workflows/`: Workflow orchestration.
   - `src/templates/`: Game template management.
   - `src/utils/`: Utility functions for asset generation.
   - `src/api/`: Main API endpoints.

3. **Game Templates System**:
   - `templates/flutter/`: Flutter game templates.
   - `templates/react-native/`: React Native templates.
   - `templates/assets/`: Sprite, sound, and UI asset templates.
   - `templates/configs/`: Build configuration templates.

4. **AI Integration**:
   - `src/ai/`: OpenAI API integration and prompt management.

5. **External API Integrations**:
   - `src/integrations/`: Wrappers for GitHub, Adalo, and Codemagic APIs.

6. **Database & Storage**:
   - `models/`: Database models.
   - `database/migrations/`: Database migration files.
   - `storage/`: File storage utilities.

7. **Frontend Interface**:
   - `public/`: Static frontend files.
   - `views/`: Template engine views.
   - `static/css/`: Styling.
   - `static/js/`: Frontend JavaScript.

8. **Documentation & Config**:
   - `README.md`: Setup and usage guide.
   - `API.md`: API documentation.
   - `ARCHITECTURE.md`: System architecture documentation.
   - `docker-compose.yml`: Docker setup.
   - `.env.example`: Environment variables template.

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/Hamadixi0/ai-game-generator-pro-system-source.git
   ```

2. Install dependencies:
   ```bash
   cd ai-game-generator-pro-system-source
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env` and fill in the required values.

4. Start the application:
   ```bash
   npm start
   ```

5. Access the application at `http://localhost:3000`.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.