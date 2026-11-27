import { Check } from "lucide-react";
import { Logo, ThemeToggle, Window } from "~/components/ui/kit";

const ANSWERS = [
  { name: "Ada", join: "Yes", time: "09:14" },
  { name: "Grace", join: "Yes", time: "09:02" },
  { name: "Alan", join: "No", time: "08:47" },
];

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <main className="flex flex-col px-6 py-5">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
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
    <aside className="bg-dots hidden flex-col items-center justify-center gap-10 border-l border-ink px-10 py-12 lg:flex">
      <div className="w-full max-w-lg">
        <p className="font-display text-3xl leading-tight text-balance xl:text-4xl">
          Good forms feel like a <span className="text-brand">conversation.</span>
        </p>
        <p className="mt-3 text-sm text-muted-foreground">Build one, share the link, and read what comes back.</p>
      </div>

      <div aria-hidden className="w-full max-w-lg select-none">
        <Window title="dinner.frm" className="w-[82%]" bodyClassName="space-y-4 p-5">
          <p className="font-display text-xl">Dinner on Friday</p>
          <div>
            <p className="text-[13px] font-medium">1. Your name</p>
            <p className="sunken mt-1.5 border border-input px-3 py-1.5 font-mono text-[13px]">Ada Lovelace</p>
          </div>
          <div>
            <p className="text-[13px] font-medium">2. Will you join us?</p>
            <div className="mt-1.5 grid grid-cols-2 gap-2 text-[13px]">
              <span className="flex items-center justify-between border border-brand bg-brand-soft px-3 py-1.5">
                Yes <Check className="size-3.5 text-brand" />
              </span>
              <span className="sunken border border-input px-3 py-1.5 text-muted-foreground">No</span>
            </div>
          </div>
        </Window>

        <Window title="responses.dat" className="relative -mt-8 ml-auto w-[72%]">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-muted font-mono text-xs text-muted-foreground">
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
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Window>
      </div>
    </aside>
  );
}
