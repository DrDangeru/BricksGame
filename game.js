// Import level system
import { LevelSystem } from './levelSystem.js';
import { showRegForm } from './reg.js';

// Create PixiJS Application
let app = new PIXI.Application({
    width: 900,
    height: 660,
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
    boundaryBricks: [],
    gameStarted: false,
    gameOver: false,
    score: 0,
    highScore: parseInt(localStorage.getItem('brickGame_highScore')) || 0,
    currentUser: localStorage.getItem('brickGame_currentUser') || null,
    scoreText: null,
    highScoreText: null,
    mouseX: 0,
    colors: [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff]
};

window.gameState = gameState;

let levelText;

// Create game Objects and Assets
function setup() {
    // Create boundary bricks
    const brickWidth = 40;
    const brickHeight = 20;
    const boundaryColor = 0x8B4513;

    function createBoundaryBrick(x, y) {
        const brick = new PIXI.Graphics();
        brick.beginFill(boundaryColor);
        brick.lineStyle(2, 0x4A2500);
        brick.drawRect(0, 0, brickWidth, brickHeight);
        brick.endFill();
        
        // Add a simple pattern
        brick.lineStyle(1, 0x4A2500, 0.5);
        brick.moveTo(0, brickHeight/2);
        brick.lineTo(brickWidth, brickHeight/2);
        brick.moveTo(brickWidth/2, 0);
        brick.lineTo(brickWidth/2, brickHeight);
        
        brick.x = x;
        brick.y = y;
        brick.isUnbreakable = true;
        
        app.stage.addChild(brick);
        return brick;
    }

    // Function to create random unbreakable bricks
    function createRandomUnbreakableBricks(level) {
        const numBricks = 10 + level;
        const minX = brickWidth; // Start after left boundary
        const maxX = app.screen.width - 2 * brickWidth; // End before right boundary
        const minY = brickHeight; // Start below top
        const maxY = app.screen.height / 2; // Only in upper half of screen
        
        for (let i = 0; i < numBricks; i++) {
            // Generate random position that doesn't overlap with other bricks
            let validPosition = false;
            let x, y;
            
            while (!validPosition) {
                x = Math.floor(Math.random() * (maxX - minX) / brickWidth) * brickWidth + minX;
                y = Math.floor(Math.random() * (maxY - minY) / brickHeight) * brickHeight + minY;
                
                // Check if position overlaps with any existing brick
                validPosition = true;
                for (const brick of gameState.boundaryBricks) {
                    if (brick.x === x && brick.y === y) {
                        validPosition = false;
                        break;
                    }
                }
            }
            
            gameState.boundaryBricks.push(createBoundaryBrick(x, y));
        }
    }

    // Create left boundary
    for (let y = 0; y < app.screen.height - brickHeight; y += brickHeight) {
        gameState.boundaryBricks.push(createBoundaryBrick(0, y));
    }

    // Create right boundary
    for (let y = 0; y < app.screen.height - brickHeight; y += brickHeight) {
        gameState.boundaryBricks.push(createBoundaryBrick(app.screen.width - brickWidth, y));
    }

    // Create random unbreakable bricks for current level
    createRandomUnbreakableBricks(LevelSystem.currentLevel);

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

    // Add high score text
    gameState.highScoreText = new PIXI.Text(`High Score: ${gameState.highScore}`, {
        fontFamily: 'Arial',
        fontSize: 32,
        fontWeight: 'bold',
        fill: 0xffd700,
        stroke: 0x000000,
        strokeThickness: 4,
        align: 'center'
    });
    // Center the high score text at the top
    gameState.highScoreText.anchor.set(0.5, 0);
    gameState.highScoreText.x = app.screen.width / 2;
    gameState.highScoreText.y = 16;
    app.stage.addChild(gameState.highScoreText);

    // Add score text
    gameState.scoreText = new PIXI.Text('Score: 0', {
        fontFamily: 'Arial',
        fontSize: 32,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: 0x000000,
        strokeThickness: 4,
        align: 'left'
    });
    gameState.scoreText.anchor.set(0, 0);
    gameState.scoreText.x = 16;
    gameState.scoreText.y = 16;
    app.stage.addChild(gameState.scoreText);

    // Add level text
    levelText = new PIXI.Text('Level: 1', {
        fontFamily: 'Arial',
        fontSize: 32,
        fontWeight: 'bold',
        stroke: 0x000000,
        strokeThickness: 2,
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

    // Add registration button
    const registerButton = new PIXI.Text('Register', {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff,
        backgroundColor: 0x4CAF50,
        padding: 10
    });
    registerButton.x = app.screen.width - 100;
    registerButton.y = app.screen.height - 40;
    registerButton.interactive = true;
    registerButton.buttonMode = true;
    registerButton.on('pointerdown', showRegForm);
    app.stage.addChild(registerButton);

    // Start the game loop
    app.ticker.add(gameLoop);
}

function startGame() {
    if (!gameState.gameStarted && !gameState.gameOver) {
        gameState.gameStarted = true;
        gameState.ball.vx = -3; // ball start speed to be += on collision
        gameState.ball.vy = -3;
    } else if (gameState.gameOver) {
        // Save score before reset if it's a high score
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            localStorage.setItem('brickGame_highScore', [gameState.highScore.toString(), gameState.currentUser]);
            
            // Save score to user's history if logged in
            // This should be  global/ for all users at some point but for now ...
            if (gameState.currentUser) {
                const userScores = JSON.parse(localStorage.getItem(`brickGame_scores_${gameState.currentUser}`) || '[]');
                userScores.push({
                    score: gameState.score,
                    date: new Date().toISOString()
                });
                localStorage.setItem(`brickGame_scores_${gameState.currentUser}`, JSON.stringify(userScores));
            }
        }
        
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
        
        const gameOverText = app.stage.children.find(child => child.text === 'Game Over!');
            if (gameOverText) {
            app.stage.removeChild(gameOverText);
            console.log('removing game over text!');
        }
        }
    }


function gameLoop() {
    if (!gameState.gameStarted || gameState.gameOver) return;

    // Update paddle position based on mouse
    gameState.paddle.x = Math.max(
        40,  // Left boundary
        Math.min(
            gameState.mouseX - gameState.paddle.width / 2,
            app.screen.width - gameState.paddle.width - 40  // Right boundary
        )
    );

    // Ball collision with walls (invisible boundaries)
    if (gameState.ball.x - 10 <= 40) { // Left boundary
        gameState.ball.x = 50; // Push ball away from boundary
        gameState.ball.vx = Math.abs(gameState.ball.vx); // Force rightward movement
    }
    if (gameState.ball.x + 10 >= app.screen.width - 40) { // Right boundary
        gameState.ball.x = app.screen.width - 50; // Push ball away from boundary
        gameState.ball.vx = -Math.abs(gameState.ball.vx); // Force leftward movement
    }
    if (gameState.ball.y <= 0) {
        gameState.ball.vy = Math.abs(gameState.ball.vy); // Force downward movement
    }

    // Check collisions with unbreakable bricks
    for (let brick of gameState.boundaryBricks) {
        if (checkCollision(gameState.ball, brick)) {
            // Calculate collision point
            const ballCenter = {
                x: gameState.ball.x,
                y: gameState.ball.y
            };
            const brickBounds = brick.getBounds();
            
            // Calculate distances from ball center to brick edges
            const distanceRight = Math.abs(ballCenter.x - (brickBounds.x + brickBounds.width));
            const distanceLeft = Math.abs(ballCenter.x - brickBounds.x);
            const distanceTop = Math.abs(ballCenter.y - brickBounds.y);
            const distanceBottom = Math.abs(ballCenter.y - (brickBounds.y + brickBounds.height));
            
            // Find the smallest distance to determine collision side
            const minDistance = Math.min(distanceRight, distanceLeft, distanceTop, distanceBottom);
            
            // Push ball away from brick and adjust velocity
            if (minDistance === distanceLeft || minDistance === distanceRight) {
                // Horizontal collision
                gameState.ball.vx *= -1;
                if (minDistance === distanceLeft) {
                    gameState.ball.x = brickBounds.x - 11; // Push left
                } else {
                    gameState.ball.x = brickBounds.x + brickBounds.width + 11; // Push right
                }
            } else {
                // Vertical collision
                gameState.ball.vy *= -1;
                if (minDistance === distanceTop) {
                    gameState.ball.y = brickBounds.y - 11; // Push up
                } else {
                    gameState.ball.y = brickBounds.y + brickBounds.height + 11; // Push down
                }
            }
            
            // Add slight randomness to prevent straight line bounces
            gameState.ball.vx += (Math.random() - 0.5) * 0.5;
            break; // Only handle one collision per frame
        }
    }

    // Update ball position
    gameState.ball.x += gameState.ball.vx;
    gameState.ball.y += gameState.ball.vy;

    // Ball collision with paddle
    if (checkCollision(gameState.ball, gameState.paddle)) {
        gameState.ball.vy = -Math.abs(gameState.ball.vy); // Force upward movement
        gameState.ball.y = gameState.paddle.y - 11; // Push ball above paddle
        // Add angle based on where ball hits the paddle
        const hitPoint = (gameState.ball.x - gameState.paddle.x) / gameState.paddle.width;
        gameState.ball.vx = (hitPoint - 0.5) * 10; // Max horizontal speed ±5
    }

    // Check brick collisions
    for (let brick of gameState.bricks) {
        if (brick.visible && checkCollision(gameState.ball, brick)) {
            brick.visible = false;
            updateScore(10);
            
            // Calculate collision side and adjust ball direction
            const ballCenter = {
                x: gameState.ball.x,
                y: gameState.ball.y
            };
            const brickBounds = brick.getBounds();
            
            if (Math.abs(ballCenter.x - brickBounds.x) < 5 || 
                Math.abs(ballCenter.x - (brickBounds.x + brickBounds.width)) < 5) {
                gameState.ball.vx *= -1;
            } else {
                gameState.ball.vy *= -1;
            }
            
            LevelSystem.checkLevelComplete(app, gameState, levelText);
            break;
        }
    }

    // Normalize ball speed to prevent it from going too fast
    const speed = Math.sqrt(gameState.ball.vx * gameState.ball.vx + gameState.ball.vy * gameState.ball.vy);
    if (speed > 8) {
        gameState.ball.vx = (gameState.ball.vx / speed) * 8;
        gameState.ball.vy = (gameState.ball.vy / speed) * 8;
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

function updateScore(points) {
    gameState.score += points;
    gameState.scoreText.text = `Score: ${gameState.score}`;
    
    // Update high score if current score is higher
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        gameState.highScoreText.text = `High Score: ${gameState.highScore}`;
        localStorage.setItem('brickGame_highScore', gameState.highScore.toString());
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
