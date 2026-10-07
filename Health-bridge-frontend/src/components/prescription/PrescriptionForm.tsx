"use client";
import { useState, useEffect } from "react";
import { patientService, PatientOption, medicineService, MedicineOption } from "@/services/prescriptionService";
import MedicineSelector from "./MedicineSelector";
import { UserRound, Phone, Plus, Trash2, AlertTriangle, Loader2, Stethoscope } from "lucide-react";

interface MedicineItem { medicineId: string; medicineName: string; dosage: string; frequency: string; duration: string; quantity: number; instructions: string; }
interface Interaction { medicine1: string; medicine2: string; description: string; }

const VALID_DAYS_OPTIONS = [7, 14, 30, 60, 90];

interface PrescriptionFormProps {
  mode?: "create" | "edit";
  initialData?: {
    patientId: string;
    patientName: string;
    patientPhone: string;
    diagnosis?: string;
    notes: string;
    items: MedicineItem[];
  };
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export default function PrescriptionForm({ mode = "create", initialData, onSubmit, isSubmitting }: PrescriptionFormProps) {
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [medicines, setMedicines] = useState<MedicineOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [patientId, setPatientId] = useState(initialData?.patientId || "");
  const [patientName, setPatientName] = useState(initialData?.patientName || "");
  const [patientPhone, setPatientPhone] = useState(initialData?.patientPhone || "");
  const [diagnosis, setDiagnosis] = useState(initialData?.diagnosis || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [items, setItems] = useState<MedicineItem[]>(initialData?.items || []);
  const [interactions, setInteractions] = useState<Interaction[]>([]);

  const [validDays, setValidDays] = useState(30);

  const [selectedMed, setSelectedMed] = useState("");
  const [selectedMedLabel, setSelectedMedLabel] = useState("");
  const [selectedMedInteractions, setSelectedMedInteractions] = useState<string[]>([]);
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, m] = await Promise.all([patientService.getAllPatients(), medicineService.getAllMedicines()]);
        setPatients(p);
        setMedicines(m);
      } catch (error) { console.error("Error loading options", error); }
      finally { setLoadingOptions(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!initialData) return;
    setPatientId(initialData.patientId || "");
    setPatientName(initialData.patientName || "");
    setPatientPhone(initialData.patientPhone || "");
    setDiagnosis(initialData.diagnosis || "");
    setNotes(initialData.notes || "");
    setItems(initialData.items || []);
  }, [initialData]);

  const checkInteractions = (newInts: string[], newName: string) => {
    const found: Interaction[] = [];
    items.forEach((item) => {
      const existing = medicines.find((m) => m.value === item.medicineId);
      if (existing && newInts.some(i => existing.label.includes(i))) {
        found.push({ medicine1: newName, medicine2: existing.label.split(" (")[0], description: `Potential interaction between ${newName} and ${existing.label.split(" (")[0]}.` });
      }
    });
    return found;
  };

  const handleAddMedicine = () => {
    if (!selectedMed || !dosage || !frequency) return alert("Please fill medicine, dosage, and frequency!");
    const newInts = checkInteractions(selectedMedInteractions, selectedMedLabel);
    if (newInts.length > 0) setInteractions((prev) => [...prev, ...newInts]);

    setItems([...items, { medicineId: selectedMed, medicineName: selectedMedLabel, dosage, frequency, duration, quantity, instructions }]);
    setSelectedMed(""); setSelectedMedLabel(""); setSelectedMedInteractions([]);
    setDosage(""); setFrequency(""); setDuration(""); setQuantity(1); setInstructions("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert("Add at least one medicine!");
    if (!patientId) return alert("Please select a patient from the database!");

    const cleanPhone = patientPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) return alert("Please enter a valid 10-digit phone number!");

    onSubmit({
      patientId,
      patientName,
      patientPhone: cleanPhone,
      diagnosis,
      notes,
      items,
      ...(mode === "create" ? { validDays } : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {interactions.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-sm font-bold">Drug Interactions Detected</h2>
          </div>
          <div className="mt-3 space-y-2">
            {interactions.map((int, idx) => (
              <div key={idx} className="rounded-xl bg-white p-3 border border-rose-100">
                <p className="text-xs font-bold text-slate-800">{int.medicine1} + {int.medicine2}</p>
                <p className="mt-1 text-xs text-slate-600">{int.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2"><Plus className="h-4 w-4 text-blue-600"/> Add Medicine</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search & Select Medicine *</label>
                <MedicineSelector options={medicines} value={selectedMed} onChange={(val, label, ints) => { setSelectedMed(val); setSelectedMedLabel(label); setSelectedMedInteractions(ints); }} isLoading={loadingOptions} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Dosage *</label>
                <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g., 500mg" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Frequency *</label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                  <option value="">-- Select --</option>
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Duration</label>
                <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g., 7 days" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Quantity</label>
                <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Instructions</label>
                <input type="text" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="e.g., Take after meals" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>
            <button type="button" onClick={handleAddMedicine} className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-[0.98]">
              + Add to Prescription
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">Added Medicines ({items.length})</h2>
            {items.length === 0 ? (
              <p className="mt-4 text-center text-sm text-slate-400">No medicines added yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/30">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.medicineName}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.dosage} • {item.frequency} • {item.duration}</p>
                    </div>
                    <button type="button" onClick={() => setItems(items.filter((_, i) => i !== index))} className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Patient Information</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Select Patient *</label>
                <select
                  value={patientId}
                  onChange={(e) => {
                    const selected = patients.find(p => p.value === e.target.value);
                    setPatientId(e.target.value);
                    setPatientName(selected?.label || "");
                    setPatientPhone(selected?.phone || "");
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={loadingOptions || mode === "edit"}
                >
                  <option value="">-- Search and Select Patient --</option>
                  {patients.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                {mode === "edit" && (
                  <p className="mt-1 text-[10px] text-slate-400">Patient can't be changed once a prescription is issued.</p>
                )}
              </div>
              {patientName && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600"><UserRound className="h-5 w-5"/></div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{patientName}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1"><Phone className="h-3 w-3"/> {patientPhone}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Diagnosis</label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g., Acute upper respiratory infection"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {mode === "create" && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Valid For</label>
                  <select
                    value={validDays}
                    onChange={(e) => setValidDays(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {VALID_DAYS_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d} days</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Doctor's Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={5} placeholder="Add any special instructions or clinical notes..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm leading-relaxed outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>
          </div>
          <button type="submit" disabled={isSubmitting || loadingOptions} className="w-full rounded-xl bg-blue-500 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-blue-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin"/> : null}
            {isSubmitting ? "Saving Prescription..." : mode === "edit" ? "Save Changes" : "Save Prescription"}
          </button>
        </div>
      </div>
    </form>
  );
}