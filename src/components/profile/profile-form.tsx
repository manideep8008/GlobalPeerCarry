"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormData } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerifiedBadge } from "./verified-badge";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Profile } from "@/types";

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      full_name: profile.full_name,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        bio: data.bio || "",
        avatar_url: data.avatar_url || "",
      })
      .eq("id", profile.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    toast.success("Profile updated successfully!");
    router.refresh();
  };

  const handleRequestVerification = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ kyc_status: "pending" })
      .eq("id", profile.id);

    if (!error) {
      toast.success("Verification request submitted!");
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Edit Profile</CardTitle>
          <VerifiedBadge status={profile.kyc_status} />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" {...register("full_name")} />
            {errors.full_name && (
              <p className="text-xs text-red-500">
                {errors.full_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell others about yourself..."
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-xs text-red-500">{errors.bio.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input
              id="avatar_url"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              {...register("avatar_url")}
            />
            {errors.avatar_url && (
              <p className="text-xs text-red-500">
                {errors.avatar_url.message}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-[var(--color-navy-800)] hover:bg-[var(--color-navy-900)]"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>

            {profile.kyc_status === "none" && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRequestVerification}
              >
                Request Verification
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
