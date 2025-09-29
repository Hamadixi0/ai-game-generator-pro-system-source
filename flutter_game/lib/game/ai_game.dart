import 'package:flame/game.dart';
import 'package:flame/components.dart';
import 'package:flame/events.dart';
import 'package:flutter/material.dart';
import 'dart:math';

// FIXED: Simplified Flame engine syntax - removed problematic mixins
class AIGame extends FlameGame with HasTapCallbacks {
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
    
    // Simple collision detection
    checkCollisions();
  }
  
  void spawnObstacle() {
    final obstacle = Obstacle();
    obstacle.position = Vector2(
      Random().nextDouble() * (size.x - 40),
      -50,
    );
    add(obstacle);
  }
  
  void checkCollisions() {
    // Simple collision detection between player and obstacles
    final obstacles = children.whereType<Obstacle>().toList();
    for (final obstacle in obstacles) {
      final distance = player.position.distanceTo(obstacle.position);
      if (distance < 30) {
        // Collision detected - could add game over logic here
        obstacle.removeFromParent();
        score += 50; // Bonus points for collision
      }
    }
  }
  
  @override
  bool onTapDown(TapDownEvent event) {
    player.moveTo(event.localPosition);
    return true;
  }
}

// FIXED: Simplified Player class without problematic mixins
class Player extends RectangleComponent {
  late Vector2 targetPosition;
  final double speed = 200;
  
  @override
  Future<void> onLoad() async {
    size = Vector2(40, 40);
    paint = Paint()..color = Colors.blue;
    targetPosition = position.clone();
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
}

// FIXED: Simplified Obstacle class without problematic mixins
class Obstacle extends RectangleComponent {
  final double speed = 150;
  
  @override
  Future<void> onLoad() async {
    size = Vector2(30, 30);
    paint = Paint()..color = Colors.red;
  }
  
  @override
  void update(double dt) {
    super.update(dt);
    
    position.y += speed * dt;
    
    // Remove when off screen - FIXED: Use parent size safely
    if (position.y > 800 + 100) {
      removeFromParent();
    }
  }
}