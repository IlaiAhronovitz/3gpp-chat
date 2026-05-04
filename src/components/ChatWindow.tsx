import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import type { Message } from "../types";

interface Props {
  messages: Message[];
}

export function ChatWindow({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-window">
      {messages.length === 0 && (
        <div className="welcome">
          <div className="welcome-icon">📡</div>
          <h2>3GPP Expert Chat</h2>
          <p>
            Ask me anything about cellular standards — GSM, UMTS, LTE, 5G NR,
            protocol layers, specifications, and more.
          </p>
          <div className="welcome-examples">
            <p>Try asking:</p>
            <ul>
              <li>"What are the key differences between LTE and NR physical layer?"</li>
              <li>"Explain the 5G NR SSB structure"</li>
              <li>"What is network slicing in 5G?"</li>
              <li>"Compare OFDMA in LTE vs NR"</li>
            </ul>
          </div>
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
