"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { Modal } from "./Modal";
import { NeuButton } from "./NeuButton";
import { NeuInput } from "./NeuInput";
import { Server, Hash } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import type { Server as ServerType } from "@/types";
import { currentUserData } from "@/lib/mockData";

const serverIcons = ["◈", "⚔", "▸", "⌘", "◆", "★", "✦", "⬡", "◎", "⊕"];

export const CreateServerModal = () => {
  const {
    showCreateServer,
    setShowCreateServer,
    servers,
    setServers,
    setActiveServer,
    setActiveChannel,
    setActiveView,
    currentUser,
  } = useAppStore();

  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("◈");
  const user = currentUser || currentUserData;

  const handleCreate = () => {
    if (!name.trim()) return;

    const newServer: ServerType = {
      id: uuidv4(),
      name: name.trim(),
      icon: selectedIcon,
      ownerId: user.id,
      channels: [
        {
          id: `${uuidv4()}-general`,
          name: "general",
          type: "text",
          serverId: "",
          description: "General discussion",
          createdAt: new Date(),
        },
        {
          id: `${uuidv4()}-random`,
          name: "random",
          type: "text",
          serverId: "",
          description: "Random stuff",
          createdAt: new Date(),
        },
        {
          id: `${uuidv4()}-voice`,
          name: "Voice Lounge",
          type: "voice",
          serverId: "",
          description: "Voice channel",
          createdAt: new Date(),
        },
      ],
      members: [user],
      createdAt: new Date(),
    };

    // Fix channel serverId
    newServer.channels = newServer.channels.map((c) => ({
      ...c,
      serverId: newServer.id,
    }));

    setServers([...servers, newServer]);
    setActiveServer(newServer);
    setActiveChannel(newServer.channels[0]);
    setActiveView("servers");
    setShowCreateServer(false);
    setName("");
  };

  return (
    <Modal
      isOpen={showCreateServer}
      onClose={() => setShowCreateServer(false)}
      title="Create a Server"
      size="sm"
    >
      <div className="space-y-5">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-surface-200 shadow-neu-convex flex items-center justify-center text-3xl text-violet-300">
            {selectedIcon}
          </div>
          <p className="font-mono text-[10px] text-surface-400">
            ░▒▓ Your new community ▓▒░
          </p>
        </div>

        {/* Server name */}
        <div>
          <label className="font-mono text-xs text-surface-400 mb-1 block">
            Server Name
          </label>
          <NeuInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My awesome server"
            icon={<Server size={14} />}
          />
        </div>

        {/* Icon picker */}
        <div>
          <label className="font-mono text-xs text-surface-400 mb-2 block">
            Server Icon
          </label>
          <div className="flex gap-2 flex-wrap">
            {serverIcons.map((icon) => (
              <button
                key={icon}
                className={`w-10 h-10 rounded-xl font-mono text-lg flex items-center justify-center transition-all ${
                  selectedIcon === icon
                    ? "bg-violet-300 text-white shadow-neu-glow-violet scale-110"
                    : "bg-surface-200 shadow-neu-btn text-surface-500 hover:text-violet-400 hover:scale-105"
                }`}
                onClick={() => setSelectedIcon(icon)}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-surface-200 shadow-neu-input rounded-xl p-3">
          <p className="font-mono text-[10px] text-surface-400">
            <span className="text-violet-300">▸</span> Your server will be
            created with <span className="text-neon-400">#general</span>,{" "}
            <span className="text-neon-400">#random</span>, and a{" "}
            <span className="text-neon-400">Voice Lounge</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <NeuButton
            variant="default"
            className="flex-1"
            onClick={() => setShowCreateServer(false)}
          >
            <span className="text-xs">Cancel</span>
          </NeuButton>
          <NeuButton
            variant="violet"
            className="flex-1"
            onClick={handleCreate}
            disabled={!name.trim()}
          >
            <span className="text-xs">◈ Create Server</span>
          </NeuButton>
        </div>
      </div>
    </Modal>
  );
};
