"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useListForms } from "~/hooks/api/form";
import { useUser } from "~/hooks/api/auth";
import { PageHeader } from "~/components/page-header";
import { FormList, FormListSkeleton } from "~/components/form-list";
import { ResponseSummary } from "~/components/response-summary";
import { ErrorNote, buttonClass } from "~/components/ui/kit";

export default function Page() {
  const { forms, isLoading: isLoadingForms, error } = useListForms();
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="p-10 text-sm text-muted-foreground">Loading…</div>;
  }
  if (!user) {
    return null;
  }

  const firstName = user.fullName?.split(" ")[0];

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-5 py-10 sm:px-8">
      <PageHeader
        title={firstName ? `Hello, ${firstName}` : "Hello"}
        subtitle={
          isLoadingForms || error ? "Your recent work." : `You have ${forms.length} ${forms.length === 1 ? "form" : "forms"}.`
        }
        action={
          <Link href="/dashboard/forms?new=1" className={buttonClass()}>
            <Plus className="size-4" /> New form
          </Link>
        }
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-medium text-muted-foreground">Recent forms</h2>
          {forms.length > 5 && (
            <Link href="/dashboard/forms" className="text-[13px] font-medium underline underline-offset-4">
              View all
            </Link>
          )}
        </div>
        {isLoadingForms ? (
          <FormListSkeleton />
        ) : error ? (
          <ErrorNote>Failed to load forms.</ErrorNote>
        ) : forms.length === 0 ? (
          <div className="rounded-xl border border-dashed px-6 py-14 text-center">
            <p className="font-display text-2xl">A blank page</p>
            <p className="mt-1 text-sm text-muted-foreground">Create your first form to see it here.</p>
            <Link href="/dashboard/forms?new=1" className={buttonClass("outline", "sm", "mt-5")}>
              Create a form
            </Link>
          </div>
        ) : (
          <FormList forms={forms.slice(0, 5)} />
        )}
      </section>

      {forms.length > 0 && <ResponseSummary forms={forms} />}
    </div>
  );
}
