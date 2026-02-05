"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface MessageInputProps {
  onSend: (content: string) => Promise<{ error: unknown }>;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    setIsSending(true);
    const { error } = await onSend(trimmed);
    setIsSending(false);

    if (error) {
      toast.error("Failed to send message");
      return;
    }

    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 border-t p-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="min-h-[40px] max-h-32 resize-none"
        rows={1}
      />
      <Button
        onClick={handleSend}
        disabled={!content.trim() || isSending}
        size="icon"
        className="shrink-0 bg-[var(--color-navy-800)] hover:bg-[var(--color-navy-900)]"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
