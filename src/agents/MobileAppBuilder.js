const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class MobileAppBuilder {
  constructor() {
    this.codemagicApiUrl = 'https://api.codemagic.io/builds';
    this.apiToken = process.env.CODEMAGIC_API_TOKEN;
    this.appId = process.env.CODEMAGIC_APP_ID;
  }

  async buildMobileApp(gameData, platform) {
    const { name, repository, files } = gameData;
    
    try {
      console.log(`Starting ${platform} build for: ${name}`);
      
      // Prepare build configuration
      const buildConfig = this.createBuildConfig(gameData, platform);
      
      // Start build process
      const buildResult = await this.startBuild(buildConfig);
      
      // Monitor build progress
      const finalResult = await this.monitorBuild(buildResult.buildId);
      
      return {
        buildId: buildResult.buildId,
        status: finalResult.status,
        downloadUrl: finalResult.downloadUrl,
        platform,
        appName: name,
        buildTime: finalResult.buildTime
      };
    } catch (error) {
      console.error('Mobile build failed:', error);
      throw new Error(`Mobile build failed: ${error.message}`);
    }
  }

  createBuildConfig(gameData, platform) {
    const { name, repository, description } = gameData;
    
    const baseConfig = {
      appId: this.appId,
      branch: 'main',
      environment: {
        flutter: '3.13.0',
        xcode: 'latest',
        node: '18.17.0'
      },
      scripts: this.getBuildScripts(platform),
      artifacts: this.getArtifactPaths(platform),
      publishing: {
        email: {
          recipients: ['build@example.com'],
          notify: {
            success: true,
            failure: true
          }
        }
      }
    };

    // Platform-specific configurations
    if (platform === 'android') {
      baseConfig.android = {
        signing: {
          debug: true,
          release: {
            keystore: process.env.ANDROID_KEYSTORE_PATH,
            keystore_password: process.env.ANDROID_KEYSTORE_PASSWORD,
            key_alias: process.env.ANDROID_KEY_ALIAS,
            key_password: process.env.ANDROID_KEY_PASSWORD
          }
        }
      };
    }

    if (platform === 'ios') {
      baseConfig.ios = {
        signing: {
          certificate: process.env.IOS_CERTIFICATE_PATH,
          certificate_password: process.env.IOS_CERTIFICATE_PASSWORD,
          provisioning_profile: process.env.IOS_PROVISIONING_PROFILE
        }
      };
    }

    return baseConfig;
  }

  getBuildScripts(platform) {
    const scripts = {
      flutter: {
        android: [
          'flutter packages get',
          'flutter build apk --release',
          'flutter build appbundle --release'
        ],
        ios: [
          'flutter packages get',
          'flutter build ios --release --no-codesign',
          'xcodebuild -workspace ios/Runner.xcworkspace -scheme Runner -configuration Release archive -archivePath build/Runner.xcarchive',
          'xcodebuild -exportArchive -archivePath build/Runner.xcarchive -exportPath build/ios -exportOptionsPlist ios/ExportOptions.plist'
        ]
      },
      'react-native': {
        android: [
          'npm install',
          'cd android && ./gradlew assembleRelease',
          'cd android && ./gradlew bundleRelease'
        ],
        ios: [
          'npm install',
          'cd ios && pod install',
          'xcodebuild -workspace ios/GameApp.xcworkspace -scheme GameApp -configuration Release archive -archivePath build/GameApp.xcarchive',
          'xcodebuild -exportArchive -archivePath build/GameApp.xcarchive -exportPath build/ios -exportOptionsPlist ios/ExportOptions.plist'
        ]
      }
    };

    return scripts.flutter?.[platform] || scripts['react-native']?.[platform] || [];
  }

  getArtifactPaths(platform) {
    const paths = {
      android: [
        'build/app/outputs/flutter-apk/app-release.apk',
        'build/app/outputs/bundle/release/app-release.aab'
      ],
      ios: [
        'build/ios/*.ipa'
      ]
    };

    return paths[platform] || [];
  }

  async startBuild(config) {
    try {
      const response = await axios.post(this.codemagicApiUrl, config, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': this.apiToken
        }
      });

      return {
        buildId: response.data.build._id,
        status: response.data.build.status,
        startTime: response.data.build.startedAt
      };
    } catch (error) {
      console.error('Failed to start build:', error.response?.data || error.message);
      throw new Error(`Build start failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async monitorBuild(buildId, maxWaitTime = 1800000) { // 30 minutes max
    const startTime = Date.now();
    const pollInterval = 30000; // 30 seconds

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const status = await this.getBuildStatus(buildId);
        
        console.log(`Build ${buildId} status: ${status.status}`);
        
        if (status.status === 'finished') {
          return {
            status: 'success',
            downloadUrl: status.artifacts?.[0]?.url,
            buildTime: Date.now() - startTime
          };
        }
        
        if (status.status === 'failed' || status.status === 'canceled') {
          throw new Error(`Build ${status.status}: ${status.error || 'Unknown error'}`);
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error('Build monitoring error:', error);
        throw error;
      }
    }
    
    throw new Error('Build timeout - exceeded maximum wait time');
  }

  async getBuildStatus(buildId) {
    try {
      const response = await axios.get(`${this.codemagicApiUrl}/${buildId}`, {
        headers: {
          'x-auth-token': this.apiToken
        }
      });

      return {
        status: response.data.build.status,
        artifacts: response.data.build.artifacts,
        error: response.data.build.error,
        logs: response.data.build.logs
      };
    } catch (error) {
      console.error('Failed to get build status:', error);
      throw error;
    }
  }

  async downloadArtifact(artifactUrl, outputPath) {
    try {
      const response = await axios.get(artifactUrl, {
        responseType: 'stream',
        headers: {
          'x-auth-token': this.apiToken
        }
      });

      const writer = require('fs').createWriteStream(outputPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(outputPath));
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('Failed to download artifact:', error);
      throw error;
    }
  }

  async listBuilds(limit = 20) {
    try {
      const response = await axios.get(`${this.codemagicApiUrl}?limit=${limit}`, {
        headers: {
          'x-auth-token': this.apiToken
        }
      });

      return response.data.builds;
    } catch (error) {
      console.error('Failed to list builds:', error);
      throw error;
    }
  }

  async cancelBuild(buildId) {
    try {
      const response = await axios.post(`${this.codemagicApiUrl}/${buildId}/cancel`, {}, {
        headers: {
          'x-auth-token': this.apiToken
        }
      });

      return {
        buildId,
        status: 'canceled',
        message: 'Build canceled successfully'
      };
    } catch (error) {
      console.error('Failed to cancel build:', error);
      throw error;
    }
  }
}

module.exports = MobileAppBuilder;