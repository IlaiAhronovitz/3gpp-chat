import { useState, useRef, useEffect } from "react";

interface Props {
  onSend: (message: string) => void;
  isLoading: boolean;
  onStop: () => void;
}

export function InputBar({ onSend, isLoading, onStop }: Props) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [isLoading]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  return (
    <div className="input-bar">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Ask about 3GPP, LTE, 5G NR, protocols..."
        rows={1}
        disabled={isLoading}
      />
      {isLoading ? (
        <button className="btn-stop" onClick={onStop} title="Stop generation">
          ■
        </button>
      ) : (
        <button
          className="btn-send"
          onClick={handleSubmit}
          disabled={!input.trim()}
          title="Send message"
        >
          ➤
        </button>
      )}
    </div>
  );
}
