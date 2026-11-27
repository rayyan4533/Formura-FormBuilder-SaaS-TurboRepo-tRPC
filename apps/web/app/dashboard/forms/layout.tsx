import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Forms", template: "%s · Formura" },
  description: "Manage and create your forms.",
};

export default function FormsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
