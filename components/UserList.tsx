"use client";
import { useEffect, useState } from "react";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";

export default function UserList({ onSelect }: { onSelect?: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();
  const socket = getSocket();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setUsers);

    socket.on("user-online", (userId: string) => {
      setUsers(prev =>
        prev.map(u => u._id === userId ? { ...u, isOnline: true } : u)
      );
    });

    socket.on("user-offline", (userId: string) => {
      setUsers(prev =>
        prev.map(u => u._id === userId ? { ...u, isOnline: false } : u)
      );
    });

    return () => {
      socket.off("user-online");
      socket.off("user-offline");
    };
  }, []);

  const startChat = async (userId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ to_userId: userId }),
    });

    const chat = await res.json();
    router.push(`/chats/${chat._id}`);
    onSelect?.();
  };

  return (
    <div className="w-full bg-white overflow-y-auto">
      <div className="p-4 font-semibold border-b bg-[#f0f2f5]">Contacts</div>

      {users.map(user => (
        <div
          key={user._id}
          onClick={() => startChat(user._id)}
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold">
              {user.name[0].toUpperCase()}
            </div>
            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                user.isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          </div>
          <span>{user.name}</span>
        </div>
      ))}
    </div>
  );
}
