export type MenuItem = 'analytics' | 'listings' | 'bookings' | 'payments' | 'users' | 'verification' | 'reports' | 'messages' | 'reviews' | 'settings';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'host';
  dateJoined?: string;
  lastActive?: string;
}

export interface Listing {
  id: string;
  name: string;
  status: 'pending' | 'listed' | 'rejected';
  ownerId: string;
  ownerName: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  listingId: string;
  listingName: string;
  userId: string;
  userName: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date: string;
  amount: number;
}

export interface AdminStats {
  totalUsers: number;
  totalListings: number;
  totalBookings: number;
  totalRevenue: number;
}