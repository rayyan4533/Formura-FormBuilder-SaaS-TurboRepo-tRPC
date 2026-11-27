import type { Metadata } from "next";
import { getFormMeta } from "~/lib/form-meta";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const form = await getFormMeta(id);
  return {
    title: form?.title ?? "Form not found",
    description: form?.description || "Fill in this form.",
  };
}

export default function PublicFormLayout({ children }: { children: React.ReactNode }) {
  return children;
}
