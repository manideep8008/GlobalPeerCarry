import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConversationList } from "@/components/messages/conversation-list";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get blocked users
  const { data: blockedUsers } = await supabase
    .from("user_blocks")
    .select("blocked_id")
    .eq("blocker_id", user!.id);

  const blockedIds = new Set((blockedUsers || []).map((b) => b.blocked_id));

  // Get all messages involving the user, with sender and receiver profiles
  const { data: messages } = await supabase
    .from("messages")
    .select("*, sender:profiles!sender_id(*), receiver:profiles!receiver_id(*)")
    .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
    .order("created_at", { ascending: false });

  // Group by conversation partner
  const conversationMap = new Map<
    string,
    {
      partnerId: string;
      partnerName: string;
      partnerAvatar: string;
      lastMessage: string;
      lastMessageAt: string;
      unreadCount: number;
    }
  >();

  if (messages) {
    for (const msg of messages) {
      const isOwnMessage = msg.sender_id === user!.id;
      const partnerId = isOwnMessage ? msg.receiver_id : msg.sender_id;

      // Skip blocked users
      if (blockedIds.has(partnerId)) continue;

      const partner = isOwnMessage
        ? (msg.receiver as unknown as { full_name: string; avatar_url: string })
        : (msg.sender as unknown as { full_name: string; avatar_url: string });

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          partnerName: partner?.full_name || "Unknown",
          partnerAvatar: partner?.avatar_url || "",
          lastMessage: msg.content,
          lastMessageAt: msg.created_at,
          unreadCount: !isOwnMessage && !msg.is_read ? 1 : 0,
        });
      } else if (!isOwnMessage && !msg.is_read) {
        const conv = conversationMap.get(partnerId)!;
        conv.unreadCount += 1;
      }
    }
  }

  const conversations = Array.from(conversationMap.values());

  return (
    <div className="space-y-6">
      <PageHeader title="Messages" description="Your conversations" />

      {conversations.length > 0 ? (
        <ConversationList conversations={conversations} />
      ) : (
        <EmptyState
          title="No messages yet"
          description="Start a conversation by booking a trip or accepting a booking request"
        />
      )}
    </div>
  );
}
