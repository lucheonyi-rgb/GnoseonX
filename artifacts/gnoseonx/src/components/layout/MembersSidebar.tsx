"use client";

import React from "react";
import { useAppStore } from "@/store/appStore";
import { mockUsers } from "@/lib/mockData";
import { Crown, Shield } from "lucide-react";
import type { User } from "@/types";

export const MembersSidebar = () => {
  const { activeServer, setShowUserProfile } = useAppStore();

  const members = activeServer?.members || mockUsers;
  const online = members.filter((m) => m.status === "online" || m.status === "idle" || m.status === "dnd");
  const offline = members.filter((m) => !m.status || m.status === "offline");

  return (
    <div className="w-56 bg-bg-2 flex flex-col h-full border-l border-violet/10">
      <div className="h-12 flex items-center px-4 border-b border-violet/10">
        <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted">
          Members — {members.length}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {/* Online */}
        {online.length > 0 && (
          <MemberGroup label={`Online — ${online.length}`} members={online} onSelect={setShowUserProfile} />
        )}
        {/* Offline */}
        {offline.length > 0 && (
          <MemberGroup label={`Offline — ${offline.length}`} members={offline} onSelect={setShowUserProfile} dim />
        )}
      </div>
    </div>
  );
};

const MemberGroup = ({
  label,
  members,
  onSelect,
  dim = false,
}: {
  label: string;
  members: User[];
  onSelect: (u: User) => void;
  dim?: boolean;
}) => (
  <div>
    <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted px-2 py-1">{label}</p>
    <div className="space-y-0.5">
      {members.map((m) => (
        <MemberItem key={m.id} member={m} onSelect={onSelect} dim={dim} />
      ))}
    </div>
  </div>
);

const MemberItem = ({
  member,
  onSelect,
  dim,
}: {
  member: User;
  onSelect: (u: User) => void;
  dim: boolean;
}) => {
  const statusColors: Record<string, string> = {
    online: "status-online",
    idle: "status-idle",
    dnd: "status-dnd",
    offline: "status-offline",
  };

  return (
    <button
      onClick={() => onSelect(member)}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all group text-left ${
        dim ? "opacity-50 hover:opacity-80" : ""
      } hover:bg-surface/60`}
    >
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 rounded-2xl bg-surface flex items-center justify-center text-xs font-bold text-text-secondary group-hover:bg-surface-3 transition-all">
          {member.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={member.image} alt={member.name} className="w-full h-full rounded-2xl object-cover" />
          ) : (
            member.name.charAt(0)
          )}
        </div>
        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-bg-2 ${statusColors[member.status || "offline"]}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-xs font-medium text-text-secondary group-hover:text-text-primary truncate transition-colors">
            {member.name}
          </p>
        </div>
        {member.statusText && (
          <p className="text-[10px] text-text-muted truncate">{member.statusText}</p>
        )}
      </div>
    </button>
  );
};
