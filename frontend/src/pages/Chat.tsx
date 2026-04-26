// src/pages/Chat.tsx

import { useState } from "react";
import { api } from "../services/api";

interface Message {
  type: "user" | "ai";
  text: string;
}

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input) return;

    const userMsg: Message = { type: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    setLoading(true);

    try {
      const res = await api.post("/ai", { prompt: input });

      const aiMsg: Message = {
        type: "ai",
        text: res.data.output || "No response",
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { type: "ai", text: "Error getting response" },
      ]);
    }

    setLoading(false);
    setInput("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>AI Chat</h2>

      <div
        style={{
          border: "1px solid #ccc",
          height: "300px",
          overflowY: "auto",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.type === "user" ? "right" : "left",
              margin: "5px",
            }}
          >
            <span
              style={{
                background: msg.type === "user" ? "#4f46e5" : "#eee",
                color: msg.type === "user" ? "#fff" : "#000",
                padding: "8px",
                borderRadius: "8px",
                display: "inline-block",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}

        {loading && <p>⏳ Thinking...</p>}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask something..."
        style={{ padding: "8px", width: "70%" }}
      />

      <button
        onClick={sendMessage}
        style={{ padding: "8px", marginLeft: "10px" }}
      >
        Send
      </button>
    </div>
  );
}