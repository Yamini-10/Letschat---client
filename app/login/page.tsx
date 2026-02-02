"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const submit = async () => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    localStorage.setItem("token", data.token);

    const userId = JSON.parse(atob(data.token.split(".")[1])).userId;
    getSocket().emit("setup", userId);

    router.push("/chats");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#00a884]">
      <div className="bg-white p-8 rounded w-[350px] space-y-4">
        <h2 className="text-xl font-semibold">Login</h2>
        <input className="w-full border p-2" placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input className="w-full border p-2" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
        <button onClick={submit} className="w-full bg-[#00a884] text-white py-2 rounded">
          Login
        </button>
      </div>
    </div>
  );
}
