"use client";

import { useEffect, useState } from "react";
import { PatientTable } from "@/components/patient/PatientTable";
import { labReportService } from "@/services/labReportService";
import { getStoredUser } from "@/lib/auth";

export default function PatientLabReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchReports = () => {
      labReportService.getPatientLabHistory(user.id)
        .then(setReports)
        .catch(err => console.error("Failed to load lab reports", err))
        .finally(() => setLoading(false));
    };

    // Fetch immediately on mount
    fetchReports();

    // Set up live updating (polling every 5 seconds)
    const intervalId = setInterval(fetchReports, 5000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <main className="p-8 max-w-7xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-zinc-950 mb-8">My Lab Reports</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64 text-zinc-500">
          <p>Loading reports...</p>
        </div>
      ) : (
        <PatientTable 
          columns={[
            { 
              key: 'date', 
              label: 'Date', 
              render: (row) => new Date(row.publishedAt || row.resultedAt || row.createdAt).toLocaleDateString() 
            },
            { 
              key: 'testName', 
              label: 'Test Results', 
              render: (row) => (
                <div className="flex flex-col gap-2 my-2 w-full pr-4">
                  {row.parameters && row.parameters.length > 0 ? (
                    row.parameters.map((p: any, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-md p-2 hover:bg-slate-100 transition-colors">
                        <span className="text-sm font-medium text-zinc-700">
                          {p.parameterName}
                        </span>
                        <div className="flex items-center gap-3 text-right">
                          <span className={`text-sm font-bold ${p.outOfRange ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded' : 'text-zinc-900'}`}>
                            {p.value || 'Pending'} {p.unit || ''}
                          </span>
                          {p.referenceRange && (
                            <span className="text-xs text-zinc-400 min-w-[80px]">
                              ({p.referenceRange})
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-zinc-500">Order #{row.testOrderId}</span>
                  )}
                </div>
              )
            },
            { 
              key: 'status', 
              label: 'Medical Status',
              render: (row) => {
                const isCritical = row.critical || row.isCritical;
                const isAbnormal = row.abnormal || row.isAbnormal;
                
                if (isCritical) {
                  return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100 uppercase tracking-wider">Critical</span>;
                }
                if (isAbnormal) {
                  return <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100 uppercase tracking-wider">Review needed</span>;
                }
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-600 border border-teal-100 uppercase tracking-wider">Normal</span>;
              }
            }
          ]}
          data={reports.sort((a, b) => new Date(b.publishedAt || b.resultedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.resultedAt || a.createdAt).getTime())}
          emptyMessage="No lab reports available."
        />
      )}
    </main>
  );
}
