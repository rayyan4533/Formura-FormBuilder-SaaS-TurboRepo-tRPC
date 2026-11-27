"use client";

import { Check, Link2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "~/components/ui/kit";

export function CopyLinkButton({ formId, showLabel = false }: { formId: string; showLabel?: boolean }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url = `${window.location.origin}/forms/${formId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      toast.success("Link copied");
    } catch {
      toast.error(`Couldn't copy. The link is ${url}`);
    }
  };

  const Icon = copied ? Check : Link2;
  return (
    <Button
      variant={showLabel ? "outline" : "ghost"}
      size={showLabel ? "sm" : "icon"}
      onClick={copy}
      title="Copy share link"
      aria-label="Copy share link"
    >
      <Icon className="size-4" />
      {showLabel && <span className="hidden sm:inline">Share</span>}
    </Button>
  );
}
