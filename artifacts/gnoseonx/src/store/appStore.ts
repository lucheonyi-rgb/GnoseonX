import { create } from "zustand";
import type {
  User,
  Server,
  Channel,
  Message,
  DirectMessage,
  CallSession,
  Notification,
  StatusStory,
} from "@/types";

interface AppState {
  // Current user
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Navigation
  activeView:
    | "servers"
    | "dms"
    | "friends"
    | "status"
    | "settings"
    | "location";
  setActiveView: (view: AppState["activeView"]) => void;

  // Servers
  servers: Server[];
  setServers: (servers: Server[]) => void;
  activeServer: Server | null;
  setActiveServer: (server: Server | null) => void;

  // Channels
  activeChannel: Channel | null;
  setActiveChannel: (channel: Channel | null) => void;

  // DMs
  directMessages: DirectMessage[];
  setDirectMessages: (dms: DirectMessage[]) => void;
  activeDM: DirectMessage | null;
  setActiveDM: (dm: DirectMessage | null) => void;

  // Messages
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;

  // Users / Online
  onlineUsers: User[];
  setOnlineUsers: (users: User[]) => void;
  allUsers: User[];
  setAllUsers: (users: User[]) => void;

  // Call
  activeCall: CallSession | null;
  setActiveCall: (call: CallSession | null) => void;
  incomingCall: CallSession | null;
  setIncomingCall: (call: CallSession | null) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
  markNotificationRead: (id: string) => void;

  // Status Stories
  stories: StatusStory[];
  setStories: (stories: StatusStory[]) => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  memberListOpen: boolean;
  setMemberListOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  showStatusModal: boolean;
  setShowStatusModal: (show: boolean) => void;
  showCallModal: boolean;
  setShowCallModal: (show: boolean) => void;
  showCreateServer: boolean;
  setShowCreateServer: (show: boolean) => void;
  showUserProfile: User | null;
  setShowUserProfile: (user: User | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  activeView: "servers",
  setActiveView: (view) => set({ activeView: view }),

  servers: [],
  setServers: (servers) => set({ servers }),
  activeServer: null,
  setActiveServer: (server) => set({ activeServer: server }),

  activeChannel: null,
  setActiveChannel: (channel) => set({ activeChannel: channel }),

  directMessages: [],
  setDirectMessages: (dms) => set({ directMessages: dms }),
  activeDM: null,
  setActiveDM: (dm) => set({ activeDM: dm }),

  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  onlineUsers: [],
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  allUsers: [],
  setAllUsers: (users) => set({ allUsers: users }),

  activeCall: null,
  setActiveCall: (call) => set({ activeCall: call }),
  incomingCall: null,
  setIncomingCall: (call) => set({ incomingCall: call }),

  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
  clearNotifications: () => set({ notifications: [] }),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  stories: [],
  setStories: (stories) => set({ stories }),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  memberListOpen: true,
  setMemberListOpen: (open) => set({ memberListOpen: open }),
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  showStatusModal: false,
  setShowStatusModal: (show) => set({ showStatusModal: show }),
  showCallModal: false,
  setShowCallModal: (show) => set({ showCallModal: show }),
  showCreateServer: false,
  setShowCreateServer: (show) => set({ showCreateServer: show }),
  showUserProfile: null,
  setShowUserProfile: (user) => set({ showUserProfile: user }),
}));
