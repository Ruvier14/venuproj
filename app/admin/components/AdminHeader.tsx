import React from 'react';

interface AdminHeaderProps {
  onSignOut: () => void;
}

export default function AdminHeader({ onSignOut }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Admin User
          </div>
          <button
            onClick={onSignOut}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}