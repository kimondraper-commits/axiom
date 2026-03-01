"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  userId: string;
  projectId?: string;
  initialMessages: Array<{ role: string; content: string }>;
  sessionId?: string;
}

export function ChatPanel({ userId, projectId, initialMessages, sessionId: initialSessionId }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(initialSessionId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setInput("");
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    const allMessages = [...messages, userMessage];

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages, sessionId, projectId }),
      });

      if (res.status === 429) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Rate limit reached. Please wait a moment before sending another message." },
        ]);
        setLoading(false);
        return;
      }

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6);
          try {
            const event = JSON.parse(jsonStr);
            if (event.type === "session" && event.sessionId) {
              setSessionId(event.sessionId);
            } else if (event.type === "text") {
              assistantContent += event.text;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "An error occurred. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "var(--gold-glow)", border: "1px solid var(--border-active)" }}>
              <span style={{ color: "var(--gold)", fontFamily: "var(--font-syne, 'Syne', sans-serif)", fontWeight: 600, fontSize: 16 }}>AI</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Ask any question about urban planning, zoning, regulations, or your project.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {[
                "What are typical setback requirements for R-2 zones?",
                "Summarise EP&A Act review steps",
                "What makes a good traffic impact study?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  style={{ fontSize: 11, background: "var(--slate)", color: "var(--text-secondary)", padding: "6px 12px", borderRadius: 9999, border: "1px solid var(--border)" }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
              style={msg.role === "user"
                ? { background: "linear-gradient(135deg, var(--gold-dim), var(--gold))", color: "var(--void)", borderRadius: "12px 12px 2px 12px" }
                : { background: "var(--slate)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "12px 12px 12px 2px" }
              }
            >
              {msg.content || (loading && i === messages.length - 1 ? (
                <span className="flex gap-1" style={{ color: "var(--gold)" }}>
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>●</span>
                </span>
              ) : "")}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input form */}
      <div className="px-6 py-4" style={{ borderTop: "1px solid var(--border)", background: "var(--carbon)" }}>
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a planning question…"
            disabled={loading}
            className="flex-1"
            style={{ opacity: loading ? 0.6 : 1 }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              background: "linear-gradient(135deg, var(--gold-dim), var(--gold))",
              color: "var(--void)",
              padding: "10px 20px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              opacity: (loading || !input.trim()) ? 0.5 : 1,
              cursor: (loading || !input.trim()) ? "not-allowed" : "pointer",
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
