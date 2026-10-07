"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Heart,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Save,
  Activity,
  FileText
} from "lucide-react";
import HeaderLogo from "@/components/HeaderLogo";
import AuthFooter from "@/components/AuthFooter";
import { getStoredUser, saveAuthData, getToken } from "@/lib/auth";
import { patientService, PatientProfile } from "@/services/patient.service";

export default function PatientProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "Not Specified",
    bloodGroup: "Not Specified",
    address: "",
    emergencyContact: "",
    medicalHistory: "",
  });

  useEffect(() => {
    const token = getToken();
    const storedUser = getStoredUser();

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await patientService.getProfile();
        setProfile(data);
        setFormData({
          fullName: data.fullName || "",
          phoneNumber: data.phoneNumber || "",
          dateOfBirth: data.dateOfBirth || "",
          gender: data.gender || "Not Specified",
          bloodGroup: data.bloodGroup || "Not Specified",
          address: data.address || "",
          emergencyContact: data.emergencyContact || "",
          medicalHistory: data.medicalHistory || "",
        });
      } catch (err: any) {
        // Fallback to local session if network error
        if (storedUser) {
          setFormData((prev) => ({
            ...prev,
            fullName: storedUser.fullName || "",
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const updated = await patientService.updateProfile(formData);
      setProfile(updated);

      // Update local storage user
      const storedUser = getStoredUser();
      const token = getToken();
      if (storedUser && token) {
        saveAuthData(token, {
          ...storedUser,
          fullName: updated.fullName,
        });
      }

      setSuccessMessage("Patient profile saved and updated successfully!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 py-4 px-6 sm:px-12 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <HeaderLogo />
          <Link
            href="/patient/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 sm:p-10">
        {/* Top Info Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-blue-500/20 overflow-hidden">
                {profile?.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.picture}
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  formData.fullName.charAt(0) || "P"
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {profile?.fullName || formData.fullName || "Patient Profile"}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold">
                    PATIENT
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mt-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile?.email}</span>
                </div>
              </div>
            </div>

            {/* Google Linked Badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Authentication
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {profile?.provider === "GOOGLE" ? "Linked to Google" : "Standard Account"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2.5 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium flex items-center gap-2.5 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-8">
          {/* Section: Personal Information */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-6">
              <UserIcon className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-sm text-slate-800 transition"
                />
              </div>

              {/* Email (Read only, linked to Gmail) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Gmail / Email (Locked)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ""}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100/70 text-slate-500 text-sm cursor-not-allowed"
                  />
                  <ShieldCheck className="w-4 h-4 text-emerald-500 absolute right-3 top-3.5" />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+94 7X XXX XXXX"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-sm text-slate-800 transition"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-sm text-slate-800 transition"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-sm text-slate-800 transition bg-white"
                >
                  <option value="Not Specified">Not Specified</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-sm text-slate-800 transition bg-white"
                >
                  <option value="Not Specified">Not Specified</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Medical & Emergency Contact */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-6">
              <Activity className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-slate-900">Emergency & Health Info</h2>
            </div>

            <div className="space-y-6">
              {/* Residential Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Residential Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter home address"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-sm text-slate-800 transition"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Emergency Contact (Name & Phone)
                </label>
                <div className="relative">
                  <Heart className="w-4 h-4 text-red-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    placeholder="e.g. Jane Doe (+94 77 123 4567)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-sm text-slate-800 transition"
                  />
                </div>
              </div>

              {/* Allergies / Medical History */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Known Allergies & Medical History
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    placeholder="List any drug allergies, ongoing medical conditions, or notes..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-sm text-slate-800 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <AuthFooter />
    </div>
  );
}
