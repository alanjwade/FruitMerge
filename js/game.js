/**
 * Game - core game logic for Fruit Merge (Suika-style)
 */
import { PhysicsEngine } from './physics.js';
import { Renderer } from './renderer.js';
import { FRUITS, MAX_DROP_LEVEL } from './fruits.js';

const DANGER_LINE_Y = 80;            // y position of the "game over" line
const DROP_COOLDOWN = 500;            // ms between drops
const GAME_OVER_GRACE_PERIOD = 3000;  // ms a fruit can linger above danger line

export class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.nextCanvas = document.getElementById('next-canvas');
    this.dropLine = document.getElementById('drop-line');
    this.scoreEl = document.getElementById('score');
    this.bestScoreEl = document.getElementById('best-score');
    this.finalScoreEl = document.getElementById('final-score');
    this.gameOverOverlay = document.getElementById('game-over-overlay');
    this.restartBtn = document.getElementById('restart-btn');

    this.renderer = new Renderer(this.canvas);
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem('fruitMergeBest') || '0', 10);
    this.bestScoreEl.textContent = this.bestScore;

    this.gameOver = false;
    this.dropX = 0;
    this.currentLevel = 0;
    this.nextLevel = 0;
    this.canDrop = true;
    this.lastDropTime = 0;

    this._initSize();
    this._initPhysics();
    this._pickNextFruit();
    this._pickNextFruit(); // fill both current and next
    this._bindEvents();
    this._loop();
  }

  _initSize() {
    const container = document.getElementById('game-container');
    const rect = container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.dpr = window.devicePixelRatio || 1;
    this.renderer.resize(this.width, this.height, this.dpr);
    this.dropX = this.width / 2;
  }

  _initPhysics() {
    this.physics = new PhysicsEngine(this.width, this.height);
    this.physics.onCollision = (a, b) => this._onCollision(a, b);
  }

  _pickNextFruit() {
    this.currentLevel = this.nextLevel;
    this.nextLevel = Math.floor(Math.random() * (MAX_DROP_LEVEL + 1));
    this.renderer.drawNextFruit(this.nextCanvas, this.nextLevel);
  }

  /* ---------- Events ---------- */

  _bindEvents() {
    // Pointer events for cross-platform (mouse + touch)
    const container = document.getElementById('game-container');

    container.addEventListener('pointerdown', (e) => this._onPointerDown(e));
    container.addEventListener('pointermove', (e) => this._onPointerMove(e));
    container.addEventListener('pointerup', (e) => this._onPointerUp(e));

    this.restartBtn.addEventListener('click', () => this.restart());

    window.addEventListener('resize', () => this._onResize());
  }

  _getPointerX(e) {
    const rect = this.canvas.getBoundingClientRect();
    return e.clientX - rect.left;
  }

  _onPointerDown(e) {
    if (this.gameOver) return;
    e.preventDefault();
    this.dropX = this._clampX(this._getPointerX(e));
    this._updateDropLine();
  }

  _onPointerMove(e) {
    if (this.gameOver) return;
    e.preventDefault();
    this.dropX = this._clampX(this._getPointerX(e));
    this._updateDropLine();
  }

  _onPointerUp(e) {
    if (this.gameOver) return;
    e.preventDefault();
    this.dropX = this._clampX(this._getPointerX(e));
    this._drop();
  }

  _clampX(x) {
    const r = FRUITS[this.currentLevel].radius;
    return Math.max(r, Math.min(this.width - r, x));
  }

  _updateDropLine() {
    this.dropLine.style.left = this.dropX + 'px';
  }

  _onResize() {
    const oldW = this.width;
    const oldH = this.height;
    this._initSize();
    this.physics.resize(this.width, this.height);

    // Rescale existing bodies
    const sx = this.width / oldW;
    const sy = this.height / oldH;
    for (const b of this.physics.bodies) {
      b.x *= sx;
      b.y *= sy;
    }
  }

  /* ---------- Drop ---------- */

  _drop() {
    if (!this.canDrop) return;
    const now = performance.now();
    if (now - this.lastDropTime < DROP_COOLDOWN) return;

    const fruit = FRUITS[this.currentLevel];
    const body = this.physics.createCircle(
      this.dropX,
      fruit.radius + 10,
      fruit.radius,
      { fruitLevel: this.currentLevel }
    );
    body.dangerTimer = 0;

    this.canDrop = false;
    this.lastDropTime = now;
    setTimeout(() => {
      this.canDrop = true;
    }, DROP_COOLDOWN);

    this._pickNextFruit();
  }

  /* ---------- Collisions / Merge ---------- */

  _onCollision(a, b) {
    if (a.fruitLevel !== b.fruitLevel) return;
    if (a.markedForRemoval || b.markedForRemoval) return;

    const level = a.fruitLevel;
    // If it's the max fruit, just remove both and give big points
    if (level >= FRUITS.length - 1) {
      this._addScore(FRUITS[level].points * 2);
      this.renderer.addMergeParticles(a.x, a.y, FRUITS[level].color, 20);
      this.physics.removeBody(a);
      this.physics.removeBody(b);
      return;
    }

    // Merge: remove both, create next level fruit
    const newLevel = level + 1;
    const newFruit = FRUITS[newLevel];
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;

    this.physics.removeBody(a);
    this.physics.removeBody(b);

    const merged = this.physics.createCircle(mx, my, newFruit.radius, {
      fruitLevel: newLevel,
      vy: -1,
    });
    merged.dangerTimer = 0;

    this._addScore(newFruit.points);
    this.renderer.addMergeParticles(mx, my, newFruit.color, 12);
  }

  _addScore(points) {
    this.score += points;
    this.scoreEl.textContent = this.score;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.bestScoreEl.textContent = this.bestScore;
      localStorage.setItem('fruitMergeBest', this.bestScore.toString());
    }
  }

  /* ---------- Game Over detection ---------- */

  _checkGameOver() {
    for (const b of this.physics.bodies) {
      if (b.isStatic || b.markedForRemoval) continue;
      if (b.y - b.radius < DANGER_LINE_Y && b.settled) {
        b.dangerTimer = (b.dangerTimer || 0) + 16;
        if (b.dangerTimer > GAME_OVER_GRACE_PERIOD) {
          this._triggerGameOver();
          return;
        }
      } else {
        b.dangerTimer = 0;
      }
    }
  }

  _triggerGameOver() {
    this.gameOver = true;
    this.finalScoreEl.textContent = this.score;
    this.gameOverOverlay.classList.remove('hidden');
  }

  restart() {
    this.gameOver = false;
    this.score = 0;
    this.scoreEl.textContent = '0';
    this.gameOverOverlay.classList.add('hidden');
    this._initPhysics();
    this._pickNextFruit();
    this._pickNextFruit();
    this.canDrop = true;
  }

  /* ---------- Game Loop ---------- */

  _loop() {
    if (!this.gameOver) {
      this.physics.update(1);
      this._checkGameOver();
    }

    // Render
    this.renderer.clear();
    this.renderer.drawDangerLine(DANGER_LINE_Y);

    for (const body of this.physics.bodies) {
      if (!body.markedForRemoval) {
        this.renderer.drawFruit(body);
      }
    }

    if (!this.gameOver && this.canDrop) {
      const r = FRUITS[this.currentLevel].radius;
      this.renderer.drawPendingFruit(this.dropX, this.currentLevel, r);
    }

    this.renderer.drawParticles();

    requestAnimationFrame(() => this._loop());
  }
}
