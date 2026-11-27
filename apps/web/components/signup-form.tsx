"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useSignup } from "~/hooks/api/auth";
import { Button, ErrorNote, Field, inputClass } from "~/components/ui/kit";

type SignupFormValues = {
  fullName: string;
  email: string;
  password: string;
};

export function SignUpForm() {
  const router = useRouter();
  const { createUserWithEmailAndPasswordAsync } = useSignup();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ defaultValues: { fullName: "", email: "", password: "" } });

  const onSubmit: SubmitHandler<SignupFormValues> = async (values) => {
    setFormError(null);
    try {
      await createUserWithEmailAndPasswordAsync(values);
      router.replace("/dashboard");
    } catch (err: any) {
      setFormError(err?.message || "Failed to create account. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-display text-4xl">Create your account</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">Your first form is a minute away.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {formError && <ErrorNote>{formError}</ErrorNote>}
        <Field label="Full name" htmlFor="fullName" error={errors.fullName?.message}>
          <input
            id="fullName"
            autoComplete="name"
            placeholder="Ada Lovelace"
            className={inputClass}
            {...register("fullName", { required: "Full name is required" })}
          />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            className={inputClass}
            {...register("email", { required: "Email is required" })}
          />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputClass}
            {...register("password", { required: "Password is required" })}
          />
        </Field>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? "Creating account…" : "Sign up"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </div>
  );
}
