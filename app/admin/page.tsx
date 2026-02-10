'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MenuItem } from './types';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import AnalyticsPanel from './components/AnalyticsPanel';
import UsersPanel from './components/UsersPanel';
import {
  ListingsPanel,
  BookingsPanel,
  PaymentsPanel,
  VerificationPanel,
  ReportsPanel,
  MessagesPanel,
  ReviewsPanel,
  SettingsPanel,
} from './components/PanelComponents';
import { useAdminData } from './hooks/useAdminData';

function AdminGuard({ children }: { children: React.ReactNode }) {
  // In a real app, you'd check authentication here
  // For now, we'll just allow access
  return <>{children}</>;
}

export default function AdminPage() {
  const [activeMenu, setActiveMenu] = useState<MenuItem>('analytics');
  const { stats, users } = useAdminData();
  const router = useRouter();

  const handleSignOut = () => {
    // Handle sign out logic
    router.push('/');
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'analytics':
        return <AnalyticsPanel stats={stats} />;
      case 'users':
        return <UsersPanel users={users} />;
      case 'listings':
        return <ListingsPanel />;
      case 'bookings':
        return <BookingsPanel />;
      case 'payments':
        return <PaymentsPanel />;
      case 'verification':
        return <VerificationPanel />;
      case 'reports':
        return <ReportsPanel />;
      case 'messages':
        return <MessagesPanel />;
      case 'reviews':
        return <ReviewsPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <AnalyticsPanel stats={stats} />;
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader onSignOut={handleSignOut} />
        
        <div className="flex">
          <AdminSidebar 
            activeMenu={activeMenu} 
            onMenuChange={setActiveMenu} 
          />
          
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
