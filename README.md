# Ollama JSON Translator

[中文文档](README_CN.md) | [English](README.md)

**Ollama JSON Translator** is a modern, AI-powered localization tool that translates JSON files (commonly used for i18n) using local LLMs via Ollama. It features a premium, "AI-native" UI with dark/light themes, real-time feedback, and a seamless developer experience.

![Project Screenshot](Screenshots/Screenshot%202026-02-07.png)

## Features

- **AI Translation**: Leverages local Ollama models (e.g., Llama 3, Mistral, Qwen) for context-aware translation.
- **Modern UI**:
    - **Glassmorphism Design**: Sleek, translucent cards and blur effects.
    - **Theme Support**: Seamless Light and Dark modes.
    - **Bilingual Interface**: Switch between English and Chinese (中文).
- **Developer Focused**:
    - Supports `.json` key-value localization files.
    - Exclude specific keys (e.g., `id`, `url`) from translation.
    - Real-time connection testing and model fetching.
    - Diff view for Original vs. Translated JSON.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **State**: React Context (Theme/Language)
- **AI Integration**: Ollama API

## Getting Started

### Prerequisites

1.  **Node.js** (v18+)
2.  **Ollama**: Installed and running locally.
    - Download: [ollama.com](https://ollama.com)
    - Run a model: `ollama run qwen2.5-coder` (or any preferred model)
    - **Important**: Ensure Ollama is running (`ollama serve`).

### Installation & Usage (Docker)

Quickly run the app using Docker (Recommended):

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/ollama-json-translator.git
    cd ollama-json-translator
    ```

2.  **Run with Docker Compose**:
    ```bash
    docker-compose up --build
    ```

3.  **Open the App**:
    - Visit http://localhost:5173 
    - **Note**: The app is pre-configured to connect to your host's Ollama at `http://host.docker.internal:11434`.

## Usage


1.  **Configure**: Enter your Ollama API URL (default: `http://localhost:11434`) and click "Test Connection".
2.  **Select Model**: Choose a downloaded model from the list.
3.  **Upload**: Drag & drop your source `.json` file.
4.  **Translate**: Select source/target languages and click "Start Translation".
5.  **Download**: Review the side-by-side comparison and download the translated JSON.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
