"use client";

import { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3005";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(SOCKET_URL, {
      transports: ["websocket"],
      forceNew: true,
    });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
