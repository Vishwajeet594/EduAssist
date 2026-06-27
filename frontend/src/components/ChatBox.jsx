import { useEffect, useMemo, useState } from "react";

import API from "../services/api";

const formatTimestamp = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString([], {
    month: "short",
    day: "numeric"
  });
};

const inlineMarkdown = (text) => {
  const parts = [];
  const segments = String(text || "").split(/(\*\*[^*]+\*\*)/g);

  segments.forEach((segment, index) => {
    if (segment.startsWith("**") && segment.endsWith("**")) {
      parts.push(
        <strong key={`${segment}-${index}`}>{segment.slice(2, -2)}</strong>
      );
    } else if (segment) {
      parts.push(segment);
    }
  });

  return parts;
};

const renderRichText = (text) => {
  const lines = String(text || "").split(/\n/);
  const blocks = [];
  let listItems = [];

  const flushList = () => {
    if (!listItems.length) return;

    blocks.push(
      <ul className="chat-bullet-list" key={`list-${blocks.length}`}>
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`}>{inlineMarkdown(item)}</li>
        ))}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    if (/^#{1,3}\s+/.test(trimmed)) {
      flushList();
      blocks.push(
        <div
          key={`heading-${index}`}
          className={`chat-heading chat-heading-${trimmed.match(/^#{1,3}/)[0].length}`}
        >
          {inlineMarkdown(trimmed.replace(/^#{1,3}\s+/, ""))}
        </div>
      );
      return;
    }

    if (/^(\d+\.\s+|- )/.test(trimmed)) {
      listItems.push(trimmed.replace(/^(\d+\.\s+|- )/, ""));
      return;
    }

    flushList();
    blocks.push(
      <p key={`p-${index}`} className="chat-paragraph">
        {inlineMarkdown(trimmed)}
      </p>
    );
  });

  flushList();

  return blocks.length ? blocks : [<p className="chat-paragraph">{inlineMarkdown(text)}</p>];
};

function ChatBox() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState("live");
  const [sending, setSending] = useState(false);
  const apiRoot = API.defaults.baseURL.replace("/api", "");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await API.get("/chat/history");
      const items = res.data || [];
      setHistory(items);
      setHistoryLoaded(true);
      if (!messages.length && items.length) {
        const latest = items[items.length - 1];
        setMessages([
          { sender: "user", text: latest.question, createdAt: latest.createdAt },
          {
            sender: "bot",
            text: latest.answer,
            sources: latest.sourceTitle
              ? [{ title: latest.sourceTitle, fileUrl: latest.sourceFileUrl || "" }]
              : [],
            createdAt: latest.createdAt
          }
        ]);
      }
    } catch (error) {
      console.log(error);
      setHistoryLoaded(true);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setQuery("");
    setActiveChatId("live");
  };

  const openHistoryItem = (chat) => {
    setActiveChatId(chat._id);
    setMessages([
      {
        sender: "user",
        text: chat.question,
        createdAt: chat.createdAt
      },
      {
        sender: "bot",
        text: chat.answer,
        sources: chat.sourceTitle
          ? [{ title: chat.sourceTitle, fileUrl: chat.sourceFileUrl || "" }]
          : [],
        createdAt: chat.createdAt
      }
    ]);
  };

  const askQuestion = async () => {
    if (!query.trim()) return;

    const currentQuery = query;
    const userMessage = { sender: "user", text: currentQuery, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setSending(true);

    try {
      const res = await API.post("/docs/search", { query: currentQuery });
      const botMessage = {
        sender: "bot",
        text: res.data.answer,
        sources: res.data.sources ? [res.data.sources[0]].filter(Boolean) : [],
        answerType: res.data.answerType || "contextual",
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, botMessage]);
      setActiveChatId("live");
      loadHistory();
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong while answering.";
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: message, createdAt: new Date().toISOString(), error: true }
      ]);
      console.log(error);
    }

    setQuery("");
    setSending(false);
  };

  const sidebarItems = useMemo(() => history.slice().reverse(), [history]);

  return (
    <div className="chat-shell">
      <aside className="chat-history-rail">
        <div className="chat-rail-head">
          <div>
            <span className="section-kicker">History</span>
            <h3>Previous chats</h3>
          </div>
          <button className="ghost-btn chat-reset-btn" onClick={startNewChat}>
            New Chat
          </button>
        </div>

        <div className="chat-history-list">
          {!historyLoaded ? (
            <div className="empty-state">Loading chat history...</div>
          ) : sidebarItems.length ? (
            sidebarItems.map((chat) => (
              <button
                key={chat._id}
                type="button"
                className={`history-item ${activeChatId === chat._id ? "is-active" : ""}`}
                onClick={() => openHistoryItem(chat)}
              >
                <strong>{chat.question}</strong>
                <span>{formatTimestamp(chat.createdAt)}</span>
              </button>
            ))
          ) : (
            <div className="empty-state">Your chat history will appear here.</div>
          )}
        </div>
      </aside>

      <section className="chat-panel">
        <div className="chat-toolbar">
          <div className="chat-tip">
            <span className="section-kicker">Assistant</span>
            <h3>Ask about fees, exams, scholarships, hostels, timetables, or any notice in your preferred language.</h3>
          </div>
        </div>

        <div className="chat-history">
          {!historyLoaded ? (
            <div className="empty-state">Loading chat history...</div>
          ) : messages.length ? (
            messages.map((msg, index) => (
              <div
                key={`${msg.sender}-${index}`}
                className={msg.sender === "user" ? "user-message" : "bot-message"}
              >
                <div className="message-meta">
                  <span>{msg.sender === "user" ? "You" : "EduAssist"}</span>
                  {msg.sender === "bot" ? (
                    <em>{msg.answerType === "not_found" ? "Only PDF-based answers" : "1 PDF source"}</em>
                  ) : null}
                </div>
                <div className="message-body">
                  {msg.sender === "bot" ? renderRichText(msg.text) : <p className="chat-paragraph">{msg.text}</p>}
                  {msg.sender === "bot" && msg.sources?.length ? (
                    <div className="source-name-inline">
                      Source PDF: {msg.sources[0]?.title || "Uploaded PDF"}
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">Start a new conversation below.</div>
          )}
        </div>

        <div className="chat-input-area">
          <input
            className="chat-input"
            placeholder="Ask a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !sending) {
                askQuestion();
              }
            }}
          />
          <button className="ask-btn" onClick={askQuestion} disabled={sending}>
            {sending ? "Thinking..." : "Send"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ChatBox;
