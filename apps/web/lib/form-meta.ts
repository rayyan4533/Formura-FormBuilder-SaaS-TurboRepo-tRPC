import { cache } from "react";
import { api } from "~/trpc/server";

/* Title and description for a page's metadata. Never breaks the page if the API is unreachable. */
export const getFormMeta = cache(async (formId: string) => {
  try {
    return await api.form.getForm.query({ formId });
  } catch {
    return null;
  }
});
