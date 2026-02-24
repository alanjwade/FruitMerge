/**
 * Main entry point - boots the game and registers the service worker
 */
import { Game } from './game.js';

// Start game once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  // Prevent pull-to-refresh and overscroll on mobile
  document.body.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

  // Launch the game
  new Game();

  // Register service worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(() => {
      console.log('Service worker registered');
    }).catch((err) => {
      console.warn('SW registration failed:', err);
    });
  }
}
