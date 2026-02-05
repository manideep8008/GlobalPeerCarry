import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
}

export function ConversationList({ conversations }: ConversationListProps) {
  return (
    <div className="space-y-1">
      {conversations.map((conv) => (
        <Link
          key={conv.partnerId}
          href={`/messages/${conv.partnerId}`}
          className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-slate-50"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={conv.partnerAvatar} alt={conv.partnerName} />
            <AvatarFallback className="bg-[var(--color-navy-800)] text-white">
              {conv.partnerName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-900">
                {conv.partnerName}
              </span>
              <span className="text-xs text-slate-400">
                {formatDistanceToNow(new Date(conv.lastMessageAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <p className="truncate text-sm text-slate-500">
              {conv.lastMessage}
            </p>
          </div>
          {conv.unreadCount > 0 && (
            <Badge className="bg-[var(--color-navy-800)]">
              {conv.unreadCount}
            </Badge>
          )}
        </Link>
      ))}
    </div>
  );
}
