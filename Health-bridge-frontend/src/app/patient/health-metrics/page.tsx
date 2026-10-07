"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, AuthUser } from "@/lib/auth";
import { Activity, HeartPulse, Scale, Droplet, Plus, X, TrendingUp, TrendingDown } from "lucide-react";
import { PatientTable } from "@/components/patient/PatientTable";
import { PatientForm } from "@/components/patient/PatientForm";
import { healthMetricService } from "@/services/healthMetricService";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function HealthMetricsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ metricType: "Heart Rate", value: "", unit: "bpm" });
  
  // State for chart tabs and live validation errors
  const [activeChart, setActiveChart] = useState("Heart Rate");
  const [timeRange, setTimeRange] = useState("1M"); // New Time Range Filter (Default to 1 Month)
  const [error, setError] = useState<string | null>(null);
  const [tableFilter, setTableFilter] = useState("All");

  const fetchMetrics = async (patientId: string) => {
    try {
      const data = await healthMetricService.getPatientMetrics(patientId);
      setMetrics(data);
    } catch (err) {
      console.error("Failed to load metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = getStoredUser();

    if (!storedUser) {
      router.push("/login");
      return;
    }
    setUser(storedUser);
    fetchMetrics(storedUser.id);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const type = formData.metricType;
    const val = formData.value.trim();

    // Strict Input Validation - setting error state instead of popups
    if (type === "Blood Pressure") {
      const bpRegex = /^\d{2,3}\/\d{2,3}$/;
      if (!bpRegex.test(val)) {
        setError("Format must be like '120/80'.");
        return;
      }
      const [sys, dia] = val.split("/");
      if (Number(sys) < 70 || Number(sys) > 250 || Number(dia) < 40 || Number(dia) > 150) {
        setError("Out of safe human range (Sys: 70-250, Dia: 40-150).");
        return;
      }
    } else {
      const numVal = Number(val);
      if (isNaN(numVal) || numVal < 0) {
        setError("Value must be a positive number.");
        return;
      }
      if (type === "Heart Rate" && (numVal < 30 || numVal > 250)) {
        setError("Heart Rate is out of safe human range (30-250 bpm).");
        return;
      }
      if (type === "Weight" && (numVal < 2 || numVal > 300)) {
        setError("Weight is out of safe human range (2-300 kg).");
        return;
      }
      if (type === "Blood Sugar" && (numVal < 20 || numVal > 600)) {
        setError("Blood Sugar is out of safe human range (20-600 mg/dL).");
        return;
      }
    }

    try {
      await healthMetricService.logMetric({ ...formData, patientId: user?.id });
      setShowModal(false);
      setFormData({ metricType: "Heart Rate", value: "", unit: "bpm" });
      setError(null);
      if (user) fetchMetrics(user.id);
    } catch (err) {
      setError("Failed to save metric to the database.");
    }
  };

  const getIcon = (type: string) => {
    const iconClass = "w-5 h-5 transition-transform duration-300 group-hover:scale-125 group-hover:animate-pulse";
    switch (type) {
      case "Heart Rate": return <HeartPulse className={`${iconClass} text-red-500`} />;
      case "Blood Pressure": return <Activity className={`${iconClass} text-blue-500`} />;
      case "Weight": return <Scale className={`${iconClass} text-purple-500`} />;
      case "Blood Sugar": return <Droplet className={`${iconClass} text-emerald-500`} />;
      default: return <Activity className={`${iconClass} text-slate-500`} />;
    }
  };

  const getChartData = (type: string) => {
    // 1. Calculate Cutoff Date based on Time Range Filter
    const now = new Date().getTime();
    let cutoff = 0; // "All"
    if (timeRange === "1W") cutoff = now - 7 * 24 * 60 * 60 * 1000;
    if (timeRange === "1M") cutoff = now - 30 * 24 * 60 * 60 * 1000;
    if (timeRange === "6M") cutoff = now - 180 * 24 * 60 * 60 * 1000;

    // 2. Filter by Type AND Cutoff Date
    const filtered = metrics.filter(m => {
      if (m.metricType !== type) return false;
      if (new Date(m.recordedAt).getTime() < cutoff) return false;
      return true;
    });

    // 3. Sort oldest to newest for the chart timeline
    const sorted = filtered.sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
    
    return sorted.map(m => {
      const dateObj = new Date(m.recordedAt);
      const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${dateObj.getHours()}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
      
      if (type === "Blood Pressure") {
        let sys = 0, dia = 0;
        if (m.value && m.value.includes("/")) {
          const parts = m.value.split("/");
          sys = parseInt(parts[0].trim()) || 0;
          dia = parseInt(parts[1].trim()) || 0;
        } else {
          sys = parseInt(m.value) || 0;
        }
        return { date: formattedDate, systolic: sys, diastolic: dia };
      }
      
      return { date: formattedDate, value: parseFloat(m.value) || 0 };
    });
  };

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
        <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Your Health Metrics</h1>
              <p className="text-sm text-slate-500 mt-1">Track and monitor your vital signs over time.</p>
            </div>
            <button 
              onClick={() => { setShowModal(true); setError(null); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Log New Metric
            </button>
          </div>

          {/* Top 4 Permanent Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
            {["Heart Rate", "Blood Pressure", "Weight", "Blood Sugar"].map((type) => {
              const latest = metrics.find(m => m.metricType === type);
              return (
                <div key={type} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:border-blue-300 transition group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      {getIcon(type)}
                    </div>
                    <h3 className="font-semibold text-slate-700">{type}</h3>
                  </div>
                  {latest ? (
                    <>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-slate-900">{latest.value}</span>
                        <span className="text-sm text-slate-500 mb-1">{latest.unit}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-3 font-medium">
                        Last logged: {new Date(latest.recordedAt).toLocaleString()}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-slate-300">--</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-3 font-medium">
                        Not logged yet
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* New Interactive Trends Chart Section */}
          <div className="mt-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Health Trends</h2>
                {/* NEW TIME RANGE FILTER */}
                <div className="flex items-center gap-1.5 mt-2">
                  {["1W", "1M", "6M", "All"].map(range => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition ${
                        timeRange === range 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex bg-slate-100 p-1.5 rounded-xl w-full sm:w-auto overflow-x-auto mt-4 sm:mt-0">
                {["Heart Rate", "Blood Pressure", "Weight", "Blood Sugar"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveChart(tab)}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                      activeChart === tab 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[300px] w-full mt-8">
              {getChartData(activeChart).length === 0 ? (
                <div className="w-full h-full flex items-center justify-center flex-col gap-2 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-sm font-medium">No data found for this time period.</p>
                  <button onClick={() => setTimeRange("All")} className="text-xs text-blue-600 font-semibold hover:underline">View All Time</button>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {activeChart === "Blood Pressure" ? (
                    <LineChart data={getChartData(activeChart)} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
                      <Tooltip contentStyle={{borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} name="Systolic (Top)" />
                      <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} name="Diastolic (Bottom)" />
                    </LineChart>
                  ) : (
                    <LineChart data={getChartData(activeChart)} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
                      <Tooltip contentStyle={{borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={activeChart === "Heart Rate" ? "#ef4444" : activeChart === "Weight" ? "#a855f7" : "#10b981"} 
                        strokeWidth={3} 
                        dot={{r: 4, fill: '#fff', strokeWidth: 2}} 
                        activeDot={{r: 6}} 
                        name={activeChart}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
            
            {/* NEW: History Log Table */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">History Log</h2>
                
                {/* NEW: Dropdown Filter */}
                <select 
                  value={tableFilter} 
                  onChange={(e) => setTableFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-sm font-semibold text-slate-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                >
                  <option value="All">All Metrics</option>
                  <option value="Heart Rate">Heart Rate</option>
                  <option value="Blood Pressure">Blood Pressure</option>
                  <option value="Weight">Weight</option>
                  <option value="Blood Sugar">Blood Sugar</option>
                </select>
              </div>

              <PatientTable 
                columns={[
                  { 
                    key: 'recordedAt', 
                    label: 'Date & Time', 
                    render: (row) => {
                      const d = new Date(row.recordedAt);
                      return (
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="text-xs text-slate-500">{d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      );
                    }
                  },
                  { 
                    key: 'metricType', 
                    label: 'Metric Type',
                    render: (row) => <span className="font-medium text-slate-700">{row.metricType}</span>
                  },
                  { 
                    key: 'value', 
                    label: 'Result', 
                    render: (row) => {
                      const num = parseFloat(row.value.split('/')[0]); 
                      
                      let statusColor = "text-slate-800"; 
                      let Icon = null;
                      let statusText = "";
                      let tooltipMsg = "";

                      if (row.metricType === "Heart Rate") {
                        if (num > 100) { statusColor = "text-red-600"; Icon = TrendingUp; statusText = "High"; tooltipMsg = "Normal resting heart rate is 60-100 bpm."; }
                        else if (num < 60) { statusColor = "text-blue-600"; Icon = TrendingDown; statusText = "Low"; tooltipMsg = "Normal resting heart rate is 60-100 bpm."; }
                      }
                      else if (row.metricType === "Blood Pressure") {
                        if (num >= 130) { statusColor = "text-red-600"; Icon = TrendingUp; statusText = "High"; tooltipMsg = "Normal blood pressure is under 120/80 mmHg."; }
                        else if (num >= 120) { statusColor = "text-orange-500"; Icon = TrendingUp; statusText = "Elevated"; tooltipMsg = "Normal blood pressure is under 120/80 mmHg."; }
                      }
                      else if (row.metricType === "Blood Sugar") {
                        if (num >= 126) { statusColor = "text-red-600"; Icon = TrendingUp; statusText = "High"; tooltipMsg = "Normal fasting blood sugar is 70-99 mg/dL."; }
                        else if (num >= 100) { statusColor = "text-orange-500"; Icon = TrendingUp; statusText = "Elevated"; tooltipMsg = "Normal fasting blood sugar is 70-99 mg/dL."; }
                        else if (num < 70) { statusColor = "text-blue-600"; Icon = TrendingDown; statusText = "Low"; tooltipMsg = "Normal fasting blood sugar is 70-99 mg/dL."; }
                      }
                      
                      return (
                        <div className="flex items-center gap-2">
                           <span className={`font-bold text-base transition-colors ${statusColor}`}>
                             {row.value} <span className={`text-sm font-normal ${statusColor === 'text-slate-800' ? 'text-slate-500' : 'opacity-80'}`}>{row.unit}</span>
                           </span>
                           
                           {Icon && (
                             <div className="group relative cursor-help flex items-center">
                               <Icon className={`w-4 h-4 ${statusColor} opacity-90`} />
                               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-xs text-center rounded-lg shadow-lg z-10">
                                 {tooltipMsg}
                                 <svg className="absolute text-slate-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                               </div>
                             </div>
                           )}
                        </div>
                      );
                    } 
                  }
                ]}
                data={metrics
                  .filter(m => tableFilter === "All" || m.metricType === tableFilter)
                  .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
                }
                emptyMessage={`No ${tableFilter === "All" ? "vitals" : tableFilter.toLowerCase()} logged yet.`}
              />
            </div>
          </div>
        </div>

        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Log New Metric</h2>
              <PatientForm 
                fields={[
                  {
                    name: 'metricType', label: 'Metric Type', type: 'select', required: true,
                    options: [
                      { label: 'Heart Rate', value: 'Heart Rate' },
                      { label: 'Blood Pressure', value: 'Blood Pressure' },
                      { label: 'Weight', value: 'Weight' },
                      { label: 'Blood Sugar', value: 'Blood Sugar' }
                    ]
                  },
                  {
                    name: 'value', label: 'Value', type: 'text', required: true,
                    placeholder: formData.metricType === "Blood Pressure" ? "e.g. 120/80" : "e.g. 72"
                  },
                  {
                    name: 'unit', label: 'Unit', type: 'text', required: true
                  }
                ]}
                values={formData}
                onChange={(e) => {
                  const { name, value } = e.target;
                  if (name === 'metricType') {
                    let autoUnit = "";
                    if (value === "Heart Rate") autoUnit = "bpm";
                    if (value === "Blood Pressure") autoUnit = "mmHg";
                    if (value === "Weight") autoUnit = "kg";
                    if (value === "Blood Sugar") autoUnit = "mg/dL";
                    setFormData({ ...formData, metricType: value, unit: autoUnit });
                  } else {
                    setFormData({ ...formData, [name]: value });
                  }
                  setError(null);
                }}
                onSubmit={handleSubmit}
                buttonText="Save to Dashboard"
              />
              {error && <p className="text-red-500 text-sm font-medium mt-4">{error}</p>}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
