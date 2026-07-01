"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { ServerRail } from "./ServerRail";
import { ChannelSidebar } from "./ChannelSidebar";
import { MembersSidebar } from "./MembersSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { CallModal } from "@/components/call/CallModal";
import { StatusModal } from "@/components/status/StatusModal";
import { NotificationPanel } from "@/components/ui/NotificationPanel";
import { CreateServerModal } from "@/components/ui/CreateServerModal";
import { UserProfileModal } from "@/components/ui/UserProfileModal";
import { MobileNav } from "./MobileNav";

export const AppShell = () => {
  const {
    showCallModal,
    showStatusModal,
    memberListOpen,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useAppStore();

  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="h-full flex flex-col bg-bg overflow-hidden">
      {/* Desktop layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Server Rail — always visible on desktop, toggle on mobile */}
        <div className={`
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:flex
          fixed md:relative z-40 h-full
          flex flex-col transition-transform duration-300
        `}>
          <ServerRail onNotifClick={() => setShowNotifications(v => !v)} />
        </div>

        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Channel sidebar — hidden on mobile when not active */}
        <div className={`
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:flex
          fixed md:relative z-40 h-full left-16
          transition-transform duration-300
        `}>
          <ChannelSidebar />
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex overflow-hidden">
          <ChatArea onNotifClick={() => setShowNotifications(v => !v)} />

          {/* Members sidebar */}
          {memberListOpen && (
            <div className="hidden lg:block">
              <MembersSidebar />
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />

      {/* Modals */}
      {showCallModal && <CallModal />}
      {showStatusModal && <StatusModal />}
      <CreateServerModal />
      <UserProfileModal />

      {/* Notification panel */}
      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}
    </div>
  );
};
