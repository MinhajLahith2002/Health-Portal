'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { branchService, Branch, BranchInput } from '../../../services/branchService';
import {
  Landmark,
  Building2,
  CheckCircle2,
  Bed,
  ShieldCheck,
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
  UserCheck,
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  Building
} from 'lucide-react';

export default function BranchManagementPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'ACTIVE' | 'INACTIVE'>('All');
  const [sortBy, setSortBy] = useState<'branchCode' | 'branchName' | 'city' | 'totalBeds'>('branchCode');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Active Row Menu Dropdown
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [viewingBranch, setViewingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<BranchInput>({
    branchCode: '',
    branchName: '',
    hospitalId: 'HOSP-001',
    address: '',
    city: '',
    phone: '',
    email: '',
    status: 'ACTIVE',
    totalBeds: 50,
    emergencyReady: true,
  });

  // Fetch branches from backend API
  const loadBranches = useCallback(async () => {
    try {
      const data = await branchService.getAllBranches();
      if (data) setBranches(data);
    } catch (err) {
      console.warn('Backend API disconnected or loading:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  // Unique Cities for City Filter
  const uniqueCities = useMemo(() => {
    const cities = new Set<string>();
    branches.forEach((b) => {
      if (b.city && b.city.trim()) cities.add(b.city.trim());
    });
    return Array.from(cities).sort();
  }, [branches]);

  // Calculate Real-time Statistics
  const stats = useMemo(() => {
    const totalBranches = branches.length;
    const activeBranches = branches.filter((b) => b.status === 'ACTIVE').length;
    const totalBeds = branches.reduce((acc, curr) => acc + (curr.totalBeds || 0), 0);
    const emergencyReadyBranches = branches.filter((b) => b.emergencyReady).length;

    return {
      totalBranches,
      activeBranches,
      totalBeds,
      emergencyReadyBranches,
    };
  }, [branches]);

  // Filter and Sort Branches
  const filteredBranches = useMemo(() => {
    return branches
      .filter((branch) => {
        const matchesSearch =
          (branch.branchName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (branch.branchCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (branch.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (branch.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (branch.phone || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All' ? true : branch.status === statusFilter;
        const matchesCity = cityFilter === 'All' ? true : branch.city === cityFilter;

        return matchesSearch && matchesStatus && matchesCity;
      })
      .sort((a, b) => {
        let valA: any = a[sortBy];
        let valB: any = b[sortBy];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB || '').toLowerCase();
        } else if (typeof valA === 'number') {
          valA = valA || 0;
          valB = valB || 0;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [branches, searchTerm, statusFilter, cityFilter, sortBy, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage) || 1;
  const paginatedBranches = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBranches.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBranches, currentPage]);

  // Handle Open Add Modal
  const handleOpenAddModal = () => {
    setFormData({
      branchCode: `BR-${String(branches.length + 1).padStart(3, '0')}`,
      branchName: '',
      hospitalId: 'HOSP-001',
      address: '',
      city: '',
      phone: '',
      email: '',
      status: 'ACTIVE',
      totalBeds: 50,
      emergencyReady: true,
    });
    setIsAddModalOpen(true);
  };

  // Handle Open Edit Modal
  const handleOpenEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      branchCode: branch.branchCode || '',
      branchName: branch.branchName || '',
      hospitalId: branch.hospitalId || 'HOSP-001',
      address: branch.address || '',
      city: branch.city || '',
      phone: branch.phone || '',
      email: branch.email || '',
      status: branch.status || 'ACTIVE',
      totalBeds: branch.totalBeds ?? 0,
      emergencyReady: branch.emergencyReady ?? false,
    });
    setActiveMenuId(null);
  };

  // Handle Add / Edit Submit
  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.branchName.trim()) {
      toast.error('Please enter a branch name.');
      return;
    }

    try {
      if (editingBranch) {
        const updated = await branchService.updateBranch(editingBranch.id, formData);
        setBranches((prev) =>
          prev.map((b) => (b.id === editingBranch.id ? (updated || { ...b, ...formData }) : b))
        );
        toast.success('Branch updated successfully!');
        setEditingBranch(null);
      } else {
        const created = await branchService.createBranch(formData);
        setBranches((prev) => [created || { id: `local-${Date.now()}`, ...formData } as Branch, ...prev]);
        toast.success('Branch created successfully!');
        setIsAddModalOpen(false);
      }
    } catch (err: any) {
      console.warn('API save error, updating local state:', err);
      if (editingBranch) {
        setBranches((prev) =>
          prev.map((b) => (b.id === editingBranch.id ? ({ ...b, ...formData } as Branch) : b))
        );
        toast.success('Branch updated locally.');
        setEditingBranch(null);
      } else {
        const newBranch: Branch = {
          id: `local-${Date.now()}`,
          branchCode: formData.branchCode || `BR-${String(branches.length + 1).padStart(3, '0')}`,
          branchName: formData.branchName,
          hospitalId: formData.hospitalId || 'HOSP-001',
          address: formData.address || '',
          city: formData.city || '',
          phone: formData.phone || '',
          email: formData.email || '',
          status: formData.status || 'ACTIVE',
          totalBeds: Number(formData.totalBeds) || 0,
          emergencyReady: Boolean(formData.emergencyReady),
        };
        setBranches((prev) => [newBranch, ...prev]);
        toast.success('Branch created locally.');
        setIsAddModalOpen(false);
      }
    }
  };

  // Toggle Status
  const handleToggleStatus = async (id: string) => {
    const target = branches.find((b) => b.id === id);
    if (!target) return;
    const nextStatus: 'ACTIVE' | 'INACTIVE' = target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      const updated = await branchService.updateBranch(id, { status: nextStatus });
      setBranches((prev) =>
        prev.map((b) => (b.id === id ? (updated || { ...b, status: nextStatus }) : b))
      );
      toast.success(`Branch status changed to ${nextStatus}.`);
    } catch (err) {
      console.warn('API status toggle error, updating local state:', err);
      setBranches((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: nextStatus } : b))
      );
      toast.success(`Branch status changed to ${nextStatus}.`);
    }
    setActiveMenuId(null);
  };

  // Delete Branch
  const handleDeleteBranch = async () => {
    if (deletingBranch) {
      try {
        await branchService.deleteBranch(deletingBranch.id);
      } catch (err) {
        console.warn('API delete error, updating local state:', err);
      }
      setBranches((prev) => prev.filter((b) => b.id !== deletingBranch.id));
      toast.success('Branch deleted successfully.');
      setDeletingBranch(null);
      setActiveMenuId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Title Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Manage Branches</h1>
        <p className="text-slate-500 text-sm mt-1">Overview and administration of all hospital branch locations, facilities, and bed capacities.</p>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-full">
        {/* Card 1: Total Branches */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 mb-0.5 sm:mb-1">Total Branches</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.totalBranches}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Card 2: Active Branches */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 mb-0.5 sm:mb-1">Active Branches</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.activeBranches}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Card 3: Total Bed Capacity */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 mb-0.5 sm:mb-1">Total Bed Capacity</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.totalBeds.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0">
            <Bed className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Card 4: Emergency Ready */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 mb-0.5 sm:mb-1">Emergency Ready</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.emergencyReadyBranches}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Action Controls & Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Search Filter */}
          <div className="relative flex-1 sm:flex-initial sm:w-56 min-w-0">
            <input
              type="text"
              placeholder="Search branch..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-2 bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-slate-700 text-[11px] sm:text-xs font-semibold rounded-lg border border-slate-200 outline-none focus:border-blue-500 transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* City Filter */}
          <div className="relative flex-1 sm:flex-initial min-w-0">
            <select
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full appearance-none pl-7 sm:pl-9 pr-6 sm:pr-8 py-2 bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-[11px] sm:text-xs font-semibold rounded-lg border border-slate-200 cursor-pointer outline-none transition-colors truncate"
            >
              <option value="All">City: All Locations</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  City: {city}
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
              <option value="ACTIVE">Status: Active</option>
              <option value="INACTIVE">Status: Inactive</option>
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
              <option value="branchCode">Sort: Code</option>
              <option value="branchName">Sort: Name</option>
              <option value="city">Sort: City</option>
              <option value="totalBeds">Sort: Beds</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Add Branch Primary Button */}
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Branch
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
                <th scope="col" className="py-3.5 px-6">Code</th>
                <th scope="col" className="py-3.5 px-6">Branch Name</th>
                <th scope="col" className="py-3.5 px-6">City / Location</th>
                <th scope="col" className="py-3.5 px-6 text-center">Beds</th>
                <th scope="col" className="py-3.5 px-6 text-center">Emergency</th>
                <th scope="col" className="py-3.5 px-6">Contact</th>
                <th scope="col" className="py-3.5 px-6 text-center">Status</th>
                <th scope="col" className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedBranches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-slate-400">
                    No branches found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedBranches.map((branch, index) => {
                  const isNearBottom = index >= Math.max(0, paginatedBranches.length - 2);
                  return (
                  <tr key={branch.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-500">{branch.branchCode}</td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm">{branch.branchName}</div>
                      {branch.address && <div className="text-[11px] text-slate-400 truncate max-w-xs">{branch.address}</div>}
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-medium">{branch.city || 'N/A'}</td>
                    <td className="py-4 px-6 text-center font-medium text-slate-700">{branch.totalBeds ?? 0}</td>
                    <td className="py-4 px-6 text-center">
                      {branch.emergencyReady ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> 24/7 ER
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <div>{branch.phone || '-'}</div>
                      {branch.email && <div className="text-[11px] text-slate-400 truncate max-w-xs">{branch.email}</div>}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-semibold ${
                          branch.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/70'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {branch.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right relative">
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === branch.id ? null : branch.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Action Menu Dropdown */}
                      {activeMenuId === branch.id && (
                        <div className={`absolute right-6 ${isNearBottom ? 'bottom-10 origin-bottom-right' : 'top-12 origin-top-right'} z-30 w-50 bg-white rounded-xl shadow-2xl border border-slate-100 py-1 text-left animate-in fade-in zoom-in-95 duration-100`}>
                          <button
                            type="button"
                            onClick={() => {
                              setViewingBranch(branch);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(branch)}
                            className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-400" />
                            Edit Branch
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(branch.id)}
                            className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            Toggle Status ({branch.status === 'ACTIVE' ? 'Inactive' : 'Active'})
                          </button>
                          <div className="my-1 border-t border-slate-100"></div>
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingBranch(branch);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            Delete Branch
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
            Showing {filteredBranches.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredBranches.length)} of {filteredBranches.length} entries
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:hover:text-slate-500 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
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
              className="p-1.5 text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:hover:text-slate-500 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL: Add Branch --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Add New Branch</h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Branch Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. BR-001"
                    value={formData.branchCode}
                    onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Branch Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Colombo Central Branch"
                    value={formData.branchName}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">City / Region *</label>
                  <input
                    type="text"
                    placeholder="e.g. Colombo"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +94-11-2345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="branch@healthbridge.lk"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Total Bed Capacity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalBeds}
                    onChange={(e) => setFormData({ ...formData, totalBeds: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emergencyReady}
                      onChange={(e) => setFormData({ ...formData, emergencyReady: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
                    />
                    <span className="text-slate-700 font-semibold">24/7 ER Ready</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Full Street Address</label>
                <textarea
                  rows={2}
                  placeholder="Street address details..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm cursor-pointer"
                >
                  Create Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Edit Branch --- */}
      {editingBranch && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Edit Branch ({editingBranch.branchCode})</h2>
              <button
                type="button"
                onClick={() => setEditingBranch(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Branch Code *</label>
                  <input
                    type="text"
                    value={formData.branchCode}
                    onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Branch Name *</label>
                  <input
                    type="text"
                    value={formData.branchName}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">City / Region *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Total Bed Capacity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalBeds}
                    onChange={(e) => setFormData({ ...formData, totalBeds: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emergencyReady}
                      onChange={(e) => setFormData({ ...formData, emergencyReady: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
                    />
                    <span className="text-slate-700 font-semibold">24/7 ER Ready</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Full Street Address</label>
                <textarea
                  rows={2}
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBranch(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: View Details --- */}
      {viewingBranch && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">{viewingBranch.branchName} ({viewingBranch.branchCode})</h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingBranch(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-500 font-medium">Operational Status</span>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                    viewingBranch.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {viewingBranch.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 font-medium">Branch Code</p>
                  <p className="text-slate-800 font-semibold text-sm mt-0.5">{viewingBranch.branchCode}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">City / Region</p>
                  <p className="text-slate-800 font-semibold text-sm mt-0.5">{viewingBranch.city || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 font-medium">Total Beds</p>
                  <p className="text-slate-800 font-semibold text-sm mt-0.5">{viewingBranch.totalBeds ?? 0}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Emergency Facilities</p>
                  <p className="text-slate-800 font-semibold text-sm mt-0.5">
                    {viewingBranch.emergencyReady ? '24/7 ER Ready' : 'Standard'}
                  </p>
                </div>
              </div>

              {viewingBranch.phone && (
                <div>
                  <p className="text-slate-400 font-medium">Contact Phone</p>
                  <p className="text-slate-700 mt-0.5">{viewingBranch.phone}</p>
                </div>
              )}

              {viewingBranch.email && (
                <div>
                  <p className="text-slate-400 font-medium">Email Address</p>
                  <p className="text-slate-700 mt-0.5">{viewingBranch.email}</p>
                </div>
              )}

              {viewingBranch.address && (
                <div>
                  <p className="text-slate-400 font-medium">Full Address</p>
                  <p className="text-slate-600 leading-relaxed mt-0.5">{viewingBranch.address}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingBranch(null)}
                className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Delete Confirmation --- */}
      {deletingBranch && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">Delete Hospital Branch</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-slate-800">"{deletingBranch.branchName}"</span> ({deletingBranch.branchCode})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeletingBranch(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBranch}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors cursor-pointer"
              >
                Delete Branch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
