# AGENTS.md — 随手翻译 (SuiShouFanYi)

Windows desktop translation app built on **Tauri 2.0**: React 18 + TypeScript + Tailwind + Zustand frontend (WebView), Rust backend (system ops, Baidu Translate API calls, SQLite). All UI text and docs are in Chinese. `README.md` has a full structure map and architecture diagrams — read it before non-trivial work.

## Commands

```bash
npm install          # frontend deps (Node >= 18, Rust >= 1.70, Tauri 2 prerequisites)
npm run tauri dev    # full desktop dev app (first run compiles Rust — slow)
npm run dev          # Vite frontend only, port 1420 (strictPort; tauri.conf.json devUrl expects it)
npm run build        # typecheck (tsc, strict) + vite build — use to verify TS changes
npm run tauri build  # release build; NSIS installer at src-tauri/target/release/bundle/nsis/
cargo check          # in src-tauri/ — verify Rust changes without full build
```

No test suite and no linter are configured. Verification = `npm run build` + `cargo check`.

## Architecture & layer rules

- **IPC boundary**: frontend must never call `invoke()` directly. All backend calls go through wrappers in `src/lib/invoke.ts`. Adding a command = Rust `#[tauri::command]` in `src-tauri/src/commands/` → register in `generate_handler!` (`src-tauri/src/lib.rs`) → typed wrapper in `invoke.ts`.
- **Rust layering**: `commands/` (IPC entry, error mapping) → `services/` (`baidu_api.rs` HTTP, `db.rs` SQLite + `AppState` managed via `.manage()`) → `utils/sign.rs` (Baidu MD5 signing: `appid+q+salt+secret_key`).
- **Frontend layering**: Zustand stores in `src/store/` (settings / translate / history / toast), logic in `src/hooks/` (useTranslate has 500ms debounce + auto language-swap for zh↔en), UI in `src/components/` grouped by feature (layout / translate / settings / history / common). Types in `src/types/`.
- **Capabilities**: any new Tauri plugin API or window permission must be added to `src-tauri/capabilities/default.json` (scoped to window `"main"`), or invoke fails at runtime.

## Conventions

- Rust commands return `Result<T, String>`; frontend errors surface via the toast store.
- Tauri 2 maps Rust snake_case command args to camelCase on the JS side (e.g. `source_text` → `sourceText` in `add_history`).
- Styling: Tailwind utility classes; icons from `lucide-react`; animation via `framer-motion`. Match existing component style (small single-purpose components, one-line wrappers in `invoke.ts`).

## Gotchas

- **Frameless transparent window**: `decorations: false, transparent: true` in tauri.conf.json. Min/max/close go through custom commands; dragging uses the native `data-tauri-drag-region` on the titlebar (`src/components/layout/TitleBar.tsx`).
- **Secrets in plaintext**: Baidu AppID/secret_key live in the SQLite `config` table. DB path is `dirs_next::data_dir()/sui-shou-fanyi/data.db` (`%APPDATA%\sui-shou-fanyi\data.db`). Never log these or commit `*.db` / `config.json` (both gitignored).
- **History cap**: `translations` table auto-prunes to 500 rows.
- **Single instance**: `tauri-plugin-single-instance` focuses the existing window on second launch.
- **Tray + global shortcut**: tray menu lives in `src-tauri/src/lib.rs` setup. The global shortcut (default `Alt+T`) is registered in Rust at startup from the SQLite `config` table (`window::register_if_unset`, background retry 10s × 5 on conflict); all wake-up paths share `show_main_window` (show + unminimize + focus). The frontend (`SettingsPanel` effect on `store.shortcut`, mirrored in localStorage) calls `window::register_shortcut`, which only unregisters the old key after the new one registers successfully, then persists it to the `config` table. Current shortcut is tracked in the `CurrentShortcut` managed state.
- **Windows-only packaging**: bundle target is NSIS only; building requires WebView2 + MSVC Build Tools.
- `releases/` holds built installers and is gitignored (distributed via GitHub Releases); don't commit binaries there.
