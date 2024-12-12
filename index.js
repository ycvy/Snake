class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.width = 400;
        this.canvas.height = 400;
        
        this.gridSize = 20;
        this.snake = [{x: 5, y: 5}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.score = 0;
        
        this.gameLoop = null;
        this.gameSpeed = 100;
        
        this.setupEventListeners();
        this.startGame();
        
        // Highscore aus localStorage laden
        this.highscore = parseInt(localStorage.getItem('snakeHighscore')) || 0;
        document.getElementById('highscoreValue').textContent = this.highscore;
        
        // Level-System hinzufügen
        this.level = 1;
        this.pointsToNextLevel = 50;
        this.gameSpeed = this.getSpeedForLevel(this.level);
        
        document.getElementById('levelValue').textContent = this.level;
    }
    
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
                y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
            };
        } while (this.isPositionOccupied(newFood));
        
        return newFood;
    }
    
    isPositionOccupied(position) {
        return this.snake.some(segment => 
            segment.x === position.x && segment.y === position.y
        );
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    if (this.direction !== 'down') this.direction = 'up';
                    break;
                case 'ArrowDown':
                    if (this.direction !== 'up') this.direction = 'down';
                    break;
                case 'ArrowLeft':
                    if (this.direction !== 'right') this.direction = 'left';
                    break;
                case 'ArrowRight':
                    if (this.direction !== 'left') this.direction = 'right';
                    break;
            }
        });
    }
    
    update() {
        const head = {...this.snake[0]};
        
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize ||
            this.checkCollision(head)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        if (head.x === this.food.x && head.y === this.food.y) {
            // Punkte basierend auf Level vergeben
            const pointsGained = this.getPointsForLevel(this.level);
            this.score += pointsGained;
            document.getElementById('scoreValue').textContent = this.score;
            this.food = this.generateFood();
            
            // Prüfen ob Level-Up erreicht wurde
            this.checkLevelUp();
        } else {
            this.snake.pop();
        }
    }
    
    checkCollision(head) {
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Schlange zeichnen
        this.ctx.fillStyle = '#4CAF50';
        this.snake.forEach(segment => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 1,
                this.gridSize - 1
            );
        });
        
        // Essen zeichnen
        this.ctx.fillStyle = '#FF5252';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 1,
            this.gridSize - 1
        );
    }
    
    gameOver() {
        clearInterval(this.gameLoop);
        
        // Highscore aktualisieren wenn nötig
        if (this.score > this.highscore) {
            this.highscore = this.score;
            localStorage.setItem('snakeHighscore', this.highscore);
            document.getElementById('highscoreValue').textContent = this.highscore;
            alert(`Neuer Highscore: ${this.highscore}!\nSpiel vorbei!`);
        } else {
            alert(`Spiel vorbei! Deine Punktzahl: ${this.score}\nHighscore: ${this.highscore}`);
        }
        
        this.resetGame();
    }
    
    resetGame() {
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.score = 0;
        this.level = 1;
        this.pointsToNextLevel = 50;
        this.gameSpeed = this.getSpeedForLevel(this.level);
        
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('highscoreValue').textContent = this.highscore;
        document.getElementById('levelValue').textContent = this.level;
        
        this.food = this.generateFood();
        this.startGame();
    }
    
    startGame() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, this.gameSpeed);
    }
    
    getSpeedForLevel(level) {
        // Geschwindigkeit nimmt mit jedem Level zu (Verzögerung nimmt ab)
        return Math.max(100 - (level - 1) * 10, 50);
    }
    
    getPointsForLevel(level) {
        // Mehr Punkte in höheren Leveln
        return 10 + (level - 1) * 5;
    }
    
    checkLevelUp() {
        if (this.score >= this.pointsToNextLevel) {
            this.level++;
            this.pointsToNextLevel += 50 + (this.level - 1) * 20;
            this.gameSpeed = this.getSpeedForLevel(this.level);
            
            // Level-Anzeige aktualisieren
            document.getElementById('levelValue').textContent = this.level;
            
            // Spiel mit neuer Geschwindigkeit neu starten
            this.startGame();
            
            // Level-Up Nachricht
            alert(`Glückwunsch! Level ${this.level} erreicht!\nGeschwindigkeit erhöht!`);
        }
    }
}

// Spiel starten
window.onload = () => new SnakeGame();