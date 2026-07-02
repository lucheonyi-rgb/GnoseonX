"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { StatusStory } from "@/types";
import { useAppStore } from "@/store/appStore";
import { formatDistanceToNow } from "date-fns";
import { X, Eye, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const STORY_DURATION = 5000; // ms per story

interface StatusStoryBarProps {
  stories: StatusStory[];
  fullView?: boolean;
}

export const StatusStoryBar = ({ stories, fullView }: StatusStoryBarProps) => {
  const { setShowStatusModal } = useAppStore();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const openStory = (idx: number) => {
    setViewerIndex(idx);
    setViewerOpen(true);
  };

  const closeStory = () => setViewerOpen(false);

  if (fullView) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => setShowStatusModal(true)}
            className="flex items-center gap-3 p-3 rounded-2xl bg-surface-2 border-2 border-dashed border-violet/30 hover:border-violet/60 hover:bg-surface-3 transition-all w-full"
          >
            <div className="w-12 h-12 rounded-2xl bg-violet/20 flex items-center justify-center text-xl text-violet font-bold">+</div>
            <div className="text-left">
              <p className="text-sm font-medium text-text-primary">Add your status</p>
              <p className="text-xs text-text-muted">Share what you're up to — expires in 24h</p>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {stories.map((story, idx) => (
            <StoryCard key={story.id} story={story} onClick={() => openStory(idx)} />
          ))}
        </div>

        {stories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-text-muted text-sm">No active stories. Be the first to share!</p>
          </div>
        )}

        {viewerOpen && (
          <StoryViewer
            stories={stories}
            initialIndex={viewerIndex}
            onClose={closeStory}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 overflow-x-auto no-scrollbar">
      <button
        onClick={() => setShowStatusModal(true)}
        className="flex-shrink-0 flex flex-col items-center gap-1"
      >
        <div className="w-12 h-12 rounded-2xl bg-surface-2 border-2 border-dashed border-violet/40 flex items-center justify-center text-violet font-bold text-xl hover:border-violet transition-all hover:bg-surface-3">
          +
        </div>
        <span className="text-[9px] text-text-muted">Add</span>
      </button>

      {stories.slice(0, 8).map((story, idx) => (
        <button
          key={story.id}
          onClick={() => openStory(idx)}
          className="flex-shrink-0 flex flex-col items-center gap-1"
        >
          <div className="story-ring">
            <div className="w-12 h-12 rounded-2xl bg-surface-3 overflow-hidden flex items-center justify-center">
              {story.mediaUrl ? (
                <img src={story.mediaUrl} alt={story.userName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-base font-bold text-text-secondary">{story.userName.charAt(0)}</span>
              )}
            </div>
          </div>
          <span className="text-[9px] text-text-muted max-w-[48px] truncate">{story.userName.split(" ")[0]}</span>
        </button>
      ))}

      {viewerOpen && (
        <StoryViewer
          stories={stories}
          initialIndex={viewerIndex}
          onClose={closeStory}
        />
      )}
    </div>
  );
};

const StoryCard = ({ story, onClick }: { story: StatusStory; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="relative aspect-[9/16] rounded-2xl overflow-hidden group hover:scale-105 transition-transform"
    style={{ minHeight: 180 }}
  >
    {story.mediaUrl ? (
      <img src={story.mediaUrl} alt={story.userName} className="w-full h-full object-cover" />
    ) : (
      <div className={`w-full h-full ${story.bgColor || "bg-gradient-to-br from-violet-600 to-violet-400"} flex items-center justify-center`}>
        <p className="text-white font-semibold text-sm text-center px-3 drop-shadow">{story.text}</p>
      </div>
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    <div className="absolute bottom-2 left-2 right-2">
      <p className="text-white text-xs font-medium truncate">{story.userName}</p>
      <p className="text-white/60 text-[10px]">
        {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
      </p>
    </div>
    <div className="absolute top-2 left-2">
      <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-white border border-white/20">
        {story.userName.charAt(0)}
      </div>
    </div>
  </button>
);

const StoryViewer = ({
  stories,
  initialIndex,
  onClose,
}: {
  stories: StatusStory[];
  initialIndex: number;
  onClose: () => void;
}) => {
  const [index, setIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  const story = stories[index];
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number>(0);

  const goNext = useCallback(() => {
    if (index < stories.length - 1) {
      setIndex((i) => i + 1);
    } else {
      onClose();
    }
  }, [index, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (index > 0) setIndex((i) => i - 1);
  }, [index]);

  // Reset and start progress animation whenever story changes
  useEffect(() => {
    setProgress(0);
    pausedAtRef.current = 0;
    startTimeRef.current = null;

    if (paused) return;

    let cancelled = false;

    const tick = (ts: number) => {
      if (cancelled) return;
      if (startTimeRef.current === null) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current + pausedAtRef.current;
      const pct = Math.min(elapsed / STORY_DURATION, 1);
      setProgress(pct);
      if (pct < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        goNext();
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Handle pause/resume
  useEffect(() => {
    if (!paused) {
      // Resume: restart RAF from where we left off
      startTimeRef.current = null;
      let cancelled = false;

      const tick = (ts: number) => {
        if (cancelled) return;
        if (startTimeRef.current === null) startTimeRef.current = ts;
        const elapsed = ts - startTimeRef.current + pausedAtRef.current;
        const pct = Math.min(elapsed / STORY_DURATION, 1);
        setProgress(pct);
        if (pct < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          goNext();
        }
      };

      rafRef.current = requestAnimationFrame(tick);

      return () => {
        cancelled = true;
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          // Record how far we got
          pausedAtRef.current = progress * STORY_DURATION;
        }
      };
    } else {
      // Paused: cancel RAF
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        pausedAtRef.current = progress * STORY_DURATION;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const handleNavNext = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    goNext();
  };

  const handleNavPrev = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    goPrev();
  };

  if (!story) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-sm w-full mx-4 max-h-[85vh] aspect-[9/16] rounded-3xl overflow-hidden shadow-glow-v"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress segments */}
        <div className="absolute top-3 left-3 right-3 flex gap-1 z-20">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full bg-white/25 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{
                  width:
                    i < index
                      ? "100%"
                      : i === index
                      ? `${progress * 100}%`
                      : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Content */}
        {story.mediaUrl ? (
          story.mediaType === "video" ? (
            <video
              src={story.mediaUrl}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img src={story.mediaUrl} alt={story.userName} className="w-full h-full object-cover" />
          )
        ) : (
          <div className={`w-full h-full ${story.bgColor || "bg-gradient-to-br from-violet-600 to-violet-400"} flex items-center justify-center`}>
            <p className="text-white font-semibold text-xl text-center px-6 drop-shadow-lg">{story.text}</p>
          </div>
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/40 pointer-events-none" />

        {/* Top info */}
        <div className="absolute top-6 left-3 right-3 flex items-center gap-2 z-10">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-white text-sm border border-white/20">
            {story.userImage ? (
              <img src={story.userImage} alt={story.userName} className="w-full h-full object-cover rounded-xl" />
            ) : (
              story.userName.charAt(0)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold drop-shadow truncate">{story.userName}</p>
            <p className="text-white/60 text-[10px]">
              {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
            </p>
          </div>
          <button
            onClick={() => setPaused((p) => !p)}
            className="w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-all"
          >
            {paused ? <Play size={13} /> : <Pause size={13} />}
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* Caption */}
        {story.text && story.mediaUrl && (
          <div className="absolute bottom-16 left-3 right-3 z-10">
            <p className="text-white text-sm text-center bg-black/40 rounded-xl px-3 py-2 backdrop-blur-sm">{story.text}</p>
          </div>
        )}

        {/* Bottom views */}
        <div className="absolute bottom-4 left-3 right-3 flex items-center gap-2 z-10">
          <Eye size={12} className="text-white/60" />
          <span className="text-white/60 text-xs">{story.viewers?.length || 0} views</span>
          <span className="ml-auto text-white/40 text-xs">{index + 1} / {stories.length}</span>
        </div>

        {/* Tap zones for navigation (left half / right half) */}
        <div className="absolute inset-0 flex z-10 pointer-events-none">
          <button
            className="flex-1 h-full pointer-events-auto flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity"
            onClick={handleNavPrev}
            aria-label="Previous story"
          >
            <div className="w-9 h-9 rounded-2xl bg-black/30 backdrop-blur-sm flex items-center justify-center text-white">
              <ChevronLeft size={18} />
            </div>
          </button>
          <button
            className="flex-1 h-full pointer-events-auto flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity"
            onClick={handleNavNext}
            aria-label="Next story"
          >
            <div className="w-9 h-9 rounded-2xl bg-black/30 backdrop-blur-sm flex items-center justify-center text-white">
              <ChevronRight size={18} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
