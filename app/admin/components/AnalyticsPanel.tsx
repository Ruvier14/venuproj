import React from 'react';
import { AdminStats } from '../types';

interface AnalyticsPanelProps {
  stats: AdminStats;
}

export default function AnalyticsPanel({ stats }: AnalyticsPanelProps) {
  const statCards = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers.toLocaleString(), 
      subtitle: 'Registered users',
      color: 'bg-blue-50 text-blue-700'
    },
    { 
      title: 'Total Listings', 
      value: stats.totalListings.toLocaleString(), 
      subtitle: 'Active listings',
      color: 'bg-green-50 text-green-700'
    },
    { 
      title: 'Total Bookings', 
      value: stats.totalBookings.toLocaleString(), 
      subtitle: 'All time bookings',
      color: 'bg-purple-50 text-purple-700'
    },
    { 
      title: 'Total Revenue', 
      value: `₱${stats.totalRevenue.toLocaleString()}`, 
      subtitle: 'Platform revenue',
      color: 'bg-orange-50 text-orange-700'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => (
            <div key={card.title} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center`}>
                  <div className="w-6 h-6 rounded-full bg-current opacity-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-gray-600">
          <p>Analytics charts and detailed reports will be implemented here.</p>
        </div>
      </div>
    </div>
  );
}