'use strict';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const CANVAS_W      = 800;
const CANVAS_H      = 448;   // 14 × 32
const TILE          = 32;
const COLS          = 60;
const ROWS          = 14;

const GRAVITY       = 900;   // px/s²
const FLUTTER_GRAV  = 240;   // px/s² while fluttering (reduced gravity)
const FLUTTER_VMAX  = 80;    // max fall speed while fluttering px/s
const MOVE_SPEED    = 200;   // px/s horizontal
const JUMP_VEL      = -520;  // px/s upward impulse

const FOOD_DRAIN    = 6;     // food units per second (easy – Level 1)
const FOOD_COLLECT  = 35;    // food restored per pickup
const FOOD_MAX      = 100;
const COIN_SCORE    = 10;
const COIN_R        = 8;     // coin radius px
const FOOD_R        = 7;     // food radius px

// ─── CANVAS ──────────────────────────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
canvas.width  = CANVAS_W;
canvas.height = CANVAS_H;

// ─── GAME STATE ──────────────────────────────────────────────────────────────
let gameState          = 'menu';  // 'menu'|'playing'|'transitioning'|'level2'|'gameover'|'win'
let score              = 0;
let bestScore          = 0;
let foodMeter          = FOOD_MAX;
let player             = null;
let cameraX            = 0;
let tileMap            = [];
let coins              = [];
let foods              = [];
let gardenGate         = null;
let levelCompleteTimer = 0;

// ─── CLOUD DATA (fixed world positions) ──────────────────────────────────────
const CLOUDS = [
  { x: 120,  y: 45,  w: 110, h: 38 },
  { x: 380,  y: 65,  w: 85,  h: 30 },
  { x: 620,  y: 35,  w: 130, h: 44 },
  { x: 920,  y: 55,  w: 95,  h: 33 },
  { x: 1180, y: 40,  w: 115, h: 40 },
  { x: 1450, y: 70,  w: 90,  h: 32 },
  { x: 1720, y: 48,  w: 105, h: 36 },
];

// ─── INPUT ───────────────────────────────────────────────────────────────────
const keys = new Set();

window.addEventListener('keydown', e => {
  const wasHeld = keys.has(e.code);
  keys.add(e.code);

  if (!wasHeld) {
    switch (gameState) {
      case 'menu':
        if (e.code === 'Enter') startGame();
        break;
      case 'playing':
        if ((e.code === 'Space' || e.code === 'ArrowUp') && player.onGround) {
          player.vy = JUMP_VEL;
          player.onGround = false;
        }
        break;
      case 'transitioning':
        // skip animation with Enter/Space
        if (e.code === 'Enter' || e.code === 'Space') levelCompleteTimer = 999;
        break;
      case 'level2':
      case 'gameover':
      case 'win':
        if (e.code === 'KeyR') startGame();
        break;
    }
  }

  if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
    e.preventDefault();
  }
});

window.addEventListener('keyup', e => keys.delete(e.code));

// ─── LEVEL BUILDING ──────────────────────────────────────────────────────────
function buildTileMap() {
  const map = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));

  function fill(r1, c1, r2, c2) {
    for (let r = r1; r <= r2; r++)
      for (let c = c1; c <= c2; c++)
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS)
          map[r][c] = 1;
  }

  // ── Ground (3 tiles deep, rows 11–13) ──
  // Start section: cols 0–21
  fill(11,  0, 13, 21);
  // One large gap: cols 22–30 (9 tiles = 288 px → scary but bridgeable)
  // End section: cols 31–59
  fill(11, 31, 13, 59);

  // ── Platform group 1 – start area (low, easy) ──
  fill(8,  5,  8, 11);   // 7 tiles wide, row 8

  // ── Platform group 2 – approach + bridge over gap ──
  fill(7, 14,  7, 19);   // approach ledge, row 7, 6 tiles
  fill(7, 22,  7, 29);   // bridge directly over the gap, row 7, 8 tiles

  // ── Platform group 3 – mid section ──
  fill(7, 37,  7, 43);   // 7 tiles wide, row 7

  // ── Platform group 4 – near gate (slightly higher) ──
  fill(6, 50,  6, 56);   // 7 tiles wide, row 6

  return map;
}

// ─── ENTITY DEFINITIONS ──────────────────────────────────────────────────────
// Each entry is [tileRow, tileCol]; entity is centred inside that tile cell.
const COIN_DEFS = [
  // Start ground (row 11 → coins at row 10)
  [10,  3], [10,  8], [10, 16],
  // Platform group 1 (row 8 → coins at row 7)
  [7,  6],  [7,  9],
  // Gap bridge (row 7 → coins at row 6)
  [6, 23],  [6, 26],  [6, 29],
  // End section ground (row 11 → coins at row 10)
  [10, 33], [10, 44],
  // Platform group 3 (row 7 → coins at row 6)
  [6, 38],  [6, 42],
  // Platform group 4 (row 6 → coins at row 5)
  [5, 51],  [5, 55],
  // Near gate
  [10, 57],
];

const FOOD_DEFS = [
  [10, 11],   // start area
  [10, 20],   // just before the gap
  [10, 40],   // mid section
  [10, 56],   // near gate
];

function buildCoins() {
  return COIN_DEFS.map(([row, col]) => ({
    x: col * TILE + TILE / 2,
    y: row * TILE + TILE / 2,
    collected: false,
  }));
}

function buildFoods() {
  return FOOD_DEFS.map(([row, col]) => ({
    x: col * TILE + TILE / 2,
    y: row * TILE + TILE / 2,
    collected: false,
  }));
}

// ─── PLAYER ──────────────────────────────────────────────────────────────────
function createPlayer() {
  return {
    x: 2 * TILE,
    y: 8 * TILE,   // will fall onto ground on first frame
    w: 22,
    h: 26,
    vx: 0,
    vy: 0,
    onGround: false,
    facing: 1,       // 1 = right, -1 = left
  };
}

// ─── START / RESET ───────────────────────────────────────────────────────────
function startGame() {
  score              = 0;
  foodMeter          = FOOD_MAX;
  gameState          = 'playing';
  cameraX            = 0;
  levelCompleteTimer = 0;
  tileMap            = buildTileMap();
  player             = createPlayer();
  coins              = buildCoins();
  foods              = buildFoods();
  // Garden gate sits on top of ground row 11 (y = 11*TILE = 352), 80 px tall, 2 tiles wide
  gardenGate = { x: 57 * TILE, y: 11 * TILE - 80, w: 64, h: 80 };
}

// ─── COLLISION HELPERS ───────────────────────────────────────────────────────
function isSolid(r, c) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
  return tileMap[r][c] === 1;
}

/** Push player out of solid tiles along the X axis after horizontal movement. */
function resolveX() {
  // Nothing to resolve if not moving horizontally
  if (player.vx === 0) return;

  const r1 = Math.max(0,      Math.floor(player.y            / TILE));
  // Use h-1 so that standing exactly on ground (player bottom = tile top) does NOT
  // include the ground row in the horizontal check — prevents false wall pushes.
  const r2 = Math.min(ROWS-1, Math.floor((player.y + player.h - 1) / TILE));
  const c1 = Math.floor(player.x            / TILE);
  const c2 = Math.min(COLS-1, Math.floor((player.x + player.w - 1) / TILE));

  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      if (!isSolid(r, c)) continue;
      const tx = c * TILE;
      if (player.vx >= 0) {
        player.x = tx - player.w;
      } else {
        player.x = tx + TILE;
      }
      player.vx = 0;
    }
  }
}

/** Push player out of solid tiles along the Y axis after vertical movement. */
function resolveY() {
  const c1 = Math.max(0,      Math.floor(player.x            / TILE));
  const c2 = Math.min(COLS-1, Math.floor((player.x + player.w - 1) / TILE));
  const r1 = Math.floor(player.y            / TILE);
  const r2 = Math.min(ROWS-1, Math.floor((player.y + player.h) / TILE));

  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      if (!isSolid(r, c)) continue;
      const ty = r * TILE;
      if (player.vy >= 0) {
        // Landing on top of tile
        player.y = ty - player.h;
        player.vy = 0;
        player.onGround = true;
      } else {
        // Bumping a ceiling
        player.y = ty + TILE;
        player.vy = 0;
      }
    }
  }
}

// ─── UPDATE ──────────────────────────────────────────────────────────────────
function update(dt) {
  // Handle level-transition countdown (player frozen, scene still drawn)
  if (gameState === 'transitioning') {
    levelCompleteTimer += dt;
    if (levelCompleteTimer >= 2.5) {
      gameState = 'level2';
    }
    return;
  }

  // Horizontal input
  if (keys.has('ArrowLeft') || keys.has('KeyA')) {
    player.vx = -MOVE_SPEED;
    player.facing = -1;
  } else if (keys.has('ArrowRight') || keys.has('KeyD')) {
    player.vx = MOVE_SPEED;
    player.facing = 1;
  } else {
    player.vx = 0;
  }

  // Flutter: holding jump in the air slows the fall
  const fluttering = !player.onGround &&
    (keys.has('Space') || keys.has('ArrowUp'));
  const grav = fluttering ? FLUTTER_GRAV : GRAVITY;
  player.vy += grav * dt;
  if (fluttering && player.vy > FLUTTER_VMAX) player.vy = FLUTTER_VMAX;

  // Move X → resolve → move Y → resolve (separate axes = stable AABB)
  player.x += player.vx * dt;
  // Clamp to level bounds horizontally
  player.x = Math.max(0, Math.min(player.x, COLS * TILE - player.w));
  resolveX();

  player.onGround = false;
  player.y += player.vy * dt;
  resolveY();

  // Death: fell below the canvas
  if (player.y > CANVAS_H + 64) {
    triggerGameOver();
    return;
  }

  // Food drain
  foodMeter -= FOOD_DRAIN * dt;
  if (foodMeter <= 0) {
    foodMeter = 0;
    triggerGameOver();
    return;
  }

  // Collect coins and food
  checkCollections();

  // Camera follows player, clamped to level bounds
  cameraX = player.x + player.w / 2 - CANVAS_W / 2;
  cameraX = Math.max(0, Math.min(cameraX, COLS * TILE - CANVAS_W));
}

function triggerGameOver() {
  bestScore = Math.max(bestScore, score);
  gameState = 'gameover';
}

function checkCollections() {
  const px = player.x, py = player.y, pw = player.w, ph = player.h;

  for (const coin of coins) {
    if (coin.collected) continue;
    if (rectsOverlap(px, py, pw, ph,
        coin.x - COIN_R, coin.y - COIN_R, COIN_R * 2, COIN_R * 2)) {
      coin.collected = true;
      score += COIN_SCORE;
    }
  }

  for (const food of foods) {
    if (food.collected) continue;
    if (rectsOverlap(px, py, pw, ph,
        food.x - FOOD_R, food.y - FOOD_R, FOOD_R * 2, FOOD_R * 2)) {
      food.collected = true;
      foodMeter = Math.min(FOOD_MAX, foodMeter + FOOD_COLLECT);
    }
  }

  // Goal: reach the garden gate
  if (gardenGate && rectsOverlap(px, py, pw, ph,
      gardenGate.x + 10, gardenGate.y, gardenGate.w - 20, gardenGate.h)) {
    bestScore = Math.max(bestScore, score);
    gameState = 'transitioning';
    levelCompleteTimer = 0;
  }
}

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// ─── DRAW HELPERS ────────────────────────────────────────────────────────────
function drawBackground() {
  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#3a8fd4');
  grad.addColorStop(1, '#a8d8f0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Clouds with 40% parallax
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (const cl of CLOUDS) {
    const sx = cl.x - cameraX * 0.4;
    if (sx + cl.w < 0 || sx > CANVAS_W) continue;
    drawCloudShape(sx, cl.y, cl.w, cl.h);
  }
}

function drawCloudShape(x, y, w, h) {
  ctx.beginPath();
  ctx.ellipse(x + w * 0.28, y + h * 0.6,  w * 0.28, h * 0.45, 0, 0, Math.PI * 2);
  ctx.ellipse(x + w * 0.55, y + h * 0.42, w * 0.32, h * 0.5,  0, 0, Math.PI * 2);
  ctx.ellipse(x + w * 0.78, y + h * 0.62, w * 0.24, h * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawTile(sx, sy, row) {
  if (row >= 11) {
    // Dirt body
    ctx.fillStyle = '#7a4e2d';
    ctx.fillRect(sx, sy, TILE, TILE);
    // Thin darker border
    ctx.fillStyle = '#5c3a1e';
    ctx.fillRect(sx, sy + TILE - 2, TILE, 2);
    if (row === 11) {
      // Grass top
      ctx.fillStyle = '#3a7d44';
      ctx.fillRect(sx, sy, TILE, 7);
      ctx.fillStyle = '#4caf50';
      ctx.fillRect(sx, sy, TILE, 4);
    }
  } else {
    // Wooden platform
    ctx.fillStyle = '#7a5230';
    ctx.fillRect(sx, sy, TILE, TILE);
    // Grain lines
    ctx.fillStyle = '#8b6340';
    ctx.fillRect(sx, sy,     TILE, 3);
    ctx.fillRect(sx, sy + 6, TILE, 2);
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(sx, sy + TILE - 3, TILE, 3);
  }
}

function drawGardenGate() {
  const sx = Math.floor(gardenGate.x - cameraX);
  const sy = gardenGate.y;
  const w  = gardenGate.w;
  const h  = gardenGate.h;
  const postW = 10;
  const archH = 16;

  // Posts – dark green wood
  ctx.fillStyle = '#1b5e20';
  ctx.fillRect(sx,              sy, postW, h);
  ctx.fillRect(sx + w - postW,  sy, postW, h);
  // Post highlights
  ctx.fillStyle = '#2e7d32';
  ctx.fillRect(sx + 2,              sy + 2, postW - 4, h - 4);
  ctx.fillRect(sx + w - postW + 2,  sy + 2, postW - 4, h - 4);

  // Top cross-bar
  ctx.fillStyle = '#1b5e20';
  ctx.fillRect(sx, sy, w, archH);
  ctx.fillStyle = '#2e7d32';
  ctx.fillRect(sx + 2, sy + 2, w - 4, archH - 4);

  // Leafy arch decoration above the gate
  const leafW = 9;
  const leafsX = [sx + postW, sx + postW + leafW + 2, sx + postW + (leafW + 2) * 2,
                  sx + w - postW - leafW * 3 - 2];
  ctx.fillStyle = '#4caf50';
  for (const lx of leafsX) {
    ctx.fillRect(lx, sy - 10, leafW, 12);
  }
  ctx.fillStyle = '#81c784';
  for (const lx of leafsX) {
    ctx.fillRect(lx + 2, sy - 9, leafW - 4, 8);
  }
  // Small flower dots on the arch
  ctx.fillStyle = '#fdd835';
  ctx.fillRect(sx + postW + 3,               sy - 10, 4, 4);
  ctx.fillRect(sx + postW + leafW * 2 + 5,   sy - 10, 4, 4);

  // Vine blobs on left post
  ctx.fillStyle = '#388e3c';
  ctx.fillRect(sx + postW - 4, sy + 20, 6, 5);
  ctx.fillRect(sx + postW - 5, sy + 34, 6, 5);
  ctx.fillRect(sx + postW - 4, sy + 48, 6, 5);
  // Vine blobs on right post
  ctx.fillRect(sx + w - postW - 2, sy + 26, 6, 5);
  ctx.fillRect(sx + w - postW - 3, sy + 40, 6, 5);
  ctx.fillRect(sx + w - postW - 2, sy + 54, 6, 5);

  // Arrow in the passage
  ctx.fillStyle = '#fdd835';
  ctx.font = '11px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('►', sx + w / 2, sy + h * 0.62);
}

// Decorative flowers drawn on top of the grass (pixel-art style)
const FLOWER_DEFS_DRAW = [
  { wx: 10 * TILE + 10 }, { wx: 17 * TILE + 6  },
  { wx: 35 * TILE + 14 }, { wx: 47 * TILE + 8  },
  { wx: 53 * TILE + 12 },
];

function drawFlowers() {
  // Flowers sit on top of ground row 11 (y = 11 * TILE)
  const groundY = 11 * TILE;
  for (const f of FLOWER_DEFS_DRAW) {
    const sx = Math.floor(f.wx - cameraX);
    if (sx < -12 || sx > CANVAS_W + 12) continue;

    // Stem
    ctx.fillStyle = '#388e3c';
    ctx.fillRect(sx,     groundY - 10, 2, 10);
    // Left leaf
    ctx.fillRect(sx - 3, groundY - 6,  4, 3);
    // Flower head (red)
    ctx.fillStyle = '#e53935';
    ctx.fillRect(sx - 2, groundY - 14, 6, 5);
    // Centre dot (yellow)
    ctx.fillStyle = '#fdd835';
    ctx.fillRect(sx,     groundY - 13, 2, 3);
  }
}

function drawPlayer() {
  const sx = Math.floor(player.x - cameraX);
  const sy = Math.floor(player.y);
  const w  = player.w;
  const h  = player.h;
  const fr = player.facing > 0;
  const fluttering = !player.onGround &&
    (keys.has('Space') || keys.has('ArrowUp'));

  // Wings (behind body, spread when fluttering)
  ctx.fillStyle = '#2e7d32';
  if (fluttering) {
    ctx.fillRect(sx - 6, sy + 2, 8, 12);
    ctx.fillRect(sx + w - 2, sy + 2, 8, 12);
  } else if (!player.onGround) {
    ctx.fillRect(sx - 3, sy + 8, 5, 8);
    ctx.fillRect(sx + w - 2, sy + 8, 5, 8);
  } else {
    ctx.fillRect(sx + 2, sy + 10, w - 4, 8);
  }

  // Body
  ctx.fillStyle = '#43a047';
  ctx.fillRect(sx + 3, sy + 5, w - 6, h - 5);

  // Belly (lighter stripe)
  ctx.fillStyle = '#66bb6a';
  ctx.fillRect(sx + 6, sy + 10, w - 12, h - 14);

  // Head
  ctx.fillStyle = '#66bb6a';
  ctx.fillRect(sx + 4, sy, w - 8, 14);

  // Eye
  ctx.fillStyle = '#111';
  const ex = fr ? sx + w - 10 : sx + 4;
  ctx.fillRect(ex, sy + 3, 4, 4);
  // Shine
  ctx.fillStyle = '#fff';
  ctx.fillRect(ex + 1, sy + 3, 2, 2);

  // Beak
  ctx.fillStyle = '#fdd835';
  if (fr) {
    ctx.fillRect(sx + w - 4, sy + 8, 6, 3);
    ctx.fillRect(sx + w - 4, sy + 11, 5, 2);
  } else {
    ctx.fillRect(sx - 2, sy + 8, 6, 3);
    ctx.fillRect(sx - 1, sy + 11, 5, 2);
  }

  // Cheek patch
  ctx.fillStyle = '#ffee58';
  ctx.fillRect(fr ? sx + w - 10 : sx + 4, sy + 7, 4, 3);
}

function drawCoin(coin) {
  const sx = coin.x - cameraX;
  // Outer circle
  ctx.fillStyle = '#fdd835';
  ctx.beginPath();
  ctx.arc(sx, coin.y, COIN_R, 0, Math.PI * 2);
  ctx.fill();
  // Inner highlight
  ctx.fillStyle = '#fff176';
  ctx.beginPath();
  ctx.arc(sx - 2, coin.y - 2, COIN_R * 0.42, 0, Math.PI * 2);
  ctx.fill();
  // Rim
  ctx.strokeStyle = '#f9a825';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(sx, coin.y, COIN_R, 0, Math.PI * 2);
  ctx.stroke();
}

function drawFood(food) {
  const sx = food.x - cameraX;
  // Seed shape (slightly oval)
  ctx.fillStyle = '#ff7043';
  ctx.beginPath();
  ctx.ellipse(sx, food.y, FOOD_R, FOOD_R * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Highlight
  ctx.fillStyle = '#ffab91';
  ctx.beginPath();
  ctx.ellipse(sx - 1.5, food.y - 1.5, FOOD_R * 0.35, FOOD_R * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHUD() {
  // Dark semi-transparent bar
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(0, 0, CANVAS_W, 44);

  ctx.textBaseline = 'middle';

  // Score (left)
  ctx.fillStyle = '#fdd835';
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${score}`, 10, 22);

  // Level name below score
  ctx.fillStyle = '#a5d6a7';
  ctx.font = '5px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('LEVEL 1 \u2013 Der Garten', 10, 37);

  // Food meter (center)
  const barW = 180, barH = 14;
  const barX = CANVAS_W / 2 - barW / 2;
  const barY = 15;

  ctx.fillStyle = '#333';
  ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

  const fillFrac  = foodMeter / FOOD_MAX;
  const barColor  = fillFrac > 0.5 ? '#4caf50'
                  : fillFrac > 0.25 ? '#ffc107'
                  : '#f44336';
  ctx.fillStyle = barColor;
  ctx.fillRect(barX, barY, Math.max(0, fillFrac * barW), barH);

  // Blinking border when food is critically low
  if (fillFrac <= 0.25) {
    const blink = Math.floor(Date.now() / 300) % 2 === 0;
    ctx.strokeStyle = blink ? '#f44336' : '#ff8a80';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2);
  } else {
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2);
  }

  // Food label above bar
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '5px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('FOOD', CANVAS_W / 2, barY + barH / 2 + 1);

  // Best score (right)
  ctx.fillStyle = '#90caf9';
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`BEST ${bestScore}`, CANVAS_W - 10, 22);
}

// ─── SCREEN DRAWING ──────────────────────────────────────────────────────────
function drawMenuScreen() {
  // Sky
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#3a8fd4');
  grad.addColorStop(1, '#a8d8f0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Ground strip
  ctx.fillStyle = '#3a7d44';
  ctx.fillRect(0, CANVAS_H - 60, CANVAS_W, 8);
  ctx.fillStyle = '#7a4e2d';
  ctx.fillRect(0, CANVAS_H - 52, CANVAS_W, 52);

  // Simple decorative clouds
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  drawCloudShape(60,  50, 110, 38);
  drawCloudShape(340, 70,  90, 30);
  drawCloudShape(590, 40, 120, 42);

  // Overlay
  ctx.fillStyle = 'rgba(0,0,10,0.45)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Title
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 12;

  ctx.fillStyle = '#fdd835';
  ctx.font = '28px "Press Start 2P", monospace';
  ctx.fillText('BUDGIE', CANVAS_W / 2, 130);
  ctx.fillStyle = '#fff';
  ctx.font = '18px "Press Start 2P", monospace';
  ctx.fillText('PLATFORMER', CANVAS_W / 2, 170);

  ctx.shadowBlur = 0;

  // Decorative budgie icon
  const bx = CANVAS_W / 2 - 18, by = 200;
  ctx.fillStyle = '#2e7d32';
  ctx.fillRect(bx - 8, by + 8, 10, 14);
  ctx.fillRect(bx + 36, by + 8, 10, 14);
  ctx.fillStyle = '#43a047';
  ctx.fillRect(bx + 4, by + 6, 28, 30);
  ctx.fillStyle = '#66bb6a';
  ctx.fillRect(bx + 8, by, 20, 14);
  ctx.fillStyle = '#111';
  ctx.fillRect(bx + 20, by + 3, 5, 5);
  ctx.fillStyle = '#fff';
  ctx.fillRect(bx + 21, by + 3, 2, 2);
  ctx.fillStyle = '#fdd835';
  ctx.fillRect(bx + 28, by + 8, 8, 4);

  // Controls
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillText('← → MOVE    SPACE / ↑  JUMP & FLUTTER', CANVAS_W / 2, 278);
  ctx.fillText('Collect coins & seeds \u00b7 reach the gate', CANVAS_W / 2, 300);

  // Press Enter (blinking)
  if (Math.floor(Date.now() / 550) % 2 === 0) {
    ctx.fillStyle = '#fdd835';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('PRESS  ENTER  TO  START', CANVAS_W / 2, 345);
  }
}

function drawGameOverScreen() {
  // Re-render the level in the background for context
  drawBackground();
  drawLevelTiles();

  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 10;

  ctx.fillStyle = '#f44336';
  ctx.font = '22px "Press Start 2P", monospace';
  ctx.fillText('GAME  OVER', CANVAS_W / 2, 175);

  ctx.shadowBlur = 0;

  ctx.fillStyle = '#fff';
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.fillText(`SCORE :  ${score}`, CANVAS_W / 2, 225);
  ctx.fillText(`BEST  :  ${bestScore}`, CANVAS_W / 2, 255);

  if (Math.floor(Date.now() / 550) % 2 === 0) {
    ctx.fillStyle = '#fdd835';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText('PRESS  R  TO  RESTART', CANVAS_W / 2, 315);
  }
}

function drawTransitionScreen() {
  // Draw the game world in background (frozen)
  drawBackground();
  drawLevelTiles();
  drawFlowers();
  if (gardenGate) drawGardenGate();
  for (const food of foods) if (!food.collected) drawFood(food);
  for (const coin of coins) if (!coin.collected) drawCoin(coin);
  drawPlayer();

  // Dark overlay
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 12;

  ctx.fillStyle = '#a5d6a7';
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.fillText('LEVEL 1 \u2013 Der Garten  GESCHAFFT!', CANVAS_W / 2, 180);

  ctx.fillStyle = '#fdd835';
  ctx.font = '12px "Press Start 2P", monospace';
  ctx.fillText('Weiter in den Wald...', CANVAS_W / 2, 220);

  ctx.shadowBlur = 0;

  // Animated dots
  const dots = '.'.repeat((Math.floor(Date.now() / 400) % 4));
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '9px "Press Start 2P", monospace';
  ctx.fillText(dots, CANVAS_W / 2, 255);

  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '6px "Press Start 2P", monospace';
  ctx.fillText('ENTER / LEERTASTE zum \u00dcberspringen', CANVAS_W / 2, 295);
}

function drawLevel2Screen() {
  // Forest-green sky gradient for "Der Wald"
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#1b5e20');
  grad.addColorStop(0.6, '#2e7d32');
  grad.addColorStop(1, '#388e3c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Scattered leaf particles
  const colours = ['#4caf50','#66bb6a','#2e7d32','#a5d6a7','#81c784'];
  const seed    = Math.floor(Date.now() / 120);
  for (let i = 0; i < 30; i++) {
    const lx = ((i * 317 + seed * 5) % CANVAS_W);
    const ly = ((i * 191 + seed * 9) % CANVAS_H);
    ctx.fillStyle = colours[i % colours.length];
    ctx.fillRect(lx, ly, 5, 5);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 14;

  ctx.fillStyle = '#a5d6a7';
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.fillText('LEVEL 2 \u2013 Der Wald', CANVAS_W / 2, 150);

  ctx.fillStyle = '#fdd835';
  ctx.font = '14px "Press Start 2P", monospace';
  ctx.fillText('COMING SOON', CANVAS_W / 2, 190);

  ctx.shadowBlur = 0;

  ctx.fillStyle = '#fff';
  ctx.font = '9px "Press Start 2P", monospace';
  ctx.fillText(`Level 1 Score :  ${score}`, CANVAS_W / 2, 255);
  ctx.fillText(`Best Score    :  ${bestScore}`, CANVAS_W / 2, 280);

  if (Math.floor(Date.now() / 550) % 2 === 0) {
    ctx.fillStyle = '#4caf50';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('R  \u2013  Level 1 nochmal spielen', CANVAS_W / 2, 345);
  }
}

function drawWinScreen() {
  drawLevel2Screen();
}

// ─── LEVEL TILE RENDERING ────────────────────────────────────────────────────
function drawLevelTiles() {
  const startCol = Math.max(0,      Math.floor(cameraX / TILE));
  const endCol   = Math.min(COLS-1, Math.floor((cameraX + CANVAS_W) / TILE) + 1);

  for (let row = 0; row < ROWS; row++) {
    for (let col = startCol; col <= endCol; col++) {
      if (tileMap[row][col] === 1) {
        drawTile(col * TILE - cameraX, row * TILE, row);
      }
    }
  }
}

// ─── FULL GAME RENDER ────────────────────────────────────────────────────────
function drawGame() {
  drawBackground();
  drawLevelTiles();

  // Flower decorations
  drawFlowers();

  // Garden gate
  if (gardenGate) drawGardenGate();

  // Foods
  for (const food of foods)
    if (!food.collected) drawFood(food);

  // Coins
  for (const coin of coins)
    if (!coin.collected) drawCoin(coin);

  // Player
  drawPlayer();

  // HUD (on top of everything)
  drawHUD();
}

// ─── GAME LOOP ───────────────────────────────────────────────────────────────
let lastTime = 0;

function loop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // cap at 50 ms
  lastTime = timestamp;

  switch (gameState) {
    case 'menu':
      drawMenuScreen();
      break;
    case 'playing':
      update(dt);
      drawGame();
      break;
    case 'transitioning':
      update(dt);
      drawTransitionScreen();
      break;
    case 'level2':
      drawLevel2Screen();
      break;
    case 'gameover':
      drawGameOverScreen();
      break;
    case 'win':
      drawWinScreen();
      break;
  }

  requestAnimationFrame(loop);
}

// ─── INITIALISE ──────────────────────────────────────────────────────────────
// Pre-build the tile map so the game-over screen has level geometry available
tileMap = buildTileMap();
cameraX = 0;

requestAnimationFrame(loop);
