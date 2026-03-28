# budgie-platformer

[![Deploy to GitHub Pages](https://github.com/Leon-Kuehn/budgie-platformer/actions/workflows/deploy.yml/badge.svg)](https://github.com/Leon-Kuehn/budgie-platformer/actions/workflows/deploy.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/Leon-Kuehn/budgie-platformer)](https://github.com/Leon-Kuehn/budgie-platformer/issues)
[![Milestone](https://img.shields.io/github/milestones/progress/Leon-Kuehn/budgie-platformer/1)](https://github.com/Leon-Kuehn/budgie-platformer/milestone/1)

A fun 2D browser platformer featuring a budgie (parakeet) that collects coins and food – built with Vanilla JS + HTML5 Canvas. No frameworks, no dependencies.

## Play it live

https://leon-kuehn.github.io/budgie-platformer/

## How to play

| Key | Action |
|-----|--------|
| Arrow Left / Right | Move the budgie |
| Arrow Up / Space | Jump / Fly |
| R | Restart after Game Over |

- Collect coins to increase your score
- Pick up food to refill the food meter
- If the food meter runs out, it's Game Over
- Reach the birdhouse at the end to win!

## Run locally

No build step needed:

```bash
git clone https://github.com/Leon-Kuehn/budgie-platformer.git
cd budgie-platformer
# Open index.html in your browser
open index.html
```

## Tech stack

- Vanilla JavaScript (ES6+)
- HTML5 Canvas API
- CSS3
- GitHub Actions (CI/CD + Pages deployment)

## Project structure

```
budgie-platformer/
├── index.html       # Entry point
├── styles.css       # Game UI styling
├── game.js          # Game logic (loop, physics, entities)
├── assets/          # Sprites & sounds
└── .github/
    ├── workflows/   # GitHub Actions
    └── ISSUE_TEMPLATE/
```

## Roadmap (v1.0)

- [x] Project setup & repo structure
- [ ] Player movement & physics
- [ ] Tile-based level design
- [ ] Coin collection & scoring
- [ ] Food meter mechanic
- [ ] HUD (score, food, lives)
- [ ] Game Over & win screen
- [ ] GitHub Pages live deployment

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License – see [LICENSE](LICENSE) for details.
