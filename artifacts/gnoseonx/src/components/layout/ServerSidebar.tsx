"use client";

import React from "react";
import { useAppStore } from "@/store/appStore";
import { NeuIconButton } from "@/components/ui/NeuButton";
import { AsciiBadge } from "@/components/ui/AsciiDecorations";
import {
  MessageSquare,
  Users,
  Settings,
  Plus,
  Sparkles,
  Bell,
} from "lucide-react";
import { mockServers, mockNotifications } from "@/lib/mockData";

export const ServerSidebar = () => {
  const {
    activeServer,
    setActiveServer,
    activeView,
    setActiveView,
    servers,
    setActiveChannel,
    setShowCreateServer,
    notifications,
  } = useAppStore();

  const displayServers = servers.length > 0 ? servers : mockServers;
  const unreadNotifs = (
    notifications.length > 0 ? notifications : mockNotifications
  ).filter((n) => !n.read).length;

  const handleServerClick = (server: (typeof displayServers)[0]) => {
    setActiveServer(server);
    setActiveView("servers");
    if (server.channels.length > 0) {
      const textChannel = server.channels.find((c) => c.type === "text");
      if (textChannel) setActiveChannel(textChannel);
    }
  };

  return (
    <div className="w-[72px] bg-surface-200 flex flex-col items-center py-3 gap-2 h-full overflow-y-auto scrollbar-hide border-r border-surface-300/50">
      {/* Logo / Home */}
      <div className="relative mb-1">
        <NeuIconButton
          variant="violet"
          active={activeView === "dms"}
          onClick={() => {
            setActiveView("dms");
            setActiveServer(null);
          }}
          tooltip="Home"
        >
          <span className="font-ascii text-[10px]">GX</span>
        </NeuIconButton>
        {unreadNotifs > 0 && (
          <div className="absolute -top-1 -right-1">
            <AsciiBadge count={unreadNotifs} />
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-8 h-[2px] bg-surface-300 rounded-full mb-1" />

      {/* Servers */}
      <div className="flex flex-col gap-2 flex-1">
        {displayServers.map((server) => (
          <div key={server.id} className="relative group">
            {/* Active indicator */}
            <div
              className={`absolute -left-1 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-violet-300 transition-all ${
                activeServer?.id === server.id
                  ? "h-10"
                  : "h-0 group-hover:h-5"
              }`}
            />
            <NeuIconButton
              variant="default"
              active={activeServer?.id === server.id}
              onClick={() => handleServerClick(server)}
              tooltip={server.name}
              className={`text-lg ${
                activeServer?.id === server.id ? "rounded-2xl" : "rounded-3xl"
              } transition-all`}
            >
              {server.icon || server.name[0]}
            </NeuIconButton>
          </div>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-surface-300/50">
        <NeuIconButton
          variant="neon"
          onClick={() => setShowCreateServer(true)}
          tooltip="Create Server"
        >
          <Plus size={18} />
        </NeuIconButton>

        <NeuIconButton
          variant="default"
          active={activeView === "status"}
          onClick={() => setActiveView("status")}
          tooltip="Status Stories"
        >
          <Sparkles size={18} />
        </NeuIconButton>

        <NeuIconButton
          variant="default"
          active={activeView === "friends"}
          onClick={() => setActiveView("friends")}
          tooltip="Friends"
        >
          <Users size={18} />
        </NeuIconButton>

        <NeuIconButton
          variant="default"
          active={activeView === "settings"}
          onClick={() => setActiveView("settings")}
          tooltip="Settings"
        >
          <Settings size={18} />
        </NeuIconButton>
      </div>
    </div>
  );
};
