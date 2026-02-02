"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  autoConnect: false,
});

type Message = {
  sender: string;
  text: string;
};

export default function ChatWindow({ chatId }: { chatId: string }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!chatId) return;

    const token = localStorage.getItem("token");

    fetch(`http://localhost:5000/api/messages/${chatId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setMessages(data));
  }, [chatId]);


  const sendMessage = () => {
    if (!message.trim()) return;

    const userId = JSON.parse(atob(localStorage.getItem("token")!.split(".")[1]))
      .userId;

    const msgData = {
      chatId,
      text: message,
      senderId: userId,
    };

    socket.emit("sendMessage", msgData);
    setMessage("");
  };


  return (
    <div style={styles.container}>
      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              alignSelf: msg.sender === "me" ? "flex-end" : "flex-start",
              background: msg.sender === "me" ? "#dcf8c6" : "#fff",
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Keyboard */}
      <div style={styles.inputBox}>
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Type a message"
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.button}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
  },
  messages: {
    flex: 1,
    padding: 10,
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
    overflowY: "auto" as const,
    background: "#e5ddd5",
  },
  message: {
    padding: "8px 12px",
    borderRadius: 8,
    maxWidth: "60%",
    fontSize: 14,
  },
  inputBox: {
    display: "flex",
    padding: 10,
    borderTop: "1px solid #ddd",
    background: "#f0f0f0",
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    border: "1px solid #ccc",
    outline: "none",
  },
  button: {
    marginLeft: 10,
    padding: "8px 16px",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
  },
};
