import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  partnerName: string;
  partnerAvatar: string;
}

export function MessageBubble({
  message,
  isOwn,
  partnerName,
  partnerAvatar,
}: MessageBubbleProps) {
  return (
    <div
      className={cn("flex items-end gap-2", isOwn ? "flex-row-reverse" : "")}
    >
      {!isOwn && (
        <Avatar className="h-7 w-7">
          <AvatarImage src={partnerAvatar} alt={partnerName} />
          <AvatarFallback className="bg-slate-200 text-xs">
            {partnerName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2",
          isOwn
            ? "rounded-br-md bg-[var(--color-navy-800)] text-white"
            : "rounded-bl-md bg-slate-100 text-slate-900"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p
          className={cn(
            "mt-1 text-[10px]",
            isOwn ? "text-blue-200" : "text-slate-400"
          )}
        >
          {format(new Date(message.created_at), "h:mm a")}
        </p>
      </div>
    </div>
  );
}
