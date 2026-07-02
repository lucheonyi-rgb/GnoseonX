import { useEffect, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import { useAppStore } from "@/store/appStore";

export function useSocket() {
  const { currentUser } = useAppStore();

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
