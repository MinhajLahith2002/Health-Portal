"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/app/dashboard/layout";
import { getStoredUser, AuthUser } from "@/lib/auth";
import { paymentService, PaymentRequestData } from "@/services/paymentService";
import { prescriptionBillingService, DispensedPrescriptionBill } from "@/services/prescriptionBillingService";
import { prescriptionService } from "@/services/prescriptionService";
import { getAllMedicines } from "@/services/pharmacyService";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  FileText,
  Stethoscope,
  FlaskConical,
  Pill,
  Shield,
  Receipt,
  Sparkles,
  Lock,
  ChevronDown,
  Check,
  TestTube2,
  Scan,
  X,
} from "lucide-react";

type PaymentStep = "DETAILS" | "CARD" | "VERIFICATION" | "SUCCESS";

interface CategoryOption {
  id: string;
  name: string;
  icon: React.ElementType;
  defaultAmount: number;
}

export interface LabTestOption {
  id: string;
  code: string;
  name: string;
  shortName: string;
  panel: string;
  price: number;
  turnaround: string;
  fastingRequired: boolean;
  description: string;
}

export const LAB_TEST_OPTIONS: LabTestOption[] = [
  {
    id: "CBC",
    code: "LB-101",
    name: "Complete Blood Count (CBC / FBC)",
    shortName: "CBC / FBC",
    panel: "Hematology",
    price: 1500,
    turnaround: "2 - 4 Hours",
    fastingRequired: false,
    description: "Evaluates red & white blood cells, hemoglobin, and platelets to screen for anemia and infection.",
  },
  {
    id: "LIPID_GLUCOSE",
    code: "LB-204",
    name: "Fasting Blood Sugar & Lipid Profile",
    shortName: "Lipid Profile & Glucose",
    panel: "Biochemistry",
    price: 2800,
    turnaround: "4 - 6 Hours",
    fastingRequired: true,
    description: "Evaluates glucose, cholesterol, HDL, LDL, and triglycerides for cardiovascular & diabetic health.",
  },
  {
    id: "THYROID_PANEL",
    code: "LB-315",
    name: "Comprehensive Thyroid Panel (TSH, FT3, FT4)",
    shortName: "Thyroid Panel (TSH/FT3/FT4)",
    panel: "Endocrinology",
    price: 4200,
    turnaround: "Same Day",
    fastingRequired: false,
    description: "Complete hormone assay to diagnose thyroid gland health and metabolic regulation.",
  },
  {
    id: "LFT_KFT",
    code: "LB-422",
    name: "Liver (LFT) & Kidney (KFT) Function Screening",
    shortName: "Liver & Kidney (LFT/KFT)",
    panel: "Organ Function",
    price: 5600,
    turnaround: "6 - 8 Hours",
    fastingRequired: true,
    description: "Screening of liver enzymes (ALT, AST, bilirubin) and renal markers (creatinine, BUN, electrolytes).",
  },
  {
    id: "EXECUTIVE_HEALTH",
    code: "LB-580",
    name: "Full Body Executive Diagnostic & Wellness Screen",
    shortName: "Full Body Executive Diagnostic",
    panel: "Advanced Diagnostic",
    price: 7800,
    turnaround: "24 Hours",
    fastingRequired: true,
    description: "All-inclusive clinical diagnostic battery: CBC, LFT, KFT, lipid panel, HbA1c, and urine analysis.",
  },
];

const CATEGORIES: CategoryOption[] = [
  { id: "CONSULTATION", name: "Doctor Consultation", icon: Stethoscope, defaultAmount: 3000 },
  { id: "LAB_TEST", name: "Laboratory Test", icon: FlaskConical, defaultAmount: 1500 },
  { id: "PRESCRIPTION", name: "Medical Prescription Bills", icon: Pill, defaultAmount: 0 },
  { id: "X_RAY", name: "X-Ray", icon: Scan, defaultAmount: 3500 },
  { id: "OTHER", name: "Medical Service", icon: FileText, defaultAmount: 5000 },
  { id: "CHECKUP", name: "Medical Checkup", icon: ShieldCheck, defaultAmount: 5000 },
];

export default function PaymentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [step, setStep] = useState<PaymentStep>("DETAILS");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State - amount and description are fixed according to selected category
  const [category, setCategory] = useState<string>("CONSULTATION");
  const [amount, setAmount] = useState<string>("3000.00");
  const [description, setDescription] = useState<string>("Doctor Consultation");
  const [cardHolderName, setCardHolderName] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [cvv, setCvv] = useState<string>("");

  // Lab Test State (Multi-selection: choose one or more lab tests)
  const [selectedLabTestIds, setSelectedLabTestIds] = useState<string[]>(["CBC"]);

  const selectedLabTests = LAB_TEST_OPTIONS.filter((t) => selectedLabTestIds.includes(t.id));
  const totalLabAmount = selectedLabTests.reduce((sum, t) => sum + t.price, 0);
  const hasFastingRequired = selectedLabTests.some((t) => t.fastingRequired);

  // Medical Prescription Bills State
  const [prescriptionBills, setPrescriptionBills] = useState<DispensedPrescriptionBill[]>([]);
  const [selectedPrescriptionBillId, setSelectedPrescriptionBillId] = useState<string | null>(null);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState<boolean>(false);

  // Load prescription bills for the logged in patient
  const loadPrescriptionBills = async (currentUser?: AuthUser | null) => {
    const targetUser = currentUser || user || getStoredUser();
    setLoadingPrescriptions(true);
    try {
      // 1. Get bills recorded upon "Verify and dispense" from local store
      const localBills = prescriptionBillingService.getDispensedBillsForPatient(
        targetUser?.id,
        targetUser?.fullName
      );

      let mergedBills = [...localBills];

      // 2. Query backend prescriptions if patient ID exists
      if (targetUser?.id) {
        try {
          const backendPrescriptions = await prescriptionService.getPatientPrescriptions(targetUser.id);
          const dispensed = (backendPrescriptions || []).filter(
            (p) => p.status?.toUpperCase() === "COMPLETED" || p.status?.toLowerCase() === "dispensed"
          );

          if (dispensed.length > 0) {
            const medRes = await getAllMedicines().catch(() => []);
            const medList = Array.isArray(medRes) ? medRes : ((medRes as any)?.data || []);

            dispensed.forEach((p) => {
              if (!mergedBills.some((b) => b.id === p.id)) {
                const built = prescriptionBillingService.buildBill(p, medList);
                prescriptionBillingService.saveDispensedBill(built);
                mergedBills.push(built);
              }
            });
          }
        } catch (backendErr) {
          console.warn("Backend prescription fetch warn:", backendErr);
        }
      }

      setPrescriptionBills(mergedBills);

      // If in PRESCRIPTION category, set active bill
      if (category === "PRESCRIPTION") {
        const unpaid = mergedBills.filter((b) => b.status !== "PAID");
        const activeBill = unpaid.length > 0 ? unpaid[0] : mergedBills[0];
        if (activeBill) {
          setSelectedPrescriptionBillId(activeBill.id);
          setAmount(activeBill.totalAmount.toFixed(2));
          setDescription(`Medical Prescription Bill: ${activeBill.prescriptionNumber} (${activeBill.patientName})`);
        } else {
          setSelectedPrescriptionBillId(null);
          setAmount("0.00");
          setDescription("Medical Prescription Bills");
        }
      }
    } catch (err) {
      console.error("Failed to load prescription bills:", err);
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  // OTP State
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const [maskedCard, setMaskedCard] = useState<string>("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [confirmedPayment, setConfirmedPayment] = useState<{
    id: string;
    amount: number;
    confirmedAt: string;
    description: string;
    maskedCard: string;
  } | null>(null);

  // Timer countdown for OTP (10 mins)
  const [timeLeft, setTimeLeft] = useState<number>(600);

  useEffect(() => {
    const currentUser = getStoredUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);
    setCardHolderName(currentUser.fullName || "");
    void loadPrescriptionBills(currentUser);

    const handleDispenseEvent = () => {
      void loadPrescriptionBills(currentUser);
    };
    window.addEventListener("healthbridge_prescription_dispensed", handleDispenseEvent);
    return () => {
      window.removeEventListener("healthbridge_prescription_dispensed", handleDispenseEvent);
    };
  }, [router]);

  // Helper to sync lab tests with amount & description
  const updateLabTestSelection = (newIds: string[]) => {
    setSelectedLabTestIds(newIds);
    const tests = LAB_TEST_OPTIONS.filter((t) => newIds.includes(t.id));
    const sum = tests.reduce((acc, t) => acc + t.price, 0);
    setAmount(sum.toFixed(2));
    if (tests.length === 1) {
      setDescription(`Laboratory Test - ${tests[0].name}`);
    } else if (tests.length > 1) {
      setDescription(`Laboratory Tests (${tests.length}): ${tests.map((t) => t.shortName).join(", ")}`);
    } else {
      setDescription("Laboratory Test");
    }
  };

  // Toggle selection of a single lab test (multi-select)
  const handleToggleLabTest = (testId: string) => {
    if (selectedLabTestIds.includes(testId)) {
      if (selectedLabTestIds.length === 1) {
        setErrorMsg("Please keep at least one laboratory test selected.");
        return;
      }
      setErrorMsg(null);
      const updated = selectedLabTestIds.filter((id) => id !== testId);
      updateLabTestSelection(updated);
    } else {
      setErrorMsg(null);
      const updated = [...selectedLabTestIds, testId];
      updateLabTestSelection(updated);
    }
  };

  const handleSelectAllLabTests = () => {
    setErrorMsg(null);
    const allIds = LAB_TEST_OPTIONS.map((t) => t.id);
    updateLabTestSelection(allIds);
  };

  const handleResetLabTests = () => {
    setErrorMsg(null);
    updateLabTestSelection([LAB_TEST_OPTIONS[0].id]);
  };

  // Countdown timer effect
  useEffect(() => {
    if (step !== "VERIFICATION") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Card formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = rawVal.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawVal = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (rawVal.length >= 3) {
      rawVal = `${rawVal.slice(0, 2)}/${rawVal.slice(2)}`;
    }
    setExpiryDate(rawVal);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCvv(rawVal);
  };

  // Card Type Detector
  const getCardBrand = (number: string) => {
    const clean = number.replace(/\s/g, "");
    if (/^4/.test(clean)) return "Visa";
    if (/^5[1-5]/.test(clean)) return "Mastercard";
    if (/^3[47]/.test(clean)) return "Amex";
    return "Card";
  };

  // Step 1: Proceed to Card Information
  const handleProceedToCard = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (category === "LAB_TEST" && selectedLabTestIds.length === 0) {
      setErrorMsg("Please select at least one laboratory test to proceed.");
      return;
    }
    if (category === "PRESCRIPTION") {
      if (prescriptionBills.length === 0) {
        setErrorMsg("No prescriptions available.");
        return;
      }
      if (!selectedPrescriptionBillId) {
        setErrorMsg("Please select an individual medical prescription bill to proceed.");
        return;
      }
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg("Please enter a valid payment amount greater than $0.00");
      return;
    }
    if (!description.trim()) {
      setErrorMsg("Please provide a brief description for this payment.");
      return;
    }
    setStep("CARD");
  };

  // Step 2: Submit Card and Send OTP to Email
  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user?.id) {
      setErrorMsg("Session expired. Please log in again.");
      return;
    }

    const cleanCard = cardNumber.replace(/\s/g, "");
    if (cleanCard.length < 13 || cleanCard.length > 19) {
      setErrorMsg("Please enter a valid card number (13 to 19 digits).");
      return;
    }
    if (!expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      setErrorMsg("Please enter a valid expiration date in MM/YY format.");
      return;
    }
    if (cvv.length < 3) {
      setErrorMsg("Please enter a valid CVV (3 or 4 digits).");
      return;
    }

    setLoading(true);
    try {
      const payload: PaymentRequestData = {
        patientId: user.id,
        description: description.trim(),
        category,
        amount: parseFloat(amount),
        cardHolderName: cardHolderName.trim(),
        cardNumber: cleanCard,
        expiryDate: expiryDate.trim(),
        cvv: cvv.trim(),
      };

      const res = await paymentService.initiatePayment(payload);
      setActivePaymentId(res.paymentId);
      setMaskedCard(res.maskedCard);
      setTimeLeft(600); // 10 minutes reset
      setOtpDigits(["", "", "", "", "", ""]);
      // Capture devOtp fallback when email quota exceeded
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      } else {
        setDevOtp(null);
      }
      setStep("VERIFICATION");
      // Focus first OTP input on next tick
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 200);
    } catch (err: any) {
      console.error("Payment initiation error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to initiate payment. Please try again.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // OTP Digits Handling
  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "");
    const updated = [...otpDigits];

    if (clean.length > 1) {
      // User pasted full code
      const pastedDigits = clean.slice(0, 6).split("");
      pastedDigits.forEach((digit, i) => {
        if (i < 6) updated[i] = digit;
      });
      setOtpDigits(updated);
      const nextFocus = Math.min(pastedDigits.length, 5);
      otpInputsRef.current[nextFocus]?.focus();
      return;
    }

    updated[index] = clean;
    setOtpDigits(updated);

    if (clean && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Step 3: Confirm Payment with 6-digit Code
  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const fullCode = otpDigits.join("");
    if (fullCode.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit confirmation code.");
      return;
    }

    if (!activePaymentId) {
      setErrorMsg("Payment session missing. Please start over.");
      setStep("DETAILS");
      return;
    }

    setLoading(true);
    try {
      const res = await paymentService.confirmPayment(activePaymentId, fullCode);
      if (category === "PRESCRIPTION" && selectedPrescriptionBillId) {
        prescriptionBillingService.markAsPaid(selectedPrescriptionBillId, res.paymentId);
        void loadPrescriptionBills();
      }
      setConfirmedPayment({
        id: res.paymentId,
        amount: res.amount || parseFloat(amount),
        confirmedAt: res.confirmedAt || new Date().toISOString(),
        description,
        maskedCard,
      });
      setDevOtp(null);
      setStep("SUCCESS");
    } catch (err: any) {
      console.error("Confirmation error:", err);
      const msg = err.response?.data?.message || err.message || "Invalid or expired confirmation code.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (loading) return;
    setErrorMsg(null);
    setLoading(true);
    try {
      if (!user?.id) return;
      const cleanCard = cardNumber.replace(/\s/g, "");
      const payload: PaymentRequestData = {
        patientId: user.id,
        description: description.trim(),
        category,
        amount: parseFloat(amount),
        cardHolderName: cardHolderName.trim(),
        cardNumber: cleanCard,
        expiryDate: expiryDate.trim(),
        cvv: cvv.trim(),
      };
      const res = await paymentService.initiatePayment(payload);
      setActivePaymentId(res.paymentId);
      setTimeLeft(600);
      setOtpDigits(["", "", "", "", "", ""]);
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      } else {
        setDevOtp(null);
      }
      alert(res.devOtp
        ? "Email could not be delivered (SMTP limit reached). Please use the code displayed on screen."
        : "A fresh 6-digit confirmation code has been dispatched to your email.");
    } catch (err: any) {
      setErrorMsg("Could not resend code. Please restart payment.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("DETAILS");
    setAmount("3000.00");
    setDescription("Doctor Consultation");
    setCategory("CONSULTATION");
    setSelectedLabTestIds(["CBC"]);
    setSelectedPrescriptionBillId(null);
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
    setOtpDigits(["", "", "", "", "", ""]);
    setDevOtp(null);
    setErrorMsg(null);
    setConfirmedPayment(null);
  };

  return (
    <DashboardLayout pageTitle="Patient Billing & Payments">
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-700/10 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold uppercase tracking-wider backdrop-blur-md mb-3 text-blue-100">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secure 2FA Payment Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Patient Direct Payment
              </h1>
              <p className="mt-1 text-blue-100 text-sm max-w-xl">
                Pay for clinical consultations, laboratory diagnostic orders, and prescriptions. Verified instantly via email one-time password (OTP).
              </p>
            </div>
            <Link
              href="/payments/history"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-md transition-all hover:scale-105 shrink-0"
            >
              <Receipt className="w-4 h-4" />
              <span>Payment History</span>
            </Link>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-8 pt-6 border-t border-white/20">
            {[
              { key: "DETAILS", label: "1. Service" },
              { key: "CARD", label: "2. Payment Card" },
              { key: "VERIFICATION", label: "3. Email OTP" },
              { key: "SUCCESS", label: "4. Receipt" },
            ].map((s, idx) => {
              const order = ["DETAILS", "CARD", "VERIFICATION", "SUCCESS"];
              const currentIdx = order.indexOf(step);
              const isPast = currentIdx > idx;
              const isCurrent = currentIdx === idx;
              return (
                <div key={s.key} className="flex flex-col gap-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isPast || isCurrent ? "bg-white" : "bg-white/30"
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold truncate ${
                      isCurrent ? "text-white" : "text-blue-200"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Error Alert */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl flex items-start gap-3 shadow-sm animate-shake">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm font-medium flex-1">{errorMsg}</div>
          </div>
        )}

        {/* STEP 1: PAYMENT DETAILS */}
        {step === "DETAILS" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Select Service Category</h2>
            <p className="text-sm text-slate-500 mb-6">
              Choose the medical service you are paying for. Hospital standard fees and descriptions are set automatically.
            </p>

            <form onSubmit={handleProceedToCard} className="space-y-6">
              {/* Category Radio Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => {
                        setCategory(cat.id);
                        if (cat.id === "LAB_TEST") {
                          const activeIds =
                            selectedLabTestIds.length > 0 ? selectedLabTestIds : [LAB_TEST_OPTIONS[0].id];
                          updateLabTestSelection(activeIds);
                        } else if (cat.id === "PRESCRIPTION") {
                          setErrorMsg(null);
                          void loadPrescriptionBills();
                          const unpaid = prescriptionBills.filter((b) => b.status !== "PAID");
                          const activeBill = unpaid.length > 0 ? unpaid[0] : prescriptionBills[0];
                          if (activeBill) {
                            setSelectedPrescriptionBillId(activeBill.id);
                            setAmount(activeBill.totalAmount.toFixed(2));
                            setDescription(`Medical Prescription Bill: ${activeBill.prescriptionNumber} (${activeBill.patientName})`);
                          } else {
                            setSelectedPrescriptionBillId(null);
                            setAmount("0.00");
                            setDescription("Medical Prescription Bills");
                          }
                        } else {
                          setErrorMsg(null);
                          setAmount(cat.defaultAmount.toFixed(2));
                          setDescription(cat.name);
                        }
                      }}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-slate-900 truncate">{cat.name}</div>
                        <div className="text-xs text-slate-500 font-medium">
                          {cat.id === "LAB_TEST"
                            ? isSelected
                              ? `${selectedLabTestIds.length} Test${
                                  selectedLabTestIds.length > 1 ? "s" : ""
                                } Selected (RS ${Number(amount).toLocaleString()})`
                              : "5 Tests (Choose 1 or more)"
                            : cat.id === "PRESCRIPTION"
                            ? isSelected && selectedPrescriptionBillId
                              ? `1 Bill Selected (RS ${Number(amount).toLocaleString()})`
                              : `${prescriptionBills.length} Bill${prescriptionBills.length === 1 ? "" : "s"} Available`
                            : `Fee: RS ${cat.defaultAmount.toLocaleString()}`}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* LABORATORY TEST MULTI-SELECTION SECTION */}
              {category === "LAB_TEST" && (
                <div className="rounded-3xl border-2 border-blue-200/90 bg-gradient-to-br from-blue-50/80 via-indigo-50/30 to-white p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
                        <FlaskConical className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">
                            Choose Diagnostic Laboratory Tests
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                            Multi-Select
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Select one or more laboratory tests to include in your order. Total fee updates automatically.
                        </p>
                      </div>
                    </div>

                    {/* Quick Select Controls */}
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={handleSelectAllLabTests}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-100 hover:bg-blue-200 text-blue-700 transition"
                      >
                        Select All (5)
                      </button>
                      <button
                        type="button"
                        onClick={handleResetLabTests}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        Reset (CBC Only)
                      </button>
                    </div>
                  </div>

                  {/* List of Selectable Lab Test Cards */}
                  <div className="space-y-2.5">
                    {LAB_TEST_OPTIONS.map((test) => {
                      const isCurrent = selectedLabTestIds.includes(test.id);
                      return (
                        <div
                          key={test.id}
                          onClick={() => handleToggleLabTest(test.id)}
                          role="checkbox"
                          aria-checked={isCurrent}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === " " || e.key === "Enter") {
                              e.preventDefault();
                              handleToggleLabTest(test.id);
                            }
                          }}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer text-left select-none ${
                            isCurrent
                              ? "border-blue-600 bg-white shadow-sm ring-2 ring-blue-500/15"
                              : "border-slate-200/90 hover:border-blue-300 bg-white/70 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-3.5 min-w-0 pr-3">
                            {/* Checkbox Icon */}
                            <div
                              className={`w-5 h-5 mt-0.5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                                isCurrent
                                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {isCurrent && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-sm font-bold ${
                                    isCurrent ? "text-blue-950 font-extrabold" : "text-slate-900"
                                  }`}
                                >
                                  {test.name}
                                </span>
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                  {test.code}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                {test.description}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 flex-wrap">
                                <span className="font-semibold text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded-md">
                                  {test.panel}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {test.turnaround}
                                </span>
                                <span>•</span>
                                <span
                                  className={`font-semibold ${
                                    test.fastingRequired ? "text-amber-600" : "text-emerald-600"
                                  }`}
                                >
                                  {test.fastingRequired
                                    ? "10-12 Hr Fasting Required"
                                    : "No Fasting Needed"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 text-right pl-3">
                            <div className="text-base font-black text-blue-700 font-mono">
                              RS {test.price.toLocaleString()}
                            </div>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider block mt-0.5 transition-colors ${
                                isCurrent ? "text-emerald-600" : "text-slate-400"
                              }`}
                            >
                              {isCurrent ? "Selected" : "Click to Add"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Tests Chips & Bottom Summary Bar */}
                  <div className="bg-white rounded-2xl border border-blue-100 p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-1">
                        Active Tests ({selectedLabTests.length}):
                      </span>
                      {selectedLabTests.map((t) => (
                        <span
                          key={t.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold"
                        >
                          <span>{t.code}</span>
                          <span className="font-bold truncate max-w-[150px]">{t.name}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleLabTest(t.id);
                            }}
                            className="text-blue-500 hover:text-red-600 transition ml-0.5 p-0.5 rounded-full hover:bg-blue-100 cursor-pointer"
                            title="Remove test"
                          >
                            <X className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          {hasFastingRequired ? (
                            <span className="text-amber-700 font-medium">
                              <strong className="text-amber-800">Fasting Notice:</strong> One or more selected tests require 10-12 hours of overnight fasting prior to your sample collection.
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-medium">
                              <strong className="text-emerald-800">No Fasting Required:</strong> Routine sample collection without dietary restrictions.
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto text-[11px] font-medium text-slate-500">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ISO 15189 Certified Pathology</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MEDICAL PRESCRIPTION BILLS SECTION */}
              {category === "PRESCRIPTION" && (
                <div className="rounded-3xl border-2 border-indigo-200/90 bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-white p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">
                            Medical Prescription Bills
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                            Individual Patient Bills
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Select a dispensed prescription bill below to proceed with payment.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => void loadPrescriptionBills()}
                        disabled={loadingPrescriptions}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-100 hover:bg-indigo-200 text-indigo-700 transition flex items-center gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingPrescriptions ? "animate-spin" : ""}`} />
                        <span>Refresh Bills</span>
                      </button>
                    </div>
                  </div>

                  {/* NO DISPENSED PRESCRIPTIONS AVAILABLE */}
                  {prescriptionBills.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Pill className="w-7 h-7" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600 mt-4">No prescription bills yet</p>
                      <p className="text-xs text-slate-400 mt-1">Dispensed prescriptions will appear here automatically.</p>
                    </div>
                  ) : (
                    /* LIST OF INDIVIDUAL MEDICAL PRESCRIPTION BILLS */
                    <div className="space-y-4">
                      {prescriptionBills.map((bill) => {
                        const isSelected = selectedPrescriptionBillId === bill.id;
                        const isPaid = bill.status === "PAID";

                        return (
                          <div
                            key={bill.id}
                            onClick={() => {
                              if (isPaid) return;
                              setSelectedPrescriptionBillId(bill.id);
                              setAmount(bill.totalAmount.toFixed(2));
                              setDescription(`Medical Prescription Bill: ${bill.prescriptionNumber} (${bill.patientName})`);
                              setErrorMsg(null);
                            }}
                            className={`rounded-2xl border-2 transition-all p-5 cursor-pointer relative bg-white ${
                              isSelected
                                ? "border-indigo-600 shadow-md ring-2 ring-indigo-500/20 bg-indigo-50/20"
                                : isPaid
                                ? "border-emerald-200 bg-emerald-50/30 opacity-80 cursor-default"
                                : "border-slate-200 hover:border-indigo-300"
                            }`}
                          >
                            {/* Bill Card Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${
                                    isSelected
                                      ? "border-indigo-600 bg-indigo-600 text-white"
                                      : isPaid
                                      ? "border-emerald-600 bg-emerald-600 text-white"
                                      : "border-slate-300 bg-white"
                                  }`}
                                >
                                  {isSelected || isPaid ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 text-sm">{bill.prescriptionNumber}</span>
                                    <span
                                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                                        isPaid
                                          ? "bg-emerald-100 text-emerald-800"
                                          : "bg-indigo-100 text-indigo-800"
                                      }`}
                                    >
                                      {isPaid ? "Paid & Cleared" : "Dispensed - Ready for Payment"}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-500 mt-0.5">
                                    Patient: <strong className="font-semibold text-slate-800">{bill.patientName}</strong> &middot; ID:{" "}
                                    <span className="font-mono text-slate-700">{bill.patientId}</span>
                                    {bill.doctorName && (
                                      <span> &middot; Doctor: {bill.doctorName}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="text-lg font-black text-indigo-700 font-mono">
                                  RS {bill.totalAmount.toLocaleString()}
                                </div>
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wider block mt-0.5 ${
                                    isSelected
                                      ? "text-indigo-600 font-bold"
                                      : isPaid
                                      ? "text-emerald-600"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {isSelected ? "Selected for Payment" : isPaid ? "Paid" : "Click to Select Bill"}
                                </span>
                              </div>
                            </div>

                            {/* Medications Table with Drug Name and QTY */}
                            <div className="mt-3 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-100/70 text-[11px] uppercase tracking-wider text-slate-500">
                                  <tr>
                                    <th className="py-2.5 px-3 font-semibold">Drug Name</th>
                                    <th className="py-2.5 px-3 font-semibold">Dosage & Frequency</th>
                                    <th className="py-2.5 px-3 font-semibold text-center">QTY</th>
                                    <th className="py-2.5 px-3 font-semibold text-right">Unit Price</th>
                                    <th className="py-2.5 px-3 font-semibold text-right">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                                  {bill.items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/70">
                                      <td className="py-2.5 px-3 font-bold text-slate-900">{item.medicineName}</td>
                                      <td className="py-2.5 px-3 text-slate-500">
                                        {item.dosage} {item.frequency ? `• ${item.frequency}` : ""}
                                      </td>
                                      <td className="py-2.5 px-3 text-center font-black text-indigo-700 font-mono">
                                        {item.quantity}
                                      </td>
                                      <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                                        RS {item.unitPrice.toLocaleString()}
                                      </td>
                                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                                        RS {item.totalPrice.toLocaleString()}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Card Footer with Dispense info */}
                            <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>Dispensed on: {new Date(bill.dispensedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Amount and Description (Non-changeable fixed fees) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Standard Amount (RS)
                    </label>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                      <Lock className="w-3 h-3" /> Fixed
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                      RS
                    </span>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={Number(amount).toLocaleString()}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-100/90 font-bold text-lg text-slate-800 cursor-not-allowed select-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Payment Description
                    </label>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                      <Lock className="w-3 h-3" /> Fixed
                    </span>
                  </div>
                  {category === "LAB_TEST" && selectedLabTests.length > 1 ? (
                    <div className="w-full p-2.5 rounded-2xl border border-slate-200 bg-slate-100/90 flex flex-wrap items-center gap-1.5 min-h-[52px]">
                      <span className="text-xs font-bold text-blue-700 mr-1 shrink-0">
                        {selectedLabTests.length} Tests Selected:
                      </span>
                      {selectedLabTests.map((t) => (
                        <span
                          key={t.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs"
                        >
                          <span className="font-bold">{t.shortName}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-blue-600 font-mono font-bold">
                            RS {t.price.toLocaleString()}
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={description}
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-100/90 text-slate-800 font-semibold cursor-not-allowed select-none"
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02]"
                >
                  <span>Continue to Card Info</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: CREDIT CARD INPUT */}
        {step === "CARD" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Enter Card Information</h2>
                <p className="text-sm text-slate-500">
                  Simulation mode: Card is validated for formatting. Only the last 4 digits are retained.
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <Lock className="w-3.5 h-3.5" />
                TLS 1.3 Safe
              </span>
            </div>

            {/* Virtual Card Preview */}
            <div className="max-w-md mx-auto mb-8">
              <div className="h-52 rounded-2xl p-6 bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-900 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute right-0 bottom-0 w-44 h-44 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                      HealthBridge Card
                    </span>
                  </div>
                  <span className="text-sm font-black italic tracking-widest text-slate-100">
                    {getCardBrand(cardNumber)}
                  </span>
                </div>

                <div className="my-2">
                  <div className="text-xs text-slate-400 mb-1 font-mono uppercase tracking-wider">
                    Card Number
                  </div>
                  <div className="font-mono text-xl tracking-[0.25em] font-semibold text-white">
                    {cardNumber || "•••• •••• •••• ••••"}
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">
                      Cardholder
                    </div>
                    <div className="text-sm font-bold tracking-wide uppercase truncate max-w-[200px]">
                      {cardHolderName || "PATIENT NAME"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">
                      Expires
                    </div>
                    <div className="text-sm font-bold font-mono">
                      {expiryDate || "MM/YY"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleInitiatePayment} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Cardholder Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  placeholder="e.g., Anura Jayasinghe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Card Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-300 font-mono text-base text-slate-900 tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    placeholder="4111 2222 3333 4444"
                  />
                  <CreditCard className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Expiry Date (MM/YY) *
                  </label>
                  <input
                    type="text"
                    required
                    value={expiryDate}
                    onChange={handleExpiryChange}
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 font-mono text-center text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    placeholder="08/28"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    CVV / CVC *
                  </label>
                  <input
                    type="password"
                    required
                    value={cvv}
                    onChange={handleCvvChange}
                    maxLength={4}
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 font-mono text-center text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    placeholder="•••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep("DETAILS")}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay RS {Number(amount).toLocaleString()} & Send Code</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: OTP CONFIRMATION */}
        {step === "VERIFICATION" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
              <Lock className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-slate-900">Email Verification Required</h2>
            <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
              We have dispatched a unique 6-digit one-time confirmation code to your registered email:
            </p>
            <div className="inline-block mt-2 px-3 py-1 bg-slate-100 text-blue-700 font-mono font-bold text-sm rounded-lg">
              {user?.email}
            </div>

            {/* Payment Summary Box */}
            {category === "LAB_TEST" && selectedLabTests.length > 1 ? (
              <div className="my-6 rounded-2xl bg-slate-50 border border-slate-200/90 text-left max-w-lg mx-auto overflow-hidden shadow-sm">
                <div className="p-3.5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                      Laboratory Tests ({selectedLabTests.length} Tests)
                    </span>
                  </div>
                  <span className="text-sm font-black text-blue-700 font-mono">
                    Total: RS {Number(amount).toLocaleString()}
                  </span>
                </div>

                <div className="p-3 space-y-2 max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {selectedLabTests.map((t) => (
                    <div key={t.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">{t.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-600 shrink-0 font-bold">
                          {t.code}
                        </span>
                      </div>
                      <span className="font-bold text-slate-700 font-mono shrink-0">
                        RS {t.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="px-3.5 py-2.5 bg-slate-100/60 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                  <span>Card Used: <span className="font-mono text-slate-700 font-semibold">{maskedCard}</span></span>
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Order
                  </span>
                </div>
              </div>
            ) : (
              <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-left max-w-lg mx-auto shadow-sm">
                <div className="min-w-0 flex-1 pr-4">
                  <div className="text-xs text-slate-500 font-medium">Service</div>
                  <div className="text-sm font-bold text-slate-900 truncate">{description}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{maskedCard}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-500 font-medium">Total Due</div>
                  <div className="text-lg font-black text-blue-600">RS {Number(amount).toLocaleString()}</div>
                </div>
              </div>
            )}

            {/* Dev Fallback Banner – shown when email quota is exceeded */}
            {devOtp && (
              <div className="my-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-left max-w-md mx-auto shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">⚠️</span>
                  <span className="text-sm font-bold text-amber-800">Email Delivery Unavailable</span>
                </div>
                <p className="text-xs text-amber-700 mb-3">
                  The confirmation email could not be sent (SMTP daily limit reached). Use the code below to continue:
                </p>
                <div className="flex items-center gap-3">
                  <code className="px-4 py-2 bg-white rounded-xl text-2xl font-black font-mono tracking-[0.3em] text-amber-900 border border-amber-200 shadow-inner">
                    {devOtp}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      const digits = devOtp.split("");
                      setOtpDigits(digits);
                      // Auto-focus last input after fill
                      setTimeout(() => otpInputsRef.current[5]?.focus(), 100);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    Auto-fill
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleConfirmOtp} className="space-y-6 max-w-md mx-auto">
              {/* 6 Digit Input Group */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputsRef.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-black font-mono rounded-xl border-2 border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition bg-white shadow-sm"
                    />
                  ))}
                </div>
              </div>

              {/* Timer & Resend */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Code expires in:</span>
                  <span className="font-mono font-bold text-slate-800">{formatTimer(timeLeft)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
                >
                  Resend Code
                </button>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading || otpDigits.join("").length !== 6}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Verifying Payment...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Confirm & Pay RS {Number(amount).toLocaleString()}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("CARD")}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  Change payment details
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: SUCCESS RECEIPT */}
        {step === "SUCCESS" && confirmedPayment && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg p-6 sm:p-10 max-w-xl mx-auto text-center animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/25">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Payment Confirmed!
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Your transaction has been securely verified and processed. A confirmation copy has been logged to your patient medical profile.
            </p>

            {/* Detailed Receipt Card */}
            <div className="mt-8 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Transaction Reference
                </span>
                <span className="font-mono text-xs font-bold text-slate-800">
                  {confirmedPayment.id}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <span className="text-xs text-slate-500 shrink-0 mt-0.5">Service Description</span>
                <span className="text-sm font-semibold text-slate-900 text-right min-w-0 flex-1 break-words">
                  {confirmedPayment.description}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Card Used</span>
                <span className="text-sm font-mono font-medium text-slate-900">
                  {confirmedPayment.maskedCard}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Date & Time</span>
                <span className="text-xs font-semibold text-slate-700">
                  {new Date(confirmedPayment.confirmedAt).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-sm font-bold text-slate-900">Amount Paid</span>
                <span className="text-2xl font-black text-emerald-600">
                  RS {Number(confirmedPayment.amount).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all hover:scale-105"
              >
                Make Another Payment
              </button>
              <Link
                href="/payments/history"
                className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
              >
                View History & Receipts
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
