"use client";

import Link from "next/link";

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Confirm Emergency SOS</h1>
          <p className="mt-2 text-gray-600">
            Review your emergency details before confirmation
          </p>
        </div>

        {/* Confirmation Card */}
        <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Emergency Type
              </h2>
              <p className="mt-2 text-gray-700">Selected type will be confirmed</p>
            </div>

            <hr className="border-orange-200" />

            <div>
              <h2 className="text-xl font-semibold text-gray-900">Location</h2>
              <p className="mt-2 text-gray-700">
                123 Main Street, Colombo 07, Sri Lanka
              </p>
            </div>

            <hr className="border-orange-200" />

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Emergency Contacts
              </h2>
              <p className="mt-2 text-gray-700">
                John Johnson (Husband), Emily Johnson (Sister)
              </p>
            </div>

            <hr className="border-orange-200" />

            <div className="flex gap-4">
              <Link
                href="/emergency/sos"
                className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 text-center font-semibold text-gray-900 hover:bg-gray-50"
              >
                ← Back
              </Link>
              <Link
                href="/emergency/sos/active"
                className="flex-1 rounded-lg bg-red-500 px-6 py-3 text-center font-semibold text-white hover:bg-red-600"
              >
                Confirm SOS →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            💡 Confirmation details will be connected to backend in next phase
          </p>
        </div>
      </div>
    </div>
  );
}
