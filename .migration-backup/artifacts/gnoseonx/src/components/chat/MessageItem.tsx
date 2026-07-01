"use client";

import React, { useState } from "react";
import type { Message } from "@/types";
import { useAppStore } from "@/store/appStore";
import { format } from "date-fns";
import {
  Smile,
  Reply,
  MoreHorizontal,
  Edit2,
  Trash2,
  Phone,
  Video,
  File,
  Play,
} from "lucide-react";

interface MessageItemProps {
  message: Message;
  compact?: boolean;
}

const EMOJIS = ["👍", "❤️", "😂", "🔥", "😮", "😢", "🎉", "💯"];

export const MessageItem = ({ message, compact }: MessageItemProps) => {
  const { currentUser, addMessage } = useAppStore();
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isOwn = message.senderId === (currentUser?.id || "user-me");
  const isSystem = message.type === "system";
  const isCall = message.type === "call";

  const handleReact = (emoji: string) => {
    // In real app, would update reactions via API
    setShowEmojiPicker(false);
  };

  if (isSystem) {
    return (
      <div className="flex items-center justify-center py-1">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface/30 border border-violet/5">
          <span className="font-mono text-[10px] text-text-muted">{message.content}</span>
        </div>
      </div>
    );
  }

  if (isCall) {
    return (
      <div className="flex items-center justify-center py-1">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/30 border border-violet/10">
          {message.content.includes("video") ? (
            <Video size={14} className="text-violet" />
          ) : (
            <Phone size={14} className="text-neon" />
          )}
          <span className="text-xs text-text-muted">{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-start gap-3 px-2 py-0.5 rounded-xl hover:bg-surface/30 transition-all relative animate-fade-in ${
        compact ? "mt-0.5" : "mt-2"
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmojiPicker(false); }}
    >
      {/* Avatar */}
      {!compact ? (
        <div className="flex-shrink-0 w-9 h-9 rounded-2xl bg-surface-2 flex items-center justify-center text-sm font-bold text-text-secondary hover:bg-surface-3 transition-all cursor-pointer">
          {message.senderImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={message.senderImage} alt={message.senderName} className="w-full h-full rounded-2xl object-cover" />
          ) : (
            message.senderName?.charAt(0)
          )}
        </div>
      ) : (
        <div className="w-9 flex-shrink-0" />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {!compact && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className={`text-sm font-semibold cursor-pointer hover:underline ${isOwn ? "text-violet-300" : "text-text-primary"}`}>
              {message.senderName}
            </span>
            <span className="text-[10px] text-text-muted font-mono">
              {format(new Date(message.createdAt), "HH:mm")}
            </span>
            {message.edited && (
              <span className="text-[9px] text-text-muted font-mono">(edited)</span>
            )}
          </div>
        )}

        {/* Text content */}
        {message.content && (
          <p className="text-sm text-text-secondary leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
          </p>
        )}

        {/* Image */}
        {message.type === "image" && message.mediaUrl && (
          <div className="mt-2 rounded-xl overflow-hidden max-w-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.mediaUrl}
              alt="Attachment"
              className="w-full object-cover rounded-xl max-h-64 cursor-pointer hover:opacity-90 transition-opacity"
            />
          </div>
        )}

        {/* Video */}
        {message.type === "video" && (
          <div className="mt-2 rounded-xl overflow-hidden max-w-sm bg-surface-2 p-3 flex items-center gap-3 border border-violet/10">
            <div className="w-10 h-10 rounded-xl bg-violet/20 flex items-center justify-center">
              <Play size={16} className="text-violet" />
            </div>
            <div>
              <p className="text-xs font-medium text-text-primary">Video attachment</p>
              <p className="text-[10px] text-text-muted">Click to play</p>
            </div>
          </div>
        )}

        {/* File */}
        {message.type === "file" && (
          <div className="mt-2 rounded-xl bg-surface-2 p-3 flex items-center gap-3 border border-violet/10 max-w-xs">
            <div className="w-10 h-10 rounded-xl bg-violet/20 flex items-center justify-center">
              <File size={16} className="text-violet" />
            </div>
            <div>
              <p className="text-xs font-medium text-text-primary">File attachment</p>
              <p className="text-[10px] text-text-muted">Click to download</p>
            </div>
          </div>
        )}

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex items-center flex-wrap gap-1 mt-1.5">
            {message.reactions.map((r, i) => (
              <button
                key={i}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface/60 hover:bg-surface-3 border border-violet/10 transition-all"
              >
                <span className="text-xs">{r.emoji}</span>
                <span className="text-[10px] font-mono text-text-muted">{r.users.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action toolbar */}
      {showActions && (
        <div className="absolute -top-4 right-3 flex items-center gap-1 bg-surface-2 rounded-xl px-2 py-1 shadow-neu-card border border-violet/10 z-10 animate-fade-in">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1 rounded-lg text-text-muted hover:text-violet hover:bg-violet/10 transition-all"
            title="React"
          >
            <Smile size={14} />
          </button>
          <button
            className="p-1 rounded-lg text-text-muted hover:text-violet hover:bg-violet/10 transition-all"
            title="Reply"
          >
            <Reply size={14} />
          </button>
          {isOwn && (
            <>
              <button
                className="p-1 rounded-lg text-text-muted hover:text-violet hover:bg-violet/10 transition-all"
                title="Edit"
              >
                <Edit2 size={14} />
              </button>
              <button
                className="p-1 rounded-lg text-text-muted hover:text-lava hover:bg-lava/10 transition-all"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
          <button
            className="p-1 rounded-lg text-text-muted hover:text-violet hover:bg-violet/10 transition-all"
            title="More"
          >
            <MoreHorizontal size={14} />
          </button>

          {/* Emoji picker dropdown */}
          {showEmojiPicker && (
            <div className="absolute top-8 right-0 flex gap-1 bg-surface-2 rounded-xl px-2 py-2 shadow-neu-card border border-violet/10 z-20">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className="text-base hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
