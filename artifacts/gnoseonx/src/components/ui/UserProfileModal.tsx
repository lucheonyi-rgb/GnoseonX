"use client";

import React from "react";
import { useAppStore } from "@/store/appStore";
import { Modal } from "./Modal";
import { Avatar } from "./Avatar";
import { NeuButton } from "./NeuButton";
import { AsciiDivider } from "./AsciiDecorations";
import {
  MessageSquare,
  Phone,
  Video,
  MapPin,
  Clock,
  AtSign,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const UserProfileModal = () => {
  const { showUserProfile, setShowUserProfile, setActiveCall, setShowCallModal } =
    useAppStore();

  if (!showUserProfile) return null;
  const user = showUserProfile;

  const startCall = (type: "voice" | "video") => {
    setActiveCall({
      id: `call-${Date.now()}`,
      type,
      callerId: "user-me",
      callerName: user.name,
      callerImage: user.image,
      receiverId: user.id,
      status: "ringing",
      startedAt: new Date(),
    });
    setShowCallModal(true);
    setShowUserProfile(null);
  };

  return (
    <Modal
      isOpen={!!showUserProfile}
      onClose={() => setShowUserProfile(null)}
      size="sm"
    >
      <div className="space-y-4">
        {/* Banner */}
        <div className="relative -mx-6 -mt-6 h-28 bg-gradient-to-r from-violet-300 via-lava-200 to-neon-300 rounded-t-3xl">
          <div className="absolute -bottom-10 left-6">
            <div className="ring-4 ring-surface-100 rounded-3xl">
              <Avatar
                name={user.name}
                image={user.image}
                size="xl"
                status={user.status}
              />
            </div>
          </div>
        </div>

        <div className="pt-8">
          <h3 className="font-mono text-xl font-bold text-surface-500">
            {user.name}
          </h3>
          <p className="font-mono text-xs text-surface-400">{user.email}</p>
        </div>

        {/* Status */}
        {user.statusText && (
          <div className="bg-surface-200 shadow-neu-input rounded-xl p-3">
            <p className="font-mono text-xs text-surface-500">
              {user.statusText}
            </p>
          </div>
        )}

        <AsciiDivider variant="dots" />

        {/* Info */}
        <div className="space-y-2">
          {user.location && (
            <div className="flex items-center gap-2 font-mono text-xs text-surface-400">
              <MapPin size={14} className="text-lava-300" />
              <span>{user.location}</span>
            </div>
          )}
          {user.lastSeen && (
            <div className="flex items-center gap-2 font-mono text-xs text-surface-400">
              <Clock size={14} className="text-violet-300" />
              <span>
                Last seen{" "}
                {formatDistanceToNow(new Date(user.lastSeen), {
                  addSuffix: true,
                })}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <NeuButton variant="violet" className="flex-1">
            <MessageSquare size={16} />
            <span className="text-xs">Message</span>
          </NeuButton>
          <NeuButton
            variant="neon"
            size="icon"
            onClick={() => startCall("voice")}
          >
            <Phone size={16} />
          </NeuButton>
          <NeuButton
            variant="lava"
            size="icon"
            onClick={() => startCall("video")}
          >
            <Video size={16} />
          </NeuButton>
        </div>

        {/* ASCII art footer */}
        <div className="text-center font-mono text-[8px] text-surface-400/30 select-none">
          ╔═══════════════════╗<br />
          ║ GnoseonX Profile ║<br />
          ╚═══════════════════╝
        </div>
      </div>
    </Modal>
  );
};
