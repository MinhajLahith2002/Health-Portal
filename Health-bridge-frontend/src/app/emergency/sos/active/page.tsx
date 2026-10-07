"use client";

import Link from "next/link";

export default function ActiveSOSPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-600">Emergency SOS Active</h1>
          <p className="mt-2 text-gray-600">
            Your emergency request is being processed
          </p>
        </div>

        {/* Status Card */}
        <div className="rounded-lg border-2 border-red-500 bg-red-50 p-8">
          {/* Active Indicator */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500">
              <span className="text-2xl">🚑</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-600">SOS Active</h2>
              <p className="text-gray-600">Ambulance dispatched</p>
            </div>
          </div>

          <hr className="border-red-200" />

          {/* Status Updates */}
          <div className="my-6">
            <h3 className="mb-4 font-semibold text-gray-900">Status Updates</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700">Emergency contacts notified</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700">Location shared with responders</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-yellow-600">⏳</span>
                <span className="text-gray-700">
                  Ambulance en route - ETA: 8-12 mins
                </span>
              </div>
            </div>
          </div>

          <hr className="border-red-200" />

          {/* Emergency Number */}
          <div className="my-6">
            <h3 className="mb-2 font-semibold text-gray-900">Quick Number</h3>
            <p className="font-mono text-lg font-bold text-red-600">
              119 - Ambulance
            </p>
          </div>

          <hr className="border-red-200" />

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <Link
              href="/emergency/sos"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 text-center font-semibold text-gray-900 hover:bg-gray-50"
            >
              ← Back to SOS
            </Link>
            <Link
              href="/emergency/sos/history"
              className="flex-1 rounded-lg bg-gray-900 px-6 py-3 text-center font-semibold text-white hover:bg-gray-800"
            >
              View History →
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            💡 Real-time updates will be available via WebSocket in next phase
          </p>
        </div>
      </div>
    </div>
  );
}
