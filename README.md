# Aam Saltman Must Die

*a game i am making with claude cuz i am bored*

A hand-aimed bullet-hell boss rush and AI satire. Fight through nine flagship
products of GHAT CPT (The CAPTCHA, The Content Farm, The GPU Cluster, …) and
take down their founder, **Aam Saltman**. No autopilot, no copilot.

## Two ways to play

- **Multi-window** (desktop app, default): one see-through overlay covers your
  monitor. You, every enemy group and the boss each get their own window
  (`human.exe`, `spambot.exe ×3`, `aam_saltman.exe`). The arena keeps going
  between the windows: bullets fly through the gaps, where you can't see them.
  When Aam Saltman arrives, your window cracks, shatters into shards across the
  desktop, his window slams in, and yours rebuilds.
- **Classic**: the whole game in one 960×640 window (also what the browser
  version uses). Aam's entrance shatters the game window instead.

Switch in **Settings → Display**. Settings also has **Monitor**, **Clear desktop
on run** (minimizes other windows when a run starts, Windows only) and
**updates**.

## Download

[Releases → latest](../../releases/latest)

- `AamSaltmanMustDie-Setup-vX.Y.Z-win-x64.exe` — installer. Updates itself
  automatically from GitHub Releases (never mid-run: use **Restart & update** on
  the title screen or in Settings).
- `AamSaltmanMustDie-vX.Y.Z-win-x64.zip` — portable. Extract and run
  `Aam Saltman Must Die.exe`. Does not self-update.

The app is unsigned, so Windows SmartScreen may warn on first launch: click
**More info → Run anyway**.

You can also open `index.html` in a browser to play Classic mode.

## Controls

| Input | Action |
|---|---|
| WASD / arrows | Move |
| Mouse | Aim · hold left click to fire |
| Space / Shift | Dash |
| Q / E / right-click | Pulse (when charged) |
| 1 / 2 / 3 | Pick a card · right-click a card to banish it |
| Esc / P | Pause (M quits to menu from pause) |
| F | Fullscreen (Classic) |

Gamepad and touch are supported too.

## Develop

Needs Node 22+.

```bash
npm install
npm start               # run the desktop app
npm test                # headless game tests
npm run test:electron   # drives the real app, saves screenshots to tests/shots/
npm run build:win       # dist/: installer, portable zip, latest.yml, blockmap
```

The whole game is `index.html` (one self-contained file). `electron/` is the
desktop shell: `main.js` (window, IPC), `preload.js` (the only bridge the page
gets, exposed as `window.AAM`), `displays.js` (monitor choice) and `updater.js`
(GitHub Releases updates for the installed build).

### Releasing

Bump `version` in `package.json` and push to `main`. GitHub Actions
(`.github/workflows/build.yml`) runs the tests, builds Windows and publishes a
`vX.Y.Z` release with the installer, its `.blockmap`, `latest.yml` and the
portable zip. Those files together are the auto-update feed, so publish them
together and don't rename the installer.
