# 随手翻译 (SuiShouFanYi)

一个基于 **Tauri 2.0** 构建的轻量级桌面翻译工具，使用百度翻译 API，支持多语言互译。输入文本后自动翻译，同时提供剪贴板监听、翻译历史、全局快捷键等实用功能。

## 功能特性

- **多语言翻译** — 支持中文、英文、日文、韩文、法文、德文、西班牙文互译，输入即翻译（500ms 防抖）
- **剪贴板监听** — 开启后自动检测剪贴板中的文本，弹出浮动气泡快速翻译
- **翻译历史** — SQLite 本地持久化，最多保存 500 条记录，支持关键词搜索和 CSV 导出
- **全局快捷键** — 默认 `Alt+T` 唤起主窗口，支持自定义快捷键组合
- **系统托盘** — 关闭窗口后最小化到托盘，左键单击或右键菜单恢复窗口
- **主题切换** — 亮色 / 暗色 / 跟随系统三种模式
- **窗口置顶** — 一键置顶翻译窗口，方便对照阅读
- **文本朗读** — 原文和译文均支持 TTS 语音朗读
- **一键复制** — 原文 / 译文一键复制到剪贴板
- **语言互换** — 一键交换源语言和目标语言，同时交换已输入的文本
- **一键清除** — 输入框底部清除按钮，一键清空输入内容和翻译结果
- **语言自动识别** — 中英互译场景下自动检测输入语言，智能交换翻译方向

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
| 翻译 API | 百度翻译 API |

## 项目结构

```
sui-shou-fanyi/
├── index.html                          # HTML 入口
├── package.json                        # 前端依赖配置
├── vite.config.mjs                     # Vite 构建配置
├── tailwind.config.ts                  # Tailwind CSS 配置
├── tsconfig.json                       # TypeScript 配置
├── postcss.config.js                   # PostCSS 配置
├── src/                                # 前端源码
│   ├── main.tsx                        # React 入口
│   ├── App.tsx                         # 根组件（主题、Toast、置顶）
│   ├── index.css                       # 全局样式
│   ├── types/                          # TypeScript 类型定义
│   │   ├── settings.ts                 #   应用配置类型
│   │   └── translate.ts                #   翻译相关类型
│   ├── lib/                            # 工具库
│   │   ├── invoke.ts                   #   Tauri IPC 命令封装
│   │   └── constants.ts                #   常量定义（语言列表、字符限制）
│   ├── store/                          # Zustand 状态管理
│   │   ├── settingsStore.ts            #   设置状态（主题、快捷键、开关）
│   │   ├── translateStore.ts           #   翻译状态（输入、输出、语言）
│   │   ├── historyStore.ts             #   历史记录状态
│   │   └── toastStore.ts              #   Toast 通知状态
│   ├── hooks/                          # 自定义 Hooks
│   │   ├── useTheme.ts                 #   主题切换逻辑
│   │   ├── useTranslate.ts             #   翻译逻辑（含自动翻译）
│   │   ├── useClipboard.ts             #   剪贴板监听逻辑
│   │   └── useHistory.ts              #   历史记录加载
│   └── components/                     # React 组件
│       ├── layout/                     #   布局组件
│       │   ├── TitleBar.tsx            #     自定义标题栏（拖拽、窗口控制）
│       │   ├── MainLayout.tsx          #     主布局（语言栏、输入输出、状态栏）
│       │   └── FloatingPopup.tsx       #     剪贴板检测浮动气泡
│       ├── translate/                  #   翻译组件
│       │   ├── InputArea.tsx           #     输入区域（文本框、朗读、复制、清除）
│       │   ├── OutputArea.tsx          #     输出区域（译文展示、动画）
│       │   ├── LanguageSelector.tsx    #     语言选择下拉菜单（支持左/右对齐）
│       │   └── SwapButton.tsx          #     语言互换按钮
│       ├── settings/                   #   设置组件
│       │   ├── SettingsPanel.tsx       #     设置面板（API 配置、主题、开关）
│       │   └── ShortcutRecorder.tsx    #     快捷键录制器
│       ├── history/                    #   历史记录组件
│       │   ├── HistoryDrawer.tsx       #     历史侧边抽屉
│       │   ├── HistoryList.tsx         #     历史列表（复制、重译）
│       │   └── SearchBar.tsx           #     搜索栏
│       └── common/                     #   通用组件
│           ├── Toast.tsx               #     消息提示
│           ├── Switch.tsx              #     开关控件
│           ├── Spinner.tsx             #     加载动画
│           └── IconButton.tsx          #     图标按钮
└── src-tauri/                          # Rust 后端源码
    ├── Cargo.toml                      # Rust 依赖配置
    ├── tauri.conf.json                 # Tauri 应用配置
    ├── build.rs                        # 构建脚本
    ├── capabilities/                   # 权限声明
    │   └── default.json                #   窗口、剪贴板、文件系统等权限
    ├── icons/                          # 应用图标
    └── src/
        ├── main.rs                     # Tauri 启动入口
        ├── lib.rs                      # 应用初始化（插件注册、托盘、快捷键）
        ├── commands/                   # Tauri 命令（前端 IPC 调用）
        │   ├── mod.rs                  #   命令模块导出
        │   ├── translate.rs            #   翻译命令
        │   ├── clipboard.rs            #   剪贴板读取
        │   ├── history.rs              #   历史记录 CRUD
        │   ├── config.rs              #   配置读写
        │   └── window.rs              #   窗口操作（最小化、最大化、拖拽、快捷键注册）
        ├── services/                   # 服务层
        │   ├── mod.rs                  #   服务模块导出
        │   ├── baidu_api.rs            #   百度翻译 API 调用
        │   └── db.rs                   #   SQLite 数据库（AppState）
        └── utils/                      # 工具函数
            ├── mod.rs                  #   工具模块导出
            └── sign.rs                 #   MD5 签名生成（百度 API 鉴权）
```

## 实现架构

### 整体架构

应用采用 **Tauri 2.0** 架构，前端使用 React + TypeScript 渲染 UI，后端使用 Rust 处理系统级操作和网络请求。前后端通过 Tauri 的 IPC 机制（`invoke`）通信。

```
┌─────────────────────────────────────────────────────────┐
│                    前端 (WebView)                        │
│                                                         │
│  React + TypeScript + Tailwind CSS                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ 翻译组件  │  │ 设置面板  │  │ 历史抽屉  │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │              │              │                    │
│  ┌────┴──────────────┴──────────────┴────┐              │
│  │         Zustand Store (状态管理)        │              │
│  └────────────────┬──────────────────────┘              │
│                   │ Tauri invoke()                      │
├───────────────────┼─────────────────────────────────────┤
│                   │                                     │
│  ┌────────────────┴──────────────────────┐              │
│  │          Tauri Commands (Rust)         │              │
│  │  translate · history · config · window │              │
│  └────────────────┬──────────────────────┘              │
│                   │                                     │
│  ┌────────────────┴──────────────────────┐              │
│  │         Services Layer (Rust)          │              │
│  │  baidu_api · SQLite (rusqlite)         │              │
│  └───────────────────────────────────────┘              │
│                                                         │
│                    后端 (Rust)                           │
└─────────────────────────────────────────────────────────┘
```

### 前端架构

- **状态管理**：使用 Zustand 实现 4 个独立 Store，分别管理设置、翻译、历史记录和 Toast 通知状态
- **自定义 Hooks**：`useTheme` 处理主题切换，`useTranslate` 封装翻译逻辑（含 500ms 防抖自动翻译、中英互译语言自动识别），`useClipboard` 实现剪贴板轮询监听，`useHistory` 管理历史记录加载
- **IPC 通信层**：`lib/invoke.ts` 统一封装所有 Tauri 后端命令调用，提供类型安全的 Promise 接口
- **UI 组件**：基于 Tailwind CSS 构建，使用 Framer Motion 实现平滑动画，Lucide 提供图标

### 后端架构

- **Tauri Commands**：前端 IPC 调用的入口，负责参数反序列化、业务编排和错误处理
- **Services 层**：`baidu_api` 封装百度翻译 API 的 HTTP 请求和响应解析；`db` 管理 SQLite 连接和初始化
- **Utils**：`sign` 模块实现百度 API 要求的 MD5 签名算法（`appid + q + salt + secret_key`）
- **系统集成**：通过 Tauri 插件实现全局快捷键注册、系统托盘、剪贴板访问、文件对话框等功能

### 数据存储

- **SQLite 数据库**：存储在系统数据目录 `sui-shou-fanyi/data.db`，包含两张表：
  - `translations` — 翻译历史（原文、译文、语言对、时间戳），自动清理超过 500 条的旧记录
  - `config` — 键值对配置（百度 API 的 AppID 和 Secret Key）
- **localStorage**：前端本地存储用户偏好设置（主题、快捷键、开关状态）

## 环境要求

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://www.rust-lang.org/tools/install) >= 1.70
- [Tauri 2.0 CLI 环境](https://v2.tauri.app/start/prerequisites/)（含 WebView2、Visual Studio Build Tools 等 Windows 依赖）

## 快速开始

### 1. 克隆仓库

```bash
git clone <your-repo-url>
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

首次运行会自动下载和编译 Rust 依赖，需要一些时间。

### 4. 构建安装包

```bash
npm run tauri build
```

构建完成后，安装包位于 `src-tauri/target/release/bundle/nsis/` 目录下。

## 使用说明

1. **配置 API**：首次使用需在设置面板中填入百度翻译 API 的 AppID 和密钥。可前往 [百度翻译开放平台](https://fanyi-api.baidu.com/) 申请通用翻译 API 服务
2. **开始翻译**：在左侧输入框输入文本，500ms 后自动翻译；也可点击底部"翻译"按钮手动触发
3. **语言自动识别**：中英互译模式下，输入中文自动切换为中→英，输入英文自动切换为英→中（已输入的文本会保留）
4. **快捷键**：默认 `Alt+T` 全局唤起窗口，可在设置中自定义
5. **剪贴板监听**：在设置中开启后，复制文本会自动弹出浮动气泡，点击即可翻译
6. **历史记录**：点击标题栏的历史图标打开侧边栏，支持搜索、复制译文、重译
7. **导出数据**：在设置面板中可将翻译历史导出为 CSV 文件

## License

MIT
