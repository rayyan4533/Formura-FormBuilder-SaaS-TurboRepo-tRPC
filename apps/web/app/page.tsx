import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Logo, ThemeToggle, Window } from "~/components/ui/kit";
import { buttonClass } from "~/components/ui/button-class";

const STEPS = [
  { title: "Compose", body: "Drag fields onto a quiet canvas. Edit labels and see them change as you type." },
  { title: "Share", body: "Every form has its own link. Respondents need no account and no app." },
  { title: "Read", body: "Answers arrive in a clean table, newest first, one column per question." },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-1">
          <ThemeToggle />
          <Link href="/login" className={buttonClass("ghost", "sm")}>
            Log in
          </Link>
          <Link href="/signup" className={buttonClass("primary", "sm")}>
            Sign up
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6">
        <section className="flex flex-col items-center pt-16 pb-14 text-center sm:pt-24">
          <h1 className="max-w-3xl font-display text-5xl leading-[1.05] tracking-tight text-balance sm:text-7xl">
            Please fill in the <span className="text-brand">form.</span>
          </h1>
          <p className="mt-5 max-w-md text-base text-muted-foreground text-pretty">
            Formura brings back the simple paper form. Make one, send the link, and read what comes back.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className={buttonClass("primary", "lg")}>
              Start building <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        {/* Decorative sample of a published form. */}
        <section aria-hidden className="bg-dots border border-border px-5 py-12 sm:px-10">
          <Window title="dinner.frm" className="mx-auto max-w-md" bodyClassName="space-y-6 p-7">
            <div>
              <p className="font-display text-3xl">Dinner on Friday</p>
              <p className="mt-1 text-sm text-muted-foreground">Two quick questions before we book.</p>
            </div>
            <div>
              <p className="text-sm font-medium">Your name</p>
              <p className="sunken mt-2 border border-input px-3 py-2 font-mono text-sm">Ada Lovelace</p>
            </div>
            <div>
              <p className="text-sm font-medium">Will you join us?</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <span className="flex items-center justify-between border border-brand bg-brand-soft px-3 py-2">
                  Yes <Check className="size-4 text-brand" />
                </span>
                <span className="rounded-lg border px-3 py-2 text-muted-foreground">No</span>
              </div>
            </div>
            <span className={buttonClass("primary", "md")}>Submit</span>
          </Window>
        </section>

        <section className="grid gap-8 py-16 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="border-t pt-4">
              <p className="font-mono text-xs text-brand">0{i + 1}</p>
              <h2 className="mt-2 font-display text-2xl">{step.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
