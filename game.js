'use strict';

const W = 800;
const H = 448;
const TILE = 32;
const ROWS = 14;
const EDITOR_STORAGE_KEY = 'budgie-phaser-editor-v2';

const MODE_MENU = 'menu';
const MODE_PLAY = 'play';
const MODE_EDITOR = 'editor';
const MODE_WIN = 'win';
const MODE_GAMEOVER = 'gameover';

function toDataUri(svg) {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function makeSvgLibrary() {
  const mk = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`;

  return {
    player0: mk(26, 30,
      '<ellipse cx="8" cy="16" rx="6" ry="8" fill="#2e7d32"/>' +
      '<ellipse cx="18" cy="16" rx="6" ry="8" fill="#2e7d32"/>' +
      '<rect x="6" y="7" width="14" height="21" rx="5" fill="#44a64f"/>' +
      '<rect x="7" y="2" width="12" height="11" rx="6" fill="#7ccf77"/>' +
      '<rect x="14" y="6" width="3" height="3" rx="1" fill="#111"/>' +
      '<polygon points="19,10 26,12 19,14" fill="#ffd54f"/>'),
    player1: mk(26, 30,
      '<ellipse cx="7" cy="14" rx="7" ry="10" fill="#2e7d32"/>' +
      '<ellipse cx="19" cy="14" rx="7" ry="10" fill="#2e7d32"/>' +
      '<rect x="6" y="7" width="14" height="21" rx="5" fill="#44a64f"/>' +
      '<rect x="7" y="2" width="12" height="11" rx="6" fill="#7ccf77"/>' +
      '<rect x="14" y="6" width="3" height="3" rx="1" fill="#111"/>' +
      '<polygon points="19,10 26,12 19,14" fill="#ffd54f"/>'),
    coin0: mk(20, 20,
      '<circle cx="10" cy="10" r="8" fill="#fdd835"/>' +
      '<circle cx="8" cy="8" r="3" fill="#fff59d"/>' +
      '<circle cx="10" cy="10" r="7" fill="none" stroke="#f9a825" stroke-width="1.5"/>'),
    coin1: mk(20, 20,
      '<ellipse cx="10" cy="10" rx="7" ry="8" fill="#fdd835"/>' +
      '<ellipse cx="8" cy="8" rx="3" ry="2.5" fill="#fff59d"/>' +
      '<ellipse cx="10" cy="10" rx="6" ry="7" fill="none" stroke="#f9a825" stroke-width="1.5"/>'),
    food0: mk(20, 20,
      '<ellipse cx="10" cy="10" rx="8" ry="6.4" fill="#ff7043"/>' +
      '<ellipse cx="7" cy="7.5" rx="2.4" ry="2" fill="#ffab91"/>'),
    food1: mk(20, 20,
      '<ellipse cx="10" cy="10" rx="8" ry="6.8" fill="#ff7043"/>' +
      '<ellipse cx="7" cy="7.5" rx="2.6" ry="2.1" fill="#ffab91"/>'),
    rescue0: mk(20, 20,
      '<polygon points="10,1 13,7 19,8 14,12 16,19 10,15 4,19 6,12 1,8 7,7" fill="#fff176" stroke="#fbc02d" stroke-width="1.2"/>'),
    rescue1: mk(20, 20,
      '<polygon points="10,2 13,7 18,8 14,12 15,18 10,15 5,18 6,12 2,8 7,7" fill="#fff59d" stroke="#fbc02d" stroke-width="1.2"/>'),
    beetle0: mk(30, 20,
      '<rect x="2" y="4" width="26" height="14" rx="7" fill="#7f1d1d"/>' +
      '<rect x="5" y="5" width="18" height="4" rx="2" fill="#b71c1c"/>'),
    beetle1: mk(30, 20,
      '<rect x="2" y="4" width="26" height="14" rx="7" fill="#7f1d1d"/>' +
      '<rect x="6" y="5" width="16" height="4" rx="2" fill="#c62828"/>'),
    raven0: mk(34, 24,
      '<ellipse cx="17" cy="13" rx="10" ry="7" fill="#1f1f24"/>' +
      '<polygon points="8,14 0,10 2,16" fill="#2c2c32"/>' +
      '<polygon points="26,14 34,10 32,16" fill="#2c2c32"/>' +
      '<circle cx="22" cy="12" r="1.8" fill="#e0e0e0"/>'),
    raven1: mk(34, 24,
      '<ellipse cx="17" cy="13" rx="10" ry="7" fill="#1f1f24"/>' +
      '<polygon points="8,15 0,13 2,17" fill="#2c2c32"/>' +
      '<polygon points="26,15 34,13 32,17" fill="#2c2c32"/>' +
      '<circle cx="22" cy="12" r="1.8" fill="#e0e0e0"/>'),
    minion0: mk(30, 40,
      '<rect x="4" y="8" width="22" height="30" rx="4" fill="#4e342e"/>' +
      '<rect x="7" y="2" width="16" height="14" rx="4" fill="#6d4c41"/>' +
      '<rect x="13" y="9" width="4" height="4" rx="1" fill="#111"/>'),
    minion1: mk(30, 40,
      '<rect x="4" y="8" width="22" height="30" rx="4" fill="#4e342e"/>' +
      '<rect x="7" y="2" width="16" height="14" rx="4" fill="#7a544a"/>' +
      '<rect x="13" y="9" width="4" height="4" rx="1" fill="#111"/>'),
    projectile0: mk(12, 8,
      '<rect x="1" y="1" width="10" height="6" rx="2" fill="#ffcc80"/>' +
      '<rect x="3" y="2" width="6" height="4" rx="1" fill="#ff8a65"/>'),
    projectile1: mk(12, 8,
      '<rect x="1" y="1" width="10" height="6" rx="2" fill="#ffd180"/>' +
      '<rect x="3" y="2" width="6" height="4" rx="1" fill="#ff7043"/>'),
    spike0: mk(32, 16,
      '<polygon points="0,16 16,0 32,16" fill="#8d8d8d"/>' +
      '<polygon points="4,16 16,3 19,3 7,16" fill="#c2c2c2"/>'),
    spike1: mk(32, 16,
      '<polygon points="0,16 16,0 32,16" fill="#9e9e9e"/>' +
      '<polygon points="4,16 16,4 19,4 7,16" fill="#d4d4d4"/>'),
    net0: mk(40, 40,
      '<rect width="40" height="40" fill="none" stroke="#d0d0d0" stroke-width="1.2"/>' +
      '<path d="M10 0V40M20 0V40M30 0V40M0 10H40M0 20H40M0 30H40" stroke="#d0d0d0" stroke-width="1"/>'),
    net1: mk(40, 40,
      '<rect width="40" height="40" fill="none" stroke="#e0e0e0" stroke-width="1.2"/>' +
      '<path d="M10 0V40M20 0V40M30 0V40M0 10H40M0 20H40M0 30H40" stroke="#e0e0e0" stroke-width="1"/>'),
    pressure0: mk(48, 12,
      '<rect x="0" y="4" width="48" height="8" rx="2" fill="#7b5e3b"/>' +
      '<rect x="2" y="2" width="44" height="4" rx="2" fill="#8d6e45"/>'),
    pressure1: mk(48, 12,
      '<rect x="0" y="4" width="48" height="8" rx="2" fill="#fbc02d"/>' +
      '<rect x="2" y="2" width="44" height="4" rx="2" fill="#ffe082"/>'),
    pressure2: mk(48, 12,
      '<rect x="0" y="4" width="48" height="8" rx="2" fill="#ef5350"/>' +
      '<rect x="2" y="2" width="44" height="4" rx="2" fill="#ffcdd2"/>'),
    gate: mk(64, 84,
      '<rect x="0" y="0" width="64" height="16" fill="#1b5e20"/>' +
      '<rect x="0" y="0" width="10" height="84" fill="#1b5e20"/>' +
      '<rect x="54" y="0" width="10" height="84" fill="#1b5e20"/>' +
      '<rect x="10" y="18" width="44" height="64" fill="#2e7d32"/>' +
      '<polygon points="28,44 40,50 28,56" fill="#fdd835"/>'),
    forestDoor: mk(64, 84,
      '<rect x="0" y="0" width="64" height="84" rx="4" fill="#4e342e"/>' +
      '<rect x="5" y="5" width="54" height="74" rx="3" fill="#795548"/>' +
      '<rect x="12" y="18" width="40" height="56" rx="2" fill="#263238"/>'),
    houseDoor: mk(64, 84,
      '<rect x="0" y="0" width="64" height="84" rx="4" fill="#3e2d23"/>' +
      '<rect x="5" y="5" width="54" height="74" rx="3" fill="#5d4037"/>' +
      '<rect x="12" y="20" width="40" height="50" rx="2" fill="#1f1a17"/>' +
      '<circle cx="33" cy="45" r="4" fill="#fbc02d"/>'),
    tileGround: mk(32, 32,
      '<rect width="32" height="32" fill="#6c4a2e"/>' +
      '<rect y="0" width="32" height="7" fill="#3f7d47"/>' +
      '<rect y="30" width="32" height="2" fill="#4a2d19"/>'),
    tilePlatform: mk(32, 32,
      '<rect width="32" height="32" fill="#7a5230"/>' +
      '<rect y="0" width="32" height="3" fill="#8b6340"/>' +
      '<rect y="6" width="32" height="2" fill="#8b6340"/>' +
      '<rect y="29" width="32" height="3" fill="#6b4423"/>')
  };
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function makeArrayLevel(cols) {
  return Array.from({ length: ROWS }, () => new Array(cols).fill(0));
}

function fillRect(tiles, r1, c1, r2, c2) {
  const cols = tiles[0].length;
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      if (r >= 0 && r < ROWS && c >= 0 && c < cols) tiles[r][c] = 1;
    }
  }
}

function defaultEditorLevel() {
  const cols = 90;
  const tiles = makeArrayLevel(cols);
  fillRect(tiles, 11, 0, 13, cols - 1);
  return {
    key: 'custom',
    name: 'Custom Level',
    objective: 'Erreiche das Ziel.',
    theme: 'garden',
    cols,
    lockGoal: false,
    spawn: { row: 8, col: 2 },
    goal: { row: 10, col: cols - 6, w: 64, h: 80, label: 'Ziel' },
    tiles,
    coins: [],
    foods: [],
    rescueTokens: [],
    spikes: [],
    nets: [],
    pressures: [],
    beetles: [],
    ravens: [],
    minions: []
  };
}

function normalizeLevel(raw) {
  const base = defaultEditorLevel();
  if (!raw || typeof raw !== 'object') return base;

  base.name = typeof raw.name === 'string' && raw.name ? raw.name : base.name;
  base.objective = typeof raw.objective === 'string' && raw.objective ? raw.objective : base.objective;
  base.theme = ['garden', 'forest', 'hunting'].includes(raw.theme) ? raw.theme : base.theme;
  base.cols = Number.isInteger(raw.cols) ? clamp(raw.cols, 30, 250) : base.cols;
  base.lockGoal = !!raw.lockGoal;
  base.tiles = makeArrayLevel(base.cols);

  if (Array.isArray(raw.tiles) && raw.tiles.length === ROWS) {
    for (let r = 0; r < ROWS; r++) {
      if (!Array.isArray(raw.tiles[r])) continue;
      for (let c = 0; c < Math.min(base.cols, raw.tiles[r].length); c++) {
        base.tiles[r][c] = raw.tiles[r][c] ? 1 : 0;
      }
    }
  }

  const pairList = (arr) => {
    if (!Array.isArray(arr)) return [];
    const out = [];
    for (const it of arr) {
      if (!Array.isArray(it) || it.length < 2) continue;
      out.push([clamp(Math.floor(it[0]), 0, ROWS - 1), clamp(Math.floor(it[1]), 0, base.cols - 1)]);
    }
    return out;
  };

  base.coins = pairList(raw.coins);
  base.foods = pairList(raw.foods);
  base.rescueTokens = pairList(raw.rescueTokens);
  base.spikes = pairList(raw.spikes);
  base.nets = pairList(raw.nets);

  base.pressures = Array.isArray(raw.pressures)
    ? raw.pressures.map((v) => clamp(Math.floor(v), 0, base.cols - 1))
      .filter((v, i, a) => a.indexOf(v) === i)
    : [];

  base.beetles = Array.isArray(raw.beetles)
    ? raw.beetles.filter((v) => Array.isArray(v) && v.length >= 3).map((v) => {
      const row = clamp(Math.floor(v[0]), 0, ROWS - 1);
      const left = clamp(Math.floor(v[1]), 0, base.cols - 1);
      const right = clamp(Math.floor(v[2]), left, base.cols - 1);
      const speed = typeof v[3] === 'number' ? clamp(v[3], 20, 240) : 70;
      return [row, left, right, speed];
    }) : [];

  base.ravens = Array.isArray(raw.ravens)
    ? raw.ravens.filter((v) => Array.isArray(v) && v.length >= 3).map((v) => {
      const row = clamp(Math.floor(v[0]), 0, ROWS - 1);
      const left = clamp(Math.floor(v[1]), 0, base.cols - 1);
      const right = clamp(Math.floor(v[2]), left, base.cols - 1);
      const speed = typeof v[3] === 'number' ? clamp(v[3], 20, 260) : 80;
      const amp = typeof v[4] === 'number' ? clamp(v[4], 4, 36) : 14;
      return [row, left, right, speed, amp];
    }) : [];

  base.minions = Array.isArray(raw.minions)
    ? raw.minions.filter((v) => Array.isArray(v) && v.length >= 2).map((v) => {
      const row = clamp(Math.floor(v[0]), 0, ROWS - 1);
      const col = clamp(Math.floor(v[1]), 0, base.cols - 1);
      const patrol = typeof v[2] === 'number' ? clamp(Math.floor(v[2]), 1, 8) : 2;
      const shootCd = typeof v[3] === 'number' ? clamp(v[3], 0.4, 6) : 2;
      const hp = typeof v[4] === 'number' ? clamp(Math.floor(v[4]), 1, 8) : 2;
      const projSpeed = typeof v[5] === 'number' ? clamp(v[5], 100, 420) : 200;
      return [row, col, patrol, shootCd, hp, projSpeed];
    }) : [];

  base.spawn = {
    row: raw.spawn && Number.isFinite(raw.spawn.row) ? clamp(Math.floor(raw.spawn.row), 0, ROWS - 1) : base.spawn.row,
    col: raw.spawn && Number.isFinite(raw.spawn.col) ? clamp(Math.floor(raw.spawn.col), 0, base.cols - 1) : base.spawn.col
  };

  base.goal = {
    row: raw.goal && Number.isFinite(raw.goal.row) ? clamp(Math.floor(raw.goal.row), 0, ROWS - 1) : base.goal.row,
    col: raw.goal && Number.isFinite(raw.goal.col) ? clamp(Math.floor(raw.goal.col), 0, base.cols - 1) : base.goal.col,
    w: raw.goal && Number.isFinite(raw.goal.w) ? clamp(Math.floor(raw.goal.w), 32, 160) : base.goal.w,
    h: raw.goal && Number.isFinite(raw.goal.h) ? clamp(Math.floor(raw.goal.h), 48, 160) : base.goal.h,
    label: raw.goal && typeof raw.goal.label === 'string' && raw.goal.label ? raw.goal.label : base.goal.label
  };

  return base;
}

function defaultCampaignLevels() {
  const l1 = defaultEditorLevel();
  l1.key = 'garten';
  l1.name = 'Level 1 - Der Garten';
  l1.objective = 'Sammle Nahrung und erreiche das Tor.';
  l1.cols = 60;
  l1.tiles = makeArrayLevel(l1.cols);
  fillRect(l1.tiles, 11, 0, 13, 21);
  fillRect(l1.tiles, 11, 31, 13, 59);
  fillRect(l1.tiles, 8, 5, 8, 11);
  fillRect(l1.tiles, 7, 14, 7, 19);
  fillRect(l1.tiles, 7, 22, 7, 29);
  fillRect(l1.tiles, 7, 37, 7, 43);
  fillRect(l1.tiles, 6, 50, 6, 56);
  l1.spawn = { row: 8, col: 2 };
  l1.goal = { row: 10, col: 57, w: 64, h: 76, label: 'Tor' };
  l1.coins = [[10, 3], [10, 8], [10, 16], [7, 6], [7, 9], [6, 23], [6, 26], [6, 29], [10, 33], [10, 44], [6, 38], [6, 42], [5, 51], [5, 55], [10, 57]];
  l1.foods = [[10, 11], [10, 20], [10, 40], [10, 56]];

  const l2 = defaultEditorLevel();
  l2.key = 'wald';
  l2.name = 'Level 2 - Der Wald';
  l2.theme = 'forest';
  l2.objective = 'Ueberlebe Kaefer, Spikes und Netze.';
  l2.cols = 80;
  l2.tiles = makeArrayLevel(l2.cols);
  fillRect(l2.tiles, 11, 0, 13, 14);
  fillRect(l2.tiles, 11, 19, 13, 36);
  fillRect(l2.tiles, 11, 42, 13, 57);
  fillRect(l2.tiles, 11, 63, 13, 79);
  fillRect(l2.tiles, 8, 3, 8, 7);
  fillRect(l2.tiles, 7, 8, 7, 13);
  fillRect(l2.tiles, 9, 15, 9, 18);
  fillRect(l2.tiles, 6, 22, 6, 27);
  fillRect(l2.tiles, 9, 28, 9, 33);
  fillRect(l2.tiles, 8, 37, 8, 41);
  fillRect(l2.tiles, 7, 45, 7, 50);
  fillRect(l2.tiles, 5, 52, 5, 57);
  fillRect(l2.tiles, 8, 58, 8, 62);
  fillRect(l2.tiles, 7, 66, 7, 70);
  fillRect(l2.tiles, 6, 73, 6, 78);
  l2.spawn = { row: 8, col: 2 };
  l2.goal = { row: 10, col: 76, w: 62, h: 70, label: 'Ausgang' };
  l2.coins = [[10, 3], [10, 7], [10, 12], [7, 4], [7, 6], [6, 10], [6, 12], [8, 16], [8, 17], [10, 22], [10, 30], [5, 23], [5, 26], [8, 29], [8, 32], [7, 38], [7, 40], [10, 48], [10, 54], [10, 68], [10, 75]];
  l2.foods = [[10, 8], [8, 16], [10, 32], [8, 60], [10, 72]];
  l2.spikes = [[10, 14], [10, 15], [10, 16], [10, 28], [10, 33], [10, 43], [10, 46], [10, 50], [10, 52]];
  l2.nets = [[9, 13], [8, 30], [7, 44]];
  l2.beetles = [[10, 19, 26, 62], [8, 23, 25, 72], [10, 42, 57, 78], [6, 66, 70, 66]];

  const l3 = defaultEditorLevel();
  l3.key = 'jagdhaus';
  l3.name = 'Level 3 - Das Jagdhaus';
  l3.theme = 'hunting';
  l3.lockGoal = true;
  l3.objective = 'Federn sammeln, Waechter besiegen, Jagdhaus oeffnen.';
  l3.cols = 100;
  l3.tiles = makeArrayLevel(l3.cols);
  fillRect(l3.tiles, 11, 0, 13, 8);
  fillRect(l3.tiles, 11, 15, 13, 24);
  fillRect(l3.tiles, 11, 30, 13, 40);
  fillRect(l3.tiles, 11, 47, 13, 57);
  fillRect(l3.tiles, 11, 63, 13, 99);
  fillRect(l3.tiles, 9, 10, 9, 13);
  fillRect(l3.tiles, 9, 26, 9, 28);
  fillRect(l3.tiles, 9, 42, 9, 45);
  fillRect(l3.tiles, 9, 59, 9, 61);
  fillRect(l3.tiles, 7, 4, 7, 7);
  fillRect(l3.tiles, 7, 17, 7, 20);
  fillRect(l3.tiles, 7, 32, 7, 35);
  fillRect(l3.tiles, 7, 48, 7, 52);
  fillRect(l3.tiles, 7, 65, 7, 69);
  fillRect(l3.tiles, 7, 78, 7, 81);
  fillRect(l3.tiles, 7, 88, 7, 91);
  fillRect(l3.tiles, 5, 2, 5, 4);
  fillRect(l3.tiles, 5, 12, 5, 15);
  fillRect(l3.tiles, 5, 22, 5, 26);
  fillRect(l3.tiles, 5, 37, 5, 40);
  fillRect(l3.tiles, 5, 53, 5, 57);
  fillRect(l3.tiles, 5, 70, 5, 74);
  fillRect(l3.tiles, 5, 83, 5, 87);
  fillRect(l3.tiles, 5, 92, 5, 96);
  l3.spawn = { row: 8, col: 2 };
  l3.goal = { row: 10, col: 95, w: 64, h: 84, label: 'Jagdhaus' };
  l3.coins = [[10, 3], [10, 6], [8, 11], [8, 12], [10, 17], [10, 21], [6, 5], [6, 18], [8, 27], [10, 32], [10, 37], [4, 13], [4, 23], [8, 43], [8, 44], [10, 50], [10, 55], [6, 33], [6, 49], [8, 60], [10, 66], [10, 73], [10, 79], [10, 86], [4, 38], [4, 71], [4, 84], [4, 94]];
  l3.foods = [[10, 7], [8, 27], [10, 54], [10, 68], [10, 90]];
  l3.rescueTokens = [[6, 20], [6, 48], [6, 69], [4, 92]];
  l3.spikes = [[10, 24], [10, 40], [10, 76]];
  l3.nets = [[8, 42], [8, 61]];
  l3.pressures = [24, 48, 74];
  l3.ravens = [[7, 3, 10, 82, 12], [5, 16, 24, -78, 12], [6, 33, 43, 90, 14], [5, 68, 82, 84, 14]];
  l3.minions = [[10, 35, 1, 2.4, 2, 200], [10, 58, 2, 2.15, 2, 220], [10, 84, 2, 2.0, 2, 240]];

  return [l1, l2, l3];
}

class BudgiePhaserScene extends Phaser.Scene {
  constructor() {
    super('BudgiePhaserScene');

    this.mode = MODE_MENU;
    this.levels = defaultCampaignLevels();
    this.levelIndex = 0;
    this.customLevel = defaultEditorLevel();
    this.currentLevel = null;
    this.cameraX = 0;

    this.score = 0;
    this.bestScore = 0;
    this.food = 100;
    this.lives = 3;

    this.player = null;
    this.coins = [];
    this.foods = [];
    this.rescues = [];
    this.traps = [];
    this.enemies = [];
    this.projectiles = [];

    this.tileRT = null;
    this.hud = null;
    this.overlay = null;

    this.editor = {
      toolIndex: 0,
      tools: [
        'tile', 'erase', 'coin', 'food', 'rescue',
        'beetle', 'raven', 'minion', 'spike', 'net', 'pressure',
        'spawn', 'goal'
      ],
      cursorRow: 8,
      cursorCol: 2,
      cameraX: 0,
      pendingRange: null,
      message: '',
      messageTimer: 0,
      activeLevel: defaultEditorLevel(),
      selected: null
    };
  }

  preload() {
    const svgs = makeSvgLibrary();
    for (const [key, svg] of Object.entries(svgs)) {
      this.load.image(key, toDataUri(svg));
    }
  }

  create() {
    this.createAnimations();

    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
      r: Phaser.Input.Keyboard.KeyCodes.R,
      e: Phaser.Input.Keyboard.KeyCodes.E,
      esc: Phaser.Input.Keyboard.KeyCodes.ESC,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      l: Phaser.Input.Keyboard.KeyCodes.L,
      x: Phaser.Input.Keyboard.KeyCodes.X,
      i: Phaser.Input.Keyboard.KeyCodes.I,
      t: Phaser.Input.Keyboard.KeyCodes.T,
      k: Phaser.Input.Keyboard.KeyCodes.K,
      n: Phaser.Input.Keyboard.KeyCodes.N,
      o: Phaser.Input.Keyboard.KeyCodes.O,
      c: Phaser.Input.Keyboard.KeyCodes.C,
      g: Phaser.Input.Keyboard.KeyCodes.G,
      j: Phaser.Input.Keyboard.KeyCodes.J,
      bracketLeft: Phaser.Input.Keyboard.KeyCodes.OPEN_BRACKET,
      bracketRight: Phaser.Input.Keyboard.KeyCodes.CLOSED_BRACKET,
      one: Phaser.Input.Keyboard.KeyCodes.ONE,
      two: Phaser.Input.Keyboard.KeyCodes.TWO,
      three: Phaser.Input.Keyboard.KeyCodes.THREE,
      four: Phaser.Input.Keyboard.KeyCodes.FOUR,
      five: Phaser.Input.Keyboard.KeyCodes.FIVE,
      six: Phaser.Input.Keyboard.KeyCodes.SIX,
      seven: Phaser.Input.Keyboard.KeyCodes.SEVEN,
      eight: Phaser.Input.Keyboard.KeyCodes.EIGHT,
      nine: Phaser.Input.Keyboard.KeyCodes.NINE,
      zero: Phaser.Input.Keyboard.KeyCodes.ZERO,
      del: Phaser.Input.Keyboard.KeyCodes.DELETE,
      back: Phaser.Input.Keyboard.KeyCodes.BACKSPACE
    });

    this.hud = this.add.text(10, 8, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
      lineSpacing: 6,
      backgroundColor: 'rgba(0,0,0,0.55)',
      padding: { x: 8, y: 6 }
    }).setDepth(50).setScrollFactor(0);

    this.overlay = this.add.text(W / 2, H / 2, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#fff59d',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(60).setScrollFactor(0);

    this.input.mouse.disableContextMenu();

    this.input.on('pointerdown', (pointer) => {
      if (this.mode !== MODE_EDITOR) return;
      const worldX = this.editor.cameraX + pointer.x;
      const col = clamp(Math.floor(worldX / TILE), 0, this.editor.activeLevel.cols - 1);
      const row = clamp(Math.floor(pointer.y / TILE), 0, ROWS - 1);
      if (pointer.rightButtonDown()) {
        this.editorEraseAt(row, col);
      } else {
        this.editorApplyTool(row, col);
      }
    });

    this.showMenu();
  }

  createAnimations() {
    const create2 = (key, a, b, fps = 4) => {
      this.anims.create({
        key,
        frames: [{ key: a }, { key: b }],
        frameRate: fps,
        repeat: -1
      });
    };
    create2('anim_player', 'player0', 'player1', 6);
    create2('anim_coin', 'coin0', 'coin1', 5);
    create2('anim_food', 'food0', 'food1', 4);
    create2('anim_rescue', 'rescue0', 'rescue1', 4);
    create2('anim_beetle', 'beetle0', 'beetle1', 5);
    create2('anim_raven', 'raven0', 'raven1', 8);
    create2('anim_minion', 'minion0', 'minion1', 3);
    create2('anim_projectile', 'projectile0', 'projectile1', 9);
    create2('anim_spike', 'spike0', 'spike1', 2);
    create2('anim_net', 'net0', 'net1', 2);
    this.anims.create({
      key: 'anim_pressure',
      frames: [{ key: 'pressure0' }, { key: 'pressure1' }, { key: 'pressure2' }],
      frameRate: 6,
      repeat: -1
    });
  }

  showMenu() {
    this.mode = MODE_MENU;
    this.clearWorld();
    this.overlay.setText([
      'BUDGIE PLATFORMER',
      '',
      'ENTER: Kampagne starten',
      'E: Level Editor oeffnen',
      '',
      'Editor: eigene Level bauen,',
      'alles per JSON einstellbar'
    ]);
    this.updateHudText();
  }

  startCampaign() {
    this.score = 0;
    this.food = 100;
    this.lives = 3;
    this.levelIndex = 0;
    this.loadLevel(this.levels[this.levelIndex], false);
  }

  loadLevel(levelData, fromEditor) {
    this.clearWorld();
    this.mode = MODE_PLAY;
    this.overlay.setText('');

    this.currentLevel = normalizeLevel(levelData);
    this.currentLevel.key = levelData.key || this.currentLevel.key;

    if (!fromEditor) {
      this.food = 100;
    }

    this.buildTileCache(this.currentLevel);

    this.coins = this.currentLevel.coins.map(([r, c]) => this.spawnCollectible('anim_coin', r, c, 'coin'));
    this.foods = this.currentLevel.foods.map(([r, c]) => this.spawnCollectible('anim_food', r, c, 'food'));
    this.rescues = this.currentLevel.rescueTokens.map(([r, c]) => this.spawnCollectible('anim_rescue', r, c, 'rescue'));

    this.traps = [];
    for (const [r, c] of this.currentLevel.spikes) this.traps.push(this.spawnTrap('spike', r, c));
    for (const [r, c] of this.currentLevel.nets) this.traps.push(this.spawnTrap('net', r, c));
    for (const col of this.currentLevel.pressures) this.traps.push(this.spawnTrap('pressure', 10, col));

    this.enemies = [];
    for (const [row, left, right, speed] of this.currentLevel.beetles) this.enemies.push(this.spawnEnemy('beetle', row, left, right, speed));
    for (const [row, left, right, speed, amp] of this.currentLevel.ravens) this.enemies.push(this.spawnEnemy('raven', row, left, right, speed, amp));
    for (const [row, col, patrol, shootCd, hp, projSpeed] of this.currentLevel.minions) this.enemies.push(this.spawnEnemy('minion', row, col - patrol, col + patrol, 56, 0, shootCd, hp, projSpeed));

    this.goalSprite = this.add.sprite(0, 0, this.goalTextureForLevel()).setOrigin(0, 0).setDepth(20);

    this.player = {
      x: this.currentLevel.spawn.col * TILE,
      y: this.currentLevel.spawn.row * TILE,
      w: 22,
      h: 26,
      vx: 0,
      vy: 0,
      onGround: false,
      face: 1,
      invuln: 0,
      coyote: 0,
      jumpBuffer: 0,
      netSlow: 0,
      trapped: 0,
      sprite: this.add.sprite(0, 0, 'player0').setOrigin(0, 0).setDepth(35)
    };
    this.player.sprite.play('anim_player');

    this.cameraX = 0;
    this.updateGoalSprite();
    this.updateHudText();
  }

  goalTextureForLevel() {
    if (this.currentLevel.theme === 'forest') return 'forestDoor';
    if (this.currentLevel.theme === 'hunting') return 'houseDoor';
    return 'gate';
  }

  spawnCollectible(animKey, row, col, kind) {
    const x = col * TILE + TILE / 2;
    const y = row * TILE + TILE / 2;
    const s = this.add.sprite(x, y, animKey.includes('coin') ? 'coin0' : animKey.includes('food') ? 'food0' : 'rescue0').setDepth(24);
    s.play(animKey);
    return { kind, row, col, x, y, collected: false, sprite: s };
  }

  spawnTrap(type, row, col) {
    let sprite = null;
    let w = TILE;
    let h = 16;
    let y = row * TILE;

    if (type === 'spike') {
      y = row * TILE + (TILE - h);
      sprite = this.add.sprite(col * TILE, y, 'spike0').setOrigin(0, 0).setDepth(22).play('anim_spike');
      w = TILE;
      h = 16;
    } else if (type === 'net') {
      w = 40;
      h = 40;
      sprite = this.add.sprite(col * TILE - 16, y, 'net0').setOrigin(0, 0).setDepth(22).play('anim_net');
    } else {
      w = 48;
      h = 12;
      y = 11 * TILE - 8;
      sprite = this.add.sprite(col * TILE + 8, y, 'pressure0').setOrigin(0, 0).setDepth(22).play('anim_pressure');
    }

    return {
      type,
      row,
      col,
      x: sprite.x,
      y: sprite.y,
      w,
      h,
      sprite,
      active: true,
      timer: 0,
      state: 'idle'
    };
  }

  spawnEnemy(type, surfaceRow, leftCol, rightCol, speed, amp = 12, shootCd = 2, hp = 2, projSpeed = 200) {
    let w = 26;
    let h = 20;
    let key = 'beetle0';
    if (type === 'raven') {
      w = 30;
      h = 22;
      key = 'raven0';
    }
    if (type === 'minion') {
      w = 28;
      h = 40;
      key = 'minion0';
    }

    const x = leftCol * TILE;
    const y = (surfaceRow + 1) * TILE - h;
    const sprite = this.add.sprite(x, y, key).setOrigin(0, 0).setDepth(30);
    if (type === 'beetle') sprite.play('anim_beetle');
    if (type === 'raven') sprite.play('anim_raven');
    if (type === 'minion') sprite.play('anim_minion');

    return {
      type,
      x,
      y,
      w,
      h,
      vx: speed,
      left: leftCol * TILE,
      right: (rightCol + 1) * TILE - w,
      amp,
      phase: Math.random() * Math.PI * 2,
      shootCd,
      shootTimer: shootCd,
      projSpeed,
      hp,
      alive: true,
      sprite
    };
  }

  buildTileCache(level) {
    if (this.tileRT) this.tileRT.destroy();
    this.tileRT = this.add.renderTexture(0, 0, level.cols * TILE, H).setOrigin(0, 0).setDepth(5);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < level.cols; c++) {
        if (level.tiles[r][c] !== 1) continue;
        const key = r >= 11 ? 'tileGround' : 'tilePlatform';
        this.tileRT.draw(key, c * TILE, r * TILE);
      }
    }
  }

  clearWorld() {
    if (this.tileRT) {
      this.tileRT.destroy();
      this.tileRT = null;
    }

    const destroyList = [];
    if (this.player && this.player.sprite) destroyList.push(this.player.sprite);
    for (const c of this.coins) if (c.sprite) destroyList.push(c.sprite);
    for (const f of this.foods) if (f.sprite) destroyList.push(f.sprite);
    for (const r of this.rescues) if (r.sprite) destroyList.push(r.sprite);
    for (const t of this.traps) if (t.sprite) destroyList.push(t.sprite);
    for (const e of this.enemies) if (e.sprite) destroyList.push(e.sprite);
    for (const p of this.projectiles) if (p.sprite) destroyList.push(p.sprite);
    if (this.goalSprite) destroyList.push(this.goalSprite);

    for (const obj of destroyList) obj.destroy();

    this.player = null;
    this.goalSprite = null;
    this.coins = [];
    this.foods = [];
    this.rescues = [];
    this.traps = [];
    this.enemies = [];
    this.projectiles = [];
  }

  enterEditor() {
    this.mode = MODE_EDITOR;
    this.clearWorld();
    this.overlay.setText('');
    this.editor.activeLevel = normalizeLevel(this.editor.activeLevel || defaultEditorLevel());
    this.editor.pendingRange = null;
    this.editor.selected = null;
    this.editor.cameraX = 0;
    this.editor.message = 'Editor aktiv';
    this.editor.messageTimer = 1.2;
    this.buildTileCache(this.editor.activeLevel);
    this.updateHudText();
  }

  playCustomFromEditor() {
    this.customLevel = normalizeLevel(this.editor.activeLevel);
    this.score = 0;
    this.food = 100;
    this.lives = 3;
    this.loadLevel(this.customLevel, true);
  }

  saveEditorLocal() {
    try {
      localStorage.setItem(EDITOR_STORAGE_KEY, JSON.stringify(this.editor.activeLevel));
      this.editor.message = 'Editor gespeichert';
      this.editor.messageTimer = 1.2;
    } catch {
      this.editor.message = 'Speichern fehlgeschlagen';
      this.editor.messageTimer = 1.5;
    }
  }

  loadEditorLocal() {
    try {
      const txt = localStorage.getItem(EDITOR_STORAGE_KEY);
      if (!txt) {
        this.editor.message = 'Kein Save gefunden';
        this.editor.messageTimer = 1.5;
        return;
      }
      this.editor.activeLevel = normalizeLevel(JSON.parse(txt));
      this.buildTileCache(this.editor.activeLevel);
      this.editor.message = 'Editor geladen';
      this.editor.messageTimer = 1.2;
    } catch {
      this.editor.message = 'Laden fehlgeschlagen';
      this.editor.messageTimer = 1.5;
    }
  }

  exportEditorJson() {
    window.prompt('Custom-Level JSON (kopieren):', JSON.stringify(this.editor.activeLevel, null, 2));
  }

  importEditorJson() {
    const txt = window.prompt('Custom-Level JSON einfuegen:');
    if (!txt) return;
    try {
      this.editor.activeLevel = normalizeLevel(JSON.parse(txt));
      this.buildTileCache(this.editor.activeLevel);
      this.editor.message = 'Import OK';
      this.editor.messageTimer = 1.2;
    } catch {
      this.editor.message = 'Ungueltiges JSON';
      this.editor.messageTimer = 1.6;
    }
  }

  editorToolName() {
    return this.editor.tools[this.editor.toolIndex];
  }

  editorPickAt(row, col) {
    const lvl = this.editor.activeLevel;

    const findIn = (arr) => arr.find((v) => v[0] === row && v[1] === col);

    if (findIn(lvl.coins)) return { type: 'coins', row, col };
    if (findIn(lvl.foods)) return { type: 'foods', row, col };
    if (findIn(lvl.rescueTokens)) return { type: 'rescueTokens', row, col };
    if (findIn(lvl.spikes)) return { type: 'spikes', row, col };
    if (findIn(lvl.nets)) return { type: 'nets', row, col };

    const pressure = lvl.pressures.find((v) => v === col);
    if (typeof pressure === 'number') return { type: 'pressures', col };

    const beetle = lvl.beetles.find((v) => v[0] === row && col >= v[1] && col <= v[2]);
    if (beetle) return { type: 'beetles', ref: beetle };

    const raven = lvl.ravens.find((v) => v[0] === row && col >= v[1] && col <= v[2]);
    if (raven) return { type: 'ravens', ref: raven };

    const minion = lvl.minions.find((v) => v[0] === row && v[1] === col);
    if (minion) return { type: 'minions', ref: minion };

    if (lvl.spawn.row === row && lvl.spawn.col === col) return { type: 'spawn' };
    if (lvl.goal.row === row && lvl.goal.col === col) return { type: 'goal' };

    return null;
  }

  editorEraseAt(row, col) {
    const lvl = this.editor.activeLevel;
    lvl.tiles[row][col] = 0;

    const drop = (arr) => {
      const idx = arr.findIndex((v) => v[0] === row && v[1] === col);
      if (idx >= 0) arr.splice(idx, 1);
    };

    drop(lvl.coins);
    drop(lvl.foods);
    drop(lvl.rescueTokens);
    drop(lvl.spikes);
    drop(lvl.nets);

    lvl.pressures = lvl.pressures.filter((v) => v !== col);
    lvl.minions = lvl.minions.filter((v) => !(v[0] === row && v[1] === col));
    lvl.beetles = lvl.beetles.filter((v) => !(v[0] === row && col >= v[1] && col <= v[2]));
    lvl.ravens = lvl.ravens.filter((v) => !(v[0] === row && col >= v[1] && col <= v[2]));

    if (lvl.spawn.row === row && lvl.spawn.col === col) {
      lvl.spawn = { row: 8, col: 2 };
    }
    if (lvl.goal.row === row && lvl.goal.col === col) {
      lvl.goal.row = 10;
      lvl.goal.col = clamp(lvl.cols - 6, 0, lvl.cols - 1);
    }

    this.buildTileCache(lvl);
  }

  editorTogglePair(listName, row, col) {
    const arr = this.editor.activeLevel[listName];
    const idx = arr.findIndex((v) => v[0] === row && v[1] === col);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push([row, col]);
  }

  editorApplyTool(row, col) {
    const lvl = this.editor.activeLevel;
    const tool = this.editorToolName();

    if (tool === 'tile') {
      lvl.tiles[row][col] = lvl.tiles[row][col] ? 0 : 1;
      this.buildTileCache(lvl);
      return;
    }
    if (tool === 'erase') {
      this.editorEraseAt(row, col);
      return;
    }

    if (tool === 'coin') return this.editorTogglePair('coins', row, col);
    if (tool === 'food') return this.editorTogglePair('foods', row, col);
    if (tool === 'rescue') return this.editorTogglePair('rescueTokens', row, col);
    if (tool === 'spike') return this.editorTogglePair('spikes', row, col);
    if (tool === 'net') return this.editorTogglePair('nets', row, col);

    if (tool === 'pressure') {
      const idx = lvl.pressures.indexOf(col);
      if (idx >= 0) lvl.pressures.splice(idx, 1);
      else lvl.pressures.push(col);
      return;
    }

    if (tool === 'spawn') {
      lvl.spawn = { row, col };
      return;
    }

    if (tool === 'goal') {
      lvl.goal.row = row;
      lvl.goal.col = col;
      return;
    }

    if (tool === 'minion') {
      const idx = lvl.minions.findIndex((v) => v[0] === row && v[1] === col);
      if (idx >= 0) lvl.minions.splice(idx, 1);
      else lvl.minions.push([row, col, 2, 2.0, 2, 220]);
      return;
    }

    if (tool === 'beetle' || tool === 'raven') {
      if (!this.editor.pendingRange) {
        this.editor.pendingRange = { row, col };
        this.editor.message = 'Patrouille-Ende setzen';
        this.editor.messageTimer = 1.2;
        return;
      }
      const s = this.editor.pendingRange;
      const left = Math.min(s.col, col);
      const right = Math.max(s.col, col);
      if (tool === 'beetle') lvl.beetles.push([s.row, left, right, 72]);
      else lvl.ravens.push([s.row, left, right, 86, 14]);
      this.editor.pendingRange = null;
    }
  }

  handleEditorKeys() {
    const k = this.keys;
    const ed = this.editor;
    const lvl = ed.activeLevel;

    if (Phaser.Input.Keyboard.JustDown(k.esc)) {
      this.showMenu();
      return;
    }
    if (Phaser.Input.Keyboard.JustDown(k.enter)) {
      this.playCustomFromEditor();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(k.s)) this.saveEditorLocal();
    if (Phaser.Input.Keyboard.JustDown(k.l)) this.loadEditorLocal();
    if (Phaser.Input.Keyboard.JustDown(k.x)) this.exportEditorJson();
    if (Phaser.Input.Keyboard.JustDown(k.i)) this.importEditorJson();

    if (Phaser.Input.Keyboard.JustDown(k.t)) {
      const themes = ['garden', 'forest', 'hunting'];
      const idx = themes.indexOf(lvl.theme);
      lvl.theme = themes[(idx + 1) % themes.length];
    }

    if (Phaser.Input.Keyboard.JustDown(k.k)) lvl.lockGoal = !lvl.lockGoal;

    if (Phaser.Input.Keyboard.JustDown(k.n)) {
      const val = window.prompt('Levelname:', lvl.name);
      if (val) lvl.name = val;
    }
    if (Phaser.Input.Keyboard.JustDown(k.o)) {
      const val = window.prompt('Objective:', lvl.objective);
      if (val) lvl.objective = val;
    }
    if (Phaser.Input.Keyboard.JustDown(k.c)) {
      const val = window.prompt('Spalten (30-250):', String(lvl.cols));
      if (val) {
        const next = clamp(Math.floor(Number(val)), 30, 250);
        const resized = normalizeLevel({ ...lvl, cols: next });
        this.editor.activeLevel = resized;
        this.buildTileCache(resized);
      }
    }
    if (Phaser.Input.Keyboard.JustDown(k.g)) {
      const label = window.prompt('Goal Label:', lvl.goal.label);
      const w = window.prompt('Goal Breite 32-160:', String(lvl.goal.w));
      const h = window.prompt('Goal Hoehe 48-160:', String(lvl.goal.h));
      if (label) lvl.goal.label = label;
      if (w) lvl.goal.w = clamp(Math.floor(Number(w)), 32, 160);
      if (h) lvl.goal.h = clamp(Math.floor(Number(h)), 48, 160);
    }

    if (Phaser.Input.Keyboard.JustDown(k.j)) {
      const picked = this.editorPickAt(ed.cursorRow, ed.cursorCol);
      if (picked && picked.ref) {
        const idx = lvl[picked.type].indexOf(picked.ref);
        const txt = window.prompt('Objekt-JSON editieren:', JSON.stringify(picked.ref));
        if (txt) {
          try {
            const parsed = JSON.parse(txt);
            if (Array.isArray(parsed)) lvl[picked.type][idx] = parsed;
          } catch {
            this.editor.message = 'Objekt-JSON ungueltig';
            this.editor.messageTimer = 1.4;
          }
        }
      } else {
        const txt = window.prompt('Level-JSON editieren:', JSON.stringify(lvl, null, 2));
        if (txt) {
          try {
            this.editor.activeLevel = normalizeLevel(JSON.parse(txt));
            this.buildTileCache(this.editor.activeLevel);
          } catch {
            this.editor.message = 'Level-JSON ungueltig';
            this.editor.messageTimer = 1.4;
          }
        }
      }
    }

    if (Phaser.Input.Keyboard.JustDown(k.bracketLeft)) {
      ed.toolIndex = (ed.toolIndex - 1 + ed.tools.length) % ed.tools.length;
      ed.pendingRange = null;
    }
    if (Phaser.Input.Keyboard.JustDown(k.bracketRight)) {
      ed.toolIndex = (ed.toolIndex + 1) % ed.tools.length;
      ed.pendingRange = null;
    }

    const digits = [k.one, k.two, k.three, k.four, k.five, k.six, k.seven, k.eight, k.nine, k.zero];
    for (let i = 0; i < digits.length; i++) {
      if (Phaser.Input.Keyboard.JustDown(digits[i])) ed.toolIndex = clamp(i, 0, ed.tools.length - 1);
    }

    if (k.left.isDown) ed.cursorCol = clamp(ed.cursorCol - 1, 0, lvl.cols - 1);
    if (k.right.isDown) ed.cursorCol = clamp(ed.cursorCol + 1, 0, lvl.cols - 1);
    if (k.up.isDown) ed.cursorRow = clamp(ed.cursorRow - 1, 0, ROWS - 1);
    if (k.down.isDown) ed.cursorRow = clamp(ed.cursorRow + 1, 0, ROWS - 1);

    if (Phaser.Input.Keyboard.JustDown(k.space)) this.editorApplyTool(ed.cursorRow, ed.cursorCol);
    if (Phaser.Input.Keyboard.JustDown(k.del) || Phaser.Input.Keyboard.JustDown(k.back)) this.editorEraseAt(ed.cursorRow, ed.cursorCol);

    ed.cameraX = clamp(ed.cursorCol * TILE - W / 2, 0, lvl.cols * TILE - W);
  }

  isSolid(row, col) {
    if (!this.currentLevel) return false;
    if (row < 0 || row >= ROWS || col < 0 || col >= this.currentLevel.cols) return false;
    return this.currentLevel.tiles[row][col] === 1;
  }

  resolvePlayerCollisionX() {
    const p = this.player;
    if (!p || p.vx === 0) return;

    const r1 = clamp(Math.floor(p.y / TILE), 0, ROWS - 1);
    const r2 = clamp(Math.floor((p.y + p.h - 1) / TILE), 0, ROWS - 1);
    const c1 = Math.floor(p.x / TILE);
    const c2 = Math.floor((p.x + p.w - 1) / TILE);

    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        if (!this.isSolid(r, c)) continue;
        const tx = c * TILE;
        if (p.vx > 0) p.x = tx - p.w;
        else p.x = tx + TILE;
        p.vx = 0;
      }
    }
  }

  resolvePlayerCollisionY() {
    const p = this.player;
    const c1 = clamp(Math.floor(p.x / TILE), 0, this.currentLevel.cols - 1);
    const c2 = clamp(Math.floor((p.x + p.w - 1) / TILE), 0, this.currentLevel.cols - 1);
    const r1 = Math.floor(p.y / TILE);
    const r2 = Math.floor((p.y + p.h) / TILE);

    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        if (!this.isSolid(r, c)) continue;
        const ty = r * TILE;
        if (p.vy >= 0) {
          p.y = ty - p.h;
          p.vy = 0;
          p.onGround = true;
        } else {
          p.y = ty + TILE;
          p.vy = 0;
        }
      }
    }
  }

  overlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  takeDamage(sourceX) {
    const p = this.player;
    if (!p || p.invuln > 0) return;

    this.lives -= 1;
    p.invuln = 1.0;
    p.vy = -280;
    p.vx = (p.x < sourceX ? -1 : 1) * 140;

    if (this.lives <= 0) {
      this.bestScore = Math.max(this.bestScore, this.score);
      this.mode = MODE_GAMEOVER;
      this.overlay.setText(['GAME OVER', '', 'R: Neustart', 'E: Editor']);
      return;
    }

    this.food = Math.max(0, this.food - 18);
    p.x = this.currentLevel.spawn.col * TILE;
    p.y = this.currentLevel.spawn.row * TILE;
    p.vx = 0;
    p.vy = 0;
    this.projectiles.forEach((p2) => p2.sprite.destroy());
    this.projectiles = [];

    for (const t of this.traps) {
      t.active = true;
      t.timer = 0;
      t.state = 'idle';
    }
  }

  updatePlay(dt) {
    const p = this.player;
    if (!p || !this.currentLevel) return;

    const left = this.keys.left.isDown || this.keys.a.isDown;
    const right = this.keys.right.isDown || this.keys.d.isDown;
    const jumpHeld = this.keys.up.isDown || this.keys.w.isDown || this.keys.space.isDown;

    if (Phaser.Input.Keyboard.JustDown(this.keys.space) || Phaser.Input.Keyboard.JustDown(this.keys.up) || Phaser.Input.Keyboard.JustDown(this.keys.w)) {
      p.jumpBuffer = 0.12;
    }

    if (p.invuln > 0) p.invuln -= dt;
    if (p.netSlow > 0) p.netSlow -= dt;
    if (p.jumpBuffer > 0) p.jumpBuffer -= dt;

    if (p.onGround) p.coyote = 0.11;
    else p.coyote -= dt;

    let speed = p.netSlow > 0 ? 120 : 210;
    const targetVx = left && !right ? -speed : right && !left ? speed : 0;
    const accel = p.onGround ? 1850 : 980;
    const friction = 1700;
    if (targetVx !== 0) {
      if (p.vx < targetVx) p.vx = Math.min(targetVx, p.vx + accel * dt);
      else p.vx = Math.max(targetVx, p.vx - accel * dt);
      p.face = targetVx < 0 ? -1 : 1;
    } else {
      if (p.vx > 0) p.vx = Math.max(0, p.vx - friction * dt);
      if (p.vx < 0) p.vx = Math.min(0, p.vx + friction * dt);
    }

    if (p.trapped > 0) {
      p.trapped -= dt;
      p.vx = 0;
    } else if (p.jumpBuffer > 0 && (p.onGround || p.coyote > 0)) {
      p.vy = -540;
      p.onGround = false;
      p.coyote = 0;
      p.jumpBuffer = 0;
    }

    const gravity = jumpHeld && !p.onGround ? 260 : 920;
    p.vy += gravity * dt;
    if (!jumpHeld && p.vy < 0) p.vy += 920 * 2.1 * dt;
    if (jumpHeld && p.vy > 90) p.vy = 90;
    if (p.vy > 660) p.vy = 660;

    p.x += p.vx * dt;
    p.x = clamp(p.x, 0, this.currentLevel.cols * TILE - p.w);
    this.resolvePlayerCollisionX();

    p.onGround = false;
    p.y += p.vy * dt;
    this.resolvePlayerCollisionY();

    if (p.y > H + 80) {
      this.takeDamage(p.x + p.w / 2);
    }

    this.food = Math.max(0, this.food - 5.5 * dt);
    if (this.food <= 0) {
      this.bestScore = Math.max(this.bestScore, this.score);
      this.mode = MODE_GAMEOVER;
      this.overlay.setText(['GAME OVER', '', 'R: Neustart', 'E: Editor']);
      return;
    }

    for (const c of this.coins) {
      if (c.collected) continue;
      if (this.overlap(p.x, p.y, p.w, p.h, c.x - 8, c.y - 8, 16, 16)) {
        c.collected = true;
        c.sprite.setVisible(false);
        this.score += 10;
      }
    }

    for (const f of this.foods) {
      if (f.collected) continue;
      if (this.overlap(p.x, p.y, p.w, p.h, f.x - 8, f.y - 8, 16, 16)) {
        f.collected = true;
        f.sprite.setVisible(false);
        this.food = clamp(this.food + 30, 0, 100);
      }
    }

    for (const r of this.rescues) {
      if (r.collected) continue;
      if (this.overlap(p.x, p.y, p.w, p.h, r.x - 8, r.y - 8, 16, 16)) {
        r.collected = true;
        r.sprite.setVisible(false);
        this.score += 25;
      }
    }

    for (const trap of this.traps) {
      if (trap.type === 'spike') {
        if (this.overlap(p.x, p.y, p.w, p.h, trap.x, trap.y, trap.w, trap.h)) {
          this.takeDamage(trap.x + trap.w / 2);
        }
      } else if (trap.type === 'net') {
        if (trap.active && this.overlap(p.x, p.y, p.w, p.h, trap.x, trap.y, trap.w, trap.h)) {
          trap.active = false;
          trap.sprite.setAlpha(0.3);
          p.trapped = 1.2;
          p.netSlow = 1.8;
        }
      } else if (trap.type === 'pressure') {
        const triggerY = trap.y - 20;
        if (trap.state === 'idle' && this.overlap(p.x, p.y, p.w, p.h, trap.x, triggerY, trap.w, 26)) {
          trap.state = 'warn';
          trap.timer = 0.34;
        } else if (trap.state === 'warn') {
          trap.timer -= dt;
          if (trap.timer <= 0) {
            trap.state = 'strike';
            trap.timer = 0.25;
          }
        } else if (trap.state === 'strike') {
          trap.timer -= dt;
          if (this.overlap(p.x, p.y, p.w, p.h, trap.x, trap.y - 38, trap.w, 38)) {
            this.takeDamage(trap.x + trap.w / 2);
          }
          if (trap.timer <= 0) {
            trap.state = 'idle';
            trap.timer = 0;
          }
        }
      }
    }

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;

      enemy.x += enemy.vx * dt;
      if (enemy.x <= enemy.left) {
        enemy.x = enemy.left;
        enemy.vx = Math.abs(enemy.vx);
      }
      if (enemy.x >= enemy.right) {
        enemy.x = enemy.right;
        enemy.vx = -Math.abs(enemy.vx);
      }

      if (enemy.type === 'raven') {
        enemy.phase += dt * 8;
        enemy.y += Math.sin(enemy.phase) * enemy.amp * dt;
      }

      if (enemy.type === 'minion') {
        enemy.shootTimer -= dt;
        if (enemy.shootTimer <= 0) {
          enemy.shootTimer = enemy.shootCd;
          const dir = (p.x + p.w / 2) < (enemy.x + enemy.w / 2) ? -1 : 1;
          const proj = this.add.sprite(enemy.x + enemy.w / 2, enemy.y + 16, 'projectile0').setOrigin(0.5, 0.5).setDepth(31).play('anim_projectile');
          this.projectiles.push({ x: enemy.x + enemy.w / 2, y: enemy.y + 16, w: 10, h: 6, vx: dir * enemy.projSpeed, sprite: proj, alive: true });
        }
      }

      if (this.overlap(p.x, p.y, p.w, p.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
        const stomp = p.vy > 40 && (p.y + p.h) <= enemy.y + 12;
        if (stomp) {
          if (enemy.type === 'minion') {
            enemy.hp -= 1;
            p.vy = -280;
            if (enemy.hp <= 0) {
              enemy.alive = false;
              enemy.sprite.setVisible(false);
              this.score += 120;
            }
          } else {
            enemy.alive = false;
            enemy.sprite.setVisible(false);
            this.score += enemy.type === 'raven' ? 40 : 30;
            p.vy = -320;
          }
        } else {
          this.takeDamage(enemy.x + enemy.w / 2);
        }
      }
    }

    for (const proj of this.projectiles) {
      if (!proj.alive) continue;
      proj.x += proj.vx * dt;
      if (proj.x < -40 || proj.x > this.currentLevel.cols * TILE + 40) {
        proj.alive = false;
        proj.sprite.setVisible(false);
        continue;
      }
      if (this.overlap(p.x, p.y, p.w, p.h, proj.x - proj.w / 2, proj.y - proj.h / 2, proj.w, proj.h)) {
        proj.alive = false;
        proj.sprite.setVisible(false);
        this.takeDamage(proj.x);
      }
    }
    this.projectiles = this.projectiles.filter((v) => v.alive);

    const rescuesRemaining = this.rescues.filter((v) => !v.collected).length;
    const minionsRemaining = this.enemies.filter((v) => v.alive && v.type === 'minion').length;
    const goalLocked = !!this.currentLevel.lockGoal;
    const unlocked = !goalLocked || (rescuesRemaining === 0 && minionsRemaining === 0);

    if (this.overlap(p.x, p.y, p.w, p.h, this.goalX(), this.goalY(), this.currentLevel.goal.w, this.currentLevel.goal.h)) {
      if (!unlocked) {
        this.overlay.setText(['ZIEL VERRIEGELT', `${rescuesRemaining} Federn / ${minionsRemaining} Waechter`]);
      } else {
        this.overlay.setText('');
        this.bestScore = Math.max(this.bestScore, this.score);
        if (this.currentLevel.key === 'custom') {
          this.mode = MODE_WIN;
          this.overlay.setText(['CUSTOM LEVEL GESCHAFFT', '', 'R: Neustart', 'E: Editor']);
        } else if (this.levelIndex < this.levels.length - 1) {
          this.levelIndex += 1;
          this.loadLevel(this.levels[this.levelIndex], true);
        } else {
          this.mode = MODE_WIN;
          this.overlay.setText(['GELBI IST FREI!', '', 'R: Neustart', 'E: Editor']);
        }
      }
    } else if (this.overlay.text.startsWith('ZIEL VERRIEGELT')) {
      this.overlay.setText('');
    }

    this.cameraX = clamp(p.x + p.w / 2 - W / 2, 0, this.currentLevel.cols * TILE - W);

    this.syncRender();
    this.updateHudText();
  }

  goalX() {
    return this.currentLevel.goal.col * TILE;
  }

  goalY() {
    return (this.currentLevel.goal.row + 1) * TILE - this.currentLevel.goal.h;
  }

  updateGoalSprite() {
    const gx = this.goalX();
    const gy = this.goalY();
    this.goalSprite.setPosition(gx, gy);
    this.goalSprite.setDisplaySize(this.currentLevel.goal.w, this.currentLevel.goal.h);
  }

  syncRender() {
    if (this.tileRT) this.tileRT.setPosition(-this.cameraX, 0);

    for (const c of this.coins) {
      if (!c.collected) c.sprite.setPosition(c.x - this.cameraX, c.y);
      c.sprite.setVisible(!c.collected && this.isVisibleX(c.x, 24));
    }
    for (const f of this.foods) {
      if (!f.collected) f.sprite.setPosition(f.x - this.cameraX, f.y);
      f.sprite.setVisible(!f.collected && this.isVisibleX(f.x, 24));
    }
    for (const r of this.rescues) {
      if (!r.collected) r.sprite.setPosition(r.x - this.cameraX, r.y);
      r.sprite.setVisible(!r.collected && this.isVisibleX(r.x, 24));
    }

    for (const t of this.traps) {
      t.sprite.setPosition(t.x - this.cameraX, t.y);
      t.sprite.setVisible(this.isVisibleRect(t.x, t.y, t.w, t.h));
      if (t.type === 'pressure') {
        if (t.state === 'idle') t.sprite.setTexture('pressure0');
        else if (t.state === 'warn') t.sprite.setTexture('pressure1');
        else t.sprite.setTexture('pressure2');
      }
    }

    for (const e of this.enemies) {
      e.sprite.setPosition(e.x - this.cameraX, e.y);
      e.sprite.setVisible(e.alive && this.isVisibleRect(e.x, e.y, e.w, e.h));
      if (e.vx < 0) {
        e.sprite.setFlipX(true);
      } else {
        e.sprite.setFlipX(false);
      }
    }

    for (const p of this.projectiles) {
      p.sprite.setPosition(p.x - this.cameraX, p.y);
      p.sprite.setVisible(p.alive && this.isVisibleRect(p.x - 5, p.y - 3, 10, 6));
    }

    this.player.sprite.setPosition(this.player.x - this.cameraX, this.player.y);
    this.player.sprite.setVisible(!(this.player.invuln > 0 && Math.floor(this.time.now / 70) % 2 === 0));
    this.player.sprite.setFlipX(this.player.face < 0);

    this.goalSprite.setPosition(this.goalX() - this.cameraX, this.goalY());
    this.goalSprite.setVisible(this.isVisibleRect(this.goalX(), this.goalY(), this.currentLevel.goal.w, this.currentLevel.goal.h));
  }

  isVisibleX(x, pad) {
    return x + pad >= this.cameraX && x - pad <= this.cameraX + W;
  }

  isVisibleRect(x, y, w, h) {
    return x + w >= this.cameraX && x <= this.cameraX + W && y + h >= 0 && y <= H;
  }

  updateEditor(dt) {
    this.handleEditorKeys();

    if (this.editor.messageTimer > 0) this.editor.messageTimer -= dt;
    this.editor.cameraX = clamp(this.editor.cursorCol * TILE - W / 2, 0, this.editor.activeLevel.cols * TILE - W);

    if (this.tileRT) this.tileRT.setPosition(-this.editor.cameraX, 0);

    this.overlay.setText('');

    this.updateHudText();
    this.drawEditorOverlay();
  }

  drawEditorOverlay() {
    if (this.gridGraphics) this.gridGraphics.destroy();
    this.gridGraphics = this.add.graphics().setDepth(45).setScrollFactor(0);
    const g = this.gridGraphics;

    const lvl = this.editor.activeLevel;
    const startCol = Math.max(0, Math.floor(this.editor.cameraX / TILE));
    const endCol = Math.min(lvl.cols - 1, Math.floor((this.editor.cameraX + W) / TILE) + 1);

    g.lineStyle(1, 0xffffff, 0.12);
    for (let c = startCol; c <= endCol; c++) {
      const sx = c * TILE - this.editor.cameraX;
      g.beginPath();
      g.moveTo(sx, 0);
      g.lineTo(sx, H);
      g.strokePath();
    }
    for (let r = 0; r <= ROWS; r++) {
      const sy = r * TILE;
      g.beginPath();
      g.moveTo(0, sy);
      g.lineTo(W, sy);
      g.strokePath();
    }

    for (const [row, col] of lvl.coins) this.drawEditorIcon('coin0', row, col, 0xFFFFFF, 24);
    for (const [row, col] of lvl.foods) this.drawEditorIcon('food0', row, col, 0xFFFFFF, 24);
    for (const [row, col] of lvl.rescueTokens) this.drawEditorIcon('rescue0', row, col, 0xFFFFFF, 24);
    for (const [row, col] of lvl.spikes) this.drawEditorIcon('spike0', row, col, 0xFFFFFF, 24);
    for (const [row, col] of lvl.nets) this.drawEditorIcon('net0', row, col, 0xFFFFFF, 24);

    for (const [r, l, rr] of lvl.beetles) {
      const x = l * TILE - this.editor.cameraX;
      const w = (rr - l + 1) * TILE;
      g.lineStyle(2, 0xff8a80, 0.9);
      g.strokeRect(x, r * TILE + 10, w, 8);
      this.drawEditorIcon('beetle0', r, l, 0xFFFFFF, 26);
    }
    for (const [r, l, rr] of lvl.ravens) {
      const x = l * TILE - this.editor.cameraX;
      const w = (rr - l + 1) * TILE;
      g.lineStyle(2, 0xb3e5fc, 0.9);
      g.strokeRect(x, r * TILE + 10, w, 8);
      this.drawEditorIcon('raven0', r, l, 0xFFFFFF, 28);
    }
    for (const [r, c] of lvl.minions) this.drawEditorIcon('minion0', r, c, 0xFFFFFF, 30);
    for (const c of lvl.pressures) {
      const sx = c * TILE - this.editor.cameraX;
      this.add.image(sx + 24, 11 * TILE - 2, 'pressure0').setDepth(44).setDisplaySize(44, 10).setScrollFactor(0);
    }

    g.lineStyle(2, 0x00e5ff, 1);
    g.strokeRect(lvl.spawn.col * TILE - this.editor.cameraX + 2, lvl.spawn.row * TILE + 2, TILE - 4, TILE - 4);

    const gy = (lvl.goal.row + 1) * TILE - lvl.goal.h;
    g.lineStyle(2, 0xffee58, 1);
    g.strokeRect(lvl.goal.col * TILE - this.editor.cameraX, gy, lvl.goal.w, lvl.goal.h);

    g.lineStyle(2, 0xffffff, 1);
    g.strokeRect(this.editor.cursorCol * TILE - this.editor.cameraX + 1, this.editor.cursorRow * TILE + 1, TILE - 2, TILE - 2);

    if (this.editor.pendingRange) {
      g.lineStyle(2, 0xffab91, 1);
      g.strokeRect(this.editor.pendingRange.col * TILE - this.editor.cameraX + 2, this.editor.pendingRange.row * TILE + 2, TILE - 4, TILE - 4);
    }
  }

  drawEditorIcon(key, row, col, tint, size) {
    const x = col * TILE + TILE / 2 - this.editor.cameraX;
    const y = row * TILE + TILE / 2;
    const img = this.add.image(x, y, key).setDepth(44).setDisplaySize(size, size).setScrollFactor(0);
    if (tint) img.setTint(tint);
  }

  updateHudText() {
    if (this.mode === MODE_MENU) {
      this.hud.setText([
        'MENU',
        '',
        'ENTER: Kampagne',
        'E: Editor',
        `BEST: ${this.bestScore}`
      ]);
      return;
    }

    if (this.mode === MODE_EDITOR) {
      const lvl = this.editor.activeLevel;
      const msg = this.editor.messageTimer > 0 ? `\nMSG: ${this.editor.message}` : '';
      this.hud.setText([
        'EDITOR',
        `Tool: ${this.editorToolName()} (${this.editor.toolIndex + 1}/${this.editor.tools.length})`,
        `Theme: ${lvl.theme} | Cols: ${lvl.cols} | GoalLock: ${lvl.lockGoal ? 'ON' : 'OFF'}`,
        `Coins ${lvl.coins.length} Food ${lvl.foods.length} Rescue ${lvl.rescueTokens.length}`,
        `Enemies B${lvl.beetles.length} R${lvl.ravens.length} M${lvl.minions.length}`,
        '[] Tool, Space Place, Del Erase, Enter Playtest',
        'S/L SaveLoad, X/I ExportImport, J JSON Edit',
        'N Name, O Objective, C Cols, G Goal, T Theme, K Lock' + msg
      ]);
      return;
    }

    const rescuesLeft = this.rescues.filter((v) => !v.collected).length;
    const minionsLeft = this.enemies.filter((v) => v.alive && v.type === 'minion').length;
    const lockInfo = this.currentLevel && this.currentLevel.lockGoal
      ? `LOCK: ${rescuesLeft} Federn / ${minionsLeft} Waechter`
      : `GOAL: ${this.currentLevel ? this.currentLevel.goal.label : ''}`;

    this.hud.setText([
      `${this.currentLevel ? this.currentLevel.name : ''}`,
      `Score ${this.score} | Best ${this.bestScore}`,
      `Food ${Math.floor(this.food)} | Lives ${this.lives}`,
      lockInfo,
      this.mode === MODE_PLAY ? 'R Neustart | E Editor' : this.mode === MODE_GAMEOVER ? 'R Neustart | E Editor' : 'R Neustart | E Editor'
    ]);
  }

  update(time, delta) {
    const dt = Math.min(delta / 1000, 0.05);

    if (this.mode === MODE_MENU) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.enter)) this.startCampaign();
      if (Phaser.Input.Keyboard.JustDown(this.keys.e)) this.enterEditor();
      this.updateHudText();
      return;
    }

    if (this.mode === MODE_EDITOR) {
      this.updateEditor(dt);
      return;
    }

    if (this.mode === MODE_PLAY) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.r)) this.startCampaign();
      if (Phaser.Input.Keyboard.JustDown(this.keys.e)) this.enterEditor();
      this.updatePlay(dt);
      return;
    }

    if (this.mode === MODE_GAMEOVER || this.mode === MODE_WIN) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.r)) this.startCampaign();
      if (Phaser.Input.Keyboard.JustDown(this.keys.e)) this.enterEditor();
      this.updateHudText();
    }
  }
}

const gameConfig = {
  type: Phaser.AUTO,
  width: W,
  height: H,
  parent: 'wrapper',
  backgroundColor: '#10181b',
  pixelArt: true,
  render: {
    antialias: false,
    roundPixels: true,
    powerPreference: 'high-performance'
  },
  scene: [BudgiePhaserScene]
};

new Phaser.Game(gameConfig);
