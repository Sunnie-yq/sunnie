# Sunnie

A small, quiet desktop todo companion, built with Electron and plain HTML/CSS/JavaScript. No account, server, or external fonts are required.

## Download for Apple Silicon (M1/M2/M3/M4)

Download [Sunnie for Apple Silicon](https://github.com/Sunnie-yq/sunnie/releases/download/v1.0.0/Sunnie-1.0.0-arm64-mac.zip) (macOS 12 or newer). Double-click the ZIP, drag `Sunnie.app` into Applications, then open it. Node.js and Terminal are not needed for this packaged app.

This initial build is unsigned and not notarized, and has not been tested on a physical Mac. macOS may block first launch; inspect the message in System Settings → Privacy & Security. If it offers Open Anyway for Sunnie, use it only if you trust this download. If macOS reports that the app is damaged or cannot run, report the exact message; do not disable system security.

## Run on macOS

Install Node.js 22 or 24, then run in this checkout:

```sh
npm ci
npm start
```

Hover over the translucent sun to expand the list. Move away to collapse after a short delay, or press Escape. Drag the top bar to move the widget; its position is saved and clamped to the available display. The transparent, frameless window stays above ordinary application windows, appears across macOS Spaces, and hides from the Dock and taskbar. The × in the top bar quits the app. OS security dialogs and exclusive full-screen apps may appear above it.

Type in **Add new todo**, select a category and optional due date, then press Enter. Categories fold independently. Check a task to complete it; uncheck to restore its prior status. Hover a task to reveal its status selector and delete button. Drag tasks to reorder their priority; categories remain fixed. Four tabs filter tasks by To-do, Pending, Completed and Cancelled. Tasks use localStorage in Electron's application profile, separate from ordinary browser storage. Deleting a task is immediate. Data is local to this device; there is no cloud or calendar synchronization.

## Verify and package

```sh
npm test
npm run pack:mac
npm run dist:mac
```

Build macOS packages on a Mac. Artifacts are written to `dist/`. Distribution to other users requires your own Apple signing and notarization configuration; these scripts do not configure credentials. Desktop behavior on macOS must be checked on a real Mac; Linux headless tests cannot establish Spaces, glass compositing, or window stacking behavior there.

The renderer can also be served from `src/` with a static HTTP server for UI development. Desktop positioning and always-on-top require Electron. No dependencies are loaded from a CDN. macOS calendar integration is intentionally deferred: a future implementation needs EventKit permission handling and a native bridge.

## Development

- `src/main.cjs`: transparent desktop window, position persistence, restricted IPC.
- `src/preload.cjs`: minimal context-isolated desktop bridge.
- `src/app.mjs`, `src/style.css`, `src/index.html`: task interface.
- `src/model.mjs`: validation, status restoration, task ordering.
- `test/model.test.mjs`: data behavior tests.

Keep using this isolated checkout; no additional Git worktree is needed. On a managed cloud machine, preserve its proxy and CA settings. With Node.js 24, `NODE_USE_ENV_PROXY=1 npm ci` enables proxy support for Electron's binary download while retaining checksum and TLS verification.
