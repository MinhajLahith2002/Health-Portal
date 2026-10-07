// "use client";
//
// import { useEffect, useState } from "react";
// import DashboardLayout from "@/app/dashboard/layout";
// import { createTestOrder, getAllTestOrders } from "../api/labApi";
// import { LabTest, TestPriority } from "../types";
// import { Plus, Copy, Check } from "lucide-react";
//
// export default function TestOrdersPage() {
//     const [orders, setOrders] = useState<LabTest[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [message, setMessage] = useState("");
//     const [showForm, setShowForm] = useState(false);
//     const [copiedId, setCopiedId] = useState<string | null>(null);
//
//     const [form, setForm] = useState({
//         patientId: "", doctorId: "", hospitalId: "", requestedTests: "",
//         priority: "ROUTINE" as TestPriority, homeCollectionRequested: false, clinicalNotes: "",
//     });
//
//     const loadOrders = async () => {
//         setLoading(true);
//         try {
//             setOrders(await getAllTestOrders());
//         } catch (e) {
//             setMessage(e instanceof Error ? e.message : "Failed to load orders");
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     useEffect(() => { loadOrders(); }, []);
//
//     // const handleSubmit = async (e: React.FormEvent) => {
//     //     e.preventDefault();
//     //     try {
//     //         await createTestOrder({
//     //             ...form,
//     //             requestedTests: form.requestedTests.split(",").map((t) => t.trim()).filter(Boolean),
//     //         });
//     //         setMessage("Test order created successfully.");
//     //         setForm({ ...form, patientId: "", requestedTests: "", clinicalNotes: "" });
//     //         setShowForm(false);
//     //         loadOrders();
//     //     } catch (e) {
//     //         setMessage(e instanceof Error ? e.message : "Failed to create order");
//     //     }
//     // };
//
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         try {
//             await createTestOrder({
//                 ...form,
//                 patientId: form.patientId.trim(),
//                 doctorId: form.doctorId.trim(),
//                 hospitalId: form.hospitalId.trim(),
//                 clinicalNotes: form.clinicalNotes.trim(),
//                 requestedTests: form.requestedTests.split(",").map((t) => t.trim()).filter(Boolean),
//             });
//             setMessage("Test order created successfully.");
//             setForm({ ...form, patientId: "", requestedTests: "", clinicalNotes: "" });
//             setShowForm(false);
//             loadOrders();
//         } catch (e) {
//             setMessage(e instanceof Error ? e.message : "Failed to create order");
//         }
//     };
//
//     const handleCopyId = (id: string) => {
//         navigator.clipboard.writeText(id);
//         setCopiedId(id);
//         setTimeout(() => setCopiedId(null), 1500);
//     };
//
//     const priorityColor = (p: string) =>
//         p === "STAT" ? "bg-red-100 text-red-700" : p === "URGENT" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600";
//
//     const inputClass = "border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500";
//
//     return (
//         <DashboardLayout pageTitle="Test Orders">
//             <div className="flex items-center justify-between">
//                 <h2 className="text-lg font-semibold text-slate-900">Test Orders</h2>
//                 <button
//                     onClick={() => setShowForm(!showForm)}
//                     className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
//                 >
//                     <Plus size={16} /> New Test Order
//                 </button>
//             </div>
//
//             {showForm && (
//                 <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-2 gap-3 shadow-sm">
//                     <input placeholder="Patient ID" value={form.patientId} required
//                            onChange={(e) => setForm({ ...form, patientId: e.target.value })} className={inputClass} />
//                     <input placeholder="Doctor ID" value={form.doctorId} required
//                            onChange={(e) => setForm({ ...form, doctorId: e.target.value })} className={inputClass} />
//                     <input placeholder="Hospital ID" value={form.hospitalId} required
//                            onChange={(e) => setForm({ ...form, hospitalId: e.target.value })} className={inputClass} />
//                     <select value={form.priority}
//                             onChange={(e) => setForm({ ...form, priority: e.target.value as TestPriority })} className={inputClass}>
//                         <option value="ROUTINE">Routine</option>
//                         <option value="URGENT">Urgent</option>
//                         <option value="STAT">STAT</option>
//                     </select>
//                     <input placeholder="Tests (comma separated)" value={form.requestedTests} required
//                            onChange={(e) => setForm({ ...form, requestedTests: e.target.value })} className={`${inputClass} col-span-2`} />
//                     <textarea placeholder="Clinical notes" value={form.clinicalNotes}
//                               onChange={(e) => setForm({ ...form, clinicalNotes: e.target.value })} className={`${inputClass} col-span-2`} />
//                     <label className="flex items-center gap-2 col-span-2 text-sm text-slate-600">
//                         <input type="checkbox" checked={form.homeCollectionRequested}
//                                onChange={(e) => setForm({ ...form, homeCollectionRequested: e.target.checked })} />
//                         Home sample collection requested
//                     </label>
//                     <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm col-span-2">
//                         Create Test Order
//                     </button>
//                 </form>
//             )}
//
//             {message && <p className="text-sm text-emerald-600">{message}</p>}
//
//             <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
//                 <table className="w-full text-sm">
//                     <thead>
//                     <tr className="border-b border-slate-100 text-slate-500 text-left bg-slate-50">
//                         <th className="px-6 py-3 font-medium">Order ID</th>
//                         <th className="px-6 py-3 font-medium">Order No</th>
//                         <th className="px-6 py-3 font-medium">Patient</th>
//                         <th className="px-6 py-3 font-medium">Tests</th>
//                         <th className="px-6 py-3 font-medium">Priority</th>
//                         <th className="px-6 py-3 font-medium">Status</th>
//                     </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-100">
//                     {orders.map((o) => (
//                         <tr key={o.id}>
//                             <td className="px-6 py-3">
//                                 <button
//                                     onClick={() => handleCopyId(o.id)}
//                                     className="flex items-center gap-1.5 font-mono text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md text-slate-600 whitespace-nowrap"
//                                     title="Click to copy full ID"
//                                 >
//                                     {copiedId === o.id ? (
//                                         <>
//                                             <Check size={12} className="text-emerald-600" /> Copied!
//                                         </>
//                                     ) : (
//                                         <>
//                                             <Copy size={12} /> {o.id}
//                                         </>
//                                     )}
//                                 </button>
//                             </td>
//                             <td className="px-6 py-3">{o.testOrderNumber || o.id.slice(-6)}</td>
//                             <td className="px-6 py-3">{o.patientId}</td>
//                             <td className="px-6 py-3 text-slate-500">{o.requestedTests.join(", ")}</td>
//                             <td className="px-6 py-3">
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor(o.priority)}`}>
//                     {o.priority}
//                   </span>
//                             </td>
//                             <td className="px-6 py-3">
//                   <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
//                     {o.status}
//                   </span>
//                             </td>
//                         </tr>
//                     ))}
//                     </tbody>
//                 </table>
//                 {!loading && orders.length === 0 && (
//                     <p className="p-6 text-center text-slate-400 text-sm">No test orders found.</p>
//                 )}
//             </div>
//         </DashboardLayout>
//     );
// }


"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/app/dashboard/layout";
import { createTestOrder, getAllTestOrders } from "../api/labApi";
import { LabTest, TestPriority } from "../types";
import { patientService, PatientOption } from "@/services/prescriptionService";
import { Plus, Copy, Check, UserRound } from "lucide-react";

export default function TestOrdersPage() {
    const [orders, setOrders] = useState<LabTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const [patients, setPatients] = useState<PatientOption[]>([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [selectedPatientName, setSelectedPatientName] = useState("");

    const [form, setForm] = useState({
        patientId: "", doctorId: "", hospitalId: "", requestedTests: "",
        priority: "ROUTINE" as TestPriority, homeCollectionRequested: false, clinicalNotes: "",
    });

    const loadOrders = async () => {
        setLoading(true);
        try {
            setOrders(await getAllTestOrders());
        } catch (e) {
            setMessage(e instanceof Error ? e.message : "Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const loadPatients = async () => {
        setLoadingPatients(true);
        try {
            const p = await patientService.getAllPatients();
            setPatients(p);
        } catch (e) {
            console.error("Failed to load patients", e);
        } finally {
            setLoadingPatients(false);
        }
    };

    useEffect(() => {
        loadOrders();
        loadPatients();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.patientId) {
            setMessage("Please select a patient from the list.");
            return;
        }
        try {
            await createTestOrder({
                ...form,
                doctorId: form.doctorId.trim(),
                hospitalId: form.hospitalId.trim(),
                clinicalNotes: form.clinicalNotes.trim(),
                requestedTests: form.requestedTests.split(",").map((t) => t.trim()).filter(Boolean),
            });
            setMessage("Test order created successfully.");
            setForm({ ...form, patientId: "", requestedTests: "", clinicalNotes: "" });
            setSelectedPatientName("");
            setShowForm(false);
            loadOrders();
        } catch (e) {
            setMessage(e instanceof Error ? e.message : "Failed to create order");
        }
    };

    const handleCopyId = (id: string) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const priorityColor = (p: string) =>
        p === "STAT" ? "bg-red-100 text-red-700" : p === "URGENT" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600";

    const inputClass = "border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500";

    return (
        <DashboardLayout pageTitle="Test Orders">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Test Orders</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
                >
                    <Plus size={16} /> New Test Order
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-2 gap-3 shadow-sm">
                    <div className="col-span-2">
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Select Patient *
                        </label>
                        <select
                            value={form.patientId}
                            required
                            disabled={loadingPatients}
                            onChange={(e) => {
                                const selected = patients.find((p) => p.value === e.target.value);
                                setForm({ ...form, patientId: e.target.value });
                                setSelectedPatientName(selected?.label || "");
                            }}
                            className={`${inputClass} w-full`}
                        >
                            <option value="">-- Search and Select Patient --</option>
                            {patients.map((p) => (
                                <option key={p.value} value={p.value}>
                                    {p.label} ({p.value})
                                </option>
                            ))}
                        </select>
                        {selectedPatientName && (
                            <div className="mt-2 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/50 p-2.5">
                                <UserRound size={16} className="text-blue-600" />
                                <span className="text-sm font-medium text-slate-800">{selectedPatientName}</span>
                            </div>
                        )}
                    </div>

                    <input placeholder="Doctor ID" value={form.doctorId} required
                           onChange={(e) => setForm({ ...form, doctorId: e.target.value })} className={inputClass} />
                    <input placeholder="Hospital ID" value={form.hospitalId} required
                           onChange={(e) => setForm({ ...form, hospitalId: e.target.value })} className={inputClass} />
                    <select value={form.priority}
                            onChange={(e) => setForm({ ...form, priority: e.target.value as TestPriority })} className={inputClass}>
                        <option value="ROUTINE">Routine</option>
                        <option value="URGENT">Urgent</option>
                        <option value="STAT">STAT</option>
                    </select>
                    <input placeholder="Tests (comma separated)" value={form.requestedTests} required
                           onChange={(e) => setForm({ ...form, requestedTests: e.target.value })} className={`${inputClass} col-span-2`} />
                    <textarea placeholder="Clinical notes" value={form.clinicalNotes}
                              onChange={(e) => setForm({ ...form, clinicalNotes: e.target.value })} className={`${inputClass} col-span-2`} />
                    <label className="flex items-center gap-2 col-span-2 text-sm text-slate-600">
                        <input type="checkbox" checked={form.homeCollectionRequested}
                               onChange={(e) => setForm({ ...form, homeCollectionRequested: e.target.checked })} />
                        Home sample collection requested
                    </label>
                    <button type="submit" disabled={loadingPatients}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg text-sm col-span-2">
                        Create Test Order
                    </button>
                </form>
            )}

            {message && <p className="text-sm text-emerald-600">{message}</p>}

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-slate-100 text-slate-500 text-left bg-slate-50">
                        <th className="px-6 py-3 font-medium">Order ID</th>
                        <th className="px-6 py-3 font-medium">Order No</th>
                        <th className="px-6 py-3 font-medium">Patient</th>
                        <th className="px-6 py-3 font-medium">Tests</th>
                        <th className="px-6 py-3 font-medium">Priority</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {orders.map((o) => (
                        <tr key={o.id}>
                            <td className="px-6 py-3">
                                <button
                                    onClick={() => handleCopyId(o.id)}
                                    className="flex items-center gap-1.5 font-mono text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md text-slate-600 whitespace-nowrap"
                                    title="Click to copy full ID"
                                >
                                    {copiedId === o.id ? (
                                        <>
                                            <Check size={12} className="text-emerald-600" /> Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={12} /> {o.id}
                                        </>
                                    )}
                                </button>
                            </td>
                            <td className="px-6 py-3">{o.testOrderNumber || o.id.slice(-6)}</td>
                            <td className="px-6 py-3">
                                {patients.find((p) => p.value === o.patientId)?.label || o.patientId}
                            </td>
                            <td className="px-6 py-3 text-slate-500">{o.requestedTests.join(", ")}</td>
                            <td className="px-6 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor(o.priority)}`}>
                    {o.priority}
                  </span>
                            </td>
                            <td className="px-6 py-3">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    {o.status}
                  </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {!loading && orders.length === 0 && (
                    <p className="p-6 text-center text-slate-400 text-sm">No test orders found.</p>
                )}
            </div>
        </DashboardLayout>
    );
}