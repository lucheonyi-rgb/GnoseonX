"use client";

import React, { useState } from "react";
import type { StatusStory } from "@/types";
import { useAppStore } from "@/store/appStore";
import { formatDistanceToNow } from "date-fns";
import { X, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { mockStories } from "@/lib/mockData";

interface StatusStoryBarProps {
  stories: StatusStory[];
  fullView?: boolean;
}

export const StatusStoryBar = ({ stories, fullView }: StatusStoryBarProps) => {
  const { setShowStatusModal, currentUser } = useAppStore();
  const [selectedStory, setSelectedStory] = useState<StatusStory | null>(null);
  const [storyIndex, setStoryIndex] = useState(0);

  // Group by user
  const grouped = stories.reduce((acc, story) => {
    if (!acc[story.userId]) acc[story.userId] = [];
    acc[story.userId].push(story);
    return acc;
  }, {} as Record<string, StatusStory[]>);

  const groupedArr = Object.values(grouped);

  const openStory = (story: StatusStory, idx: number) => {
    setSelectedStory(story);
    setStoryIndex(idx);
  };

  const closeStory = () => setSelectedStory(null);

  const allStories = stories;

  const nextStory = () => {
    const idx = allStories.findIndex((s) => s.id === selectedStory?.id);
    if (idx < allStories.length - 1) setSelectedStory(allStories[idx + 1]);
    else closeStory();
  };

  const prevStory = () => {
    const idx = allStories.findIndex((s) => s.id === selectedStory?.id);
    if (idx > 0) setSelectedStory(allStories[idx - 1]);
  };

  if (fullView) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        {/* Add story CTA */}
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

        {/* Story grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {stories.map((story, idx) => (
            <StoryCard key={story.id} story={story} onClick={() => openStory(story, idx)} />
          ))}
        </div>

        {stories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-text-muted text-sm">No active stories. Be the first to share!</p>
          </div>
        )}

        {selectedStory && (
          <StoryViewer
            story={selectedStory}
            onClose={closeStory}
            onNext={nextStory}
            onPrev={prevStory}
          />
        )}
      </div>
    );
  }

  // Horizontal strip
  return (
    <div className="flex items-center gap-3 px-4 py-2 overflow-x-auto no-scrollbar">
      {/* Add your story */}
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
          onClick={() => openStory(story, idx)}
          className="flex-shrink-0 flex flex-col items-center gap-1"
        >
          <div className="story-ring">
            <div className="w-12 h-12 rounded-2xl bg-surface-3 overflow-hidden flex items-center justify-center">
              {story.mediaUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={story.mediaUrl} alt={story.userName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-base font-bold text-text-secondary">{story.userName.charAt(0)}</span>
              )}
            </div>
          </div>
          <span className="text-[9px] text-text-muted max-w-[48px] truncate">{story.userName.split(" ")[0]}</span>
        </button>
      ))}

      {selectedStory && (
        <StoryViewer
          story={selectedStory}
          onClose={closeStory}
          onNext={nextStory}
          onPrev={prevStory}
        />
      )}
    </div>
  );
};

const StoryCard = ({ story, onClick }: { story: StatusStory; onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="relative aspect-[9/16] rounded-2xl overflow-hidden group hover:scale-105 transition-transform"
      style={{ minHeight: 180 }}
    >
      {story.mediaUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={story.mediaUrl} alt={story.userName} className="w-full h-full object-cover" />
      ) : (
        <div className={`w-full h-full ${story.bgColor || "bg-gradient-to-br from-violet-600 to-violet-400"} flex items-center justify-center`}>
          <p className="text-white font-semibold text-sm text-center px-3 drop-shadow">{story.text}</p>
        </div>
      )}
      {/* Overlay */}
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
};

const StoryViewer = ({
  story,
  onClose,
  onNext,
  onPrev,
}: {
  story: StatusStory;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-sm w-full mx-4 max-h-[80vh] aspect-[9/16] rounded-3xl overflow-hidden shadow-glow-v"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="absolute top-3 left-3 right-3 h-0.5 bg-white/20 rounded-full z-10">
          <div className="h-full bg-white rounded-full animate-[progress_5s_linear_forwards]" style={{ animation: "none", width: "60%" }} />
        </div>

        {/* Content */}
        {story.mediaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={story.mediaUrl} alt={story.userName} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full ${story.bgColor || "bg-gradient-to-br from-violet-600 to-violet-400"} flex items-center justify-center`}>
            <p className="text-white font-semibold text-xl text-center px-6 drop-shadow-lg">{story.text}</p>
          </div>
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

        {/* Top info */}
        <div className="absolute top-6 left-3 right-3 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-white text-sm border border-white/20">
            {story.userName.charAt(0)}
          </div>
          <div>
            <p className="text-white text-sm font-semibold drop-shadow">{story.userName}</p>
            <p className="text-white/60 text-[10px]">
              {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
            </p>
          </div>
          <button onClick={onClose} className="ml-auto w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-all">
            <X size={14} />
          </button>
        </div>

        {/* Caption overlay */}
        {story.text && story.mediaUrl && (
          <div className="absolute bottom-16 left-3 right-3">
            <p className="text-white text-sm text-center bg-black/40 rounded-xl px-3 py-2 backdrop-blur-sm">{story.text}</p>
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-4 left-3 right-3 flex items-center gap-2">
          <Eye size={12} className="text-white/60" />
          <span className="text-white/60 text-xs">{story.viewers?.length || 0} views</span>
        </div>

        {/* Nav buttons */}
        <button
          onClick={onPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-all"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={onNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-all"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
