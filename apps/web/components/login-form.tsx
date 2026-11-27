"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useSignIn } from "~/hooks/api/auth";
import { Button, ErrorNote, Field, inputClass } from "~/components/ui/kit";

type LoginFormValues = {
  email: string;
  password: string;
};

export function LoginForm() {
  const router = useRouter();
  const { signInUserWithEmailAndPasswordAsync } = useSignIn();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ defaultValues: { email: "", password: "" } });

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setFormError(null);
    try {
      await signInUserWithEmailAndPasswordAsync(values);
      router.replace("/dashboard");
    } catch (err: any) {
      setFormError(err?.message || "Invalid email or password.");
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-display text-4xl">Welcome back</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">Log in to your forms.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {formError && <ErrorNote>{formError}</ErrorNote>}
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
            autoComplete="current-password"
            placeholder="••••••••"
            className={inputClass}
            {...register("password", { required: "Password is required" })}
          />
        </Field>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        New here?{" "}
        <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </div>
  );
}
