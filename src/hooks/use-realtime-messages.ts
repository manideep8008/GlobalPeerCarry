"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/types";

export function useRealtimeMessages(userId: string, partnerId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Fetch existing messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`
        )
        .order("created_at", { ascending: true });

      setMessages(data || []);
      setLoading(false);

      // Mark unread messages as read
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("sender_id", partnerId)
        .eq("receiver_id", userId)
        .eq("is_read", false);
    };

    fetchMessages();

    // Subscribe to new messages
    const channelName = `chat:${[userId, partnerId].sort().join("-")}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new as Message;
          // Only add messages that belong to this conversation
          if (
            (newMessage.sender_id === userId &&
              newMessage.receiver_id === partnerId) ||
            (newMessage.sender_id === partnerId &&
              newMessage.receiver_id === userId)
          ) {
            setMessages((prev) => [...prev, newMessage]);

            // Mark as read if we're the receiver
            if (newMessage.receiver_id === userId) {
              supabase
                .from("messages")
                .update({ is_read: true })
                .eq("id", newMessage.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, partnerId]);

  const sendMessage = useCallback(
    async (content: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("messages").insert({
        sender_id: userId,
        receiver_id: partnerId,
        content,
      });
      return { error };
    },
    [userId, partnerId]
  );

  return { messages, loading, sendMessage };
}
