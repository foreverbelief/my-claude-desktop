<div align="center">

<img src="public/app-icon.png" alt="MY-CODE Logo" width="120" />

# MY-CODE

### Claude Code 简约桌面客户端

[![License](https://img.shields.io/badge/许可证-Apache%202.0-green?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/平台-Windows-lightgrey?style=flat-square)](#安装)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-FFC131?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)

**MY-CODE** 是基于 [TOKENICODE](https://github.com/yiliqi78/TOKENICODE)（`mistydew/tokenicode-deepseek-alpha` 分支）深度定制的 Claude Code 桌面客户端。

---

</div>

## 与 TOKENICODE 的关系

MY-CODE 是 TOKENICODE 的 Fork，保留了核心架构（Tauri 2 + React 19 + Claude CLI SDK Control Protocol），进行了以下定制：

| 变更 | 说明 |
|------|------|
| 品牌重命名 | TOKENICODE → MY-CODE，全局代码标识符替换 |
| 极简主题 | 仅保留「简约黑」和「简约白」两个背景主题 |
| 公式渲染 | 集成 KaTeX，支持 LaTeX 数学公式显示 |
| 代码块优化 | 语言标签头部 + 一键复制按钮 |
| 权限导航 | 权限卡支持方向键 ↑↓←→ 选择允许/拒绝，Enter 确认，Esc 拒绝 |
| 输入历史 | 空输入框按 ↑ 回溯历史发送消息 |

## 编译好的程序

从 [Releases](https://github.com/foreverbelief/my-claude-desktop/releases) 下载 `.exe` 安装包直接运行。

## 系统要求

| 依赖 | 版本 | 说明 |
|------|------|------|
| Windows | 10 / 11 | 需预装 WebView2（Win11 已内置） |
| Git for Windows | 最新版 | 提供 Claude Code 所需的 Bash 环境 |
| Claude Code CLI | 最新版 | `npm install -g @anthropic-ai/claude-code` |

## 从源码编译

### 环境准备

| 工具 | 版本要求 | 安装方式 |
|------|---------|---------|
| Node.js | >= 18 | [nodejs.org](https://nodejs.org) |
| pnpm | >= 9 | `npm install -g pnpm` |
| Rust | >= 1.80 | [rustup.rs](https://rustup.rs) |
| Visual Studio Build Tools | 2022 | Windows 编译 C++ 需要 |
| Git for Windows | 最新版 | [git-scm.com](https://git-scm.com/download/win) |

### 编译步骤

```bash
# 1. 克隆仓库
git clone https://github.com/foreverbelief/my-claude-desktop.git
cd my-claude-desktop

# 2. 安装前端依赖
pnpm install

# 3. 编译（产生 .exe 在 src-tauri/target/release/）
pnpm tauri build
```

## 前端依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| react / react-dom | ^19 | UI 框架 |
| zustand | ^5 | 状态管理 |
| @tauri-apps/api | ^2 | Tauri 桌面桥接 |
| @tiptap/react / @tiptap/starter-kit | ^3 | 富文本输入编辑器 |
| @uiw/react-codemirror | ^4 | 代码查看/编辑 |
| react-markdown | ^10 | Markdown 渲染 |
| rehype-highlight | ^7 | 代码块语法高亮 |
| rehype-raw | ^7 | 内嵌 HTML 支持 |
| rehype-sanitize | ^6 | HTML/MathML 安全过滤 |
| rehype-katex | ^7 | LaTeX 数学公式渲染 |
| remark-gfm | ^4 | GitHub Flavored Markdown |
| remark-math | ^6 | Markdown 公式解析 |
| remark-cjk-friendly | ^2 | 中日韩文字断句 |
| katex | ^0.16 | 公式渲染引擎 |
| highlight.js | ^11 | 代码高亮 |
| tailwindcss | ^4 | CSS 工具类框架 |
| @codemirror/lang-* | ^6 | 12+ 编程语言语法支持 |
| @tauri-apps/plugin-dialog | ^2 | 原生文件对话框 |
| @tauri-apps/plugin-updater | ^2 | 自动更新 |
| @tauri-apps/plugin-opener | ^2 | 系统默认程序打开 |
| @tauri-apps/plugin-process | ^2 | 进程管理 |

### 开发依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| typescript | ~5.8 | 类型检查 |
| vite | ^7 | 构建工具 |
| @vitejs/plugin-react | ^4 | React HMR |
| @tailwindcss/vite | ^4 | Tailwind CSS 插件 |
| @tauri-apps/cli | ^2 | Tauri 命令行工具 |
| vitest | ^4 | 测试框架 |

## Rust 后端依赖

| Crate | 版本 | 用途 |
|------|------|------|
| tauri | ^2 | 桌面框架核心 |
| tokio | ^1 (full) | 异步运行时 |
| serde / serde_json | ^1 | 序列化 |
| uuid | ^1 (v4) | 会话 ID 生成 |
| reqwest | ^0.12 | HTTP 客户端 |
| notify | ^7 | 文件系统监听 |
| dirs | ^6 | 跨平台目录 |
| base64 | ^0.22 | 文件编码 |
| serde_yaml | ^0.9 | YAML 解析 |
| tauri-plugin-updater | ^2 | 自动更新 |
| tauri-plugin-dialog | ^2 | 文件对话框 |
| tauri-plugin-shell | ^2 | 进程 spawn |
| tauri-plugin-process | ^2 | 进程管理 |
| tauri-plugin-opener | ^2 | 系统程序调用 |
| flate2 / tar / zip | ^1-2 | 压缩解压 |
| sha2 / aes-gcm | ^0.10 | 凭据加密 |
| rand | ^0.8 | 随机数 |

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | Tauri 2 |
| 前端 | React 19 + TypeScript 5.8 |
| 样式 | Tailwind CSS 4 |
| 状态管理 | Zustand 5（10 个独立 Store） |
| 代码编辑器 | CodeMirror 6 |
| 输入编辑器 | TipTap 3 |
| 构建 | Vite 7 |
| 后端 | Rust（tokio, reqwest, serde, notify） |
| AI 引擎 | Claude Code CLI（SDK Control Protocol） |
| 包管理 | pnpm |

## 许可证

Apache License 2.0 — 详见 [LICENSE](LICENSE)

## 致谢

- [TOKENICODE](https://github.com/yiliqi78/TOKENICODE) — 原始项目
- [mistydew/tokenicode-deepseek-alpha](https://github.com/mistydew/tokenicode-deepseek-alpha) — 直接 Fork 来源
- [Anthropic](https://anthropic.com) — Claude Code CLI
- [Tauri](https://tauri.app) — 桌面应用框架

</div>
