<a id="top-zh"></a>

# 随手翻译 (SuiShouFanYi)

<p align="center"><b>中文</b> · <a href="#top-en">English</a></p>

一个基于 **Tauri 2.0** 构建的轻量级 Windows 桌面翻译工具，使用百度翻译 API，支持多语言互译。输入文本后自动翻译，同时提供剪贴板监听、翻译历史、全局快捷键等实用功能。

安装体积约 3.7 MB（对比同类 Electron 应用通常上百 MB），需联网和填写百度翻译 API。

## 下载与安装

前往 [Releases 页面](https://github.com/chenruiming2024/sui-shou-fanyi/releases/latest) 下载 `SuiShouFanYi_<版本>_x64-setup.exe`，双击安装即可。

1. 安装包仅支持 **Windows x64**。
2. 系统需已安装 [WebView2 运行时](https://developer.microsoft.com/microsoft-edge/webview2/)（Windows 10 1803 之后的版本一般已随系统更新内置）。
3. 首次启动后需要在设置里填入你自己的百度翻译 App ID 与密钥。
4. 升级时直接安装新版本即可，历史记录与配置保存在 `%APPDATA%\sui-shou-fanyi\`，不会被覆盖。

## 功能特性

- **多语言翻译** — 支持中文、英文、日文、韩文、法文、德文、西班牙文互译，输入即翻译（500ms 防抖）
- **语言自动识别** — 中英互译场景下自动检测输入语言，智能交换翻译方向
- **全局快捷键** — 默认 `Alt+T` **切换**主窗口：窗口可见且处于焦点时收进托盘，否则唤起并聚焦。可在设置中自定义，组合键必须包含至少一个修饰键（Ctrl / Shift / Alt / Win）
- **系统托盘** — 关闭窗口不会退出程序，而是收进托盘；左键单击托盘图标或右键菜单「打开主界面」恢复窗口，右键「退出软件」才真正退出
- **剪贴板监听** — 开启后自动检测剪贴板中的新文本，弹出浮动气泡一键翻译
- **翻译历史** — SQLite 本地持久化，最多保存 500 条记录，支持关键词搜索、复制译文、重译、CSV 导出
- **窗口置顶** — 标题栏一键置顶，方便对照原文与译文
- **主题切换** — 亮色 / 暗色 / 跟随系统三种模式
- **文本朗读** — 原文和译文均可 TTS 朗读（自动按文本判断中/英文发音）
- **一键复制 / 互换 / 清除** — 原文与译文一键复制、源语言与目标语言互换、输入框一键清空

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | Tauri 2.0 |
| 后端语言 | Rust |
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 样式方案 | Tailwind CSS 3 |
| 状态管理 | Zustand 4 |
| 动画库 | Framer Motion |
| 图标库 | Lucide React |
| 数据库 | SQLite (rusqlite) |
| 翻译 API | 百度翻译通用翻译 API |

## 环境要求

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://www.rust-lang.org/tools/install) >= 1.70（MSVC 工具链）
- [Tauri 2.0 CLI 环境](https://v2.tauri.app/start/prerequisites/)（含 WebView2、Visual Studio Build Tools 等 Windows 依赖）

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/chenruiming2024/sui-shou-fanyi.git
cd sui-shou-fanyi
```

### 2. 安装前端依赖

```bash
npm install
```

### 3. 开发模式运行

```bash
npm run tauri dev
```

首次运行会自动下载和编译 Rust 依赖，需要一些时间。前端单独调试可用 `npm run dev`（Vite 固定监听 1420 端口，`tauri.conf.json` 的 `devUrl` 指向它）。

### 4. 构建安装包

```bash
npm run tauri build
```

构建完成后，安装包位于 `src-tauri/target/release/bundle/nsis/` 目录下，文件名中的版本号取自配置，无需手工改名。

### 5. 改动后如何验证

项目未配置测试与 lint，改动后用以下两条命令验证：

```bash
npm run build    # tsc 严格类型检查 + vite 打包
cargo check      # 在 src-tauri/ 下执行，校验 Rust 是否编译通过
```

## 使用说明

1. **配置 API**：首次使用需在设置面板中填入百度翻译 API 的 AppID 和密钥。可前往 [百度翻译开放平台](https://fanyi-api.baidu.com/) 申请通用翻译 API 服务（个人认证后高级版通用文本翻译每月有 100 万字符免费调用量）
2. **开始翻译**：在输入框输入文本，500ms 后自动翻译；也可点击底部「翻译」按钮手动触发
3. **语言自动识别**：中英互译模式下，输入中文自动切换为中→英，输入英文自动切换为英→中（已输入的文本会保留）
4. **快捷键**：默认 `Alt+T` 全局唤起窗口，可在设置中点击录制框换一个组合键。**必须搭配修饰键**，只按单个字母或 F5 会被拒绝并提示原因
5. **剪贴板监听**：在设置中开启后，复制文本会自动弹出浮动气泡，点击即可翻译
6. **历史记录**：点击标题栏的历史图标打开侧边栏，支持搜索、复制译文、重译
7. **导出数据**：在设置面板中可将翻译历史导出为 CSV 文件（导出时写入 BOM，用 Excel 打开不乱码）

## 常见问题

- **按快捷键没反应？** 大概率是被其他程序占用了。本应用启动时若注册失败会每 10 秒自动重试、最多 5 次；仍失败会在界面提示，此时到设置里换一个组合键。
- **想彻底退出程序？** 关窗口只是收进托盘，请在托盘图标上右键选择「退出软件」。
- **换电脑怎么迁移？** 复制 `%APPDATA%\sui-shou-fanyi\data.db` 到新机器同一路径即可（含历史记录与 API 配置）。
- **快捷键设成裸键后其他程序打不出这个键怎么办？** 本版已禁止保存无修饰键的组合；若你从旧版本继承了这类配置，启动时会提示「缺少修饰键」，按提示改一个带 Ctrl / Shift / Alt / Win 的组合即可。

**注意：** AppID 和密钥均保存在本地，位置为 `%APPDATA%\sui-shou-fanyi\`。SQLite 数据库 `data.db` 会存储你的 **百度翻译 appid 和 secret_key**（明文），以及翻译历史。请勿把该文件分享给他人，也不要把 `.db` 文件提交到仓库（`.gitignore` 已忽略）。

## 项目结构

```
sui-shou-fanyi/
├── index.html                          # HTML 入口
├── package.json                        # 前端依赖与脚本
├── vite.config.mjs                     # Vite 构建配置（端口 1420，strictPort）
├── tailwind.config.ts                  # Tailwind CSS 配置
├── tsconfig.json                       # TypeScript 配置
├── postcss.config.js                   # PostCSS 配置
├── LICENSE                             # MIT 许可证
├── src/                                # 前端源码（React 18 + TypeScript）
│   ├── main.tsx                        # React 入口
│   ├── App.tsx                         # 根组件（主题、Toast、窗口置顶）
│   ├── index.css                       # 全局样式
│   ├── types/
│   │   └── translate.ts                # 翻译 / 历史 / 主题类型定义
│   ├── lib/                            # 工具库
│   │   ├── invoke.ts                   #   所有 Tauri IPC 调用的类型安全封装
│   │   ├── constants.ts                #   语言列表、默认语言对、字符上限
│   │   └── speech.ts                   #   TTS 朗读（按文本自动判断中/英）
│   ├── store/                          # Zustand 状态管理
│   │   ├── settingsStore.ts            #   设置状态（主题、快捷键、开关）
│   │   ├── translateStore.ts           #   翻译状态（输入、输出、语言）
│   │   ├── historyStore.ts             #   历史记录状态
│   │   └── toastStore.ts               #   Toast 通知状态
│   ├── hooks/                          # 自定义 Hooks
│   │   ├── useTheme.ts                 #   主题切换逻辑
│   │   ├── useTranslate.ts             #   翻译逻辑（500ms 防抖 + 中英方向自动识别）
│   │   ├── useClipboard.ts             #   剪贴板轮询监听
│   │   └── useCopy.ts                  #   复制到剪贴板（统一实现）
│   └── components/                     # React 组件
│       ├── layout/                     #   布局组件
│       │   ├── TitleBar.tsx            #     自定义标题栏（拖拽、置顶、窗口控制）
│       │   ├── MainLayout.tsx          #     主布局（语言栏、输入输出、状态栏）
│       │   └── FloatingPopup.tsx       #     剪贴板检测浮动气泡
│       ├── translate/                  #   翻译组件
│       │   ├── InputArea.tsx           #     输入区域（文本框、朗读、复制、清除）
│       │   ├── OutputArea.tsx          #     输出区域（译文展示、动画）
│       │   ├── LanguageSelector.tsx    #     语言选择下拉菜单（支持左/右对齐）
│       │   └── SwapButton.tsx          #     语言互换按钮
│       ├── settings/                   #   设置组件
│       │   ├── SettingsPanel.tsx       #     设置面板（API 配置、主题、开关、导出）
│       │   └── ShortcutRecorder.tsx    #     快捷键录制器（强制要求修饰键）
│       ├── history/                    #   历史记录组件
│       │   ├── HistoryDrawer.tsx       #     历史侧边抽屉
│       │   ├── HistoryList.tsx         #     历史列表（复制、重译）
│       │   └── SearchBar.tsx           #     搜索栏
│       └── common/                     #   通用组件
│           ├── Toast.tsx               #     消息提示
│           └── Switch.tsx              #     开关控件
└── src-tauri/                          # Rust 后端源码
    ├── Cargo.toml                      # Rust 依赖配置
    ├── tauri.conf.json                 # Tauri 应用配置（窗口、打包、版本号）
    ├── build.rs                        # 构建脚本
    ├── capabilities/
    │   └── default.json                #   权限声明，作用范围限定 main 窗口
    ├── icons/                          # 应用图标
    └── src/
        ├── main.rs                     # Tauri 启动入口
        ├── lib.rs                      # 应用初始化（插件注册、托盘、启动注册快捷键、窗口事件）
        ├── commands/                   # Tauri 命令（前端 IPC 调用入口与错误映射）
        │   ├── translate.rs            #   翻译命令
        │   ├── history.rs              #   历史记录 CRUD 与 CSV 导出
        │   ├── config.rs               #   配置读写
        │   └── window.rs               #   窗口操作与全局快捷键注册
        ├── services/                   # 服务层
        │   ├── baidu_api.rs            #   百度翻译 API 的 HTTP 调用
        │   └── db.rs                   #   SQLite 连接与 AppState
        └── utils/
            └── sign.rs                 # 百度签名 MD5(appid + q + salt + secret_key)
```

## 实现架构

### 整体架构

应用采用 **Tauri 2.0** 架构，前端使用 React + TypeScript 渲染 UI，后端使用 Rust 处理系统级操作和网络请求。前后端通过 Tauri 的 IPC 机制（`invoke`）通信。

```
┌─────────────────────────────────────────────────────────┐
│                     前端 (WebView)                      │
│                                                         │
│            React + TypeScript + Tailwind CSS            │
│          组件：翻译 · 设置 · 历史 · 剪贴板气泡          │
│                            ↓                            │
│ 状态层 Zustand：settings · translate · history · toast  │
│                            ↓ Tauri invoke()             │
├─────────────────────────────────────────────────────────┤
│                       后端 (Rust)                       │
│                                                         │
│        commands/   IPC 入口、参数解析与错误映射         │
│                            ↓                            │
│ services/   baidu_api（HTTP）· db（SQLite + AppState）  │
│                            ↓                            │
│     utils/sign  MD5(appid + q + salt + secret_key)      │
└─────────────────────────────────────────────────────────┘
```

### 前端架构

- **状态管理**：使用 Zustand 实现 4 个独立 Store，分别管理设置、翻译、历史记录和 Toast 通知状态
- **自定义 Hooks**：`useTheme` 处理主题切换，`useTranslate` 封装翻译逻辑（含 500ms 防抖自动翻译、中英互译语言自动识别），`useClipboard` 实现剪贴板轮询监听，`useCopy` 统一复制行为
- **IPC 通信层**：`lib/invoke.ts` 统一封装所有 Tauri 后端命令调用，组件不直接调用 `invoke()`，以此获得类型约束和统一的错误出口
- **UI 组件**：基于 Tailwind CSS 构建，使用 Framer Motion 实现平滑动画，Lucide 提供图标
- **无边框窗口**：`decorations: false, transparent: true`，标题栏自绘，拖拽依赖 `data-tauri-drag-region`，最小化/最大化/关闭走自定义命令

### 后端架构

- **Tauri Commands**：前端 IPC 调用的入口，负责参数反序列化、业务编排和错误处理，统一返回 `Result<T, String>`
- **Services 层**：`baidu_api` 封装百度翻译 API 的 HTTP 请求和响应解析；`db` 管理 SQLite 连接和初始化，通过 `.manage()` 以 `AppState` 形式注入
- **Utils**：`sign` 模块实现百度 API 要求的 MD5 签名算法（`appid + q + salt + secret_key`）
- **系统集成**：全局快捷键、系统托盘、剪贴板访问、文件对话框由 Tauri 插件提供；快捷键在 Rust 侧启动时即从数据库读取并注册，早于前端加载，避免「刚打开时快捷键无效」的窗口期
- **单实例**：`tauri-plugin-single-instance` 保证二次启动只是唤起已有窗口

### 数据存储

- **SQLite 数据库**：存储在系统数据目录 `sui-shou-fanyi/data.db`，包含两张表：
  - `translations` — 翻译历史（原文、译文、语言对、时间戳），自动清理超过 500 条的旧记录
  - `config` — 键值对配置（百度翻译的 AppID、Secret Key，以及已注册的全局快捷键）
- **localStorage**：前端本地存储用户偏好设置（主题、快捷键、开关状态），与 `config` 表互为镜像，保证界面即时恢复

## 版本与发布约定

版本号在四处保持一致，构建时由 Tauri 自动写入安装包文件名与 exe 的文件属性，**不要手工改名**：

| 位置 | 用途 |
|------|------|
| `src-tauri/tauri.conf.json` → `version` | 安装包文件名、exe 版本属性 |
| `src-tauri/Cargo.toml` → `version` | Rust 包版本 |
| `src-tauri/Cargo.lock` | 由 cargo 自动同步，无需手改 |
| `package.json` → `version` | 前端包版本 |

设置面板底部显示的版本号通过 `getVersion()` 从运行时读取，因此不存在第五处硬编码。

发布流程：改上述版本号 → `npm run tauri build` → 在 GitHub Releases 新建 tag 并上传 `src-tauri/target/release/bundle/nsis/*.exe`。`releases/` 目录只用于本地暂存，已在 `.gitignore` 中忽略，不要把二进制提交进仓库。

## License

[MIT](LICENSE)

---

<a id="top-en"></a>

# SuiShouFanYi

<p align="center"><a href="#top-zh">中文</a> · <b>English</b></p>

A lightweight Windows desktop translation utility built on **Tauri 2.0** and backed by the Baidu Translate API. Type to translate automatically, with clipboard watching, translation history, and a global shortcut.

The installer is roughly 3.7 MB (an order of magnitude smaller than comparable Electron apps). It requires an internet connection and your own Baidu Translate API credentials.

## Download & Install

Grab `SuiShouFanYi_<version>_x64-setup.exe` from the [Releases page](https://github.com/chenruiming2024/sui-shou-fanyi/releases/latest) and run it.

1. Windows x64 only.
2. Requires the [WebView2 runtime](https://developer.microsoft.com/microsoft-edge/webview2/), which ships with Windows 10 1803 and later in most cases.
3. On first launch, open Settings and enter your own Baidu Translate App ID and secret key.
4. Upgrading is just installing the newer build — history and settings live in `%APPDATA%\sui-shou-fanyi\` and are preserved.

## Features

- **Seven languages** — Chinese, English, Japanese, Korean, French, German, Spanish; translates as you type with a 500 ms debounce
- **Automatic direction detection** — in a zh↔en pair, the app detects the input language and swaps the translation direction for you
- **Global shortcut** — `Alt+T` by default, and it **toggles** the window: hides it to the tray when visible and focused, otherwise shows, unminimizes and focuses it. Customizable in Settings; the combination must include at least one modifier (Ctrl / Shift / Alt / Win)
- **System tray** — closing the window only hides it. Left-click the tray icon or use "Open Main Window" to restore; choose "Quit" in the tray menu to actually exit
- **Clipboard watch** — when enabled, newly copied text pops a floating bubble you can click to translate
- **Translation history** — persisted in SQLite, capped at 500 records, with keyword search, copy, re-translate, and CSV export
- **Always on top** — one click in the title bar keeps the window above others
- **Themes** — light, dark, or follow the system
- **Text-to-speech** — read the source or the translation aloud (language picked from the text)
- **Copy / swap / clear** — one-click copy for both panes, swap source and target languages, clear the input

## Tech Stack

| Layer | Technology |
|------|------|
| Desktop framework | Tauri 2.0 |
| Backend language | Rust |
| Frontend framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| State management | Zustand 4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Database | SQLite (rusqlite) |
| Translation API | Baidu General Text Translation API |

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://www.rust-lang.org/tools/install) >= 1.70 (MSVC toolchain)
- [Tauri 2.0 prerequisites](https://v2.tauri.app/start/prerequisites/) — WebView2 and Visual Studio Build Tools on Windows

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/chenruiming2024/sui-shou-fanyi.git
cd sui-shou-fanyi
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Run in development mode

```bash
npm run tauri dev
```

The first run downloads and compiles the Rust dependencies, which takes a while. For frontend-only work use `npm run dev` (Vite is pinned to port 1420, which is what `devUrl` in `tauri.conf.json` expects).

### 4. Build the installer

```bash
npm run tauri build
```

The installer lands in `src-tauri/target/release/bundle/nsis/`. The version in the file name comes from the configuration, so there is nothing to rename by hand.

### 5. Verifying your changes

There is no test suite and no linter configured. Verify a change with:

```bash
npm run build    # strict tsc type check + vite production build
cargo check      # run inside src-tauri/ to validate the Rust side
```

## Usage

1. **Configure the API**: open Settings and enter your Baidu Translate App ID and secret key. Apply for the free general translation service at the [Baidu Translate Open Platform](https://fanyi-api.baidu.com/).
2. **Translate**: type in the input pane — translation fires 500 ms after you stop, or press the Translate button to force it.
3. **Direction detection**: with a zh↔en pair, typing Chinese switches to zh→en and typing English switches to en→zh, keeping your input intact.
4. **Shortcut**: `Alt+T` calls the window up from anywhere. Click the recorder in Settings to capture a different combination — **a modifier is required**, so a bare letter or F5 is rejected with an explanation.
5. **Clipboard watch**: enable it in Settings, then copying text pops a floating bubble that translates on click.
6. **History**: the clock icon in the title bar opens the drawer, where you can search, copy, or re-translate.
7. **Export**: Settings can export history to CSV (written with a BOM so Excel opens it without mojibake).

## Troubleshooting

- **The shortcut does nothing?** It is most likely owned by another program. The app retries registration every 10 seconds, up to 5 times, after startup, and surfaces a toast when it finally fails — change the combination in Settings.
- **How do I quit for real?** Closing the window only hides it to the tray. Right-click the tray icon and choose "Quit".
- **Moving to another machine**: copy `%APPDATA%\sui-shou-fanyi\data.db` to the same path on the new machine — it holds both history and API credentials.
- **I set a bare key in an older build and now a key is swallowed system-wide**: this version refuses to save modifier-less combinations. If your stored value is such a combination, startup reports "missing modifier" — replace it with one that includes Ctrl / Shift / Alt / Win.

**Note:** the App ID and secret key are stored locally, under `%APPDATA%\sui-shou-fanyi\`. The SQLite file `data.db` keeps your **Baidu appid and secret_key in plaintext**, alongside your translation history. Do not share that file, and do not commit `.db` files to the repository (already covered by `.gitignore`).

## Project Structure

```
sui-shou-fanyi/
├── index.html                          # HTML entry
├── package.json                        # Frontend deps and scripts
├── vite.config.mjs                     # Vite config (port 1420, strictPort)
├── tailwind.config.ts                  # Tailwind CSS config
├── tsconfig.json                       # TypeScript config
├── postcss.config.js                   # PostCSS config
├── LICENSE                             # MIT
├── src/                                # Frontend (React 18 + TypeScript)
│   ├── main.tsx                        # React entry
│   ├── App.tsx                         # Root component (theme, toast, always-on-top)
│   ├── index.css                       # Global styles
│   ├── types/
│   │   └── translate.ts                # Translation / history / theme types
│   ├── lib/                            # Utilities
│   │   ├── invoke.ts                   #   Typed wrappers for every IPC call
│   │   ├── constants.ts                #   Language list, default pair, char limit
│   │   └── speech.ts                   #   TTS helper (picks zh/en from the text)
│   ├── store/                          # Zustand stores
│   │   ├── settingsStore.ts            #   Theme, shortcut, toggles
│   │   ├── translateStore.ts           #   Input, output, languages
│   │   ├── historyStore.ts             #   History state
│   │   └── toastStore.ts               #   Toast notifications
│   ├── hooks/                          # Custom hooks
│   │   ├── useTheme.ts                 #   Theme switching
│   │   ├── useTranslate.ts             #   500 ms debounce + direction detection
│   │   ├── useClipboard.ts             #   Clipboard polling
│   │   └── useCopy.ts                  #   Shared copy-to-clipboard behaviour
│   └── components/
│       ├── layout/                     #   TitleBar / MainLayout / FloatingPopup
│       ├── translate/                  #   InputArea / OutputArea / LanguageSelector / SwapButton
│       ├── settings/                   #   SettingsPanel / ShortcutRecorder
│       ├── history/                    #   HistoryDrawer / HistoryList / SearchBar
│       └── common/                     #   Toast / Switch
└── src-tauri/                          # Rust backend
    ├── Cargo.toml                      # Rust dependencies
    ├── tauri.conf.json                 # Window, bundling and version config
    ├── build.rs                        # Build script
    ├── capabilities/
    │   └── default.json                #   Scoped permissions, limited to the "main" window
    ├── icons/                          # App icons
    └── src/
        ├── main.rs                     # Tauri entry point
        ├── lib.rs                      # Plugins, tray, startup shortcut, window events
        ├── commands/                   # IPC entry points: translate / history / config / window
        ├── services/                   # baidu_api.rs (HTTP) and db.rs (SQLite + AppState)
        └── utils/sign.rs               # Baidu MD5 signature: appid + q + salt + secret_key
```

## Architecture

The app follows the standard Tauri 2.0 split: React renders the UI inside a WebView, Rust owns all system access and the network call to Baidu, and the two talk over Tauri's `invoke` IPC.

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (WebView)                  │
│   React + TypeScript + Tailwind CSS                     │
│   components (translate · settings · history)           │
│            ↓                                            │
│  Zustand stores (settings · translate · history · toast)│
│            ↓ Tauri invoke()                             │
├─────────────────────────────────────────────────────────┤
│                     Backend (Rust)                      │
│   commands/   IPC entry points and error mapping        │
│            ↓                                            │
│   services/   baidu_api (HTTP) · db (SQLite, AppState)  │
│            ↓                                            │
│   utils/sign  MD5(appid + q + salt + secret_key)        │
└─────────────────────────────────────────────────────────┘
```

### Frontend

- **Layering**: components never call `invoke()` directly — every backend call goes through a typed one-line wrapper in `lib/invoke.ts`, which keeps the IPC surface typed and gives errors a single place to surface.
- **State**: four small Zustand stores rather than one global store; components subscribe to the slice they need.
- **Frameless window**: `decorations: false, transparent: true`. The title bar is custom, dragging relies on the native `data-tauri-drag-region`, and minimize / maximize / close are implemented as app commands.

### Backend

- **Commands** return `Result<T, String>`; the frontend turns a rejected string into a toast.
- **Services** own the HTTP call and the SQLite connection. `AppState` is injected through Tauri's `.manage()`.
- **Global shortcut** is registered on the Rust side at startup, reading the value from the `config` table before the WebView exists, so the shortcut is never dead during window creation. Registration failures retry in the background, and a value is only persisted after it registers successfully.

### Data storage

- **SQLite** at `sui-shou-fanyi/data.db` in the OS data directory, with two tables:
  - `translations` — history (source, target, language pair, timestamp), auto-pruned to the 500 most recent rows
  - `config` — key/value settings: Baidu AppID, secret key, and the registered global shortcut
- **localStorage** mirrors UI preferences (theme, shortcut, toggles) so the interface restores instantly.

## Versioning and Releases

The version string is kept identical in four places, and Tauri writes it into both the installer file name and the exe's file properties at build time — never rename a built installer by hand:

| Location | Purpose |
|------|------|
| `src-tauri/tauri.conf.json` → `version` | Installer file name, exe version properties |
| `src-tauri/Cargo.toml` → `version` | Rust package version |
| `src-tauri/Cargo.lock` | Synced by cargo automatically; do not edit |
| `package.json` → `version` | Frontend package version |

The version shown at the bottom of the Settings panel is read at runtime via `getVersion()`, so there is no fifth place to update.

Release flow: bump the versions → `npm run tauri build` → create a GitHub Release with a new tag and attach `src-tauri/target/release/bundle/nsis/*.exe`. The local `releases/` folder is only a staging area and is gitignored; never commit binaries.

## License

[MIT](LICENSE)
