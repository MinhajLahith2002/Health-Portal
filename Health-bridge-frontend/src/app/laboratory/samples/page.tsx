// "use client";
//
// import { useEffect, useState } from "react";
// import DashboardLayout from "@/app/dashboard/layout";
// import { collectSample, receiveSampleByBarcode, getAllSamples } from "../api/labApi";
// import { LabSample } from "../types";
// import { Copy, Check } from "lucide-react";
//
// export default function SamplesPage() {
//     const [form, setForm] = useState({
//         testOrderId: "", barcodeId: "", sampleType: "Blood", collectedBy: "", collectionLocation: "Lab",
//     });
//     const [message, setMessage] = useState("");
//     const [samples, setSamples] = useState<LabSample[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [copiedId, setCopiedId] = useState<string | null>(null);
//
//     const inputClass = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500";
//
//     const loadSamples = async () => {
//         setLoading(true);
//         try {
//             setSamples(await getAllSamples());
//         } catch (e) {
//             setMessage(e instanceof Error ? e.message : "Failed to load samples");
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     useEffect(() => { loadSamples(); }, []);
//
//     const handleCollect = async (e: React.FormEvent) => {
//         e.preventDefault();
//         try {
//             await collectSample(form);
//             setMessage(`Sample ${form.barcodeId} marked as collected.`);
//             loadSamples();
//         } catch (err) {
//             setMessage(err instanceof Error ? err.message : "Failed to collect sample");
//         }
//     };
//
//     const handleReceive = async () => {
//         if (!form.barcodeId) return setMessage("Enter a barcode ID first.");
//         try {
//             await receiveSampleByBarcode(form.barcodeId);
//             setMessage(`Sample ${form.barcodeId} received at lab.`);
//             loadSamples();
//         } catch (err) {
//             setMessage(err instanceof Error ? err.message : "Failed to receive sample");
//         }
//     };
//
//     const handleCopyId = (id: string) => {
//         navigator.clipboard.writeText(id);
//         setCopiedId(id);
//         setTimeout(() => setCopiedId(null), 1500);
//     };
//
//     const statusColor = (status: string) =>
//         status === "RECEIVED" ? "bg-emerald-100 text-emerald-700" :
//             status === "COLLECTED" ? "bg-blue-100 text-blue-700" :
//                 status === "REJECTED" ? "bg-red-100 text-red-700" :
//                     "bg-slate-100 text-slate-600";
//
//     return (
//         <DashboardLayout pageTitle="Sample Collection">
//             <h2 className="text-lg font-semibold text-slate-900">Sample Collection</h2>
//
//             <form onSubmit={handleCollect} className="bg-white border border-slate-200 rounded-xl p-6 max-w-lg space-y-3 shadow-sm">
//                 <input placeholder="Test Order ID" value={form.testOrderId} required
//                        onChange={(e) => setForm({ ...form, testOrderId: e.target.value })} className={inputClass} />
//                 <input placeholder="Barcode ID (scan)" value={form.barcodeId} required
//                        onChange={(e) => setForm({ ...form, barcodeId: e.target.value })} className={inputClass} />
//                 <select value={form.sampleType}
//                         onChange={(e) => setForm({ ...form, sampleType: e.target.value })} className={inputClass}>
//                     <option>Blood</option><option>Urine</option><option>Swab</option>
//                 </select>
//                 <input placeholder="Collected By (Lab Officer ID)" value={form.collectedBy} required
//                        onChange={(e) => setForm({ ...form, collectedBy: e.target.value })} className={inputClass} />
//                 <select value={form.collectionLocation}
//                         onChange={(e) => setForm({ ...form, collectionLocation: e.target.value })} className={inputClass}>
//                     <option>Lab</option><option>Home</option>
//                 </select>
//                 <div className="flex gap-2 pt-2">
//                     <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm">
//                         Mark Collected
//                     </button>
//                     <button type="button" onClick={handleReceive}
//                             className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg text-sm">
//                         Receive at Lab
//                     </button>
//                 </div>
//                 {message && <p className="text-sm text-emerald-600">{message}</p>}
//             </form>
//
//             <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
//                 <table className="w-full text-sm">
//                     <thead>
//                     <tr className="border-b border-slate-100 text-slate-500 text-left bg-slate-50">
//                         <th className="px-6 py-3 font-medium">Sample ID</th>
//                         <th className="px-6 py-3 font-medium">Test Order ID</th>
//                         <th className="px-6 py-3 font-medium">Barcode</th>
//                         <th className="px-6 py-3 font-medium">Type</th>
//                         <th className="px-6 py-3 font-medium">Status</th>
//                     </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-100">
//                     {samples.map((s) => (
//                         <tr key={s.id}>
//                             <td className="px-6 py-3">
//                                 <button
//                                     onClick={() => handleCopyId(s.id)}
//                                     className="flex items-center gap-1.5 font-mono text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md text-slate-600 whitespace-nowrap"
//                                     title="Click to copy full Sample ID"
//                                 >
//                                     {copiedId === s.id ? (
//                                         <><Check size={12} className="text-emerald-600" /> Copied!</>
//                                     ) : (
//                                         <><Copy size={12} /> {s.id}</>
//                                     )}
//                                 </button>
//                             </td>
//                             <td className="px-6 py-3">
//                                 <button
//                                     onClick={() => handleCopyId(s.testOrderId)}
//                                     className="flex items-center gap-1.5 font-mono text-xs bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded-md text-slate-500 whitespace-nowrap"
//                                     title="Click to copy Test Order ID"
//                                 >
//                                     {copiedId === s.testOrderId ? (
//                                         <><Check size={12} className="text-emerald-600" /> Copied!</>
//                                     ) : (
//                                         <><Copy size={12} /> {s.testOrderId}</>
//                                     )}
//                                 </button>
//                             </td>
//                             <td className="px-6 py-3">{s.barcodeId}</td>
//                             <td className="px-6 py-3 text-slate-500">{s.sampleType}</td>
//                             <td className="px-6 py-3">
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(s.status)}`}>
//                     {s.status}
//                   </span>
//                             </td>
//                         </tr>
//                     ))}
//                     </tbody>
//                 </table>
//                 {!loading && samples.length === 0 && (
//                     <p className="p-6 text-center text-slate-400 text-sm">No samples found.</p>
//                 )}
//             </div>
//         </DashboardLayout>
//     );
// }

"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/app/dashboard/layout";
import { collectSample, receiveSampleByBarcode, getAllSamples } from "../api/labApi";
import { LabSample } from "../types";
import { Copy, Check } from "lucide-react";

export default function SamplesPage() {
    const [form, setForm] = useState({
        testOrderId: "", barcodeId: "", sampleType: "Blood", collectedBy: "", collectionLocation: "Lab",
    });
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [samples, setSamples] = useState<LabSample[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const inputClass = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500";

    const loadSamples = async () => {
        setLoading(true);
        try {
            setSamples(await getAllSamples());
        } catch (e) {
            setMessage(e instanceof Error ? e.message : "Failed to load samples");
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadSamples(); }, []);

    const handleCollect = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await collectSample(form);
            setMessage(`Sample ${form.barcodeId} marked as collected.`);
            setIsError(false);
            await loadSamples();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Failed to collect sample");
            setIsError(true);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReceive = async () => {
        if (!form.barcodeId) {
            setMessage("Enter a barcode ID first.");
            setIsError(true);
            return;
        }
        setSubmitting(true);
        try {
            await receiveSampleByBarcode(form.barcodeId);
            setMessage(`Sample ${form.barcodeId} received at lab.`);
            setIsError(false);
            await loadSamples();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Failed to receive sample");
            setIsError(true);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCopyId = (id: string) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const statusColor = (status: string) =>
        status === "RECEIVED" ? "bg-emerald-100 text-emerald-700" :
            status === "COLLECTED" ? "bg-blue-100 text-blue-700" :
                status === "REJECTED" ? "bg-red-100 text-red-700" :
                    "bg-slate-100 text-slate-600";

    return (
        <DashboardLayout pageTitle="Sample Collection">
            <h2 className="text-lg font-semibold text-slate-900">Sample Collection</h2>

            <form onSubmit={handleCollect} className="bg-white border border-slate-200 rounded-xl p-6 max-w-lg space-y-3 shadow-sm">
                <input placeholder="Test Order ID" value={form.testOrderId} required
                       onChange={(e) => setForm({ ...form, testOrderId: e.target.value })} className={inputClass} />
                <input placeholder="Barcode ID (scan)" value={form.barcodeId} required
                       onChange={(e) => setForm({ ...form, barcodeId: e.target.value.trim() })} className={inputClass} />
                <select value={form.sampleType}
                        onChange={(e) => setForm({ ...form, sampleType: e.target.value })} className={inputClass}>
                    <option>Blood</option><option>Urine</option><option>Swab</option>
                </select>
                <input placeholder="Collected By (Lab Officer ID)" value={form.collectedBy} required
                       onChange={(e) => setForm({ ...form, collectedBy: e.target.value })} className={inputClass} />
                <select value={form.collectionLocation}
                        onChange={(e) => setForm({ ...form, collectionLocation: e.target.value })} className={inputClass}>
                    <option>Lab</option><option>Home</option>
                </select>
                <div className="flex gap-2 pt-2">
                    <button type="submit" disabled={submitting}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg text-sm">
                        {submitting ? "Processing..." : "Mark Collected"}
                    </button>
                    <button type="button" onClick={handleReceive} disabled={submitting}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-medium px-4 py-2 rounded-lg text-sm">
                        {submitting ? "Processing..." : "Receive at Lab"}
                    </button>
                </div>
                {message && (
                    <p className={`text-sm ${isError ? "text-red-600" : "text-emerald-600"}`}>{message}</p>
                )}
            </form>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-slate-100 text-slate-500 text-left bg-slate-50">
                        <th className="px-6 py-3 font-medium">Sample ID</th>
                        <th className="px-6 py-3 font-medium">Test Order ID</th>
                        <th className="px-6 py-3 font-medium">Barcode</th>
                        <th className="px-6 py-3 font-medium">Type</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {samples.map((s) => (
                        <tr key={s.id}>
                            <td className="px-6 py-3">
                                <button onClick={() => handleCopyId(s.id)}
                                        className="flex items-center gap-1.5 font-mono text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md text-slate-600 whitespace-nowrap">
                                    {copiedId === s.id ? (<><Check size={12} className="text-emerald-600" /> Copied!</>) : (<><Copy size={12} /> {s.id}</>)}
                                </button>
                            </td>
                            <td className="px-6 py-3">
                                <button onClick={() => handleCopyId(s.testOrderId)}
                                        className="flex items-center gap-1.5 font-mono text-xs bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded-md text-slate-500 whitespace-nowrap">
                                    {copiedId === s.testOrderId ? (<><Check size={12} className="text-emerald-600" /> Copied!</>) : (<><Copy size={12} /> {s.testOrderId}</>)}
                                </button>
                            </td>
                            <td className="px-6 py-3">{s.barcodeId}</td>
                            <td className="px-6 py-3 text-slate-500">{s.sampleType}</td>
                            <td className="px-6 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(s.status)}`}>{s.status}</span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {!loading && samples.length === 0 && (
                    <p className="p-6 text-center text-slate-400 text-sm">No samples found.</p>
                )}
            </div>
        </DashboardLayout>
    );
}