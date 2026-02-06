"use client";

import { useState } from "react";
import { ReportUserModal } from "./report-user-modal";
import { BlockUserButton } from "./block-user-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Flag, Ban } from "lucide-react";

interface UserSafetyActionsProps {
  userId: string;
  userName: string;
  isBlocked: boolean;
  parcelId?: string;
}

export function UserSafetyActions({
  userId,
  userName,
  isBlocked,
  parcelId,
}: UserSafetyActionsProps) {
  const [showReport, setShowReport] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowReport(true)}>
            <Flag className="mr-2 h-4 w-4 text-red-500" />
            Report User
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="p-0">
            <BlockUserButton userId={userId} isBlocked={isBlocked} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportUserModal
        userId={userId}
        userName={userName}
        open={showReport}
        onOpenChange={setShowReport}
        parcelId={parcelId}
      />
    </>
  );
}
