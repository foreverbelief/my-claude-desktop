# MY-CODE

> Claude Code 简约桌面客户端 — 基于 TOKENICODE 深度定制

[![License](https://img.shields.io/badge/许可证-Apache%202.0-green?style=flat-square)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-FFC131?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)

---

## 安装包下载

从 [Releases](https://github.com/foreverbelief/my-claude-desktop/releases) 下载最新版本。

| 安装包 | 下载 | 说明 |
|--------|------|------|
| **NSIS 安装包**（推荐） | [MY-CODE_1.0.5_x64-setup.exe](https://github.com/foreverbelief/my-claude-desktop/releases/download/v1.0.5/MY-CODE_1.0.5_x64-setup.exe) | 安装时自动创建开始菜单快捷方式，适合普通用户 |
| **MSI 安装包** | [MY-CODE_1.0.5_x64_en-US.msi](https://github.com/foreverbelief/my-claude-desktop/releases/download/v1.0.5/MY-CODE_1.0.5_x64_en-US.msi) | 标准 Windows Installer 包，适合企业批量部署 |
| **绿色免安装版** | [mycode.exe](https://github.com/foreverbelief/my-claude-desktop/releases/download/v1.0.5/mycode.exe) | 直接运行，无需安装 |

双击任一安装包即可安装。安装后桌面会生成快捷方式，双击即可启动。

### 系统要求

- Windows 10 或 Windows 11（已内置 WebView2）
- [Git for Windows](https://git-scm.com/download/win)（Claude Code CLI 需要 Bash 环境）
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code/overview)：`npm install -g @anthropic-ai/claude-code`
- 运行 `claude` 登录你的 Anthropic 账号

---

## 从源码编译

### 编译环境

| 工具 | 版本要求 | 获取方式 |
|------|---------|---------|
| Node.js | >= 18 | [nodejs.org](https://nodejs.org) |
| pnpm | >= 9 | `npm install -g pnpm` |
| Rust | >= 1.80 | [rustup.rs](https://rustup.rs) |
| Visual Studio Build Tools | 2022 | [visualstudio.microsoft.com](https://visualstudio.microsoft.com/visual-cpp-build-tools/) — 勾选"使用 C++ 的桌面开发" |
| Git for Windows | 最新版 | [git-scm.com](https://git-scm.com/download/win) |

### 编译步骤

```bash
# 克隆仓库
git clone https://github.com/foreverbelief/my-claude-desktop.git
cd my-claude-desktop

# 安装前端依赖
pnpm install

# 构建安装包（产物在 src-tauri/target/release/bundle/ 下）
pnpm tauri build
```

编译产物路径：

```
src-tauri/target/release/
├── mycode.exe                    # 绿色免安装版（直接运行）
├── bundle/
│   ├── msi/
│   │   └── MY-CODE_*.msi        # MSI 安装包
│   └── nsis/
│       └── MY-CODE_*_x64-setup.exe  # NSIS 安装包（推荐）
```

---

## 与 TOKENICODE 的关系

MY-CODE 是 [TOKENICODE](https://github.com/yiliqi78/TOKENICODE)（[mistydew/tokenicode-deepseek-alpha](https://github.com/mistydew/tokenicode-deepseek-alpha)）的 Fork，基于 Tauri 2 + React 19 架构。

### 继承的核心架构

- **Tauri 2 桌面框架** — 原生窗口管理、系统托盘、文件系统访问
- **React 19 + TypeScript** — 前端 UI 框架
- **Zustand 5** — 状态管理
- **Tailwind CSS 4** — 样式系统
- **Claude Code SDK Control Protocol** — 与 Claude CLI 的双向通信协议
- **多会话标签页** — 同时运行多个 Claude 会话
- **MCP 服务器管理** — 管理 ~/.claude.json 中的 MCP 配置
- **Claude CLI 安装向导** — 内置 CLI 安装和登录引导
- **命令面板** — 统一的命令入口（内置命令 + 自定义命令 + Skills）

### 主要变更

| 变更 | 说明 |
|------|------|
| 品牌重命名 | TOKENICODE → MY-CODE，全局替换代码标识符、数据目录、localStorage 键名 |
| 极简主题 | 仅保留「简约黑」和「简约白」两个背景主题，移除多余主题 |
| 公式渲染 | 集成 KaTeX，支持 LaTeX 数学公式显示 |
| 代码块优化 | 语言标签头部 + 一键复制按钮 |
| 权限导航 | 权限卡支持方向键选择允许/拒绝，Enter 确认，Esc 拒绝 |
| 输入历史 | 空输入框按 ↑ 回溯历史发送消息 |
| 终端面板 | 在右侧面板直接查看 CLI 命令输出，无需弹出外部窗口 |
| Skills 分类 | 按名称前缀自动归类 Skills |
| DeepSeek 适配 | 自动切换 Pro/Flash 模型 |

---

## 技术依赖

### 前端 (package.json)

`react 19`, `zustand 5`, `@tiptap/react 3`, `@uiw/react-codemirror 4`, `react-markdown 10`, `rehype-highlight`, `rehype-katex + katex`, `remark-gfm + remark-math`, `tailwindcss 4`, `@codemirror/lang-*` (12+ 语言), `@tauri-apps/api 2 + plugins (dialog, updater, opener, process, fs, shell)`

### 后端 (Cargo.toml)

`tauri 2`, `tokio 1`, `serde / serde_json 1`, `reqwest 0.12`, `notify 7`, `uuid 1`, `base64`, `serde_yaml`, `tauri-plugin-{updater,dialog,shell,process,opener,fs}`, `flate2 / tar / zip`, `sha2 / aes-gcm`

### 技术栈一览

| 层级 | 技术 |
|------|------|
| 桌面框架 | Tauri 2 |
| 前端框架 | React 19 + TypeScript 5.8 |
| 样式 | Tailwind CSS 4 |
| 状态管理 | Zustand 5 |
| 富文本输入 | TipTap 3 |
| 代码预览 | CodeMirror 6 |
| Markdown 渲染 | react-markdown 10 + rehype/remark 插件 |
| 公式渲染 | KaTeX |
| 构建工具 | Vite 7 |
| 后端语言 | Rust (tokio, reqwest, serde, notify) |
| AI 引擎 | Claude Code CLI（SDK Control Protocol 通信） |
| 包管理 | pnpm |
| 自动更新 | tauri-plugin-updater |

---

## 许可证

Apache License 2.0

## 致谢

- [TOKENICODE](https://github.com/yiliqi78/TOKENICODE) — 上游原始项目
- [mistydew/tokenicode-deepseek-alpha](https://github.com/mistydew/tokenicode-deepseek-alpha) — 本 Fork 的直接来源
- [Anthropic](https://anthropic.com) — Claude Code CLI
- [Tauri](https://tauri.app) — 桌面应用框架
