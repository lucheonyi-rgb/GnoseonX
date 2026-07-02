export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  status?: "online" | "idle" | "dnd" | "offline";
  statusText?: string;
  statusStory?: StatusStory;
  location?: string;
  coords?: { lat: number; lng: number };
  lastSeen?: Date;
}

export interface StatusStory {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  text?: string;
  bgColor?: string;
  createdAt: Date;
  expiresAt: Date;
  viewers?: string[];
}

export interface Server {
  id: string;
  name: string;
  icon?: string;
  ownerId: string;
  channels: Channel[];
  members: User[];
  createdAt: Date;
}

export interface Channel {
  id: string;
  name: string;
  type: "text" | "voice" | "video";
  serverId: string;
  description?: string;
  createdAt: Date;
}

export interface DirectMessage {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  channelId?: string;
  dmId?: string;
  type: "text" | "image" | "video" | "file" | "system" | "call";
  mediaUrl?: string;
  mediaType?: string;
  reactions?: Reaction[];
  replyTo?: Message;
  edited: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Reaction {
  emoji: string;
  users: string[];
}

export interface CallSession {
  id: string;
  type: "voice" | "video";
  callerId: string;
  callerName: string;
  callerImage?: string;
  receiverId: string;
  status: "ringing" | "connected" | "ended" | "missed";
  startedAt: Date;
  endedAt?: Date;
}

export interface Notification {
  id: string;
  type: "message" | "call" | "mention" | "friend_request" | "status";
  title: string;
  body: string;
  fromUser?: User;
  read: boolean;
  createdAt: Date;
  data?: Record<string, unknown>;
}
