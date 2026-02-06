"use client";

import { PROHIBITED_ITEMS } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Ban } from "lucide-react";

interface ProhibitedItemsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProhibitedItemsModal({
  open,
  onOpenChange,
}: ProhibitedItemsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Prohibited & Restricted Items
          </DialogTitle>
          <DialogDescription>
            The following items are not allowed to be shipped through
            GlobalCarry. Violations may result in account suspension.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {PROHIBITED_ITEMS.map((category) => (
              <div key={category.category}>
                <h3 className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                  <Ban className="h-3.5 w-3.5 text-red-500" />
                  {category.category}
                </h3>
                <ul className="mt-2 ml-6 space-y-1">
                  {category.items.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-slate-600 list-disc"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-[var(--color-navy-800)] hover:bg-[var(--color-navy-900)]"
          >
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
