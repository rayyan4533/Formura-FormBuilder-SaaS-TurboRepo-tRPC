"use client";

import { use, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Check } from "lucide-react";
import { trpc } from "~/trpc/client";
import { useGetForm } from "~/hooks/api/form";
import { Button, ErrorNote, Window, inputClass } from "~/components/ui/kit";

interface PublicFormPageProps {
  params: Promise<{ id: string }>;
}

export default function PublicFormPage({ params }: PublicFormPageProps) {
  const resolvedParams = use(params);
  const formId = resolvedParams.id;

  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { form, isLoading, error } = useGetForm(formId);
  const submitMutation = trpc.form.submitForm.useMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Record<string, string>>();

  const onSubmit = async (data: Record<string, string>) => {
    setSubmitError(null);
    try {
      const formattedValues = Object.entries(data)
        .filter(([_, val]) => typeof val === "string" && val.trim() !== "")
        .map(([fieldId, value]) => ({
          formFieldId: fieldId,
          value,
        }));

      if (formattedValues.length === 0) {
        setSubmitError("Please fill out at least one field before submitting.");
        return;
      }

      await submitMutation.mutateAsync({
        formId,
        values: formattedValues,
      });

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to submit form. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <Shell>
        <div className="h-80 animate-pulse rounded-2xl bg-muted" aria-label="Loading form" />
      </Shell>
    );
  }

  if (error || !form) {
    return (
      <Shell>
        <Notice title="Form not found">This form is unavailable or may have been removed.</Notice>
      </Shell>
    );
  }

  if (submitted) {
    return (
      <Shell>
        <Notice
          title="Thank you"
          icon={
            <span className="mx-auto mb-4 flex size-12 items-center justify-center border border-brand bg-brand-soft text-brand">
              <Check className="size-6" />
            </span>
          }
        >
          Your response to <strong className="font-medium text-foreground">{form.title}</strong> has been recorded.
          <Button
            variant="outline"
            size="sm"
            className="mx-auto mt-6 flex"
            onClick={() => {
              reset();
              setSubmitted(false);
            }}
          >
            Submit another response
          </Button>
        </Notice>
      </Shell>
    );
  }

  const fields = form.fields || [];
  const lineInput = `${inputClass} py-2.5`;

  return (
    <Shell>
      <Window title={`${form.title}.frm`} bodyClassName="p-6 sm:p-10">
        <h1 className="font-display text-4xl leading-tight break-words">{form.title}</h1>
        {form.description && (
          <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">{form.description}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-7">
          {submitError && <ErrorNote>{submitError}</ErrorNote>}

          {fields.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">This form has no questions yet.</p>
          ) : (
            fields.map((field: any, position: number) => {
              const registration = register(field.id, { required: field.isRequired });
              const label = (
                <>
                  <span className="mr-2 font-mono text-xs text-muted-foreground">{position + 1}.</span>
                  {field.label}
                  {field.isRequired && <span className="ml-1 text-brand">*</span>}
                </>
              );
              const help = field.description && (
                <p className="mt-0.5 text-[13px] text-muted-foreground">{field.description}</p>
              );
              const message = errors[field.id] && <p className="mt-1.5 text-xs text-destructive">This field is required</p>;

              if (field.type === "YES_NO") {
                return (
                  <fieldset key={field.id}>
                    <legend className="text-[15px] font-medium">{label}</legend>
                    {help}
                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                      {["Yes", "No"].map((option) => (
                        <label
                          key={option}
                          className="flex cursor-pointer items-center justify-between sunken border border-input px-3 py-2.5 text-sm transition-colors hover:bg-muted has-checked:border-brand has-checked:bg-brand-soft"
                        >
                          {option}
                          <input type="radio" value={option} className="size-4 accent-brand" {...registration} />
                        </label>
                      ))}
                    </div>
                    {message}
                  </fieldset>
                );
              }

              const inputType =
                field.type === "NUMBER"
                  ? "number"
                  : field.type === "EMAIL"
                    ? "email"
                    : field.type === "PASSWORD"
                      ? "password"
                      : field.label.toLowerCase().includes("date")
                        ? "date"
                        : "text";

              return (
                <div key={field.id}>
                  <label htmlFor={field.id} className="block text-[15px] font-medium">
                    {label}
                  </label>
                  {help}
                  <input
                    id={field.id}
                    type={inputType}
                    placeholder={field.placeholder || ""}
                    aria-invalid={Boolean(errors[field.id])}
                    className={`${lineInput} mt-2.5`}
                    {...registration}
                  />
                  {message}
                </div>
              );
            })
          )}

          {fields.length > 0 && (
            <Button type="submit" size="lg" className="w-full" disabled={submitMutation.isPending}>
              {submitMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {submitMutation.isPending ? "Submitting…" : "Submit"}
            </Button>
          )}
        </form>
      </Window>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-dots flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <main className="w-full max-w-xl">{children}</main>
      <p className="mt-6 text-xs text-muted-foreground">
        Made with <span className="font-display text-sm">Formura</span>
      </p>
    </div>
  );
}

function Notice({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="window p-10 text-center">
      {icon}
      <h1 className="font-display text-3xl">{title}</h1>
      <div className="mt-2 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
