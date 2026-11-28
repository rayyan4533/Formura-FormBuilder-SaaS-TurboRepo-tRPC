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
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center mx-auto px-6 py-5 w-full max-w-5xl">
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

      <main className="flex-1 mx-auto px-6 w-full max-w-5xl">
        <section className="flex flex-col items-center pt-16 sm:pt-24 pb-14 text-center">
          <h1 className="max-w-3xl font-display text-5xl sm:text-7xl text-balance leading-[1.05] tracking-tight">
            Please fill in the <span className="text-brand">form.</span>
          </h1>
          <p className="mt-5 max-w-md text-muted-foreground text-base text-pretty">
            Formura brings back the simple paper form. Make one, send the link, and read what comes back.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link href="/signup" className={buttonClass("primary", "lg")}>
              Start building <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        {/* Decorative sample of a published form. */}
        <section aria-hidden className="bg-dots px-5 sm:px-10 py-12 border border-border">
          <Window title="dinner.form" className="mx-auto max-w-md" bodyClassName="space-y-6 p-7">
            <div>
              <p className="font-display text-3xl">Dinner on Friday</p>
              <p className="mt-1 text-muted-foreground text-sm">Two quick questions before we book.</p>
            </div>
            <div>
              <p className="font-medium text-sm">Your name</p>
              <p className="mt-2 px-3 py-2 border border-input font-mono text-sm sunken">Ada Lovelace</p>
            </div>
            <div>
              <p className="font-medium text-sm">Will you join us?</p>
              <div className="gap-2 grid grid-cols-2 mt-2 text-sm">
                <span className="flex justify-between items-center bg-brand-soft px-3 py-2 border border-brand">
                  Yes <Check className="size-4 text-brand" />
                </span>
                <span className="px-3 py-2 border rounded-lg text-muted-foreground">No</span>
              </div>
            </div>
            <span className={buttonClass("primary", "md")}>Submit</span>
          </Window>
        </section>

        <section className="gap-8 grid sm:grid-cols-3 py-16">
          {STEPS.map((step, i) => (
            <div key={step.title} className="pt-4 border-t">
              <p className="font-mono text-brand text-xs">0{i + 1}</p>
              <h2 className="mt-2 font-display text-2xl">{step.title}</h2>
              <p className="mt-1 text-muted-foreground text-sm">{step.body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
