// Import level system
import { LevelSystem } from './levelSystem.js';

// Create PixiJS Application
let app = new PIXI.Application({
    width: 800,
    height: 600,
    backgroundColor: 0x1099bb,
    antialias: true
});

// Add the canvas to the DOM
document.body.appendChild(app.view);

// Game state
const gameState = {
    ball: null,
    paddle: null,
    bricks: [],
    walls: [],
    gameStarted: false,
    gameOver: false,
    score: 0,
    scoreText: null,
    mouseX: 0,
    colors: [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff]
};

let levelText;

// Create game Objects and Assets
function setup() {
    // Create paddle
    gameState.paddle = new PIXI.Graphics();
    gameState.paddle.beginFill(0x00ff00);
    gameState.paddle.drawRect(0, 0, 100, 20);
    gameState.paddle.endFill();
    gameState.paddle.x = 350;
    gameState.paddle.y = 550;
    app.stage.addChild(gameState.paddle);

    // Create ball
    gameState.ball = new PIXI.Graphics();
    gameState.ball.beginFill(0xffffff);
    gameState.ball.drawCircle(0, 0, 10);
    gameState.ball.endFill();
    gameState.ball.x = 400;
    gameState.ball.y = 530;
    app.stage.addChild(gameState.ball);

    // Add score text
    gameState.scoreText = new PIXI.Text('Score: 0', {
        fontFamily: 'Arial',
        fontSize: 32,
        fill: 0xffffff
    });
    gameState.scoreText.x = 16;
    gameState.scoreText.y = 16;
    app.stage.addChild(gameState.scoreText);

    // Add level text
    levelText = new PIXI.Text('Level: 1', {
        fontFamily: 'Arial',
        fontSize: 32,
        fill: 0xffffff
    });
    levelText.x = app.screen.width - 150;
    levelText.y = 16;
    app.stage.addChild(levelText);

    // Load first level
    LevelSystem.loadLevel(app, gameState.colors, levelText, gameState);

    // Setup ball physics speed and direction
    gameState.ball.vx = 0; // horizontal velocity to 0
    gameState.ball.vy = 0; // vertical velocity to 0

    // Setup input handlers
    app.stage.interactive = true;
    app.stage.hitArea = app.screen;
    
    // Track mouse movement
    app.stage.addEventListener('pointermove', (e) => {
        gameState.mouseX = e.data.global.x;
    });
    
    app.stage.addEventListener('pointerdown', startGame);

    // Start the game loop
    app.ticker.add(gameLoop);
}

function startGame() {
    if (!gameState.gameStarted && !gameState.gameOver) {
        gameState.gameStarted = true;
        gameState.ball.vx = -3; // ball start speed to be += on collision
        gameState.ball.vy = -3;
    } else if (gameState.gameOver) {
        // Reset game state
        gameState.gameOver = false;
        gameState.gameStarted = false;
        gameState.score = 0;
        gameState.scoreText.text = 'Score: 0';
        
        // Reset ball position
        gameState.ball.x = 400;
        gameState.ball.y = 530;
        gameState.ball.vx = 0;
        gameState.ball.vy = 0;
        
        // Reset paddle position
        gameState.paddle.x = 350;
        
        // Reset bricks
        LevelSystem.currentLevel = 1;
        LevelSystem.loadLevel(app, gameState.colors, levelText, gameState);
    }
}

function gameLoop() {
    if (!gameState.gameStarted) {
        gameState.ball.x = gameState.paddle.x + gameState.paddle.width / 2;
        return;
    }

    // Move ball
    gameState.ball.x += gameState.ball.vx;
    gameState.ball.y += gameState.ball.vy;

    // Move paddle towards mouse
    const targetX = gameState.mouseX - gameState.paddle.width / 2;
    gameState.paddle.x += (targetX - gameState.paddle.x) * 0.1;

    // Keep paddle within screen bounds
    if (gameState.paddle.x < 0) gameState.paddle.x = 0;
    if (gameState.paddle.x > app.screen.width - gameState.paddle.width) {
        gameState.paddle.x = app.screen.width - gameState.paddle.width;
    }

    // Check wall collisions
    for (let wall of gameState.walls) {
        if (checkCollision(gameState.ball, wall)) {
            // Reverse ball direction based on which side was hit
            const ballCenter = { x: gameState.ball.x, y: gameState.ball.y };
            const wallCenter = { x: wall.x + wall.width/2, y: wall.y + wall.height/2 };
            
            if (Math.abs(ballCenter.x - wallCenter.x) > Math.abs(ballCenter.y - wallCenter.y)) {
                gameState.ball.vx *= -1;  // Hit on sides
            } else {
                gameState.ball.vy *= -1;  // Hit on top/bottom
            }
            return;
        }
    }

    // Ball collision with walls
    if (gameState.ball.x <= 0 || gameState.ball.x >= app.screen.width) {
        gameState.ball.vx *= -1;
    }
    if (gameState.ball.y <= 0) {
        gameState.ball.vy *= -1;
    }

    // Ball collision with paddle
    if (checkCollision(gameState.ball, gameState.paddle)) {
        gameState.ball.vy *= -1;
        // Add some randomness to the bounce
        gameState.ball.vx += (gameState.ball.x - (gameState.paddle.x + gameState.paddle.width/2)) * 0.1;
    }

    // Check brick collisions
    for (let brick of gameState.bricks) {
        if (brick.visible && checkCollision(gameState.ball, brick)) {
            brick.visible = false;
            gameState.ball.vy *= -1;
            gameState.score += 10;
            gameState.scoreText.text = `Score: ${gameState.score}`;
            LevelSystem.checkLevelComplete(app, gameState, levelText);
            return;
        }
    }

    // Check for game over
    if (gameState.ball.y >= app.screen.height) {
        const gameOverText = new PIXI.Text('Game Over!', {
            fontFamily: 'Arial',
            fontSize: 48,
            fill: 0xffffff
        });
        gameOverText.x = app.screen.width / 2 - gameOverText.width / 2;
        gameOverText.y = app.screen.height / 2 - gameOverText.height / 2;
        app.stage.addChild(gameOverText);
        gameState.gameOver = true;
    }
}

// Collision detection between two rectangles
function checkCollision(a, b) {
    const ab = a.getBounds();
    const bb = b.getBounds();
    return ab.x + ab.width > bb.x &&
           ab.x < bb.x + bb.width &&
           ab.y + ab.height > bb.y &&
           ab.y < bb.y + bb.height;
}

// Start the game
setup();
