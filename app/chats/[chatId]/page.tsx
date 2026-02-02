"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { getSocket } from "@/lib/socket";

const getTicks = (status: string) => {
  if (status === "sent") return "✓";
  if (status === "delivered") return "✓✓";
  if (status === "seen") return "✓✓";
};

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const socket = getSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [chatUser, setChatUser] = useState<any>(null);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("token");
  const currentUserId = token
    ? JSON.parse(atob(token.split(".")[1])).userId
    : null;

  useEffect(() => {
    if (!chatId || !token) return;

    fetch(`http://localhost:5000/api/chats/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(chat => {
        const other = chat.users.find((u: any) => u._id !== currentUserId);
        setChatUser(other);
      });

    fetch(`http://localhost:5000/api/messages/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setMessages);

    socket.emit("join-chat", chatId);
    socket.emit("chat-opened", { chatId, userId: currentUserId });
  }, [chatId]);

  useEffect(() => {
    socket.on("message-received", msg => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on("message-status-updated", ({ messageId, status }) => {
      setMessages(prev =>
        prev.map(m => (m._id === messageId ? { ...m, status } : m))
      );
    });

    return () => {
      socket.off("message-received");
      socket.off("message-status-updated");
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    const res = await fetch("http://localhost:5000/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ chatId, content: text }),
    });

    const saved = await res.json();
    setMessages(prev => [...prev, saved]);
    socket.emit("new-message", saved);
    setText("");
  };

  return (
    <div className="flex flex-col h-screen bg-[#efeae2]">
      <div className="h-[60px] bg-[#f0f2f5] px-4 flex items-center">
        <div>
          <div className="font-medium">{chatUser?.name}</div>
          <div className="text-xs text-gray-500">
            {chatUser?.isOnline
              ? "online"
              : chatUser?.lastSeen
              ? `last seen ${new Date(chatUser.lastSeen).toLocaleString()}`
              : ""}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map(msg => {
          const isMe = msg.sender._id === currentUserId;
          return (
            <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`px-3 py-2 rounded-lg ${isMe ? "bg-[#d9fdd3]" : "bg-white"}`}>
                {msg.content}
                <div className="flex justify-end gap-1 text-[10px] text-gray-500">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {isMe && (
                    <span className={msg.status === "seen" ? "text-blue-500" : ""}>
                      {getTicks(msg.status)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="h-[60px] bg-[#f0f2f5] px-4 flex gap-2 items-center">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          className="flex-1 px-4 py-2 rounded-full"
          placeholder="Type a message"
        />
        <button onClick={sendMessage} className="bg-[#00a884] text-white px-4 py-2 rounded-full">
          Send
        </button>
      </div>
    </div>
  );
}
