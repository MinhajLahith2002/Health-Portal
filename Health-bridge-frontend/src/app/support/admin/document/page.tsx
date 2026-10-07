"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";

import Navbar from "@/components/ui/Navbar";
import Sidebar from "@/components/ui/Sidebar";
import {
  getAllSupportDocuments,
  uploadSupportDocument,
  deleteSupportDocument,
  SupportDocument,
} from "@/services/supportDocumentService";

const categories = [
  { value: "BILLING", label: "Billing" },
  { value: "LAB_REPORT", label: "Lab Report" },
  { value: "MEDICAL_RECORD", label: "Medical Record" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "ADMISSION", label: "Admission" },
  { value: "DISCHARGE", label: "Discharge" },
  { value: "MEDICINE", label: "Medicine" },
  { value: "OTHER", label: "Other" },
];

const categoryStyles: Record<string, string> = {
  BILLING: "bg-amber-50 text-amber-700 ring-amber-600/20",
  LAB_REPORT: "bg-violet-50 text-violet-700 ring-violet-600/20",
  MEDICAL_RECORD: "bg-blue-50 text-blue-700 ring-blue-600/20",
  INSURANCE: "bg-teal-50 text-teal-700 ring-teal-600/20",
  ADMISSION: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  DISCHARGE: "bg-rose-50 text-rose-700 ring-rose-600/20",
  MEDICINE: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-600/20",
  OTHER: "bg-gray-100 text-gray-600 ring-gray-500/20",
};

const formatCategory = (category: string) => category.replaceAll("_", " ");

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const DESCRIPTION_LIMIT = 140;

function DocumentDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  if (!text) {
    return <p className="mt-1 text-sm italic text-gray-400">No description provided.</p>;
  }

  const isLong = text.length > DESCRIPTION_LIMIT;
  const shown = expanded || !isLong ? text : `${text.slice(0, DESCRIPTION_LIMIT)}…`;

  return (
    <p className="mt-1 w-full text-sm leading-6 text-gray-600">
      {shown}
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="ml-1.5 font-medium text-blue-600 hover:text-blue-700"
        >
          {expanded ? "Show less" : "Show all"}
        </button>
      )}
    </p>
  );
}

export default function SupportDocumentsPage() {
  const [documents, setDocuments] = useState<SupportDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [panelOpen, setPanelOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // State to manage the delete confirmation modal
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllSupportDocuments();
      setDocuments(data);
    } catch (err) {
      console.error("Failed to load support documents:", err);
      setError("Failed to load support documents.");
    } finally {
      setLoading(false);
    }
  };

  const getDocumentsByCategory = (category: string) =>
    documents.filter((document) => document.category === category);

  const confirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      setIsDeleting(true);
      await deleteSupportDocument(documentToDelete);
      setDocuments((prev) => prev.filter((document) => document.id !== documentToDelete));
      setDocumentToDelete(null);
    } catch (err) {
      console.error("Failed to delete document:", err);
      alert("Failed to delete document.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreated = (created: SupportDocument) => {
    setDocuments((prev) => [created, ...prev]);
    setPanelOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        userRole="ADMIN"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          title="Support Documents"
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
          userRole="ADMIN"
        />

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.history.back()}
                aria-label="Go back"
                title="Go back"
                className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <ArrowLeft size={22} />
              </button>
              <p className="mt-1 text-sm text-gray-500">
              View and manage documents available for patient support.
            </p>
            </div>
           
          </div>

          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            + Add Document
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500">Loading documents...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {/* Categories */}
        {!loading && !error && (
          <div className="space-y-10">
            {categories.map((cat) => {
              const categoryDocuments = getDocumentsByCategory(cat.value);

              return (
                <section key={cat.value}>
                  <div className="mb-4 border-b border-gray-200 pb-3">
                    <h2 className="text-lg font-bold uppercase tracking-wide text-gray-800">
                      {cat.label}
                    </h2>
                  </div>

                  {categoryDocuments.length === 0 ? (
                    <p className="px-1 text-sm italic text-gray-400">No documents available.</p>
                  ) : (
                    <div className="space-y-4">
                      {categoryDocuments.map((document) => (
                        <div
                          key={document.id}
                          className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4"
                        >
                          {/* Document details */}
                          <div className="min-w-0 w-full max-w-[2000px]">
                            <DocumentDescription text={document.description ?? ""} />
                          </div>

                          {/* Actions */}
                          <div className="flex shrink-0 items-center gap-2">
                            <a
                              href={document.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Open document"
                              title="Open document"
                              className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 text-gray-500 transition hover:border-gray-400 hover:bg-gray-50 hover:text-gray-700"
                            >
                              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                                <path
                                  d="M7 3.5h7l5 5V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V5A1.5 1.5 0 0 1 6.5 3.5H7Z"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M14 3.5V8a1 1 0 0 0 1 1h4.5"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </a>

                            <button
                              type="button"
                              onClick={() => setDocumentToDelete(document.id)}
                              aria-label="Delete document"
                              title="Delete document"
                              className="flex h-10 w-10 items-center justify-center rounded-md bg-red-600 text-white transition hover:bg-red-700"
                            >
                              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                                <path
                                  d="M5 7h14M10 11v6M14 11v6M6.5 7l1-3h9l1 3M8 7v12a1.5 1.5 0 0 0 1.5 1.5h5A1.5 1.5 0 0 0 16 19V7"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
          </div>
        </main>

        <AddDocumentPanel
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
          onCreated={handleCreated}
        />

      {/* Custom Delete Confirmation Modal */}
      {documentToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl transition-all">
            <h3 className="text-lg font-bold text-gray-900">Delete Document</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDocumentToDelete(null)}
                disabled={isDeleting}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function AddDocumentPanel({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (doc: SupportDocument) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ file?: string; category?: string; form?: string }>({});

  const reset = () => {
    setFile(null);
    setCategory("");
    setDescription("");
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleFileSelect = useCallback((selected: File | null) => {
    setFile(selected);
    setErrors((prev) => ({ ...prev, file: undefined, form: undefined }));
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFileSelect(dropped);
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!file) next.file = "Choose a file to upload.";
    if (!category) next.category = "Select a category.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !file) return;

    try {
      setSubmitting(true);
      setErrors((prev) => ({ ...prev, form: undefined }));

    const created = await uploadSupportDocument(
  category,
  description,
  file
);

      reset();
      onCreated(created);
    } catch (err) {
      console.error("Failed to add support document:", err);
      setErrors((prev) => ({
        ...prev,
        form: "Something went wrong while uploading. Please try again.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">Add Document</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <path
                d="M5 5L15 15M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
          {/* Category */}
          <div className="mb-7">
            <label className="mb-2 block text-sm font-medium text-gray-800">Category</label>

            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => {
                const selected = category === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      setCategory(c.value);
                      setErrors((prev) => ({ ...prev, category: undefined }));
                    }}
                    className={[
                      "rounded-lg border px-3 py-2.5 text-sm font-medium transition",
                      selected
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>

            {errors.category && (
              <p className="mt-1.5 text-xs font-medium text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-7">
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-800">
              Description <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What is this document, and when should it be used?"
              className="w-full resize-none rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Dropzone */}
          <div className="mb-8">
            <label className="mb-2 block text-sm font-medium text-gray-800">Document</label>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={[
                "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition",
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : errors.file
                  ? "border-red-300 bg-red-50/40"
                  : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100",
              ].join(" ")}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              />

              {file ? (
                <div className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left">
                  <span className="text-xl">📄</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileSelect(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="shrink-0 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Remove file"
                  >
                    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                      <path
                        d="M5 5L15 15M15 5L5 15"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" className="mb-3 h-7 w-7 text-gray-400">
                    <path
                      d="M12 16V4M12 4L7 9M12 4L17 9"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 16V18.5C4 19.3284 4.67157 20 5.5 20H18.5C19.3284 20 20 19.3284 20 18.5V16"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-700">
                    Drag a file here, or click to browse
                  </p>
                  <p className="mt-1 text-xs text-gray-400">PDF, image, or document files</p>
                </>
              )}
            </div>

            {errors.file && (
              <p className="mt-1.5 text-xs font-medium text-red-600">{errors.file}</p>
            )}
          </div>

          {errors.form && (
            <div className="mb-6 rounded-lg bg-red-50 p-3.5 text-sm text-red-700">
              {errors.form}
            </div>
          )}

          <div className="mt-auto flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="opacity-25"
                  />
                  <path
                    d="M21 12a9 9 0 0 0-9-9"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="opacity-90"
                  />
                </svg>
              )}
              {submitting ? "Uploading..." : "Add Document"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}