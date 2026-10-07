"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { superAdminService, SuperAdminGrowthDto, SuperAdminStatsDto, UserProfileResponse } from "@/services/superadmin.service";

import { 
  ComposedChart,
  Bar,
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LabelList
} from "recharts";
import { 
  Users,
  Building2,
  Stethoscope,
  Banknote,
  Download,
  Calendar,
  ChevronDown,
  Pill,
  FlaskConical,
  ClipboardList,
  BarChart3
} from "lucide-react";

// Mock data removed in favor of live API data

// Custom label for the end of the line chart
const renderCustomizedLabel = (props: any, labelStr: string, color: string, dataLength: number) => {
  const { x, y, index } = props;
  if (dataLength > 0 && index === dataLength - 1) {
    return (
      <text x={x + 8} y={y + 4} fill={color} fontSize={11} fontWeight="bold" textAnchor="start">
        {labelStr}
      </text>
    );
  }
  return null;
};

// Custom dot to only show on the last point
const renderCustomDot = (props: any, dataLength: number) => {
  const { cx, cy, index, stroke } = props;
  if (dataLength > 0 && index === dataLength - 1) {
    return <circle cx={cx} cy={cy} r={4} fill={stroke} stroke="none" />;
  }
  return null;
};

// Mock data removed in favor of live API data

const topHospitalsData = [
  { rank: 1, name: "Apollo Hospital", icon: Building2, doctors: 125, appts: "3,450", revenue: "$320K" },
  { rank: 2, name: "MediCare Hospital", icon: Building2, doctors: 98, appts: "2,800", revenue: "$250K" },
  { rank: 3, name: "City Hospital", icon: Building2, doctors: 45, appts: "1,200", revenue: "$120K" },
  { rank: 4, name: "General Medical", icon: Building2, doctors: 38, appts: "950", revenue: "$95K" },
];

export default function SystemAnalyticsPage() {
  const [growthData, setGrowthData] = useState<SuperAdminGrowthDto[]>([]);
  const [stats, setStats] = useState<SuperAdminStatsDto | null>(null);
  const [hospitals, setHospitals] = useState<UserProfileResponse[]>([]);
  const [analytics, setAnalytics] = useState<SystemAnalyticsDto | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [growth, dashboardStats, users, analyticsData] = await Promise.all([
          superAdminService.getGrowthData(),
          superAdminService.getDashboardStats(),
          superAdminService.getAllUsers(),
          superAdminService.getSystemAnalytics()
        ]);
        setGrowthData(growth);
        setStats(dashboardStats);
        setHospitals(users.filter((u: UserProfileResponse) => u.role === 'HOSPITAL').slice(0, 5));
        setAnalytics(analyticsData);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, []);
  
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true);
      await superAdminService.downloadAnalyticsReport();
    } catch (error) {
      console.error("Failed to download report", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Good": return "bg-emerald-500 text-white";
      case "Moderate": return "bg-amber-400 text-white";
      case "Critical": return "bg-red-500 text-white";
      default: return "bg-slate-200 text-slate-800";
    }
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <>
      <div className="flex flex-col gap-6 w-full p-4 sm:p-6 lg:p-8">
        


        {/* Main Content Area */}
        <div className="w-full space-y-6">
          
          {/* Top KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <Card className="p-6 rounded-2xl border border-slate-200/60 shadow-sm bg-white">
              <div className="flex justify-between items-start mb-6">
                <p className="text-sm font-bold text-slate-600">Total Users</p>
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0052CC]"><Users size={16} /></div>
              </div>
              <p className="text-3xl font-bold text-[#0A2540] mb-3">{stats?.totalUsers.toLocaleString() || '0'}</p>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[11px] font-bold">
                ↑ 12%
              </span>
            </Card>

            <Card className="p-6 rounded-2xl border border-slate-200/60 shadow-sm bg-white">
              <div className="flex justify-between items-start mb-6">
                <p className="text-sm font-bold text-slate-600">Registered Hospitals</p>
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0052CC]"><Building2 size={16} /></div>
              </div>
              <p className="text-3xl font-bold text-[#0A2540] mb-3">{stats?.totalHospitals.toLocaleString() || '0'}</p>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[11px] font-bold">
                ↑ 5%
              </span>
            </Card>

            <Card className="p-6 rounded-2xl border border-slate-200/60 shadow-sm bg-white">
              <div className="flex justify-between items-start mb-6">
                <p className="text-sm font-bold text-slate-600">Registered Doctors</p>
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0052CC]"><Stethoscope size={16} /></div>
              </div>
              <p className="text-3xl font-bold text-[#0A2540] mb-3">{stats?.activeDoctors.toLocaleString() || '0'}</p>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[11px] font-bold">
                ↑ 8%
              </span>
            </Card>

            <Card className="p-6 rounded-2xl border border-slate-200/60 shadow-sm bg-white">
              <div className="flex justify-between items-start mb-6">
                <p className="text-sm font-bold text-slate-600">Total Revenue</p>
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0052CC]"><Banknote size={16} /></div>
              </div>
              <p className="text-3xl font-bold text-[#0A2540] mb-3">Rs. {stats?.totalRevenue.toLocaleString() || '0'}</p>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[11px] font-bold">
                ↑ 18%
              </span>
            </Card>

          </div>

          <div className="flex justify-end">
            <button 
              onClick={handleDownloadReport}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-[#0052CC] text-white rounded-lg text-[13px] font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <Download size={14} />
              {isDownloading ? "Generating..." : "Generate Report"}
            </button>
          </div>

          {/* Platform Growth Line Chart */}
          <Card className="p-8 rounded-2xl border border-slate-200/60 shadow-sm bg-white flex flex-col h-[450px]">
            <h2 className="text-[15px] font-bold text-[#0A2540] mb-8">Platform Growth</h2>
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={growthData} margin={{ top: 20, right: 80, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }}
                    dy={10}
                  />
                  {/* Hide Y axis labels to match mockup, grid lines provide the scale visually */}
                  <YAxis yAxisId="left" hide domain={['auto', 'auto']} />
                  <YAxis yAxisId="right" orientation="right" hide domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  
                  {/* Revenue Bar mapped to right Y-Axis */}
                  <Bar dataKey="revenue" yAxisId="right" fill="#10B981" radius={[4, 4, 0, 0]} opacity={0.3} maxBarSize={40}>
                     <LabelList content={(props: any) => renderCustomizedLabel(props, `Rs. ${growthData[growthData.length - 1]?.revenue?.toLocaleString() || "0"}`, "#10B981", growthData.length)} />
                  </Bar>
                  
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="users" 
                    stroke="#0052CC" 
                    strokeWidth={3} 
                    dot={(props: any) => renderCustomDot(props, growthData.length)} 
                    activeDot={{ r: 6 }} 
                  >
                    <LabelList content={(props: any) => renderCustomizedLabel(props, growthData[growthData.length - 1]?.users?.toLocaleString() || "0", "#0052CC", growthData.length)} />
                  </Line>
                  
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="appointments" 
                    stroke="#F59E0B" 
                    strokeWidth={3} 
                    dot={(props: any) => renderCustomDot(props, growthData.length)} 
                    activeDot={{ r: 6 }} 
                  >
                    <LabelList content={(props: any) => renderCustomizedLabel(props, growthData[growthData.length - 1]?.appointments?.toLocaleString() || "0", "#F59E0B", growthData.length)} />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-8 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#0052CC]"></div>
                <span className="text-[13px] font-bold text-slate-600">Users: <span className="text-[#0A2540]">{growthData[growthData.length - 1]?.users?.toLocaleString() || "0"}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                <span className="text-[13px] font-bold text-slate-600">Revenue: <span className="text-[#0A2540]">Rs. {growthData[growthData.length - 1]?.revenue?.toLocaleString() || "0"}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                <span className="text-[13px] font-bold text-slate-600">Appointments: <span className="text-[#0A2540]">{growthData[growthData.length - 1]?.appointments?.toLocaleString() || "0"}</span></span>
              </div>
            </div>
          </Card>

          {/* Split Row: Revenue & User Engagement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Revenue Breakdown */}
            <Card className="p-8 rounded-2xl border border-slate-200/60 shadow-sm bg-white flex flex-col justify-between h-full">
              <div>
                <h2 className="text-[15px] font-bold text-[#0A2540] mb-8">Revenue Breakdown</h2>
                <div className="space-y-6">
                  {analytics?.revenueBreakdown?.map((rev, idx) => {
                    let color = "bg-[#0052CC]";
                    if (rev.name === "Pharmacies") color = "bg-emerald-500";
                    if (rev.name === "Labs") color = "bg-amber-500";
                    if (rev.name === "Insurance") color = "bg-red-500";
                    
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
                            <span className="text-sm font-bold text-[#0A2540]">{rev.name}</span>
                          </div>
                          <span className="text-sm font-bold text-slate-600">Rs. {rev.amount.toLocaleString()}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${rev.percentage}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-100">
                <span className="text-[15px] font-bold text-[#0A2540]">Total</span>
                <span className="text-xl font-bold text-[#0A2540]">Rs. {stats?.totalRevenue.toLocaleString() || '0'}</span>
              </div>
            </Card>

            {/* User Engagement */}
            <Card className="p-8 rounded-2xl border border-slate-200/60 shadow-sm bg-white h-full flex flex-col">
              <div className="mb-6">
                <h2 className="text-[15px] font-bold text-[#0A2540] mb-1">User Engagement</h2>
                <p className="text-[11px] font-medium text-slate-500">Active users and feature adoption across the platform</p>
              </div>

              {/* Engagement Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 mb-1">DAU</p>
                  <div className="flex items-end gap-2">
                    <p className="text-lg font-bold text-[#0A2540]">{analytics?.dau || 0}</p>
                    {analytics?.dauGrowth != null && <span className="text-[9px] font-bold text-emerald-600 pb-1">↑ {analytics.dauGrowth}%</span>}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 mb-1">MAU</p>
                  <div className="flex items-end gap-2">
                    <p className="text-lg font-bold text-[#0A2540]">{analytics?.mau || 0}</p>
                    {analytics?.mauGrowth != null && <span className="text-[9px] font-bold text-emerald-600 pb-1">↑ {analytics.mauGrowth}%</span>}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 mb-1">Stickiness (DAU/MAU)</p>
                  <div className="flex items-end gap-2">
                    <p className="text-lg font-bold text-[#0A2540]">{analytics?.stickiness || 0}%</p>
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[9px] font-bold mb-1">Average</span>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 mb-6 flex items-center gap-1 ml-1"><BarChart3 size={10}/> Higher stickiness means users are coming back regularly</p>

              {/* Feature Adoption */}
              <div className="flex-1 flex flex-col justify-between">
                <h3 className="text-[13px] font-bold text-[#0A2540] mb-4">Feature Adoption</h3>
                
                <div className="space-y-4">
                  {analytics?.featureAdoption?.map((feature, idx) => {
                    let Icon = Calendar;
                    let color = "bg-emerald-500";
                    let textColor = "text-emerald-600";
                    if (feature.name === "Prescriptions") { Icon = Pill; }
                    if (feature.name === "Telemedicine") { Icon = Stethoscope; color = "bg-amber-500"; textColor = "text-amber-500"; }
                    if (feature.name === "Lab Tests") { Icon = FlaskConical; color = "bg-amber-500"; textColor = "text-amber-500"; }
                    if (feature.name === "Insurance") { Icon = ClipboardList; color = "bg-red-500"; textColor = "text-red-500"; }
                    
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <Icon size={12} className="text-slate-600"/>
                            <span className="text-[13px] font-bold text-[#0A2540]">{feature.name}</span>
                          </div>
                          <span className={`text-[11px] font-bold ${textColor}`}>{feature.percentage}% ({feature.label})</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${feature.percentage}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>

              </div>

            </Card>

          </div>

          {/* Module Performance & Summary */}
          <Card className="p-8 rounded-2xl border border-slate-200/60 shadow-sm bg-white overflow-hidden">
            <div className="mb-6">
              <h2 className="text-[15px] font-bold text-[#0A2540] mb-1">Module Performance & Summary</h2>
              <p className="text-[11px] font-medium text-slate-500">Health score and active usage of each platform module</p>
            </div>

            {/* Status Guide */}
            <div className="flex items-center gap-6 px-5 py-3 rounded-lg bg-slate-50 border border-slate-100 mb-6">
              <span className="text-[11px] font-bold text-slate-700">Status Guide:</span>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-[10px] font-bold text-emerald-600">Good (80-100%)</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div><span className="text-[10px] font-bold text-amber-500">Moderate (60-79%)</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><span className="text-[10px] font-bold text-red-500">Critical ({"<"}60%)</span></div>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-4 text-[11px] font-bold text-[#0A2540] pl-6 w-1/5">Module</th>
                    <th className="py-4 text-[11px] font-bold text-[#0A2540] w-1/5">Active</th>
                    <th className="py-4 text-[11px] font-bold text-[#0A2540] w-1/5">Score</th>
                    <th className="py-4 text-[11px] font-bold text-[#0A2540] w-1/6">Growth</th>
                    <th className="py-4 text-[11px] font-bold text-[#0A2540] w-1/6">Status</th>
                    <th className="py-4 text-[11px] font-bold text-[#0A2540] pr-6 text-right w-[10%]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.modulePerformance?.map((row, idx) => {
                    let Icon = Users;
                    if (row.name === "Hospitals") Icon = Building2;
                    if (row.name === "Doctors") Icon = Stethoscope;
                    if (row.name === "Pharmacies") Icon = Pill;
                    if (row.name === "Labs") Icon = FlaskConical;
                    if (row.name === "Insurance") Icon = ClipboardList;

                    return (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 pl-6">
                          <div className="flex items-center gap-3">
                            <Icon size={16} className="text-slate-500" />
                            <span className="text-[13px] font-bold text-[#0A2540]">{row.name}</span>
                          </div>
                        </td>
                        <td className="py-5">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-medium text-slate-700">{row.active}</span>
                          </div>
                        </td>
                        <td className="py-5 pr-8">
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${getScoreBarColor(row.score)} rounded-full`} style={{ width: `${row.score}%` }}></div>
                          </div>
                        </td>
                        <td className="py-5">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-[#0A2540]">{row.score}%</span>
                            <span className={`text-[10px] font-bold ${row.score >= 80 ? 'text-emerald-600' : row.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                              {row.growth}
                            </span>
                          </div>
                        </td>
                        <td className="py-5">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusColor(row.status)}`}>
                            {row.status === "Good" && <div className="w-1.5 h-1.5 bg-white rounded-full opacity-80"></div>}
                            {row.status === "Moderate" && <div className="w-1.5 h-1.5 bg-white rounded-full opacity-80"></div>}
                            {row.status === "Critical" && <div className="w-1.5 h-1.5 bg-white rounded-full opacity-80"></div>}
                            {row.status}
                          </div>
                        </td>
                        <td className="py-5 pr-6 text-right">
                          <a 
                            href={`/super-admin/${row.name === 'Patients' ? 'users' : row.name === 'Labs' ? 'laboratories' : row.name === 'Pharmacies' ? 'pharmacy' : row.name.toLowerCase()}`} 
                            className="text-[11px] font-bold text-[#0052CC] hover:underline"
                          >
                            [Details]
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

          </Card>

          {/* Top Performing Hospitals */}
          <Card className="p-8 rounded-2xl border border-slate-200/60 shadow-sm bg-white overflow-hidden">
            <h2 className="text-[15px] font-bold text-[#0A2540] mb-6">Top Performing Hospitals</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 text-[11px] font-bold text-slate-400 pl-4 w-16">#</th>
                    <th className="pb-4 text-[11px] font-bold text-slate-400">Hospital</th>
                    <th className="pb-4 text-[11px] font-bold text-slate-400">Doctors</th>
                    <th className="pb-4 text-[11px] font-bold text-slate-400">Appts</th>
                    <th className="pb-4 text-[11px] font-bold text-slate-400">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[13px] font-medium text-slate-500 bg-slate-50/30 rounded-lg">
                        No hospitals registered yet.
                      </td>
                    </tr>
                  ) : (
                    hospitals.map((hospital, index) => {
                      return (
                        <tr key={hospital.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0">
                          <td className="py-5 pl-4 text-[13px] font-bold text-[#0A2540]">{index + 1}</td>
                          <td className="py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                                <Building2 size={12} />
                              </div>
                              <span className="text-[13px] font-bold text-[#0A2540]">{hospital.fullName}</span>
                            </div>
                          </td>
                          <td className="py-5 text-[13px] font-medium text-slate-600">N/A</td>
                          <td className="py-5 text-[13px] font-medium text-slate-600">N/A</td>
                          <td className="py-5 text-[13px] font-bold text-[#0A2540]">Rs. 0</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

        </div>
      </div>
    </>
  );
}
