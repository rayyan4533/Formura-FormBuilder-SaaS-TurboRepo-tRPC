"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  Inbox,
  Loader2,
  Search,
  GripVertical,
  Type,
  Lock,
  Mail,
  Hash,
  Radio,
  Calendar,
  UploadCloud,
  Check,
  Settings2,
  Pencil,
  Copy,
  X,
} from "lucide-react";

import {
  useGetForm,
  useUpdateForm,
  useCreateField,
  useUpdateField,
  useDeleteField,
} from "~/hooks/api/form";
import { DashboardHamburgerToggle } from "~/components/dashboard-sidebar";
import { CopyLinkButton } from "~/components/copy-link-button";
import { Button, Field, buttonClass, inputClass } from "~/components/ui/kit";
import { cn } from "~/lib/utils";

interface FormDetailsPageProps {
  params: Promise<{ id: string }>;
}

export interface FieldItem {
  id: string;
  label: string;
  labelKey: string;
  type: "TEXT" | "NUMBER" | "EMAIL" | "YES_NO" | "PASSWORD";
  description?: string | null;
  placeholder?: string | null;
  isRequired: boolean;
  index: string;
}

interface PaletteItem {
  id: string;
  type: "TEXT" | "NUMBER" | "EMAIL" | "YES_NO" | "PASSWORD";
  label: string;
  category: "text" | "inputs" | "advanced";
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultPlaceholder?: string;
  defaultDescription?: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  // 1. Text Fields
  {
    id: "short_text",
    type: "TEXT",
    label: "Short Text",
    category: "text",
    description: "Single-line text input for names or titles",
    icon: Type,
    defaultPlaceholder: "Enter text...",
    defaultDescription: "Provide brief answer",
  },
  {
    id: "password",
    type: "PASSWORD",
    label: "Password",
    category: "text",
    description: "Masked input for secure password credentials",
    icon: Lock,
    defaultPlaceholder: "••••••••",
    defaultDescription: "Choose a secure password",
  },

  // 2. Inputs & Options
  {
    id: "email",
    type: "EMAIL",
    label: "Email Address",
    category: "inputs",
    description: "Validated email input format",
    icon: Mail,
    defaultPlaceholder: "alex@example.com",
    defaultDescription: "We'll never share your email",
  },
  {
    id: "number",
    type: "NUMBER",
    label: "Number Input",
    category: "inputs",
    description: "Numeric inputs, quantities, or ages",
    icon: Hash,
    defaultPlaceholder: "0",
    defaultDescription: "Enter a number value",
  },
  {
    id: "yes_no",
    type: "YES_NO",
    label: "Radio Choice (Yes/No)",
    category: "inputs",
    description: "Radio button selector for Yes/No decisions",
    icon: Radio,
    defaultDescription: "Select one option",
  },

  // 3. Advanced Fields
  {
    id: "date_picker",
    type: "TEXT",
    label: "Date Picker",
    category: "advanced",
    description: "Interactive calendar date selector",
    icon: Calendar,
    defaultPlaceholder: "YYYY-MM-DD",
    defaultDescription: "Select a date",
  },
  {
    id: "file_upload",
    type: "TEXT",
    label: "File Upload",
    category: "advanced",
    description: "Dropzone attachment area for document upload",
    icon: UploadCloud,
    defaultPlaceholder: "Upload file...",
    defaultDescription: "Attach documents or images (Max 10MB)",
  },
];

const PALETTE_CATEGORIES = [
  { id: "text", label: "Text" },
  { id: "inputs", label: "Inputs" },
  { id: "advanced", label: "Advanced" },
] as const;

const TYPE_NAMES: Record<FieldItem["type"], string> = {
  TEXT: "Text",
  NUMBER: "Number",
  EMAIL: "Email",
  YES_NO: "Yes / No",
  PASSWORD: "Password",
};

const getFieldIcon = (type: string, label: string = "") => {
  const lower = label.toLowerCase();
  if (lower.includes("date")) return Calendar;
  if (lower.includes("file") || lower.includes("upload")) return UploadCloud;
  switch (type) {
    case "EMAIL":
      return Mail;
    case "NUMBER":
      return Hash;
    case "YES_NO":
      return Radio;
    case "PASSWORD":
      return Lock;
    case "TEXT":
    default:
      return Type;
  }
};

export default function FormDetailsPage({ params }: FormDetailsPageProps) {
  const resolvedParams = use(params);
  const formId = resolvedParams.id;

  const { form, isLoading, error } = useGetForm(formId);
  const { updateFormAsync } = useUpdateForm();
  const { createFieldAsync, isPending: isCreatingField } = useCreateField();
  const { updateFieldAsync, isPending: isUpdatingField } = useUpdateField();
  const { deleteFieldAsync, isPending: isDeletingField } = useDeleteField();

  // Workspace Local State
  const [localFields, setLocalFields] = useState<FieldItem[]>([]);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [isEditingFormHeader, setIsEditingFormHeader] = useState(false);
  const [isSavingFormHeader, setIsSavingFormHeader] = useState(false);

  // Responsive Drawer Toggles for iPad/Mobile
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Inspector edit state
  const [editLabel, setEditLabel] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPlaceholder, setEditPlaceholder] = useState("");
  const [editIsRequired, setEditIsRequired] = useState(false);

  // Sync server data to local state
  useEffect(() => {
    if (form) {
      setFormTitle(form.title || "");
      setFormDescription(form.description || "");
      if (form.fields) {
        setLocalFields(form.fields as FieldItem[]);
      }
    }
  }, [form]);

  // Currently selected field object from localState (for live concurrent updates)
  const selectedField = localFields.find((f) => f.id === selectedFieldId);

  // Auto-select first field if none selected
  useEffect(() => {
    if (localFields.length > 0 && !selectedFieldId && localFields[0]?.id) {
      setSelectedFieldId(localFields[0].id);
    }
  }, [localFields, selectedFieldId]);

  // Sync inspector form inputs when selectedFieldId changes
  useEffect(() => {
    if (selectedField) {
      setEditLabel(selectedField.label || "");
      setEditDescription(selectedField.description || "");
      setEditPlaceholder(selectedField.placeholder || "");
      setEditIsRequired(selectedField.isRequired || false);
    }
  }, [selectedFieldId]);

  const handleSelectField = (fieldId: string) => {
    setSelectedFieldId(fieldId);
  };

  // Live concurrent input handlers for Field Inspector
  const handleInspectorLabelChange = (val: string) => {
    setEditLabel(val);
    setLocalFields((prev) =>
      prev.map((f) => (f.id === selectedFieldId ? { ...f, label: val } : f))
    );
  };

  const handleInspectorDescriptionChange = (val: string) => {
    setEditDescription(val);
    setLocalFields((prev) =>
      prev.map((f) => (f.id === selectedFieldId ? { ...f, description: val } : f))
    );
  };

  const handleInspectorPlaceholderChange = (val: string) => {
    setEditPlaceholder(val);
    setLocalFields((prev) =>
      prev.map((f) => (f.id === selectedFieldId ? { ...f, placeholder: val } : f))
    );
  };

  const handleInspectorRequiredChange = (val: boolean) => {
    setEditIsRequired(val);
    setLocalFields((prev) =>
      prev.map((f) => (f.id === selectedFieldId ? { ...f, isRequired: val } : f))
    );
  };

  // Form Title & Description Save Handler
  const handleSaveFormHeader = async () => {
    try {
      setIsSavingFormHeader(true);
      await updateFormAsync({
        formId,
        title: formTitle,
        description: formDescription || null,
      });
      setIsEditingFormHeader(false);
    } catch (err) {
      console.error("Failed to update form header:", err);
    } finally {
      setIsSavingFormHeader(false);
    }
  };

  // Create Field Action
  const handleAddField = async (item: PaletteItem) => {
    try {
      const res = await createFieldAsync({
        formId,
        label: item.label,
        type: item.type,
        description: item.defaultDescription || undefined,
        placeholder: item.defaultPlaceholder || undefined,
        isRequired: false,
      });
      if (res && res.id) {
        setSelectedFieldId(res.id);
        setMobilePaletteOpen(false);
      }
    } catch (err) {
      console.error("Failed to add field:", err);
    }
  };

  // Duplicate Field Action
  const handleDuplicateField = async (field: FieldItem) => {
    try {
      const res = await createFieldAsync({
        formId,
        label: `${field.label} (Copy)`,
        type: field.type,
        description: field.description || undefined,
        placeholder: field.placeholder || undefined,
        isRequired: field.isRequired,
      });
      if (res && res.id) {
        setSelectedFieldId(res.id);
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
          setMobileInspectorOpen(true);
        }
      }
    } catch (err) {
      console.error("Failed to duplicate field:", err);
    }
  };

  // Update Field Action
  const handleSaveInspector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFieldId) return;

    try {
      await updateFieldAsync({
        fieldId: selectedFieldId,
        label: editLabel,
        description: editDescription || null,
        placeholder: editPlaceholder || null,
        isRequired: editIsRequired,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to update field:", err);
    }
  };

  // Delete Field Action
  const handleDeleteField = async (fieldId: string) => {
    try {
      await deleteFieldAsync({ fieldId });
      if (selectedFieldId === fieldId) {
        const remaining = localFields.filter((f) => f.id !== fieldId);
        setSelectedFieldId(remaining.length > 0 && remaining[0]?.id ? remaining[0].id : null);
      }
    } catch (err) {
      console.error("Failed to delete field:", err);
    }
  };

  // Drag and Drop Handlers
  const draggedItemRef = useRef<PaletteItem | null>(null);
  const draggedCanvasIndexRef = useRef<number | null>(null);
  const [dragOverCardIndex, setDragOverCardIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, item: PaletteItem) => {
    draggedItemRef.current = item;
    try {
      e.dataTransfer.setData("text/plain", item.id);
      e.dataTransfer.setData("application/json", JSON.stringify(item));
    } catch {
      // Ignore fallback serialization error
    }
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (draggedItemRef.current) {
      handleAddField(draggedItemRef.current);
      draggedItemRef.current = null;
      return;
    }

    try {
      const json = e.dataTransfer.getData("application/json");
      if (json) {
        const item: PaletteItem = JSON.parse(json);
        handleAddField(item);
        return;
      }
    } catch {
      // Ignore
    }

    const itemId = e.dataTransfer.getData("text/plain");
    if (itemId) {
      const found = PALETTE_ITEMS.find((p) => p.id === itemId);
      if (found) {
        handleAddField(found);
      }
    }
  };

  // Canvas Card Reordering Handlers
  const handleCanvasCardDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation();
    draggedCanvasIndexRef.current = index;
    e.dataTransfer.setData("text/canvas-card-index", String(index));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleCanvasCardDragOver = (e: React.DragEvent, index: number) => {
    if (draggedCanvasIndexRef.current !== null) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
      if (dragOverCardIndex !== index) {
        setDragOverCardIndex(index);
      }
    }
  };

  const handleCanvasCardDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCardIndex(null);

    const sourceIndex = draggedCanvasIndexRef.current;
    draggedCanvasIndexRef.current = null;

    if (sourceIndex === null || sourceIndex === targetIndex) return;

    const updated = [...localFields];
    const [moved] = updated.splice(sourceIndex, 1);
    if (!moved) return;

    updated.splice(targetIndex, 0, moved);

    // Update local state optimistically
    setLocalFields(updated);

    // Calculate non-colliding fractional index for DB
    let newIndexNum: number;
    if (targetIndex === 0) {
      const nextIdx = parseFloat(updated[1]?.index || "1.00");
      newIndexNum = Math.max(0.01, nextIdx / 2);
    } else if (targetIndex === updated.length - 1) {
      const prevIdx = parseFloat(updated[updated.length - 2]?.index || "0.00");
      newIndexNum = prevIdx + 1.00;
    } else {
      const prevIdx = parseFloat(updated[targetIndex - 1]?.index || "0.00");
      const nextIdx = parseFloat(updated[targetIndex + 1]?.index || (prevIdx + 2.0).toString());
      newIndexNum = (prevIdx + nextIdx) / 2;
    }

    const newIndexStr = newIndexNum.toFixed(2);

    try {
      await updateFieldAsync({
        fieldId: moved.id,
        index: newIndexStr,
      });
    } catch (err) {
      console.error("Failed to update field order index:", err);
    }
  };

  // Search filtering for Left Palette
  const filteredPalette = PALETTE_ITEMS.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paletteGroups = PALETTE_CATEGORIES.map((category) => ({
    ...category,
    items: filteredPalette.filter((i) => i.category === category.id),
  })).filter((group) => group.items.length > 0);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Opening builder…
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 p-6 text-center">
        <h2 className="font-display text-3xl">Form not found</h2>
        <p className="text-sm text-muted-foreground">It doesn't exist or failed to load.</p>
        <Link href="/dashboard/forms" className={buttonClass("outline", "sm", "mt-3")}>
          <ArrowLeft className="size-4" /> Back to forms
        </Link>
      </div>
    );
  }

  const SelectedIcon = selectedField ? getFieldIcon(selectedField.type, selectedField.label) : Type;
  const previewInput = cn(inputClass, "bg-background");

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* ================= TOP BAR ================= */}
      <header className="z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <DashboardHamburgerToggle className="md:hidden" />
          <Link href="/dashboard/forms" className={buttonClass("ghost", "icon")} title="Back to forms" aria-label="Back to forms">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-medium">{formTitle}</h1>
            <p className="truncate text-xs text-muted-foreground">
              {localFields.length} {localFields.length === 1 ? "field" : "fields"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Toggle field palette"
            title="Add fields"
            onClick={() => {
              setMobilePaletteOpen(!mobilePaletteOpen);
              setMobileInspectorOpen(false);
            }}
          >
            <Plus className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Toggle field settings"
            title="Field settings"
            onClick={() => {
              setMobileInspectorOpen(!mobileInspectorOpen);
              setMobilePaletteOpen(false);
            }}
          >
            <Settings2 className="size-4" />
          </Button>
          <Link
            href={`/dashboard/forms/${formId}/submissions`}
            className={buttonClass("ghost", "sm")}
            aria-label="Responses"
          >
            <Inbox className="size-4" />
            <span className="hidden md:inline">Responses</span>
          </Link>
          <CopyLinkButton formId={formId} showLabel />
          <Link href={`/forms/${formId}`} target="_blank" className={buttonClass("primary", "sm")} aria-label="Preview">
            <Eye className="size-4" />
            <span className="hidden md:inline">Preview</span>
          </Link>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* ================= LEFT PALETTE ================= */}
        {mobilePaletteOpen && (
          <div onClick={() => setMobilePaletteOpen(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden" />
        )}

        <aside
          className={cn(
            "z-40 w-64 shrink-0 flex-col overflow-hidden border-r bg-background",
            mobilePaletteOpen ? "fixed inset-y-0 left-0 flex shadow-xl" : "hidden lg:relative lg:flex",
          )}
        >
          <div className="space-y-3 p-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[13px] font-medium">Add a field</h2>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 lg:hidden"
                onClick={() => setMobilePaletteOpen(false)}
                aria-label="Close palette"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search fields"
                aria-label="Search field types"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(inputClass, "pr-8 pl-9 text-[13px]")}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
            {paletteGroups.map((group) => (
              <div key={group.id}>
                <h3 className="mb-1 px-1 text-xs text-muted-foreground">{group.label}</h3>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onClick={() => handleAddField(item)}
                      title={item.description}
                      className="group flex w-full cursor-grab items-center gap-2.5 rounded-lg border border-transparent px-1.5 py-1.5 text-left text-[13px] transition-colors select-none hover:border-border hover:bg-card active:cursor-grabbing"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-brand-soft group-hover:text-brand">
                        <Icon className="size-3.5" />
                      </span>
                      <span className="flex-1 truncate">{item.label}</span>
                      <Plus className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </button>
                  );
                })}
              </div>
            ))}

            {filteredPalette.length === 0 && (
              <p className="py-8 text-center text-xs text-muted-foreground">No fields match “{searchQuery}”.</p>
            )}
          </div>
        </aside>

        {/* ================= CENTER CANVAS ================= */}
        <main
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "bg-dots w-full min-w-0 flex-1 overflow-y-auto px-4 py-8 transition-colors sm:px-8",
            isDragOver && "bg-brand-soft",
          )}
        >
          <div className="window mx-auto max-w-xl">
            <div className="titlebar" aria-hidden>
              <span className="size-3.5 shrink-0 border border-ink bg-card dark:border-input" />
              <span className="mx-auto max-w-[70%] truncate bg-card px-3 font-mono text-xs">{formTitle}.frm</span>
              <span className="size-3.5 shrink-0" />
            </div>
            {/* Form header */}
            <div className="border-b px-6 py-6">
              {isEditingFormHeader ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    aria-label="Form title"
                    maxLength={55}
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className={cn(inputClass, "font-display text-2xl")}
                    placeholder="Form title"
                  />
                  <textarea
                    aria-label="Form description"
                    maxLength={300}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={2}
                    className={cn(inputClass, "resize-none")}
                    placeholder="Description"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveFormHeader} disabled={isSavingFormHeader}>
                      {isSavingFormHeader ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setFormTitle(form.title || "");
                        setFormDescription(form.description || "");
                        setIsEditingFormHeader(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-display text-3xl leading-tight break-words">{formTitle}</h2>
                    <p className="mt-1 text-sm break-words text-muted-foreground">
                      {formDescription || "Add a description."}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditingFormHeader(true)}
                    title="Edit title and description"
                    aria-label="Edit title and description"
                  >
                    <Pencil className="size-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Fields */}
            <div className="p-3">
              {localFields.length === 0 ? (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={cn(
                    "rounded-xl border border-dashed px-6 py-14 text-center select-none",
                    isDragOver && "border-brand bg-brand-soft",
                  )}
                >
                  <p className="font-display text-2xl">Start with a question</p>
                  <p className="mx-auto mt-1 max-w-xs text-[13px] text-muted-foreground">
                    Drag a field here, or click one in the list.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {localFields.map((field, index) => {
                    const isSelected = selectedFieldId === field.id;
                    const lower = field.label.toLowerCase();

                    return (
                      <div
                        key={field.id}
                        draggable
                        onDragStart={(e) => handleCanvasCardDragStart(e, index)}
                        onDragOver={(e) => handleCanvasCardDragOver(e, index)}
                        onDragLeave={() => setDragOverCardIndex(null)}
                        onDrop={(e) => handleCanvasCardDrop(e, index)}
                        onClick={() => handleSelectField(field.id)}
                        className={cn(
                          "group relative cursor-pointer rounded-xl border border-transparent py-4 pr-4 pl-8 transition-colors select-none",
                          isSelected ? "border-dashed border-brand bg-brand-soft/50" : "hover:border-border",
                          dragOverCardIndex === index && "border-dashed border-brand",
                        )}
                      >
                        <GripVertical className="absolute top-4.5 left-2 size-4 cursor-grab text-muted-foreground/40 group-hover:text-muted-foreground" />

                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            className="min-w-0 text-left text-sm font-medium break-words"
                            aria-pressed={isSelected}
                          >
                            <span className="mr-2 font-mono text-xs text-muted-foreground">{index + 1}.</span>
                            {field.label}
                            {field.isRequired && (
                              <span className="ml-1 text-brand" title="Required">
                                *
                              </span>
                            )}
                          </button>

                          <div
                            className={cn(
                              "-my-1 flex shrink-0 items-center transition-opacity",
                              !isSelected && "lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100",
                            )}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 lg:hidden"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectField(field.id);
                                setMobileInspectorOpen(true);
                              }}
                              title="Field settings"
                              aria-label="Field settings"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateField(field);
                              }}
                              disabled={isCreatingField}
                              title="Duplicate field"
                              aria-label="Duplicate field"
                            >
                              <Copy className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteField(field.id);
                              }}
                              disabled={isDeletingField}
                              title="Delete field"
                              aria-label="Delete field"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Preview of what respondents see */}
                        <div className="pointer-events-none mt-1 space-y-2">
                          {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}

                          {field.type === "TEXT" && lower.includes("date") ? (
                            <div className={cn(previewInput, "flex items-center justify-between text-muted-foreground/60")}>
                              <span>{field.placeholder || "YYYY-MM-DD"}</span>
                              <Calendar className="size-4" />
                            </div>
                          ) : field.type === "TEXT" && (lower.includes("file") || lower.includes("upload")) ? (
                            // File uploads aren't supported yet: respondents get a text box, so preview one.
                            <input readOnly tabIndex={-1} placeholder={field.placeholder || ""} className={previewInput} />
                          ) : field.type === "YES_NO" ? (
                            <div className="grid grid-cols-2 gap-2">
                              {["Yes", "No"].map((option) => (
                                <span key={option} className={cn(previewInput, "text-muted-foreground")}>
                                  {option}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <input
                              type={field.type === "PASSWORD" ? "password" : "text"}
                              readOnly
                              tabIndex={-1}
                              placeholder={field.placeholder || ""}
                              className={previewInput}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {isCreatingField && (
                <p className="flex items-center justify-center gap-1.5 py-3 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" /> Adding field…
                </p>
              )}
            </div>
          </div>
        </main>

        {/* ================= RIGHT INSPECTOR ================= */}
        {mobileInspectorOpen && (
          <div onClick={() => setMobileInspectorOpen(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden" />
        )}

        <aside
          className={cn(
            "z-40 w-72 shrink-0 flex-col overflow-hidden border-l bg-background",
            mobileInspectorOpen ? "fixed inset-y-0 right-0 flex shadow-xl" : "hidden lg:relative lg:flex",
          )}
        >
          <div className="flex h-12 shrink-0 items-center justify-between border-b px-4">
            <h2 className="text-[13px] font-medium">Field settings</h2>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 lg:hidden"
              onClick={() => setMobileInspectorOpen(false)}
              aria-label="Close settings"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {selectedField ? (
              <form onSubmit={handleSaveInspector} className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <SelectedIcon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium">{TYPE_NAMES[selectedField.type]}</p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">{selectedField.labelKey}</p>
                  </div>
                </div>

                <Field label="Label" htmlFor="field-label">
                  <input
                    id="field-label"
                    type="text"
                    maxLength={100}
                    value={editLabel}
                    onChange={(e) => handleInspectorLabelChange(e.target.value)}
                    required
                    placeholder="Work email"
                    className={inputClass}
                  />
                </Field>
                <Field label="Help text" htmlFor="field-description">
                  <input
                    id="field-description"
                    type="text"
                    value={editDescription}
                    onChange={(e) => handleInspectorDescriptionChange(e.target.value)}
                    placeholder="We'll send confirmation here"
                    className={inputClass}
                  />
                </Field>
                <Field label="Placeholder" htmlFor="field-placeholder">
                  <input
                    id="field-placeholder"
                    type="text"
                    value={editPlaceholder}
                    onChange={(e) => handleInspectorPlaceholderChange(e.target.value)}
                    placeholder="name@company.com"
                    className={inputClass}
                  />
                </Field>

                <label className="flex cursor-pointer items-center justify-between border-y py-3">
                  <span className="text-[13px] font-medium">Required</span>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={editIsRequired}
                    onChange={(e) => handleInspectorRequiredChange(e.target.checked)}
                    className="relative h-5 w-9 cursor-pointer appearance-none border border-ink bg-muted after:absolute after:top-px after:left-px after:size-4 after:bg-card after:shadow-[inset_-1px_-1px_0_var(--bevel-dark)] checked:bg-brand checked:after:translate-x-4"
                  />
                </label>

                <Button type="submit" disabled={isUpdatingField} className="w-full">
                  {isUpdatingField ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Saving…
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check className="size-4" /> Saved
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full"
                  onClick={() => handleDeleteField(selectedField.id)}
                  disabled={isDeletingField}
                >
                  <Trash2 className="size-3.5" /> Delete field
                </Button>
              </form>
            ) : (
              <p className="px-4 py-16 text-center text-[13px] text-muted-foreground">
                Select a field on the canvas to edit it.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
