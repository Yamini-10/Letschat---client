"use client"

import { useEffect } from "react";
import "./globals.css";
import { getSocket } from "@/lib/socket";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const userId = JSON.parse(atob(token.split(".")[1])).userId;
    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("setup", userId); 
    });

    return () => {
      socket.off("connect");
    };
  }, []);
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
