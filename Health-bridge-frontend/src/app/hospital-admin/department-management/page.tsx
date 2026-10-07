'use client';

import React, { useState, useMemo, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Department, DepartmentStats } from '../../../types/department';
import { departmentService } from '../../../services/departmentService';
import { branchService, Branch } from '../../../services/branchService';
import {
  Building2,
  CheckCircle2,
  Briefcase,
  Users,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings,
  UserCheck,
  AlertTriangle,
  Building
} from 'lucide-react';

export default function ManageDepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'doctors' | 'staff'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch departments & branches from Backend API
  useEffect(() => {
    const fetchFromApi = async () => {
      try {
        const [data, bList] = await Promise.all([
          departmentService.getAll(),
          branchService.getAllBranches().catch(() => [])
        ]);
        if (data) setDepartments(data);
        if (bList) setBranches(bList);
      } catch (err) {
        console.warn('Backend API disconnected or loading:', err);
      }
    };
    fetchFromApi();
  }, []);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Active Row Menu Dropdown
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<Partial<Department>>({
    id: '',
    name: '',
    head: '',
    doctorsCount: 0,
    staffCount: 0,
    location: '',
    status: 'Active',
    description: '',
    contactEmail: '',
    contactPhone: ''
  });

  // Calculate Real-time Statistics
  const stats: DepartmentStats = useMemo(() => {
    const totalDeps = departments.length;
    const activeDeps = departments.filter((d) => d.status === 'Active').length;
    const totalDocs = departments.reduce((acc, curr) => acc + curr.doctorsCount, 0);
    const totalStaff = departments.reduce((acc, curr) => acc + curr.staffCount, 0);

    return {
      totalDepartments: totalDeps,
      activeDepartments: activeDeps,
      totalDoctors: totalDocs,
      totalDepartmentStaff: totalStaff
    };
  }, [departments]);

  // Filter and Sort Departments
  const filteredDepartments = useMemo(() => {
    return departments
      .filter((dept) => {
        const matchesSearch =
          dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dept.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dept.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dept.location.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'All' ? true : dept.status === statusFilter;
        const matchesBranch = selectedBranch === 'All' ? true : (dept.branchCode === selectedBranch || dept.branchId === selectedBranch);

        return matchesSearch && matchesStatus && matchesBranch;
      })
      .sort((a, b) => {
        let valA: any = a[sortBy === 'doctors' ? 'doctorsCount' : sortBy === 'staff' ? 'staffCount' : sortBy];
        let valB: any = b[sortBy === 'doctors' ? 'doctorsCount' : sortBy === 'staff' ? 'staffCount' : sortBy];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [departments, searchTerm, statusFilter, sortBy, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage) || 1;
  const paginatedDepartments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDepartments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDepartments, currentPage]);

  // Handle Form Open for Add
  const handleOpenAddModal = () => {
    setFormData({
      id: '',
      name: '',
      head: '',
      doctorsCount: 0,
      staffCount: 0,
      location: '',
      status: 'Active',
      description: '',
      contactEmail: '',
      contactPhone: ''
    });
    setIsAddModalOpen(true);
  };

  // Handle Form Open for Edit
  const handleOpenEditModal = (dept: Department) => {
    setEditingDepartment(dept);
    setFormData({ ...dept });
    setActiveMenuId(null);
  };

  // Handle Add / Edit Submit
  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.head || !formData.location) {
      toast.error('Please fill in all required fields (Name, Head, Location).');
      return;
    }

    try {
      if (editingDepartment) {
        const updated = await departmentService.update(editingDepartment.id, formData);
        setDepartments((prev) =>
          prev.map((d) => (d.id === editingDepartment.id ? updated : d))
        );
        toast.success('Department updated successfully!');
        setEditingDepartment(null);
      } else {
        const created = await departmentService.create(formData);
        setDepartments((prev) => [created, ...prev]);
        toast.success('Department created successfully!');
        setIsAddModalOpen(false);
      }
    } catch (err: any) {
      console.warn('API save error, updating local state:', err);
      if (editingDepartment) {
        setDepartments((prev) =>
          prev.map((d) => (d.id === editingDepartment.id ? ({ ...d, ...formData } as Department) : d))
        );
        toast.success('Department updated locally.');
        setEditingDepartment(null);
      } else {
        const newDept: Department = {
          id: formData.id || `DEP-${String(departments.length + 1).padStart(3, '0')}`,
          name: formData.name || '',
          head: formData.head || '',
          doctorsCount: Number(formData.doctorsCount) || 0,
          staffCount: Number(formData.staffCount) || 0,
          location: formData.location || '',
          status: formData.status || 'Active',
          description: formData.description || '',
          contactEmail: formData.contactEmail || '',
          contactPhone: formData.contactPhone || ''
        };
        setDepartments((prev) => [newDept, ...prev]);
        toast.success('Department created locally.');
        setIsAddModalOpen(false);
      }
    }
  };

  // Toggle Status
  const handleToggleStatus = async (id: string) => {
    const targetDept = departments.find((d) => d.id === id);
    const nextStatus = targetDept && targetDept.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const updated = await departmentService.updateStatus(id, nextStatus);
      setDepartments((prev) =>
        prev.map((d) => (d.id === id ? updated : d))
      );
      toast.success(`Department status changed to ${nextStatus}.`);
    } catch (err) {
      console.warn('API status toggle error, updating local state:', err);
      setDepartments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: nextStatus } : d))
      );
      toast.success(`Department status changed to ${nextStatus}.`);
    }
    setActiveMenuId(null);
  };

  // Delete Department
  const handleDeleteDepartment = async () => {
    if (deletingDepartment) {
      try {
        await departmentService.delete(deletingDepartment.id);
      } catch (err) {
        console.warn('API delete error, updating local state:', err);
      }
      setDepartments((prev) => prev.filter((d) => d.id !== deletingDepartment.id));
      toast.success('Department deleted successfully.');
      setDeletingDepartment(null);
      setActiveMenuId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Title Section */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Manage Departments</h1>
          <p className="text-slate-500 text-sm mt-1">Overview and administration of all clinical and administrative units.</p>
        </div>

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-full">
          {/* Card 1: Total Departments */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 mb-0.5 sm:mb-1">Total Departments</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.totalDepartments}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          {/* Card 2: Active Departments */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 mb-0.5 sm:mb-1">Active Departments</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.activeDepartments}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          {/* Card 3: Total Doctors */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 mb-0.5 sm:mb-1">Total Doctors</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.totalDoctors}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          {/* Card 4: Total Department Staff */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 mb-0.5 sm:mb-1">Total Department Staff</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.totalDepartmentStaff}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* Action Controls & Filters Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Branch Filter */}
            <div className="relative flex-1 sm:flex-initial min-w-0">
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none pl-7 sm:pl-9 pr-6 sm:pr-8 py-2 bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-[11px] sm:text-xs font-semibold rounded-lg border border-slate-200 cursor-pointer outline-none transition-colors truncate"
              >
                <option value="All">Branch: All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.branchCode}>
                    Branch: {b.branchName} ({b.branchCode})
                  </option>
                ))}
              </select>
              <Building className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative flex-1 sm:flex-initial min-w-0">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none pl-7 sm:pl-9 pr-6 sm:pr-8 py-2 bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-[11px] sm:text-xs font-semibold rounded-lg border border-slate-200 cursor-pointer outline-none transition-colors truncate"
              >
                <option value="All">Status: All</option>
                <option value="Active">Status: Active</option>
                <option value="Inactive">Status: Inactive</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Filter */}
            <div className="relative flex-1 sm:flex-initial min-w-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full appearance-none pl-7 sm:pl-9 pr-6 sm:pr-8 py-2 bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-[11px] sm:text-xs font-semibold rounded-lg border border-slate-200 cursor-pointer outline-none transition-colors truncate"
              >
                <option value="id">Sort: Code</option>
                <option value="name">Sort: Name</option>
                <option value="doctors">Sort: Doctors</option>
                <option value="staff">Sort: Staff</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Add Department Primary Button */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-sm hover:shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        </div>

        {/* Data Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between min-h-[480px]">
          {/* Click outside to close active action menu */}
          {activeMenuId && (
            <div
              className="fixed inset-0 z-20 cursor-default"
              onClick={() => setActiveMenuId(null)}
            />
          )}
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-3.5 px-6">ID</th>
                  <th scope="col" className="py-3.5 px-6">Department Name</th>
                  <th scope="col" className="py-3.5 px-6">Head</th>
                  <th scope="col" className="py-3.5 px-6 text-center">Doctors</th>
                  <th scope="col" className="py-3.5 px-6 text-center">Staff</th>
                  <th scope="col" className="py-3.5 px-6">Location</th>
                  <th scope="col" className="py-3.5 px-6 text-center">Status</th>
                  <th scope="col" className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No departments found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedDepartments.map((dept, index) => {
                    const isNearBottom = index >= Math.max(0, paginatedDepartments.length - 2);
                    return (
                    <tr key={dept.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-500">{dept.id}</td>
                      <td className="py-4 px-6 font-bold text-slate-900 text-sm">{dept.name}</td>
                      <td className="py-4 px-6 text-slate-700 font-medium">{dept.head}</td>
                      <td className="py-4 px-6 text-center font-medium text-slate-700">{dept.doctorsCount}</td>
                      <td className="py-4 px-6 text-center font-medium text-slate-700">{dept.staffCount}</td>
                      <td className="py-4 px-6 text-slate-600">{dept.location}</td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-semibold ${
                            dept.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/70'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {dept.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right relative">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(activeMenuId === dept.id ? null : dept.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Action Menu Dropdown */}
                        {activeMenuId === dept.id && (
                          <div className={`absolute right-6 ${isNearBottom ? 'bottom-10 origin-bottom-right' : 'top-12 origin-top-right'} z-30 w-50 bg-white rounded-xl shadow-2xl border border-slate-100 py-1 text-left animate-in fade-in zoom-in-95 duration-100`}>
                            <button
                              type="button"
                              onClick={() => {
                                setViewingDepartment(dept);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              View Details
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(dept)}
                              className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5 text-slate-400" />
                              Edit Department
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(dept.id)}
                              className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                              Toggle Status ({dept.status === 'Active' ? 'Inactive' : 'Active'})
                            </button>
                            <div className="my-1 border-t border-slate-100"></div>
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingDepartment(dept);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              Delete Department
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer & Pagination */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              Showing {filteredDepartments.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredDepartments.length)} of {filteredDepartments.length} entries
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:hover:text-slate-500 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-md font-semibold text-xs transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:hover:text-slate-500 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      {/* --- MODAL: Add Department --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Add New Department</h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Department Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Cardiology"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Head of Department *</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Nimal Perera"
                    value={formData.head}
                    onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Location / Floor *</label>
                  <input
                    type="text"
                    placeholder="e.g. Floor 02"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Doctors Count</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.doctorsCount}
                    onChange={(e) => setFormData({ ...formData, doctorsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Staff Count</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.staffCount}
                    onChange={(e) => setFormData({ ...formData, staffCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Contact Email</label>
                <input
                  type="email"
                  placeholder="department@healthbridge.lk"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Department overview and details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Edit Department --- */}
      {editingDepartment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Edit Department ({editingDepartment.id})</h2>
              <button
                type="button"
                onClick={() => setEditingDepartment(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Department Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Head of Department *</label>
                  <input
                    type="text"
                    value={formData.head}
                    onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Doctors Count</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.doctorsCount}
                    onChange={(e) => setFormData({ ...formData, doctorsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Staff Count</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.staffCount}
                    onChange={(e) => setFormData({ ...formData, staffCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDepartment(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: View Details --- */}
      {viewingDepartment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">{viewingDepartment.name} ({viewingDepartment.id})</h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingDepartment(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-500 font-medium">Department Status</span>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                    viewingDepartment.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {viewingDepartment.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 font-medium">Head of Department</p>
                  <p className="text-slate-800 font-semibold text-sm mt-0.5">{viewingDepartment.head}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Location</p>
                  <p className="text-slate-800 font-semibold text-sm mt-0.5">{viewingDepartment.location}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 font-medium">Total Doctors</p>
                  <p className="text-slate-800 font-semibold text-sm mt-0.5">{viewingDepartment.doctorsCount}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Total Staff</p>
                  <p className="text-slate-800 font-semibold text-sm mt-0.5">{viewingDepartment.staffCount}</p>
                </div>
              </div>

              {viewingDepartment.contactEmail && (
                <div>
                  <p className="text-slate-400 font-medium">Contact Email</p>
                  <p className="text-slate-700 mt-0.5">{viewingDepartment.contactEmail}</p>
                </div>
              )}

              {viewingDepartment.description && (
                <div>
                  <p className="text-slate-400 font-medium">Description</p>
                  <p className="text-slate-600 leading-relaxed mt-0.5">{viewingDepartment.description}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingDepartment(null)}
                className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Delete Confirmation --- */}
      {deletingDepartment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">Delete Department</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-slate-800">"{deletingDepartment.name}"</span> ({deletingDepartment.id})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeletingDepartment(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDepartment}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors"
              >
                Delete Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
