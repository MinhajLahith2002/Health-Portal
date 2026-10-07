export interface Department {
  id: string;
  name: string;
  head: string;
  doctorsCount: number;
  staffCount: number;
  location: string;
  status: 'Active' | 'Inactive';
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  branchId?: string;
  branchCode?: string;
  createdAt?: string;
}

export interface DepartmentStats {
  totalDepartments: number;
  activeDepartments: number;
  totalDoctors: number;
  totalDepartmentStaff: number;
}
