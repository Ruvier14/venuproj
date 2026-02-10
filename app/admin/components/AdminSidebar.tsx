import React from 'react';
import { MenuItem } from '../types';
import {
  AnalyticsIcon,
  ListingsIcon,
  BookingsIcon,
  PaymentsIcon,
  UsersIcon,
  VerificationIcon,
  ReportsIcon,
  MessagesIcon,
  ReviewsIcon,
  SettingsIcon,
} from './icons';

interface AdminSidebarProps {
  activeMenu: MenuItem;
  onMenuChange: (menu: MenuItem) => void;
}

const menuItems = [
  { id: 'analytics' as MenuItem, label: 'Analytics', icon: AnalyticsIcon },
  { id: 'listings' as MenuItem, label: 'Listings', icon: ListingsIcon },
  { id: 'bookings' as MenuItem, label: 'Bookings', icon: BookingsIcon },
  { id: 'payments' as MenuItem, label: 'Payments', icon: PaymentsIcon },
  { id: 'users' as MenuItem, label: 'Users', icon: UsersIcon },
  { id: 'verification' as MenuItem, label: 'Verification', icon: VerificationIcon },
  { id: 'reports' as MenuItem, label: 'Reports', icon: ReportsIcon },
  { id: 'messages' as MenuItem, label: 'Messages', icon: MessagesIcon },
  { id: 'reviews' as MenuItem, label: 'Reviews', icon: ReviewsIcon },
  { id: 'settings' as MenuItem, label: 'Settings', icon: SettingsIcon },
];

export default function AdminSidebar({ activeMenu, onMenuChange }: AdminSidebarProps) {
  return (
    <aside className="w-60 bg-white border-r border-gray-200 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeMenu === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onMenuChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <IconComponent />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}