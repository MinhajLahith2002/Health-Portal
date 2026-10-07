"use client";

import { useCallback } from "react";
import LeaveForm from "@/features/doctor/components/LeaveForm";
import LoadingState from "@/features/doctor/components/LoadingState";
import PageHeader from "@/features/doctor/components/PageHeader";
import StatusBadge from "@/features/doctor/components/StatusBadge";
import { useDoctorData } from "@/features/doctor/hooks/useDoctorData";
import { createLeave, getLeaves } from "@/features/doctor/services/doctorService";
import type { LeaveInput } from "@/features/doctor/types";

export default function DoctorLeavePage() {
  const loader = useCallback(() => getLeaves(), []);
  const { data, setData, loading, error } = useDoctorData(loader);

  async function apply(input: LeaveInput) {
    const item = await createLeave(input);
    setData((current) => (current ? [item, ...current] : [item]));
  }

  return (
    <>
      <PageHeader 
        eyebrow="Time away" 
        title="Leave management" 
        description="Submit time-off requests and follow their approval status." 
      />
      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <LeaveForm onSubmit={apply} />
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold">Leave history</h2>
            <p className="mt-1 text-xs text-slate-500">All submitted requests and current status</p>
          </div>
          {loading ? (
            <LoadingState />
          ) : error ? (
            <p className="p-5 text-sm text-rose-600">{error}</p>
          ) : !data || data.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No leave requests submitted yet. Use the form on the left to submit a new request.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Type</th>
                    <th className="px-5 py-3 font-semibold">Dates</th>
                    <th className="px-5 py-3 font-semibold">Reason</th>
                    <th className="px-5 py-3 font-semibold">Applied</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((leave) => (
                    <tr key={leave.id}>
                      <td className="px-5 py-4 font-semibold">{leave.leaveType}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {leave.startDate}
                        <br />
                        <span className="text-xs">to {leave.endDate}</span>
                      </td>
                      <td className="max-w-xs px-5 py-4 text-slate-600">{leave.reason}</td>
                      <td className="px-5 py-4 text-slate-500">{leave.appliedAt}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={leave.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
