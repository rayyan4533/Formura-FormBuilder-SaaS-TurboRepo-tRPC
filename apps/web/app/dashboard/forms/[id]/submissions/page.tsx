"use client";

import { use } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, RefreshCw } from "lucide-react";

import { useGetForm, useGetFields, useGetFormSubmissions } from "~/hooks/api/form";
import { PageHeader } from "~/components/page-header";
import { CopyLinkButton } from "~/components/copy-link-button";
import { Button, ErrorNote, buttonClass } from "~/components/ui/kit";
import { cn } from "~/lib/utils";

interface SubmissionsPageProps {
  params: Promise<{ id: string }>;
}

export default function FormSubmissionsPage({ params }: SubmissionsPageProps) {
  const resolvedParams = use(params);
  const formId = resolvedParams.id;

  const { form, isLoading: isLoadingForm } = useGetForm(formId);
  const { fields, isLoading: isLoadingFields } = useGetFields(formId);
  const {
    submissions,
    isLoading: isLoadingSubmissions,
    error,
    refetch,
  } = useGetFormSubmissions(formId);

  const isLoading = isLoadingForm || isLoadingFields || isLoadingSubmissions;

  const sortedFields = [...fields].sort((a: any, b: any) => {
    const idxA = parseFloat(a.index || "0");
    const idxB = parseFloat(b.index || "0");
    return idxA - idxB;
  });

  const count = submissions.length;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-5 py-10 sm:px-8">
      <div className="space-y-4">
        <Link href={`/dashboard/forms/${formId}`} className={buttonClass("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="size-4" /> Back to builder
        </Link>
        <PageHeader
          title={form?.title || "Responses"}
          subtitle={isLoading || error ? "Responses" : `${count} ${count === 1 ? "response" : "responses"}`}
          action={
            <div className="flex gap-2">
              <CopyLinkButton formId={formId} formTitle={form?.title} showLabel />
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoadingSubmissions}>
                <RefreshCw className={cn("size-4", isLoadingSubmissions && "animate-spin")} /> Refresh
              </Button>
            </div>
          }
        />
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-xl bg-muted/60" aria-label="Loading responses" />
      ) : error ? (
        <ErrorNote>Failed to load submissions. Please try refreshing.</ErrorNote>
      ) : count === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-14 text-center">
          <p className="font-display text-2xl">Nothing yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Share your form to start collecting responses.</p>
        </div>
      ) : (
        <div className="window overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-muted font-mono text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium whitespace-nowrap">Submitted</th>
                {sortedFields.map((field: any) => (
                  <th key={field.id} className="min-w-[160px] px-5 py-3 font-medium">
                    <span className="block max-w-[220px] truncate" title={field.label}>
                      {field.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {submissions.map((submission: any) => {
                const valuesList = (submission.values as Array<{ formFieldId: string; value: string }>) || [];
                return (
                  <tr key={submission.id} className="hover:bg-muted/50">
                    <td className="px-5 py-3.5 text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                      {submission.createdAt ? format(new Date(submission.createdAt), "MMM d, yyyy HH:mm") : "—"}
                    </td>
                    {sortedFields.map((field: any) => {
                      const value = valuesList.find((v) => v.formFieldId === field.id)?.value?.trim();
                      return (
                        <td key={field.id} className="max-w-[260px] truncate px-5 py-3.5" title={value}>
                          {value || <span className="text-muted-foreground/50">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
