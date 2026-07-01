import { useEffect, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import { useAppStore } from "@/store/appStore";
import type { Message } from "@/types";

export function useSocket() {
  const { addMessage, currentUser } = useAppStore();

  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (data: Message & { createdAt: string }) => {
      const msg: Message = {
        ...data,
        createdAt: new Date(data.createdAt),
        reactions: data.reactions ?? [],
        edited: data.edited ?? false,
      };
      addMessage(msg);
    };

    socket.on("new_message", handleNewMessage);
    return () => { socket.off("new_message", handleNewMessage); };
  }, [addMessage]);

  const joinRoom = useCallback((roomId: string) => {
    getSocket().emit("join_room", roomId);
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

  return { joinRoom, sendMessage };
}
