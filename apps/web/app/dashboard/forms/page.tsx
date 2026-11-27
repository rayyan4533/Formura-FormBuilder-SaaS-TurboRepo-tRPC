"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { useCreateForm, useListForms } from "~/hooks/api/form";
import { PageHeader } from "~/components/page-header";
import { FormList, FormListSkeleton } from "~/components/form-list";
import { Button, ErrorNote, Field, inputClass } from "~/components/ui/kit";

const createFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(55, "Title cannot exceed 55 characters"),
  description: z
    .string()
    .max(300, "Description cannot exceed 300 characters")
    .optional(),
});

type CreateFormValues = z.infer<typeof createFormSchema>;

export default function FormsDashboardPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // "New form" links elsewhere land here with ?new=1 and open the dialog straight away.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("new")) setOpen(true);
  }, []);
  const { forms, isLoading, error } = useListForms();
  const { createFormAsync, isPending, isError, error: mutationError } = useCreateForm();

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createFormSchema) as any,
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (values: CreateFormValues) => {
    try {
      const result = await createFormAsync({
        title: values.title,
        description: values.description || undefined,
      });
      form.reset();
      setOpen(false);
      if (result?.id) {
        router.push(`/dashboard/forms/${result.id}`);
      }
    } catch (err) {
      // Error handled via mutationError
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-5 py-10 sm:px-8">
      <PageHeader
        title="Forms"
        subtitle="Everything you've made."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" /> New form
          </Button>
        }
      />

      {isLoading ? (
        <FormListSkeleton />
      ) : error ? (
        <ErrorNote>Failed to load forms.</ErrorNote>
      ) : forms.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-14 text-center">
          <p className="font-display text-2xl">No forms yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Use “New form” to get started.</p>
        </div>
      ) : (
        <FormList forms={forms} />
      )}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 animate-in fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 window p-6">
            <Dialog.Title className="font-display text-3xl">New form</Dialog.Title>
            <Dialog.Description className="mb-5 text-sm text-muted-foreground">
              Name it now, add questions next.
            </Dialog.Description>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {isError && <ErrorNote>{mutationError?.message || "Failed to create form."}</ErrorNote>}
              <Field label="Title" htmlFor="title" error={form.formState.errors.title?.message}>
                <input
                  id="title"
                  placeholder="Customer feedback"
                  maxLength={55}
                  className={inputClass}
                  {...form.register("title")}
                />
              </Field>
              <Field label="Description (optional)" htmlFor="description" error={form.formState.errors.description?.message}>
                <textarea
                  id="description"
                  placeholder="What is this form for?"
                  rows={3}
                  maxLength={300}
                  className={`${inputClass} resize-none`}
                  {...form.register("description")}
                />
              </Field>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  {isPending ? "Creating…" : "Create form"}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
