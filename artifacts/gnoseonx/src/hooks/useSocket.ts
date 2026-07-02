import { useEffect, useRef, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import { useAppStore } from "@/store/appStore";
import type { Message } from "@/types";

export function useSocket() {
  const { addMessage, currentUser } = useAppStore();

  // Keep a ref to the latest addMessage so the listener never goes stale
  // without needing to re-register it (which caused duplicates)
  const addMessageRef = useRef(addMessage);
  useEffect(() => { addMessageRef.current = addMessage; }, [addMessage]);

  // Register new_message listener ONCE — on mount only
  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (data: Message & { createdAt: string }) => {
      const msg: Message = {
        ...data,
        createdAt: new Date(data.createdAt),
        reactions: data.reactions ?? [],
        edited: data.edited ?? false,
      };
      addMessageRef.current(msg);
    };

    socket.on("new_message", handleNewMessage);
    return () => { socket.off("new_message", handleNewMessage); };
  }, []); // empty deps — registered once, cleaned up on unmount

  // Join personal user room so server can push DM updates
  useEffect(() => {
    if (!currentUser?.id) return;
    getSocket().emit("join_user_room", currentUser.id);
  }, [currentUser?.id]);

  const joinRoom = useCallback((roomId: string) => {
    getSocket().emit("join_room", roomId);
  }, []);

  const joinUserRoom = useCallback((userId: string) => {
    getSocket().emit("join_user_room", userId);
  }, []);

  const sendMessage = useCallback((payload: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    senderImage?: string;
    channelId?: string;
    dmId?: string;
    type?: string;
    mediaUrl?: string;
  }) => {
    getSocket().emit("send_message", payload);
  }, []);

  return { joinRoom, joinUserRoom, sendMessage };
}
