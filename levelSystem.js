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
    createBricks(app, colors) {
        const bricks = [];
        const levelConfig = this.levels[this.currentLevel];
        
        levelConfig.bricks.forEach((row, i) => {
            row.forEach((hasBrick, j) => {
                if (hasBrick) {
                    const brick = new PIXI.Graphics();
                    brick.beginFill(colors[i]);
                    brick.drawRect(0, 0, 40, 20);
                    brick.endFill();
                    brick.x = 80 + j * 45;
                    brick.y = 60 + i * 30;
                    brick.visible = true;
                    app.stage.addChild(brick);
                    bricks.push(brick);
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
        gameState.walls.forEach(wall => app.stage.removeChild(wall));
        
        // Create new level objects
        gameState.bricks = this.createBricks(app, colors);
        gameState.walls = this.createWalls(app);
        
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
