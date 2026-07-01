"use client";

import React from "react";
import { useAppStore } from "@/store/appStore";
import {
  MessageSquare,
  Users,
  Activity,
  Compass,
  Settings,
  Bell,
  Menu,
} from "lucide-react";

export const MobileNav = () => {
  const {
    activeView,
    setActiveView,
    setActiveServer,
    setActiveChannel,
    notifications,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useAppStore();

  const unread = notifications.filter((n) => !n.read).length;

  const items = [
    { icon: <MessageSquare size={20} />, view: "dms" as const, label: "DMs" },
    { icon: <Users size={20} />, view: "friends" as const, label: "Friends" },
    {
      icon: (
        <div className="relative">
          <Bell size={20} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-lava text-white text-[8px] font-bold rounded-full flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </div>
      ),
      view: "notifications" as const,
      label: "Notif",
    },
    { icon: <Activity size={20} />, view: "status" as const, label: "Status" },
    { icon: <Settings size={20} />, view: "settings" as const, label: "Settings" },
  ];

  return (
    <div className="md:hidden flex items-center bg-bg-2 border-t border-violet/10 px-2 py-1 safe-area-bottom">
      {/* Hamburger for server/channel */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={`flex-1 flex flex-col items-center py-2 gap-0.5 rounded-xl transition-all ${
          mobileMenuOpen ? "text-violet" : "text-text-muted"
        }`}
      >
        <Menu size={20} />
        <span className="text-[9px]">Menu</span>
      </button>

      {items.map(({ icon, view, label }) => (
        <button
          key={view}
          onClick={() => {
            if (view !== "notifications") {
              setActiveView(view);
              setActiveServer(null);
              setActiveChannel(null);
            }
            setMobileMenuOpen(false);
          }}
          className={`flex-1 flex flex-col items-center py-2 gap-0.5 rounded-xl transition-all ${
            activeView === view ? "text-violet" : "text-text-muted"
          }`}
        >
          {icon}
          <span className="text-[9px]">{label}</span>
        </button>
      ))}
    </div>
  );
};
