# budgie-platformer

[![Deploy to GitHub Pages](https://github.com/Leon-Kuehn/budgie-platformer/actions/workflows/deploy.yml/badge.svg)](https://github.com/Leon-Kuehn/budgie-platformer/actions/workflows/deploy.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/Leon-Kuehn/budgie-platformer)](https://github.com/Leon-Kuehn/budgie-platformer/issues)
[![Milestone](https://img.shields.io/github/milestones/progress/Leon-Kuehn/budgie-platformer/1)](https://github.com/Leon-Kuehn/budgie-platformer/milestone/1)

A scalable 2D browser platformer featuring a budgie (parakeet) with campaign gameplay, a full custom level editor, and animated SVG-based game objects. The runtime is powered by Phaser 3 to support larger feature growth.

## Play it live

https://leon-kuehn.github.io/budgie-platformer/

## How to play

| Key | Action |
|-----|--------|
| Arrow Left / Right or A / D | Move budgie |
| Arrow Up / W / Space | Jump / Flutter |
| Enter | Start campaign / playtest in editor |
| E | Open Level Editor |
| R | Restart (play, game over, win) |

## Campaign

1. Level 1 - Der Garten: movement, pickup flow, readable pacing
2. Level 2 - Der Wald: beetles, spikes, nets
3. Level 3 - Das Jagdhaus: ravens, minions, pressure traps, locked goal objective

Level 3 goal unlock rule:

- collect all rescue tokens
- defeat all minion guards

## Custom Level Editor

The game includes an in-game editor that allows full level authoring and immediate playtesting.

Main flow:

1. Press E in menu or gameplay
2. Place/edit objects on the grid
3. Press Enter to playtest
4. Save/load to local storage or export/import JSON

Editor controls:

- Arrow keys: move editor cursor
- Left click: place current tool
- Right click: erase at cell
- [ / ]: cycle tool
- 1..0: direct tool shortcuts
- Space: place at cursor
- Delete/Backspace: erase at cursor
- Enter: playtest current custom level
- Esc: back to menu
- S: save editor level (local storage)
- L: load editor level (local storage)
- X: export JSON
- I: import JSON
- T: cycle theme
- K: toggle goal lock
- N: change level name
- O: change objective text
- C: change level width (columns)
- G: set goal label/size
- J: JSON edit (selected object / full level)

Tools supported:

- tile, erase
- coin, food, rescue token
- beetle, raven, minion (with patrol/config via JSON)
- spike, net, pressure trap
- spawn, goal

Why JSON is important:

- every numeric property can be tuned precisely
- patrol ranges, speeds, cooldowns, hp, projectile speed, lock mode, goal dimensions, etc.

## Performance and architecture

Implemented optimization structure:

- Phaser render pipeline with pixel-art settings
- prerendered tile layer via RenderTexture cache
- visibility culling for entities/items/traps/projectiles
- normalized level loading with clamping to prevent unstable data
- reusable animation definitions across all object classes

## Framework decision

This project is now migrated to Phaser 3 because it provides the best practical path for a larger browser game:

- strong scene/update/render/input foundation
- cleaner extensibility than maintaining ad-hoc custom loops
- better maintainability when systems and content scale

## Run locally

No build step needed:

```bash
git clone https://github.com/Leon-Kuehn/budgie-platformer.git
cd budgie-platformer
open index.html
```

## Tech stack

- Phaser 3
- JavaScript (ES6+)
- Animated SVG frame assets
- CSS3
- GitHub Actions (CI/CD + Pages deployment)

## Project structure

```text
budgie-platformer/
├── index.html       # Entry point (+ Phaser CDN)
├── styles.css       # Game UI styling
├── game.js          # Phaser scene, campaign + editor, SVG assets, runtime systems
└── .github/         # CI/CD and templates
```

## Contributing

See CONTRIBUTING.md for guidelines.

## License

MIT License - see LICENSE for details.
