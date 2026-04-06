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

const COIN_SCORE    = 10;
const COIN_R        = 8;     // coin radius px
const FOOD_R        = 7;     // food radius px
const KEY_R         = 8;
const BASE_REQUIRED_RELICS = 2;
const ROUND_TIME = 90;
const BEST_SCORE_KEY = 'budgie_minigame_best_v1';
const LANG_KEY = 'budgie_minigame_lang_v1';

const DIFFICULTIES = {
  easy: {
    key: 'easy',
    labelKey: 'difficulty_easy',
    scoreMult: 0.85,
    xpMult: 0.9,
    enemySpeedMult: 0.9,
    extraRelics: 0,
    timerMult: 1.2,
    lives: 5
  },
  normal: {
    key: 'normal',
    labelKey: 'difficulty_normal',
    scoreMult: 1,
    xpMult: 1,
    enemySpeedMult: 1,
    extraRelics: 1,
    timerMult: 1,
    lives: 4
  },
  hard: {
    key: 'hard',
    labelKey: 'difficulty_hard',
    scoreMult: 1.25,
    xpMult: 1.3,
    enemySpeedMult: 1.18,
    extraRelics: 2,
    timerMult: 0.85,
    lives: 3
  }
};

const I18N = {
  de: {
    difficulty_easy: 'Leicht',
    difficulty_normal: 'Normal',
    difficulty_hard: 'Schwer',
    lang_short: 'DE',
    level_garten_name: 'Level 1 - Der Garten',
    level_wald_name: 'Level 2 - Der Wald',
    level_jagdhaus_name: 'Level 3 - Das Jagdhaus',
    level_garten_objective: 'Finde den Schlüssel und öffne das Tor zum Wald.',
    level_wald_objective: 'Der Wald ist voller Fallen. Hole den Schlüssel und halte durch.',
    level_jagdhaus_objective: 'Hol den Schlüssel, befreie Goldi und bring ihn nach Hause.',
    hud_score: 'PUNKTE {value}',
    hud_xp: 'XP {value}',
    hud_lives: 'LEBEN {value}',
    hud_time: 'ZEIT {value}s',
    hud_best: 'BESTE {value}',
    hud_mode: 'MODUS {value}',
    hud_level_fallback: 'BUDGIE QUEST',
    hud_relics: 'Relikte {current}/{target}',
    mission_return: 'Goldi im Schlepptau',
    mission_key_found: 'Schlüssel gefunden',
    mission_find_key: 'Schlüssel suchen',
    menu_controls: '← → BEWEGEN    SPACE / ↑  SPRINGEN & GLEITEN',
    menu_campaign: 'Mini-Kampagne: Schlüssel + Relikte, dann Goldi retten',
    menu_difficulty: '1/2/3 Schwierigkeit wählen • ESC pausiert • L Sprache',
    menu_current: 'Aktuell: {value}',
    menu_press_enter: 'ENTER DRÜCKEN ZUM START',
    intro_story_1: 'Goldi wurde vom Jäger',
    intro_story_2: 'im Käfig eingesperrt!',
    intro_story_3: 'Bubi muss ihn retten!',
    intro_hint_1: 'Du bist Bubi und musst Goldi retten.',
    intro_hint_2: 'Hol Schlüssel, befreie ihn und bring ihn nach Hause.',
    gameover_title: 'GAME OVER',
    gameover_score: 'PUNKTE :  {value}',
    gameover_best: 'BESTE  :  {value}',
    gameover_retry: 'R DRÜCKEN FÜR LEVEL-NEUSTART',
    pause_title: 'PAUSE',
    pause_resume: 'ESC = WEITER',
    pause_restart: 'R = KAMPAGNE NEU',
    win_title: 'GOLDI IST FREI!',
    win_line: 'Bubi und Goldi haben es geschafft!',
    win_final_score: 'ENDPUNKTE :  {value}',
    win_best_score: 'BESTE PUNKTE :  {value}',
    win_retry: 'R DRÜCKEN ZUM NEUSTART',
    loading_assets: 'SVG-ASSETS LADEN ...',
    loading_wait: 'EINEN MOMENT',
    lock_goal_locked: 'DAS TOR IST NOCH VERRIEGELT',
    lock_key_found: 'SCHLÜSSEL GEFUNDEN',
    fail_fell: 'Du bist abgestürzt.',
    fail_time: 'Die Zeit ist abgelaufen.',
    fail_beetle: 'Ein Käfer hat dich erwischt.',
    fail_raven: 'Ein Rabe hat dich erwischt.',
    fail_flybug: 'Ein fliegender Käfer hat dich erwischt.',
    fail_trap: 'Du bist in eine Falle gelaufen.'
  },
  en: {
    difficulty_easy: 'Easy',
    difficulty_normal: 'Normal',
    difficulty_hard: 'Hard',
    lang_short: 'EN',
    level_garten_name: 'Level 1 - The Garden',
    level_wald_name: 'Level 2 - The Forest',
    level_jagdhaus_name: 'Level 3 - The Hunting Cabin',
    level_garten_objective: 'Find the key and open the gate to the forest.',
    level_wald_objective: 'The forest is full of traps. Get the key and survive.',
    level_jagdhaus_objective: 'Get the key, free Goldi, and bring him home.',
    hud_score: 'SCORE {value}',
    hud_xp: 'XP {value}',
    hud_lives: 'LIVES {value}',
    hud_time: 'TIME {value}s',
    hud_best: 'BEST {value}',
    hud_mode: 'MODE {value}',
    hud_level_fallback: 'BUDGIE QUEST',
    hud_relics: 'Relics {current}/{target}',
    mission_return: 'Goldi in tow',
    mission_key_found: 'Key collected',
    mission_find_key: 'Find the key',
    menu_controls: '← → MOVE    SPACE / ↑  JUMP & GLIDE',
    menu_campaign: 'Mini-campaign: key + relics, then rescue Goldi',
    menu_difficulty: '1/2/3 Select difficulty • ESC pause • L language',
    menu_current: 'Current: {value}',
    menu_press_enter: 'PRESS ENTER TO START',
    intro_story_1: 'Goldi was captured',
    intro_story_2: 'and locked in a cage!',
    intro_story_3: 'Bubi has to save him!',
    intro_hint_1: 'You are Bubi and you must rescue Goldi.',
    intro_hint_2: 'Get the key, free him, and bring him home.',
    gameover_title: 'GAME OVER',
    gameover_score: 'SCORE :  {value}',
    gameover_best: 'BEST  :  {value}',
    gameover_retry: 'PRESS R TO RETRY LEVEL',
    pause_title: 'PAUSED',
    pause_resume: 'ESC = RESUME',
    pause_restart: 'R = RESTART CAMPAIGN',
    win_title: 'GOLDI IS FREE!',
    win_line: 'Bubi and Goldi made it home!',
    win_final_score: 'FINAL SCORE :  {value}',
    win_best_score: 'BEST  SCORE :  {value}',
    win_retry: 'PRESS R TO PLAY AGAIN',
    loading_assets: 'LOADING SVG ASSETS ...',
    loading_wait: 'ONE MOMENT',
    lock_goal_locked: 'THE GATE IS STILL LOCKED',
    lock_key_found: 'KEY COLLECTED',
    fail_fell: 'You fell down.',
    fail_time: 'Time is up.',
    fail_beetle: 'A beetle caught you.',
    fail_raven: 'A raven caught you.',
    fail_flybug: 'A flying bug caught you.',
    fail_trap: 'You ran into a trap.'
  }
};

const LANGS = ['de', 'en'];

function detectInitialLang() {
  try {
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved && LANGS.includes(saved)) return saved;
  } catch {
    // Ignore storage access issues and fallback to browser language.
  }
  const browserLang = (navigator.language || 'de').toLowerCase();
  return browserLang.startsWith('de') ? 'de' : 'en';
}

let currentLang = detectInitialLang();

function setLanguage(lang) {
  if (!LANGS.includes(lang)) return;
  currentLang = lang;
  try {
    window.localStorage.setItem(LANG_KEY, lang);
  } catch {
    // Ignore storage access issues to keep gameplay uninterrupted.
  }
}

function toggleLanguage() {
  setLanguage(currentLang === 'de' ? 'en' : 'de');
}

function t(key, vars = {}) {
  const table = I18N[currentLang] || I18N.de;
  const fallback = I18N.de[key];
  let text = table[key] || fallback || key;
  for (const [name, value] of Object.entries(vars)) {
    text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}

function difficultyLabel(diff = selectedDifficulty) {
  return t(diff.labelKey);
}

function levelName(level = currentLevel) {
  if (!level || !level.id) return t('hud_level_fallback');
  return t(`level_${level.id}_name`);
}

function levelObjective(level = currentLevel) {
  if (!level || !level.id) return '';
  return t(`level_${level.id}_objective`);
}

function svgDataUri(svg) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function svgDoc(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`;
}

function loadSvgImage(svg) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load SVG image'));
    img.src = svgDataUri(svg);
  });
}

function animFrame(frames, fps = 6, phase = 0) {
  if (!frames || !frames.length) return null;
  const t = Date.now() / 1000;
  const idx = Math.floor(t * fps + phase) % frames.length;
  return frames[idx];
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

let assetsReady = false;
let spriteAssets = null;

function buildSvgLibrary() {
  const mk = (w, h, body) => svgDoc(w, h, body);

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
      '<polygon points="10,1 12.4,6.8 18.7,7.3 13.9,11.3 15.5,17.5 10,14.2 4.5,17.5 6.1,11.3 1.3,7.3 7.6,6.8" fill="#ffd54f"/>' +
      '<polygon points="10,3.5 11.6,7.4 15.8,7.7 12.6,10.4 13.7,14.5 10,12.3 6.3,14.5 7.4,10.4 4.2,7.7 8.4,7.4" fill="#fff59d"/>'),
    coin1: mk(20, 20,
      '<polygon points="10,1.5 12.1,6.5 17.8,7.1 13.5,10.8 15,16.8 10,13.8 5,16.8 6.5,10.8 2.2,7.1 7.9,6.5" fill="#ffca28"/>' +
      '<polygon points="10,4 11.3,7 14.7,7.3 12.1,9.5 13,13.1 10,11.3 7,13.1 7.9,9.5 5.3,7.3 8.7,7" fill="#fff176"/>'),
    food0: mk(22, 22,
      '<rect x="4" y="4" width="14" height="14" rx="3" fill="#4fc3f7"/>' +
      '<rect x="6" y="6" width="10" height="10" rx="2" fill="#81d4fa"/>' +
      '<circle cx="8" cy="8" r="1.2" fill="#e1f5fe"/>' +
      '<circle cx="14" cy="12" r="1.2" fill="#e1f5fe"/>'),
    food1: mk(22, 22,
      '<rect x="4" y="4" width="14" height="14" rx="3" fill="#ff8a65"/>' +
      '<rect x="6" y="6" width="10" height="10" rx="2" fill="#ffab91"/>' +
      '<circle cx="9" cy="9" r="1.2" fill="#ffe0b2"/>' +
      '<circle cx="13" cy="13" r="1.2" fill="#ffe0b2"/>'),
    key0: mk(24, 18,
      '<circle cx="8" cy="9" r="5" fill="#fdd835"/>' +
      '<circle cx="8" cy="9" r="3" fill="#fff59d"/>' +
      '<rect x="13" y="7" width="9" height="3" rx="1" fill="#ffd54f"/>' +
      '<rect x="18" y="5" width="2" height="7" fill="#ffd54f"/>' +
      '<rect x="21" y="5" width="2" height="5" fill="#ffd54f"/>'),
    home0: mk(64, 64,
      '<polygon points="-2,26 32,2 66,26" fill="#c0392b"/>' +
      '<rect x="4" y="24" width="56" height="38" rx="2" fill="#8b5e3c"/>' +
      '<rect x="8" y="28" width="4" height="30" fill="#7a4e2d"/>' +
      '<rect x="52" y="28" width="4" height="30" fill="#7a4e2d"/>' +
      '<circle cx="32" cy="40" r="9" fill="#1a0a00"/>' +
      '<rect x="31" y="47" width="2" height="9" fill="#6b4226"/>' +
      '<rect x="27" y="55" width="10" height="2" fill="#6b4226"/>'),
    home1: mk(64, 64,
      '<polygon points="-2,25 32,1 66,25" fill="#b63123"/>' +
      '<rect x="4" y="24" width="56" height="38" rx="2" fill="#92643f"/>' +
      '<rect x="8" y="28" width="4" height="30" fill="#7a4e2d"/>' +
      '<rect x="52" y="28" width="4" height="30" fill="#7a4e2d"/>' +
      '<circle cx="32" cy="40" r="9" fill="#1a0a00"/>' +
      '<rect x="31" y="47" width="2" height="9" fill="#6b4226"/>' +
      '<rect x="27" y="55" width="10" height="2" fill="#6b4226"/>'),
    gate0: mk(64, 84,
      '<rect x="0" y="0" width="64" height="84" rx="4" fill="#355c7d"/>' +
      '<rect x="5" y="5" width="54" height="74" rx="3" fill="#4c6d8f"/>' +
      '<rect x="12" y="18" width="40" height="56" rx="2" fill="#17212b"/>' +
      '<rect x="28" y="36" width="8" height="10" rx="2" fill="#fdd835"/>'),
    gate1: mk(64, 84,
      '<rect x="0" y="0" width="64" height="84" rx="4" fill="#27415c"/>' +
      '<rect x="5" y="5" width="54" height="74" rx="3" fill="#3d5877"/>' +
      '<rect x="12" y="18" width="40" height="56" rx="2" fill="#111a22"/>' +
      '<rect x="28" y="36" width="8" height="10" rx="2" fill="#fdd835"/>'),
    cage0: mk(64, 84,
      '<rect x="0" y="0" width="64" height="84" rx="4" fill="#5d4037"/>' +
      '<rect x="5" y="5" width="54" height="74" rx="3" fill="#795548"/>' +
      '<rect x="10" y="14" width="4" height="62" fill="#3e2723"/>' +
      '<rect x="22" y="14" width="4" height="62" fill="#3e2723"/>' +
      '<rect x="34" y="14" width="4" height="62" fill="#3e2723"/>' +
      '<rect x="46" y="14" width="4" height="62" fill="#3e2723"/>' +
      '<circle cx="32" cy="42" r="9" fill="#ffecb3"/>'),
    cage1: mk(64, 84,
      '<rect x="0" y="0" width="64" height="84" rx="4" fill="#4e342e"/>' +
      '<rect x="5" y="5" width="54" height="74" rx="3" fill="#6d4c41"/>' +
      '<rect x="10" y="14" width="4" height="62" fill="#3e2723"/>' +
      '<rect x="22" y="14" width="4" height="62" fill="#3e2723"/>' +
      '<rect x="34" y="14" width="4" height="62" fill="#3e2723"/>' +
      '<rect x="46" y="14" width="4" height="62" fill="#3e2723"/>' +
      '<circle cx="32" cy="42" r="9" fill="#fff3cd"/>'),
    goldi0: mk(24, 24,
      '<ellipse cx="12" cy="13" rx="8" ry="9" fill="#fdd835"/>' +
      '<ellipse cx="12" cy="8" rx="6" ry="5" fill="#fff176"/>' +
      '<rect x="17" y="11" width="5" height="3" rx="1" fill="#ffb300"/>' +
      '<rect x="10" y="12" width="2" height="2" fill="#111"/>'),
    goldi1: mk(24, 24,
      '<ellipse cx="12" cy="13" rx="8" ry="9" fill="#ffe082"/>' +
      '<ellipse cx="12" cy="8" rx="6" ry="5" fill="#fff59d"/>' +
      '<rect x="17" y="11" width="5" height="3" rx="1" fill="#ffb300"/>' +
      '<rect x="10" y="12" width="2" height="2" fill="#111"/>'),
    beetle0: mk(30, 18,
      '<ellipse cx="15" cy="10" rx="10" ry="7" fill="#e53935"/>' +
      '<ellipse cx="15" cy="10" rx="10" ry="7" fill="none" stroke="#8e0000" stroke-width="1.2"/>' +
      '<rect x="14" y="4" width="2" height="12" fill="#1a1a1a"/>' +
      '<circle cx="10" cy="9" r="1.7" fill="#111"/>' +
      '<circle cx="20" cy="9" r="1.7" fill="#111"/>' +
      '<rect x="4" y="11" width="22" height="2" rx="1" fill="#111"/>'),
    beetle1: mk(30, 18,
      '<ellipse cx="15" cy="10" rx="10" ry="7" fill="#ef5350"/>' +
      '<ellipse cx="15" cy="10" rx="10" ry="7" fill="none" stroke="#8e0000" stroke-width="1.2"/>' +
      '<rect x="14" y="4" width="2" height="12" fill="#1a1a1a"/>' +
      '<circle cx="10" cy="9" r="1.7" fill="#111"/>' +
      '<circle cx="20" cy="9" r="1.7" fill="#111"/>' +
      '<rect x="5" y="11" width="20" height="2" rx="1" fill="#111"/>'),
    raven0: mk(34, 22,
      '<ellipse cx="17" cy="12" rx="9" ry="6" fill="#3e2723"/>' +
      '<polygon points="8,12 0,8 2,14" fill="#5d4037"/>' +
      '<polygon points="26,12 34,8 32,14" fill="#5d4037"/>' +
      '<polygon points="24,12 30,13 24,15" fill="#d7a86e"/>' +
      '<circle cx="20" cy="11" r="1.4" fill="#fff"/>'),
    raven1: mk(34, 22,
      '<ellipse cx="17" cy="12" rx="9" ry="6" fill="#4e342e"/>' +
      '<polygon points="8,13 0,11 2,15" fill="#6d4c41"/>' +
      '<polygon points="26,13 34,11 32,15" fill="#6d4c41"/>' +
      '<polygon points="24,12 30,13 24,15" fill="#e0b27d"/>' +
      '<circle cx="20" cy="11" r="1.4" fill="#fff"/>'),
    flybug0: mk(28, 20,
      '<ellipse cx="14" cy="11" rx="7" ry="5" fill="#6a1b9a"/>' +
      '<ellipse cx="10" cy="8" rx="4" ry="3" fill="#b39ddb"/>' +
      '<ellipse cx="18" cy="8" rx="4" ry="3" fill="#b39ddb"/>' +
      '<rect x="13" y="6" width="2" height="10" fill="#1a1a1a"/>' +
      '<circle cx="12" cy="11" r="1" fill="#fff"/>' +
      '<circle cx="16" cy="11" r="1" fill="#fff"/>'),
    flybug1: mk(28, 20,
      '<ellipse cx="14" cy="11" rx="7" ry="5" fill="#4a148c"/>' +
      '<ellipse cx="10" cy="7" rx="4" ry="3" fill="#d1c4e9"/>' +
      '<ellipse cx="18" cy="7" rx="4" ry="3" fill="#d1c4e9"/>' +
      '<rect x="13" y="6" width="2" height="10" fill="#1a1a1a"/>' +
      '<circle cx="12" cy="11" r="1" fill="#fff"/>' +
      '<circle cx="16" cy="11" r="1" fill="#fff"/>'),
    spike0: mk(32, 18,
      '<polygon points="0,18 8,5 16,18" fill="#9e9e9e"/>' +
      '<polygon points="8,18 16,2 24,18" fill="#b0bec5"/>' +
      '<polygon points="16,18 24,5 32,18" fill="#9e9e9e"/>' +
      '<rect x="0" y="16" width="32" height="2" fill="#757575"/>'),
    spike1: mk(32, 18,
      '<polygon points="0,18 8,4 16,18" fill="#b0bec5"/>' +
      '<polygon points="8,18 16,1 24,18" fill="#cfd8dc"/>' +
      '<polygon points="16,18 24,4 32,18" fill="#b0bec5"/>' +
      '<rect x="0" y="16" width="32" height="2" fill="#9e9e9e"/>'),
    net0: mk(40, 40,
      '<rect x="0.5" y="0.5" width="39" height="39" fill="none" stroke="#d7d7d7" stroke-width="1"/>' +
      '<path d="M10 0V40M20 0V40M30 0V40M0 10H40M0 20H40M0 30H40" stroke="#d7d7d7" stroke-width="1"/>'),
    net1: mk(40, 40,
      '<rect x="0.5" y="0.5" width="39" height="39" fill="none" stroke="#efefef" stroke-width="1"/>' +
      '<path d="M10 0V40M20 0V40M30 0V40M0 10H40M0 20H40M0 30H40" stroke="#efefef" stroke-width="1"/>'),
    tileGround: mk(32, 32,
      '<rect width="32" height="32" fill="#6c4a2e"/>' +
      '<rect y="0" width="32" height="7" fill="#3f7d47"/>' +
      '<rect y="30" width="32" height="2" fill="#4a2d19"/>'),
    tilePlatform: mk(32, 32,
      '<rect width="32" height="32" fill="#7a5230"/>' +
      '<rect y="0" width="32" height="3" fill="#8b6340"/>' +
      '<rect y="6" width="32" height="2" fill="#8b6340"/>' +
      '<rect y="29" width="32" height="3" fill="#6b4423"/>'),
    cloud0: mk(130, 50,
      '<ellipse cx="35" cy="30" rx="30" ry="16" fill="rgba(255,255,255,0.88)"/>' +
      '<ellipse cx="68" cy="22" rx="34" ry="19" fill="rgba(255,255,255,0.9)"/>' +
      '<ellipse cx="98" cy="31" rx="27" ry="15" fill="rgba(255,255,255,0.86)"/>'),
    cloud1: mk(130, 50,
      '<ellipse cx="35" cy="30" rx="30" ry="16" fill="rgba(255,255,255,0.8)"/>' +
      '<ellipse cx="68" cy="22" rx="34" ry="19" fill="rgba(255,255,255,0.86)"/>' +
      '<ellipse cx="98" cy="31" rx="27" ry="15" fill="rgba(255,255,255,0.78)"/>'),
    gelbi0: mk(14, 12,
      '<rect x="3" y="2" width="8" height="9" rx="1" fill="#fdd835"/>' +
      '<rect x="4" y="0" width="6" height="5" rx="1" fill="#ffee58"/>' +
      '<rect x="8" y="2" width="2" height="2" fill="#111"/>'),
    gelbi1: mk(14, 12,
      '<rect x="3" y="2" width="8" height="9" rx="1" fill="#fdd835"/>' +
      '<rect x="4" y="0" width="6" height="5" rx="1" fill="#fff176"/>' +
      '<rect x="8" y="2" width="2" height="2" fill="#111"/>')
  };
}

async function loadSvgAssets() {
  const lib = buildSvgLibrary();
  const keys = Object.keys(lib);
  const loaded = {};
  await Promise.all(keys.map(async (k) => {
    loaded[k] = await loadSvgImage(lib[k]);
  }));

  spriteAssets = {
    player: [loaded.player0, loaded.player1],
    coin: [loaded.coin0, loaded.coin1],
    food: [loaded.food0, loaded.food1],
    key: [loaded.key0],
    home: [loaded.home0, loaded.home1],
    gate: [loaded.gate0, loaded.gate1],
    cage: [loaded.cage0, loaded.cage1],
    cloud: [loaded.cloud0, loaded.cloud1],
    tileGround: loaded.tileGround,
    tilePlatform: loaded.tilePlatform,
    gelbi: [loaded.gelbi0, loaded.gelbi1],
    goldi: [loaded.goldi0, loaded.goldi1],
    beetle: [loaded.beetle0, loaded.beetle1],
    raven: [loaded.raven0, loaded.raven1],
    flybug: [loaded.flybug0, loaded.flybug1],
    spike: [loaded.spike0, loaded.spike1],
    net: [loaded.net0, loaded.net1]
  };
}

// ─── ENEMY / TRAP CONSTANTS ──────────────────────────────────────────────────
const BEETLE_W      = 32;
const BEETLE_H      = 24;
const BEETLE_SPEED  = 60;
const BEETLE_POINTS = 50;

const MINION_W      = 28;
const MINION_H      = 40;
const MINION_SPEED  = 40;
const MINION_POINTS = 150;
const MINION_SHOOT_COOLDOWN = 2.0;  // seconds between shots
const PROJ_SPEED    = 200;          // px/s

const SPIKE_W       = 32;
const SPIKE_H       = 16;

const NET_W         = 40;
const NET_H         = 40;
const NET_SLOW_DUR  = 2.0;   // seconds of 50% slowdown after escaping
const NET_TRAP_DUR  = 1.5;   // seconds trapped before auto-release

const INVINCIBLE_DUR = 1.5;  // seconds of invincibility after taking damage
const BOUNCE_VEL    = -300;  // upward bounce when stomping an enemy
const PLAYER_LIVES  = 3;

// ─── CANVAS ──────────────────────────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
canvas.width  = CANVAS_W;
canvas.height = CANVAS_H;

// ─── GAME STATE ──────────────────────────────────────────────────────────────
let gameState = 'menu';   // 'menu' | 'intro' | 'playing' | 'paused' | 'gameover' | 'win'
let score     = 0;
let xp        = 0;
let bestScore = 0;
let roundTimer = ROUND_TIME;
let lives = 4;
let collectedCoins = 0;
let collectedFood = 0;
let keyCollected = false;
let goalUnlocked = false;
let goldiRescued = false;
let campaignPhase = 'approach';
let currentLevelIndex = 0;
let currentLevel = null;
let selectedDifficulty = DIFFICULTIES.normal;
let requiredRelicsTarget = BASE_REQUIRED_RELICS;
let lockHintTimer = 0;
let lastFailReason = '';
let player    = null;
let goldiFollower = null;
let cameraX   = 0;
let tileMap   = [];
let coins     = [];
let foods     = [];
let keyItem   = null;
let birdhouse = null;
let beetles      = [];
let ravens       = [];
let flybugs      = [];
let spikeTraps   = [];
let netTraps     = [];
let minions      = [];
let projectiles  = [];

function loadBestScore() {
  try {
    const raw = window.localStorage.getItem(BEST_SCORE_KEY);
    const val = Number.parseInt(raw, 10);
    bestScore = Number.isFinite(val) && val >= 0 ? val : 0;
  } catch {
    bestScore = 0;
  }
}

function storeBestScore() {
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
  } catch {
    // Ignore storage errors to keep gameplay uninterrupted.
  }
}

function updateBestScore() {
  if (score > bestScore) {
    bestScore = score;
    storeBestScore();
  }
}

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

  if (!wasHeld && e.code === 'Escape') {
    if (gameState === 'playing') {
      gameState = 'paused';
    } else if (gameState === 'paused') {
      gameState = 'playing';
    }
  }

  if (!wasHeld && e.code === 'KeyL') {
    toggleLanguage();
  }

  if (!wasHeld) {
    switch (gameState) {
      case 'menu':
        if (e.code === 'Enter') gameState = 'intro';
        if (e.code === 'Digit1') selectedDifficulty = DIFFICULTIES.easy;
        if (e.code === 'Digit2') selectedDifficulty = DIFFICULTIES.normal;
        if (e.code === 'Digit3') selectedDifficulty = DIFFICULTIES.hard;
        break;
      case 'intro':
        if (e.code === 'Enter') startGame();
        if (e.code === 'Digit1') selectedDifficulty = DIFFICULTIES.easy;
        if (e.code === 'Digit2') selectedDifficulty = DIFFICULTIES.normal;
        if (e.code === 'Digit3') selectedDifficulty = DIFFICULTIES.hard;
        break;
      case 'playing':
        if ((e.code === 'Space' || e.code === 'ArrowUp') && player.onGround) {
          player.vy = JUMP_VEL;
          player.onGround = false;
        }
        break;
      case 'paused':
        if (e.code === 'KeyR') startGame();
        break;
      case 'gameover':
      case 'win':
        if (e.code === 'KeyR') {
          if (gameState === 'gameover') {
            lives = selectedDifficulty.lives;
            loadLevel(currentLevelIndex);
            gameState = 'playing';
          } else {
            startGame();
          }
        }
        if (e.code === 'Digit1') selectedDifficulty = DIFFICULTIES.easy;
        if (e.code === 'Digit2') selectedDifficulty = DIFFICULTIES.normal;
        if (e.code === 'Digit3') selectedDifficulty = DIFFICULTIES.hard;
        break;
    }
  }

  if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
    e.preventDefault();
  }
});

window.addEventListener('keyup', e => keys.delete(e.code));

// ─── LEVEL BUILDING ──────────────────────────────────────────────────────────
function makeArrayLevel(cols) {
  return Array.from({ length: ROWS }, () => new Array(cols).fill(0));
}

function fillRect(tiles, r1, c1, r2, c2) {
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      if (r >= 0 && r < ROWS && c >= 0 && c < tiles[0].length) tiles[r][c] = 1;
    }
  }
}

function createKey(row, col) {
  return {
    x: col * TILE + TILE / 2,
    y: row * TILE + TILE / 2,
    w: 24,
    h: 18,
    collected: false
  };
}

function createGoal(kind, row, col, w, h, label) {
  return {
    kind,
    x: col * TILE,
    y: row * TILE - h + TILE,
    w,
    h,
    label,
    locked: true
  };
}

function buildCoins(defs) {
  return defs.map(([row, col]) => ({
    x: col * TILE + TILE / 2,
    y: row * TILE + TILE / 2,
    collected: false,
  }));
}

function buildFoods(defs) {
  return defs.map(([row, col]) => ({
    x: col * TILE + TILE / 2,
    y: row * TILE + TILE / 2,
    collected: false,
  }));
}

function buildBeetles(defs) {
  return defs.map(([surfRow, leftCol, rightCol]) => ({
    type: 'beetle',
    x: leftCol * TILE,
    y: surfRow * TILE - BEETLE_H,
    w: BEETLE_W,
    h: BEETLE_H,
    vx: BEETLE_SPEED,
    leftBound: leftCol * TILE,
    rightBound: (rightCol + 1) * TILE - BEETLE_W,
    direction: 1,
    dead: false,
  }));
}

function buildRavens(defs) {
  return defs.map(([surfRow, leftCol, rightCol]) => ({
    type: 'raven',
    x: leftCol * TILE,
    y: surfRow * TILE - 22,
    baseY: surfRow * TILE - 22,
    w: 30,
    h: 18,
    vx: 70,
    leftBound: leftCol * TILE,
    rightBound: (rightCol + 1) * TILE - 30,
    direction: 1,
    phase: 0,
    amp: 8,
    mode: 'patrol',
    diveCd: 1.6 + Math.random() * 1.1,
    prepareTimer: 0,
    diveTimer: 0,
    recoveryY: surfRow * TILE - 22,
    dead: false,
  }));
}

function buildFlybugs(defs) {
  return defs.map(([row, leftCol, rightCol], i) => ({
    type: 'flybug',
    x: leftCol * TILE,
    y: row * TILE - 18,
    baseY: row * TILE - 18,
    w: 28,
    h: 20,
    vx: 82,
    leftBound: leftCol * TILE,
    rightBound: (rightCol + 1) * TILE - 28,
    direction: 1,
    phase: i * 1.35,
    amp: 10 + (i % 2 ? 3 : -2),
    swarmOffset: (i % 3) * 6,
    verticalBias: i % 2 ? -2 : 2,
    dead: false,
  }));
}

function buildSpikeTraps(defs) {
  return defs.map(([row, col]) => ({
    type: 'spike',
    x: col * TILE,
    y: row * TILE,
    w: SPIKE_W,
    h: SPIKE_H,
  }));
}

function buildNetTraps(defs) {
  return defs.map(([row, col]) => ({
    type: 'net',
    x: col * TILE - NET_W / 2,
    y: row * TILE,
    w: NET_W,
    h: NET_H,
    active: true,
  }));
}

function createCampaignLevels() {
  const level1Tiles = makeArrayLevel(COLS);
  fillRect(level1Tiles, 11, 0, 13, 13);
  fillRect(level1Tiles, 11, 18, 13, 31);
  fillRect(level1Tiles, 11, 35, 13, 59);
  fillRect(level1Tiles, 8,  5, 8,  9);
  fillRect(level1Tiles, 7,  11, 7, 14);
  fillRect(level1Tiles, 9,  16, 9, 18);
  fillRect(level1Tiles, 7,  22, 7, 26);
  fillRect(level1Tiles, 9,  29, 9, 31);
  fillRect(level1Tiles, 7,  40, 7, 44);
  fillRect(level1Tiles, 6,  49, 6, 53);

  const level2Tiles = makeArrayLevel(COLS);
  fillRect(level2Tiles, 11, 0, 13, 9);
  fillRect(level2Tiles, 11, 14, 13, 23);
  fillRect(level2Tiles, 11, 28, 13, 40);
  fillRect(level2Tiles, 11, 46, 13, 59);
  fillRect(level2Tiles, 8,  3, 8,  7);
  fillRect(level2Tiles, 7,  10, 7, 13);
  fillRect(level2Tiles, 6,  18, 6, 21);
  fillRect(level2Tiles, 9,  24, 9, 27);
  fillRect(level2Tiles, 8,  31, 8, 35);
  fillRect(level2Tiles, 6,  38, 6, 42);
  fillRect(level2Tiles, 8,  49, 8, 53);
  fillRect(level2Tiles, 7,  54, 7, 58);

  const level3Tiles = makeArrayLevel(COLS);
  fillRect(level3Tiles, 11, 0, 13, 8);
  fillRect(level3Tiles, 11, 12, 13, 20);
  fillRect(level3Tiles, 11, 26, 13, 37);
  fillRect(level3Tiles, 11, 43, 13, 52);
  fillRect(level3Tiles, 11, 56, 13, 59);
  fillRect(level3Tiles, 8,  5, 8,  8);
  fillRect(level3Tiles, 7,  15, 7, 18);
  fillRect(level3Tiles, 9,  22, 9, 24);
  fillRect(level3Tiles, 6,  29, 6, 33);
  fillRect(level3Tiles, 8,  36, 8, 39);
  fillRect(level3Tiles, 7,  46, 7, 50);
  fillRect(level3Tiles, 5,  52, 5, 55);

  return [
    {
      id: 'garten',
      name: 'Level 1 - Der Garten',
      objective: 'Finde den Schlüssel und öffne das Tor zum Wald.',
      tiles: level1Tiles,
      coins: [[10, 3], [10, 7], [10, 12], [7, 5], [7, 8], [6, 23], [6, 26], [10, 37], [10, 42], [6, 41]],
      foods: [[10, 9], [10, 21], [10, 50]],
      key: createKey(6, 24),
      goal: createGoal('gate', 10, 57, 64, 84, 'Tor'),
      startHome: { x: 2 * TILE, y: 11 * TILE - 64, w: 64, h: 64, kind: 'home' },
      goldiCage: null,
      beetles: buildBeetles([[10, 20, 26]]),
      ravens: [],
      flybugs: buildFlybugs([[6, 40, 44]]),
      spikes: buildSpikeTraps([[10, 16], [10, 29]]),
      nets: [],
      rescueKey: false
    },
    {
      id: 'wald',
      name: 'Level 2 - Der Wald',
      objective: 'Der Wald ist voller Fallen. Hole den Schlüssel und halte durch.',
      tiles: level2Tiles,
      coins: [[10, 3], [10, 7], [10, 16], [7, 4], [6, 11], [5, 19], [8, 25], [7, 33], [5, 40], [7, 50], [10, 56]],
      foods: [[10, 8], [10, 22], [10, 48]],
      key: createKey(5, 41),
      goal: createGoal('gate', 10, 57, 64, 84, 'Ausgang'),
      startHome: { x: 2 * TILE, y: 11 * TILE - 64, w: 64, h: 64, kind: 'home' },
      goldiCage: null,
      beetles: buildBeetles([[10, 15, 22], [10, 30, 39]]),
      ravens: buildRavens([[7, 23, 31]]),
      flybugs: buildFlybugs([[7, 31, 35]]),
      spikes: buildSpikeTraps([[10, 9], [10, 23], [10, 40], [10, 52]]),
      nets: buildNetTraps([[9, 20], [8, 38]]),
      rescueKey: false
    },
    {
      id: 'jagdhaus',
      name: 'Level 3 - Das Jagdhaus',
      objective: 'Hol den Schlüssel, befreie Goldi und bring ihn nach Hause.',
      tiles: level3Tiles,
      coins: [[10, 3], [10, 6], [7, 6], [6, 16], [10, 30], [5, 31], [7, 38], [10, 46], [4, 53], [10, 58]],
      foods: [[10, 7], [10, 28], [10, 48]],
      key: createKey(4, 53),
      goal: createGoal('cage', 10, 57, 64, 84, 'Käfig'),
      startHome: { x: 2 * TILE, y: 11 * TILE - 64, w: 64, h: 64, kind: 'home' },
      goldiCage: createGoal('cage', 10, 57, 64, 84, 'Käfig'),
      beetles: buildBeetles([[10, 14, 19], [10, 34, 40]]),
      ravens: buildRavens([[7, 18, 26], [6, 43, 51]]),
      flybugs: buildFlybugs([[7, 22, 24], [6, 29, 33]]),
      spikes: buildSpikeTraps([[10, 12], [10, 20], [10, 43], [10, 56]]),
      nets: buildNetTraps([[9, 23], [8, 39]]),
      rescueKey: true
    }
  ];
}

const CAMPAIGN_LEVELS = createCampaignLevels();

const LEVEL_THEMES = {
  garten: {
    skyTop: '#4aa5e8',
    skyBottom: '#cbeeff',
    worldFilter: 'none',
    collectibleFilter: 'none',
    enemyFilter: 'none',
    hazardFilter: 'none',
    goalFilter: 'none',
    hudAccent: '#ffe082'
  },
  wald: {
    skyTop: '#3e6f6d',
    skyBottom: '#9bc2a3',
    worldFilter: 'hue-rotate(-18deg) saturate(0.88) brightness(0.94)',
    collectibleFilter: 'hue-rotate(12deg) saturate(1.05) brightness(0.95)',
    enemyFilter: 'hue-rotate(8deg) saturate(0.9) brightness(0.9)',
    hazardFilter: 'hue-rotate(-8deg) saturate(0.85) brightness(0.9)',
    goalFilter: 'hue-rotate(-12deg) saturate(0.92) brightness(0.92)',
    hudAccent: '#c5e1a5'
  },
  jagdhaus: {
    skyTop: '#6b4f42',
    skyBottom: '#b08968',
    worldFilter: 'hue-rotate(18deg) saturate(1.08) brightness(0.9)',
    collectibleFilter: 'hue-rotate(24deg) saturate(1.12) brightness(1.02)',
    enemyFilter: 'hue-rotate(28deg) saturate(1.15) contrast(1.05)',
    hazardFilter: 'hue-rotate(20deg) saturate(1.08) brightness(0.94)',
    goalFilter: 'hue-rotate(16deg) saturate(1.1) brightness(0.9)',
    hudAccent: '#ffcc80'
  }
};

function currentTheme() {
  const id = currentLevel && currentLevel.id ? currentLevel.id : 'garten';
  return LEVEL_THEMES[id] || LEVEL_THEMES.garten;
}

function drawThemedImage(img, x, y, w, h, filter) {
  if (!img) return;
  if (!filter || filter === 'none') {
    ctx.drawImage(img, x, y, w, h);
    return;
  }
  ctx.save();
  ctx.filter = filter;
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

function buildTileMap(level = CAMPAIGN_LEVELS[0]) {
  return level.tiles;
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

function createGoldiFollower() {
  return {
    x: 0,
    y: 0,
    w: 24,
    h: 24,
    sprite: true
  };
}

// ─── START / RESET ───────────────────────────────────────────────────────────
function startGame() {
  score     = 0;
  xp        = 0;
  roundTimer = ROUND_TIME * selectedDifficulty.timerMult;
  lives = selectedDifficulty.lives;
  collectedCoins = 0;
  collectedFood = 0;
  keyCollected = false;
  goalUnlocked = false;
  goldiRescued = false;
  campaignPhase = 'approach';
  currentLevelIndex = 0;
  lockHintTimer = 0;
  lastFailReason = '';
  gameState = 'playing';
  loadLevel(0);
}

function loadLevel(index) {
  currentLevelIndex = Math.max(0, Math.min(index, CAMPAIGN_LEVELS.length - 1));
  currentLevel = CAMPAIGN_LEVELS[currentLevelIndex];
  const desiredRelics = BASE_REQUIRED_RELICS + selectedDifficulty.extraRelics + currentLevelIndex;
  requiredRelicsTarget = Math.min(currentLevel.foods.length, Math.max(1, desiredRelics));
  roundTimer = ROUND_TIME * selectedDifficulty.timerMult;
  cameraX   = 0;
  tileMap   = buildTileMap(currentLevel);
  player    = createPlayer();
  coins     = buildCoins(currentLevel.coins);
  foods     = buildFoods(currentLevel.foods);
  keyItem   = deepClone(currentLevel.key);
  birdhouse = deepClone(currentLevel.goal);
  birdhouse.locked = true;
  beetles   = deepClone(currentLevel.beetles);
  ravens    = deepClone(currentLevel.ravens);
  flybugs   = deepClone(currentLevel.flybugs || []);
  for (const beetle of beetles) beetle.vx *= selectedDifficulty.enemySpeedMult;
  for (const raven of ravens) raven.vx *= selectedDifficulty.enemySpeedMult;
  for (const flybug of flybugs) flybug.vx *= selectedDifficulty.enemySpeedMult;
  spikeTraps = deepClone(currentLevel.spikes);
  netTraps   = deepClone(currentLevel.nets);
  minions    = [];
  projectiles = [];
  goldiFollower = null;
  goalUnlocked = false;
  keyCollected = false;
  goldiRescued = false;
}

function applyScore(value) {
  const pts = Math.max(1, Math.round(value * selectedDifficulty.scoreMult));
  score += pts;
  xp += Math.max(1, Math.round(value * selectedDifficulty.xpMult));
}

function advanceLevel() {
  if (currentLevelIndex < CAMPAIGN_LEVELS.length - 1) {
    loadLevel(currentLevelIndex + 1);
    return;
  }
  gameState = 'win';
}

function rescueGoldi() {
  goldiRescued = true;
  goalUnlocked = true;
  campaignPhase = 'return';
  birdhouse = deepClone(currentLevel.startHome);
  birdhouse.locked = false;
  goldiFollower = createGoldiFollower();
  goldiFollower.x = player.x - 18;
  goldiFollower.y = player.y + 2;
}

function finishCampaign() {
  updateBestScore();
  gameState = 'win';
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
    triggerGameOver('fail_fell');
    return;
  }

  if (lockHintTimer > 0) lockHintTimer = Math.max(0, lockHintTimer - dt);

  // Round timer
  roundTimer -= dt;
  if (roundTimer <= 0) {
    roundTimer = 0;
    triggerGameOver('fail_time');
    return;
  }

  // Collect coins and food
  checkCollections();

  updateEnemies(dt);
  updateGoldiFollower(dt);

  // Camera follows player, clamped to level bounds
  cameraX = player.x + player.w / 2 - CANVAS_W / 2;
  cameraX = Math.max(0, Math.min(cameraX, COLS * TILE - CANVAS_W));
}

function triggerGameOver(reasonKey = '') {
  lives -= 1;
  lastFailReason = reasonKey;
  if (lives > 0) {
    loadLevel(currentLevelIndex);
    gameState = 'playing';
    return;
  }
  updateBestScore();
  gameState = 'gameover';
}

function checkCollections() {
  const px = player.x, py = player.y, pw = player.w, ph = player.h;

  for (const coin of coins) {
    if (coin.collected) continue;
    if (rectsOverlap(px, py, pw, ph,
        coin.x - COIN_R, coin.y - COIN_R, COIN_R * 2, COIN_R * 2)) {
      coin.collected = true;
      applyScore(COIN_SCORE);
      collectedCoins += 1;
    }
  }

  for (const food of foods) {
    if (food.collected) continue;
    if (rectsOverlap(px, py, pw, ph,
        food.x - FOOD_R, food.y - FOOD_R, FOOD_R * 2, FOOD_R * 2)) {
      food.collected = true;
      applyScore(8);
      collectedFood += 1;
    }
  }

  if (keyItem && !keyCollected && rectsOverlap(px, py, pw, ph, keyItem.x - KEY_R, keyItem.y - KEY_R, KEY_R * 2, KEY_R * 2)) {
    keyCollected = true;
    applyScore(20);
    keyItem.collected = true;
  }

  goalUnlocked = keyCollected && collectedFood >= requiredRelicsTarget;

  if (!birdhouse) return;

  const touchingGoal = rectsOverlap(px, py, pw, ph, birdhouse.x, birdhouse.y, birdhouse.w, birdhouse.h);
  if (!touchingGoal) return;

  if (!goalUnlocked) {
    lockHintTimer = 1.2;
    return;
  }

  if (campaignPhase === 'return' && goldiRescued && currentLevelIndex === CAMPAIGN_LEVELS.length - 1) {
    applyScore(80 + Math.floor(roundTimer * 2));
    finishCampaign();
    return;
  }

  if (currentLevelIndex === CAMPAIGN_LEVELS.length - 1) {
    rescueGoldi();
    return;
  }

  advanceLevel();
}

function updateGoldiFollower(dt) {
  if (!goldiFollower) return;
  const targetX = player.x - 18;
  const targetY = player.y + 2;
  goldiFollower.x += (targetX - goldiFollower.x) * Math.min(1, dt * 10);
  goldiFollower.y += (targetY - goldiFollower.y) * Math.min(1, dt * 10);
}

function updateEnemies(dt) {
  for (const beetle of beetles) {
    if (!beetle || beetle.dead) continue;
    beetle.x += beetle.vx * beetle.direction * dt;
    if (beetle.x <= beetle.leftBound) {
      beetle.x = beetle.leftBound;
      beetle.direction = 1;
    } else if (beetle.x >= beetle.rightBound) {
      beetle.x = beetle.rightBound;
      beetle.direction = -1;
    }

    if (rectsOverlap(player.x, player.y, player.w, player.h, beetle.x, beetle.y, beetle.w, beetle.h)) {
      const stomp = player.vy > 40 && player.y + player.h - 6 <= beetle.y + 8;
      if (stomp) {
        beetle.dead = true;
        applyScore(30);
        player.vy = -280;
      } else {
        triggerGameOver('fail_beetle');
      }
    }
  }

  for (const raven of ravens) {
    if (!raven || raven.dead) continue;

    if (raven.mode === 'patrol') {
      raven.phase += dt * 7;
      raven.diveCd -= dt;
      raven.x += raven.vx * raven.direction * dt;
      if (raven.x <= raven.leftBound) {
        raven.x = raven.leftBound;
        raven.direction = 1;
      } else if (raven.x >= raven.rightBound) {
        raven.x = raven.rightBound;
        raven.direction = -1;
      }
      raven.y = raven.baseY + Math.sin(raven.phase) * raven.amp;

      const nearX = Math.abs((player.x + player.w / 2) - (raven.x + raven.w / 2)) < 110;
      if (nearX && raven.diveCd <= 0) {
        raven.mode = 'prepare';
        raven.prepareTimer = 0.34;
        raven.diveCd = 2.4 + Math.random() * 1.3;
      }
    } else if (raven.mode === 'prepare') {
      raven.prepareTimer -= dt;
      raven.phase += dt * 11;
      raven.y = raven.baseY + Math.sin(raven.phase) * (raven.amp * 0.35);
      raven.x += raven.vx * raven.direction * 0.42 * dt;
      if (raven.prepareTimer <= 0) {
        raven.mode = 'dive';
        raven.diveTimer = 0.55;
      }
    } else {
      raven.diveTimer -= dt;
      raven.x += raven.vx * raven.direction * 1.35 * dt;
      raven.y += 170 * dt;
      if (raven.diveTimer <= 0) {
        raven.mode = 'recover';
      }
      if (raven.y > CANVAS_H - 84) {
        raven.mode = 'recover';
      }
    }

    if (raven.mode === 'recover') {
      raven.y -= 150 * dt;
      raven.x += raven.vx * raven.direction * 0.8 * dt;
      if (raven.y <= raven.recoveryY) {
        raven.y = raven.recoveryY;
        raven.mode = 'patrol';
      }
    }

    if (rectsOverlap(player.x, player.y, player.w, player.h, raven.x, raven.y, raven.w, raven.h)) {
      const stomp = player.vy > 30 && player.y + player.h - 6 <= raven.y + 8;
      if (stomp) {
        raven.dead = true;
        applyScore(40);
        player.vy = -300;
      } else {
        triggerGameOver('fail_raven');
      }
    }
  }

  for (const flybug of flybugs) {
    if (!flybug || flybug.dead) continue;
    flybug.phase += dt * 8.2;
    const swarmBob = Math.sin(flybug.phase * 1.9) * 10;
    const swarmSway = Math.cos(flybug.phase * 1.1) * 16;
    flybug.x += flybug.vx * flybug.direction * dt;
    if (flybug.x <= flybug.leftBound) {
      flybug.x = flybug.leftBound;
      flybug.direction = 1;
    } else if (flybug.x >= flybug.rightBound) {
      flybug.x = flybug.rightBound;
      flybug.direction = -1;
    }
    flybug.y = flybug.baseY + flybug.verticalBias + Math.sin(flybug.phase) * flybug.amp + swarmBob * 0.4;
    flybug.x += (swarmSway + flybug.swarmOffset) * dt;

    if (rectsOverlap(player.x, player.y, player.w, player.h, flybug.x, flybug.y, flybug.w, flybug.h)) {
      const stomp = player.vy > 30 && player.y + player.h - 6 <= flybug.y + 8;
      if (stomp) {
        flybug.dead = true;
        applyScore(45);
        player.vy = -310;
      } else {
        triggerGameOver('fail_flybug');
      }
    }
  }

  for (const trap of spikeTraps) {
    if (rectsOverlap(player.x, player.y, player.w, player.h, trap.x, trap.y, trap.w, trap.h)) {
      triggerGameOver('fail_trap');
      return;
    }
  }

  for (const trap of netTraps) {
    if (!trap.active) continue;
    if (rectsOverlap(player.x, player.y, player.w, player.h, trap.x, trap.y, trap.w, trap.h)) {
      trap.active = false;
      player.vx *= 0.5;
      lockHintTimer = 0.8;
    }
  }
}

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// ─── DRAW HELPERS ────────────────────────────────────────────────────────────
function drawBackground() {
  const theme = currentTheme();
  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, theme.skyTop);
  grad.addColorStop(1, theme.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Clouds with 40% parallax
  for (const cl of CLOUDS) {
    const sx = cl.x - cameraX * 0.4;
    if (sx + cl.w < 0 || sx > CANVAS_W) continue;
    drawCloudShape(sx, cl.y, cl.w, cl.h);
  }
}

function drawCloudShape(x, y, w, h) {
  const theme = currentTheme();
  const img = spriteAssets ? animFrame(spriteAssets.cloud, 1.5, (x + y) * 0.01) : null;
  if (!img) {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.28, y + h * 0.6,  w * 0.28, h * 0.45, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.55, y + h * 0.42, w * 0.32, h * 0.5,  0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.78, y + h * 0.62, w * 0.24, h * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  drawThemedImage(img, x, y, w, h, theme.worldFilter);
}

function drawTile(sx, sy, row) {
  const theme = currentTheme();
  const img = spriteAssets ? (row >= 11 ? spriteAssets.tileGround : spriteAssets.tilePlatform) : null;
  if (img) {
    drawThemedImage(img, sx, sy, TILE, TILE, theme.worldFilter);
    return;
  }

  if (row >= 11) {
    ctx.fillStyle = '#7a4e2d';
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.fillStyle = '#5c3a1e';
    ctx.fillRect(sx, sy + TILE - 2, TILE, 2);
    if (row === 11) {
      ctx.fillStyle = '#3a7d44';
      ctx.fillRect(sx, sy, TILE, 7);
      ctx.fillStyle = '#4caf50';
      ctx.fillRect(sx, sy, TILE, 4);
    }
    return;
  }

  ctx.fillStyle = '#7a5230';
  ctx.fillRect(sx, sy, TILE, TILE);
  ctx.fillStyle = '#8b6340';
  ctx.fillRect(sx, sy,     TILE, 3);
  ctx.fillRect(sx, sy + 6, TILE, 2);
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(sx, sy + TILE - 3, TILE, 3);
}

function drawPlayer() {
  const sx = Math.floor(player.x - cameraX);
  const sy = Math.floor(player.y);
  const w  = player.w;
  const h  = player.h;
  const img = spriteAssets ? animFrame(spriteAssets.player, 7, 0.1) : null;
  if (!img) {
    ctx.fillStyle = '#43a047';
    ctx.fillRect(sx + 3, sy + 5, w - 6, h - 5);
    return;
  }

  ctx.save();
  if (player.facing < 0) {
    ctx.translate(sx + w, sy);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, w, h);
  } else {
    ctx.drawImage(img, sx, sy, w, h);
  }
  ctx.restore();
}

function drawCoin(coin) {
  const theme = currentTheme();
  const sx = coin.x - cameraX;
  const img = spriteAssets ? animFrame(spriteAssets.coin, 5, sx * 0.01) : null;
  if (!img) {
    ctx.fillStyle = '#fdd835';
    ctx.beginPath();
    ctx.arc(sx, coin.y, COIN_R, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  drawThemedImage(img, sx - 10, coin.y - 10, 20, 20, theme.collectibleFilter);
}

function drawFood(food) {
  const theme = currentTheme();
  const sx = food.x - cameraX;
  const img = spriteAssets ? animFrame(spriteAssets.food, 4, sx * 0.02) : null;
  if (!img) {
    ctx.fillStyle = '#ff7043';
    ctx.beginPath();
    ctx.ellipse(sx, food.y, FOOD_R, FOOD_R * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  drawThemedImage(img, sx - 10, food.y - 10, 20, 20, theme.collectibleFilter);
}

function drawKey() {
  const theme = currentTheme();
  if (!keyItem || keyCollected) return;
  const sx = keyItem.x - cameraX;
  const img = spriteAssets ? animFrame(spriteAssets.key, 3, sx * 0.01) : null;
  if (img) {
    drawThemedImage(img, sx - 12, keyItem.y - 9, 24, 18, theme.collectibleFilter);
    return;
  }
  ctx.fillStyle = '#fdd835';
  ctx.beginPath();
  ctx.arc(sx, keyItem.y, KEY_R, 0, Math.PI * 2);
  ctx.fill();
}

function drawGoldi() {
  const theme = currentTheme();
  if (!goldiFollower) return;
  const sx = Math.floor(goldiFollower.x - cameraX);
  const sy = Math.floor(goldiFollower.y + Math.sin(Date.now() / 180) * 1.8);
  const img = spriteAssets ? animFrame(spriteAssets.goldi, 4, 0.2) : null;
  if (img) {
    drawThemedImage(img, sx - 10, sy - 8, 24, 24, theme.collectibleFilter);
    return;
  }
  ctx.fillStyle = '#fdd835';
  ctx.fillRect(sx - 6, sy - 6, 12, 12);
}

function drawGoalObject(goal) {
  const theme = currentTheme();
  if (!goal) return;
  const sx = Math.floor(goal.x - cameraX);
  const sy = goal.y;
  const w  = goal.w;
  const h  = goal.h;
  const bodyTop = sy + Math.floor(h * 0.38);
  const goalKind = goal.kind || 'home';
  const assetSet = goalKind === 'gate' ? spriteAssets.gate : goalKind === 'cage' ? spriteAssets.cage : spriteAssets.home;
  const img = spriteAssets ? animFrame(assetSet, 2.2, 0.25) : null;
  if (img) drawThemedImage(img, sx, sy, w, h, theme.goalFilter);

  if (!goalUnlocked) {
    ctx.fillStyle = 'rgba(20, 20, 20, 0.5)';
    ctx.fillRect(sx + 6, bodyTop + 6, w - 12, h - 18);
    ctx.strokeStyle = '#cfd8dc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx + 8, bodyTop + 14);
    ctx.lineTo(sx + w - 8, bodyTop + h - 12);
    ctx.moveTo(sx + w - 8, bodyTop + 14);
    ctx.lineTo(sx + 8, bodyTop + h - 12);
    ctx.stroke();
  }
}

function drawBirdhouse() {
  drawGoalObject(birdhouse);
}

function drawEnemySprite(enemy) {
  const theme = currentTheme();
  const sx = Math.floor(enemy.x - cameraX);
  const sy = Math.floor(enemy.y);
  if (enemy.type === 'beetle') {
    const img = spriteAssets ? animFrame(spriteAssets.beetle, 6, enemy.x * 0.02) : null;
    if (img) {
      drawThemedImage(img, sx, sy, enemy.w, enemy.h, theme.enemyFilter);
      return;
    }
  }
  if (enemy.type === 'raven') {
    const img = spriteAssets ? animFrame(spriteAssets.raven, 6, enemy.x * 0.02) : null;
    if (img) {
      drawThemedImage(img, sx, sy, enemy.w, enemy.h, theme.enemyFilter);
      if (enemy.mode === 'prepare') {
        const pulse = 0.65 + Math.sin(Date.now() / 55) * 0.35;
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(sx + enemy.w / 2, sy - 6, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('!', sx + enemy.w / 2, sy - 14);
        ctx.restore();
      }
      return;
    }
  }
  if (enemy.type === 'flybug') {
    const img = spriteAssets ? animFrame(spriteAssets.flybug, 7, enemy.x * 0.02) : null;
    if (img) {
      drawThemedImage(img, sx, sy, enemy.w, enemy.h, theme.enemyFilter);
      return;
    }
  }
}

function drawEnemies() {
  for (const beetle of beetles) {
    if (!beetle || beetle.dead) continue;
    drawEnemySprite(beetle);
  }
  for (const raven of ravens) {
    if (!raven || raven.dead) continue;
    drawEnemySprite(raven);
  }
  for (const flybug of flybugs) {
    if (!flybug || flybug.dead) continue;
    drawEnemySprite(flybug);
  }
}

function drawTraps() {
  const theme = currentTheme();
  for (const trap of spikeTraps) {
    const sx = trap.x - cameraX;
    const img = spriteAssets ? animFrame(spriteAssets.spike, 5, trap.x * 0.02) : null;
    if (img) {
      drawThemedImage(img, sx, trap.y - 2, trap.w, trap.h + 2, theme.hazardFilter);
      continue;
    }
    ctx.fillStyle = '#9e9e9e';
    ctx.beginPath();
    ctx.moveTo(sx, trap.y + trap.h);
    ctx.lineTo(sx + trap.w / 2, trap.y);
    ctx.lineTo(sx + trap.w, trap.y + trap.h);
    ctx.closePath();
    ctx.fill();
  }
  for (const trap of netTraps) {
    if (!trap.active) continue;
    const sx = trap.x - cameraX;
    const img = spriteAssets ? animFrame(spriteAssets.net, 3, trap.x * 0.01) : null;
    if (img) {
      ctx.globalAlpha = 0.9;
      drawThemedImage(img, sx, trap.y, trap.w, trap.h, theme.hazardFilter);
      ctx.globalAlpha = 1;
      continue;
    }
    ctx.strokeStyle = 'rgba(220, 220, 220, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx, trap.y, trap.w, trap.h);
    ctx.beginPath();
    ctx.moveTo(sx, trap.y);
    ctx.lineTo(sx + trap.w, trap.y + trap.h);
    ctx.moveTo(sx + trap.w, trap.y);
    ctx.lineTo(sx, trap.y + trap.h);
    ctx.stroke();
  }
}

function drawHUD() {
  const theme = currentTheme();
  // Dark semi-transparent bar
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(0, 0, CANVAS_W, 54);

  ctx.textBaseline = 'middle';

  // Score (left)
  ctx.fillStyle = '#fdd835';
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(t('hud_score', { value: score }), 10, 17);
  ctx.fillStyle = '#b3e5fc';
  ctx.font = '6px "Press Start 2P", monospace';
  ctx.fillText(t('hud_xp', { value: xp }), 10, 31);
  ctx.fillStyle = '#ffcc80';
  ctx.fillText(t('hud_lives', { value: lives }), 10, 44);

  // Timer (left below)
  ctx.fillStyle = roundTimer <= 15 ? '#ff8a80' : 'rgba(255,255,255,0.82)';
  ctx.font = '6px "Press Start 2P", monospace';
  ctx.fillText(t('hud_time', { value: Math.ceil(roundTimer) }), 10, 52);

  // Best score (right)
  ctx.fillStyle = '#90caf9';
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(t('hud_best', { value: bestScore }), CANVAS_W - 10, 17);
  ctx.font = '6px "Press Start 2P", monospace';
  ctx.fillStyle = '#ce93d8';
  ctx.fillText(t('hud_mode', { value: difficultyLabel(selectedDifficulty) }), CANVAS_W - 10, 31);

  // Level name (top center, below food bar)
  ctx.fillStyle = 'rgba(255,255,255,0.80)';
  ctx.font = '5px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(levelName(currentLevel), CANVAS_W / 2, 14);
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.font = '4px "Press Start 2P", monospace';
  ctx.fillText(levelObjective(currentLevel), CANVAS_W / 2, 24);

  const missionText = campaignPhase === 'return' && goldiRescued
    ? t('mission_return')
    : keyCollected
      ? t('mission_key_found')
      : t('mission_find_key');
  ctx.fillStyle = goalUnlocked ? '#a5d6a7' : theme.hudAccent;
  ctx.fillText(missionText, CANVAS_W / 2, 34);
  ctx.fillStyle = theme.hudAccent;
  ctx.font = '5px "Press Start 2P", monospace';
  ctx.fillText(t('hud_relics', { current: collectedFood, target: requiredRelicsTarget }), CANVAS_W / 2, 46);

  // Gelbi icon (small yellow budgie) in the top-right corner as rescue reminder
  const gx = CANVAS_W - 52;
  const gy = 4;
  const gelbi = spriteAssets ? animFrame(spriteAssets.gelbi, 3) : null;
  if (gelbi) {
    ctx.drawImage(gelbi, gx, gy, 14, 12);
  } else {
    ctx.fillStyle = '#fdd835';
    ctx.fillRect(gx + 3, gy + 2, 8, 9);
    ctx.fillRect(gx + 4, gy,     6, 5);
    ctx.fillStyle = '#111';
    ctx.fillRect(gx + 7, gy + 1, 2, 2);
  }
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
  ctx.fillText(t('menu_controls'), CANVAS_W / 2, 278);
  ctx.fillText(t('menu_campaign'), CANVAS_W / 2, 300);
  ctx.fillText(t('menu_difficulty'), CANVAS_W / 2, 320);
  ctx.fillText(t('menu_current', { value: difficultyLabel(selectedDifficulty) }), CANVAS_W / 2, 338);
  ctx.fillText(t('lang_short'), CANVAS_W - 24, 24);

  // Press Enter (blinking)
  if (Math.floor(Date.now() / 550) % 2 === 0) {
    ctx.fillStyle = '#fdd835';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(t('menu_press_enter'), CANVAS_W / 2, 345);
  }
}

function drawIntroScreen() {
  // Black background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // ── Cage pixel art ──────────────────────────────────────────────────────────
  const cageX = CANVAS_W / 2 - 36;
  const cageY = 60;
  const cageW = 72;
  const cageH = 80;

  // Cage bars (grey)
  ctx.fillStyle = '#aaa';
  ctx.fillRect(cageX, cageY, cageW, 4);          // top bar
  ctx.fillRect(cageX, cageY + cageH - 4, cageW, 4); // bottom bar
  ctx.fillRect(cageX, cageY, 4, cageH);           // left side
  ctx.fillRect(cageX + cageW - 4, cageY, 4, cageH); // right side
  // Vertical bars
  for (let i = 1; i < 5; i++) {
    ctx.fillRect(cageX + Math.round(i * cageW / 5), cageY + 4, 3, cageH - 8);
  }

  // Yellow budgie (Gelbi) inside cage
  ctx.fillStyle = '#fdd835';
  ctx.fillRect(cageX + cageW / 2 - 10, cageY + cageH / 2 - 10, 20, 22); // body
  ctx.fillRect(cageX + cageW / 2 - 6,  cageY + cageH / 2 - 20, 14, 14); // head
  // Eye
  ctx.fillStyle = '#111';
  ctx.fillRect(cageX + cageW / 2 + 2, cageY + cageH / 2 - 17, 4, 4);

  // ── Story text ───────────────────────────────────────────────────────────────
  ctx.fillStyle = '#fff';
  ctx.font = '9px "Press Start 2P", monospace';
  ctx.fillText(t('intro_story_1'), CANVAS_W / 2, 185);
  ctx.fillText(t('intro_story_2'), CANVAS_W / 2, 208);

  ctx.fillStyle = '#fdd835';
  ctx.font = '11px "Press Start 2P", monospace';
  ctx.fillText(t('intro_story_3'), CANVAS_W / 2, 240);

  // ── Gelbi reminder icon + label ──────────────────────────────────────────────
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillText(t('intro_hint_1'), CANVAS_W / 2, 290);
  ctx.fillText(t('intro_hint_2'), CANVAS_W / 2, 312);
  ctx.fillText(t('lang_short'), CANVAS_W - 24, 24);

  // ── ENTER prompt (blinking) ──────────────────────────────────────────────────
  if (Math.floor(Date.now() / 550) % 2 === 0) {
    ctx.fillStyle = '#fdd835';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(t('menu_press_enter'), CANVAS_W / 2, 370);
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
  ctx.fillText(t('gameover_title'), CANVAS_W / 2, 175);

  ctx.shadowBlur = 0;

  ctx.fillStyle = '#fff';
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.fillText(t('gameover_score', { value: score }), CANVAS_W / 2, 225);
  ctx.fillText(t('gameover_best', { value: bestScore }), CANVAS_W / 2, 255);

  if (lastFailReason) {
    ctx.fillStyle = '#ffe082';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText(t(lastFailReason), CANVAS_W / 2, 285);
  }

  if (Math.floor(Date.now() / 550) % 2 === 0) {
    ctx.fillStyle = '#fdd835';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText(t('gameover_retry'), CANVAS_W / 2, 315);
  }
}

function drawPauseScreen() {
  drawGame();
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffe082';
  ctx.font = '16px "Press Start 2P", monospace';
  ctx.fillText(t('pause_title'), CANVAS_W / 2, 188);
  ctx.fillStyle = '#fff';
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.fillText(t('pause_resume'), CANVAS_W / 2, 226);
  ctx.fillText(t('pause_restart'), CANVAS_W / 2, 246);
}

function drawWinScreen() {
  // Colorful sky
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#ff9800');
  grad.addColorStop(0.5, '#ffeb3b');
  grad.addColorStop(1, '#a8d8f0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Scattered confetti dots
  const colours = ['#f44336','#e91e63','#9c27b0','#2196f3','#4caf50','#ffd600'];
  const seed    = Math.floor(Date.now() / 100);
  for (let i = 0; i < 40; i++) {
    const px = ((i * 397 + seed * 3) % CANVAS_W);
    const py = ((i * 211 + seed * 7) % CANVAS_H);
    ctx.fillStyle = colours[i % colours.length];
    ctx.fillRect(px, py, 6, 6);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 14;

  ctx.fillStyle = '#fdd835';
  ctx.font = '16px "Press Start 2P", monospace';
  ctx.fillText(t('win_title'), CANVAS_W / 2, 155);

  ctx.shadowBlur = 0;

  // Draw a small birdhouse decoration
  const bhx = CANVAS_W / 2 - 32, bhy = 185;
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.moveTo(bhx - 6, bhy + 24); ctx.lineTo(bhx + 32, bhy); ctx.lineTo(bhx + 70, bhy + 24);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8b5e3c';
  ctx.fillRect(bhx, bhy + 24, 64, 42);
  ctx.fillStyle = '#1a0a00';
  ctx.beginPath(); ctx.arc(bhx + 32, bhy + 40, 9, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.fillText(t('win_line'), CANVAS_W / 2, 240);
  ctx.fillText(t('win_final_score', { value: score }), CANVAS_W / 2, 275);
  ctx.fillText(t('win_best_score', { value: bestScore }), CANVAS_W / 2, 302);

  if (Math.floor(Date.now() / 550) % 2 === 0) {
    ctx.fillStyle = '#4caf50';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText(t('win_retry'), CANVAS_W / 2, 355);
  }
}

function drawLoadingScreen() {
  ctx.fillStyle = '#0f1720';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#fdd835';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '12px "Press Start 2P", monospace';
  ctx.fillText(t('loading_assets'), CANVAS_W / 2, CANVAS_H / 2 - 8);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillText(t('loading_wait'), CANVAS_W / 2, CANVAS_H / 2 + 18);
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

  // Birdhouse
  if (birdhouse) drawBirdhouse();
  if (currentLevel && currentLevel.goldiCage && campaignPhase === 'return' && currentLevel.goldiCage !== birdhouse) {
    drawGoalObject(currentLevel.goldiCage);
  }

  drawKey();

  // Foods
  for (const food of foods)
    if (!food.collected) drawFood(food);

  // Coins
  for (const coin of coins)
    if (!coin.collected) drawCoin(coin);

  drawTraps();
  drawEnemies();

  // Player
  drawPlayer();

  if (goldiRescued) drawGoldi();

  if (!goalUnlocked && lockHintTimer > 0) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(CANVAS_W / 2 - 210, 56, 420, 24);
    ctx.fillStyle = '#ffe082';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(keyCollected ? t('lock_key_found') : t('lock_goal_locked'), CANVAS_W / 2, 69);
  }

  // HUD (on top of everything)
  drawHUD();
}

// ─── GAME LOOP ───────────────────────────────────────────────────────────────
let lastTime = 0;

function loop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // cap at 50 ms
  lastTime = timestamp;

  if (!assetsReady) {
    drawLoadingScreen();
    requestAnimationFrame(loop);
    return;
  }

  switch (gameState) {
    case 'menu':
      drawMenuScreen();
      break;
    case 'intro':
      drawIntroScreen();
      break;
    case 'playing':
      update(dt);
      drawGame();
      break;
    case 'paused':
      drawPauseScreen();
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
loadBestScore();
loadSvgAssets()
  .then(() => {
    assetsReady = true;
    requestAnimationFrame(loop);
  })
  .catch(() => {
    assetsReady = true;
    requestAnimationFrame(loop);
  });
