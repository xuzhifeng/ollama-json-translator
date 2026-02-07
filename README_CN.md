# Ollama JSON Translator

[English](README.md) | [中文文档](README_CN.md)

**Ollama JSON Translator** 是一个现代化的 AI 本地化工具，利用 Ollama 的本地大语言模型（LLM）来翻译 JSON 文件（常用于 i18n）。它拥有“AI 原生”的 Glassmorphism（毛玻璃）风格 UI，支持深色/浅色模式，提供实时反馈，旨在提供流畅的开发者体验。

![Project Screenshot](Screenshots/Screenshot%202026-02-07.png)

## 功能特性

- **AI 智能翻译**: 利用本地 Ollama 模型（如 Llama 3, Mistral, Qwen）进行上下文感知翻译。
- **现代化 UI**:
    - **毛玻璃设计**: 精致的半透明卡片和模糊效果。
    - **主题支持**: 完美支持浅色（Light）和深色（Dark）模式。
    - **双语界面**: 界面支持中英文切换。
- **开发者友好**:
    - 专为 `.json` 键值对本地化文件设计。
    - 支持排除特定键（如 `id`, `url`）不进行翻译。
    - 实时连接测试和模型获取。
    - 原始与翻译后 JSON 的对比视图。

## 技术栈

- **前端**: React, TypeScript, Vite
- **样式**: Tailwind CSS, Lucide React (图标)
- **状态管理**: React Context (Theme/Language)
- **AI 集成**: Ollama API

## 快速开始

### 前置要求

1.  **Node.js** (v18+)
2.  **Ollama**: 已安装并在本地运行。
    - 下载地址: [ollama.com](https://ollama.com)
    - 运行模型: `ollama run qwen2.5-coder` (或你喜欢的任何模型)
    - **重要**: 请确保 Ollama 服务正在运行 (`ollama serve`)。

### 安装与使用 (Docker)

推荐使用 Docker 快速启动：

1.  **克隆仓库**:
    ```bash
    git clone https://github.com/your-username/ollama-json-translator.git
    cd ollama-json-translator
    ```

2.  **启动服务**:
    ```bash
    docker-compose up --build
    ```

3.  **打开应用**:
    - 访问 http://localhost:5173
    - **注意**: 应用已预配置为连接宿主机的 Ollama (`http://host.docker.internal:11434`)。

## 使用说明

1.  **配置**: 输入 Ollama API 地址（默认: `http://localhost:11434`）并点击“测试连接”。
2.  **选择模型**: 从下拉列表中选择已下载的模型。
3.  **上传**: 拖拽或点击上传你的源 `.json` 文件。
4.  **翻译**: 选择源语言和目标语言，点击“开始翻译”。
5.  **下载**: 查看左右对比结果，确认无误后下载翻译后的 JSON 文件。

## 许可证

本项目基于 MIT 许可证开源 - 详见 [LICENSE](LICENSE) 文件。
