"use client";
import UserList from "./UserList";
import { X } from "lucide-react";

export default function ContactsDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 bg-white z-50 animate-slide-in">
      <div className="h-[100px] bg-[#f0f2f5] flex items-center px-4 gap-4">
        <button onClick={onClose}>
          <X />
        </button>
        <span className="font-semibold">New Chat</span>
      </div>

      <UserList onSelect={onClose} />
    </div>
  );
}
