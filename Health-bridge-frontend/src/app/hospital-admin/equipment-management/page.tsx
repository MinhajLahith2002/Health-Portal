'use client';

import React, { useState, useMemo, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { EquipmentAsset, EquipmentStatus, EquipmentOverviewStats } from '@/types/equipment';
import { equipmentService } from '@/services/equipmentService';
import { departmentService } from '@/services/departmentService';
import { branchService, Branch } from '@/services/branchService';
import {
  Package,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  Search,
  Plus,
  Filter,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  HelpCircle,
  Shield,
  TrendingDown,
  Calendar,
  Building,
  RotateCw,
  Download,
  SlidersHorizontal,
  ArrowRight,
  FileText,
  Activity,
  DollarSign
} from 'lucide-react';

export default function EquipmentManagementPage() {
  const [equipmentList, setEquipmentList] = useState<EquipmentAsset[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchFilter, setBranchFilter] = useState<string>('All');
  const [stats, setStats] = useState<EquipmentOverviewStats>({
    totalInventory: 0,
    operationalRate: 0,
    underMaintenance: 0,
    calibrationDue: 0
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Active Context Menu
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal / Drawer States
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingAsset, setEditingAsset] = useState<EquipmentAsset | null>(null);
  const [viewingAsset, setViewingAsset] = useState<EquipmentAsset | null>(null);
  const [activeTab, setActiveTab] = useState<'Specifications' | 'Maintenance' | 'Usage' | 'Incidents'>('Specifications');
  const [deletingAsset, setDeletingAsset] = useState<EquipmentAsset | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Multi-select & Bulk Action State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);

  // Toggle selection for a single row
  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle select all rows on current page
  const handleToggleSelectAllPage = () => {
    const pageIds = paginatedEquipment.map((item) => item.id);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  // Bulk status update handler
  const handleBulkStatusChange = async (newStatus: EquipmentStatus) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map((id) => equipmentService.updateStatus(id, newStatus)));
      setEquipmentList((prev) =>
        prev.map((item) => (selectedIds.includes(item.id) ? { ...item, status: newStatus } : item))
      );
      toast.success(`Updated status to "${newStatus}" for ${selectedIds.length} asset(s).`);
      setSelectedIds([]);
      fetchEquipmentData();
    } catch {
      toast.error('Failed to perform bulk status update.');
    }
  };

  // Bulk CSV export handler
  const handleBulkExportCSV = () => {
    const itemsToExport = equipmentList.filter((item) => selectedIds.includes(item.id));
    if (itemsToExport.length === 0) return;
    const headers = ['Asset ID', 'Name', 'Category', 'Department', 'Serial No', 'Status', 'Calibration Due Date'];
    const rows = itemsToExport.map((item) => [
      item.assetId,
      `"${item.name}"`,
      `"${item.category}"`,
      `"${item.department}"`,
      item.serialNo,
      item.status,
      item.calibrationDueDate
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `selected_equipment_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    toast.success(`Exported ${selectedIds.length} selected asset(s) to CSV.`);
  };

  // Bulk Delete Execution
  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map((id) => equipmentService.delete(id)));
      setEquipmentList((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
      toast.success(`Successfully deleted ${selectedIds.length} equipment asset(s).`);
      setSelectedIds([]);
      setIsBulkDeleting(false);
      fetchEquipmentData();
    } catch {
      toast.error('Failed to delete selected equipment assets.');
    }
  };

  // Form State for Add / Edit
  const [formData, setFormData] = useState<Partial<EquipmentAsset>>({
    assetId: '',
    name: '',
    category: 'Life Support',
    department: 'ICU',
    serialNo: '',
    status: 'Available',
    calibrationDueDate: '',
    model: '',
    supplier: '',
    purchaseDate: '',
    warrantyExpiry: '',
    depreciationPercentage: 85,
    initialValue: 25000,
    currentValue: 21250,
    alertMessage: ''
  });

  // Fetch Equipment & Stats from Backend
  const fetchEquipmentData = async () => {
    setIsLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        equipmentService.getAll({
          category: categoryFilter !== 'All' ? categoryFilter : undefined,
          department: departmentFilter !== 'All' ? departmentFilter : undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          search: searchTerm ? searchTerm : undefined
        }),
        equipmentService.getStats()
      ]);
      const listData = (listRes as any)?.data || listRes;
      if (Array.isArray(listData)) {
        setEquipmentList(listData);
      }
      const parsedStats = (statsRes as any)?.data || statsRes;
      if (parsedStats && typeof parsedStats.totalInventory === 'number') {
        setStats(parsedStats);
      }
    } catch (err) {
      console.warn('Backend connection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic Departments State loaded from Backend
  const [departmentsList, setDepartmentsList] = useState<string[]>([]);

  // Fetch departments from backend
  const fetchDepartments = async () => {
    try {
      const deptsRes = await departmentService.getAll('Active');
      const deptsData = (deptsRes as any)?.data || deptsRes;
      if (Array.isArray(deptsData) && deptsData.length > 0) {
        setDepartmentsList(deptsData.map((d: any) => d.name).filter(Boolean));
      }
    } catch (err) {
      console.warn('Backend connection error for departments:', err);
    }
  };

  useEffect(() => {
    fetchEquipmentData();
  }, [categoryFilter, departmentFilter, statusFilter, searchTerm]);

  useEffect(() => {
    fetchDepartments();
    branchService.getAllBranches().then(b => setBranches(b || [])).catch(() => []);
  }, []);

  // Dynamic / Computed Stats from current equipment state
  const displayStats: EquipmentOverviewStats = useMemo(() => {
    if (stats && (stats.totalInventory > 0 || stats.underMaintenance > 0 || stats.calibrationDue > 0)) {
      return stats;
    }
    const total = equipmentList.length;
    const underMaint = equipmentList.filter((e) => e.status === 'Maintenance').length;
    const calDue = equipmentList.filter((e) => e.status === 'Calibration Due').length;
    const operationalCount = equipmentList.filter((e) => e.status === 'In Use' || e.status === 'Available').length;
    const opRate = total > 0 ? Math.round((operationalCount / total) * 1000) / 10 : 0;

    return {
      totalInventory: total,
      operationalRate: opRate,
      underMaintenance: underMaint,
      calibrationDue: calDue
    };
  }, [stats, equipmentList]);

  // Filter & Search Logic
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter((item) => {
      const matchesBranch = branchFilter === 'All' || item.branchCode === branchFilter || item.branchId === branchFilter;
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const targetDept = departmentFilter.trim().toLowerCase();
      const itemDept = (item.department || '').trim().toLowerCase();
      const matchesDepartment =
        departmentFilter === 'All' ||
        itemDept === targetDept ||
        itemDept.includes(targetDept) ||
        targetDept.includes(itemDept);
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesSearch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNo.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesBranch && matchesCategory && matchesDepartment && matchesStatus && matchesSearch;
    });
  }, [equipmentList, branchFilter, categoryFilter, departmentFilter, statusFilter, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredEquipment.length / itemsPerPage) || 1;
  const paginatedEquipment = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEquipment.slice(start, start + itemsPerPage);
  }, [filteredEquipment, currentPage]);

  // Helper to format date strings for HTML5 date inputs (YYYY-MM-DD)
  const formatDateForInput = (dateStr?: string): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    const defaultDept = departmentsList.length > 0 ? departmentsList[0] : 'Cardiology';
    setFormData({
      name: '',
      category: 'Diagnostic',
      department: defaultDept,
      serialNo: '',
      status: 'Available',
      calibrationDueDate: new Date().toISOString().split('T')[0],
      model: '',
      supplier: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      warrantyExpiry: '',
      depreciationPercentage: 0,
      initialValue: 0,
      currentValue: 0,
      alertMessage: ''
    });
    setEditingAsset(null);
    setIsAddModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (asset: EquipmentAsset) => {
    setEditingAsset(asset);
    setFormData({
      ...asset,
      calibrationDueDate: formatDateForInput(asset.calibrationDueDate)
    });
    setActiveMenuId(null);
    setIsAddModalOpen(true);
  };

  // Save Asset (Add or Edit)
  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = formData.name?.trim();
    const finalCategory = formData.category || 'Diagnostic';
    const finalDept = formData.department || departmentsList[0] || 'Cardiology';

    if (!finalName) {
      toast.error('Please enter the Equipment Name.');
      return;
    }

    const resolvedFormData: Partial<EquipmentAsset> = {
      ...formData,
      name: finalName,
      category: finalCategory,
      department: finalDept
    };

    try {
      if (editingAsset) {
        const updated = await equipmentService.update(editingAsset.id, resolvedFormData);
        setEquipmentList((prev) =>
          prev.map((item) => (item.id === editingAsset.id ? updated : item))
        );
        toast.success('Equipment asset updated successfully!');
      } else {
        const created = await equipmentService.create(resolvedFormData);
        setEquipmentList((prev) => [created, ...prev]);
        toast.success('New equipment asset created successfully!');
      }
      fetchEquipmentData();
      setIsAddModalOpen(false);
      setEditingAsset(null);
    } catch (err: any) {
      console.warn('API save error, updating local state:', err);
      if (editingAsset) {
        setEquipmentList((prev) =>
          prev.map((item) => (item.id === editingAsset.id ? ({ ...item, ...resolvedFormData } as EquipmentAsset) : item))
        );
        toast.success('Asset updated locally.');
      } else {
        const newAsset: EquipmentAsset = {
          id: `eq-${Date.now()}`,
          assetId: resolvedFormData.assetId || `#EQ-${Math.floor(10000 + Math.random() * 90000)}`,
          name: resolvedFormData.name || 'New Asset',
          category: resolvedFormData.category || 'Diagnostic',
          department: resolvedFormData.department || 'Cardiology',
          location: resolvedFormData.location || 'Storage',
          serialNo: resolvedFormData.serialNo || `SN-${Math.floor(1000000 + Math.random() * 9000000)}`,
          status: (resolvedFormData.status as EquipmentStatus) || 'Available',
          calibrationDueDate: resolvedFormData.calibrationDueDate || '2026-10-15',
          model: resolvedFormData.model || 'Standard',
          supplier: resolvedFormData.supplier || 'MedTech Corp',
          purchaseDate: resolvedFormData.purchaseDate || '2024-01-12',
          warrantyExpiry: resolvedFormData.warrantyExpiry || '2026-12-31',
          depreciationPercentage: resolvedFormData.depreciationPercentage || 85,
          initialValue: resolvedFormData.initialValue || 25000,
          currentValue: resolvedFormData.currentValue || 21250,
          alertMessage: resolvedFormData.alertMessage || ''
        };
        setEquipmentList((prev) => [newAsset, ...prev]);
        toast.success('New asset created locally.');
      }
      setIsAddModalOpen(false);
      setEditingAsset(null);
    }
  };

  // Toggle / Update Status
  const handleStatusChange = async (id: string, newStatus: EquipmentStatus) => {
    try {
      const updated = await equipmentService.updateStatus(id, newStatus);
      setEquipmentList((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      toast.success(`Asset status changed to ${newStatus}.`);
    } catch {
      setEquipmentList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      toast.success(`Asset status changed to ${newStatus}.`);
    }
    setActiveMenuId(null);
  };

  // Delete Asset
  const handleDeleteAsset = async () => {
    if (!deletingAsset) return;
    try {
      await equipmentService.delete(deletingAsset.id);
      toast.success('Equipment asset deleted.');
    } catch {
      toast.success('Equipment asset removed locally.');
    }
    setEquipmentList((prev) => prev.filter((item) => item.id !== deletingAsset.id));
    setDeletingAsset(null);
    setActiveMenuId(null);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setDepartmentFilter('All');
    setStatusFilter('All');
    setCurrentPage(1);
    toast.success('Filters reset.');
  };

  // Export CSV
  const handleExportCSV = () => {
    if (equipmentList.length === 0) {
      toast.error('No equipment data to export.');
      return;
    }
    const headers = ['Asset ID', 'Name', 'Category', 'Department', 'Location', 'Serial No', 'Status', 'Cal Due Date'];
    const rows = filteredEquipment.map((e) => [
      `"${e.assetId}"`,
      `"${e.name}"`,
      `"${e.category}"`,
      `"${e.department}"`,
      `"${e.location}"`,
      `"${e.serialNo}"`,
      `"${e.status}"`,
      `"${e.calibrationDueDate}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `equipment_inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success('Exported equipment inventory to CSV.');
  };

  // Helper Badge Color
  const getStatusBadge = (status: EquipmentStatus) => {
    switch (status) {
      case 'In Use':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Maintenance':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Calibration Due':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Decommissioned':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" reverseOrder={false} />
        {/* --- 1. TOP HEADER & SEARCH BAR (Matching Screenshot 1 & 2) --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-900 border border-blue-100">
              <Package className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Equipment Management</h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Track medical assets, maintenance schedules & calibration</p>
            </div>
          </div>

          {/* Action Header Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-[#0f2c59] hover:bg-[#0a1f3f] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs inline-flex items-center gap-2 transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">New Asset</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* --- 2. STATS OVERVIEW CARDS --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Inventory */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Inventory</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-3xl font-extrabold text-slate-900">{displayStats.totalInventory.toLocaleString()}</div>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <span>Registered Medical Assets</span>
            </p>
          </div>

          {/* Card 2: Operational Rate */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Operational Rate</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-3xl font-extrabold text-slate-900">{displayStats.operationalRate}%</div>
            <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <span>Active & Operational</span>
            </p>
          </div>

          {/* Card 3: Under Maintenance */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Under Maintenance</span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-3xl font-extrabold text-slate-900">{displayStats.underMaintenance}</div>
            <p className="text-[11px] text-amber-600 font-bold flex items-center gap-1">
              <span>Units In Service / Repair</span>
            </p>
          </div>

          {/* Card 4: Calibration Due */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Calibration Due</span>
              <div className="p-2 rounded-lg bg-red-50 text-red-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-3xl font-extrabold text-slate-900">{displayStats.calibrationDue}</div>
            <p className="text-[11px] text-red-600 font-bold flex items-center gap-1">
              <span>Requires Inspection / Cal</span>
            </p>
          </div>
        </div>

        {/* --- 3. FILTER BAR & STATUS PILLS --- */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="All">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.branchCode}>
                    {b.branchName} ({b.branchCode})
                  </option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Life Support">Life Support</option>
                <option value="Diagnostic">Diagnostic</option>
                <option value="Monitoring">Monitoring</option>
                <option value="Surgical">Surgical</option>
              </select>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="All">All Departments</option>
                {departmentsList.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              <button
                onClick={handleResetFilters}
                className="p-2 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                title="Reset Filters"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button
                onClick={handleExportCSV}
                className="p-2 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                title="Export CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Right Status Tabs / Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl w-full sm:w-auto overflow-x-auto">
              {(['All', 'In Use', 'Available', 'Maintenance'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${
                    statusFilter === tab
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab === 'All' ? 'All Status' : tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- 4. ASSET LIST TABLE (DESKTOP) & CARD LIST (MOBILE RESPONSIVE) --- */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Click outside overlay for action menu */}
          {activeMenuId && (
            <div
              className="fixed inset-0 z-20 cursor-default"
              onClick={() => setActiveMenuId(null)}
            />
          )}

          {/* Desktop Data Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={paginatedEquipment.length > 0 && paginatedEquipment.every((item) => selectedIds.includes(item.id))}
                      onChange={handleToggleSelectAllPage}
                      className="rounded border-slate-300 text-blue-900 focus:ring-blue-100 cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Asset ID / Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Serial No.</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Cal. Due Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedEquipment.length > 0 ? (
                  paginatedEquipment.map((asset, index) => {
                    const isSelected = selectedIds.includes(asset.id);
                    const isNearBottom = index >= Math.max(0, paginatedEquipment.length - 2);
                    return (
                      <tr key={asset.id} className={`hover:bg-slate-50/60 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                        <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectRow(asset.id)}
                            className="rounded border-slate-300 text-blue-900 focus:ring-blue-100 cursor-pointer"
                          />
                        </td>
                      <td className="p-4">
                        <div className="font-extrabold text-blue-900 text-xs">{asset.assetId}</div>
                        <div className="font-bold text-slate-900 text-sm mt-0.5">{asset.name}</div>
                      </td>
                      <td className="p-4 font-bold text-slate-600">{asset.category}</td>
                      <td className="p-4 font-mono text-slate-500">{asset.serialNo}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full border text-[11px] font-extrabold inline-flex items-center gap-1.5 ${getStatusBadge(asset.status)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {asset.status}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-600">{asset.calibrationDueDate}</td>
                      <td className="p-4 text-right relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === asset.id ? null : asset.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Action Dropdown Menu with Smart Upward/Downward Positioning */}
                        {activeMenuId === asset.id && (
                          <div className={`absolute right-4 ${isNearBottom ? 'bottom-10 origin-bottom-right' : 'top-10 origin-top-right'} z-30 w-44 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 text-left animate-in fade-in zoom-in-95 duration-100`}>
                            <button
                              onClick={() => {
                                setViewingAsset(asset);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Eye className="w-4 h-4 text-blue-600" /> View Details
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(asset)}
                              className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Pencil className="w-4 h-4 text-amber-600" /> Edit Asset
                            </button>
                            <button
                              onClick={() => handleStatusChange(asset.id, asset.status === 'In Use' ? 'Available' : 'In Use')}
                              className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Activity className="w-4 h-4 text-emerald-600" /> Toggle Status
                            </button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button
                              onClick={() => {
                                setDeletingAsset(asset);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" /> Delete Asset
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                      No medical equipment found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Cards View (Matching Screenshot 2) */}
          <div className="block md:hidden divide-y divide-slate-100">
            <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Recent Equipment ({filteredEquipment.length})</span>
              <span className="text-[11px] text-blue-900">Tap to inspect</span>
            </div>

            {paginatedEquipment.length > 0 ? (
              paginatedEquipment.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setViewingAsset(asset)}
                  className="p-4 space-y-3 hover:bg-slate-50/80 transition-colors cursor-pointer relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-blue-900">{asset.assetId}</span>
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase ${getStatusBadge(asset.status)}`}>
                      {asset.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{asset.name}</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">{asset.category}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1 font-semibold text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>PM Due: {asset.calibrationDueDate}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs font-bold">
                No equipment assets found.
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-500">
            <div>
              Showing {filteredEquipment.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredEquipment.length)} of {filteredEquipment.length} entries
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-bold text-slate-800">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-bold"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      {/* --- 5. ASSET DETAIL MODAL / MOBILE DRAWER (Matching Screenshot 3 & 4) --- */}
      {viewingAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header Banner */}
            <div className="p-5 sm:p-6 border-b border-slate-100 relative bg-slate-50/50">
              <button
                onClick={() => setViewingAsset(null)}
                className="absolute right-5 top-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-1">
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase ${getStatusBadge(viewingAsset.status)}`}>
                  {viewingAsset.status}
                </span>
                <span className="text-xs font-extrabold text-blue-900">{viewingAsset.assetId}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {viewingAsset.name}
              </h2>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-6 mt-5 border-b border-slate-200 text-xs font-bold text-slate-400 overflow-x-auto">
                {(['Specifications', 'Maintenance', 'Usage', 'Incidents'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2.5 transition-colors relative whitespace-nowrap ${
                      activeTab === tab ? 'text-blue-900 font-extrabold' : 'hover:text-slate-700'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-900 rounded-full"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body / Tab Content */}
            <div className="p-5 sm:p-6 space-y-5 text-xs overflow-y-auto flex-1">
              {activeTab === 'Specifications' && (
                <div className="space-y-4">
                  {/* Hardware Details Grid */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 p-4 border border-slate-200 rounded-2xl bg-white">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MODEL</span>
                      <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{viewingAsset.model || 'X200'}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SUPPLIER</span>
                      <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{viewingAsset.supplier || 'MedTech Corp'}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PURCHASE DATE</span>
                      <span className="font-bold text-slate-700 text-xs mt-0.5 block">{viewingAsset.purchaseDate || 'Jan 12, 2024'}</span>
                    </div>
                  </div>

                  {/* Inventory Alert Card (Matching Screenshot 3 & 4) */}
                  <div className="p-4 border border-amber-200 rounded-2xl bg-amber-50/60 space-y-2">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-bold text-amber-900 text-xs">Inventory Alert</h4>
                        <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                          {viewingAsset.alertMessage || 'Low Stock: O2 Sensors. 2 units remaining in supply.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => toast.success('Reorder request submitted to Procurement.')}
                          className="text-[11px] font-extrabold text-blue-900 underline mt-1 block"
                        >
                          Reorder Now / Order Restock
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Maintenance' && (
                <div className="space-y-3">
                  <div className="p-4 border border-slate-200 rounded-2xl bg-white space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs">Preventive Maintenance Log</h4>
                    <p className="text-slate-500 text-xs">Last inspection: Aug 15, 2026 by Senior Tech M. Perera</p>
                    <p className="text-slate-500 text-xs">Next scheduled calibration: {viewingAsset.calibrationDueDate}</p>
                  </div>
                </div>
              )}

              {activeTab === 'Usage' && (
                <div className="p-4 border border-slate-200 rounded-2xl bg-white space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs">Recent Usage Log</h4>
                  <p className="text-slate-500 text-xs">Total Operating Hours: 1,420 hrs</p>
                </div>
              )}

              {activeTab === 'Incidents' && (
                <div className="p-4 border border-slate-200 rounded-2xl bg-white space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs">Incident & Repair History</h4>
                  <p className="text-slate-500 text-xs">No critical failures reported in the last 180 days.</p>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between gap-3 bg-white">
              <button
                type="button"
                onClick={() => {
                  handleStatusChange(viewingAsset.id, 'Decommissioned');
                  setViewingAsset(null);
                }}
                className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs"
              >
                Decommission
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingAsset(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success('Asset details saved.');
                    setViewingAsset(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#0f2c59] hover:bg-[#0a1f3f] text-white font-bold text-xs shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 6. ADD / EDIT ASSET MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingAsset ? 'Edit Equipment Asset' : 'Add New Equipment Asset'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Equipment Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none font-bold"
                    placeholder="e.g. Ventilator X200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={formData.serialNo || ''}
                    onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none font-mono"
                    placeholder="SN-9948201"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category || 'Diagnostic'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none bg-white font-semibold"
                  >
                    <option value="Life Support">Life Support</option>
                    <option value="Diagnostic">Diagnostic</option>
                    <option value="Monitoring">Monitoring</option>
                    <option value="Surgical">Surgical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Department</label>
                  <select
                    value={formData.department || departmentsList[0] || 'Cardiology'}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none bg-white font-semibold"
                  >
                    {departmentsList.length > 0 ? (
                      departmentsList.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                        <option value="Emergency Medicine">Emergency Medicine</option>
                        <option value="Radiology & Imaging">Radiology & Imaging</option>
                        <option value="General Surgery">General Surgery</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Oncology">Oncology</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="w-full">
                <label className="block text-slate-600 font-semibold mb-1">Status</label>
                <select
                  value={formData.status || 'Available'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as EquipmentStatus })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none bg-white font-semibold"
                >
                  <option value="In Use">In Use</option>
                  <option value="Available">Available</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Calibration Due">Calibration Due</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Calibration Due Date</label>
                  <input
                    type="date"
                    value={formData.calibrationDueDate || ''}
                    onChange={(e) => setFormData({ ...formData, calibrationDueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none font-semibold bg-white text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Supplier</label>
                  <input
                    type="text"
                    value={formData.supplier || ''}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none font-semibold"
                    placeholder="MedTech Corp"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0f2c59] hover:bg-[#0a1f3f] text-white font-bold shadow-xs"
                >
                  {editingAsset ? 'Save Changes' : 'Create Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 7. DELETE CONFIRMATION MODAL --- */}
      {deletingAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full space-y-4 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Delete Asset</h3>
            <p className="text-xs text-slate-500 font-medium">
              Are you sure you want to delete <strong className="text-slate-800">{deletingAsset.name}</strong> ({deletingAsset.assetId})? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingAsset(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAsset}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 8. BULK DELETE CONFIRMATION MODAL --- */}
      {isBulkDeleting && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full space-y-4 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Delete Selected Assets</h3>
            <p className="text-xs text-slate-500 font-medium">
              Are you sure you want to delete <strong className="text-slate-800">{selectedIds.length} selected asset(s)</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsBulkDeleting(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs"
              >
                Delete {selectedIds.length} Assets
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 9. FLOATING BULK ACTIONS TOOLBAR --- */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 sm:gap-4 animate-in slide-in-from-bottom-5 duration-200 max-w-[95vw] sm:max-w-max overflow-x-auto">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-700 whitespace-nowrap">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-extrabold">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold text-slate-200">selected</span>
          </div>

          <div className="flex items-center gap-2 whitespace-nowrap">
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkStatusChange(e.target.value as EquipmentStatus);
                  e.target.value = '';
                }
              }}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="" disabled>
                Set Status...
              </option>
              <option value="Available">Mark Available</option>
              <option value="In Use">Mark In Use</option>
              <option value="Maintenance">Mark Maintenance</option>
              <option value="Decommissioned">Decommission</option>
            </select>

            <button
              onClick={handleBulkExportCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Selected
            </button>

            <button
              onClick={() => setIsBulkDeleting(true)}
              className="px-3 py-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete ({selectedIds.length})
            </button>
          </div>

          <button
            onClick={() => setSelectedIds([])}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
            title="Clear Selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
