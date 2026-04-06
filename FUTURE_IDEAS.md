# Future Ideas and Backlog

This file collects product and tech ideas that are intentionally not implemented yet.

## Local LLM for Level Generation (Idea Only)

Goal:
- generate playable level drafts from text prompts
- reduce manual editor work for early prototyping
- keep final curation in the in-game editor

Possible scope for a future iteration:
- input prompt example: "forest level, medium difficulty, 3 jumps, 2 minions, one locked goal"
- model outputs strict level JSON matching the existing schema
- app validates and clamps the generated values before import
- one-click import into editor with optional auto-playtest checklist

Candidate architecture:
- local inference service (separate process) with REST endpoint
- game/editor sends prompt plus constraints (cols, max enemy count, required collectibles)
- service returns JSON only, no prose
- optional seed parameter for deterministic generation

Safety and quality guards:
- hard constraints on traps, gap widths, spawn safety distance, and goal reachability
- fallback validator rejects invalid geometry and non-reachable goals
- difficulty scoring pass (enemy density, timing hazards, recovery pickups)

Potential model/runtime options (to evaluate later):
- Ollama with a coding-oriented model
- llama.cpp for lightweight local execution
- structured output via JSON schema and repair pass

Open questions:
- minimum hardware target for smooth local generation
- acceptable generation latency target in editor workflow
- whether reachability check should be deterministic simulation or heuristic scoring

## Additional Future Tasks

- Add automated level validation tests for custom JSON imports.
- Add optional ghost replay for speedrun and level balancing.
- Add per-level analytics overlay (deaths by tile, trap heatmap).
- Add a "recommended fixes" panel for invalid custom levels.
- Add gamepad support and remappable controls.
- Add sound and music layers with per-scene mixing.
