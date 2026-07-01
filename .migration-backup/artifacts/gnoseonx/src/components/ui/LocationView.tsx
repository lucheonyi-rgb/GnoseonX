"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { mockUsers, currentUserData } from "@/lib/mockData";
import { MapPin, Navigation, Globe, Radar } from "lucide-react";
import type { User } from "@/types";

const statusColor: Record<string, string> = {
  online: "status-online",
  idle: "status-idle",
  dnd: "status-dnd",
  offline: "status-offline",
};

// Convert lat/lng to x/y percentage on an equirectangular projection.
const project = (lat: number, lng: number) => ({
  x: ((lng + 180) / 360) * 100,
  y: ((90 - lat) / 180) * 100,
});

export const LocationView = () => {
  const { currentUser, setShowUserProfile } = useAppStore();
  const me = currentUser || currentUserData;

  const people: User[] = [
    me,
    ...mockUsers.filter((u) => u.coords),
  ].filter((u) => u.coords);

  const [selected, setSelected] = useState<User | null>(null);

  return (
    <div className="flex-1 flex flex-col bg-bg overflow-hidden">
      {/* Header */}
      <div className="h-12 flex items-center px-4 gap-3 border-b border-violet/10 bg-bg-2 flex-shrink-0">
        <MapPin size={16} className="text-violet" />
        <h2 className="font-semibold text-sm text-text-primary">Location Map</h2>
        <span className="ml-2 flex items-center gap-1.5 text-[11px] text-neon font-mono">
          <Radar size={12} className="animate-spin-slow" />
          {people.length} signals
        </span>
        <span className="hidden md:flex ml-auto items-center gap-1.5 text-xs text-text-muted">
          <Globe size={13} /> Live presence
        </span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="relative w-full max-w-4xl mx-auto aspect-[2/1] rounded-3xl bg-bg-2 neu-card border border-violet/10 overflow-hidden">
            {/* Grid */}
            <div
              className="absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(155,48,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(155,48,255,0.4) 1px, transparent 1px)",
                backgroundSize: "8.33% 8.33%",
              }}
            />
            {/* Radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(155,48,255,0.18),transparent_60%)]" />

            {/* Equator / meridian */}
            <div className="absolute left-0 right-0 top-1/2 h-px bg-violet/15" />
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-violet/15" />

            {/* Pins */}
            {people.map((u) => {
              const { x, y } = project(u.coords!.lat, u.coords!.lng);
              const isMe = u.id === me.id;
              const isSel = selected?.id === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setSelected(u)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  title={`${u.name} — ${u.location}`}
                >
                  {/* Ping ring */}
                  <span
                    className={`absolute inset-0 -m-1 rounded-full ${
                      isMe ? "bg-violet/40" : "bg-neon/30"
                    } ${u.status !== "offline" ? "animate-ping" : ""}`}
                  />
                  <span
                    className={`relative block w-3.5 h-3.5 rounded-full border-2 ${
                      isMe
                        ? "bg-violet border-violet-200 shadow-glow-v"
                        : "bg-surface-3 border-violet/40"
                    } ${isSel ? "ring-2 ring-neon scale-125" : ""} transition-transform`}
                  >
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-bg ${
                        statusColor[u.status || "offline"]
                      }`}
                    />
                  </span>
                  {/* Label on hover */}
                  <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-7 whitespace-nowrap px-2 py-0.5 rounded-lg bg-bg-3 border border-violet/20 text-[10px] text-text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    {isMe ? "You" : u.name}
                  </span>
                </button>
              );
            })}

            {/* Corner label */}
            <div className="absolute bottom-2 left-3 font-mono text-[9px] text-violet/40 select-none leading-tight">
              ┌─ GNOSEONX GEO ─┐<br />
              └ equirectangular ┘
            </div>
          </div>

          {/* Selected card */}
          {selected && (
            <div className="max-w-4xl mx-auto mt-4 animate-fade-in">
              <SelectedCard
                user={selected}
                onProfile={() => setShowUserProfile(selected)}
                onClose={() => setSelected(null)}
              />
            </div>
          )}
        </div>

        {/* Side list */}
        <div className="hidden lg:flex w-72 flex-col border-l border-violet/10 bg-bg-2">
          <div className="h-10 flex items-center px-4 border-b border-violet/10">
            <Navigation size={13} className="text-violet mr-2" />
            <span className="text-xs font-semibold text-text-primary">
              Active Locations
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            {people.map((u) => {
              const isMe = u.id === me.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setSelected(u)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left ${
                    selected?.id === u.id
                      ? "bg-violet/15 border border-violet/30"
                      : "border border-transparent hover:bg-surface/60"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-2xl bg-surface flex items-center justify-center text-sm font-bold text-text-secondary">
                      {u.name.charAt(0)}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-bg-2 ${
                        statusColor[u.status || "offline"]
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">
                      {isMe ? `${u.name} (You)` : u.name}
                    </p>
                    <p className="text-[10px] text-text-muted flex items-center gap-1 truncate">
                      <MapPin size={9} /> {u.location}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const SelectedCard = ({
  user,
  onProfile,
  onClose,
}: {
  user: User;
  onProfile: () => void;
  onClose: () => void;
}) => (
  <div className="flex items-center gap-4 rounded-2xl bg-surface neu-card border border-violet/10 px-5 py-4">
    <div className="relative flex-shrink-0">
      <div className="w-12 h-12 rounded-2xl bg-violet/20 border-2 border-violet/40 flex items-center justify-center text-lg font-bold text-violet">
        {user.name.charAt(0)}
      </div>
      <span
        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-surface ${
          statusColor[user.status || "offline"]
        }`}
      />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-text-primary truncate">{user.name}</p>
      <p className="text-xs text-text-muted flex items-center gap-1">
        <MapPin size={11} className="text-violet" /> {user.location}
      </p>
      {user.coords && (
        <p className="text-[10px] font-mono text-text-muted/70 mt-0.5">
          {user.coords.lat.toFixed(4)}, {user.coords.lng.toFixed(4)}
        </p>
      )}
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={onProfile}
        className="px-3 py-1.5 rounded-xl bg-violet text-white text-xs font-medium hover:bg-violet-600 transition-all shadow-glow-v"
      >
        View Profile
      </button>
      <button
        onClick={onClose}
        className="px-3 py-1.5 rounded-xl text-text-muted text-xs hover:text-text-primary hover:bg-surface-2 transition-all"
      >
        Close
      </button>
    </div>
  </div>
);
