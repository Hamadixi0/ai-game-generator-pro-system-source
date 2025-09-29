import 'package:flame/game.dart';
import 'package:flame/components.dart';
import 'package:flame/events.dart';
import 'package:flame/collisions.dart';
import 'package:flutter/material.dart';
import 'dart:math';

// FIXED: Proper Flame engine syntax for latest version
class AIGame extends FlameGame with HasTapCallbacks, HasCollisionDetection {
  late Player player;
  late TextComponent scoreText;
  int score = 0;
  double spawnTimer = 0;
  final double spawnInterval = 2.0;
  
  @override
  Future<void> onLoad() async {
    // Add background
    add(RectangleComponent(
      size: size,
      paint: Paint()..color = const Color(0xFF1E3C72),
    ));
    
    // Add player
    player = Player();
    player.position = Vector2(size.x / 2, size.y * 0.8);
    add(player);
    
    // Add score text
    scoreText = TextComponent(
      text: 'Score: 0',
      textRenderer: TextPaint(
        style: const TextStyle(
          color: Colors.white,
          fontSize: 24,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
    scoreText.position = Vector2(20, 50);
    add(scoreText);
    
    // Add instructions
    final instructions = TextComponent(
      text: 'Tap to move and avoid obstacles!',
      textRenderer: TextPaint(
        style: const TextStyle(
          color: Colors.white70,
          fontSize: 16,
        ),
      ),
    );
    instructions.position = Vector2(20, 100);
    add(instructions);
  }
  
  @override
  void update(double dt) {
    super.update(dt);
    
    spawnTimer += dt;
    if (spawnTimer >= spawnInterval) {
      spawnObstacle();
      spawnTimer = 0;
    }
    
    // Update score
    score += (dt * 10).round();
    scoreText.text = 'Score: $score';
  }
  
  void spawnObstacle() {
    final obstacle = Obstacle();
    obstacle.position = Vector2(
      Random().nextDouble() * (size.x - 40),
      -50,
    );
    add(obstacle);
  }
  
  @override
  bool onTapDown(TapDownEvent event) {
    player.moveTo(event.localPosition);
    return true;
  }
}

// FIXED: Proper mixin usage - CollisionCallbacks is a mixin, not a class
class Player extends RectangleComponent with HasCollisionDetection, CollisionCallbacks {
  late Vector2 targetPosition;
  final double speed = 200;
  
  @override
  Future<void> onLoad() async {
    size = Vector2(40, 40);
    paint = Paint()..color = Colors.blue;
    targetPosition = position.clone();
    
    add(RectangleHitbox());
  }
  
  @override
  void update(double dt) {
    super.update(dt);
    
    final direction = targetPosition - position;
    if (direction.length > 5) {
      direction.normalize();
      position += direction * speed * dt;
    }
  }
  
  void moveTo(Vector2 target) {
    targetPosition = target;
  }
  
  // FIXED: Call super.onCollisionStart to satisfy @mustCallSuper
  @override
  bool onCollisionStart(Set<Vector2> intersectionPoints, PositionComponent other) {
    super.onCollisionStart(intersectionPoints, other);
    if (other is Obstacle) {
      // Game over logic could go here
      return true;
    }
    return false;
  }
}

// FIXED: Proper mixin usage for Obstacle class
class Obstacle extends RectangleComponent with HasCollisionDetection, CollisionCallbacks {
  final double speed = 150;
  
  @override
  Future<void> onLoad() async {
    size = Vector2(30, 30);
    paint = Paint()..color = Colors.red;
    
    add(RectangleHitbox());
  }
  
  @override
  void update(double dt) {
    super.update(dt);
    
    position.y += speed * dt;
    
    // FIXED: Use game reference instead of parent!.size
    final gameSize = findGame()?.size ?? Vector2(400, 800);
    if (position.y > gameSize.y + 100) {
      removeFromParent();
    }
  }
}