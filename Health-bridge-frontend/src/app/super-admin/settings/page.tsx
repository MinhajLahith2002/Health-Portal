"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import axios from "@/lib/axios";
import { toast } from "react-hot-toast";

import { 
  RotateCcw, Save, Pin, Globe, Shield, Bell, Cloud, CloudUpload, Check
} from "lucide-react";

const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange?: () => void }) => {
  return (
    <button 
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-[#0052CC]' : 'bg-slate-200'
      }`}
    >
      <span className="sr-only">Use setting</span>
      {checked && (
        <span className="absolute left-1 flex items-center justify-center w-4 h-4">
          <Check size={12} className="text-white" strokeWidth={4} />
        </span>
      )}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

// Simple select mock
const CustomSelect = ({ value, options, onChange }: { value: string, options: string[], onChange: (v: string) => void }) => (
  <select 
    value={value} 
    onChange={(e) => onChange(e.target.value)}
    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-bold text-[#0A2540] shadow-sm focus:border-[#0052CC] focus:outline-none focus:ring-1 focus:ring-[#0052CC]"
  >
    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
  </select>
);

const FormGroup = ({ label, description, children }: { label: string, description: string, children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[12px] font-bold text-[#0A2540]">{label}</label>
    {children}
    <p className="text-[11px] font-medium text-slate-500 mt-0.5">{description}</p>
  </div>
);

const SettingsCard = ({ icon: Icon, title, children, headerAction }: any) => (
  <Card className="p-6 border-slate-100 shadow-sm rounded-xl bg-white mb-6">
    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <Icon size={16} className="text-[#0052CC]" />
        </div>
        <h3 className="text-[15px] font-bold text-[#0A2540]">{title}</h3>
      </div>
      {headerAction}
    </div>
    {children}
  </Card>
);

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State for all settings
  const [settings, setSettings] = useState({
    system_name: "Health Bridge AI Healthcare System",
    system_email: "admin@healthbridge.com",
    time_zone: "(UTC+5:30) Asia/Colombo",
    date_format: "DD/MM/YYYY",
    time_format: "24-Hour",
    language: "English",
    currency: "USD",
    tfa: false,
    session_timeout: "30",
    password_expiry: "90",
    max_login_attempts: "5",
    email_alerts: true,
    sms_alerts: true,
    push_alerts: true,
    appointment_reminders: true,
    prescription_refills: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/system-settings');
      
      const newSettings = { ...settings };
      res.data.forEach((setting: any) => {
        const val = setting.settingValue;
        if (val === 'true') newSettings[setting.settingKey as keyof typeof settings] = true as never;
        else if (val === 'false') newSettings[setting.settingKey as keyof typeof settings] = false as never;
        else newSettings[setting.settingKey as keyof typeof settings] = val as never;
      });
      
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to fetch settings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Save each setting (In a real app you might want a batch update endpoint, but this works with your current backend)
      const promises = Object.entries(settings).map(([key, value]) => {
        return axios.put(`/api/admin/system-settings/${key}`, {
          settingKey: key,
          settingValue: value.toString(),
          category: "General", 
          description: "Updated from frontend"
        }).catch(err => {
          // If it doesn't exist, POST it instead
          if (err.response?.status === 404) {
             return axios.post(`/api/admin/system-settings`, {
                settingKey: key,
                settingValue: value.toString(),
                category: "General",
                description: "Created from frontend"
             });
          }
        });
      });

      await Promise.all(promises);
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all settings to their defaults?")) return;
    try {
      await axios.post('/api/admin/system-settings/reset');
      toast.success("Settings reset to defaults!");
      fetchSettings(); // Refresh
    } catch (error) {
      toast.error("Failed to reset settings");
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading settings...</div>;

  return (
    <div className="p-8 max-w-[1200px] mx-auto min-h-screen bg-[#F8FAFC]">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[24px] font-bold text-[#0A2540] tracking-tight">System Settings</h1>
          <p className="text-sm font-medium text-slate-500">Configure system-wide settings, security, and preferences</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button onClick={handleReset} variant="outline" leftIcon={<RotateCcw size={14} />} className="font-bold text-[#0A2540] border-slate-200 bg-white">
            Reset to Default
          </Button>
          <Button onClick={handleSave} disabled={saving} variant="primary" leftIcon={<Save size={14} />} className="font-bold bg-[#16A34A] text-white">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <SettingsCard icon={Pin} title="System Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormGroup label="System Name" description="The name of your healthcare platform">
            <Input value={settings.system_name} onChange={(e) => handleChange('system_name', e.target.value)} />
          </FormGroup>
          <FormGroup label="System Email" description="Primary email for system notifications">
            <Input value={settings.system_email} onChange={(e) => handleChange('system_email', e.target.value)} />
          </FormGroup>
        </div>
      </SettingsCard>

      <SettingsCard icon={Globe} title="Regional Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <FormGroup label="Time Zone" description="System-wide default time zone">
            <CustomSelect value={settings.time_zone} onChange={(v) => handleChange('time_zone', v)} options={["(UTC+5:30) Asia/Colombo", "(UTC+0:00) London"]} />
          </FormGroup>
          <FormGroup label="Language" description="Preferred language for the system interface">
            <CustomSelect value={settings.language} onChange={(v) => handleChange('language', v)} options={["English", "Sinhala", "Tamil", "French"]} />
          </FormGroup>
        </div>
      </SettingsCard>
      
      <SettingsCard icon={Shield} title="Security Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between h-11">
              <label className="text-[12px] font-bold text-[#0A2540]">Two-Factor Authentication (2FA)</label>
              <ToggleSwitch checked={settings.tfa} onChange={() => handleChange('tfa', !settings.tfa)} />
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Require 2FA for all admin and staff accounts</p>
          </div>
          <FormGroup label="Session Timeout (Minutes)" description="Auto-logout after period of inactivity">
            <Input type="number" value={settings.session_timeout} onChange={(e) => handleChange('session_timeout', e.target.value)} />
          </FormGroup>
        </div>
      </SettingsCard>

    </div>
  );
}
