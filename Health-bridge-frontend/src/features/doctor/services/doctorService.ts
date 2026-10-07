import api from "@/lib/axios";
import { getStoredUser } from "@/lib/auth";
import type { Availability, AvailabilityInput, Doctor, DoctorLeave, DoctorProfileUpdate, Earnings, LeaveInput } from "../types";

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const getDoctorId = () => {
  const user = getStoredUser();
  if (!user) return "doc-user";
  return user.id;
};

// Fallback initial doctor profile generated strictly from current logged-in session user details
function getDefaultProfile(): Doctor {
  const user = typeof window !== "undefined" ? getStoredUser() : null;
  const userObj = user as any;
  const name = userObj?.fullName || userObj?.name || "Doctor";
  const email = user?.email || "doctor@healthbridge.lk";
  const formattedName = name.toLowerCase().startsWith("dr.") ? name : `Dr. ${name}`;

  return {
    id: user?.id || "doc-user",
    fullName: formattedName,
    email: email,
    phoneNumber: "+94 77 000 0000",
    profileImage: "https://i.pravatar.cc/320?img=47",
    gender: "Other",
    dateOfBirth: "1990-01-01",
    address: "Colombo, Sri Lanka",
    specialization: "General Medicine",
    qualifications: ["MBBS"],
    experience: 5,
    consultationFee: 5000,
    rating: 5.0,
    availableToday: true,
    bio: "Consultant Medical Officer.",
  };
}

let profile: Doctor = getDefaultProfile();

export async function getDoctorProfile(): Promise<Doctor> {
  if (typeof window !== "undefined") {
    const user = getStoredUser();
    const email = user?.email?.toLowerCase().trim() || "doctor@healthbridge.lk";

    // 1. Check email specific doctor profile persistence
    const savedDocProfile = localStorage.getItem(`healthbridge_doctor_profile_${email}`) || localStorage.getItem("healthbridge_doctor_profile");
    if (savedDocProfile) {
      try {
        const parsed = JSON.parse(savedDocProfile);
        profile = { ...getDefaultProfile(), ...parsed };
      } catch {
        profile = getDefaultProfile();
      }
    } else {
      profile = getDefaultProfile();
    }

    // 2. Check email specific user name override
    const savedUserOverride = localStorage.getItem(`healthbridge_user_override_${email}`);
    if (savedUserOverride) {
      try {
        const parsedUser = JSON.parse(savedUserOverride);
        if (parsedUser.fullName) {
          profile.fullName = parsedUser.fullName;
        }
      } catch {
        // ignore
      }
    }
  }

  try {
    const res = await api.get<Doctor>("/doctors/me");
    if (res) return res;
  } catch {
    // API endpoint optional or unavailable, return active user profile
  }

  return { ...profile };
}

export async function updateDoctorProfile(data: DoctorProfileUpdate): Promise<Doctor> {
  try {
    const res = await api.put<Doctor>("/doctors/me", data);
    if (res) profile = { ...profile, ...res };
  } catch {
    profile = { ...profile, ...data };
  }

  if (typeof window !== "undefined") {
    const user = getStoredUser();
    const email = (data.email || user?.email || "doctor@healthbridge.lk").toLowerCase().trim();

    // Persist doctor profile by user email across sessions/logins
    localStorage.setItem(`healthbridge_doctor_profile_${email}`, JSON.stringify(profile));
    localStorage.setItem("healthbridge_doctor_profile", JSON.stringify(profile));

    // Persist user override by email
    localStorage.setItem(`healthbridge_user_override_${email}`, JSON.stringify({ fullName: profile.fullName, email: profile.email }));

    // Update active user state in localStorage
    const stored = localStorage.getItem("healthbridge_user");
    let userObj: any = {};
    if (stored) {
      try {
        userObj = JSON.parse(stored);
      } catch {
        userObj = {};
      }
    }
    userObj.fullName = profile.fullName;
    userObj.name = profile.fullName;
    userObj.email = profile.email;
    localStorage.setItem("healthbridge_user", JSON.stringify(userObj));

    window.dispatchEvent(new Event("user-profile-updated"));
    window.dispatchEvent(new Event("storage"));
  }

  return { ...profile };
}

export async function getDoctors(): Promise<Doctor[]> {
  try {
    const res = await api.get<Doctor[]>("/doctors");
    if (res && res.length > 0) return res;
  } catch {
    // ignore
  }
  return [getDoctorProfile() as unknown as Doctor];
}

export async function getAvailability(): Promise<Availability[]> {
  try {
    const res = await api.get<Availability[]>(`/doctors/me/availability?doctorId=${encodeURIComponent(getDoctorId())}`);
    if (res) return res;
  } catch {
    // ignore
  }

  if (typeof window !== "undefined") {
    const user = getStoredUser();
    const email = user?.email?.toLowerCase().trim() || "default";
    const stored = localStorage.getItem(`healthbridge_doctor_availability_${email}`);
    if (stored) {
      try { return JSON.parse(stored); } catch { return []; }
    }
  }

  return [];
}

export async function updateAvailability(slots: AvailabilityInput[]): Promise<Availability[]> {
  const newSlots: Availability[] = slots.map((slot, index) => ({
    ...slot,
    id: `slot-${Date.now()}-${index}`,
  }));

  try {
    await api.put<Availability[]>(`/doctors/me/availability?doctorId=${encodeURIComponent(getDoctorId())}`, slots);
  } catch {
    // fallback local storage update
  }

  if (typeof window !== "undefined") {
    const user = getStoredUser();
    const email = user?.email?.toLowerCase().trim() || "default";
    localStorage.setItem(`healthbridge_doctor_availability_${email}`, JSON.stringify(newSlots));
  }

  return newSlots;
}

const getLeavesKey = () => {
  const user = getStoredUser();
  const email = user?.email?.toLowerCase().trim() || "default";
  return `healthbridge_doctor_leaves_${email}`;
};

export async function createLeave(data: LeaveInput): Promise<DoctorLeave> {
  await delay();
  const leave: DoctorLeave = { 
    ...data, 
    id: `leave-${Date.now()}`, 
    status: "Pending", 
    appliedAt: new Date().toISOString().slice(0, 10) 
  };
  
  if (typeof window !== "undefined") {
    const key = getLeavesKey();
    const stored = localStorage.getItem(key);
    let list: DoctorLeave[] = [];
    if (stored) {
      try { list = JSON.parse(stored); } catch { list = []; }
    }
    list = [leave, ...list];
    localStorage.setItem(key, JSON.stringify(list));
  }
  
  return leave;
}

export async function getLeaves(): Promise<DoctorLeave[]> {
  await delay();
  if (typeof window !== "undefined") {
    const key = getLeavesKey();
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  }
  return [];
}

export async function getEarnings(): Promise<Earnings> {
  try {
    const res = await api.get<Earnings>("/doctors/me/earnings");
    if (res) return res;
  } catch {
    // calculate or return default zero earnings state when live api isn't connected
  }

  return {
    totalEarnings: 0,
    monthlyEarnings: 0,
    consultationIncome: 0,
    pendingAmount: 0,
    revenue: [],
    payments: [],
  };
}

export const doctorService = {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctors,
  getAvailability,
  updateAvailability,
  createLeave,
  getLeaves,
  getEarnings,
};
