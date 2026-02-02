"use client";
import { useState } from "react";
import ChatList from "./ChatList";
import ContactsDrawer from "./contactsDrawer";
import { LogOut, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";

export default function Sidebar() {
  const [showContacts, setShowContacts] = useState(false);
  const router = useRouter();

const logout = () => {
  const token = localStorage.getItem("token");
  if (token) {
    const userId = JSON.parse(atob(token.split(".")[1])).userId;
    getSocket().emit("logout", userId);
  }

  localStorage.removeItem("token");
  router.push("/login");
};

  return (
    <div className="w-[100%] bg-white border-r relative">

      {/* HEADER */}
      <div className="h-[60px] bg-[#f0f2f5] flex items-center justify-between px-4">
        <div className="font-semibold">Chats</div>
        <button onClick={logout}>
          <LogOut size={20} />
        </button>
      </div>

      <ChatList />

      {/* FLOATING ADD BUTTON */}
      <button
        onClick={() => setShowContacts(true)}
        className="absolute bottom-6 right-6 bg-[#00a884] text-white p-4 rounded-full shadow-lg"
      >
        <Plus />
      </button>

      {showContacts && (
        <ContactsDrawer onClose={() => setShowContacts(false)} />
      )}
    </div>
  );
}
