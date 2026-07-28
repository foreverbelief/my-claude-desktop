# MY-CODE

> Claude Code 简约桌面客户端

**MY-CODE** 是基于 TOKENICODE（[mistydew/tokenicode-deepseek-alpha](https://github.com/mistydew/tokenicode-deepseek-alpha)）深度定制的 Claude Code 桌面客户端。

[![License](https://img.shields.io/badge/许可证-Apache%202.0-green?style=flat-square)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-FFC131?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)

---

## 与 TOKENICODE 的关系

MY-CODE 是 TOKENICODE 的 Fork，保留了核心架构（Tauri 2 + React 19 + Claude CLI SDK Control Protocol），进行了以下定制：

| 变更 | 说明 |
|------|------|
| 品牌重命名 | TOKENICODE → MY-CODE，全局代码标识符替换 |
| 极简主题 | 仅保留「简约黑」和「简约白」两个背景主题 |
| 公式渲染 | 集成 KaTeX，支持 LaTeX 数学公式显示 |
| 代码块优化 | 语言标签头部 + 一键复制按钮 |
| 权限导航 | 权限卡支持方向键选择允许/拒绝，Enter 确认，Esc 拒绝 |
| 输入历史 | 空输入框按 ↑ 回溯历史发送消息 |

## 系统要求

| 依赖 | 版本 | 说明 |
|------|------|------|
| Windows | 10 / 11 | 需预装 WebView2（Win11 已内置） |
| Git for Windows | 最新版 | 提供 Claude Code 所需的 Bash 环境 |
| Claude Code CLI | 最新版 | `npm install -g @anthropic-ai/claude-code` |

## 下载安装包

从 [Releases](https://github.com/foreverbelief/my-claude-desktop/releases) 下载最新 MSI 安装包，双击即可安装。

## 从源码编译

| 工具 | 版本 | 安装方式 |
|------|------|---------|
| Node.js | >= 18 | [nodejs.org](https://nodejs.org) |
| pnpm | >= 9 | `npm install -g pnpm` |
| Rust | >= 1.80 | [rustup.rs](https://rustup.rs) |
| VS Build Tools | 2022 | Windows 编译 C++ 需要 |
| Git for Windows | 最新版 | [git-scm.com](https://git-scm.com/download/win) |

```bash
git clone https://github.com/foreverbelief/my-claude-desktop.git
cd my-claude-desktop
pnpm install
pnpm tauri build  # 产物: src-tauri/target/release/mycode.exe (exe)
                  #        src-tauri/target/release/bundle/msi/MY-CODE_*.msi (安装包)
```

## 依赖

### 前端

react 19, zustand 5, @tiptap/react 3, @uiw/react-codemirror 4, react-markdown 10, rehype-highlight, rehype-katex + katex, remark-gfm + remark-math, tailwindcss 4, @codemirror/lang-\* (12+ 语言), @tauri-apps/api 2 + plugins (dialog, updater, opener, process)

### 后端 (Rust)

tauri 2, tokio 1, serde/serde_json 1, reqwest 0.12, notify 7, uuid 1, base64, serde_yaml, tauri-plugin-{updater,dialog,shell,process,opener}, flate2/tar/zip, sha2/aes-gcm

### 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | Tauri 2 |
| 前端 | React 19 + TypeScript 5.8 |
| 样式 | Tailwind CSS 4 |
| 状态管理 | Zustand 5 |
| 代码/输入编辑器 | CodeMirror 6 + TipTap 3 |
| 构建 | Vite 7 |
| 后端 | Rust (tokio, reqwest, serde, notify) |
| AI 引擎 | Claude Code CLI (SDK Control Protocol) |
| 包管理 | pnpm |

## 许可证

Apache License 2.0

## 致谢

- [TOKENICODE](https://github.com/yiliqi78/TOKENICODE) — 原始项目
- [mistydew/tokenicode-deepseek-alpha](https://github.com/mistydew/tokenicode-deepseek-alpha) — Fork 来源
- [Anthropic](https://anthropic.com) — Claude Code CLI
- [Tauri](https://tauri.app) — 桌面应用框架
