"use client";

import { useState } from "react";
import { Check, Copy, Link2, Mail, X } from "lucide-react";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { Dialog } from "radix-ui";
import { toast } from "sonner";
import { Button, buttonClass, inputClass } from "~/components/ui/kit";

  export function CopyLinkButton({
    formId,
    formTitle,
    showLabel = false,
  }: {
    formId: string;
    formTitle?: string;
    showLabel?: boolean;
  }) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const url = typeof window !== "undefined" ? `${window.location.origin}/forms/${formId}` : `/forms/${formId}`;
    const subject = formTitle ? `Fill out: ${formTitle}` : "Fill out this form";
    const shareMessage = formTitle ? `Please fill out "${formTitle}": ${url}` : `Please fill out this form: ${url}`;

    const mailtoHref = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareMessage)}`;
    const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

    const copy = async () => {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
        toast.success("Link copied");
      } catch {
        toast.error(`Couldn't copy. The link is ${url}`);
      }
    };

    const CopyIcon = copied ? Check : Copy;

    return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          variant={showLabel ? "outline" : "ghost"}
          size={showLabel ? "sm" : "icon"}
          title="Share form"
          aria-label="Share form"
        >
          <Link2 className="size-4" />
          {showLabel && <span className="hidden sm:inline">Share</span>}
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 animate-in fade-in" />
        <Dialog.Content className="window fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-3xl">Share form</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                {formTitle ? `Share "${formTitle}" via link, email, or WhatsApp.` : "Share via link, email, or WhatsApp."}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close share modal">
                <X className="size-4" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor={`share-url-${formId}`} className="block text-[13px] font-medium">
                Form link
              </label>
              <div className="flex gap-2">
                <input
                  id={`share-url-${formId}`}
                  type="text"
                  readOnly
                  value={url}
                  onFocus={(e) => e.currentTarget.select()}
                  className={`${inputClass} font-mono text-xs`}
                />
                <Button variant="primary" size="md" onClick={copy} className="shrink-0">
                  <CopyIcon className="size-4" />
                  <span>{copied ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="block text-[13px] font-medium">Share via</span>
              <div className="grid grid-cols-2 gap-2">
                <a href={mailtoHref} className={buttonClass("outline", "md", "w-full justify-center")}>
                  <Mail className="size-4" />
                  <span>Email</span>
                </a>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass("outline", "md", "w-full justify-center")}
                >
                  <IconBrandWhatsapp className="size-4" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
    );
  }
