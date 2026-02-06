"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ExternalLink, Ban, ShieldCheck, Loader2 } from "lucide-react";
import type { Profile } from "@/types";

interface UserManagementCardProps {
  profile: Profile;
}

export function UserManagementCard({ profile }: UserManagementCardProps) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleBan = async () => {
    setIsToggling(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: !profile.is_banned })
      .eq("id", profile.id);

    setIsToggling(false);

    if (error) {
      toast.error("Failed to update user: " + error.message);
      return;
    }

    toast.success(profile.is_banned ? "User unbanned" : "User banned");
    router.refresh();
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            <AvatarFallback className="bg-[var(--color-navy-800)] text-white">
              {profile.full_name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{profile.full_name}</h3>
              {profile.is_admin && (
                <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
              )}
              {profile.is_banned && (
                <Badge variant="destructive">Banned</Badge>
              )}
              {profile.kyc_status === "verified" && (
                <Badge className="bg-green-100 text-green-800">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500">
              Joined {format(new Date(profile.created_at), "MMM d, yyyy")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/profile/${profile.id}`}>
                <ExternalLink className="mr-1 h-3.5 w-3.5" />
                View
              </Link>
            </Button>

            {!profile.is_admin && (
              <Button
                variant={profile.is_banned ? "outline" : "destructive"}
                size="sm"
                onClick={handleToggleBan}
                disabled={isToggling}
              >
                {isToggling && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                <Ban className="mr-1 h-4 w-4" />
                {profile.is_banned ? "Unban" : "Ban"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
