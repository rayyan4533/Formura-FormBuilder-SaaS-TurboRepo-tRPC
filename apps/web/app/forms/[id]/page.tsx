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
        <div className="bg-muted rounded-2xl h-80 animate-pulse" aria-label="Loading form" />
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
            <span className="flex justify-center items-center bg-brand-soft mx-auto mb-4 border border-brand size-12 text-brand">
              <Check className="size-6" />
            </span>
          }
        >
          Your response to <strong className="font-medium text-foreground">{form.title}</strong> has been recorded.
          <Button
            variant="outline"
            size="sm"
            className="flex mx-auto mt-6"
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
      <Window title={`${form.title}.form`} bodyClassName="p-6 sm:p-10">
        <h1 className="font-display text-4xl break-words leading-tight">{form.title}</h1>
        {form.description && (
          <p className="mt-2 text-muted-foreground text-sm whitespace-pre-wrap">{form.description}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7 mt-8">
          {submitError && <ErrorNote>{submitError}</ErrorNote>}

          {fields.length === 0 ? (
            <p className="py-6 text-muted-foreground text-sm text-center">This form has no questions yet.</p>
          ) : (
            fields.map((field: any, position: number) => {
              const registration = register(field.id, { required: field.isRequired });
              const label = (
                <>
                  <span className="mr-2 font-mono text-muted-foreground text-xs">{position + 1}.</span>
                  {field.label}
                  {field.isRequired && <span className="ml-1 text-brand">*</span>}
                </>
              );
              const help = field.description && (
                <p className="mt-0.5 text-[13px] text-muted-foreground">{field.description}</p>
              );
              const message = errors[field.id] && <p className="mt-1.5 text-destructive text-xs">This field is required</p>;

              if (field.type === "YES_NO") {
                return (
                  <fieldset key={field.id}>
                    <legend className="font-medium text-[15px]">{label}</legend>
                    {help}
                    <div className="gap-2 grid grid-cols-2 mt-2.5">
                      {["Yes", "No"].map((option) => (
                        <label
                          key={option}
                          className="flex justify-between items-center has-checked:bg-brand-soft hover:bg-muted px-3 py-2.5 border border-input has-checked:border-brand text-sm transition-colors cursor-pointer sunken"
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
                  <label htmlFor={field.id} className="block font-medium text-[15px]">
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
    <div className="flex flex-col justify-center items-center bg-dots px-4 py-12 min-h-screen">
      <main className="w-full max-w-xl">{children}</main>
      <p className="mt-6 text-muted-foreground text-xs">
        Made with <span className="font-display text-sm">Formura</span>
      </p>
    </div>
  );
}

function Notice({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="p-10 text-center window">
      {icon}
      <h1 className="font-display text-3xl">{title}</h1>
      <div className="mt-2 text-muted-foreground text-sm">{children}</div>
    </div>
  );
}
