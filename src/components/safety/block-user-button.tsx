"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Ban, Loader2 } from "lucide-react";

interface BlockUserButtonProps {
  userId: string;
  isBlocked: boolean;
}

export function BlockUserButton({ userId, isBlocked }: BlockUserButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(isBlocked);

  const handleToggleBlock = async () => {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in");
      setLoading(false);
      return;
    }

    if (blocked) {
      // Unblock
      const { error } = await supabase
        .from("user_blocks")
        .delete()
        .eq("blocker_id", user.id)
        .eq("blocked_id", userId);

      if (error) {
        toast.error("Failed to unblock user");
      } else {
        toast.success("User unblocked");
        setBlocked(false);
      }
    } else {
      // Block
      const { error } = await supabase.from("user_blocks").insert({
        blocker_id: user.id,
        blocked_id: userId,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("User is already blocked");
        } else {
          toast.error("Failed to block user");
        }
      } else {
        toast.success("User blocked. You will no longer see their content.");
        setBlocked(true);
      }
    }

    setLoading(false);
    router.refresh();
  };

  return (
    <Button
      variant={blocked ? "outline" : "destructive"}
      size="sm"
      onClick={handleToggleBlock}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
      ) : (
        <Ban className="mr-1 h-4 w-4" />
      )}
      {blocked ? "Unblock" : "Block User"}
    </Button>
  );
}
