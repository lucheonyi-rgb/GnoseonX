import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/components/auth/LoginPage";
import { useAppStore } from "@/store/appStore";
import { currentUserData, mockServers, mockUsers, mockDMs, mockNotifications } from "@/lib/mockData";

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
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = (user: typeof currentUserData) => {
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
