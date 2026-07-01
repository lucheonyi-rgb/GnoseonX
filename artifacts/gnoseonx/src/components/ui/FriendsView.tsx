"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/appStore";
import { mockDMs } from "@/lib/mockData";
import {
  UserPlus, Users, Clock, Search, Phone, Video,
  MessageSquare, Loader2, Check, X, UserCheck,
} from "lucide-react";
import type { User } from "@/types";

interface FriendEntry {
  id: string;
  displayName: string;
  friendshipId: string;
  status?: string;
}

interface PendingRequest {
  id: string;
  fromUserId: string;
  fromDisplayName: string;
  toDisplayName: string;
  createdAt: string;
}

export const FriendsView = () => {
  const { currentUser, setActiveDM, setActiveView, directMessages } = useAppStore();
  const [tab, setTab] = useState<"online" | "all" | "pending" | "add">("online");
  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  const userId = currentUser?.id;

  const fetchFriends = useCallback(async () => {
    if (!userId) return;
    setLoadingFriends(true);
    try {
      const [friendsRes, pendingRes] = await Promise.all([
        fetch(`/api/friends?userId=${userId}`),
        fetch(`/api/friends/requests?userId=${userId}`),
      ]);
      if (friendsRes.ok) setFriends(await friendsRes.json());
      if (pendingRes.ok) setPending(await pendingRes.json());
    } catch {}
    setLoadingFriends(false);
  }, [userId]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const filtered = friends.filter((f) =>
    f.displayName.toLowerCase().includes(search.toLowerCase())
  );
  const displayList = tab === "online" || tab === "all" ? filtered : [];

  const tabs = [
    { id: "online" as const, label: "Online", count: friends.length, icon: <Users size={14} /> },
    { id: "all" as const, label: "All", count: friends.length, icon: <Users size={14} /> },
    { id: "pending" as const, label: "Pending", count: pending.length, icon: <Clock size={14} /> },
    { id: "add" as const, label: "Add Friend", count: 0, icon: <UserPlus size={14} /> },
  ];

  return (
    <div className="flex-1 flex flex-col bg-bg overflow-hidden">
      {/* Header */}
      <div className="h-12 flex items-center px-4 gap-3 border-b border-violet/10 bg-bg-2 flex-shrink-0">
        <Users size={16} className="text-violet" />
        <h2 className="font-semibold text-sm text-text-primary">Friends</h2>

        <div className="flex items-center gap-1 ml-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all ${
                tab === t.id
                  ? t.id === "add"
                    ? "bg-violet text-white font-medium"
                    : "bg-surface-3 text-text-primary font-medium"
                  : "text-text-muted hover:text-text-primary hover:bg-surface/60"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`text-[9px] px-1 rounded-full ${
                  tab === t.id ? "bg-white/20 text-white" : "bg-surface-2 text-text-muted"
                }`}>
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
          <AddFriendPanel userId={userId} onSent={fetchFriends} />
        ) : tab === "pending" ? (
          <PendingPanel
            requests={pending}
            loading={loadingFriends}
            onRespond={fetchFriends}
          />
        ) : (
          <>
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
                {tab === "online" ? "Friends" : "All Friends"} — {displayList.length}
              </p>

              {loadingFriends ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={20} className="text-violet animate-spin" />
                </div>
              ) : displayList.length === 0 ? (
                <EmptyFriends onAdd={() => setTab("add")} />
              ) : (
                <div className="space-y-1">
                  {displayList.map((f) => (
                    <FriendRow key={f.friendshipId} friend={f} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const FriendRow = ({ friend }: { friend: FriendEntry }) => {
  const { setActiveDM, setActiveView, directMessages } = useAppStore();

  const startDM = () => {
    const dm = directMessages.find((d) => d.participants.some((p) => p.id === friend.id));
    if (dm) { setActiveDM(dm); setActiveView("dms"); }
  };

  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-surface/60 transition-all group">
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-surface-2 flex items-center justify-center text-sm font-bold text-text-secondary">
          {friend.displayName.replace("Gnoseon#", "").charAt(0)}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-bg status-online" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">{friend.displayName}</p>
        <p className="text-xs text-text-muted font-mono">Friend</p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <ActionBtn onClick={startDM} title="Message"><MessageSquare size={15} /></ActionBtn>
        <ActionBtn title="Voice Call"><Phone size={15} /></ActionBtn>
        <ActionBtn title="Video Call"><Video size={15} /></ActionBtn>
      </div>
    </div>
  );
};

const ActionBtn = ({
  children, onClick, title,
}: { children: React.ReactNode; onClick?: () => void; title: string }) => (
  <button
    onClick={onClick}
    title={title}
    className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center text-text-muted hover:text-violet hover:bg-violet/10 transition-all"
  >
    {children}
  </button>
);

const AddFriendPanel = ({
  userId, onSent,
}: { userId?: string; onSent: () => void }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleSend = async () => {
    if (!input.trim() || !userId) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromUserId: userId, displayName: input.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ type: "success", msg: `Friend request sent to ${data.to}!` });
        setInput("");
        onSent();
      } else {
        setResult({ type: "error", msg: data.error || "Something went wrong." });
      }
    } catch {
      setResult({ type: "error", msg: "Connection error. Please try again." });
    }
    setLoading(false);
  };

  return (
    <div className="px-6 py-8 max-w-lg">
      {/* Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-violet/10 border border-violet/20">
        <div className="flex items-center gap-3 mb-2">
          <UserPlus size={18} className="text-violet" />
          <h3 className="text-sm font-semibold text-text-primary">Add a Friend</h3>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          Enter their <span className="text-violet font-mono">Gnoseon#XXNNNN</span> display name
          exactly as shown. Your friend can find their ID in their profile settings.
        </p>
      </div>

      <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted block mb-2">
        Display Name
      </label>

      <div className="flex gap-2">
        <div className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl bg-surface neu-input border transition-all ${
          result?.type === "error" ? "border-lava/40" : "border-violet/10 focus-within:border-violet/35"
        }`}>
          <span className="text-text-muted text-sm font-mono shrink-0">@</span>
          <input
            value={input}
            onChange={(e) => { setInput(e.target.value); setResult(null); }}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Gnoseon#AB1234"
            className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none flex-1 font-mono"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="px-5 py-3 rounded-2xl bg-violet text-white text-sm font-semibold shadow-glow-v hover:bg-violet-600 transition-all disabled:opacity-40 flex items-center gap-2"
        >
          {loading
            ? <Loader2 size={14} className="animate-spin" />
            : <UserPlus size={14} />}
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

      {/* Result feedback */}
      {result && (
        <div className={`mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono ${
          result.type === "success"
            ? "bg-neon/10 border border-neon/20 text-neon"
            : "bg-lava/10 border border-lava/20 text-lava"
        }`}>
          {result.type === "success"
            ? <UserCheck size={13} />
            : <X size={13} />}
          {result.msg}
        </div>
      )}

      {/* How to find ID hint */}
      <div className="mt-6 p-4 rounded-2xl bg-surface-2 border border-white/5">
        <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-2">
          How to find a display name
        </p>
        <ul className="space-y-1.5 text-xs text-text-muted">
          <li className="flex items-start gap-2">
            <span className="text-violet mt-0.5">▸</span>
            Ask your friend to go to <span className="text-text-primary">Settings</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-violet mt-0.5">▸</span>
            Their ID appears under their username, e.g.{" "}
            <span className="text-violet font-mono">Gnoseon#Jo4521</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-violet mt-0.5">▸</span>
            Enter it exactly as shown, including the <span className="font-mono text-violet">Gnoseon#</span> prefix
          </li>
        </ul>
      </div>
    </div>
  );
};

const PendingPanel = ({
  requests, loading, onRespond,
}: { requests: PendingRequest[]; loading: boolean; onRespond: () => void }) => {
  const [responding, setResponding] = useState<string | null>(null);

  const respond = async (requestId: string, action: "accept" | "reject") => {
    setResponding(requestId);
    try {
      await fetch("/api/friends/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      onRespond();
    } catch {}
    setResponding(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={20} className="text-violet animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-6 py-4">
      {requests.length === 0 ? (
        <div className="py-12 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center">
            <Clock size={24} className="text-text-muted" />
          </div>
          <p className="text-sm text-text-muted">No pending friend requests</p>
          <p className="text-xs text-text-muted/60">When someone sends you a request, it'll appear here</p>
        </div>
      ) : (
        <>
          <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-3">
            Incoming — {requests.length}
          </p>
          <div className="space-y-2">
            {requests.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-surface-2 border border-violet/10"
              >
                <div className="w-10 h-10 rounded-2xl bg-violet/20 flex items-center justify-center text-violet font-bold text-sm">
                  {req.fromDisplayName.replace("Gnoseon#", "").charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary font-mono">{req.fromDisplayName}</p>
                  <p className="text-xs text-text-muted">Incoming friend request</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => respond(req.id, "accept")}
                    disabled={responding === req.id}
                    title="Accept"
                    className="w-8 h-8 rounded-xl bg-neon/20 text-neon flex items-center justify-center hover:bg-neon/30 transition-all disabled:opacity-50"
                  >
                    {responding === req.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={15} />}
                  </button>
                  <button
                    onClick={() => respond(req.id, "reject")}
                    disabled={responding === req.id}
                    title="Reject"
                    className="w-8 h-8 rounded-xl bg-lava/20 text-lava flex items-center justify-center hover:bg-lava/30 transition-all disabled:opacity-50"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const EmptyFriends = ({ onAdd }: { onAdd: () => void }) => (
  <div className="py-12 flex flex-col items-center gap-4 text-center">
    <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center shadow-glow-v">
      <Users size={28} className="text-text-muted" />
    </div>
    <div>
      <p className="text-sm font-medium text-text-primary mb-1">No friends yet</p>
      <p className="text-xs text-text-muted">Add friends using their Gnoseon# display name</p>
    </div>
    <button
      onClick={onAdd}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet text-white text-xs font-semibold shadow-glow-v hover:bg-violet-600 transition-all"
    >
      <UserPlus size={13} /> Add a Friend
    </button>
  </div>
);
