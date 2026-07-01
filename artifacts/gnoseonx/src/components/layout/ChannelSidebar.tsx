"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/appStore";
import {
  Hash,
  Volume2,
  Video,
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  Settings,
  Mic,
  Headphones,
  Phone,
  Users,
  UserPlus,
  Star,
  MapPin,
} from "lucide-react";
import { currentUserData, mockUsers } from "@/lib/mockData";
import { getSocket } from "@/lib/socket";
import type { DirectMessage } from "@/types";
import type { User } from "@/types";

export const ChannelSidebar = () => {
  const {
    activeView,
    activeServer,
    activeChannel,
    setActiveChannel,
    activeDM,
    setActiveDM,
    currentUser,
    setShowStatusModal,
    setShowUserProfile,
  } = useAppStore();

  const user = currentUser || currentUserData;

  if (activeView === "dms" || activeView === "friends") return <DMSidebar />;
  if (activeView === "status") return <StatusSidebar />;
  if (activeView === "settings") return <SettingsSidebar />;
  if (activeView === "location") return <LocationSidebar />;
  if (!activeServer) return <DMSidebar />;

  return (
    <div className="w-60 bg-bg-2 flex flex-col h-full border-r border-violet/10">
      {/* Server header */}
      <div className="h-12 flex items-center px-4 border-b border-violet/10 shadow-[0_1px_0_rgba(155,48,255,0.1)]">
        <h2 className="font-semibold text-sm text-text-primary truncate flex-1">
          {activeServer.name}
        </h2>
        <ChevronDown size={16} className="text-text-muted" />
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-bg neu-input">
          <Search size={13} className="text-text-muted" />
          <input
            placeholder="Search..."
            className="bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none w-full font-mono"
          />
        </div>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
        <ChannelCategory label="TEXT CHANNELS">
          {activeServer.channels
            .filter((c) => c.type === "text")
            .map((channel) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                active={activeChannel?.id === channel.id}
                onClick={() => setActiveChannel(channel)}
              />
            ))}
        </ChannelCategory>

        <ChannelCategory label="VOICE / VIDEO">
          {activeServer.channels
            .filter((c) => c.type === "voice" || c.type === "video")
            .map((channel) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                active={activeChannel?.id === channel.id}
                onClick={() => setActiveChannel(channel)}
              />
            ))}
        </ChannelCategory>
      </div>

      {/* User Panel */}
      <UserPanel
        user={user}
        onStatusClick={() => setShowStatusModal(true)}
        onProfileClick={() => setShowUserProfile(user)}
      />
    </div>
  );
};

const ChannelCategory = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-2">
      <button
        className="flex items-center gap-1 w-full px-1 py-1 text-[10px] font-mono font-bold text-text-muted hover:text-text-secondary uppercase tracking-wider"
        onClick={() => setOpen(!open)}
      >
        {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        {label}
        <Plus size={12} className="ml-auto opacity-60 hover:text-violet hover:opacity-100" />
      </button>
      {open && <div className="space-y-0.5">{children}</div>}
    </div>
  );
};

const ChannelItem = ({
  channel,
  active,
  onClick,
}: {
  channel: { id: string; name: string; type: string };
  active: boolean;
  onClick: () => void;
}) => {
  const icons: Record<string, React.ReactNode> = {
    text: <Hash size={15} />,
    voice: <Volume2 size={15} />,
    video: <Video size={15} />,
  };

  return (
    <button
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-sm transition-all group ${
        active
          ? "bg-surface-3 text-text-primary font-medium"
          : "text-text-muted hover:text-text-secondary hover:bg-surface/60"
      }`}
      onClick={onClick}
    >
      <span className={active ? "text-violet" : "text-text-muted group-hover:text-text-secondary"}>
        {icons[channel.type] || <Hash size={15} />}
      </span>
      <span className="truncate">{channel.name}</span>
      <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100">
        <Settings size={11} className="text-text-muted hover:text-violet" />
      </div>
    </button>
  );
};

interface ApiDM {
  id: string;
  otherId: string;
  otherDisplayName: string;
  lastMessage: { content: string; senderId: string; senderName: string; createdAt: string } | null;
  createdAt: string;
}

const DMSidebar = () => {
  const { activeDM, setActiveDM, setActiveView, setDirectMessages, directMessages, currentUser } = useAppStore();
  const user = currentUser || currentUserData;
  const [search, setSearch] = useState("");
  const [apiDMs, setApiDMs] = useState<ApiDM[]>([]);
  // dmId → unread count (only messages from others while DM is not open)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  // Ref to track activeDM inside socket handler without stale closure
  const activeDMRef = React.useRef(activeDM);
  React.useEffect(() => { activeDMRef.current = activeDM; }, [activeDM]);

  const fetchDMs = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/dms?userId=${user.id}`);
      if (res.ok) {
        const data: ApiDM[] = await res.json();
        setApiDMs(data);
        const dms: DirectMessage[] = data.map((d) => ({
          id: d.id,
          participants: [
            { id: user.id, name: user.name, email: "" },
            { id: d.otherId, name: d.otherDisplayName, email: "" },
          ],
          lastMessage: d.lastMessage
            ? {
                id: d.id,
                content: d.lastMessage.content,
                senderId: d.lastMessage.senderId,
                senderName: d.lastMessage.senderName,
                type: "text" as const,
                edited: false,
                createdAt: new Date(d.lastMessage.createdAt),
              }
            : undefined,
          unreadCount: 0,
          createdAt: new Date(d.createdAt),
        }));
        setDirectMessages(dms);
      }
    } catch {}
  }, [user?.id]);

  // Fetch on mount
  useEffect(() => {
    fetchDMs();
  }, [fetchDMs]);

  // Real-time: listen for dm:updated — update preview and track unread
  useEffect(() => {
    const socket = getSocket();

    const handleDMUpdated = (update: {
      dmId: string;
      lastMessage: { content: string; senderId: string; senderName: string; createdAt: string };
    }) => {
      // Only count as unread if message is from someone else AND this DM is not currently open
      const isActive = activeDMRef.current?.id === update.dmId;
      const isOwnMessage = update.lastMessage.senderId === user?.id;

      if (!isActive && !isOwnMessage) {
        setUnreadCounts((prev) => ({
          ...prev,
          [update.dmId]: (prev[update.dmId] ?? 0) + 1,
        }));
      }

      setApiDMs((prev) => {
        const idx = prev.findIndex((d) => d.id === update.dmId);
        if (idx === -1) {
          fetchDMs();
          return prev;
        }
        const updated = { ...prev[idx], lastMessage: update.lastMessage };
        const rest = prev.filter((_, i) => i !== idx);
        return [updated, ...rest];
      });
    };

    socket.on("dm:updated", handleDMUpdated);
    return () => { socket.off("dm:updated", handleDMUpdated); };
  }, [fetchDMs, user?.id]);

  const filtered = apiDMs.filter((dm) =>
    dm.otherDisplayName.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="w-60 bg-bg-2 flex flex-col h-full border-r border-violet/10">
      <div className="h-12 flex items-center px-4 border-b border-violet/10">
        <h2 className="font-semibold text-sm text-text-primary flex-1">Direct Messages</h2>
        {totalUnread > 0 && (
          <span className="w-5 h-5 bg-lava text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </div>

      <div className="px-3 py-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-bg neu-input">
          <Search size={13} className="text-text-muted" />
          <input
            placeholder="Find conversation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none w-full"
          />
        </div>
      </div>

      <div className="px-2 mb-2">
        <button
          onClick={() => setActiveView("friends")}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-text-muted text-sm hover:bg-surface/60 hover:text-text-secondary transition-all"
        >
          <Users size={16} className="text-violet" />
          Friends
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted px-2 py-1">
          Direct Messages
        </p>
        {filtered.length === 0 && (
          <p className="text-[10px] text-text-muted px-2 py-3 text-center font-mono">
            No conversations yet
          </p>
        )}
        {filtered.map((dm) => {
          const active = activeDM?.id === dm.id;
          const unread = unreadCounts[dm.id] ?? 0;
          const storeDM = directMessages.find((d) => d.id === dm.id);

          const handleOpen = () => {
            const dmObj: DirectMessage = storeDM ?? {
              id: dm.id,
              participants: [
                { id: user.id, name: user.name, email: "" },
                { id: dm.otherId, name: dm.otherDisplayName, email: "" },
              ],
              unreadCount: 0,
              createdAt: new Date(dm.createdAt),
            };
            // Clear unread badge on open
            setUnreadCounts((prev) => {
              if (!prev[dm.id]) return prev;
              const next = { ...prev };
              delete next[dm.id];
              return next;
            });
            setActiveDM(dmObj);
            setActiveView("dms");
          };

          return (
            <button
              key={dm.id}
              onClick={handleOpen}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-all group ${
                active
                  ? "bg-surface-3 text-text-primary"
                  : unread > 0
                    ? "text-text-primary hover:bg-surface/60"
                    : "text-text-muted hover:bg-surface/60 hover:text-text-secondary"
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className={`w-8 h-8 rounded-2xl flex items-center justify-center text-sm font-bold
                  ${active ? "bg-violet/30 text-violet" : "bg-surface text-text-secondary"}`}>
                  {dm.otherDisplayName.replace("Gnoseon#", "").charAt(0)}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-bg-2 status-online" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className={`text-xs truncate ${unread > 0 ? "font-bold text-text-primary" : "font-medium"}`}>
                  {dm.otherDisplayName}
                </p>
                {dm.lastMessage && (
                  <p className={`text-[10px] truncate ${unread > 0 ? "text-text-secondary" : "text-text-muted"}`}>
                    {dm.lastMessage.content}
                  </p>
                )}
              </div>
              {unread > 0 && !active && (
                <span className="w-5 h-5 bg-lava text-white text-[9px] font-bold rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <UserPanel
        user={user}
        onStatusClick={() => useAppStore.getState().setShowStatusModal(true)}
        onProfileClick={() => useAppStore.getState().setShowUserProfile(user)}
      />
    </div>
  );
};

const StatusSidebar = () => {
  return (
    <div className="w-60 bg-bg-2 flex flex-col h-full border-r border-violet/10">
      <div className="h-12 flex items-center px-4 border-b border-violet/10">
        <h2 className="font-semibold text-sm text-text-primary">Status Stories</h2>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-muted text-xs font-mono">Select a story</p>
      </div>
    </div>
  );
};

const LocationSidebar = () => {
  const users = mockUsers.filter((u) => u.location);
  return (
    <div className="w-60 bg-bg-2 flex flex-col h-full border-r border-violet/10">
      <div className="h-12 flex items-center px-4 border-b border-violet/10">
        <MapPin size={14} className="text-violet mr-2" />
        <h2 className="font-semibold text-sm text-text-primary">Nearby Users</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface/60 transition-all cursor-pointer">
            <div className="w-8 h-8 rounded-2xl bg-surface flex items-center justify-center text-sm font-bold text-text-secondary">
              {u.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">{u.name}</p>
              <p className="text-[10px] text-text-muted flex items-center gap-1">
                <MapPin size={9} /> {u.location}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsSidebar = () => {
  const { currentUser, setCurrentUser } = useAppStore();
  const sections = [
    { label: "Account", items: ["Profile", "Privacy", "Security"] },
    { label: "App", items: ["Appearance", "Notifications", "Language"] },
    { label: "About", items: ["What's New", "Feedback", "Logout"] },
  ];
  return (
    <div className="w-60 bg-bg-2 flex flex-col h-full border-r border-violet/10">
      <div className="h-12 flex items-center px-4 border-b border-violet/10">
        <Settings size={14} className="text-violet mr-2" />
        <h2 className="font-semibold text-sm text-text-primary">Settings</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {sections.map((s) => (
          <div key={s.label}>
            <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted px-2 py-1">{s.label}</p>
            {s.items.map((item) => (
              <button
                key={item}
                onClick={() => {
                  if (item === "Logout") {
                    setCurrentUser(null);
                    window.location.reload();
                  }
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm text-text-muted hover:bg-surface/60 hover:text-text-primary transition-all"
              >
                {item}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const UserPanel = ({
  user,
  onStatusClick,
  onProfileClick,
}: {
  user: User;
  onStatusClick: () => void;
  onProfileClick: () => void;
}) => {
  const statusColors: Record<string, string> = {
    online: "status-online",
    idle: "status-idle",
    dnd: "status-dnd",
    offline: "status-offline",
  };

  return (
    <div className="h-14 flex items-center px-3 gap-2 border-t border-violet/10 bg-bg-3">
      <button
        onClick={onProfileClick}
        className="relative flex-shrink-0 w-9 h-9 rounded-2xl bg-violet/20 flex items-center justify-center text-violet font-bold text-sm hover:bg-violet/30 transition-all"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
        ) : (
          user.name?.charAt(0).toUpperCase()
        )}
        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-bg-3 ${statusColors[user.status || "offline"]}`} />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-text-primary truncate">{user.name}</p>
        <p className="text-[10px] text-text-muted truncate">{user.statusText || `#${user.id.slice(-4)}`}</p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onStatusClick}
          className="w-7 h-7 rounded-xl flex items-center justify-center text-text-muted hover:text-violet hover:bg-surface/60 transition-all"
          title="Status"
        >
          <Mic size={14} />
        </button>
        <button
          className="w-7 h-7 rounded-xl flex items-center justify-center text-text-muted hover:text-violet hover:bg-surface/60 transition-all"
          title="Headphones"
        >
          <Headphones size={14} />
        </button>
        <button
          onClick={() => useAppStore.getState().setActiveView("settings")}
          className="w-7 h-7 rounded-xl flex items-center justify-center text-text-muted hover:text-violet hover:bg-surface/60 transition-all"
          title="Settings"
        >
          <Settings size={14} />
        </button>
      </div>
    </div>
  );
};
