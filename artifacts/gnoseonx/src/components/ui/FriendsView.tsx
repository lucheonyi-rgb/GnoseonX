"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { mockUsers, mockDMs } from "@/lib/mockData";
import { UserPlus, Users, Clock, Ban, Search, Phone, Video, MessageSquare } from "lucide-react";
import type { User } from "@/types";

export const FriendsView = () => {
  const { setActiveDM, setActiveView, mockDMsState } = useAppStore() as any;
  const [tab, setTab] = useState<"online" | "all" | "pending" | "add">("online");
  const [search, setSearch] = useState("");
  const [addInput, setAddInput] = useState("");

  const online = mockUsers.filter((u) => u.status === "online" || u.status === "idle");
  const filtered = mockUsers.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));
  const displayList = tab === "online" ? online : tab === "all" ? filtered : [];

  const tabs = [
    { id: "online" as const, label: "Online", count: online.length, icon: <Users size={14} /> },
    { id: "all" as const, label: "All", count: mockUsers.length, icon: <Users size={14} /> },
    { id: "pending" as const, label: "Pending", count: 1, icon: <Clock size={14} /> },
    { id: "add" as const, label: "Add Friend", count: 0, icon: <UserPlus size={14} /> },
  ];

  return (
    <div className="flex-1 flex flex-col bg-bg overflow-hidden">
      {/* Header */}
      <div className="h-12 flex items-center px-4 gap-3 border-b border-violet/10 bg-bg-2 flex-shrink-0">
        <Users size={16} className="text-violet" />
        <h2 className="font-semibold text-sm text-text-primary">Friends</h2>

        {/* Tabs */}
        <div className="flex items-center gap-1 ml-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all ${
                tab === t.id
                  ? "bg-surface-3 text-text-primary font-medium"
                  : "text-text-muted hover:text-text-primary hover:bg-surface/60"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`text-[9px] px-1 rounded-full ${tab === t.id ? "bg-violet/30 text-violet" : "bg-surface-2 text-text-muted"}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "add" ? (
          <AddFriendPanel />
        ) : tab === "pending" ? (
          <PendingPanel />
        ) : (
          <>
            {/* Search */}
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-surface neu-input border border-violet/10">
                <Search size={14} className="text-text-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search friends..."
                  className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none flex-1"
                />
              </div>
            </div>

            <div className="px-6">
              <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-3">
                {tab === "online" ? "Online" : "All Friends"} — {displayList.length}
              </p>
              <div className="space-y-1">
                {displayList.map((user) => (
                  <FriendRow key={user.id} user={user} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const FriendRow = ({ user }: { user: User }) => {
  const { setActiveDM, setActiveView } = useAppStore();

  const statusColors: Record<string, string> = {
    online: "status-online",
    idle: "status-idle",
    dnd: "status-dnd",
    offline: "status-offline",
  };

  const startDM = () => {
    const dm = mockDMs.find((d: any) => d.participants.some((p: any) => p.id === user.id));
    if (dm) {
      setActiveDM(dm);
      setActiveView("dms");
    }
  };

  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-surface/60 transition-all group">
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-surface-2 flex items-center justify-center text-sm font-bold text-text-secondary">
          {user.name.charAt(0)}
        </div>
        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-bg ${statusColors[user.status || "offline"]}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
        <p className="text-xs text-text-muted truncate">{user.statusText || user.location || user.status}</p>
      </div>

      {/* Actions — show on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <ActionBtn onClick={startDM} title="Message">
          <MessageSquare size={15} />
        </ActionBtn>
        <ActionBtn title="Voice Call">
          <Phone size={15} />
        </ActionBtn>
        <ActionBtn title="Video Call">
          <Video size={15} />
        </ActionBtn>
      </div>
    </div>
  );
};

const ActionBtn = ({ children, onClick, title }: { children: React.ReactNode; onClick?: () => void; title: string }) => (
  <button
    onClick={onClick}
    title={title}
    className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center text-text-muted hover:text-violet hover:bg-violet/10 transition-all"
  >
    {children}
  </button>
);

const AddFriendPanel = () => {
  const [input, setInput] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    setSent(true);
    setTimeout(() => { setSent(false); setInput(""); }, 2000);
  };

  return (
    <div className="px-6 py-6 max-w-lg">
      <h3 className="text-base font-semibold text-text-primary mb-2">Add a Friend</h3>
      <p className="text-sm text-text-muted mb-4">
        Enter their GnoseonX username to send a friend request.
      </p>
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-surface neu-input border border-violet/10 focus-within:border-violet/30 transition-all">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="username#1234"
            className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none flex-1"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="px-5 py-2 rounded-2xl bg-violet text-white text-sm font-medium shadow-glow-v hover:bg-violet-600 transition-all disabled:opacity-40"
        >
          {sent ? "Sent!" : "Send"}
        </button>
      </div>
    </div>
  );
};

const PendingPanel = () => (
  <div className="px-6 py-4">
    <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-3">Incoming — 1</p>
    <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-surface-2 border border-violet/10">
      <div className="w-10 h-10 rounded-2xl bg-violet/20 flex items-center justify-center text-violet font-bold">Z</div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-text-primary">Zara Nova</p>
        <p className="text-xs text-text-muted">Incoming friend request</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-xl bg-neon/20 text-neon flex items-center justify-center hover:bg-neon/30 transition-all font-bold">✓</button>
        <button className="w-8 h-8 rounded-xl bg-lava/20 text-lava flex items-center justify-center hover:bg-lava/30 transition-all font-bold">✕</button>
      </div>
    </div>
  </div>
);
