'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function HospitalAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStaffManagement = pathname?.startsWith('/hospital-admin/staff-management');

  return (
    <DashboardLayout
      pageTitle={isStaffManagement ? 'Staff Management' : 'Hospital Admin'}
      userRole={isStaffManagement ? 'SUPER_ADMIN' : 'ADMIN'}
      userName={isStaffManagement ? 'Super Admin' : 'Admin User'}
    >
      {children}
    </DashboardLayout>
  );
}
