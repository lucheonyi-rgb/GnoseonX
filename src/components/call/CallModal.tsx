"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  Volume2,
  VolumeX,
  Maximize2,
  X,
} from "lucide-react";

export const CallModal = () => {
  const { showCallModal, setShowCallModal, activeCall, setActiveCall } =
    useAppStore();
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [callTime, setCallTime] = useState(0);
  const [callStatus, setCallStatus] = useState<"ringing" | "connected" | "ended">("ringing");
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    if (showCallModal) {
      setCallStatus("ringing");
      setCallTime(0);
      const timer = setTimeout(() => setCallStatus("connected"), 2500);
      return () => clearTimeout(timer);
    }
  }, [showCallModal]);

  useEffect(() => {
    if (callStatus === "connected") {
      const interval = setInterval(() => setCallTime((t) => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [callStatus]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const endCall = () => {
    setCallStatus("ended");
    setTimeout(() => {
      setShowCallModal(false);
      setActiveCall(null);
      setCallStatus("ringing");
      setCallTime(0);
      setMuted(false);
      setVideoOn(true);
    }, 600);
  };

  if (!activeCall || !showCallModal) return null;

  // Minimized (PiP)
  if (minimized) {
    return (
      <div className="fixed bottom-20 md:bottom-6 right-4 z-50 animate-slide-up">
        <div className="bg-surface-2 rounded-2xl shadow-neu-card border border-violet/20 overflow-hidden">
          <div className="relative w-48 h-28 bg-bg-3 flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-violet/20 flex items-center justify-center mx-auto mb-1">
                <span className="text-xl">{activeCall.callerName.charAt(0)}</span>
              </div>
              <p className="text-xs text-text-primary font-medium">{activeCall.callerName}</p>
              {callStatus === "connected" && (
                <p className="text-[10px] text-neon font-mono">{formatTime(callTime)}</p>
              )}
              {callStatus === "ringing" && (
                <p className="text-[10px] text-gold font-mono animate-glow-pulse">Calling...</p>
              )}
            </div>
            <button
              onClick={() => setMinimized(false)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-surface flex items-center justify-center text-text-muted hover:text-text-primary"
            >
              <Maximize2 size={10} />
            </button>
          </div>
          <div className="flex items-center justify-around p-2">
            <button onClick={() => setMuted(!muted)} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${muted ? "bg-lava/20 text-lava" : "bg-surface text-text-muted hover:text-text-primary"}`}>
              {muted ? <MicOff size={14} /> : <Mic size={14} />}
            </button>
            <button onClick={endCall} className="w-10 h-8 rounded-xl bg-lava flex items-center justify-center shadow-glow-l hover:bg-red-600 transition-all">
              <PhoneOff size={14} className="text-white" />
            </button>
            {activeCall.type === "video" && (
              <button onClick={() => setVideoOn(!videoOn)} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${!videoOn ? "bg-lava/20 text-lava" : "bg-surface text-text-muted hover:text-text-primary"}`}>
                {videoOn ? <Video size={14} /> : <VideoOff size={14} />}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface w-full max-w-md mx-4 rounded-3xl shadow-neu-card border border-violet/15 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            {activeCall.type === "video" ? (
              <Video size={16} className="text-violet" />
            ) : (
              <Phone size={16} className="text-neon" />
            )}
            <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
              {activeCall.type === "video" ? "Video Call" : "Voice Call"}
            </span>
          </div>
          <button
            onClick={() => setMinimized(true)}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-3 transition-all"
            title="Minimize"
          >
            <Maximize2 size={14} />
          </button>
        </div>

        {/* Video/Avatar area */}
        <div className="relative mx-5 mb-4 aspect-video bg-bg-3 rounded-2xl overflow-hidden border border-violet/10">
          <div className="absolute inset-0 flex items-center justify-center">
            {callStatus === "ringing" ? (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-violet/20 flex items-center justify-center mx-auto animate-ring">
                  <span className="text-3xl font-bold text-violet">{activeCall.callerName.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-text-primary">{activeCall.callerName}</p>
                  <p className="text-sm text-gold font-mono animate-glow-pulse">▸▸▸ Calling...</p>
                </div>
              </div>
            ) : callStatus === "connected" ? (
              <div className="text-center space-y-3">
                <div className="w-20 h-20 rounded-2xl bg-violet/20 flex items-center justify-center mx-auto">
                  <span className="text-3xl font-bold text-violet">{activeCall.callerName.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-text-primary">{activeCall.callerName}</p>
                  <div className="flex items-center gap-1.5 justify-center">
                    <span className="w-2 h-2 rounded-full bg-neon shadow-glow-n animate-glow-pulse" />
                    <span className="text-sm text-neon font-mono">{formatTime(callTime)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <p className="text-lava font-semibold">Call Ended</p>
                <p className="text-text-muted text-sm font-mono">{formatTime(callTime)}</p>
              </div>
            )}
          </div>

          {/* Self preview (PiP) */}
          {videoOn && callStatus === "connected" && activeCall.type === "video" && (
            <div className="absolute bottom-3 right-3 w-24 h-16 rounded-xl bg-surface-3 border-2 border-surface flex items-center justify-center text-[10px] text-text-muted shadow-neu-card">
              You
            </div>
          )}

          {/* ASCII corner decorations */}
          <span className="absolute top-3 left-3 font-mono text-[8px] text-violet/20 leading-none">╔══</span>
          <span className="absolute top-3 right-3 font-mono text-[8px] text-violet/20 leading-none">══╗</span>
          <span className="absolute bottom-3 left-3 font-mono text-[8px] text-violet/20 leading-none">╚══</span>
          <span className="absolute bottom-3 right-3 font-mono text-[8px] text-violet/20 leading-none">══╝</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 px-5 pb-6">
          <CallBtn
            onClick={() => setMuted(!muted)}
            active={muted}
            activeColor="bg-lava/20 text-lava"
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? <MicOff size={18} /> : <Mic size={18} />}
          </CallBtn>

          {activeCall.type === "video" && (
            <CallBtn
              onClick={() => setVideoOn(!videoOn)}
              active={!videoOn}
              activeColor="bg-lava/20 text-lava"
              title={videoOn ? "Disable Video" : "Enable Video"}
            >
              {videoOn ? <Video size={18} /> : <VideoOff size={18} />}
            </CallBtn>
          )}

          <CallBtn
            onClick={() => setSpeakerOn(!speakerOn)}
            active={!speakerOn}
            activeColor="bg-lava/20 text-lava"
            title={speakerOn ? "Mute Speaker" : "Unmute Speaker"}
          >
            {speakerOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </CallBtn>

          <CallBtn title="Share Screen" onClick={() => {}}>
            <Monitor size={18} />
          </CallBtn>

          {/* End call */}
          <button
            onClick={endCall}
            className="w-14 h-12 rounded-2xl bg-lava text-white flex items-center justify-center shadow-glow-l hover:bg-red-600 active:scale-95 transition-all"
            title="End Call"
          >
            <PhoneOff size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const CallBtn = ({
  children,
  onClick,
  active,
  activeColor = "bg-violet/20 text-violet",
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  activeColor?: string;
  title: string;
}) => (
  <button
    onClick={onClick}
    title={title}
    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all neu-btn ${
      active
        ? activeColor
        : "bg-surface-2 text-text-secondary hover:bg-surface-3 hover:text-text-primary"
    }`}
  >
    {children}
  </button>
);
