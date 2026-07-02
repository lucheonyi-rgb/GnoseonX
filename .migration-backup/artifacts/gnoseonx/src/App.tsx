import React, { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/components/auth/LoginPage";
import { useAppStore } from "@/store/appStore";
import { getSocket } from "@/lib/socket";
import { currentUserData, mockServers, mockUsers, mockDMs, mockNotifications } from "@/lib/mockData";
import type { User, Message } from "@/types";

const SESSION_KEY = "gnoseonx_session";

export function saveSession(user: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function loadSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User;
    if (!parsed.id || !parsed.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function App() {
  const {
    currentUser,
    setCurrentUser,
    setServers,
    setActiveServer,
    setActiveChannel,
    setAllUsers,
    setDirectMessages,
    addNotification,
    addMessage,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(true);

  // Register new_message listener ONCE at the app root — never in child components
  const addMessageRef = useRef(addMessage);
  useEffect(() => { addMessageRef.current = addMessage; }, [addMessage]);
  useEffect(() => {
    const socket = getSocket();
    const handler = (data: Message & { createdAt: string }) => {
      addMessageRef.current({
        ...data,
        createdAt: new Date(data.createdAt),
        reactions: data.reactions ?? [],
        edited: data.edited ?? false,
      });
    };
    socket.on("new_message", handler);
    return () => { socket.off("new_message", handler); };
  }, []);

  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      setCurrentUser(saved);
      setServers(mockServers);
      setActiveServer(mockServers[0]);
      setActiveChannel(mockServers[0].channels[0]);
      setAllUsers(mockUsers);
      setDirectMessages(mockDMs);
    }
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = (user: User) => {
    saveSession(user);
    setCurrentUser(user);
    setServers(mockServers);
    setActiveServer(mockServers[0]);
    setActiveChannel(mockServers[0].channels[0]);
    setAllUsers(mockUsers);
    setDirectMessages(mockDMs);
    mockNotifications.forEach((n) => addNotification(n));
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-violet/30 animate-spin-slow" />
            <div className="absolute inset-2 rounded-full border-2 border-neon/40 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "2s" }} />
            <div className="absolute inset-4 rounded-full bg-surface flex items-center justify-center neu-flat">
              <span className="text-violet text-lg font-mono">⌘</span>
            </div>
          </div>
          <p className="font-mono text-xs text-text-muted animate-glow-pulse">
            Loading GnoseonX...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <AppShell />;
}
