import { Check } from "lucide-react";
import { Logo, ThemeToggle, Window } from "~/components/ui/kit";

const ANSWERS = [
  { name: "Ada", join: "Yes", time: "09:14" },
  { name: "Grace", join: "Yes", time: "09:02" },
  { name: "Alan", join: "No", time: "08:47" },
];

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid lg:grid-cols-2 min-h-screen">
      <main className="flex flex-col px-6 py-5">
        <div className="flex justify-between items-center">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 justify-center items-center py-10">
          <Window title="account.exe" className="w-full max-w-md" bodyClassName="flex justify-center p-7 sm:p-9">
            {children}
          </Window>
        </div>
      </main>
      <Showcase />
    </div>
  );
}

/* A small desktop that shows the product at work: build a form, then read the answers. */
function Showcase() {
  return (
    <aside className="hidden lg:flex flex-col justify-center items-center gap-10 bg-dots px-10 py-12 border-ink border-l">
      <div className="w-full max-w-lg">
        <p className="font-display text-3xl xl:text-4xl text-balance leading-tight">
          Good forms feel like a <span className="text-brand">conversation.</span>
        </p>
        <p className="mt-3 text-muted-foreground text-sm">Build one, share the link, and read what comes back.</p>
      </div>

      <div aria-hidden className="w-full max-w-lg select-none">
        <Window title="dinner.form" className="w-[82%]" bodyClassName="space-y-4 p-5">
          <p className="font-display text-xl">Dinner on Friday</p>
          <div>
            <p className="font-medium text-[13px]">1. Your name</p>
            <p className="mt-1.5 px-3 py-1.5 border border-input font-mono text-[13px] sunken">Ada Lovelace</p>
          </div>
          <div>
            <p className="font-medium text-[13px]">2. Will you join us?</p>
            <div className="gap-2 grid grid-cols-2 mt-1.5 text-[13px]">
              <span className="flex justify-between items-center bg-brand-soft px-3 py-1.5 border border-brand">
                Yes <Check className="size-3.5 text-brand" />
              </span>
              <span className="px-3 py-1.5 border border-input text-muted-foreground sunken">No</span>
            </div>
          </div>
        </Window>

        <Window title="responses.dat" className="relative -mt-8 ml-auto w-[72%]">
          <table className="w-full text-[13px] text-left">
            <thead className="bg-muted font-mono text-muted-foreground text-xs">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Joining</th>
                <th className="px-4 py-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ANSWERS.map((row) => (
                <tr key={row.name}>
                  <td className="px-4 py-2">{row.name}</td>
                  <td className="px-4 py-2">{row.join}</td>
                  <td className="px-4 py-2 font-mono text-muted-foreground text-xs">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Window>
      </div>
    </aside>
  );
}
