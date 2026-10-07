/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Camera, Save } from "lucide-react";
import type { Doctor, DoctorProfileUpdate } from "../types";
import { validateProfile } from "../validations";

const inputClass = "mt-1.5 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export default function DoctorProfileForm({ doctor, onSave }: { doctor: Doctor; onSave: (data: DoctorProfileUpdate) => Promise<void> }) {
  const initial: DoctorProfileUpdate = {
    fullName: doctor.fullName, email: doctor.email, phoneNumber: doctor.phoneNumber,
    profileImage: doctor.profileImage, gender: doctor.gender, dateOfBirth: doctor.dateOfBirth,
    address: doctor.address, specialization: doctor.specialization,
    qualifications: doctor.qualifications, experience: doctor.experience,
    consultationFee: doctor.consultationFee, bio: doctor.bio,
  };
  const [form, setForm] = useState<DoctorProfileUpdate>(initial);
  const [qualifications, setQualifications] = useState(initial.qualifications.join(", "));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const update = (key: keyof DoctorProfileUpdate, value: string | number) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const next = { ...form, qualifications: qualifications.split(",").map((item) => item.trim()).filter(Boolean) };
    const validation = validateProfile(next);
    if (validation) { setMessage(validation); return; }
    setSaving(true); await onSave(next); setSaving(false); setEditing(false); setMessage("Profile updated successfully.");
  }

  return <form onSubmit={submit} className="space-y-6">
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="relative">{ }<img src={form.profileImage} alt={form.fullName} className="h-24 w-24 rounded-lg object-cover" />{editing && <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white"><Camera className="h-4 w-4" /></span>}</div><div className="flex-1"><h2 className="text-xl font-bold">{form.fullName}</h2><p className="mt-1 text-sm font-medium text-blue-700">{form.specialization}</p><p className="mt-2 text-sm text-slate-500">{form.qualifications.join(" | ")} · {form.experience} years experience</p></div><button type="button" onClick={() => { setEditing((value) => !value); setMessage(""); }} className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50">{editing ? "Cancel editing" : "Edit profile"}</button></div></section>
    {message && <p className={`rounded-md px-4 py-3 text-sm ${message.includes("successfully") ? "bg-blue-50 text-blue-700" : "bg-rose-50 text-rose-700"}`}>{message}</p>}
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="mb-5 text-base font-bold">Personal information</h2><fieldset disabled={!editing} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <Label text="Full name"><input className={inputClass} value={form.fullName} onChange={(e) => update("fullName", e.target.value)} /></Label>
      <Label text="Email"><input type="email" className={inputClass} value={form.email} onChange={(e) => update("email", e.target.value)} /></Label>
      <Label text="Phone number"><input className={inputClass} value={form.phoneNumber} onChange={(e) => update("phoneNumber", e.target.value)} /></Label>
      <Label text="Gender"><select className={inputClass} value={form.gender} onChange={(e) => update("gender", e.target.value)}><option>Female</option><option>Male</option><option>Other</option></select></Label>
      <Label text="Date of birth"><input type="date" className={inputClass} value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} /></Label>
      <Label text="Profile image URL"><input className={inputClass} value={form.profileImage} onChange={(e) => update("profileImage", e.target.value)} /></Label>
      <div className="sm:col-span-2"><Label text="Address"><input className={inputClass} value={form.address} onChange={(e) => update("address", e.target.value)} /></Label></div>
    </fieldset></section>
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="mb-5 text-base font-bold">Professional details</h2><fieldset disabled={!editing} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <Label text="Specialization"><input className={inputClass} value={form.specialization} onChange={(e) => update("specialization", e.target.value)} /></Label>
      <Label text="Qualifications (comma separated)"><input className={inputClass} value={qualifications} onChange={(e) => setQualifications(e.target.value)} /></Label>
      <Label text="Experience (years)"><input type="number" min="0" className={inputClass} value={form.experience} onChange={(e) => update("experience", Number(e.target.value))} /></Label>
      <Label text="Consultation fee (LKR)"><input type="number" min="0" className={inputClass} value={form.consultationFee} onChange={(e) => update("consultationFee", Number(e.target.value))} /></Label>
    </fieldset>{editing && <div className="mt-6 flex justify-end"><button disabled={saving} className="flex h-11 items-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"><Save className="h-4 w-4" />{saving ? "Saving..." : "Save changes"}</button></div>}</section>
  </form>;
}

function Label({ text, children }: { text: string; children: React.ReactNode }) { return <label className="block text-xs font-semibold text-slate-600">{text}{children}</label>; }
