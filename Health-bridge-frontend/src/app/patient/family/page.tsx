"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, AuthUser } from "@/lib/auth";
import { Users, UserPlus, X, Trash2, Mail, Edit2 } from "lucide-react";
import { PatientCard } from "@/components/patient/PatientCard";
import { PatientForm } from "@/components/patient/PatientForm";
import { familyService } from "@/services/familyService";

export default function FamilyPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    relationship: "Child",
    dateOfBirth: "",
    linkedEmail: ""
  });

  // Live Field-Level Validation State
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    dob: "",
    email: ""
  });

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      router.push("/login");
    } else {
      setUser(storedUser);
      fetchFamilyMembers(storedUser.id);
    }
  }, [router]);

  const fetchFamilyMembers = async (patientId: string) => {
    try {
      const data = await familyService.getFamilyMembers(patientId);
      setFamilyMembers(data);
    } catch (err) {
      console.error("Failed to load family members", err);
    } finally {
      setLoading(false);
    }
  };

  // Live Validation Logic
  const validateField = (field: string, value: string) => {
    let errorMsg = "";
    
    if (field === "name") {
      if (!value.trim()) {
        errorMsg = "Name is required.";
      } else if (!/^[A-Za-z\s]{2,50}$/.test(value)) {
        errorMsg = "Name must be 2-50 characters (letters only).";
      }
    }
    
    if (field === "dob") {
      if (!value) {
        errorMsg = "Date of Birth is required.";
      } else {
        const selected = new Date(value);
        const now = new Date();
        const age = now.getFullYear() - selected.getFullYear();
        if (selected > now) {
          errorMsg = "Date of Birth cannot be in the future.";
        } else if (age > 120) {
          errorMsg = "Date of Birth cannot exceed 120 years.";
        }
      }
    }
    
    if (field === "email") {
      if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errorMsg = "Please enter a valid email address.";
      }
    }
    
    return errorMsg;
  };

  const handleEdit = (member: any) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      relationship: member.relationship,
      dateOfBirth: member.dateOfBirth,
      linkedEmail: member.linkedEmail || ""
    });
    setFieldErrors({ name: "", dob: "", email: "" });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      if (editingId) {
        await familyService.updateFamilyMember(editingId, { ...formData, primaryPatientId: user?.id });
      } else {
        await familyService.addFamilyMember({ ...formData, primaryPatientId: user?.id });
      }
      
      setShowModal(false);
      setEditingId(null);
      if (user) fetchFamilyMembers(user.id);
    } catch (err) {
      alert("Failed to save family member.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this family member?")) return;
    try {
      await familyService.deleteFamilyMember(id);
      if (user) fetchFamilyMembers(user.id);
    } catch (err) {
      alert("Failed to delete family member.");
    }
  };

  // Determine if the form is valid enough to enable the submit button
  const isFormValid = formData.name.trim() !== "" && 
                      formData.dateOfBirth !== "" && 
                      !fieldErrors.name && 
                      !fieldErrors.dob && 
                      !fieldErrors.email;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <>
      <main className="flex-1 p-6 sm:p-10 w-full relative">
        <div className="max-w-6xl mx-auto w-full pb-10">
          {/* Beautiful Header Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 mb-8 text-white shadow-lg shadow-blue-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 flex items-center gap-5 mb-6 sm:mb-0">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1 tracking-tight">Family Members</h1>
                <p className="text-blue-100 text-sm max-w-sm font-medium">Manage profiles for your children, spouse, or elderly parents securely.</p>
              </div>
            </div>
            
            <button 
              onClick={() => { 
                setEditingId(null); 
                setFormData({ name: "", relationship: "Child", dateOfBirth: "", linkedEmail: "" });
                setFieldErrors({ name: "", dob: "", email: "" });
                setShowModal(true); 
              }}
              className="relative z-10 bg-white text-blue-600 px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-50 hover:scale-105 transition-all shadow-md flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" /> Add Family Member
            </button>
          </div>

          {familyMembers.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center">
              <div className="bg-slate-100 p-6 rounded-full mb-6">
                <Users className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No family members linked</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-8">
                Add dependents like children or elderly parents to easily manage their healthcare from one central account.
              </p>
              <button 
                onClick={() => { 
                  setEditingId(null); 
                  setFormData({ name: "", relationship: "Child", dateOfBirth: "", linkedEmail: "" });
                  setFieldErrors({ name: "", dob: "", email: "" });
                  setShowModal(true); 
                }}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {familyMembers.map((member) => (
                <PatientCard key={member.id} member={member} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                {editingId ? "Edit Family Member" : "Add Family Member"}
              </h2>
              
              <PatientForm 
                fields={[
                  { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'John Doe' },
                  { 
                    name: 'relationship', label: 'Relationship', type: 'select', required: true,
                    options: [
                      { label: 'Child', value: 'Child' },
                      { label: 'Spouse', value: 'Spouse' },
                      { label: 'Parent', value: 'Parent' },
                      { label: 'Sibling', value: 'Sibling' },
                      { label: 'Other', value: 'Other' }
                    ]
                  },
                  { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
                  { name: 'linkedEmail', label: 'Linked Email (Optional)', type: 'email', placeholder: 'patient@example.com' }
                ]}
                values={formData}
                onChange={(e) => {
                  const { name, value } = e.target;
                  setFormData(prev => ({ ...prev, [name]: value }));
                  
                  // Map field name correctly for custom validation logic
                  const valKey = name === 'dateOfBirth' ? 'dob' : name === 'linkedEmail' ? 'email' : name;
                  if (valKey !== 'relationship') {
                    setFieldErrors(prev => ({ ...prev, [valKey]: validateField(valKey, value) }));
                  }
                }}
                onSubmit={handleSubmit}
                buttonText={editingId ? "Save Changes" : "Save Family Member"}
              />
              {/* Custom Error Messages Output */}
              {(fieldErrors.name || fieldErrors.dob || fieldErrors.email) && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                  {fieldErrors.name && <p className="text-red-500 text-xs font-semibold">{fieldErrors.name}</p>}
                  {fieldErrors.dob && <p className="text-red-500 text-xs font-semibold">{fieldErrors.dob}</p>}
                  {fieldErrors.email && <p className="text-red-500 text-xs font-semibold">{fieldErrors.email}</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
