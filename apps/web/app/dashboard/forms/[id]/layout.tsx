import type { Metadata } from "next";
import { getFormMeta } from "~/lib/form-meta";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const name = (await getFormMeta(id))?.title;
  const title = name ? `Edit ${name}` : "Builder";
  return {
    title: { default: title, template: "%s · Formura" },
    description: "Add and arrange the fields of your form.",
  };
}

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
