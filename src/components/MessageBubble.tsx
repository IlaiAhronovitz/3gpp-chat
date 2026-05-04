import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "../types";

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`message ${isUser ? "message-user" : "message-assistant"}`}>
      <div className="message-avatar">{isUser ? "You" : "3GPP"}</div>
      <div className="message-content">
        {isUser ? (
          <p>{message.content}</p>
        ) : message.content ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        ) : (
          <span className="typing-indicator">
            <span />
            <span />
            <span />
          </span>
        )}
      </div>
    </div>
  );
}
