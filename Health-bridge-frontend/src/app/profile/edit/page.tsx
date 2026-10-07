"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  validateFullName,
  validatePhoneNumber,
  validateDateOfBirth,
  validateGender,
  validateBloodGroup,
  validateAddress,
  ADDRESS_MAX_LENGTH,
} from "@/utils/validators";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB, matches backend limit
const EMERGENCY_CONTACT_MAX_LENGTH = 100;

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

type FormData = {
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  address: string;
  emergencyContact: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    address: "",
    emergencyContact: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [picture, setPicture] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [error, setError] = useState("");
  const [pictureError, setPictureError] = useState("");

  useEffect(() => {
    api
      .get<any>("/users/profile")
      .then((data) => {
        setFormData({
          fullName: data.fullName || "",
          phoneNumber: data.phoneNumber || "",
          dateOfBirth: data.dateOfBirth || "",
          gender: data.gender || "",
          bloodGroup: data.bloodGroup || "",
          address: data.address || "",
          emergencyContact: data.emergencyContact || "",
        });
        setPicture(data.picture || "");
        setRole(data.role || "");
      })
      .catch(() => setError("Could not load profile."))
      .finally(() => setLoading(false));
  }, []);

  const validateField = (name: keyof FormData, value: string): string => {
    switch (name) {
      case "fullName":
        return validateFullName(value);
      case "phoneNumber":
        return validatePhoneNumber(value);
      case "dateOfBirth":
        return validateDateOfBirth(value);
      case "gender":
        return validateGender(value);
      case "bloodGroup":
        return validateBloodGroup(value, role === "PATIENT");
      case "address":
        return validateAddress(value);
      case "emergencyContact":
        return value.length > EMERGENCY_CONTACT_MAX_LENGTH
          ? `Must be under ${EMERGENCY_CONTACT_MAX_LENGTH} characters`
          : "";
      default:
        return "";
    }
  };

  const validateAll = (data: FormData): FormErrors => {
    const nextErrors: FormErrors = {
      fullName: validateField("fullName", data.fullName),
      phoneNumber: validateField("phoneNumber", data.phoneNumber),
      dateOfBirth: validateField("dateOfBirth", data.dateOfBirth),
      gender: validateField("gender", data.gender),
      address: validateField("address", data.address),
      emergencyContact: validateField("emergencyContact", data.emergencyContact),
    };
    if (role === "PATIENT") {
      nextErrors.bloodGroup = validateField("bloodGroup", data.bloodGroup);
    }
    Object.keys(nextErrors).forEach((key) => {
      if (!nextErrors[key as keyof FormData]) delete nextErrors[key as keyof FormData];
    });
    return nextErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FormData;
    setFormData((prev) => ({ ...prev, [fieldName]: value }));

    if (touched[fieldName]) {
      const msg = validateField(fieldName, value);
      setErrors((prev) => ({ ...prev, [fieldName]: msg || undefined }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FormData;
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const msg = validateField(fieldName, value);
    setErrors((prev) => ({ ...prev, [fieldName]: msg || undefined }));
  };

  const handlePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPictureError("");

    if (!file.type.startsWith("image/")) {
      setPictureError("Please choose an image file.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setPictureError("Image must be smaller than 5MB.");
      e.target.value = "";
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setPicture(localPreviewUrl);
    setUploadingPicture(true);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const data = await api.post<any>("/users/profile/picture", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPicture(data.picture || "");
    } catch (err) {
      console.error(err);
      setPictureError("Could not upload picture. Please try again.");
      setPicture((prev) => (prev === localPreviewUrl ? "" : prev));
    } finally {
      URL.revokeObjectURL(localPreviewUrl);
      setUploadingPicture(false);
      e.target.value = "";
    }
  };

  const handleRemovePicture = async () => {
    setPictureError("");
    setUploadingPicture(true);
    try {
      const data = await api.delete<any>("/users/profile/picture");
      setPicture(data.picture || "");
    } catch (err) {
      console.error(err);
      setPictureError("Could not remove picture. Please try again.");
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const nextErrors = validateAll(formData);
    setErrors(nextErrors);
    setTouched({
      fullName: true,
      phoneNumber: true,
      dateOfBirth: true,
      gender: true,
      bloodGroup: true,
      address: true,
      emergencyContact: true,
    });

    if (Object.keys(nextErrors).length > 0) {
      setError("Please fix the highlighted fields before saving.");
      return;
    }

    setSaving(true);
    try {
      await api.put("/users/profile", {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address.trim(),
        emergencyContact: formData.emergencyContact.trim(),
        ...(role === "PATIENT" ? { bloodGroup: formData.bloodGroup } : {}),
      });
      router.push("/profile");
    } catch (err) {
      console.error(err);
      setError("Could not update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const initials = formData.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const inputClass = (fieldName: keyof FormData) =>
    `w-full border rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 ${
      errors[fieldName]
        ? "border-red-400 focus:ring-red-400"
        : "border-gray-300 focus:ring-blue-500"
    }`;

  return (
    <DashboardLayout pageTitle="Edit Profile">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-8">
            Edit Profile
          </h1>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <button
                type="button"
                onClick={handlePictureClick}
                disabled={uploadingPicture}
                className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition disabled:opacity-60"
                aria-label="Change profile picture"
              >
                {picture ? (
                  <img
                    src={picture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-semibold text-gray-500">
                    {initials || "?"}
                  </span>
                )}

                {uploadingPicture && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                    <span className="text-white text-xs">Uploading...</span>
                  </div>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                className="hidden"
              />
            </div>

            <div className="mt-3 flex items-center gap-4">
              <button
                type="button"
                onClick={handlePictureClick}
                disabled={uploadingPicture}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-60"
              >
                Change Photo
              </button>

              {picture && (
                <button
                  type="button"
                  onClick={handleRemovePicture}
                  disabled={uploadingPicture}
                  className="text-sm text-red-500 hover:text-red-600 font-medium disabled:opacity-60"
                >
                  Remove Photo
                </button>
              )}
            </div>

            {pictureError && (
              <p className="text-red-500 text-xs mt-2">{pictureError}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClass("fullName")}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Phone
              </label>
              <input
                type="text"
                name="phoneNumber"
                placeholder="07XXXXXXXX"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClass("phoneNumber")}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  max={new Date().toISOString().split("T")[0]}
                  className={inputClass("dateOfBirth")}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputClass("gender")} bg-white`}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                )}
              </div>
            </div>

            {role === "PATIENT" && (
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputClass("bloodGroup")} bg-white`}
                >
                  <option value="">Select blood group</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
                {errors.bloodGroup && (
                  <p className="text-red-500 text-xs mt-1">{errors.bloodGroup}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Emergency Contact
              </label>
              <input
                type="text"
                name="emergencyContact"
                placeholder="Name and phone number"
                value={formData.emergencyContact}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={EMERGENCY_CONTACT_MAX_LENGTH}
                className={inputClass("emergencyContact")}
              />
              {errors.emergencyContact && (
                <p className="text-red-500 text-xs mt-1">{errors.emergencyContact}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={3}
                maxLength={ADDRESS_MAX_LENGTH}
                placeholder="Street, city, postal code"
                className={`${inputClass("address")} resize-none`}
              />
              <div className="flex justify-between mt-1">
                {errors.address ? (
                  <p className="text-red-500 text-xs">{errors.address}</p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-gray-400">
                  {formData.address.length}/{ADDRESS_MAX_LENGTH}
                </span>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <a href="/profile" className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-lg transition">
                Cancel
              </a>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}