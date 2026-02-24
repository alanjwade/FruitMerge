/**
 * Lightweight 2D physics engine for the Fruit Merge game.
 * Handles circles with gravity, collision detection/response, and wall constraints.
 */

export class PhysicsEngine {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.gravity = 0.4;
    this.bodies = [];
    this.onCollision = null; // callback(bodyA, bodyB)
    this.damping = 0.995;
    this.restitution = 0.6;
    this.iterations = 2; // collision solver iterations
  }

  /**
   * Create a circular physics body
   */
  createCircle(x, y, radius, options = {}) {
    const body = {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      vx: options.vx || 0,
      vy: options.vy || 0,
      radius,
      mass: Math.PI * radius * radius * 0.01,
      isStatic: options.isStatic || false,
      restitution: options.restitution ?? this.restitution,
      fruitLevel: options.fruitLevel ?? 0,
      markedForRemoval: false,
      settled: false,
      settledTimer: 0,
    };
    this.bodies.push(body);
    return body;
  }

  removeBody(body) {
    body.markedForRemoval = true;
  }

  /**
   * Step the physics simulation forward
   */
  update(dt = 1) {
    // Remove marked bodies
    this.bodies = this.bodies.filter(b => !b.markedForRemoval);

    const bodies = this.bodies;

    // Apply gravity and velocity
    for (const b of bodies) {
      if (b.isStatic) continue;
      b.vy += this.gravity * dt;
      b.vx *= this.damping;
      b.vy *= this.damping;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
    }

    // Solve collisions multiple times for stability
    for (let iter = 0; iter < this.iterations; iter++) {
      // Body vs walls
      for (const b of bodies) {
        if (b.isStatic) continue;
        this._constrainToWalls(b);
      }

      // Body vs body
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i];
          const bBody = bodies[j];
          if (a.markedForRemoval || bBody.markedForRemoval) continue;
          this._resolveCircleCollision(a, bBody, iter === 0);
        }
      }
    }

    // Update settled state
    for (const b of bodies) {
      if (b.isStatic) continue;
      const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      if (speed < 0.5) {
        b.settledTimer++;
        if (b.settledTimer > 30) b.settled = true;
      } else {
        b.settledTimer = 0;
        b.settled = false;
      }
    }
  }

  _constrainToWalls(b) {
    // Left wall
    if (b.x - b.radius < 0) {
      b.x = b.radius;
      b.vx = Math.abs(b.vx) * b.restitution;
    }
    // Right wall
    if (b.x + b.radius > this.width) {
      b.x = this.width - b.radius;
      b.vx = -Math.abs(b.vx) * b.restitution;
    }
    // Floor
    if (b.y + b.radius > this.height) {
      b.y = this.height - b.radius;
      b.vy = -Math.abs(b.vy) * b.restitution;
      if (Math.abs(b.vy) < 0.15) b.vy = 0;
    }
  }

  _resolveCircleCollision(a, b, fireCallback) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distSq = dx * dx + dy * dy;
    const minDist = a.radius + b.radius;

    if (distSq >= minDist * minDist) return;
    if (distSq === 0) {
      b.x += 0.1;
      return;
    }

    const dist = Math.sqrt(distSq);
    const nx = dx / dist;
    const ny = dy / dist;

    // Separate overlapping fruits to exact contact distance
    const overlap = minDist - dist;
    const separation = overlap / 2 + 0.01;
    if (!a.isStatic) {
      a.x -= nx * separation;
      a.y -= ny * separation;
    }
    if (!b.isStatic) {
      b.x += nx * separation;
      b.y += ny * separation;
    }

    // Always apply repulsive velocity to push them apart completely
    const repulsion = 0.3; // strength of pushback
    if (!a.isStatic) {
      a.vx -= nx * repulsion;
      a.vy -= ny * repulsion;
    }
    if (!b.isStatic) {
      b.vx += nx * repulsion;
      b.vy += ny * repulsion;
    }

    // Fire collision callback (for merging)
    if (this.onCollision) {
      this.onCollision(a, b);
    }
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }
}
