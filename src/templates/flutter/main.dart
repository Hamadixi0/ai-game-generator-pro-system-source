import 'package:flutter/material.dart';
import 'package:flame/game.dart';
import 'package:flame/components.dart';
import 'package:flame/events.dart';
import 'package:flame/collisions.dart';
import 'package:flutter/services.dart';

void main() {
  runApp(GameApp());
}

class GameApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AI Generated Flutter Game',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: GameWrapper(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class GameWrapper extends StatefulWidget {
  @override
  _GameWrapperState createState() => _GameWrapperState();
}

class _GameWrapperState extends State<GameWrapper> {
  late AIGeneratedGame game;
  bool gameStarted = false;
  int score = 0;
  int lives = 3;

  @override
  void initState() {
    super.initState();
    game = AIGeneratedGame(
      onScoreUpdate: (newScore) => setState(() => score = newScore),
      onLivesUpdate: (newLives) => setState(() => lives = newLives),
      onGameOver: () => _showGameOverDialog(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          GameWidget(game: game),
          if (!gameStarted) _buildStartScreen(),
          _buildHUD(),
        ],
      ),
    );
  }

  Widget _buildStartScreen() {
    return Container(
      color: Colors.black87,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'AI Generated Game',
              style: TextStyle(
                color: Colors.white,
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 20),
            Text(
              'Tap to Start',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 18,
              ),
            ),
            SizedBox(height: 40),
            ElevatedButton(
              onPressed: () {
                setState(() => gameStarted = true);
                game.startGame();
              },
              child: Text('START GAME'),
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.symmetric(horizontal: 40, vertical: 15),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHUD() {
    return Positioned(
      top: 50,
      left: 20,
      right: 20,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            padding: EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.black54,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              'Score: $score',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          Container(
            padding: EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.black54,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                Text(
                  'Lives: ',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                ...List.generate(
                  lives,
                  (index) => Icon(
                    Icons.favorite,
                    color: Colors.red,
                    size: 20,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showGameOverDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Game Over'),
          content: Text('Final Score: $score'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _restartGame();
              },
              child: Text('Play Again'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                setState(() => gameStarted = false);
              },
              child: Text('Main Menu'),
            ),
          ],
        );
      },
    );
  }

  void _restartGame() {
    setState(() {
      score = 0;
      lives = 3;
      gameStarted = true;
    });
    game.restartGame();
  }
}

class AIGeneratedGame extends FlameGame
    with HasKeyboardHandlerComponents, HasCollisionDetection {
  final Function(int) onScoreUpdate;
  final Function(int) onLivesUpdate;
  final VoidCallback onGameOver;

  late Player player;
  late TextComponent scoreText;
  int score = 0;
  int lives = 3;
  bool gameActive = false;

  AIGeneratedGame({
    required this.onScoreUpdate,
    required this.onLivesUpdate,
    required this.onGameOver,
  });

  @override
  Future<void> onLoad() async {
    // Initialize game world
    await super.onLoad();
    
    // Add background
    add(Background());
    
    // Add player
    player = Player();
    add(player);
    
    // Add enemy spawner
    add(EnemySpawner());
    
    // Add power-up spawner
    add(PowerUpSpawner());
  }

  void startGame() {
    gameActive = true;
    resumeEngine();
  }

  void restartGame() {
    score = 0;
    lives = 3;
    gameActive = true;
    onScoreUpdate(score);
    onLivesUpdate(lives);
    
    // Reset player position
    player.reset();
    
    // Clear all enemies and projectiles
    children.whereType<Enemy>().forEach((enemy) => enemy.removeFromParent());
    children.whereType<Projectile>().forEach((projectile) => projectile.removeFromParent());
    
    resumeEngine();
  }

  void updateScore(int points) {
    score += points;
    onScoreUpdate(score);
  }

  void loseLife() {
    lives--;
    onLivesUpdate(lives);
    
    if (lives <= 0) {
      gameActive = false;
      pauseEngine();
      onGameOver();
    }
  }
}

class Player extends SpriteComponent
    with HasKeyboardHandlerComponents, CollisionCallbacks {
  late Vector2 velocity;
  double speed = 200.0;
  double shootCooldown = 0.0;
  final double shootInterval = 0.3;

  @override
  Future<void> onLoad() async {
    size = Vector2(50, 50);
    position = Vector2(
      (game as AIGeneratedGame).size.x / 2 - size.x / 2,
      (game as AIGeneratedGame).size.y - 100,
    );
    velocity = Vector2.zero();
    
    // Create simple colored rectangle as player
    sprite = await Sprite.load('player.png').catchError((_) async {
      // Fallback to colored rectangle if image not found
      return Sprite.load('pixel.png');
    });
    
    add(RectangleHitbox());
  }

  @override
  void update(double dt) {
    super.update(dt);
    
    // Update position
    position += velocity * dt;
    
    // Keep player on screen
    position.x = position.x.clamp(0, (game as AIGeneratedGame).size.x - size.x);
    
    // Update shoot cooldown
    if (shootCooldown > 0) {
      shootCooldown -= dt;
    }
  }

  @override
  bool onKeyEvent(KeyEvent event, Set<LogicalKeyboardKey> keysPressed) {
    velocity.setZero();
    
    if (keysPressed.contains(LogicalKeyboardKey.arrowLeft) ||
        keysPressed.contains(LogicalKeyboardKey.keyA)) {
      velocity.x = -speed;
    }
    if (keysPressed.contains(LogicalKeyboardKey.arrowRight) ||
        keysPressed.contains(LogicalKeyboardKey.keyD)) {
      velocity.x = speed;
    }
    if (keysPressed.contains(LogicalKeyboardKey.space) && shootCooldown <= 0) {
      shoot();
      shootCooldown = shootInterval;
    }
    
    return true;
  }

  void shoot() {
    final projectile = Projectile(
      position: Vector2(position.x + size.x / 2, position.y),
      direction: Vector2(0, -1),
      isPlayerProjectile: true,
    );
    (game as AIGeneratedGame).add(projectile);
  }

  void reset() {
    position = Vector2(
      (game as AIGeneratedGame).size.x / 2 - size.x / 2,
      (game as AIGeneratedGame).size.y - 100,
    );
    velocity.setZero();
  }

  @override
  bool onCollisionStart(Set<Vector2> intersectionPoints, PositionComponent other) {
    if (other is Enemy) {
      (game as AIGeneratedGame).loseLife();
      return false;
    }
    return true;
  }
}

class Enemy extends SpriteComponent with CollisionCallbacks {
  late Vector2 velocity;
  double speed = 100.0;

  @override
  Future<void> onLoad() async {
    size = Vector2(40, 40);
    position = Vector2(
      (game as AIGeneratedGame).size.x * (0.1 + 0.8 * (DateTime.now().millisecondsSinceEpoch % 1000) / 1000),
      -size.y,
    );
    velocity = Vector2(0, speed);
    
    add(RectangleHitbox());
  }

  @override
  void update(double dt) {
    super.update(dt);
    position += velocity * dt;
    
    // Remove if off screen
    if (position.y > (game as AIGeneratedGame).size.y) {
      removeFromParent();
    }
  }

  @override
  bool onCollisionStart(Set<Vector2> intersectionPoints, PositionComponent other) {
    if (other is Projectile && (other as Projectile).isPlayerProjectile) {
      (game as AIGeneratedGame).updateScore(10);
      other.removeFromParent();
      removeFromParent();
      return false;
    }
    return true;
  }
}

class Projectile extends SpriteComponent {
  final Vector2 direction;
  final bool isPlayerProjectile;
  final double speed = 300.0;

  Projectile({
    required Vector2 position,
    required this.direction,
    required this.isPlayerProjectile,
  }) {
    this.position = position;
  }

  @override
  Future<void> onLoad() async {
    size = Vector2(5, 10);
  }

  @override
  void update(double dt) {
    super.update(dt);
    position += direction * speed * dt;
    
    // Remove if off screen
    if (position.y < -size.y || position.y > (game as AIGeneratedGame).size.y) {
      removeFromParent();
    }
  }
}

class Background extends Component {
  @override
  void render(Canvas canvas) {
    final paint = Paint()..color = Colors.black;
    canvas.drawRect(
      Rect.fromLTWH(0, 0, (game as AIGeneratedGame).size.x, (game as AIGeneratedGame).size.y),
      paint,
    );
  }
}

class EnemySpawner extends Component {
  double spawnTimer = 0.0;
  final double spawnInterval = 2.0;

  @override
  void update(double dt) {
    super.update(dt);
    
    if (!(game as AIGeneratedGame).gameActive) return;
    
    spawnTimer += dt;
    if (spawnTimer >= spawnInterval) {
      (game as AIGeneratedGame).add(Enemy());
      spawnTimer = 0.0;
    }
  }
}

class PowerUpSpawner extends Component {
  double spawnTimer = 0.0;
  final double spawnInterval = 10.0;

  @override
  void update(double dt) {
    super.update(dt);
    
    if (!(game as AIGeneratedGame).gameActive) return;
    
    spawnTimer += dt;
    if (spawnTimer >= spawnInterval) {
      // Add power-up spawning logic here
      spawnTimer = 0.0;
    }
  }
}