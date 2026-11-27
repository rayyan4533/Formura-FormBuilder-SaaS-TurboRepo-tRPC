"use client";

import Link from "next/link";
import { format } from "date-fns";
import { buttonClass } from "~/components/ui/button-class";
import { Window } from "~/components/ui/kit";
import { trpc } from "~/trpc/client";
import type { FormSummary } from "~/components/form-list";

/* The API has no "all responses" call, so this asks once per form. */
export function ResponseSummary({ forms }: { forms: FormSummary[] }) {
  const results = trpc.useQueries((t) =>
    forms.map((form) => t.form.getFormSubmissions({ formId: form.id }, { staleTime: 0 })),
  );

  const rows = forms
    .map((form, i) => {
      const result = results[i];
      const times = (result?.data ?? []).map((s) => (s.createdAt ? new Date(s.createdAt).getTime() : 0));
      return {
        form,
        isLoading: result?.isLoading ?? true,
        failed: Boolean(result?.error),
        count: times.length,
        latest: Math.max(0, ...times),
      };
    })
    // Forms that heard from someone most recently come first.
    .sort((a, b) => b.latest - a.latest);

  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const settled = rows.every((row) => !row.isLoading && !row.failed);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-medium text-muted-foreground">Responses</h2>
        {settled && <span className="font-mono text-xs text-muted-foreground">{total} total</span>}
      </div>

      {/* One window per form, spaced apart so each reads as its own record. */}
      <ul className="space-y-6">
        {rows.map(({ form, isLoading, failed, count, latest }) => (
          <li key={form.id}>
            <Window title={`${form.title}.frm`}>
              <div className="px-5 py-4">
                <p className="truncate text-[15px] font-medium">{form.title}</p>
                <p className="truncate text-[13px] text-muted-foreground">{form.description || "No description"}</p>
              </div>
              <div className="flex items-center gap-8 border-t bg-muted/40 px-5 py-3">
                <dl className="flex min-w-0 flex-1 gap-8">
                  <div>
                    <dt className="font-mono text-xs text-muted-foreground">Responses</dt>
                    <dd className="font-mono text-sm tabular-nums">{isLoading ? "…" : failed ? "—" : count}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="font-mono text-xs text-muted-foreground">Latest</dt>
                    <dd className="truncate text-sm">
                      {isLoading ? "Loading…" : failed ? "Couldn't load" : latest ? format(latest, "MMM d, HH:mm") : "None yet"}
                    </dd>
                  </div>
                </dl>
                <Link
                  href={`/dashboard/forms/${form.id}/submissions`}
                  className={buttonClass("outline", "sm")}
                  aria-label={`View responses for ${form.title}`}
                >
                  View
                </Link>
              </div>
            </Window>
          </li>
        ))}
      </ul>
    </section>
  );
}
