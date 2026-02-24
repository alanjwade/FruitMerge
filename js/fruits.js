/**
 * Fruit definitions for the merge game.
 * Each level merges into the next. Inspired by Suika Game fruit progression.
 * Radii are in game-world units (will be scaled to canvas).
 */
export const FRUITS = [
  { name: 'Cherry',      emoji: '🍒', radius: 15, color: '#e74c3c', points: 1   },
  { name: 'Strawberry',  emoji: '🍓', radius: 20, color: '#ff6b81', points: 3   },
  { name: 'Grape',       emoji: '🍇', radius: 25, color: '#8e44ad', points: 6   },
  { name: 'Orange',      emoji: '🍊', radius: 32, color: '#f39c12', points: 10  },
  { name: 'Apple',       emoji: '🍎', radius: 38, color: '#e74c3c', points: 15  },
  { name: 'Pear',        emoji: '🍐', radius: 44, color: '#a8d948', points: 21  },
  { name: 'Peach',       emoji: '🍑', radius: 50, color: '#fdcb6e', points: 28  },
  { name: 'Pineapple',   emoji: '🍍', radius: 56, color: '#f9ca24', points: 36  },
  { name: 'Melon',       emoji: '🍈', radius: 63, color: '#6ab04c', points: 45  },
  { name: 'Watermelon',  emoji: '🍉', radius: 72, color: '#27ae60', points: 55  },
];

/** Maximum fruit level that can appear from random drops (0-indexed) */
export const MAX_DROP_LEVEL = 4;
