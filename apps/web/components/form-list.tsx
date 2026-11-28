import Link from "next/link";
import { format } from "date-fns";
import { Inbox, Pencil } from "lucide-react";
import { buttonClass } from "~/components/ui/kit";
import { CopyLinkButton } from "~/components/copy-link-button";

export interface FormSummary {
  id: string;
  title: string;
  description?: string | null;
  createdAt?: Date | string | null;
}

export function FormList({ forms }: { forms: FormSummary[] }) {
  return (
    <ul className="window divide-y">
      {forms.map((form) => (
        <li key={form.id} className="flex items-center gap-3 pr-3 transition-colors hover:bg-muted/50">
          <Link href={`/dashboard/forms/${form.id}`} className="min-w-0 flex-1 py-4 pl-5">
            <p className="truncate text-[15px] font-medium">{form.title}</p>
            <p className="truncate text-[13px] text-muted-foreground">{form.description || "No description"}</p>
          </Link>
          {form.createdAt && (
            <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
              {format(new Date(form.createdAt), "MMM d, yyyy")}
            </span>
          )}
          <div className="flex shrink-0 items-center">
            <CopyLinkButton formId={form.id} formTitle={form.title} />
            <Link
              href={`/dashboard/forms/${form.id}/submissions`}
              className={buttonClass("ghost", "icon")}
              title="Submissions"
              aria-label={`Submissions for ${form.title}`}
            >
              <Inbox className="size-4" />
            </Link>
            <Link
              href={`/dashboard/forms/${form.id}`}
              className={buttonClass("ghost", "icon")}
              title="Edit form"
              aria-label={`Edit ${form.title}`}
            >
              <Pencil className="size-4" />
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function FormListSkeleton() {
  return (
    <div className="window space-y-px" aria-label="Loading forms">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[72px] animate-pulse bg-muted/60" />
      ))}
    </div>
  );
}
