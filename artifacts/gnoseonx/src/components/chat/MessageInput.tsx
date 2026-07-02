"use client";

import React, { useState, useRef, useCallback } from "react";
import { useAppStore } from "@/store/appStore";
import { useSocket } from "@/hooks/useSocket";
import {
  Plus, Smile, Send, Image, FileVideo, Paperclip, X, Mic, Reply,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import type { Message } from "@/types";
import { currentUserData } from "@/lib/mockData";

const EMOJIS = [
  "😀","😂","🥰","😎","🤔","😅","🔥","💯","⚡","🎉",
  "👍","❤️","✨","🚀","💪","🎯","👀","🤝","🙏","😤",
];

export const MessageInput = () => {
  const [text, setText] = useState("");
  const [showAttach, setShowAttach] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { activeChannel, activeDM, currentUser, replyTo, setReplyTo } = useAppStore();
  const { sendMessage } = useSocket();

  const user = currentUser || currentUserData;
  const MAX_SIZE = 10 * 1024 * 1024;

  const placeholder =
    activeChannel
      ? `Message #${activeChannel.name}`
      : activeDM
        ? `Message ${activeDM.participants.find((p) => p.id !== user.id)?.name || "..."}`
        : "Select a channel to chat...";

  const disabled = !activeChannel && !activeDM;

  const handleFileSelect = (file: File) => {
    if (file.size > MAX_SIZE) {
      alert(`File too large! Max 10MB (this file: ${(file.size / 1024 / 1024).toFixed(1)}MB)`);
      return;
    }
    setAttachedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("video/")) {
      setPreview("video");
    } else {
      setPreview("file");
    }
    setShowAttach(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = "";
  };

  const removeAttachment = () => { setAttachedFile(null); setPreview(null); };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = () => {
    if (!text.trim() && !attachedFile) return;
    if (!activeChannel && !activeDM) return;

    const msgType: Message["type"] = attachedFile
      ? attachedFile.type.startsWith("image/")
        ? "image"
        : attachedFile.type.startsWith("video/")
          ? "video"
          : "file"
      : "text";

    const payload = {
      id: uuidv4(),
      content: text.trim(),
      senderId: user.id,
      senderName: user.name,
      senderImage: user.image,
      channelId: activeChannel?.id,
      dmId: activeDM?.id,
      type: msgType,
      mediaUrl: preview && preview !== "video" && preview !== "file" ? preview : undefined,
      ...(replyTo ? {
        replyToId: replyTo.id,
        replyToSenderName: replyTo.senderName,
        replyToContent: replyTo.content.slice(0, 100),
      } : {}),
    };

    sendMessage(payload);

    setText("");
    setAttachedFile(null);
    setPreview(null);
    setShowEmoji(false);
    setReplyTo(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  return (
    <div className="px-4 pb-4 pt-2 flex-shrink-0">
      {/* Reply preview bar */}
      {replyTo && (
        <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-2 border border-violet/20">
          <Reply size={13} className="text-violet flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[11px] text-violet font-medium">{replyTo.senderName} </span>
            <span className="text-[11px] text-text-muted truncate">{replyTo.content.slice(0, 80)}</span>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="flex-shrink-0 text-text-muted hover:text-lava transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {isDragging && (
        <div
          className="fixed inset-0 z-50 bg-violet/10 border-2 border-dashed border-violet rounded-2xl flex items-center justify-center pointer-events-none"
          onDragLeave={() => setIsDragging(false)}
        >
          <p className="text-violet font-semibold text-lg">Drop file here (max 10MB)</p>
        </div>
      )}

      {preview && (
        <div className="mb-2 relative inline-flex">
          {preview === "video" ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-2 border border-violet/10">
              <FileVideo size={16} className="text-violet" />
              <span className="text-xs text-text-secondary">{attachedFile?.name}</span>
            </div>
          ) : preview === "file" ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-2 border border-violet/10">
              <Paperclip size={16} className="text-violet" />
              <span className="text-xs text-text-secondary">{attachedFile?.name}</span>
            </div>
          ) : (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="preview" className="h-24 w-auto rounded-xl object-cover border border-violet/10" />
            </div>
          )}
          <button
            onClick={removeAttachment}
            className="absolute -top-2 -right-2 w-5 h-5 bg-lava rounded-full flex items-center justify-center shadow-glow-l hover:scale-110 transition-transform"
          >
            <X size={10} className="text-white" />
          </button>
        </div>
      )}

      {showEmoji && (
        <div className="mb-2 p-3 bg-surface-2 rounded-2xl border border-violet/10 shadow-neu-card">
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setText((t) => t + e)}
                className="text-xl hover:scale-125 transition-transform w-8 h-8 flex items-center justify-center rounded-lg hover:bg-violet/10"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {showAttach && (
        <div className="mb-2 p-2 bg-surface-2 rounded-2xl border border-violet/10 shadow-neu-card flex gap-2 animate-slide-up">
          <AttachOption
            icon={<Image size={16} />}
            label="Image"
            color="text-neon"
            onClick={() => { fileRef.current?.click(); (fileRef.current as HTMLInputElement).accept = "image/*"; }}
          />
          <AttachOption
            icon={<FileVideo size={16} />}
            label="Video"
            color="text-violet"
            onClick={() => { if (fileRef.current) { fileRef.current.accept = "video/*"; fileRef.current.click(); } }}
          />
          <AttachOption
            icon={<Paperclip size={16} />}
            label="File"
            color="text-gold"
            onClick={() => { if (fileRef.current) { fileRef.current.accept = "*/*"; fileRef.current.click(); } }}
          />
        </div>
      )}

      <div
        className={`flex items-end gap-2 bg-surface rounded-2xl px-3 py-2 border ${
          isDragging ? "border-violet" : "border-violet/10 hover:border-violet/20"
        } transition-all neu-input`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDrop={handleDrop}
      >
        <button
          onClick={() => { setShowAttach(!showAttach); setShowEmoji(false); }}
          className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
            showAttach ? "bg-violet/20 text-violet" : "text-text-muted hover:text-violet hover:bg-violet/10"
          }`}
          disabled={disabled}
          title="Attach file (max 10MB)"
        >
          <Plus size={18} />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none resize-none min-h-[24px] max-h-[120px] leading-6 py-0.5"
        />

        <button
          onClick={() => { setShowEmoji(!showEmoji); setShowAttach(false); }}
          className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
            showEmoji ? "bg-violet/20 text-violet" : "text-text-muted hover:text-gold hover:bg-gold/10"
          }`}
          disabled={disabled}
          title="Emoji"
        >
          <Smile size={18} />
        </button>

        <button
          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:text-violet hover:bg-violet/10 transition-all"
          disabled={disabled}
          title="Voice message"
        >
          <Mic size={18} />
        </button>

        <button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !attachedFile)}
          className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
            text.trim() || attachedFile
              ? "bg-violet text-white shadow-glow-v hover:bg-violet-600 scale-100"
              : "text-text-muted opacity-50"
          }`}
          title="Send (Enter)"
        >
          <Send size={16} />
        </button>

        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={handleFileInput}
          accept="image/*,video/*"
        />
      </div>

      <p className="text-[10px] text-text-muted text-right mt-1 font-mono pr-1">
        Enter to send • Shift+Enter for new line
      </p>
    </div>
  );
};

const AttachOption = ({
  icon, label, color, onClick,
}: {
  icon: React.ReactNode; label: string; color: string; onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-surface-3 transition-all ${color}`}
  >
    {icon}
    <span className="text-[10px] text-text-muted">{label}</span>
  </button>
);
