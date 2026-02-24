/**
 * Renderer - draws fruits and effects on the canvas
 */
import { FRUITS } from './fruits.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
  }

  resize(width, height, dpr) {
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.dpr = dpr;
  }

  clear() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);
  }

  /**
   * Draw a fruit body
   */
  drawFruit(body) {
    const ctx = this.ctx;
    const fruit = FRUITS[body.fruitLevel];
    if (!fruit) return;

    ctx.save();
    ctx.translate(body.x, body.y);

    // Draw circle body
    const gradient = ctx.createRadialGradient(
      -body.radius * 0.3, -body.radius * 0.3, body.radius * 0.1,
      0, 0, body.radius
    );
    gradient.addColorStop(0, this._lightenColor(fruit.color, 40));
    gradient.addColorStop(1, fruit.color);

    ctx.beginPath();
    ctx.arc(0, 0, body.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Subtle border
    ctx.strokeStyle = this._darkenColor(fruit.color, 30);
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw emoji
    const fontSize = body.radius * 1.1;
    ctx.font = `${fontSize}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fruit.emoji, 0, 2);

    ctx.restore();
  }

  /**
   * Draw the "danger zone" line at the top
   */
  drawDangerLine(y) {
    const ctx = this.ctx;
    const w = this.canvas.width / this.dpr;

    ctx.save();
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = 'rgba(255, 80, 80, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  /**
   * Draw the pending (hovering) fruit before drop
   */
  drawPendingFruit(x, level, radius) {
    const ctx = this.ctx;
    const fruit = FRUITS[level];
    if (!fruit) return;

    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.translate(x, radius + 10);

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = fruit.color;
    ctx.fill();

    const fontSize = radius * 1.1;
    ctx.font = `${fontSize}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fruit.emoji, 0, 2);

    ctx.restore();
  }

  /**
   * Add a merge particle burst
   */
  addMergeParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 4,
        color,
        life: 1.0,
        decay: 0.03 + Math.random() * 0.02,
      });
    }
  }

  /**
   * Update and draw particles
   */
  drawParticles() {
    const ctx = this.ctx;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Draw the preview of the next fruit
   */
  drawNextFruit(canvas, level) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = 60;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const fruit = FRUITS[level];
    if (!fruit) return;

    const r = Math.min(22, fruit.radius * 0.7);
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
    ctx.fillStyle = fruit.color;
    ctx.fill();

    const fontSize = r * 1.2;
    ctx.font = `${fontSize}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fruit.emoji, size / 2, size / 2 + 1);
  }

  _lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + percent);
    const g = Math.min(255, ((num >> 8) & 0x00ff) + percent);
    const b = Math.min(255, (num & 0x0000ff) + percent);
    return `rgb(${r},${g},${b})`;
  }

  _darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - percent);
    const g = Math.max(0, ((num >> 8) & 0x00ff) - percent);
    const b = Math.max(0, (num & 0x0000ff) - percent);
    return `rgb(${r},${g},${b})`;
  }
}
