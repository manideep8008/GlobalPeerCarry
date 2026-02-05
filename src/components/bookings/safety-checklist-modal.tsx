"use client";

import { useState } from "react";
import { SAFETY_CHECKLIST_ITEMS } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Loader2 } from "lucide-react";

interface SafetyChecklistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function SafetyChecklistModal({
  open,
  onOpenChange,
  onConfirm,
}: SafetyChecklistModalProps) {
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    SAFETY_CHECKLIST_ITEMS.map(() => false)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allChecked = checkedItems.every(Boolean);

  const toggleItem = (index: number) => {
    setCheckedItems((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
      setCheckedItems(SAFETY_CHECKLIST_ITEMS.map(() => false));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[var(--color-navy-800)]" />
            Safety Checklist
          </DialogTitle>
          <DialogDescription>
            Please confirm the following before submitting your booking request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {SAFETY_CHECKLIST_ITEMS.map((item, index) => (
            <label
              key={index}
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={checkedItems[index]}
                onChange={() => toggleItem(index)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[var(--color-navy-800)] focus:ring-[var(--color-navy-800)]"
              />
              <span className="text-sm text-slate-700">{item}</span>
            </label>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!allChecked || isSubmitting}
            className="bg-[var(--color-navy-800)] hover:bg-[var(--color-navy-900)]"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm & Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
