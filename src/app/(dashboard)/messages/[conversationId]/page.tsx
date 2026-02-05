import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatThread } from "@/components/messages/chat-thread";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ChatPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { conversationId: partnerId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: partner } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", partnerId)
    .single();

  if (!partner) notFound();

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col">
      <div className="mb-4 flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/messages">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">{partner.full_name}</h1>
      </div>

      <ChatThread
        userId={user.id}
        partnerId={partnerId}
        partnerName={partner.full_name}
        partnerAvatar={partner.avatar_url}
      />
    </div>
  );
}
