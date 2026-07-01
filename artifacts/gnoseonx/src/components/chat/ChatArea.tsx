"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/appStore";
import { useSocket } from "@/hooks/useSocket";
import { MessageItem } from "./MessageItem";
import { MessageInput } from "./MessageInput";
import {
  Hash,
  Phone,
  Video,
  Users,
  Bell,
  Search,
  Pin,
  Activity,
  MapPin,
  Settings,
  Loader2,
} from "lucide-react";
import {
  currentUserData,
  mockUsers,
  mockStories,
} from "@/lib/mockData";
import type { Message } from "@/types";
import { StatusStoryBar } from "@/components/status/StatusStoryBar";
import { FriendsView } from "@/components/ui/FriendsView";
import { LocationView } from "@/components/ui/LocationView";

interface ChatAreaProps {
  onNotifClick: () => void;
}

export const ChatArea = ({ onNotifClick }: ChatAreaProps) => {
  const {
    activeChannel,
    activeDM,
    activeView,
    messages: storeMessages,
    setMessages,
    currentUser,
    memberListOpen,
    setMemberListOpen,
    setShowCallModal,
    setActiveCall,
  } = useAppStore();

  const { joinRoom } = useSocket();
  const [loadingHistory, setLoadingHistory] = useState(false);
  const user = currentUser || currentUserData;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine current room ID
  const roomId = activeChannel
    ? `channel:${activeChannel.id}`
    : activeDM
      ? `dm:${activeDM.id}`
      : null;

  // Load message history from DB and join socket room when channel/DM changes
  useEffect(() => {
    if (!roomId) return;

    joinRoom(roomId);
    setMessages([]);
    setLoadingHistory(true);

    const params = activeChannel
      ? `channelId=${activeChannel.id}`
      : `dmId=${activeDM!.id}`;

    fetch(`/api/messages?${params}`)
      .then((r) => r.json())
      .then((data: Array<Message & { createdAt: string }>) => {
        const msgs: Message[] = data.map((m) => ({
          ...m,
          createdAt: new Date(m.createdAt),
          reactions: m.reactions ?? [],
          edited: m.edited ?? false,
        }));
        setMessages(msgs);
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChannel?.id, activeDM?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [storeMessages.length]);

  const startCall = (type: "voice" | "video") => {
    if (activeDM) {
      const other = activeDM.participants.find((p) => p.id !== user.id);
      if (other) {
        setActiveCall({
          id: `call-${Date.now()}`,
          type,
          callerId: user.id,
          callerName: user.name,
          callerImage: user.image,
          receiverId: other.id,
          status: "ringing",
          startedAt: new Date(),
        });
        setShowCallModal(true);
      }
    }
  };

  if (activeView === "friends") return <FriendsView />;
  if (activeView === "status") return <StatusView />;
  if (activeView === "settings") return <SettingsView />;
  if (activeView === "location") return <LocationView />;
  if (!activeChannel && !activeDM) return <WelcomeView />;

  const headerName =
    activeChannel?.name ||
    activeDM?.participants.find((p) => p.id !== user.id)?.name ||
    "Unknown";

  const otherUser = activeDM?.participants.find((p) => p.id !== user.id) || null;

  const displayMessages = storeMessages.filter((m) =>
    activeChannel ? m.channelId === activeChannel.id : m.dmId === activeDM?.id
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-bg">
      {/* Header */}
      <div className="h-12 flex items-center px-4 gap-3 border-b border-violet/10 bg-bg-2 flex-shrink-0">
        {activeChannel ? (
          <Hash size={16} className="text-text-muted flex-shrink-0" />
        ) : (
          <div className="relative flex-shrink-0">
            <div className="w-7 h-7 rounded-xl bg-surface flex items-center justify-center text-xs font-bold text-text-secondary">
              {otherUser?.name.charAt(0)}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-bg-2 status-${otherUser?.status || "offline"}`} />
          </div>
        )}
        <h2 className="font-semibold text-sm text-text-primary flex-1 truncate">
          {headerName}
        </h2>
        {activeChannel?.description && (
          <span className="hidden md:block text-xs text-text-muted border-l border-violet/10 pl-3 truncate max-w-xs">
            {activeChannel.description}
          </span>
        )}
        <div className="flex items-center gap-1 ml-auto">
          {activeDM && (
            <>
              <HeaderBtn onClick={() => startCall("voice")} title="Voice Call"><Phone size={16} /></HeaderBtn>
              <HeaderBtn onClick={() => startCall("video")} title="Video Call"><Video size={16} /></HeaderBtn>
            </>
          )}
          <HeaderBtn onClick={() => setMemberListOpen(!memberListOpen)} title="Members" active={memberListOpen}><Users size={16} /></HeaderBtn>
          <HeaderBtn onClick={onNotifClick} title="Notifications"><Bell size={16} /></HeaderBtn>
          <HeaderBtn title="Search"><Search size={16} /></HeaderBtn>
          <HeaderBtn title="Pin Messages"><Pin size={16} /></HeaderBtn>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {loadingHistory && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="text-violet animate-spin" />
          </div>
        )}

        {!loadingHistory && activeChannel && displayMessages.length === 0 && (
          <ChannelWelcome name={activeChannel.name} />
        )}

        {!loadingHistory && activeDM && displayMessages.length === 0 && (
          <DMWelcome name={otherUser?.name || "Unknown"} />
        )}

        {displayMessages.map((msg, idx) => {
          const prev = displayMessages[idx - 1];
          const grouped =
            prev &&
            prev.senderId === msg.senderId &&
            new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60 * 1000;
          return <MessageItem key={msg.id} message={msg} compact={grouped} />;
        })}

        <div ref={messagesEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

const HeaderBtn = ({
  children, onClick, title, active,
}: {
  children: React.ReactNode; onClick?: () => void; title: string; active?: boolean;
}) => (
  <button
    onClick={onClick}
    title={title}
    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
      active ? "bg-violet/20 text-violet" : "text-text-muted hover:text-text-primary hover:bg-surface/60"
    }`}
  >
    {children}
  </button>
);

const ChannelWelcome = ({ name }: { name: string }) => (
  <div className="py-8 flex flex-col items-start gap-3">
    <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center shadow-glow-v">
      <Hash size={32} className="text-violet" />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-1">Welcome to #{name}</h2>
      <p className="text-text-muted text-sm">
        This is the beginning of the <span className="text-text-primary font-medium">#{name}</span> channel.
      </p>
    </div>
    <div className="h-px w-full bg-violet/10 my-2" />
  </div>
);

const DMWelcome = ({ name }: { name: string }) => (
  <div className="py-8 flex flex-col items-start gap-3">
    <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center shadow-glow-v text-2xl font-bold text-violet">
      {name.charAt(0)}
    </div>
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-1">{name}</h2>
      <p className="text-text-muted text-sm">
        This is the beginning of your conversation with <span className="text-text-primary font-medium">{name}</span>.
      </p>
    </div>
    <div className="h-px w-full bg-violet/10 my-2" />
  </div>
);

const WelcomeView = () => {
  const { setActiveView } = useAppStore();
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-bg gap-6">
      <div className="w-24 h-24 rounded-3xl bg-surface-2 flex items-center justify-center shadow-glow-v animate-glow-pulse">
        <span className="text-4xl font-mono text-violet">⌘</span>
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-2">GnoseonX</h1>
        <p className="text-text-muted text-sm">Select a channel or DM to start chatting</p>
      </div>
      <pre className="font-mono text-[9px] text-violet/40 leading-3 select-none">
{`╔══════════════════════╗
║  ◈ Ready to connect  ║
╚══════════════════════╝`}
      </pre>
    </div>
  );
};

const StatusView = () => {
  const stories = mockStories;
  const { setShowStatusModal } = useAppStore();
  return (
    <div className="flex-1 flex flex-col bg-bg overflow-hidden">
      <div className="h-12 flex items-center px-4 gap-3 border-b border-violet/10 bg-bg-2 flex-shrink-0">
        <Activity size={16} className="text-violet" />
        <h2 className="font-semibold text-sm text-text-primary">Status Stories</h2>
        <button
          onClick={() => setShowStatusModal(true)}
          className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet text-white text-xs font-medium hover:bg-violet-600 transition-all shadow-glow-v"
        >
          + Add Story
        </button>
      </div>
      <StatusStoryBar stories={stories} fullView />
    </div>
  );
};

const SettingsView = () => {
  const { currentUser, setCurrentUser } = useAppStore();
  const user = currentUser || currentUserData;
  return (
    <div className="flex-1 flex flex-col bg-bg overflow-y-auto">
      <div className="h-12 flex items-center px-4 border-b border-violet/10 bg-bg-2 flex-shrink-0">
        <Settings size={16} className="text-violet mr-2" />
        <h2 className="font-semibold text-sm text-text-primary">Settings</h2>
      </div>
      <div className="max-w-2xl mx-auto w-full px-6 py-8 space-y-8">
        <section className="bg-surface rounded-2xl p-6 neu-card border border-violet/10">
          <h3 className="text-base font-semibold text-text-primary mb-4">My Profile</h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-violet/20 border-2 border-violet/40 flex items-center justify-center text-2xl font-bold text-violet">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-text-primary">{user.name}</p>
              <p className="text-sm text-text-muted">{user.email}</p>
              <p className="text-xs text-text-muted mt-1">#{user.id.slice(-6)}</p>
            </div>
          </div>
        </section>

        <section className="bg-surface rounded-2xl p-6 neu-card border border-violet/10">
          <h3 className="text-base font-semibold text-text-primary mb-4">Status</h3>
          <div className="grid grid-cols-2 gap-2">
            {(["online", "idle", "dnd", "offline"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setCurrentUser({ ...user, status: s })}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all border ${
                  user.status === s
                    ? "border-violet/40 bg-violet/10 text-text-primary"
                    : "border-transparent hover:border-violet/20 text-text-muted hover:text-text-primary"
                }`}
              >
                <span className={`w-3 h-3 rounded-full flex-shrink-0 status-${s}`} />
                <span className="capitalize">{s}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-surface rounded-2xl p-6 neu-card border border-violet/10">
          <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-violet" /> Location
          </h3>
          <p className="text-text-muted text-sm">{user.location || "Not set"}</p>
        </section>

        <section className="bg-surface rounded-2xl p-6 neu-card border border-lava/10">
          <h3 className="text-base font-semibold text-lava mb-4">Danger Zone</h3>
          <button
            onClick={() => { setCurrentUser(null); window.location.reload(); }}
            className="px-4 py-2 rounded-xl bg-lava/20 text-lava text-sm font-medium border border-lava/30 hover:bg-lava/30 transition-all"
          >
            Log Out
          </button>
        </section>
      </div>
    </div>
  );
};
