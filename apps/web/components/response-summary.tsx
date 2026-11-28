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
      <div className="flex justify-between items-center">
        <h2 className="font-medium text-[13px] text-muted-foreground">Responses</h2>
        {settled && <span className="font-mono text-muted-foreground text-xs">{total} total</span>}
      </div>

      {/* One window per form, spaced apart so each reads as its own record. */}
      <ul className="space-y-6">
        {rows.map(({ form, isLoading, failed, count, latest }) => (
          <li key={form.id}>
            <Window title={`${form.title}.form`}>
              <div className="px-5 py-4">
                <p className="font-medium text-[15px] truncate">{form.title}</p>
                <p className="text-[13px] text-muted-foreground truncate">{form.description || "No description"}</p>
              </div>
              <div className="flex items-center gap-8 bg-muted/40 px-5 py-3 border-t">
                <dl className="flex flex-1 gap-8 min-w-0">
                  <div>
                    <dt className="font-mono text-muted-foreground text-xs">Responses</dt>
                    <dd className="font-mono tabular-nums text-sm">{isLoading ? "…" : failed ? "—" : count}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="font-mono text-muted-foreground text-xs">Latest</dt>
                    <dd className="text-sm truncate">
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
