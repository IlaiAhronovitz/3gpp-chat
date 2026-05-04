import { useState, useEffect } from "react";
import { ChatWindow } from "./components/ChatWindow";
import { InputBar } from "./components/InputBar";
import { SettingsPanel } from "./components/SettingsPanel";
import { useChat } from "./hooks/useChat";
import type { Settings } from "./types";

const STORAGE_KEY = "3gpp-chat-settings";
const DEFAULT_MODEL = "claude-sonnet-4-6";
const VALID_MODELS = new Set([
  "claude-sonnet-4-6",
  "claude-opus-4-7",
  "claude-haiku-4-5-20251001",
]);

function loadSettings(): Settings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!VALID_MODELS.has(parsed.model)) {
        parsed.model = DEFAULT_MODEL;
      }
      return parsed;
    }
  } catch {}
  return { apiKey: "", model: DEFAULT_MODEL };
}

function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { messages, isLoading, sendMessage, stopGeneration, clearChat } =
    useChat(settings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>3GPP Expert</h1>
          <span className="header-badge">Cellular Standards AI</span>
        </div>
        <div className="header-right">
          <button className="btn-icon" onClick={clearChat} title="New chat">
            +
          </button>
          <button
            className="btn-icon"
            onClick={() => setSettingsOpen(true)}
            title="Settings"
          >
            &#9881;
          </button>
        </div>
      </header>

      <ChatWindow messages={messages} />
      <InputBar
        onSend={sendMessage}
        isLoading={isLoading}
        onStop={stopGeneration}
      />

      <SettingsPanel
        settings={settings}
        onSave={setSettings}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
