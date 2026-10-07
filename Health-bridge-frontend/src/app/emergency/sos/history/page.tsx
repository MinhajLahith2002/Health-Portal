"use client";

import Link from "next/link";

export default function SOSHistoryPage() {
  const mockHistory = [
    {
      id: 1,
      date: "Aug 10, 2026",
      time: "2:30 PM",
      type: "Chest Pain",
      status: "Resolved",
      duration: "18 mins",
    },
    {
      id: 2,
      date: "Jul 25, 2026",
      time: "5:15 PM",
      type: "Breathing Issue",
      status: "Resolved",
      duration: "12 mins",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">SOS History</h1>
          <p className="mt-2 text-gray-600">
            View your past emergency requests and their resolutions
          </p>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {mockHistory.map((record) => (
            <div
              key={record.id}
              className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
            >
              <div className="grid gap-4 sm:grid-cols-5">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Date
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {record.date}
                  </p>
                  <p className="text-sm text-gray-600">{record.time}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Type
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {record.type}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Status
                  </p>
                  <div className="mt-1 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    {record.status}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Duration
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {record.duration}
                  </p>
                </div>
                <div className="flex items-end">
                  <button className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8">
          <Link
            href="/emergency/sos"
            className="inline-block rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-900 hover:bg-gray-50"
          >
            ← Back to SOS
          </Link>
        </div>

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            💡 History data will be fetched from backend API in next phase
          </p>
        </div>
      </div>
    </div>
  );
}
