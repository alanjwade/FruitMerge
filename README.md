# Fruit Merge 🍉

A **Suika Game**-style physics puzzle game built with vanilla JavaScript. Drop fruits into the container — when two identical fruits touch, they merge into a bigger fruit! Chase the highest score.

## How to Play

1. **Tap/click** anywhere in the container to position and drop a fruit
2. **Drag** left/right to aim before releasing
3. When **two identical fruits collide**, they merge into the next fruit in the chain
4. The fruit evolution chain: 🍒 → 🍓 → 🍇 → 🍊 → 🍎 → 🍐 → 🍑 → 🍍 → 🍈 → 🍉
5. Don't let fruits stack above the **danger line** — that's game over!

## Tech Stack

- **Vanilla JavaScript** — no frameworks
- **Custom 2D physics engine** — gravity, collision detection & response
- **HTML Canvas** rendering with emoji-based fruit graphics
- **PWA** — installable on Android (and iOS) with offline support
- **Vite** dev server + build tool

## Development

```bash
# Install dependencies
npm install

# Start dev server (accessible on local network for phone testing)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Playing on Your Phone (PWA)

### Via Dev Server (Local Network)
1. Run `npm run dev` — the server binds to `0.0.0.0:3000`
2. Find your computer's local IP (e.g., `192.168.1.x`)
3. On your Android phone, open Chrome and navigate to `http://<your-ip>:3000`
4. **Play the game for ~10 seconds** to enable the install prompt
5. Either:
   - Wait for the **install banner** at the bottom, or
   - Tap Chrome's menu (⋮) → **"Install app"** or **"Add to Home Screen"**
6. The game is now a standalone app on your home screen with offline support

### Production Build (Recommended for Installation)
1. Run `npm run build`
2. Run `npm run preview`
3. Follow the same steps as above — production builds are more reliable for PWA installation

## Project Structure

```
FruitMerge/
├── index.html              # Entry point
├── css/style.css           # Mobile-first styles
├── js/
│   ├── main.js             # Boot + service worker registration
│   ├── game.js             # Core game logic
│   ├── physics.js          # 2D physics engine
│   ├── renderer.js         # Canvas rendering
│   └── fruits.js           # Fruit definitions
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service worker (offline caching)
│   └── icons/              # PWA icons
├── vite.config.js          # Vite configuration
└── package.json
```

## License

ISC
