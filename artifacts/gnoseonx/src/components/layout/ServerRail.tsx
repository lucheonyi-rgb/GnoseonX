"use client";

import React from "react";
import { useAppStore } from "@/store/appStore";
import {
  MessageSquare,
  Users,
  Settings,
  Plus,
  Bell,
  Activity,
  MapPin,
  Compass,
} from "lucide-react";

interface ServerRailProps {
  onNotifClick: () => void;
}

export const ServerRail = ({ onNotifClick }: ServerRailProps) => {
  const {
    servers,
    activeServer,
    setActiveServer,
    setActiveChannel,
    activeView,
    setActiveView,
    notifications,
    setShowCreateServer,
    currentUser,
    setShowUserProfile,
  } = useAppStore();

  const unread = notifications.filter((n) => !n.read).length;

  const navItems = [
    { icon: <MessageSquare size={20} />, view: "dms" as const, label: "DMs" },
    { icon: <Users size={20} />, view: "friends" as const, label: "Friends" },
    { icon: <Activity size={20} />, view: "status" as const, label: "Status" },
    { icon: <MapPin size={20} />, view: "location" as const, label: "Location" },
  ];

  return (
    <div className="w-16 bg-bg-2 flex flex-col items-center py-2 gap-1 h-full border-r border-violet/10 overflow-y-auto overflow-x-hidden">
      {/* Logo */}
      <button
        className="w-10 h-10 rounded-2xl bg-violet flex items-center justify-center shadow-glow-v mb-2 hover:scale-105 transition-transform flex-shrink-0"
        onClick={() => setActiveView("servers")}
        title="GnoseonX"
      >
        <span className="font-mono font-bold text-white text-sm">⌘</span>
      </button>

      {/* Separator */}
      <div className="w-8 h-px bg-surface-3 mb-1 flex-shrink-0" />

      {/* Nav items */}
      {navItems.map(({ icon, view, label }) => {
        const active = activeView === view;
        return (
          <button
            key={view}
            title={label}
            onClick={() => {
              setActiveView(view);
              setActiveServer(null);
              setActiveChannel(null);
            }}
            className={`
              w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0
              transition-all duration-200 group relative
              ${active
                ? "bg-violet text-white shadow-glow-v"
                : "bg-surface text-text-secondary hover:bg-surface-3 hover:text-violet neu-btn"
              }
            `}
          >
            {icon}
            {/* Tooltip */}
            <span className="absolute left-14 bg-surface-4 text-text-primary text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 font-medium shadow-neu-card">
              {label}
            </span>
          </button>
        );
      })}

      {/* Separator */}
      <div className="w-8 h-px bg-surface-3 my-1 flex-shrink-0" />

      {/* Servers */}
      {servers.map((server) => {
        const active = activeServer?.id === server.id && activeView === "servers";
        return (
          <button
            key={server.id}
            title={server.name}
            onClick={() => {
              setActiveServer(server);
              setActiveView("servers");
              if (server.channels.length > 0) {
                setActiveChannel(server.channels[0]);
              }
            }}
            className={`
              w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0
              transition-all duration-200 group relative text-sm font-mono font-bold
              ${active
                ? "bg-violet text-white shadow-glow-v rounded-xl"
                : "bg-surface text-text-primary hover:bg-violet/20 hover:text-violet neu-btn"
              }
            `}
          >
            {server.icon || server.name.charAt(0)}
            {/* Tooltip */}
            <span className="absolute left-14 bg-surface-4 text-text-primary text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 font-medium shadow-neu-card max-w-[160px] truncate">
              {server.name}
            </span>
            {/* Active indicator */}
            {active && (
              <span className="absolute -left-1.5 w-1 h-5 bg-violet rounded-r-full" />
            )}
          </button>
        );
      })}

      {/* Add Server */}
      <button
        title="Add Server"
        onClick={() => setShowCreateServer(true)}
        className="w-10 h-10 rounded-2xl bg-surface text-neon hover:bg-neon/20 hover:shadow-glow-n
                   flex items-center justify-center neu-btn transition-all duration-200 group relative flex-shrink-0"
      >
        <Plus size={18} />
        <span className="absolute left-14 bg-surface-4 text-text-primary text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 font-medium shadow-neu-card">
          Add Server
        </span>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notifications */}
      <button
        title="Notifications"
        onClick={onNotifClick}
        className="relative w-10 h-10 rounded-2xl bg-surface text-text-secondary hover:bg-surface-3 hover:text-violet
                   flex items-center justify-center neu-btn transition-all duration-200 group flex-shrink-0"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-lava text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-glow-l">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Explore */}
      <button
        title="Explore"
        className="w-10 h-10 rounded-2xl bg-surface text-text-secondary hover:bg-surface-3 hover:text-violet
                   flex items-center justify-center neu-btn transition-all duration-200 flex-shrink-0"
      >
        <Compass size={18} />
      </button>

      {/* Settings */}
      <button
        title="Settings"
        onClick={() => setActiveView("settings")}
        className={`
          w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0
          transition-all duration-200
          ${activeView === "settings"
            ? "bg-violet text-white shadow-glow-v"
            : "bg-surface text-text-secondary hover:bg-surface-3 hover:text-violet neu-btn"
          }
        `}
      >
        <Settings size={18} />
      </button>

      {/* Current user avatar */}
      {currentUser && (
        <button
          onClick={() => setShowUserProfile(currentUser)}
          title={currentUser.name}
          className="w-10 h-10 rounded-2xl bg-violet/20 border-2 border-violet/40 flex items-center justify-center text-violet font-bold text-sm hover:border-violet transition-all mt-1 flex-shrink-0"
        >
          {currentUser.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentUser.image} alt={currentUser.name} className="w-full h-full rounded-2xl object-cover" />
          ) : (
            currentUser.name?.charAt(0).toUpperCase()
          )}
        </button>
      )}
    </div>
  );
};
