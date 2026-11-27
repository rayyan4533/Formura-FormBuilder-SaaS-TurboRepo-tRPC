import type { Metadata } from "next";
import { getFormMeta } from "~/lib/form-meta";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const name = (await getFormMeta(id))?.title;
  return {
    title: name ? `Responses: ${name}` : "Responses",
    description: "Answers collected by this form.",
  };
}

export default function SubmissionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
