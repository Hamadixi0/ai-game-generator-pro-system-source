import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
  Alert,
  StatusBar,
} from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Game Constants
const GAME_CONFIG = {
  playerSize: 50,
  enemySize: 40,
  projectileSize: 5,
  playerSpeed: 5,
  enemySpeed: 2,
  projectileSpeed: 8,
  spawnRate: 0.02,
  maxEnemies: 10,
};

// Game Systems
const GamePhysics = (entities, { touches, time }) => {
  const { player, enemies, projectiles } = entities;
  
  // Handle touch input for player movement
  if (touches.length > 0) {
    const touch = touches[0];
    if (touch.type === 'move' || touch.type === 'start') {
      player.position.x = Math.max(
        0,
        Math.min(screenWidth - GAME_CONFIG.playerSize, touch.event.pageX - GAME_CONFIG.playerSize / 2)
      );
    }
  }
  
  // Update projectiles
  Object.keys(projectiles).forEach(key => {
    const projectile = projectiles[key];
    projectile.position.y -= GAME_CONFIG.projectileSpeed;
    
    // Remove projectiles that are off screen
    if (projectile.position.y < 0) {
      delete projectiles[key];
    }
  });
  
  // Update enemies
  Object.keys(enemies).forEach(key => {
    const enemy = enemies[key];
    enemy.position.y += GAME_CONFIG.enemySpeed;
    
    // Remove enemies that are off screen
    if (enemy.position.y > screenHeight) {
      delete enemies[key];
    }
  });
  
  return entities;
};

const CollisionSystem = (entities, { dispatch }) => {
  const { player, enemies, projectiles } = entities;
  
  // Check projectile-enemy collisions
  Object.keys(projectiles).forEach(projKey => {
    const projectile = projectiles[projKey];
    
    Object.keys(enemies).forEach(enemyKey => {
      const enemy = enemies[enemyKey];
      
      if (
        projectile.position.x < enemy.position.x + GAME_CONFIG.enemySize &&
        projectile.position.x + GAME_CONFIG.projectileSize > enemy.position.x &&
        projectile.position.y < enemy.position.y + GAME_CONFIG.enemySize &&
        projectile.position.y + GAME_CONFIG.projectileSize > enemy.position.y
      ) {
        // Collision detected
        delete projectiles[projKey];
        delete enemies[enemyKey];
        dispatch({ type: 'score-update', points: 10 });
      }
    });
  });
  
  // Check player-enemy collisions
  Object.keys(enemies).forEach(enemyKey => {
    const enemy = enemies[enemyKey];
    
    if (
      player.position.x < enemy.position.x + GAME_CONFIG.enemySize &&
      player.position.x + GAME_CONFIG.playerSize > enemy.position.x &&
      player.position.y < enemy.position.y + GAME_CONFIG.enemySize &&
      player.position.y + GAME_CONFIG.playerSize > enemy.position.y
    ) {
      // Player hit
      delete enemies[enemyKey];
      dispatch({ type: 'life-lost' });
    }
  });
  
  return entities;
};

const EnemySpawner = (entities, { time }) => {
  const { enemies } = entities;
  
  if (Math.random() < GAME_CONFIG.spawnRate && Object.keys(enemies).length < GAME_CONFIG.maxEnemies) {
    const enemyId = `enemy_${time.current}`;
    enemies[enemyId] = {
      position: {
        x: Math.random() * (screenWidth - GAME_CONFIG.enemySize),
        y: -GAME_CONFIG.enemySize,
      },
      renderer: <EnemyRenderer />,
    };
  }
  
  return entities;
};

// Renderers
const PlayerRenderer = ({ position }) => (
  <View
    style={[
      styles.player,
      {
        left: position.x,
        top: position.y,
        width: GAME_CONFIG.playerSize,
        height: GAME_CONFIG.playerSize,
      },
    ]}
  />
);

const EnemyRenderer = ({ position }) => (
  <View
    style={[
      styles.enemy,
      {
        left: position.x,
        top: position.y,
        width: GAME_CONFIG.enemySize,
        height: GAME_CONFIG.enemySize,
      },
    ]}
  />
);

const ProjectileRenderer = ({ position }) => (
  <View
    style={[
      styles.projectile,
      {
        left: position.x,
        top: position.y,
        width: GAME_CONFIG.projectileSize,
        height: GAME_CONFIG.projectileSize * 2,
      },
    ]}
  />
);

// Main App Component
const App = () => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'paused', 'gameOver'
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(0);
  const gameEngine = useRef(null);
  const shootInterval = useRef(null);
  
  // Load high score on app start
  useEffect(() => {
    loadHighScore();
  }, []);
  
  const loadHighScore = async () => {
    try {
      const savedHighScore = await AsyncStorage.getItem('highScore');
      if (savedHighScore) {
        setHighScore(parseInt(savedHighScore));
      }
    } catch (error) {
      console.log('Error loading high score:', error);
    }
  };
  
  const saveHighScore = async (newScore) => {
    try {
      if (newScore > highScore) {
        await AsyncStorage.setItem('highScore', newScore.toString());
        setHighScore(newScore);
      }
    } catch (error) {
      console.log('Error saving high score:', error);
    }
  };
  
  const initializeGame = () => {
    return {
      player: {
        position: {
          x: screenWidth / 2 - GAME_CONFIG.playerSize / 2,
          y: screenHeight - 100,
        },
        renderer: <PlayerRenderer />,
      },
      enemies: {},
      projectiles: {},
    };
  };
  
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    
    // Start auto-shooting
    shootInterval.current = setInterval(() => {
      if (gameEngine.current) {
        gameEngine.current.dispatch({ type: 'shoot' });
      }
    }, 300);
  };
  
  const pauseGame = () => {
    setGameState('paused');
    if (shootInterval.current) {
      clearInterval(shootInterval.current);
    }
  };
  
  const resumeGame = () => {
    setGameState('playing');
    shootInterval.current = setInterval(() => {
      if (gameEngine.current) {
        gameEngine.current.dispatch({ type: 'shoot' });
      }
    }, 300);
  };
  
  const endGame = () => {
    setGameState('gameOver');
    if (shootInterval.current) {
      clearInterval(shootInterval.current);
    }
    saveHighScore(score);
  };
  
  const handleGameEvent = (event) => {
    switch (event.type) {
      case 'score-update':
        setScore(prevScore => prevScore + event.points);
        break;
      case 'life-lost':
        setLives(prevLives => {
          const newLives = prevLives - 1;
          if (newLives <= 0) {
            endGame();
          }
          return newLives;
        });
        break;
      case 'shoot':
        if (gameEngine.current) {
          const entities = gameEngine.current.state;
          const projectileId = `projectile_${Date.now()}`;
          entities.projectiles[projectileId] = {
            position: {
              x: entities.player.position.x + GAME_CONFIG.playerSize / 2,
              y: entities.player.position.y,
            },
            renderer: <ProjectileRenderer />,
          };
        }
        break;
    }
  };
  
  const renderMenu = () => (
    <View style={styles.menuContainer}>
      <Text style={styles.title}>AI Generated Game</Text>
      <Text style={styles.subtitle}>React Native Edition</Text>
      
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>High Score: {highScore}</Text>
      </View>
      
      <TouchableOpacity style={styles.button} onPress={startGame}>
        <Text style={styles.buttonText}>START GAME</Text>
      </TouchableOpacity>
      
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionText}>• Touch and drag to move</Text>
        <Text style={styles.instructionText}>• Auto-shooting enabled</Text>
        <Text style={styles.instructionText}>• Avoid enemies, shoot them down!</Text>
      </View>
    </View>
  );
  
  const renderGameOver = () => (
    <View style={styles.menuContainer}>
      <Text style={styles.title}>Game Over</Text>
      <Text style={styles.scoreText}>Final Score: {score}</Text>
      {score > highScore && (
        <Text style={styles.newHighScore}>New High Score!</Text>
      )}
      
      <TouchableOpacity style={styles.button} onPress={startGame}>
        <Text style={styles.buttonText}>PLAY AGAIN</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.secondaryButton} onPress={() => setGameState('menu')}>
        <Text style={styles.secondaryButtonText}>MAIN MENU</Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderHUD = () => (
    <View style={styles.hudContainer}>
      <View style={styles.hudItem}>
        <Text style={styles.hudText}>Score: {score}</Text>
      </View>
      <View style={styles.hudItem}>
        <Text style={styles.hudText}>Lives: {lives}</Text>
      </View>
      <TouchableOpacity style={styles.pauseButton} onPress={pauseGame}>
        <Text style={styles.pauseButtonText}>⏸</Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderPauseMenu = () => (
    <View style={styles.pauseContainer}>
      <Text style={styles.pauseTitle}>Paused</Text>
      <TouchableOpacity style={styles.button} onPress={resumeGame}>
        <Text style={styles.buttonText}>RESUME</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => setGameState('menu')}>
        <Text style={styles.secondaryButtonText}>MAIN MENU</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {gameState === 'menu' && renderMenu()}
      {gameState === 'gameOver' && renderGameOver()}
      
      {(gameState === 'playing' || gameState === 'paused') && (
        <>
          <GameEngine
            ref={gameEngine}
            style={styles.gameContainer}
            systems={[GamePhysics, CollisionSystem, EnemySpawner]}
            entities={initializeGame()}
            running={gameState === 'playing'}
            onEvent={handleGameEvent}
          />
          {renderHUD()}
          {gameState === 'paused' && renderPauseMenu()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gameContainer: {
    flex: 1,
    backgroundColor: '#001122',
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 40,
  },
  scoreText: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
  },
  newHighScore: {
    fontSize: 18,
    color: '#ffaa00',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  statsContainer: {
    marginBottom: 40,
  },
  statText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0066cc',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  secondaryButtonText: {
    color: '#0066cc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    marginTop: 40,
  },
  instructionText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  hudContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hudItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  hudText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pauseButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  pauseContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
  },
  player: {
    backgroundColor: '#00ff00',
    position: 'absolute',
    borderRadius: 5,
  },
  enemy: {
    backgroundColor: '#ff0000',
    position: 'absolute',
    borderRadius: 3,
  },
  projectile: {
    backgroundColor: '#ffff00',
    position: 'absolute',
    borderRadius: 2,
  },
});

export default App;