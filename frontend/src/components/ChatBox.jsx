import {
  useState,
  useEffect
} from "react";

import API from "../services/api";

function ChatBox() {

  const [query, setQuery] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {

      const res =
        await API.get(
          "/chat/history"
        );

      const history = [];

      res.data.forEach((chat) => {

        history.push({
          sender: "user",
          text: chat.question
        });

        history.push({
          sender: "bot",
          text: chat.answer
        });

      });

      setMessages(history);

    } catch (error) {
      console.log(error);
    }
  };

  const askQuestion = async () => {

    if (!query.trim()) return;

    const userMessage = {
      sender: "user",
      text: query
    };

    setMessages((prev) => [
      ...prev,
      userMessage
    ]);

    try {

      const res =
        await API.post(
          "/docs/search",
          {
            query
          }
        );

      const botMessage = {
        sender: "bot",
        text: res.data.answer
      };

      setMessages((prev) => [
        ...prev,
        botMessage
      ]);

    } catch (error) {
      console.log(error);
    }

    setQuery("");
  };

  return (
    <div className="chat-wrapper">

      <div className="chat-history">

        {messages.map(
          (msg, index) => (
            <div
              key={index}
              className={
                msg.sender ===
                "user"
                  ? "user-message"
                  : "bot-message"
              }
            >
              {msg.text}
            </div>
          )
        )}

      </div>

      <div className="chat-input-area">

        <input
          className="chat-input"
          placeholder="Ask a question..."
          value={query}
          onChange={(e) =>
            setQuery(
              e.target.value
            )
          }
        />

        <button
          className="ask-btn"
          onClick={askQuestion}
        >
          Send
        </button>

      </div>

    </div>
  );
}

export default ChatBox;