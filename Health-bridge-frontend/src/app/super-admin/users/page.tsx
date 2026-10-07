"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StatCard, Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TablePagination } from "@/components/ui/Table";

import { useRouter } from "next/navigation";
import {
  Users,
  CheckCircle,
  Clock,
  Ban,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Download,
  UserPlus,
  Filter,
  X
} from "lucide-react";
import { superAdminService, UserProfileResponse } from "@/services/superadmin.service";

export default function UserManagementPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("All users");
  const [users, setUsers] = useState<UserProfileResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingUser, setViewingUser] = useState<UserProfileResponse | null>(null);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All roles");
  const [filterStatus, setFilterStatus] = useState("All statuses");
  const [filterInstitution, setFilterInstitution] = useState("All institutions");

  const itemsPerPage = 8;

  const router = useRouter();

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await superAdminService.updateUserStatus(id, newStatus);
      setUsers(users.map(u => u.id === id ? { ...u, accountStatus: newStatus } : u));
      if (viewingUser?.id === id) {
        setViewingUser({ ...viewingUser, accountStatus: newStatus });
        // Optionally close drawer if rejected
        if (newStatus === "Rejected") setViewingUser(null);
      }
      setDropdownOpenId(null);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await superAdminService.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
      setDropdownOpenId(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const data = await superAdminService.getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const formatStatus = (status: string) => {
    if (!status) return "Unknown";
    const normalized = status.toUpperCase();
    if (normalized === "ACTIVE") return "Active";
    if (normalized === "SUSPENDED") return "Suspended";
    if (normalized === "PENDING" || normalized === "PENDING_APPROVAL") return "Pending approval";
    return status;
  };

  const tabs = [
    { name: "All users", count: users.length.toString(), href: null },
    { name: "Pending approval", count: users.filter(u => formatStatus(u.accountStatus) === "Pending approval").length.toString(), href: null },
    { name: "Suspended", count: users.filter(u => formatStatus(u.accountStatus) === "Suspended").length.toString(), href: null },
    { name: "Recently added", count: "-", href: null },
  ];

  // Filter the actual data based on the active tab
  const filteredUsers = users.filter(user => {
    const status = formatStatus(user.accountStatus);
    
    // Tab filter
    if (activeTab === "Suspended" && status !== "Suspended") return false;
    if (activeTab === "Pending approval" && status !== "Pending approval") return false;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesName = user.fullName?.toLowerCase().includes(term);
      const matchesEmail = user.email?.toLowerCase().includes(term);
      const matchesId = user.id?.toLowerCase().includes(term);
      if (!matchesName && !matchesEmail && !matchesId) return false;
    }

    // Dropdown filters
    if (filterRole !== "All roles" && user.role !== filterRole) return false;
    if (filterStatus !== "All statuses" && status !== filterStatus) return false;

    return true; 
  });

  const roles = ["All roles", ...Array.from(new Set(users.map(u => u.role).filter(Boolean)))];
  const statuses = ["All statuses", ...Array.from(new Set(users.map(u => formatStatus(u.accountStatus)).filter(Boolean)))];

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getRoleBadge = (role: string) => {
    if (!role) return <Badge variant="neutral">Unknown</Badge>;
    const normalized = role.toUpperCase();
    switch (normalized) {
      case "DOCTOR": return <Badge variant="primary">Doctor</Badge>;
      case "PATIENT": return <Badge variant="neutral">Patient</Badge>;
      case "PHARMACIST": return <Badge variant="success">Pharmacist</Badge>;
      case "LAB_OFFICER": return <Badge variant="purple">Lab Technician</Badge>;
      case "INSURANCE_OFFICER": return <Badge variant="warning">Insurance Officer</Badge>;
      case "ADMIN": return <Badge variant="info">Hospital Admin</Badge>;
      case "SUPER_ADMIN": return <Badge variant="danger">Super Admin</Badge>;
      default: return <Badge variant="neutral">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active": return <Badge variant="success" dot size="sm">Active</Badge>;
      case "Pending approval": return <Badge variant="warning" dot size="sm">Pending approval</Badge>;
      case "Suspended": return <Badge variant="danger" dot size="sm">Suspended</Badge>;
      default: return <Badge variant="neutral" dot size="sm">{status}</Badge>;
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => formatStatus(u.accountStatus) === "Active").length;
  const pendingUsers = users.filter(u => formatStatus(u.accountStatus) === "Pending approval").length;
  const suspendedUsers = users.filter(u => formatStatus(u.accountStatus) === "Suspended").length;
  const activePercentage = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) + "%" : "0%";

  return (
    <>
      <div className="flex flex-col gap-6 w-full p-4 sm:p-6 lg:p-8">

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={totalUsers.toString()}
          icon={<Users size={24} />}
          iconBgColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
          trend={{ value: "Live", isPositive: true, label: "from database" }}
        />
        <StatCard
          title="Active Accounts"
          value={activeUsers.toString()}
          icon={<CheckCircle size={24} />}
          iconBgColor="bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
          subtitle={`${activePercentage} of total base`}
        />
        <StatCard
          title="Pending Approval"
          value={pendingUsers.toString()}
          icon={<Clock size={24} />}
          iconBgColor="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
          subtitle="Needs registration review"
        />
        <StatCard
          title="Suspended"
          value={suspendedUsers.toString()}
          icon={<Ban size={24} />}
          iconBgColor="bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
          subtitle="Flagged for security review"
        />
      </div>

      <div className="flex justify-end mb-2">
        <Link href="/super-admin/users/add">
          <Button variant="primary" leftIcon={<UserPlus size={16} />}>
            Add user
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => {
              if (tab.href) {
                router.push(tab.href);
              } else {
                setActiveTab(tab.name);
              }
            }}
            className={`pb-4 text-sm font-semibold transition-colors relative ${
              activeTab === tab.name
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {tab.name}
            <span className="ml-2 text-xs font-medium text-slate-400">
              {tab.count}
            </span>
            {activeTab === tab.name && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="w-full md:w-96">
          <Input 
            placeholder="Search by name, email or user ID..." 
            leftIcon={<Search size={16} />}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select 
            className="h-10 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-[#0A2540] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 flex-1 md:w-40"
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
          >
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select 
            className="h-10 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-[#0A2540] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 flex-1 md:w-40"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select 
            className="h-10 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-[#0A2540] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 flex-1 md:w-48"
            value={filterInstitution}
            onChange={(e) => { setFilterInstitution(e.target.value); setCurrentPage(1); }}
          >
            <option>All institutions</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="[&>div]:min-h-[320px]">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">ON</TableHead>
            <TableHead>USER</TableHead>
            <TableHead>USER ID</TableHead>
            <TableHead>ROLE</TableHead>
            <TableHead>INSTITUTION</TableHead>
            <TableHead>STATUS</TableHead>
            <TableHead>REGISTERED</TableHead>
            <TableHead>LAST LOGIN</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">Loading users...</TableCell>
            </TableRow>
          ) : filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-24 text-slate-500">No users found.</TableCell>
            </TableRow>
          ) : paginatedUsers.map((user, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className={`w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-sm mx-auto`}>
                  {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : "HB"}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-bold text-[#0A2540] dark:text-white">{user.fullName}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{user.id ? user.id.substring(0, 8) : "N/A"}</span>
              </TableCell>
              <TableCell>
                {getRoleBadge(user.role)}
              </TableCell>
              <TableCell>
                <span className="text-[#0A2540] dark:text-slate-300 font-medium">—</span>
              </TableCell>
              <TableCell>
                {getStatusBadge(formatStatus(user.accountStatus))}
              </TableCell>
              <TableCell>
                <span className="text-[#0A2540] dark:text-slate-300 font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Unknown"}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-[#0A2540] dark:text-slate-300 font-medium">Unknown</span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <button 
                    onClick={() => setViewingUser(user)}
                    className="p-1.5 text-slate-400 hover:text-[#0052CC] hover:bg-[#EBF3FF] rounded-lg transition-colors"
                  >
                    <Eye size={16} />
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setDropdownOpenId(dropdownOpenId === user.id ? null : user.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {dropdownOpenId === user.id && (
                      <div className="absolute right-0 top-full mt-1 w-40 flex flex-col bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-10 overflow-hidden">
                        <button 
                          onClick={() => handleUpdateStatus(user.id, "Suspended")}
                          disabled={formatStatus(user.accountStatus) === "Suspended" || formatStatus(user.accountStatus) === "Pending approval"}
                          className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                            formatStatus(user.accountStatus) === "Suspended" || formatStatus(user.accountStatus) === "Pending approval"
                              ? "text-slate-300 cursor-not-allowed"
                              : "text-amber-600 hover:bg-amber-50"
                          }`}
                        >
                          Suspend User
                        </button>
                        
                        <button 
                          onClick={() => handleUpdateStatus(user.id, "Active")}
                          disabled={formatStatus(user.accountStatus) !== "Suspended"}
                          className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                            formatStatus(user.accountStatus) !== "Suspended"
                              ? "text-slate-300 cursor-not-allowed"
                              : "text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          Reactivate User
                        </button>

                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium transition-colors"
                        >
                          Delete User
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
      
      <TablePagination 
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={filteredUsers.length}
        pageSize={itemsPerPage}
        onPageChange={setCurrentPage}
      />
      </div>

      {/* User Details Slide-out Drawer */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" 
            onClick={() => setViewingUser(null)} 
          />
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-[#0A2540]">User Details</h2>
              <button 
                onClick={() => setViewingUser(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Drawer Body (Form) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold text-xl flex items-center justify-center shadow-sm">
                  {viewingUser.fullName ? viewingUser.fullName.substring(0, 2).toUpperCase() : "HB"}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-[#0A2540]">{viewingUser.fullName}</h3>
                  {getRoleBadge(viewingUser.role)}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <Input defaultValue={viewingUser.email} className="h-11 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">User ID</label>
                  <Input defaultValue={viewingUser.id} disabled className="h-11 bg-slate-100 text-slate-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Account Status</label>
                  <div className="mt-1">{getStatusBadge(formatStatus(viewingUser.accountStatus))}</div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Registered On</label>
                  <p className="text-sm font-medium text-[#0A2540]">
                    {viewingUser.createdAt ? new Date(viewingUser.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Unknown"}
                  </p>
                </div>
              </div>
            </div>

            {/* Drawer Footer (Actions) */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex gap-3">
              {formatStatus(viewingUser.accountStatus) === "Pending approval" ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => handleUpdateStatus(viewingUser.id, "Rejected")}
                    className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 shadow-sm font-bold"
                  >
                    Reject
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => handleUpdateStatus(viewingUser.id, "Active")}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-sm font-bold"
                  >
                    Approve
                  </Button>
                </>
              ) : (
                <Button 
                  variant="primary" 
                  onClick={() => setViewingUser(null)}
                  className="w-full bg-[#0052CC] hover:bg-blue-700 font-bold shadow-sm"
                >
                  Close & Save Changes
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
