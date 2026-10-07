
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TICKET_CATEGORIES } from "@/constants/support";
import { PaperclipIcon, XIcon } from "./icons";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CreateTicketModal({
  onCreate,
}: {
  onCreate: (
    subject: string,
    description: string,
    category: string,
    contactNumber: string,
    attachment: File | null
  ) => Promise<void>;
}) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const reset = () => {
    setSubject("");
    setDescription("");
    setCategory("");
    setContactNumber("");
    setAttachment(null);
    setError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (
      !subject.trim() ||
      !description.trim() ||
      !category ||
      !contactNumber.trim()
    ) {
      setError(
        "Subject, description, category, and contact number are required."
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onCreate(
        subject.trim(),
        description.trim(),
        category,
        contactNumber.trim(),
        attachment
      );

      reset();
      router.push("/support/patient");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to create ticket."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      setAttachment(file);
    }
  };

  return (
   <div className="rounded-2xl border  bg-[#EAF4FF] shadow-sm">

      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0052cc]/10 text-[#0052cc]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.5 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2.5m-7 0 3.5 3 3.5-3m-7 0h7"
              />
            </svg>
          </div>

          <div>
            <h2 className="text-base font-semibold leading-snug text-slate-900">
              Raise a support ticket
            </h2>

            <p className="text-sm text-slate-500">
              We'll get back to you as soon as we can.
            </p>
          </div>

        </div>
      </div>

      {/* Body */}
      <div className="space-y-5 px-6 py-5">

        {/* Category */}
        <div>
          <label
            htmlFor="ticket-category"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Category
          </label>

          <div className="relative">
            <select
              id="ticket-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none transition focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/10"
            >
              <option value="">Select a category</option>

              {TICKET_CATEGORIES.map((ticketCategory) => (
                <option
                  key={ticketCategory}
                  value={ticketCategory}
                >
                  {ticketCategory.replaceAll("_", " ")}
                </option>
              ))}
            </select>

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m6 9 6 6 6-6"
              />
            </svg>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label
            htmlFor="ticket-subject"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Subject
          </label>

          <input
            id="ticket-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Unable to book an appointment"
className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/10"
  />
        </div>

        {/* Description */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="ticket-description"
              className="block text-sm font-medium text-slate-700"
            >
              Description
            </label>

            <span className="text-xs text-slate-400">
              {description.length} characters
            </span>
          </div>

          <textarea
            id="ticket-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe the issue in detail…"
className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/10"          />
        </div>

        {/* Contact Number */}
        <div>
          <label
            htmlFor="ticket-contact-number"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Contact number
          </label>

          <div className="relative">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5.5C3 4.67 3.67 4 4.5 4h2.7c.5 0 .93.35 1.02.85l.66 3.5a1.04 1.04 0 0 1-.42 1.05l-1.5 1.1a12.5 12.5 0 0 0 5.55 5.55l1.1-1.5c.27-.36.7-.53 1.05-.42l3.5.66c.5.1.85.53.85 1.02V19.5c0 .83-.67 1.5-1.5 1.5C10.6 21 3 13.4 3 5.5Z"
              />
            </svg>

            <input
              id="ticket-contact-number"
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="e.g. +1 555 123 4567"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#0052cc] focus:ring-4 focus:ring-[#0052cc]/10"
            />

          </div>
        </div>

        {/* Attachment */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Attachment{" "}
            <span className="font-normal text-slate-400">
              (optional)
            </span>
          </span>

          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) =>
              setAttachment(e.target.files?.[0] ?? null)
            }
            className="hidden"
          />

          {attachment ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">

              <div className="flex min-w-0 items-center gap-2.5">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#0052cc] ring-1 ring-slate-200">
                  <PaperclipIcon className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {attachment.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() => {
                  setAttachment(null);

                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                aria-label="Remove attachment"
                className="shrink-0 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
              >
                <XIcon className="h-4 w-4" />
              </button>

            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            className={`flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed bg-white px-3.5 py-5 text-center ${
  dragActive
    ? "border-[#0052cc] bg-[#0052cc]/5"
    : "border-slate-200"
}`}
            >
              <PaperclipIcon className="h-5 w-5 text-slate-400" />

              <span className="text-sm text-slate-600">
                <span className="font-medium text-[#0052cc]">
                  Click to attach
                </span>{" "}
                or drag a file here
              </span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-2.5">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              className="mt-0.5 h-4 w-4 shrink-0 text-rose-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
              />
            </svg>

            <p className="text-sm text-rose-700">
              {error}
            </p>

          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">

        <button
          type="button"
          onClick={reset}
          disabled={submitting}
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0052CC] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#0044aa] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4 animate-spin"
            >
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

          {submitting ? "Submitting…" : "Submit ticket"}
        </button>

      </div>
    </div>
  );
}

