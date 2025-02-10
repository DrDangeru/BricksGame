// Level configurations and management system
const LevelSystem = {
    currentLevel: 1,
    
    // Level configurations
    levels: {
        1: {
            bricks: [
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],  // 1 means brick exists, 0 means no brick
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
            ],
            walls: [
                [0,0,1,0,0,1,0,0,1,0,0,1,0,0,1],  // Basic wall pattern
                [0,1,0,0,1,0,0,1,0,0,1,0,0,1,0]
            ]
        },
        2: {
            bricks: [
                [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],  // Checkerboard pattern
                [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
                [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
                [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
                [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1]
            ],
            walls: [
                [1,1,0,0,1,1,0,0,1,1,0,0,1,1,0],  // Pairs of walls
                [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1]
            ]
        },
        3: {
            bricks: [
                [1,1,1,0,0,1,1,1,1,1,0,0,1,1,1],  // Diamond pattern
                [1,1,0,0,1,1,1,1,1,1,1,0,0,1,1],
                [1,0,0,1,1,1,1,1,1,1,1,1,0,0,1],
                [1,1,0,0,1,1,1,1,1,1,1,0,0,1,1],
                [1,1,1,0,0,1,1,1,1,1,0,0,1,1,1]
            ],
            walls: [
                [0,0,0,1,1,0,0,0,0,0,1,1,0,0,0],  // Defensive walls
                [0,0,1,1,0,0,0,0,0,0,0,1,1,0,0]
            ]
        }
    },

    // Create bricks based on level configuration
    createBricks(app, colors, unbreakableBrickPositions) {
        const bricks = [];
        const levelConfig = this.levels[this.currentLevel];
        const brickWidth = 40;
        const brickHeight = 20;
        
        levelConfig.bricks.forEach((row, i) => {
            row.forEach((hasBrick, j) => {
                if (hasBrick) {
                    const x = 80 + j * 45;
                    const y = 60 + i * 30;
                    
                    // Check if this position overlaps with any unbreakable brick
                    // This calculates the pos of each unbreakable brick and compares to
                    // the current position of a regular brick
                    let overlap = false;
                    for (const pos of unbreakableBrickPositions) {
                        if (Math.abs(x - pos.x) < brickWidth && Math.abs(y - pos.y) < brickHeight) {
                            overlap = true;
                            break;
                        }
                    }
                    
                    if (!overlap) {
                        const brick = new PIXI.Graphics();
                        brick.beginFill(colors[i]);
                        brick.drawRect(0, 0, brickWidth, brickHeight);
                        brick.endFill();
                        brick.x = x;
                        brick.y = y;
                        brick.visible = true;
                        app.stage.addChild(brick);
                        bricks.push(brick);
                    }
                }
            });
        });
        
        return bricks;
    },

    // Create walls based on level configuration
    createWalls(app) {
        const walls = [];
        const levelConfig = this.levels[this.currentLevel];
        const wallTexture = PIXI.Texture.from('assets/wall.png');
        
        levelConfig.walls.forEach((row, i) => {
            row.forEach((hasWall, j) => {
                if (hasWall) {
                    const wall = new PIXI.Sprite(wallTexture);
                    wall.width = 40;
                    wall.height = 20;
                    wall.x = 80 + j * 45;
                    wall.y = 200 + i * 30;
                    app.stage.addChild(wall);
                    walls.push(wall);
                }
            });
        });
        
        return walls;
    },

    // Load a specific level
    loadLevel(app, colors, levelText, gameState) {
        const levelConfig = this.levels[this.currentLevel];
        if (!levelConfig) return false;
        
        // Clear existing objects
        gameState.bricks.forEach(brick => app.stage.removeChild(brick));
        gameState.boundaryBricks.forEach(brick => app.stage.removeChild(brick));
        gameState.boundaryBricks = [];
        
        // Create random unbreakable bricks
        const numBricks = Math.min(10 + this.currentLevel, 20); // Cap at 20 bricks maximum
        const brickWidth = 40;
        const brickHeight = 20;
        const minX = 80; // Start after left boundary
        const maxX = app.screen.width - 120; // End before right boundary
        const minY = 40; // Start below top
        const maxY = app.screen.height / 2; // Only in upper half of screen
        const minDistance = 60; // Minimum distance between bricks
        
        const unbreakableBrickPositions = []; // Keep track of placed brick positions
        
        for (let i = 0; i < numBricks; i++) {
            let validPosition = false;
            let x, y;
            let attempts = 0;
            const maxAttempts = 50;
            
            while (!validPosition && attempts < maxAttempts) {
                attempts++;
                x = Math.floor(Math.random() * (maxX - minX) / brickWidth) * brickWidth + minX;
                y = Math.floor(Math.random() * (maxY - minY) / brickHeight) * brickHeight + minY;
                
                // Check distance from all other placed bricks
                validPosition = true;
                for (const pos of unbreakableBrickPositions) {
                    const distance = Math.sqrt(
                        Math.pow(x - pos.x, 2) + 
                        Math.pow(y - pos.y, 2)
                    );
                    if (distance < minDistance) {
                        validPosition = false;
                        break;
                    }
                }
            }
            
            // If we couldn't find a valid position after max attempts, skip this brick
            if (!validPosition) continue;
            
            // Create the unbreakable brick
            const brick = new PIXI.Graphics();
            brick.beginFill(0x8B4513);
            brick.lineStyle(2, 0x4A2500);
            brick.drawRect(0, 0, brickWidth, brickHeight);
            brick.endFill();
            brick.lineStyle(1, 0x4A2500, 0.5);
            brick.moveTo(0, brickHeight/2);
            brick.lineTo(brickWidth, brickHeight/2);
            brick.moveTo(brickWidth/2, 0);
            brick.lineTo(brickWidth/2, brickHeight);
            brick.x = x;
            brick.y = y;
            brick.isUnbreakable = true;
            app.stage.addChild(brick);
            gameState.boundaryBricks.push(brick);
            unbreakableBrickPositions.push({x, y});
        }
        
        // Create new level objects, passing the unbreakable brick positions
        gameState.bricks = this.createBricks(app, colors, unbreakableBrickPositions);
        
        // Update level text
        levelText.text = `Level: ${this.currentLevel}`;
        
        return true;
    },

    // Check if level is completed and handle progression
    checkLevelComplete(app, gameState, levelText) {
        const remainingBricks = gameState.bricks.filter(brick => brick.visible).length;
        if (remainingBricks === 0) {
            this.currentLevel++;
            if (this.loadLevel(app, gameState.colors, levelText, gameState)) {
                // Reset ball and paddle position for next level
                gameState.ball.x = 400;
                gameState.ball.y = 530;
                gameState.ball.vx = 0;
                gameState.ball.vy = 0;
                gameState.paddle.x = 350;
                gameState.gameStarted = false;
            } else {
                // Game completed!
                const gameCompleteText = new PIXI.Text('Congratulations!\nYou completed all levels!', {
                    fontFamily: 'Arial',
                    fontSize: 48,
                    fill: 0xffffff,
                    align: 'center'
                });
                gameCompleteText.x = app.screen.width / 2 - gameCompleteText.width / 2;
                gameCompleteText.y = app.screen.height / 2 - gameCompleteText.height / 2;
                app.stage.addChild(gameCompleteText);
                gameState.gameOver = true;
            }
        }
    }
};

export { LevelSystem };
