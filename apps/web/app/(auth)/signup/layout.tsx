import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a Formura account and build your first form.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
