const axios = require('axios');

class GameCodeGenerator {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.openai.com/v1/completions';
  }

  async generateGameCode(gameName, platform) {
    try {
      const prompt = `Generate a ${platform} game code for a game called ${gameName}.`;

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'text-davinci-003',
          prompt: prompt,
          max_tokens: 1500,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.choices[0].text;
    } catch (error) {
      console.error('Error generating game code:', error);
      throw new Error('Failed to generate game code.');
    }
  }
}

module.exports = GameCodeGenerator;