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
      <div className="flex justify-center items-center gap-2 h-screen text-muted-foreground text-sm">
        <Loader2 className="size-4 animate-spin" /> Opening builder…
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex flex-col justify-center items-center gap-2 p-6 h-screen text-center">
        <h2 className="font-display text-3xl">Form not found</h2>
        <p className="text-muted-foreground text-sm">It doesn't exist or failed to load.</p>
        <Link href="/dashboard/forms" className={buttonClass("outline", "sm", "mt-3")}>
          <ArrowLeft className="size-4" /> Back to forms
        </Link>
      </div>
    );
  }

  const SelectedIcon = selectedField ? getFieldIcon(selectedField.type, selectedField.label) : Type;
  const previewInput = cn(inputClass, "bg-background");

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ================= TOP BAR ================= */}
      <header className="z-20 flex justify-between items-center gap-2 bg-background px-3 sm:px-4 border-b h-14 shrink-0">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <DashboardHamburgerToggle className="md:hidden" />
          <Link href="/dashboard/forms" className={buttonClass("ghost", "icon")} title="Back to forms" aria-label="Back to forms">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="font-medium text-sm truncate">{formTitle}</h1>
            <p className="text-muted-foreground text-xs truncate">
              {localFields.length} {localFields.length === 1 ? "field" : "fields"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
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
          <CopyLinkButton formId={formId} formTitle={formTitle} showLabel />
          <Link href={`/forms/${formId}`} target="_blank" className={buttonClass("primary", "sm")} aria-label="Preview">
            <Eye className="size-4" />
            <span className="hidden md:inline">Preview</span>
          </Link>
        </div>
      </header>

      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {/* ================= LEFT PALETTE ================= */}
        {mobilePaletteOpen && (
          <div onClick={() => setMobilePaletteOpen(false)} className="lg:hidden z-30 fixed inset-0 bg-black/40" />
        )}

        <aside
          className={cn(
            "z-40 flex-col bg-background border-r w-64 overflow-hidden shrink-0",
            mobilePaletteOpen ? "fixed inset-y-0 left-0 flex shadow-xl" : "hidden lg:relative lg:flex",
          )}
        >
          <div className="space-y-3 p-3">
            <div className="flex justify-between items-center px-1">
              <h2 className="font-medium text-[13px]">Add a field</h2>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden size-6"
                onClick={() => setMobilePaletteOpen(false)}
                aria-label="Close palette"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="top-1/2 left-3 absolute size-3.5 text-muted-foreground -translate-y-1/2" />
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
                  className="top-1/2 right-2 absolute text-muted-foreground hover:text-foreground -translate-y-1/2"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-5 px-3 pb-4 overflow-y-auto">
            {paletteGroups.map((group) => (
              <div key={group.id}>
                <h3 className="mb-1 px-1 text-muted-foreground text-xs">{group.label}</h3>
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
                      className="group flex items-center gap-2.5 hover:bg-card px-1.5 py-1.5 border border-transparent hover:border-border rounded-lg w-full text-[13px] text-left transition-colors cursor-grab active:cursor-grabbing select-none"
                    >
                      <span className="flex justify-center items-center bg-muted group-hover:bg-brand-soft rounded-md size-7 text-muted-foreground group-hover:text-brand transition-colors shrink-0">
                        <Icon className="size-3.5" />
                      </span>
                      <span className="flex-1 truncate">{item.label}</span>
                      <Plus className="opacity-0 group-hover:opacity-100 size-3.5 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            ))}

            {filteredPalette.length === 0 && (
              <p className="py-8 text-muted-foreground text-xs text-center">No fields match “{searchQuery}”.</p>
            )}
          </div>
        </aside>

        {/* ================= CENTER CANVAS ================= */}
        <main
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex-1 bg-dots px-4 sm:px-8 py-8 w-full min-w-0 overflow-y-auto transition-colors",
            isDragOver && "bg-brand-soft",
          )}
        >
          <div className="mx-auto max-w-xl window">
            <div className="titlebar" aria-hidden>
              <span className="bg-card border border-ink dark:border-input size-3.5 shrink-0" />
              <span className="bg-card mx-auto px-3 max-w-[70%] font-mono text-xs truncate">{formTitle}.form</span>
              <span className="size-3.5 shrink-0" />
            </div>
            {/* Form header */}
            <div className="px-6 py-6 border-b">
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
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <h2 className="font-display text-3xl break-words leading-tight">{formTitle}</h2>
                    <p className="mt-1 text-muted-foreground text-sm break-words">
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
                    "px-6 py-14 border border-dashed rounded-xl text-center select-none",
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
                          "group relative py-4 pr-4 pl-8 border border-transparent rounded-xl transition-colors cursor-pointer select-none",
                          isSelected ? "border-dashed border-brand bg-brand-soft/50" : "hover:border-border",
                          dragOverCardIndex === index && "border-dashed border-brand",
                        )}
                      >
                        <GripVertical className="top-4.5 left-2 absolute size-4 text-muted-foreground/40 group-hover:text-muted-foreground cursor-grab" />

                        <div className="flex justify-between items-start gap-2">
                          <button
                            type="button"
                            className="min-w-0 font-medium text-sm text-left break-words"
                            aria-pressed={isSelected}
                          >
                            <span className="mr-2 font-mono text-muted-foreground text-xs">{index + 1}.</span>
                            {field.label}
                            {field.isRequired && (
                              <span className="ml-1 text-brand" title="Required">
                                *
                              </span>
                            )}
                          </button>

                          <div
                            className={cn(
                              "flex items-center -my-1 transition-opacity shrink-0",
                              !isSelected && "lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100",
                            )}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="lg:hidden size-7"
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
                        <div className="space-y-2 mt-1 pointer-events-none">
                          {field.description && <p className="text-muted-foreground text-xs">{field.description}</p>}

                          {field.type === "TEXT" && lower.includes("date") ? (
                            <div className={cn(previewInput, "flex items-center justify-between text-muted-foreground/60")}>
                              <span>{field.placeholder || "YYYY-MM-DD"}</span>
                              <Calendar className="size-4" />
                            </div>
                          ) : field.type === "TEXT" && (lower.includes("file") || lower.includes("upload")) ? (
                            // File uploads aren't supported yet: respondents get a text box, so preview one.
                            <input readOnly tabIndex={-1} placeholder={field.placeholder || ""} className={previewInput} />
                          ) : field.type === "YES_NO" ? (
                            <div className="gap-2 grid grid-cols-2">
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
                <p className="flex justify-center items-center gap-1.5 py-3 text-muted-foreground text-xs">
                  <Loader2 className="size-3.5 animate-spin" /> Adding field…
                </p>
              )}
            </div>
          </div>
        </main>

        {/* ================= RIGHT INSPECTOR ================= */}
        {mobileInspectorOpen && (
          <div onClick={() => setMobileInspectorOpen(false)} className="lg:hidden z-30 fixed inset-0 bg-black/40" />
        )}

        <aside
          className={cn(
            "z-40 flex-col bg-background border-l w-72 overflow-hidden shrink-0",
            mobileInspectorOpen ? "fixed inset-y-0 right-0 flex shadow-xl" : "hidden lg:relative lg:flex",
          )}
        >
          <div className="flex justify-between items-center px-4 border-b h-12 shrink-0">
            <h2 className="font-medium text-[13px]">Field settings</h2>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden size-6"
              onClick={() => setMobileInspectorOpen(false)}
              aria-label="Close settings"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {selectedField ? (
              <form onSubmit={handleSaveInspector} className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex justify-center items-center bg-brand-soft rounded-lg size-8 text-brand shrink-0">
                    <SelectedIcon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-[13px]">{TYPE_NAMES[selectedField.type]}</p>
                    <p className="font-mono text-[11px] text-muted-foreground truncate">{selectedField.labelKey}</p>
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

                <label className="flex justify-between items-center py-3 border-y cursor-pointer">
                  <span className="font-medium text-[13px]">Required</span>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={editIsRequired}
                    onChange={(e) => handleInspectorRequiredChange(e.target.checked)}
                    className="after:top-px after:left-px after:absolute relative bg-muted after:bg-card checked:bg-brand after:shadow-[inset_-1px_-1px_0_var(--bevel-dark)] border border-ink w-9 h-5 after:size-4 checked:after:translate-x-4 appearance-none cursor-pointer"
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
              <p className="px-4 py-16 text-[13px] text-muted-foreground text-center">
                Select a field on the canvas to edit it.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
