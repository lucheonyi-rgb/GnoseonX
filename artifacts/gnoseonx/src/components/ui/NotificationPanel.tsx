"use client";

import React from "react";
import { useAppStore } from "@/store/appStore";
import { X, Bell, MessageSquare, Phone, Star, UserPlus, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@/types";

export const NotificationPanel = ({ onClose }: { onClose: () => void }) => {
  const { notifications, markNotificationRead, clearNotifications } = useAppStore();

  const unread = notifications.filter((n) => !n.read).length;

  const typeIcon = (type: Notification["type"]) => {
    const cls = "w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0";
    switch (type) {
      case "message":     return <div className={`${cls} bg-violet/20 text-violet`}><MessageSquare size={14} /></div>;
      case "call":        return <div className={`${cls} bg-neon/20 text-neon`}><Phone size={14} /></div>;
      case "mention":     return <div className={`${cls} bg-gold/20 text-gold`}><Star size={14} /></div>;
      case "friend_request": return <div className={`${cls} bg-lava/20 text-lava`}><UserPlus size={14} /></div>;
      default:            return <div className={`${cls} bg-surface-3 text-text-muted`}><Bell size={14} /></div>;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-4 top-4 bottom-4 z-50 w-80 bg-surface rounded-3xl shadow-neu-card border border-violet/15 flex flex-col overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-violet/10">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-violet" />
            <h2 className="font-semibold text-text-primary text-sm">Notifications</h2>
            {unread > 0 && (
              <span className="px-1.5 py-0.5 bg-lava rounded-full text-white text-[9px] font-bold">
                {unread}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unread > 0 && (
              <button
                onClick={clearNotifications}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-3 transition-all text-xs"
                title="Mark all read"
              >
                <CheckCheck size={12} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-3 transition-all"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-text-muted">
              <Bell size={32} className="opacity-30" />
              <p className="text-sm">All caught up!</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-2xl transition-all text-left group ${
                    !notif.read
                      ? "bg-violet/8 hover:bg-violet/12 border border-violet/10"
                      : "hover:bg-surface-2"
                  }`}
                >
                  {typeIcon(notif.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-semibold truncate ${notif.read ? "text-text-secondary" : "text-text-primary"}`}>
                        {notif.title}
                      </p>
                      <span className="text-[9px] text-text-muted font-mono flex-shrink-0">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: false })}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted line-clamp-2 mt-0.5">{notif.body}</p>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-violet flex-shrink-0 mt-1.5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 border-t border-violet/10">
            <button
              onClick={clearNotifications}
              className="w-full py-2 rounded-xl text-xs text-text-muted hover:text-text-primary hover:bg-surface-3 transition-all"
            >
              Clear all notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
};
