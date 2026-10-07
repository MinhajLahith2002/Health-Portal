"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  Calendar,
  Camera,
  Droplet,
  HeartPulse,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Settings,
  User as UserIcon,
} from "lucide-react";
import api from "@/lib/axios";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  picture: string;
  accountStatus: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  bloodGroup?: string | null;
  emergencyContact?: string | null;
  branch?: string | null;
  role?: string;
  createdAt?: string | null;
}

const formatRole = (role?: string) => {
  if (!role) return "";
  return role
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatMemberSince = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
};

// One row inside an info card
function InfoRow({
  icon: Icon,
  label,
  value,
  emptyText = "Not set",
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  emptyText?: string;
}) {
  return (
    <div className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
      <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-500">{label}</p>
        {value ? (
          <p className="text-slate-900 font-medium break-words">{value}</p>
        ) : (
          <p className="text-slate-400">
            {emptyText}{" "}
            <Link
              href="/profile/edit"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Add
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="h-32 bg-slate-200" />
        <div className="px-8 pb-8">
          <div className="-mt-14 w-28 h-28 rounded-full bg-slate-300 ring-4 ring-white" />
          <div className="mt-4 h-6 w-48 bg-slate-200 rounded" />
          <div className="mt-3 h-4 w-32 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="h-64 bg-white rounded-2xl border border-slate-200" />
        <div className="h-64 bg-white rounded-2xl border border-slate-200" />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<any>("/users/profile")
      .then((data) => setUser(data))
      .catch((err) => {
        console.error(err);
        setError("Could not load your profile. Please log in again.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Profile completeness: which useful details are still missing?
  const missing: string[] = [];
  let completeness = 100;
  if (user) {
    const checks: [boolean, string][] = [
      [!!user.picture, "profile photo"],
      [!!user.phoneNumber, "phone number"],
      [!!user.emergencyContact, "emergency contact"],
      [!!user.dateOfBirth, "date of birth"],
      [!!user.gender, "gender"],
      [!!user.address, "address"],
    ];
    if (user.role === "PATIENT") checks.push([!!user.bloodGroup, "blood group"]);

    checks.forEach(([done, label]) => {
      if (!done) missing.push(label);
    });
    completeness = Math.round(((checks.length - missing.length) / checks.length) * 100);
  }

  const initials = (user?.fullName || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const isActive = (user?.accountStatus || "Active") === "Active";
  const memberSince = formatMemberSince(user?.createdAt);

  return (
    <DashboardLayout pageTitle="My Profile">
      {loading ? (
        <ProfileSkeleton />
      ) : error || !user ? (
        <div className="max-w-md mx-auto text-center py-20">
          <p className="text-red-500 mb-4">{error || "Profile not found."}</p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition"
          >
            Go to login
          </Link>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ---- Header card ---- */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Banner */}
            <div className="relative h-32 bg-gradient-to-r from-blue-500 via-blue-500 to-sky-400 overflow-hidden">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="absolute -right-6 -top-10 h-56 w-56 fill-current text-white/20"
              >
                <path d="M10 2h4v8h8v4h-8v8h-4v-8H2v-4h8z" />
              </svg>
            </div>

            <div className="px-6 sm:px-8 pb-6">
              <div className="-mt-14 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                {/* Avatar */}
                <div className="relative shrink-0 w-28 h-28">
                  <div className="w-28 h-28 rounded-full bg-blue-50 text-blue-700 ring-4 ring-white shadow-md flex items-center justify-center text-3xl font-semibold overflow-hidden">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={`${user.fullName} profile photo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials || "?"
                    )}
                  </div>
                  <Link
                    href="/profile/edit"
                    aria-label="Change profile photo"
                    title="Change photo"
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-white flex items-center justify-center transition"
                  >
                    <Camera className="w-4 h-4" />
                  </Link>
                </div>

                {/* Name + chips */}
                <div className="min-w-0 flex-1 sm:pt-16">
                  <h1 className="text-2xl font-bold text-slate-900 truncate">
                    {user.fullName}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {user.role && (
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                        <BadgeCheck className="w-4 h-4" />
                        {formatRole(user.role)}
                      </span>
                    )}
                    {user.branch && (
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                        <Building2 className="w-4 h-4" />
                        {user.branch}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${
                        isActive
                          ? "text-emerald-700 bg-emerald-50"
                          : "text-red-700 bg-red-50"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isActive ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      />
                      {user.accountStatus || "Active"}
                    </span>
                  </div>
                  {memberSince && (
                    <p className="mt-2 text-sm text-slate-500">
                      Member since {memberSince}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 sm:pt-16">
                  <Link
                    href="/profile/edit"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg transition"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit profile
                  </Link>
                  <Link
                    href="/profile/settings"
                    className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-4 py-2.5 rounded-lg transition"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </div>
              </div>

              {/* Completeness */}
              {completeness < 100 && (
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700">
                      Profile {completeness}% complete
                    </span>
                    <Link
                      href="/profile/edit"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Add your {missing[0]}
                    </Link>
                  </div>
                  <div
                    className="h-2 rounded-full bg-slate-100 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={completeness}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Profile completeness"
                  >
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ---- Details ---- */}
          <div className="grid md:grid-cols-2 gap-6">
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">
                Contact details
              </h2>
              <div className="divide-y divide-slate-100">
                <InfoRow icon={Mail} label="Email" value={user.email} />
                <InfoRow icon={Phone} label="Phone" value={user.phoneNumber} />
                <InfoRow
                  icon={HeartPulse}
                  label="Emergency contact"
                  value={user.emergencyContact}
                />
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">
                Personal details
              </h2>
              <div className="divide-y divide-slate-100">
                <InfoRow
                  icon={Calendar}
                  label="Date of birth"
                  value={formatDate(user.dateOfBirth)}
                />
                <InfoRow icon={UserIcon} label="Gender" value={user.gender} />
                {user.role === "PATIENT" && (
                  <InfoRow
                    icon={Droplet}
                    label="Blood group"
                    value={user.bloodGroup}
                  />
                )}
                <InfoRow icon={MapPin} label="Address" value={user.address} />
              </div>
            </section>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
