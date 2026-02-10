import { useState, useEffect } from 'react';
import { User, AdminStats } from '../types';

export function useAdminData() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalListings: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load data from localStorage or API
    loadAdminData();
  }, []);

  const loadAdminData = () => {
    // Mock data for now - in real app, this would fetch from API
    const mockUsers: User[] = [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', dateJoined: '2024-01-15' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'host', dateJoined: '2024-01-20' },
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'user', dateJoined: '2024-02-01' },
    ];

    const mockStats: AdminStats = {
      totalUsers: mockUsers.length,
      totalListings: 25,
      totalBookings: 150,
      totalRevenue: 75000,
    };

    setUsers(mockUsers);
    setStats(mockStats);
  };

  return {
    stats,
    users,
    refreshData: loadAdminData,
  };
}