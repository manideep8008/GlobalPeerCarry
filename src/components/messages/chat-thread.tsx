"use client";

import { useEffect, useRef } from "react";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

interface ChatThreadProps {
  userId: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
}

export function ChatThread({
  userId,
  partnerId,
  partnerName,
  partnerAvatar,
}: ChatThreadProps) {
  const { messages, loading, sendMessage } = useRealtimeMessages(
    userId,
    partnerId
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-lg border">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">
              No messages yet. Start the conversation!
            </div>
          )}
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === userId}
              partnerName={partnerName}
              partnerAvatar={partnerAvatar}
            />
          ))}
        </div>
      </ScrollArea>

      <MessageInput onSend={sendMessage} />
    </div>
  );
}
