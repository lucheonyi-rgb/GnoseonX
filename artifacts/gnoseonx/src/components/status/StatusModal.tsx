"use client";

import React, { useState, useRef } from "react";
import { useAppStore } from "@/store/appStore";
import { X, Image, Type, Palette, Clock, Eye, Send } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import type { StatusStory } from "@/types";

const BG_COLORS = [
  { label: "Violet", value: "bg-gradient-to-br from-violet-600 to-violet-400" },
  { label: "Neon", value: "bg-gradient-to-br from-green-600 to-neon" },
  { label: "Lava", value: "bg-gradient-to-br from-lava-500 to-orange-400" },
  { label: "Ocean", value: "bg-gradient-to-br from-blue-600 to-cyan-400" },
  { label: "Sunset", value: "bg-gradient-to-br from-orange-500 to-pink-500" },
  { label: "Dark", value: "bg-gradient-to-br from-bg to-surface" },
];

export const StatusModal = () => {
  const { showStatusModal, setShowStatusModal, currentUser, setStories, stories } = useAppStore();
  const [tab, setTab] = useState<"text" | "image">("text");
  const [text, setText] = useState("");
  const [bgColor, setBgColor] = useState(BG_COLORS[0].value);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!showStatusModal) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("Max 10MB!"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePost = () => {
    if (!text.trim() && !imagePreview) return;
    const newStory: StatusStory = {
      id: uuidv4(),
      userId: currentUser?.id || "user-me",
      userName: currentUser?.name || "You",
      userImage: currentUser?.image,
      text: text.trim() || undefined,
      mediaUrl: imagePreview || undefined,
      mediaType: imagePreview ? "image" : undefined,
      bgColor,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      viewers: [],
    };
    setStories([newStory, ...stories]);
    setText("");
    setImagePreview(null);
    setShowStatusModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface w-full max-w-sm mx-4 rounded-3xl shadow-neu-card border border-violet/15 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-violet/10">
          <h2 className="font-semibold text-text-primary">Add Status</h2>
          <button
            onClick={() => setShowStatusModal(false)}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-3 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-5 pt-4 gap-2">
          {(["text", "image"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                tab === t ? "bg-violet/20 text-violet font-medium" : "text-text-muted hover:bg-surface-3"
              }`}
            >
              {t === "text" ? <Type size={14} /> : <Image size={14} />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {tab === "text" ? (
            <>
              {/* Preview */}
              <div className={`relative h-48 rounded-2xl ${bgColor} flex items-center justify-center overflow-hidden border border-violet/10`}>
                <p className="text-white font-semibold text-lg text-center px-4 drop-shadow-lg break-words">
                  {text || <span className="opacity-40 text-sm">Your status text here...</span>}
                </p>
                {/* ASCII corners */}
                <span className="absolute top-2 left-2 font-mono text-[8px] text-white/20">╔═</span>
                <span className="absolute top-2 right-2 font-mono text-[8px] text-white/20">═╗</span>
                <span className="absolute bottom-2 left-2 font-mono text-[8px] text-white/20">╚═</span>
                <span className="absolute bottom-2 right-2 font-mono text-[8px] text-white/20">═╝</span>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 200))}
                maxLength={200}
                rows={3}
                placeholder="What's on your mind?"
                className="w-full bg-bg rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none resize-none neu-input border border-violet/10 focus:border-violet/30 transition-all"
              />
              <p className="text-[10px] text-text-muted text-right">{text.length}/200</p>

              {/* BG colors */}
              <div>
                <p className="text-xs text-text-muted mb-2 flex items-center gap-1">
                  <Palette size={12} /> Background
                </p>
                <div className="flex gap-2 flex-wrap">
                  {BG_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setBgColor(c.value)}
                      className={`w-8 h-8 rounded-xl ${c.value} border-2 transition-all ${
                        bgColor === c.value ? "border-white scale-110" : "border-transparent"
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {imagePreview ? (
                <div className="relative h-48 rounded-2xl overflow-hidden border border-violet/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 w-7 h-7 bg-lava rounded-xl flex items-center justify-center shadow-glow-l"
                  >
                    <X size={12} className="text-white" />
                  </button>
                  {text && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-3">
                      <p className="text-white text-sm text-center">{text}</p>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-48 rounded-2xl border-2 border-dashed border-violet/30 flex flex-col items-center justify-center gap-3 hover:border-violet/60 hover:bg-violet/5 transition-all"
                >
                  <Image size={32} className="text-violet/40" />
                  <p className="text-text-muted text-sm">Click to upload photo/video</p>
                  <p className="text-text-muted text-xs">Max 10MB</p>
                </button>
              )}

              <input
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 100))}
                placeholder="Add a caption (optional)"
                className="w-full bg-bg rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none neu-input border border-violet/10 focus:border-violet/30 transition-all"
              />
            </>
          )}

          {/* Expiry info */}
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Clock size={12} />
            <span>Expires in 24 hours</span>
          </div>

          {/* Post button */}
          <button
            onClick={handlePost}
            disabled={!text.trim() && !imagePreview}
            className="w-full py-3 rounded-2xl bg-violet text-white font-semibold shadow-glow-v hover:bg-violet-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send size={16} />
            Share Status
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleImageSelect}
        />
      </div>
    </div>
  );
};
