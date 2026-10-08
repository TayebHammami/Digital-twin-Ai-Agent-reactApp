import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./index.css";

const API_URL = "https://backend-digital-twin.onrender.com";

const EXAMPLES = [
  "Tell me about your background and experience.",
  "What projects are you working on?",
  "What are your strongest technical skills?",
  "How can I get in touch with you?",
];
function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm Taieb's Digital Twin. How can I help you?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatRef = useRef(null);
  const inputRef = useRef(null);
  // ============================================================
  // AUTO SCROLL
  // ============================================================

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);
  // ============================================================
  // AUTO RESIZE TEXTAREA
  // ============================================================

  useEffect(() => {
    const textarea = inputRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
  }, [input]);

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  async function sendMessage(text = input) {
    const message = text.trim();

    if (!message || loading) {
      return;
    }

    const userMessage = {
      role: "user",
      content: message,
    };

    // Keep the current conversation history
    // before adding the new user message.
    const history = messages;

    // Immediately show user's message
    setMessages((previous) => [...previous, userMessage]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message,
          history,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      // Add AI response
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            data.response || "I received an empty response from the server.",
        },
      ]);
    } catch (error) {
      console.error("Digital Twin API error:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't connect to the Digital Twin server. Please make sure the backend is running.",
        },
      ]);
    } finally {
      setLoading(false);

      // Put focus back on the input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }

  // ============================================================
  // KEYBOARD
  // ============================================================

  function handleKeyDown(event) {
    // Enter = send
    // Shift + Enter = new line

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      sendMessage();
    }
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="digital-twin">
      <div className="digital-twin__container">
        {/* ======================================================
            HEADER
        ======================================================= */}

        <header className="digital-twin__header">
          <h1 className="digital-twin__title">
            <span className="digital-twin__logo" aria-hidden="true">
              AI
            </span>

            <span>Digital Twin</span>
          </h1>

          <p className="digital-twin__subtitle">
            Talk to my AI twin about my career, projects, and technical
            experience. Interested in connecting? Interested in working together
            or discussing an opportunity? Share your name, email, and what you'd
            like to discuss, and I'll be notified."
          </p>
        </header>

        {/* ======================================================
            CHAT
        ======================================================= */}

        <section
          ref={chatRef}
          className="digital-twin__chat"
          aria-live="polite"
        >
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`chat-message ${
                message.role === "user"
                  ? "chat-message--user"
                  : "chat-message--assistant"
              }`}
            >
              <div className="chat-message__bubble">
                {message.role === "assistant" ? (
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p>{message.content}</p>
                )}
              </div>
            </div>
          ))}

          {/* ====================================================
              LOADING
          ===================================================== */}

          {loading && (
            <div className="chat-message chat-message--assistant">
              <div className="chat-message__bubble">
                <div className="typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ======================================================
            INPUT
        ======================================================= */}

        <div className="digital-twin__input-area">
          <div className="digital-twin__input-wrapper">
            <textarea
              ref={inputRef}
              className="digital-twin__input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              rows={1}
              maxLength={2000}
              disabled={loading}
              aria-label="Message"
            />

            <button
              className="digital-twin__send"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              title="Send message"
            >
              {loading ? "..." : "↑"}
            </button>
          </div>
        </div>

        {/* ======================================================
            EXAMPLES
        ======================================================= */}

        <div className="digital-twin__examples">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              className="digital-twin__example"
              onClick={() => sendMessage(example)}
              disabled={loading}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

export default App;
