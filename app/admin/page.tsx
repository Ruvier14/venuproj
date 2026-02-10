"use client";

import { useEffect, useState, useRef } from "react";
import type { JSX } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import Logo from "@/app/components/Logo";
import { 
  subscribeToConversations, 
  subscribeToMessages,
  sendMessage,
  markMessagesAsRead,
  getParticipantInfo,
  setTypingStatus,
  subscribeToTyping,
  type Conversation,
  type Message
} from '@/app/lib/messaging';

// Icons
const AnalyticsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const ListingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
  </svg>
);

const BookingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const PaymentsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const GCashIcon = () => (
  <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
    <rect width="24" height="16" rx="2" fill="#0070F3" />
    <text x="12" y="11" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">GCash</text>
  </svg>
);

const CreditCardIcon = () => (
  <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="12" rx="2" />
    <line x1="1" y1="8" x2="23" y2="8" />
    <circle cx="6" cy="12" r="1" />
    <circle cx="9" cy="12" r="1" />
  </svg>
);

const BankIcon = () => (
  <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="10" rx="1" />
    <line x1="2" y1="9" x2="22" y2="9" />
    <line x1="2" y1="13" x2="22" y2="13" />
    <circle cx="12" cy="11" r="1.5" />
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const VerificationIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ReportsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const MessagesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ReviewsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const GeneralIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

const FeesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const BookingRulesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CancellationsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <rect x="7" y="7" width="10" height="10" rx="1" ry="1" />
  </svg>
);

const VerificationSafetyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const NotificationsSettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const LegalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const MessageSearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const MessageBubbleIcon = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

type MenuItem = 'analytics' | 'listings' | 'bookings' | 'payments' | 'users' | 'verification' | 'reports' | 'messages' | 'reviews' | 'settings';

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<MenuItem>('analytics');
  const [userViewType, setUserViewType] = useState<'host' | 'user'>('host');
  const [listingFilter, setListingFilter] = useState<'listed' | 'unlisted' | 'in_review' | 'deleted'>('in_review');
  const [allListingsData, setAllListingsData] = useState<any[]>([]);
  const [listingsRefreshKey, setListingsRefreshKey] = useState(0);
  const [usersRefreshKey, setUsersRefreshKey] = useState(0);
  const [verificationRefreshKey, setVerificationRefreshKey] = useState(0);
  const [verificationViewType, setVerificationViewType] = useState<'host' | 'user'>('host');
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);
  const [settingsSubmenu, setSettingsSubmenu] = useState<'general' | 'fees' | 'cancellations' | 'verification' | 'notifications' | 'legal'>('general');
  const [platformCommission, setPlatformCommission] = useState('5.0');
  const [serviceFee, setServiceFee] = useState('5');
  const [hostPayoutSchedule, setHostPayoutSchedule] = useState<'immediate' | 'weekly' | 'monthly'>('weekly');
  const [minimumPayoutAmount, setMinimumPayoutAmount] = useState('1000');
  const [manualPaymentApproval, setManualPaymentApproval] = useState(true);
  const [freeCancellationHours, setFreeCancellationHours] = useState('72');
  const [partialRefundHours, setPartialRefundHours] = useState('7');
  const [partialRefundDays, setPartialRefundDays] = useState('3-6');
  const [noRefundDays, setNoRefundDays] = useState('14');
  const [rushBookingDays, setRushBookingDays] = useState('2');
  const [firstPenaltyDays, setFirstPenaltyDays] = useState('1');
  const [requireHostVerification, setRequireHostVerification] = useState(true);
  const [requireGuestVerification, setRequireGuestVerification] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [requirePhoneVerification, setRequirePhoneVerification] = useState(true);
  const [verifiedUsersOnly, setVerifiedUsersOnly] = useState(true);
  const [requireHouseRulesAgreement, setRequireHouseRulesAgreement] = useState(true);
  const [newBookingAlerts, setNewBookingAlerts] = useState(true);
  const [issueAlerts, setIssueAlerts] = useState(true);
  const [rebookingRequests, setRebookingRequests] = useState(true);
  const [payoutAlerts, setPayoutAlerts] = useState(true);
  const [failedPaymentAlerts, setFailedPaymentAlerts] = useState(true);
  const [newReviewAlerts, setNewReviewAlerts] = useState(true);
  const [reportAlerts, setReportAlerts] = useState(true);
  const [dpaCompliance, setDpaCompliance] = useState(true);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: string;
    listingId?: string;
    listingName?: string;
    userId?: string;
    userName?: string;
    // ...existing code...
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <div style={{ minHeight: "100vh", backgroundColor: "#fff", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <header
            style={{
              backgroundColor: "rgb(247, 247, 247)",
              borderBottom: "1px solid #e6e6e6",
              padding: "16px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "sticky",
              top: 0,
              zIndex: 100,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Logo />
              <span style={{ fontSize: "25px", fontWeight: "600", color: "#222", paddingTop: "15px", marginLeft: "12px" }}>Admins Dashboard</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "14px", color: "#666" }}>{user.email}</span>
              {/* Notification Icon */}
              <div ref={notificationRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  aria-label="Notifications"
                  aria-expanded={notificationOpen}
                  onClick={(event) => {
                    event.stopPropagation();
                    setNotificationOpen((prev) => !prev);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    transition: 'transform 0.2s',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Bell shape - outline */}
                    <path
                      d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9z"
                      stroke="#000000"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    {/* Clapper line */}
                    <path
                      d="M13.73 21a2 2 0 0 1-3.46 0"
                      stroke="#000000"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    {/* Red badge circle and text - only show if there are notifications */}
                    {notificationCount > 0 && (
                      <>
                        <circle cx="16.5" cy="6.5" r="5" fill="#FF0000" />
                        <text
                          x="16.5"
                          y="6.5"
                          textAnchor="middle"
                          fill="white"
                          fontSize="8"
                          fontWeight="bold"
                          fontFamily="Arial, sans-serif"
                          dominantBaseline="middle"
                          alignmentBaseline="middle"
                        >
                          {notificationCount > 9 ? '9+' : notificationCount}
                        </text>
                      </>
                    )}
                  </svg>
                </button>
                {/* Notification Popup */}
                {notificationOpen && (
                  <div
                    role="menu"
                    aria-hidden={!notificationOpen}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: '0',
                      marginTop: '8px',
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      boxShadow: '0 2px 16px rgba(0, 0, 0, 0.12)',
                      minWidth: '360px',
                      maxWidth: '400px',
                      padding: '24px',
                      zIndex: 1000
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#222',
                        margin: 0
                      }}>
                        Notifications
                      </h3>
                    </div>
                    <div style={{
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}>
                      {notifications.length === 0 ? (
                    <div style={{
                      fontSize: '14px',
                      color: '#666',
                      textAlign: 'center',
                      padding: '32px 0'
                    }}>
                      No notifications
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {notifications.slice().reverse().map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => {
                                if (notification.type === 'listing_submission' && notification.listingId) {
                                  setSelectedListingId(notification.listingId);
                                  setListingReviewModalOpen(true);
                                  // Mark as read - need to reload notifications
                                  const adminNotificationKey = 'adminNotifications';
                                  const savedNotifications = localStorage.getItem(adminNotificationKey);
                                  if (savedNotifications) {
                                    try {
                                      const parsedNotifications = JSON.parse(savedNotifications);
                                      const updatedNotifications = parsedNotifications.map((n: any) =>
                                        n.id === notification.id ? { ...n, read: true } : n
                                      );
                                      localStorage.setItem(adminNotificationKey, JSON.stringify(updatedNotifications));
                                      // Reload notifications
                                      const unreadCount = updatedNotifications.filter((n: any) => !n.read).length;
                                      setNotificationCount(unreadCount);
                                      setNotifications(updatedNotifications);
                                    } catch (e) {
                                      console.error('Error updating notification:', e);
                                    }
                                  }
                                }
                              }}
                              style={{
                                padding: '12px',
                                backgroundColor: notification.read ? '#fff' : '#f0f7ff',
                                border: '1px solid #e6e6e6',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#f5f5f5';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = notification.read ? '#fff' : '#f0f7ff';
                              }}
                            >
                              <div style={{
                                fontSize: '14px',
                                fontWeight: notification.read ? '400' : '600',
                                color: '#222',
                                marginBottom: '4px'
                              }}>
                                New listing submitted: {notification.listingName || 'Untitled'}
                              </div>
                              <div style={{
                                fontSize: '12px',
                                color: '#666'
                              }}>
                                {notification.userName} • {new Date(notification.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleSignOut}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1565c0"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#1976d2"}
              >
                Sign Out
              </button>
            </div>
          </header>

          {/* Main Layout */}
          <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
            {/* Sidebar */}
            <aside
              style={{
                width: "240px",
                backgroundColor: "#fff",
                borderRight: "1px solid #e6e6e6",
                padding: "12px 0",
                flexShrink: 0,
                position: "sticky",
                top: "73px",
                alignSelf: "flex-start",
                zIndex: 10,
              }}
            >
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "24px",
                    padding: "10px 24px",
                    backgroundColor: activeMenu === item.id ? "#1976d2" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: activeMenu === item.id ? "500" : "400",
                    color: activeMenu === item.id ? "#fff" : "#666",
                    transition: "background-color 0.2s, color 0.2s",
                  }}
                  onMouseOver={(e) => {
                    if (activeMenu !== item.id) {
                      e.currentTarget.style.backgroundColor = "#fafafa";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (activeMenu !== item.id) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: "24px" }}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </button>
              ))}
            </aside>

            {/* Content Area */}
            <main
              style={{
                flex: 1,
                padding: "24px",
                overflowY: "auto",
                backgroundColor: "#fff",
              }}
            >
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  padding: "24px",
                  minHeight: "100%",
                }}
              >
                {/* Users Section with Toggle */}
                {activeMenu === 'users' && (
                  <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#222", margin: 0 }}>
                      Users
                    </h1>
                    <div style={{ display: "flex", gap: "8px", backgroundColor: "#f5f5f5", borderRadius: "8px", padding: "4px" }}>
                      <button
                        onClick={() => setUserViewType('host')}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: userViewType === 'host' ? "#1976d2" : "transparent",
                          border: userViewType === 'host' ? "1px solid #1976d2" : "none",
                          borderRadius: "6px",
                          fontSize: "14px",
                          fontWeight: userViewType === 'host' ? "500" : "400",
                          color: userViewType === 'host' ? "#fff" : "#222",
                          cursor: "pointer",
                          boxShadow: userViewType === 'host' ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                          transition: "all 0.2s",
                        }}
                      >
                        Host
                      </button>
                      <button
                        onClick={() => setUserViewType('user')}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: userViewType === 'user' ? "#1976d2" : "transparent",
                          border: userViewType === 'user' ? "1px solid #1976d2" : "none",
                          borderRadius: "6px",
                          fontSize: "14px",
                          fontWeight: userViewType === 'user' ? "500" : "400",
                          color: userViewType === 'user' ? "#fff" : "#222",
                          cursor: "pointer",
                          boxShadow: userViewType === 'user' ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                          transition: "all 0.2s",
                        }}
                      >
                        User
                      </button>
                    </div>
                  </div>
                )}

                {/* Other Sections */}
                {activeMenu !== 'users' && activeMenu !== 'analytics' && activeMenu !== 'verification' && activeMenu !== 'reviews' && activeMenu !== 'messages' && activeMenu !== 'settings' && (
                  <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#222", marginBottom: "24px" }}>
                    {menuItems.find(item => item.id === activeMenu)?.label}
                  </h1>
                )}

                {activeMenu === 'settings' && (
                  <div>
                    {/* Navigation Tabs */}
                    <div style={{ display: "flex", gap: "32px", marginBottom: "32px", borderBottom: "1px solid #e6e6e6" }}>
                      {[
                        { id: 'general', label: 'General' },
                        { id: 'fees', label: 'Fees & Payments' },
                        { id: 'cancellations', label: 'Cancellations & Refunds' },
                        { id: 'verification', label: 'Verification & Safety' },
                        { id: 'notifications', label: 'Notifications' },
                        { id: 'legal', label: 'Legal & System' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setSettingsSubmenu(tab.id as any)}
                          style={{
                            padding: "12px 0",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: settingsSubmenu === tab.id ? "500" : "400",
                            color: settingsSubmenu === tab.id ? "#1976d2" : "#666",
                            borderBottom: settingsSubmenu === tab.id ? "2px solid #1976d2" : "2px solid transparent",
                            marginBottom: "-1px",
                            transition: "all 0.2s",
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Settings Content */}
                    <div>
                      {settingsSubmenu === 'general' && (
                        <div>
                          <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#222", marginBottom: "32px" }}>General Settings</h1>
                        
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px' }}>
                            {/* Platform Name */}
                            <div>
                              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>Platform Name</label>
                              <div style={{ display: 'flex', gap: '16px' }}>
                                <input
    // Calculate revenue MTD (Month-to-Date)
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const revenueMTD = allBookings
      .filter((b: any) => {
        const bookingDate = b.createdAt || b.date || b.checkIn;
        if (!bookingDate) return false;
        const bDate = new Date(bookingDate);
        return bDate >= firstDayOfMonth;
      })
      .reduce((sum, booking) => {
        const price = booking.totalPrice || booking.price || 0;
        return sum + (typeof price === 'number' ? price : parseFloat(price.toString().replace(/[^0-9.-]+/g, '')) || 0);
      }, 0);

    // Calculate revenue last month MTD for comparison
    const firstDayLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    const revenueLastMonthMTD = allBookings
      .filter((b: any) => {
        const bookingDate = b.createdAt || b.date || b.checkIn;
        if (!bookingDate) return false;
        const bDate = new Date(bookingDate);
        return bDate >= firstDayLastMonth && bDate <= lastDayLastMonth && bDate.getDate() <= currentDate.getDate();
      })
      .reduce((sum, booking) => {
        const price = booking.totalPrice || booking.price || 0;
        return sum + (typeof price === 'number' ? price : parseFloat(price.toString().replace(/[^0-9.-]+/g, '')) || 0);
      }, 0);
    const revenueMTDChange = revenueLastMonthMTD > 0 ? ((revenueMTD - revenueLastMonthMTD) / revenueLastMonthMTD) * 100 : 0;

    // Calculate revenue YTD (Year-to-Date)
    const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const revenueYTD = allBookings
      .filter((b: any) => {
        const bookingDate = b.createdAt || b.date || b.checkIn;
        if (!bookingDate) return false;
        const bDate = new Date(bookingDate);
        return bDate >= firstDayOfYear;
      })
      .reduce((sum, booking) => {
        const price = booking.totalPrice || booking.price || 0;
        return sum + (typeof price === 'number' ? price : parseFloat(price.toString().replace(/[^0-9.-]+/g, '')) || 0);
      }, 0);

    // Calculate top venues this month by revenue
    const venueRevenueThisMonth: Record<string, { name: string; revenue: number }> = {};
    allBookings
      .filter((b: any) => {
        const bookingDate = b.createdAt || b.date || b.checkIn;
        if (!bookingDate) return false;
        const bDate = new Date(bookingDate);
        return bDate >= firstDayOfMonth && bDate <= currentDate;
      })
      .forEach((booking: any) => {
        const venueName = booking.venueName || booking.listingName || 'Unknown Venue';
        const price = booking.totalPrice || booking.price || 0;
        const amount = typeof price === 'number' ? price : parseFloat(price.toString().replace(/[^0-9.-]+/g, '')) || 0;
        if (!venueRevenueThisMonth[venueName]) {
          venueRevenueThisMonth[venueName] = { name: venueName, revenue: 0 };
        }
        venueRevenueThisMonth[venueName].revenue += amount;
      });
    const topVenuesThisMonth = Object.values(venueRevenueThisMonth)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    // Calculate unverified venues with bookings
    const unverifiedVenuesWithBookings = allListings
      .filter((l: any) => l.status === 'in_review')
      .filter((l: any) => {
        const venueId = l.id;
        return allBookings.some((b: any) => (b.venueId || b.listingId) === venueId);
      }).length;

    // Calculate pending payouts (simplified - using pending bookings count)
    const pendingPayouts = pendingBookings.length;

    // Calculate venue analytics metrics
    // Total Views: Approximate with total bookings (as placeholder for actual view tracking)
    const totalViews = allBookings.length;
    
    // Booking Requests: Count of pending bookings
    const bookingRequests = pendingBookings.length;
    
    // Confirmed Bookings: Count of completed bookings
    const confirmedBookings = completedBookings.length;
    
    // Most Viewed Space: Venue with most bookings (using topVenues[0])
    const mostViewedSpace = topVenues.length > 0 
      ? { name: topVenues[0].name, views: topVenues[0].bookings }
      : null;

    setAnalyticsData({
      totalBookings,
      totalRevenue,
      activeVenues,
      conversionRate: Math.round(conversionRate * 10) / 10,
      topVenues,
      lowVenues,
      newGuests,
      newHosts,
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter((u: any) => {
        // Consider users active if they have bookings or listings
        const hasBookings = allBookings.some((b: any) => b.userId === u.uid || b.hostId === u.uid);
        const hasListings = allListings.some((l: any) => l.userId === u.uid || l.hostId === u.uid);
        return hasBookings || hasListings || (u.lastLogin && new Date(u.lastLogin) >= thirtyDaysAgo);
      }).length,
      newSignups: allUsers.filter((u: any) => {
        if (!u.createdAt) return false;
        const createdDate = new Date(u.createdAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];
        return createdDate.toISOString().split('T')[0] === todayStr;
      }).length,
      userChurn: allUsers.filter((u: any) => {
        // Simplified: users with no activity in last 30 days (no bookings, no listings, no login)
        const hasRecentActivity = allBookings.some((b: any) => {
          const bookingDate = new Date(b.createdAt || b.date || 0);
          return (b.userId === u.uid || b.hostId === u.uid) && bookingDate >= thirtyDaysAgo;
        }) || allListings.some((l: any) => {
          const listingDate = new Date(l.createdAt || 0);
          return (l.userId === u.uid || l.hostId === u.uid) && listingDate >= thirtyDaysAgo;
        }) || (u.lastLogin && new Date(u.lastLogin) >= thirtyDaysAgo);
        return !hasRecentActivity && u.createdAt && new Date(u.createdAt) < thirtyDaysAgo;
      }).length,
      recentSignups: allUsers
        .filter((u: any) => u.createdAt)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4)
        .map((u: any) => {
          let name = u.displayName || '';
          if (!name && (u.firstName || u.lastName)) {
            name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
          }
          if (!name) {
            name = u.email?.split('@')[0] || 'User';
          }
          return {
            name,
            dateJoined: new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          };
        }),
      churnedUsers: allUsers
        .filter((u: any) => {
          // Users with no activity in last 30 days
          const hasRecentActivity = allBookings.some((b: any) => {
            const bookingDate = new Date(b.createdAt || b.date || 0);
            return (b.userId === u.uid || b.hostId === u.uid) && bookingDate >= thirtyDaysAgo;
          }) || allListings.some((l: any) => {
            const listingDate = new Date(l.createdAt || 0);
            return (l.userId === u.uid || l.hostId === u.uid) && listingDate >= thirtyDaysAgo;
          }) || (u.lastLogin && new Date(u.lastLogin) >= thirtyDaysAgo);
          return !hasRecentActivity && u.createdAt && new Date(u.createdAt) < thirtyDaysAgo;
        })
        .sort((a: any, b: any) => {
          const aLastActive = a.lastLogin ? new Date(a.lastLogin).getTime() : new Date(a.createdAt).getTime();
          const bLastActive = b.lastLogin ? new Date(b.lastLogin).getTime() : new Date(b.createdAt).getTime();
          return bLastActive - aLastActive;
        })
        .slice(0, 4)
        .map((u: any) => {
          const lastActiveDate = u.lastLogin ? new Date(u.lastLogin) : new Date(u.createdAt);
          let name = u.displayName || '';
          if (!name && (u.firstName || u.lastName)) {
            name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
          }
          if (!name) {
            name = u.email?.split('@')[0] || 'User';
          }
          return {
            name,
            lastActive: lastActiveDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          };
        }),
      unverifiedVenues,
      activeDisputes,
      incidentReports,
      bookingsOverTime,
      bookingsOverTimeByStatus,
      revenueBreakdown: {
        commissions,
        hostPayouts,
        refunds,
      },
      bookingsData: {
        total: totalBookingsCount,
        pending: pendingCount,
        completed: completedCount,
        cancelled: cancelledCount,
        conversionRate: Math.round(bookingConversionRate * 10) / 10,
        averageBookingValue: Math.round(averageBookingValue),
        cancellationRate: Math.round(cancellationRate * 10) / 10,
        topHosts,
        topVenues: topVenuesFormatted,
        recentBookings,
        bookingsByLocation,
      },
      bookingsToday,
      bookingsTodayChange: Math.round(bookingsTodayChange * 10) / 10,
      revenueMTD: Math.round(revenueMTD),
      revenueMTDChange: Math.round(revenueMTDChange * 10) / 10,
      revenueYTD: Math.round(revenueYTD),
      topVenuesThisMonth,
      unverifiedVenuesWithBookings,
      pendingPayouts,
      totalViews,
      bookingRequests,
      confirmedBookings,
      mostViewedSpace,
    });
    };
    
    // Load notifications
    const loadNotifications = () => {
      const adminNotificationKey = 'adminNotifications';
      const savedNotifications = localStorage.getItem(adminNotificationKey);
      if (savedNotifications) {
        try {
          const parsedNotifications = JSON.parse(savedNotifications);
          setNotifications(parsedNotifications || []);
          const unreadCount = (parsedNotifications || []).filter((n: any) => !n.read).length;
          setNotificationCount(unreadCount);
        } catch (e) {
          console.error('Error parsing notifications:', e);
          setNotifications([]);
          setNotificationCount(0);
        }
      } else {
        setNotifications([]);
        setNotificationCount(0);
      }
    };

    // Handle notification update
    const handleNotificationUpdate = () => {
      loadNotifications();
    };
    
    // Load data immediately
    loadAnalyticsData();
    loadNotifications();
    
    // Set up interval to refresh data every 5 seconds
    const intervalId = setInterval(() => {
      loadAnalyticsData();
      loadNotifications();
    }, 5000);
    
    // Listen for storage changes to refresh data
    const handleStorageChange = () => {
      loadAnalyticsData();
      loadNotifications();
      // Force listings table to re-render
      setListingsRefreshKey(prev => prev + 1);
      // Force users table to re-render
      setUsersRefreshKey(prev => prev + 1);
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('adminNotificationsUpdated', handleNotificationUpdate);
    window.addEventListener('hostListingsUpdated', handleStorageChange);
    window.addEventListener('listingUpdated', handleStorageChange);
    window.addEventListener('userDataUpdated', handleStorageChange);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adminNotificationsUpdated', handleNotificationUpdate);
      window.removeEventListener('hostListingsUpdated', handleStorageChange);
      window.removeEventListener('listingUpdated', handleStorageChange);
    };
  }, [activeMenu]);

  // Subscribe to conversations for messages
  useEffect(() => {
    if (!user || activeMenu !== 'messages') return;
    
    const unsubscribe = subscribeToConversations(user.uid, (convs) => {
      setConversations(convs);
      const convId = searchParams.get('conversationId');
      if (convId && !selectedConversation) {
        const conv = convs.find(c => c.id === convId);
        if (conv) {
          setSelectedConversation(conv);
        }
      }
    });
    
    return unsubscribe;
  }, [user, searchParams, activeMenu, selectedConversation]);

  // Subscribe to messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation || !user || activeMenu !== 'messages') return;
    
    setHasScrolledInitially(false);
    setPreviousMessageCount(0);
    
    const unsubscribe = subscribeToMessages(
      selectedConversation.id,
      (msgs) => {
        const previousCount = messages.length;
        setMessages(msgs);
        markMessagesAsRead(selectedConversation.id, user.uid).catch(err => {
          console.error('Error marking messages as read:', err);
        });
        
        const hasNewMessages = msgs.length > previousCount;
        const isInitialLoad = !hasScrolledInitially && msgs.length > 0;
        
        if (isInitialLoad || hasNewMessages) {
          setTimeout(() => {
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
              setHasScrolledInitially(true);
            }
          }, 150);
        }
      }
    );
    
    const participant = getParticipantInfo(selectedConversation, user.uid);
    if (!participant) {
      const currentUserPhoto = localStorage.getItem(`profilePhoto_${user.uid}`);
      const userDataStr = localStorage.getItem(`userData_${user.uid}`);
      let displayName = 'User';
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          if (userData.firstName && userData.lastName) {
            displayName = `${userData.firstName} ${userData.lastName}`;
          } else if (userData.displayName) {
            displayName = userData.displayName;
          }
        } catch (e) {}
      }
      setParticipantInfo({ id: user.uid, name: displayName, photo: currentUserPhoto });
    } else {
      setParticipantInfo(participant);
    }
    
    return unsubscribe;
  }, [selectedConversation, user, activeMenu, messages.length, hasScrolledInitially]);

  // Subscribe to typing status
  useEffect(() => {
    if (!selectedConversation || !user || activeMenu !== 'messages') {
      setTypingUsers([]);
      return;
    }
    const unsubscribe = subscribeToTyping(selectedConversation.id, (users) => {
      const otherUsersTyping = users.filter(userId => userId !== user?.uid);
      setTypingUsers(otherUsersTyping);
    });
    return unsubscribe;
  }, [selectedConversation, user, activeMenu]);

  // Handle typing status updates
  useEffect(() => {
    if (!selectedConversation || !user || !messageText || activeMenu !== 'messages') {
      if (isTyping && selectedConversation && user) {
        setTypingStatus(selectedConversation.id, user.uid, false);
        setIsTyping(false);
      }
      return;
    }
    if (!isTyping) {
      setTypingStatus(selectedConversation.id, user.uid, true);
      setIsTyping(true);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(selectedConversation.id, user.uid, false);
      setIsTyping(false);
    }, 3000);
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageText, selectedConversation, user, isTyping, activeMenu]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !user) return;
    const messageToSend = messageText.trim();
    try {
      if (selectedConversation && user) {
        await setTypingStatus(selectedConversation.id, user.uid, false);
        setIsTyping(false);
      }
      setMessageText('');
      await sendMessage(selectedConversation.id, user.uid, messageToSend);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 150);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessageText(messageToSend);
      alert(`Failed to send message: ${error.message || 'Please try again.'}`);
    }
  };

  // Filter conversations based on filter and search
  const filteredConversations = conversations.filter(conv => {
    if (filter === 'unread' && (!conv.unreadCount || !conv.unreadCount[user?.uid || ''] || conv.unreadCount[user?.uid || ''] === 0)) {
      return false;
    }
    if (searchQuery.trim()) {
      const participant = getParticipantInfo(conv, user?.uid || '');
      const searchLower = searchQuery.toLowerCase();
      return (
        participant?.name.toLowerCase().includes(searchLower) ||
        conv.lastMessage?.toLowerCase().includes(searchLower) ||
        conv.listingName?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const menuItems: { id: MenuItem; label: string; icon: JSX.Element }[] = [
    { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
    { id: 'listings', label: 'Listings', icon: <ListingsIcon /> },
    { id: 'bookings', label: 'Bookings', icon: <BookingsIcon /> },
    { id: 'payments', label: 'Payments', icon: <PaymentsIcon /> },
    { id: 'users', label: 'Users', icon: <UsersIcon /> },
    { id: 'verification', label: 'Verification', icon: <VerificationIcon /> },
    { id: 'reports', label: 'Reports', icon: <ReportsIcon /> },
    { id: 'messages', label: 'Messages', icon: <MessagesIcon /> },
    { id: 'reviews', label: 'Reviews', icon: <ReviewsIcon /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user || user.email !== "venuproj00@gmail.com") {
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: "rgb(247, 247, 247)",
          borderBottom: "1px solid #e6e6e6",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Logo />
          <span style={{ fontSize: "25px", fontWeight: "600", color: "#222", paddingTop: "15px", marginLeft: "12px" }}>Admins Dashboard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "14px", color: "#666" }}>{user.email}</span>
          {/* Notification Icon */}
          <div ref={notificationRef} style={{ position: 'relative' }}>
            <button
              type="button"
              aria-label="Notifications"
              aria-expanded={notificationOpen}
              onClick={(event) => {
                event.stopPropagation();
                setNotificationOpen((prev) => !prev);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                transition: 'transform 0.2s',
                position: 'relative'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Bell shape - outline */}
                <path
                  d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9z"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Clapper line */}
                <path
                  d="M13.73 21a2 2 0 0 1-3.46 0"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Red badge circle and text - only show if there are notifications */}
                {notificationCount > 0 && (
                  <>
                    <circle cx="16.5" cy="6.5" r="5" fill="#FF0000" />
                    <text
                      x="16.5"
                      y="6.5"
                      textAnchor="middle"
                      fill="white"
                      fontSize="8"
                      fontWeight="bold"
                      fontFamily="Arial, sans-serif"
                      dominantBaseline="middle"
                      alignmentBaseline="middle"
                    >
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </text>
                  </>
                )}
              </svg>
            </button>
            {/* Notification Popup */}
            {notificationOpen && (
              <div
                role="menu"
                aria-hidden={!notificationOpen}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  marginTop: '8px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.12)',
                  minWidth: '360px',
                  maxWidth: '400px',
                  padding: '24px',
                  zIndex: 1000
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#222',
                    margin: 0
                  }}>
                    Notifications
                  </h3>
                </div>
                <div style={{
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}>
                  {notifications.length === 0 ? (
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  textAlign: 'center',
                  padding: '32px 0'
                }}>
                  No notifications
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {notifications.slice().reverse().map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => {
                            if (notification.type === 'listing_submission' && notification.listingId) {
                              setSelectedListingId(notification.listingId);
                              setListingReviewModalOpen(true);
                              // Mark as read - need to reload notifications
                              const adminNotificationKey = 'adminNotifications';
                              const savedNotifications = localStorage.getItem(adminNotificationKey);
                              if (savedNotifications) {
                                try {
                                  const parsedNotifications = JSON.parse(savedNotifications);
                                  const updatedNotifications = parsedNotifications.map((n: any) =>
                                    n.id === notification.id ? { ...n, read: true } : n
                                  );
                                  localStorage.setItem(adminNotificationKey, JSON.stringify(updatedNotifications));
                                  // Reload notifications
                                  const unreadCount = updatedNotifications.filter((n: any) => !n.read).length;
                                  setNotificationCount(unreadCount);
                                  setNotifications(updatedNotifications);
                                } catch (e) {
                                  console.error('Error updating notification:', e);
                                }
                              }
                            }
                          }}
                          style={{
                            padding: '12px',
                            backgroundColor: notification.read ? '#fff' : '#f0f7ff',
                            border: '1px solid #e6e6e6',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = notification.read ? '#fff' : '#f0f7ff';
                          }}
                        >
                          <div style={{
                            fontSize: '14px',
                            fontWeight: notification.read ? '400' : '600',
                            color: '#222',
                            marginBottom: '4px'
                          }}>
                            New listing submitted: {notification.listingName || 'Untitled'}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#666'
                          }}>
                            {notification.userName} • {new Date(notification.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleSignOut}
            style={{
              padding: "8px 16px",
              backgroundColor: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1565c0"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#1976d2"}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <aside
          style={{
            width: "240px",
            backgroundColor: "#fff",
            borderRight: "1px solid #e6e6e6",
            padding: "12px 0",
            flexShrink: 0,
            position: "sticky",
            top: "73px",
            alignSelf: "flex-start",
            zIndex: 10,
          }}
        >
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "24px",
                padding: "10px 24px",
                backgroundColor: activeMenu === item.id ? "#1976d2" : "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: activeMenu === item.id ? "500" : "400",
                color: activeMenu === item.id ? "#fff" : "#666",
                transition: "background-color 0.2s, color 0.2s",
              }}
              onMouseOver={(e) => {
                if (activeMenu !== item.id) {
                  e.currentTarget.style.backgroundColor = "#fafafa";
                }
              }}
              onMouseOut={(e) => {
                if (activeMenu !== item.id) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: "24px" }}>
                {item.icon}
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main
          style={{
            flex: 1,
            padding: "24px",
            overflowY: "auto",
            backgroundColor: "#fff",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              padding: "24px",
              minHeight: "100%",
            }}
          >
            {/* Users Section with Toggle */}
            {activeMenu === 'users' && (
              <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#222", margin: 0 }}>
                  Users
                </h1>
                <div style={{ display: "flex", gap: "8px", backgroundColor: "#f5f5f5", borderRadius: "8px", padding: "4px" }}>
                  <button
                    onClick={() => setUserViewType('host')}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: userViewType === 'host' ? "#1976d2" : "transparent",
                      border: userViewType === 'host' ? "1px solid #1976d2" : "none",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: userViewType === 'host' ? "500" : "400",
                      color: userViewType === 'host' ? "#fff" : "#222",
                      cursor: "pointer",
                      boxShadow: userViewType === 'host' ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                      transition: "all 0.2s",
                    }}
                  >
                    Host
                  </button>
                  <button
                    onClick={() => setUserViewType('user')}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: userViewType === 'user' ? "#1976d2" : "transparent",
                      border: userViewType === 'user' ? "1px solid #1976d2" : "none",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: userViewType === 'user' ? "500" : "400",
                      color: userViewType === 'user' ? "#fff" : "#222",
                      cursor: "pointer",
                      boxShadow: userViewType === 'user' ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                      transition: "all 0.2s",
                    }}
                  >
                    User
                  </button>
                </div>
              </div>
            )}

            {/* Other Sections */}
            {activeMenu !== 'users' && activeMenu !== 'analytics' && activeMenu !== 'verification' && activeMenu !== 'reviews' && activeMenu !== 'messages' && activeMenu !== 'settings' && (
              <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#222", marginBottom: "24px" }}>
                {menuItems.find(item => item.id === activeMenu)?.label}
              </h1>
            )}

            {activeMenu === 'settings' && (
              <div>
                {/* Navigation Tabs */}
                <div style={{ display: "flex", gap: "32px", marginBottom: "32px", borderBottom: "1px solid #e6e6e6" }}>
                  {[
                    { id: 'general', label: 'General' },
                    { id: 'fees', label: 'Fees & Payments' },
                    { id: 'cancellations', label: 'Cancellations & Refunds' },
                    { id: 'verification', label: 'Verification & Safety' },
                    { id: 'notifications', label: 'Notifications' },
                    { id: 'legal', label: 'Legal & System' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSettingsSubmenu(tab.id as any)}
                      style={{
                        padding: "12px 0",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: settingsSubmenu === tab.id ? "500" : "400",
                        color: settingsSubmenu === tab.id ? "#1976d2" : "#666",
                        borderBottom: settingsSubmenu === tab.id ? "2px solid #1976d2" : "2px solid transparent",
                        marginBottom: "-1px",
                        transition: "all 0.2s",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Settings Content */}
                <div>
                  {settingsSubmenu === 'general' && (
                    <div>
                      <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#222", marginBottom: "32px" }}>General Settings</h1>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px' }}>
                        {/* Platform Name */}
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>Platform Name</label>
                          <div style={{ display: 'flex', gap: '16px' }}>
                            <input
                              type="text"
                              defaultValue="Venu"
                              style={{
                                flex: 1,
                                padding: '12px 16px',
                                fontSize: '14px',
                                border: '1px solid #e6e6e6',
                                borderRadius: '8px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                              }}
                              onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                              onBlur={(e) => e.currentTarget.style.borderColor = '#e6e6e6'}
                            />
                            <input
                              type="email"
                              defaultValue="support@venu.ph"
                              style={{
                                flex: 1,
                                padding: '12px 16px',
                                fontSize: '14px',
                                border: '1px solid #e6e6e6',
                                borderRadius: '8px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                              }}
                              onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                              onBlur={(e) => e.currentTarget.style.borderColor = '#e6e6e6'}
                            />
                          </div>
                        </div>

                        {/* Default Currency */}
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>Default Currency</label>
                          <select
                            defaultValue="php"
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              fontSize: '14px',
                              border: '1px solid #e6e6e6',
                              borderRadius: '8px',
                              outline: 'none',
                              backgroundColor: '#fff',
                              cursor: 'pointer',
                              appearance: 'none',
                              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg%27%3E%3Cpath d=\'M1 1L6 6L11 1\' stroke=\'%23666\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 16px center',
                              paddingRight: '40px',
                              transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                            onBlur={(e) => e.currentTarget.style.borderColor = '#e6e6e6'}
                          >
                            <option value="php">Philippine Peso (P)</option>
                            <option value="usd">US Dollar ($)</option>
                            <option value="eur">Euro (€)</option>
                          </select>
                        </div>

                        {/* Time Zone */}
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>Time Zone</label>
                          <select
                            defaultValue="singapore"
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              fontSize: '14px',
                              border: '1px solid #e6e6e6',
                              borderRadius: '8px',
                              outline: 'none',
                              backgroundColor: '#fff',
                              cursor: 'pointer',
                              appearance: 'none',
                              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg%27%3E%3Cpath d=\'M1 1L6 6L11 1\' stroke=\'%23666\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 16px center',
                              paddingRight: '40px',
                              transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                            onBlur={(e) => e.currentTarget.style.borderColor = '#e6e6e6'}
                          >
                            <option value="singapore">(GMT+08:00) Singapore</option>
                            <option value="manila">(GMT+08:00) Manila</option>
                            <option value="tokyo">(GMT+09:00) Tokyo</option>
                          </select>
                        </div>

                        {/* Minimum Booking Notice */}
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>Minimum Booking Notice</label>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <input
                              type="number"
                              defaultValue="24"
                              style={{
                                width: '100px',
                                padding: '12px 16px',
                                fontSize: '14px',
                                border: '1px solid #e6e6e6',
                                borderRadius: '8px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                              }}
                              onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                              onBlur={(e) => e.currentTarget.style.borderColor = '#e6e6e6'}
                            />
                            <select
                              defaultValue="hours"
                              style={{
                                flex: 1,
                                padding: '12px 16px',
                                fontSize: '14px',
                                border: '1px solid #e6e6e6',
                                borderRadius: '8px',
                                outline: 'none',
                                backgroundColor: '#fff',
                                cursor: 'pointer',
                                appearance: 'none',
                                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg%27%3E%3Cpath d=\'M1 1L6 6L11 1\' stroke=\'%23666\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 16px center',
                                paddingRight: '40px',
                                transition: 'border-color 0.2s',
                              }}
                              onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                              onBlur={(e) => e.currentTarget.style.borderColor = '#e6e6e6'}
                            >
                              <option value="hours">hours</option>
                              <option value="days">days</option>
                              <option value="weeks">weeks</option>
                            </select>
                          </div>
                          <p style={{ fontSize: '12px', color: '#999', marginTop: '4px', marginBottom: 0 }}>Minimum lead time required before a booking</p>
                        </div>

                        {/* Support Email */}
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>Support Email</label>
                          <input
                            type="email"
                            defaultValue="support@venu.ph"
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              fontSize: '14px',
                              border: '1px solid #e6e6e6',
                              borderRadius: '8px',
                              outline: 'none',
                              transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                            onBlur={(e) => e.currentTarget.style.borderColor = '#e6e6e6'}
                          />
                        </div>

                        {/* Second Minimum Booking Notice */}
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>Minimum Booking Notice</label>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <input
                              type="number"
                              defaultValue="24"
                              style={{
                                width: '100px',
                                padding: '12px 16px',
                                fontSize: '14px',
                                border: '1px solid #e6e6e6',
                                borderRadius: '8px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                              }}
                              onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                              onBlur={(e) => e.currentTarget.style.borderColor = '#e6e6e6'}
                            />
                            <select
                              defaultValue="hours"
                              style={{
                                flex: 1,
                                padding: '12px 16px',
                                fontSize: '14px',
                                border: '1px solid #e6e6e6',
                                borderRadius: '8px',
                                outline: 'none',
                                backgroundColor: '#fff',
                                cursor: 'pointer',
                                appearance: 'none',
                                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg%27%3E%3Cpath d=\'M1 1L6 6L11 1\' stroke=\'%23666\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 16px center',
                                paddingRight: '40px',
                                transition: 'border-color 0.2s',
                              }}
                              onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                              onBlur={(e) => e.currentTarget.style.borderColor = '#e6e6e6'}
                            >
                              <option value="hours">hours</option>
                              <option value="days">days</option>
                              <option value="weeks">weeks</option>
                            </select>
                          </div>
                          <p style={{ fontSize: '12px', color: '#999', marginTop: '4px', marginBottom: 0 }}>Minimum lead time required before a booking</p>
                        </div>

                        {/* Save Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              // TODO: Implement save functionality
                              alert('Settings saved!');
                            }}
                            style={{
                              padding: '12px 24px',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#fff',
                              backgroundColor: '#1976d2',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsSubmenu === 'fees' && (
                    <div>
                      <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#222", marginBottom: "32px" }}>Fees & Payments</h1>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px' }}>
                        {/* Platform Commission */}
                        <div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>
                            Platform Commission
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'help' }}>
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="16" x2="12" y2="12" />
                              <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                          </label>
                          <div>
                            <select
                              value={platformCommission}
                              onChange={(e) => setPlatformCommission(e.target.value)}
                              style={{
                                padding: '12px 16px',
                                fontSize: '14px',
                                border: '1px solid #e6e6e6',
                                borderRadius: '8px',
                                outline: 'none',
                                backgroundColor: '#fff',
                                cursor: 'pointer',
                                appearance: 'none',
                                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg%27%3E%3Cpath d=\'M1 1L6 6L11 1\' stroke=\'%23666\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 12px center',
                                paddingRight: '32px',
                                transition: 'border-color 0.2s',
                              }}
                              onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                              onBlur={(e) => e.currentTarget.style.borderColor = '#e6e6e6'}
                            >
                              <option value="3">3%</option>
                              <option value="4">4%</option>
                              <option value="5">5%</option>
                              <option value="5.0">5.0%</option>
                              <option value="6">6%</option>
                              <option value="7">7%</option>
                            </select>
                          </div>
                          <p style={{ fontSize: '12px', color: '#999', marginTop: '4px', marginBottom: 0 }}>Percentage commission that Venu takes from each booking.</p>
                        </div>

                        {/* Service Fee */}
                        <div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>
                            Service Fee
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'help' }}>
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="16" x2="12" y2="12" />
                              <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                          </label>
                          <div>
                            <select
                              value={serviceFee}
                              onChange={(e) => setServiceFee(e.target.value)}
                              style={{
                                padding: '12px 16px',
                                fontSize: '14px',
                                border: '1px solid #e6e6e6',
                                borderRadius: '8px',
                                outline: 'none',
                                backgroundColor: '#fff',
                                cursor: 'pointer',
                                appearance: 'none',
                                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg%27%3E%3Cpath d=\'M1 1L6 6L11 1\' stroke=\'%23666\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 12px center',
                                paddingRight: '32px',
                                transition: 'border-color 0.2s',
                              }}
                              onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                              onBlur={(e) => e.currentTarget.style.borderColor = '#e6e6e6'}
                            >
                              <option value="3">3%</option>
                              <option value="4">4%</option>
                              <option value="5">5%</option>
                              <option value="6">6%</option>
                              <option value="7">7%</option>
                            </select>
                          </div>
                          <p style={{ fontSize: '12px', color: '#999', marginTop: '4px', marginBottom: 0 }}>Extra fee charged to users per booking.</p>
                        </div>

                        {/* Host Payout Schedule */}
                        <div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>
                            Host Payout Schedule
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'help' }}>
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="16" x2="12" y2="12" />
                              <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                          </label>
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '4px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name="payoutSchedule"
                                value="immediate"
                                checked={hostPayoutSchedule === 'immediate'}
                                onChange={(e) => setHostPayoutSchedule(e.target.value as any)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: '14px', color: '#222' }}>Immediate</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name="payoutSchedule"
                                value="weekly"
                                checked={hostPayoutSchedule === 'weekly'}
                                onChange={(e) => setHostPayoutSchedule(e.target.value as any)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: '14px', color: '#222' }}>Weekly</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name="payoutSchedule"
                                value="monthly"
                                checked={hostPayoutSchedule === 'monthly'}
                                onChange={(e) => setHostPayoutSchedule(e.target.value as any)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: '14px', color: '#222' }}>Monthly</span>
                            </label>
                          </div>
                          <p style={{ fontSize: '12px', color: '#999', marginTop: '4px', marginBottom: 0 }}>How often hosts are paid out earnings.</p>
                        </div>

                        {/* Minimum Payout Amount */}
                        <div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>
                            Minimum Payout Amount
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'help' }}>
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="16" x2="12" y2="12" />
                              <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                          </label>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', color: '#222', paddingLeft: '4px' }}>₱</span>
                            <input
                              type="number"
                              value={minimumPayoutAmount}
                              onChange={(e) => setMinimumPayoutAmount(e.target.value)}
                              style={{
                                flex: 1,
                                padding: '12px 16px',
                                fontSize: '14px',
                                border: '1px solid #e6e6e6',
                                borderRadius: '8px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                              }}
                              onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                              onBlur={(e) => e.currentTarget.style.borderColor = '#e6e6e6'}
                            />
                          </div>
                          <p style={{ fontSize: '12px', color: '#999', marginTop: '4px', marginBottom: 0 }}>Minimum earnings required for payouts to be triggered.</p>
                        </div>

                        {/* Manual Payment Approval */}
                        <div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>
                            Manual Payment Approval
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'help' }}>
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="16" x2="12" y2="12" />
                              <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <button
                              type="button"
                              onClick={() => setManualPaymentApproval(!manualPaymentApproval)}
                              style={{
                                width: '48px',
                                height: '28px',
                                borderRadius: '14px',
                                border: 'none',
                                backgroundColor: manualPaymentApproval ? '#1976d2' : '#ccc',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'background-color 0.2s',
                                padding: '2px',
                              }}
                            >
                              <div
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  backgroundColor: '#fff',
                                  transform: manualPaymentApproval ? 'translateX(20px)' : 'translateX(0)',
                                  transition: 'transform 0.2s',
                                }}
                              />
                            </button>
                            <span style={{ fontSize: '14px', color: '#222', fontWeight: '500' }}>
                              {manualPaymentApproval ? 'ON' : 'OFF'}
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: '#999', marginTop: '4px', marginBottom: '8px' }}>
                            Require manual admin approval for non-automatic payments. For bank transfers and certain wallets.
                          </p>
                          {manualPaymentApproval && (
                            <div style={{
                              padding: '12px 16px',
                              backgroundColor: '#f5f5f5',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              marginTop: '8px',
                            }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                              </svg>
                              <span style={{ fontSize: '12px', color: '#666' }}>
                                Require manual admin approval for non-automatic payments. For bank transfers and certain wallets.
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Save Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              // TODO: Implement save functionality
                              alert('Settings saved!');
                            }}
                            style={{
                              padding: '12px 24px',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#fff',
                              backgroundColor: '#1976d2',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsSubmenu === 'cancellations' && (
                    <div>
                      <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#222", marginBottom: "32px" }}>Cancellations & Refunds</h1>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px' }}>
                        {/* Payment Handling & Escrow System */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="16" x2="12" y2="12" />
                              <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#222', margin: 0 }}>Payment Handling & Escrow System</h2>
                          </div>
                          <div style={{ backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
                              <li>Payments are held by Venu until the day of the event.</li>
                              <li>Deposited in Venu account, not directly to hosts.</li>
                              <li>Controls platform fees, penalties, and refunds.</li>
                              <li>Protects both guests and hosts in disputes.</li>
                            </ul>
                          </div>
                        </div>

                        {/* Cancellation & Dispute Resolution Policy */}
                        <div>
                          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#222', marginBottom: '24px', textTransform: 'uppercase' }}>
                            Cancellation & Dispute Resolution Policy
                          </h2>

                          {/* Guest Cancellations */}
                          <div style={{ marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '16px' }}>Guest Cancellations</h3>
                            
                            {/* Free Cancellation */}
                            <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#222' }}>Free Cancellation</span>
                              </div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '14px', color: '#666' }}>Full refund if cancelled within</span>
                                <input
                                  type="number"
                                  value={freeCancellationHours}
                                  onChange={(e) => setFreeCancellationHours(e.target.value)}
                                  style={{
                                    width: '80px',
                                    padding: '8px 12px',
                                    fontSize: '14px',
                                    border: '1px solid #e6e6e6',
                                    borderRadius: '6px',
                                    outline: 'none',
                                  }}
                                  onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                                  onBlur={(e) => e.currentTarget.style.borderColor = '#e6e6e6'}
                                />
                                <span style={{ fontSize: '14px', color: '#666' }}>hours ({Math.floor(parseFloat(freeCancellationHours) / 24)} days) after booking. Applies regardless of event date.</span>
                              </div>
                            </div>

                            {/* Partial Refund */}
                            <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                                  <div style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', backgroundColor: '#fff' }}></div>
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#222' }}>Partial Refund (50%)</span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <span style={{ fontSize: '14px', color: '#666' }}>Cancellations made after</span>
                                  <input
                                    type="number"
                                    value={partialRefundHours}
                                    onChange={(e) => setPartialRefundHours(e.target.value)}
                                    style={{
                                      width: '80px',
                                      padding: '8px 12px',
                                      fontSize: '14px',
                                      border: '1px solid #e6e6e6',
                                      borderRadius: '6px',
                                      outline: 'none',
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#e6e6e6'}
                                  />
                                  <span style={{ fontSize: '14px', color: '#666' }}>hours from booking</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <span style={{ fontSize: '14px', color: '#666' }}>Applies when the event date is</span>
                                  <input
                                    type="text"
                                    value={partialRefundDays}
                                    onChange={(e) => setPartialRefundDays(e.target.value)}
                                    style={{
                                      width: '100px',
                                      padding: '8px 12px',
                                      fontSize: '14px',
                                      border: '1px solid #e6e6e6',
                                      borderRadius: '6px',
                                      outline: 'none',
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#e6e6e6'}
                                  />
                                  <span style={{ fontSize: '14px', color: '#666' }}>days away</span>
                                </div>
                              </div>
                            </div>

                            {/* No Refund */}
                            <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#222' }}>No Refund</span>
                              </div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '14px', color: '#666' }}>Cancellations made less than</span>
                                <input
                                  type="number"
                                  value={noRefundDays}
                                  onChange={(e) => setNoRefundDays(e.target.value)}
                                  style={{
                                    width: '80px',
                                    padding: '8px 12px',
                                    fontSize: '14px',
                                    border: '1px solid #e6e6e6',
                                    borderRadius: '6px',
                                    outline: 'none',
                                  }}
                                  onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                                  onBlur={(e) => e.currentTarget.style.borderColor = '#e6e6e6'}
                                />
                                <span style={{ fontSize: '14px', color: '#666' }}>days of the event are non-refundable.</span>
                              </div>
                            </div>

                            {/* TIP */}
                            <div style={{ padding: '12px 16px', backgroundColor: '#e3f2fd', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                              </svg>
                              <div>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1976d2', marginRight: '4px' }}>TIP:</span>
                                <span style={{ fontSize: '14px', color: '#666' }}>
                                  For rush bookings (
                                  <input
                                    type="number"
                                    value={rushBookingDays}
                                    onChange={(e) => setRushBookingDays(e.target.value)}
                                    style={{
                                      width: '50px',
                                      padding: '2px 6px',
                                      fontSize: '14px',
                                      border: '1px solid #90caf9',
                                      borderRadius: '4px',
                                      outline: 'none',
                                      display: 'inline-block',
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#90caf9'}
                                  />
                                  days before event): Reminder: No refund if cancelled.
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Host Cancellations */}
                          <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '16px' }}>Host Cancellations</h3>
                            
                            <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px' }}>
                              <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px', fontWeight: '500' }}>Actions a host should take:</p>
                              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
                                <li>Full refund immediately to the guest.</li>
                                <li>Suggest alternate venues if urgent.</li>
                                <li>Offer a credit or bonus to compensate.</li>
                              </ul>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                              <p style={{ fontSize: '14px', fontWeight: '600', color: '#222', marginBottom: '12px' }}>First Penalty Cancellation:</p>
                              
                              {/* Warning: After 1 day */}
                              <div style={{ marginBottom: '12px', padding: '12px 16px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                                  <span style={{ fontSize: '14px', color: '#666' }}>Warning: After</span>
                                  <input
                                    type="number"
                                    value={firstPenaltyDays}
                                    onChange={(e) => setFirstPenaltyDays(e.target.value)}
                                    style={{
                                      width: '60px',
                                      padding: '6px 10px',
                                      fontSize: '14px',
                                      border: '1px solid #e6e6e6',
                                      borderRadius: '6px',
                                      outline: 'none',
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#e6e6e6'}
                                  />
                                  <span style={{ fontSize: '14px', color: '#666' }}>day</span>
                                </div>
                              </div>

                              {/* Second: Small penalty fee */}
                              <div style={{ marginBottom: '12px', padding: '12px 16px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                  <line x1="12" y1="9" x2="12" y2="13" />
                                  <circle cx="12" cy="17" r="0.5" fill="#fbbf24" />
                                </svg>
                                <span style={{ fontSize: '14px', color: '#666' }}>Second: Small penalty fee or temporary listing block</span>
                              </div>

                              {/* Third: Removal from Venu */}
                              <div style={{ padding: '12px 16px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="12" y1="8" x2="12" y2="12" />
                                  <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span style={{ fontSize: '14px', color: '#666' }}>Third: Removal from Venu</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Save Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              // TODO: Implement save functionality
                              alert('Settings saved!');
                            }}
                            style={{
                              padding: '12px 24px',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#fff',
                              backgroundColor: '#1976d2',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsSubmenu === 'verification' && (
                    <div>
                      <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#222", marginBottom: "32px" }}>Verification & Safety</h1>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px' }}>
                        {/* Host Verification */}
                        <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Require Host ID Verification</h3>
                              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Hosts must verify their identity before listing a venue.</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '24px' }}>
                              <button
                                type="button"
                                onClick={() => setRequireHostVerification(!requireHostVerification)}
                                style={{
                                  width: '48px',
                                  height: '28px',
                                  borderRadius: '14px',
                                  border: 'none',
                                  backgroundColor: requireHostVerification ? '#1976d2' : '#ccc',
                                  cursor: 'pointer',
                                  position: 'relative',
                                  transition: 'background-color 0.2s',
                                  padding: '2px',
                                }}
                              >
                                <div
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    backgroundColor: '#fff',
                                    transform: requireHostVerification ? 'translateX(20px)' : 'translateX(0)',
                                    transition: 'transform 0.2s',
                                  }}
                                />
                              </button>
                              <span style={{ fontSize: '14px', color: '#222', fontWeight: '500', minWidth: '30px' }}>
                                {requireHostVerification ? 'ON' : 'OFF'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Guest Verification */}
                        <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Guests must verify their account before booking a venue.</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '24px' }}>
                              <button
                                type="button"
                                onClick={() => setRequireGuestVerification(!requireGuestVerification)}
                                style={{
                                  width: '48px',
                                  height: '28px',
                                  borderRadius: '14px',
                                  border: 'none',
                                  backgroundColor: requireGuestVerification ? '#1976d2' : '#ccc',
                                  cursor: 'pointer',
                                  position: 'relative',
                                  transition: 'background-color 0.2s',
                                  padding: '2px',
                                }}
                              >
                                <div
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    backgroundColor: '#fff',
                                    transform: requireGuestVerification ? 'translateX(20px)' : 'translateX(0)',
                                    transition: 'transform 0.2s',
                                  }}
                                />
                              </button>
                              <span style={{ fontSize: '14px', color: '#222', fontWeight: '500', minWidth: '30px' }}>
                                {requireGuestVerification ? 'ON' : 'OFF'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Contact Verification */}
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '16px' }}>Contact Verification</h3>
                          
                          {/* Email Verification */}
                          <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Email Verification</h4>
                                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Require users to verify their email address.</p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '24px' }}>
                                <button
                                  type="button"
                                  onClick={() => setRequireEmailVerification(!requireEmailVerification)}
                                  style={{
                                    width: '48px',
                                    height: '28px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    backgroundColor: requireEmailVerification ? '#1976d2' : '#ccc',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'background-color 0.2s',
                                    padding: '2px',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      backgroundColor: '#fff',
                                      transform: requireEmailVerification ? 'translateX(20px)' : 'translateX(0)',
                                      transition: 'transform 0.2s',
                                    }}
                                  />
                                </button>
                                <span style={{ fontSize: '14px', color: '#222', fontWeight: '500', minWidth: '30px' }}>
                                  {requireEmailVerification ? 'ON' : 'OFF'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Phone Verification */}
                          <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Phone Verification</h4>
                                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Require users to verify their phone number.</p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '24px' }}>
                                <button
                                  type="button"
                                  onClick={() => setRequirePhoneVerification(!requirePhoneVerification)}
                                  style={{
                                    width: '48px',
                                    height: '28px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    backgroundColor: requirePhoneVerification ? '#1976d2' : '#ccc',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'background-color 0.2s',
                                    padding: '2px',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      backgroundColor: '#fff',
                                      transform: requirePhoneVerification ? 'translateX(20px)' : 'translateX(0)',
                                      transition: 'transform 0.2s',
                                    }}
                                  />
                                </button>
                                <span style={{ fontSize: '14px', color: '#222', fontWeight: '500', minWidth: '30px' }}>
                                  {requirePhoneVerification ? 'ON' : 'OFF'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Booking Safety */}
                        <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Verified Users Only</h3>
                              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Only allow verified users to make bookings.</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '24px' }}>
                              <button
                                type="button"
                                onClick={() => setVerifiedUsersOnly(!verifiedUsersOnly)}
                                style={{
                                  width: '48px',
                                  height: '28px',
                                  borderRadius: '14px',
                                  border: 'none',
                                  backgroundColor: verifiedUsersOnly ? '#1976d2' : '#ccc',
                                  cursor: 'pointer',
                                  position: 'relative',
                                  transition: 'background-color 0.2s',
                                  padding: '2px',
                                }}
                              >
                                <div
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    backgroundColor: '#fff',
                                    transform: verifiedUsersOnly ? 'translateX(20px)' : 'translateX(0)',
                                    transition: 'transform 0.2s',
                                  }}
                                />
                              </button>
                              <span style={{ fontSize: '14px', color: '#222', fontWeight: '500', minWidth: '30px' }}>
                                {verifiedUsersOnly ? 'ON' : 'OFF'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Trust & Rules */}
                        <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <input
                              type="checkbox"
                              checked={requireHouseRulesAgreement}
                              onChange={(e) => setRequireHouseRulesAgreement(e.target.checked)}
                              style={{
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                marginTop: '2px',
                                flexShrink: 0,
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>
                                Require agreement to House Rules & Community Guidelines
                              </h3>
                              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Users must accept rules before booking or listing.</p>
                            </div>
                          </div>
                        </div>

                        {/* Info Text */}
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                          </svg>
                          <p style={{ fontSize: '14px', color: '#666', margin: 0, lineHeight: '1.6' }}>
                            These settings help ensure trust, safety, and accountability for both hosts and guests.
                          </p>
                        </div>

                        {/* Save Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              // TODO: Implement save functionality
                              alert('Settings saved!');
                            }}
                            style={{
                              padding: '12px 24px',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#fff',
                              backgroundColor: '#1976d2',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsSubmenu === 'notifications' && (
                    <div>
                      <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#222", marginBottom: "32px" }}>Notifications</h1>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px' }}>
                        {/* Booking Updates */}
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#222', marginBottom: '16px' }}>Booking Updates</h3>
                          
                          {/* New Booking Alerts */}
                          <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>New Booking Alerts</h4>
                                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Get notified when a new booking is made.</p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '24px' }}>
                                <button
                                  type="button"
                                  onClick={() => setNewBookingAlerts(!newBookingAlerts)}
                                  style={{
                                    width: '48px',
                                    height: '28px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    backgroundColor: newBookingAlerts ? '#1976d2' : '#ccc',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'background-color 0.2s',
                                    padding: '2px',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      backgroundColor: '#fff',
                                      transform: newBookingAlerts ? 'translateX(20px)' : 'translateX(0)',
                                      transition: 'transform 0.2s',
                                    }}
                                  />
                                </button>
                                <span style={{ fontSize: '14px', color: '#222', fontWeight: '500', minWidth: '30px' }}>
                                  {newBookingAlerts ? 'ON' : 'OFF'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Issue Alerts */}
                          <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                                <div>
                                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Issue Alerts</h4>
                                  <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Get notified if hosts or guests report an issue.</p>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '24px' }}>
                                <button
                                  type="button"
                                  onClick={() => setIssueAlerts(!issueAlerts)}
                                  style={{
                                    width: '48px',
                                    height: '28px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    backgroundColor: issueAlerts ? '#1976d2' : '#ccc',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'background-color 0.2s',
                                    padding: '2px',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      backgroundColor: '#fff',
                                      transform: issueAlerts ? 'translateX(20px)' : 'translateX(0)',
                                      transition: 'transform 0.2s',
                                    }}
                                  />
                                </button>
                                <span style={{ fontSize: '14px', color: '#222', fontWeight: '500', minWidth: '30px' }}>
                                  {issueAlerts ? 'ON' : 'OFF'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Rebooking Requests */}
                          <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                                </svg>
                                <div>
                                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Rebooking Requests</h4>
                                  <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Get notified when a guest requests to rebook.</p>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '24px' }}>
                                <button
                                  type="button"
                                  onClick={() => setRebookingRequests(!rebookingRequests)}
                                  style={{
                                    width: '48px',
                                    height: '28px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    backgroundColor: rebookingRequests ? '#1976d2' : '#ccc',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'background-color 0.2s',
                                    padding: '2px',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      backgroundColor: '#fff',
                                      transform: rebookingRequests ? 'translateX(20px)' : 'translateX(0)',
                                      transition: 'transform 0.2s',
                                    }}
                                  />
                                </button>
                                <span style={{ fontSize: '14px', color: '#222', fontWeight: '500', minWidth: '30px' }}>
                                  {rebookingRequests ? 'ON' : 'OFF'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Payment Updates */}
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#222', marginBottom: '16px' }}>Payment Updates</h3>
                          
                          {/* Payout Alerts */}
                          <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Payout Alerts</h4>
                                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Get notified when a payout is sent to you.</p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '24px' }}>
                                <button
                                  type="button"
                                  onClick={() => setPayoutAlerts(!payoutAlerts)}
                                  style={{
                                    width: '48px',
                                    height: '28px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    backgroundColor: payoutAlerts ? '#1976d2' : '#ccc',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'background-color 0.2s',
                                    padding: '2px',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      backgroundColor: '#fff',
                                      transform: payoutAlerts ? 'translateX(20px)' : 'translateX(0)',
                                      transition: 'transform 0.2s',
                                    }}
                                  />
                                </button>
                                <span style={{ fontSize: '14px', color: '#222', fontWeight: '500', minWidth: '30px' }}>
                                  {payoutAlerts ? 'ON' : 'OFF'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Failed Payment Alerts */}
                          <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Failed Payment Alerts</h4>
                                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Get notified if a host payout or guest payment fails.</p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '24px' }}>
                                <button
                                  type="button"
                                  onClick={() => setFailedPaymentAlerts(!failedPaymentAlerts)}
                                  style={{
                                    width: '48px',
                                    height: '28px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    backgroundColor: failedPaymentAlerts ? '#1976d2' : '#ccc',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'background-color 0.2s',
                                    padding: '2px',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      backgroundColor: '#fff',
                                      transform: failedPaymentAlerts ? 'translateX(20px)' : 'translateX(0)',
                                      transition: 'transform 0.2s',
                                    }}
                                  />
                                </button>
                                <span style={{ fontSize: '14px', color: '#222', fontWeight: '500', minWidth: '30px' }}>
                                  {failedPaymentAlerts ? 'ON' : 'OFF'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Review Updates */}
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#222', marginBottom: '16px' }}>Review Updates</h3>
                          
                          {/* New Review Alerts */}
                          <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>New Review Alerts</h4>
                                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Get notified when you receive a new review.</p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '24px' }}>
                                <button
                                  type="button"
                                  onClick={() => setNewReviewAlerts(!newReviewAlerts)}
                                  style={{
                                    width: '48px',
                                    height: '28px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    backgroundColor: newReviewAlerts ? '#1976d2' : '#ccc',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'background-color 0.2s',
                                    padding: '2px',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      backgroundColor: '#fff',
                                      transform: newReviewAlerts ? 'translateX(20px)' : 'translateX(0)',
                                      transition: 'transform 0.2s',
                                    }}
                                  />
                                </button>
                                <span style={{ fontSize: '14px', color: '#222', fontWeight: '500', minWidth: '30px' }}>
                                  {newReviewAlerts ? 'ON' : 'OFF'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Report Alerts */}
                          <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Report Alerts</h4>
                                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Get notified if a review is reported by a host or guest.</p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '24px' }}>
                                <button
                                  type="button"
                                  onClick={() => setReportAlerts(!reportAlerts)}
                                  style={{
                                    width: '48px',
                                    height: '28px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    backgroundColor: reportAlerts ? '#1976d2' : '#ccc',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'background-color 0.2s',
                                    padding: '2px',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      backgroundColor: '#fff',
                                      transform: reportAlerts ? 'translateX(20px)' : 'translateX(0)',
                                      transition: 'transform 0.2s',
                                    }}
                                  />
                                </button>
                                <span style={{ fontSize: '14px', color: '#222', fontWeight: '500', minWidth: '30px' }}>
                                  {reportAlerts ? 'ON' : 'OFF'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Info Text */}
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                          </svg>
                          <p style={{ fontSize: '14px', color: '#666', margin: 0, lineHeight: '1.6' }}>
                            Receive important updates and alerts about bookings, payments, and reviews.
                          </p>
                        </div>

                        {/* Save Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              // TODO: Implement save functionality
                              alert('Settings saved!');
                            }}
                            style={{
                              padding: '12px 24px',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#fff',
                              backgroundColor: '#1976d2',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsSubmenu === 'legal' && (
                    <div>
                      <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#222", marginBottom: "32px" }}>Legal & System</h1>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
                        {/* Terms of Service */}
                        <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Terms of Service</h3>
                              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Review and update the terms of service.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                // TODO: Implement update functionality
                                alert('Terms of Service update coming soon!');
                              }}
                              style={{
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#666',
                                backgroundColor: '#f5f5f5',
                                border: '1px solid #e6e6e6',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                marginLeft: '24px',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#e6e6e6';
                                e.currentTarget.style.borderColor = '#ccc';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f5f5f5';
                                e.currentTarget.style.borderColor = '#e6e6e6';
                              }}
                            >
                              Update...
                            </button>
                          </div>
                        </div>

                        {/* Privacy Policy */}
                        <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Privacy Policy</h3>
                              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Review and update the privacy policy.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                // TODO: Implement update functionality
                                alert('Privacy Policy update coming soon!');
                              }}
                              style={{
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#666',
                                backgroundColor: '#f5f5f5',
                                border: '1px solid #e6e6e6',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                marginLeft: '24px',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#e6e6e6';
                                e.currentTarget.style.borderColor = '#ccc';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f5f5f5';
                                e.currentTarget.style.borderColor = '#e6e6e6';
                              }}
                            >
                              Update...
                            </button>
                          </div>
                        </div>

                        {/* Philippine Data Privacy Act (DPA) Compliance */}
                        <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Philippine Data Privacy Act (DPA) Compliance</h3>
                              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Display a data privacy consent notice for PH users.</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '24px' }}>
                              <button
                                type="button"
                                onClick={() => setDpaCompliance(!dpaCompliance)}
                                style={{
                                  width: '48px',
                                  height: '28px',
                                  borderRadius: '14px',
                                  border: 'none',
                                  backgroundColor: dpaCompliance ? '#1976d2' : '#ccc',
                                  cursor: 'pointer',
                                  position: 'relative',
                                  transition: 'background-color 0.2s',
                                  padding: '2px',
                                }}
                              >
                                <div
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    backgroundColor: '#fff',
                                    transform: dpaCompliance ? 'translateX(20px)' : 'translateX(0)',
                                    transition: 'transform 0.2s',
                                  }}
                                />
                              </button>
                              <span style={{ fontSize: '14px', color: '#222', fontWeight: '500', minWidth: '30px' }}>
                                {dpaCompliance ? 'ON' : 'OFF'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Tax Settings */}
                        <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Tax Settings</h3>
                              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Manage taxes like local sales tax settings.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                // TODO: Implement configure functionality
                                alert('Tax Settings configuration coming soon!');
                              }}
                              style={{
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#666',
                                backgroundColor: '#f5f5f5',
                                border: '1px solid #e6e6e6',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                marginLeft: '24px',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#e6e6e6';
                                e.currentTarget.style.borderColor = '#ccc';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f5f5f5';
                                e.currentTarget.style.borderColor = '#e6e6e6';
                              }}
                            >
                              Configure...
                            </button>
                          </div>
                        </div>

                        {/* Data Export */}
                        <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Data Export</h3>
                              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Export user and booking data in CSV format.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                // TODO: Implement CSV export functionality
                                alert('CSV export coming soon!');
                              }}
                              style={{
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#666',
                                backgroundColor: '#f5f5f5',
                                border: '1px solid #e6e6e6',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                marginLeft: '24px',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#e6e6e6';
                                e.currentTarget.style.borderColor = '#ccc';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f5f5f5';
                                e.currentTarget.style.borderColor = '#e6e6e6';
                              }}
                            >
                              Download CSV...
                            </button>
                          </div>
                        </div>

                        {/* Info Text */}
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                          </svg>
                          <p style={{ fontSize: '14px', color: '#666', margin: 0, lineHeight: '1.6' }}>
                            Adjust legal documents, GDPR compliance, and system settings for your platform.
                          </p>
                        </div>

                        {/* Save Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              // TODO: Implement save functionality
                              alert('Settings saved!');
                            }}
                            style={{
                              padding: '12px 24px',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#fff',
                              backgroundColor: '#1976d2',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Content based on active menu */}
            <div style={{ color: "#666", fontSize: "16px", lineHeight: "1.6" }}>
              {activeMenu === 'analytics' && (
                <div>
                  {/* Navigation Tabs */}
                  <div style={{ display: "flex", gap: "32px", marginBottom: "32px", borderBottom: "1px solid #e6e6e6" }}>
                    {[
                      { id: 'overview', label: 'Overview' },
                      { id: 'bookings', label: 'Bookings' },
                      { id: 'revenue', label: 'Revenue' },
                      { id: 'users', label: 'Users' },
                      { id: 'venues', label: 'Venues' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setAnalyticsTab(tab.id as any)}
                        style={{
                          padding: "12px 0",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: analyticsTab === tab.id ? "500" : "400",
                          color: analyticsTab === tab.id ? "#1976d2" : "#666",
                          borderBottom: analyticsTab === tab.id ? "2px solid #1976d2" : "2px solid transparent",
                          marginBottom: "-1px",
                          transition: "all 0.2s",
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {analyticsTab === 'overview' && (
                    <div>
                      {/* KPI Cards */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0", marginBottom: "32px" }}>
                        {/* Bookings Today */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", border: "none" }}>
                          <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>Bookings Today</div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "8px" }}>
                            <div style={{ fontSize: "28px", fontWeight: "600", color: "#222" }}>
                              {analyticsData.bookingsToday}
                          </div>
                            {analyticsData.bookingsTodayChange > 0 && (
                              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "14px", color: "#22c55e" }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="18 15 12 9 6 15" />
                                </svg>
                                {Math.abs(analyticsData.bookingsTodayChange)}%
                        </div>
                            )}
                          </div>
                        </div>
                        {/* Revenue (MTD) */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", border: "none" }}>
                          <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>Revenue (MTD)</div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "8px" }}>
                            <div style={{ fontSize: "28px", fontWeight: "600", color: "#222" }}>
                              {analyticsData.revenueMTD >= 1000000 
                                ? `₱${(analyticsData.revenueMTD / 1000000).toFixed(1)}M`
                                : analyticsData.revenueMTD >= 1000
                                ? `₱${(analyticsData.revenueMTD / 1000).toFixed(0)}k`
                                : `₱${analyticsData.revenueMTD.toLocaleString()}`}
                          </div>
                            {analyticsData.revenueMTDChange > 0 && (
                              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "14px", color: "#22c55e" }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="18 15 12 9 6 15" />
                                </svg>
                                {Math.abs(analyticsData.revenueMTDChange)}%
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Active Venues */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", border: "none" }}>
                          <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>Active Venues</div>
                          <div style={{ fontSize: "28px", fontWeight: "600", color: "#222", marginBottom: "8px" }}>
                            {analyticsData.activeVenues}
                          </div>
                        </div>
                        {/* Issues */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", border: "none" }}>
                          <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>Issues</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                              <line x1="12" y1="9" x2="12" y2="13" />
                              <circle cx="12" cy="17" r="0.5" fill="#ef4444" />
                            </svg>
                            <div style={{ fontSize: "28px", fontWeight: "600", color: "#222" }}>
                              {analyticsData.activeDisputes + analyticsData.unverifiedVenues}
                          </div>
                          </div>
                          <div style={{ fontSize: "12px", color: "#ef4444" }}>disputes + unverified</div>
                        </div>
                      </div>

                      {/* Summary Chart */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0", marginBottom: "32px" }}>
                        {/* Bookings Overview Chart */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "24px", border: "none" }}>
                          <div style={{ marginBottom: "16px" }}>
                            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#222", margin: "0 0 4px 0" }}>Bookings Overview</h3>
                          </div>
                          <div style={{ height: "300px", padding: "20px", border: "1px solid #e6e6e6", borderRadius: "4px", backgroundColor: "#fafafa" }}>
                            {(() => {
                              // Get all bookings from localStorage (same method as loadAnalyticsData)
                              const allBookings: any[] = [];
                              for (let i = 0; i < localStorage.length; i++) {
                                const key = localStorage.key(i);
                                if (key && (key.startsWith('upcomingBookings_') || key.startsWith('completedBookings_') || key.startsWith('cancelledBookings_'))) {
                                  try {
                                    const bookings = JSON.parse(localStorage.getItem(key) || '[]');
                                    if (Array.isArray(bookings)) {
                                      allBookings.push(...bookings);
                                    }
                                  } catch (e) {
                                    console.error('Error parsing bookings:', e);
                                  }
                                }
                              }
                              
                              // Generate monthly data for last 4 months
                              const months = ['Jan', 'Feb', 'Mar', 'Apr'];
                              const today = new Date();
                              const currentMonth = today.getMonth();
                              const currentYear = today.getFullYear();
                              
                              // Calculate monthly totals for last 4 months
                              const monthlyBookings: number[] = [];
                              const monthlyCancellations: number[] = [];
                              const barData: number[][] = [];
                              
                              for (let i = 3; i >= 0; i--) {
                                const monthDate = new Date(currentYear, currentMonth - i, 1);
                                const nextMonthDate = new Date(currentYear, currentMonth - i + 1, 1);
                                
                                // Get all bookings for this month
                                const monthBookings = allBookings.filter((b: any) => {
                                  const bookingDate = b.createdAt || b.date || b.checkIn;
                                  if (!bookingDate) return false;
                                  const bDate = new Date(bookingDate);
                                  return bDate >= monthDate && bDate < nextMonthDate;
                                });
                                
                                const totalBookings = monthBookings.length;
                                
                                // Get cancellations for this month
                                const totalCancellations = monthBookings.filter((b: any) => {
                                  const status = b.status?.toLowerCase();
                                  return status === 'cancelled' || b.cancelled === true;
                                }).length;
                                
                                // Calculate bi-weekly data for bars
                                const firstHalfStart = new Date(monthDate);
                                const firstHalfEnd = new Date(currentYear, currentMonth - i, 15);
                                const secondHalfStart = new Date(currentYear, currentMonth - i, 15);
                                const secondHalfEnd = new Date(nextMonthDate);
                                
                                const firstHalfBookings = allBookings.filter((b: any) => {
                                  const bookingDate = b.createdAt || b.date || b.checkIn;
                                  if (!bookingDate) return false;
                                  const bDate = new Date(bookingDate);
                                  return bDate >= firstHalfStart && bDate < firstHalfEnd;
                                }).length;
                                
                                const secondHalfBookings = allBookings.filter((b: any) => {
                                  const bookingDate = b.createdAt || b.date || b.checkIn;
                                  if (!bookingDate) return false;
                                  const bDate = new Date(bookingDate);
                                  return bDate >= secondHalfStart && bDate < secondHalfEnd;
                                }).length;
                                
                                monthlyBookings.push(totalBookings);
                                monthlyCancellations.push(totalCancellations);
                                barData.push([firstHalfBookings, secondHalfBookings]);
                              }
                              
                              // Calculate max value for scaling (use max of bookings or 150, whichever is higher)
                              const maxBookings = Math.max(...monthlyBookings, 1);
                              const maxValue = Math.max(maxBookings * 1.1, 150); // Add 10% padding for better visualization
                              
                              const bookingsData = monthlyBookings;
                              const cancellationsData = monthlyCancellations;
                              const chartHeight = 200;
                              const chartWidth = 700;
                              const padding = { top: 20, right: 50, bottom: 40, left: 60 };
                              
                              return (
                                <>
                                  <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight + padding.top + padding.bottom}`} style={{ overflow: "visible" }}>
                                    <defs>
                                      <linearGradient id="bookingsOverviewGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#1976d2" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#1976d2" stopOpacity="0.05" />
                                      </linearGradient>
                                    </defs>
                                    
                                  {/* Y-axis labels */}
                                    {[0, 65, 90, 120, 150].map((value, i) => {
                                      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
                                    return (
                                      <g key={i}>
                                          <line x1={padding.left - 5} y1={y} x2={padding.left} y2={y} stroke="#333" strokeWidth="1" />
                                          <text x={padding.left - 10} y={y + 4} fontSize="12" fill="#666" textAnchor="end">
                                            {value}
                                          </text>
                                      </g>
                                    );
                                  })}
                                  
                                  {/* X-axis labels */}
                                    {months.map((month, i) => {
                                      const x = padding.left + (i * (chartWidth - padding.left - padding.right) / (months.length - 1));
                                    return (
                                        <text key={i} x={x} y={chartHeight + padding.top + 20} fontSize="12" fill="#666" textAnchor="middle">
                                          {month}
                                      </text>
                                    );
                                  })}
                                  
                                    {/* Shaded area between bookings and cancellations */}
                                    <path
                                      d={`M ${padding.left},${padding.top + chartHeight - (cancellationsData[0] / maxValue) * chartHeight} ${bookingsData.map((value, i) => {
                                        const x = padding.left + (i * (chartWidth - padding.left - padding.right) / (months.length - 1));
                                        const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
                                        return `L ${x},${y}`;
                                      }).join(' ')} L ${padding.left + ((months.length - 1) * (chartWidth - padding.left - padding.right) / (months.length - 1))},${padding.top + chartHeight - (cancellationsData[cancellationsData.length - 1] / maxValue) * chartHeight} ${cancellationsData.slice().reverse().map((value, i) => {
                                        const revIndex = cancellationsData.length - 1 - i;
                                        const x = padding.left + (revIndex * (chartWidth - padding.left - padding.right) / (months.length - 1));
                                        const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
                                        return `L ${x},${y}`;
                                      }).join(' ')} Z`}
                                      fill="url(#bookingsOverviewGradient)"
                                    />
                                    
                                    {/* Bookings line (blue) */}
                                  <polyline
                                      points={bookingsData.map((value, i) => {
                                        const x = padding.left + (i * (chartWidth - padding.left - padding.right) / (months.length - 1));
                                        const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
                                      return `${x},${y}`;
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#1976d2"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  
                                    {/* Cancellations line (red) */}
                                    <polyline
                                      points={cancellationsData.map((value, i) => {
                                        const x = padding.left + (i * (chartWidth - padding.left - padding.right) / (months.length - 1));
                                        const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
                                        return `${x},${y}`;
                                      }).join(' ')}
                                      fill="none"
                                      stroke="#ef4444"
                                      strokeWidth="3"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />

                                    {/* Data points for Bookings */}
                                    {bookingsData.map((value, i) => {
                                      const x = padding.left + (i * (chartWidth - padding.left - padding.right) / (months.length - 1));
                                      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
                                return (
                                        <circle key={`booking-${i}`} cx={x} cy={y} r="4" fill="#1976d2" stroke="#fff" strokeWidth="2" />
                                );
                                    })}
                                    
                                    {/* Data points for Cancellations */}
                                    {cancellationsData.map((value, i) => {
                                      const x = padding.left + (i * (chartWidth - padding.left - padding.right) / (months.length - 1));
                                      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
                              return (
                                        <circle key={`cancel-${i}`} cx={x} cy={y} r="4" fill="#ef4444" stroke="#fff" strokeWidth="2" />
                                    );
                                  })}
                                  
                                    {/* Bars below */}
                                    {barData.map((bars, monthIndex) => {
                                      const monthX = padding.left + (monthIndex * (chartWidth - padding.left - padding.right) / (months.length - 1));
                                      return bars.map((barValue, barIndex) => {
                                        const barX = monthX - 25 + (barIndex * 30);
                                        const barHeight = Math.max(0, (barValue / maxValue) * chartHeight);
                                        const barY = padding.top + chartHeight - barHeight;
                                    return (
                                          <rect
                                            key={`bar-${monthIndex}-${barIndex}`}
                                            x={barX}
                                            y={barY}
                                            width="20"
                                            height={barHeight}
                                            fill="#1976d2"
                                            opacity="0.7"
                                          />
                                        );
                                      });
                                  })}
                                  
                                  {/* Axes */}
                                    <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} stroke="#333" strokeWidth="2" />
                                    <line x1={padding.left} y1={padding.top + chartHeight} x2={chartWidth - padding.right} y2={padding.top + chartHeight} stroke="#333" strokeWidth="2" />
                                </svg>
                                </>
                              );
                            })()}
                            {/* Legend */}
                            <div style={{ display: "flex", gap: "24px", justifyContent: "center", marginTop: "-8px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ width: "40px", height: "3px", backgroundColor: "#1976d2" }}></div>
                                <span style={{ fontSize: "12px", color: "#666" }}>Bookings</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ width: "40px", height: "3px", backgroundColor: "#ef4444" }}></div>
                                <span style={{ fontSize: "12px", color: "#666" }}>Cancellations</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Section - Two Columns */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", marginBottom: "32px" }}>
                        {/* Needs Attention */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "24px", border: "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                              <line x1="12" y1="9" x2="12" y2="13" />
                              <circle cx="12" cy="17" r="0.5" fill="#fbbf24" />
                            </svg>
                            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#222", margin: 0 }}>Needs Attention</h3>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#1976d2", flexShrink: 0 }}></div>
                              <span style={{ fontSize: "14px", color: "#222" }}>
                                {analyticsData.unverifiedVenuesWithBookings} unverified {analyticsData.unverifiedVenuesWithBookings === 1 ? 'venue' : 'venues'} with bookings
                                  </span>
                                </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#1976d2", flexShrink: 0 }}></div>
                              <span style={{ fontSize: "14px", color: "#222" }}>
                                {analyticsData.pendingPayouts} pending {analyticsData.pendingPayouts === 1 ? 'payout' : 'payouts'}
                              </span>
                          </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#1976d2", flexShrink: 0 }}></div>
                              <span style={{ fontSize: "14px", color: "#222" }}>
                                {analyticsData.activeDisputes} active {analyticsData.activeDisputes === 1 ? 'dispute' : 'disputes'}
                                  </span>
                        </div>
                          </div>
                        </div>

                        {/* Top Venues This Month */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "24px", border: "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#222", margin: 0 }}>Top Venues This Month</h3>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {analyticsData.topVenuesThisMonth.length > 0 ? (
                              analyticsData.topVenuesThisMonth.map((venue, index) => (
                                <div key={index} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  <span style={{ fontSize: "14px", fontWeight: "500", color: "#222", minWidth: "20px" }}>{index + 1}.</span>
                                  <span style={{ fontSize: "14px", color: "#222", flex: 1 }}>{venue.name}</span>
                                  <span style={{ fontSize: "14px", fontWeight: "500", color: "#222" }}>
                                    ₱{venue.revenue >= 1000 ? `${(venue.revenue / 1000).toFixed(0)}k` : venue.revenue.toLocaleString()}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div style={{ fontSize: "14px", color: "#999", fontStyle: "italic", textAlign: "center", padding: "15px" }}>No venue data this month</div>
                            )}
                          </div>
                        </div>
                              </div>

                            </div>
                  )}
                  {analyticsTab === 'bookings' && (
                              <div>
                      {/* Page Title */}
                      <div style={{ marginBottom: "24px" }}>
                        <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#222", margin: 0 }}>Bookings</h1>
                              </div>

                      {/* Search and Filter Bar */}
                      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", alignItems: "center" }}>
                        <div style={{ position: "relative", flex: 1 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                          </svg>
                          <input
                            type="text"
                            placeholder="Search bookings..."
                            style={{
                              width: "100%",
                              padding: "10px 12px 10px 36px",
                              border: "1px solid #e6e6e6",
                              borderRadius: "8px",
                              fontSize: "14px",
                              outline: "none",
                            }}
                          />
                            </div>
                        <select
                          style={{
                            padding: "10px 32px 10px 12px",
                            border: "1px solid #e6e6e6",
                            borderRadius: "8px",
                            fontSize: "14px",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          <option>All Status</option>
                          <option>Confirmed</option>
                          <option>Pending</option>
                          <option>Cancelled</option>
                        </select>
                        <select
                          style={{
                            padding: "10px 32px 10px 12px",
                            border: "1px solid #e6e6e6",
                            borderRadius: "8px",
                            fontSize: "14px",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          <option>All Spaces</option>
                        </select>
                          </div>

                      {/* Bookings Table */}
                      <div style={{ backgroundColor: "#fff", borderRadius: "8px", border: "none", overflow: "hidden" }}>
                        {/* Table Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #e6e6e6" }}>
                          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#222", margin: 0 }}>Bookings</h3>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#666" }}>
                            <span>Page 1 of 5</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>
                      </div>

                        {/* Table */}
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr style={{ borderBottom: "1px solid #e6e6e6", backgroundColor: "#fafafa" }}>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Occasion</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Space</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Date</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Status</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {analyticsData.bookingsData.recentBookings.length > 0 ? (
                                analyticsData.bookingsData.recentBookings.map((booking, index) => {
                                  const statusColor = booking.status === 'confirmed' || booking.status === 'completed' ? '#22c55e' : booking.status === 'cancelled' ? '#ef4444' : '#eab308';
                                  const statusBg = booking.status === 'confirmed' || booking.status === 'completed' ? '#dcfce7' : booking.status === 'cancelled' ? '#fee2e2' : '#fef9c3';
                                  
                                  // Extract event name from booking data, replacing "Insert Event Venue" with "Insert Occasion" for Occasion column
                                  const venueValue = booking.venue || '';
                                  const eventName = venueValue === 'Insert Event Venue' ? 'Insert Occasion' : (venueValue || `Booking ${booking.id}`);
                                  const spaceName = venueValue || 'N/A';
                                  
                                  return (
                                    <tr key={index} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#222", fontWeight: "500" }}>{eventName}</td>
                                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#666" }}>{spaceName}</td>
                                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#666" }}>
                                        {booking.date ? new Date(booking.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                      </td>
                                      <td style={{ padding: "16px 24px" }}>
                                        <span
                                          style={{
                                            display: "inline-block",
                                            padding: "4px 12px",
                                            borderRadius: "12px",
                                            fontSize: "12px",
                                            fontWeight: "500",
                                            backgroundColor: statusBg,
                                            color: statusColor,
                                          }}
                                        >
                                          {booking.status === 'confirmed' || booking.status === 'completed' ? 'Confirmed' : booking.status === 'cancelled' ? 'Cancelled' : booking.status === 'pending' ? 'Pending' : 'Pending'}
                              </span>
                                      </td>
                                      <td style={{ padding: "16px 24px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                          <button
                                            style={{
                                              padding: "6px 12px",
                                              backgroundColor: "transparent",
                                              color: "#1976d2",
                                              border: "1px solid #1976d2",
                                              borderRadius: "6px",
                                              fontSize: "12px",
                                              fontWeight: "500",
                                              cursor: "pointer",
                                            }}
                                          >
                                            View
                                          </button>
                                          <button
                                            style={{
                                              padding: "6px 12px",
                                              backgroundColor: "transparent",
                                              color: "#666",
                                              border: "1px solid #e6e6e6",
                                              borderRadius: "6px",
                                              fontSize: "12px",
                                              fontWeight: "500",
                                              cursor: "pointer",
                                            }}
                                          >
                                            Edit
                                          </button>
                                          <button
                                            style={{
                                              padding: "6px 8px",
                                              backgroundColor: "transparent",
                                              color: "#666",
                                              border: "none",
                                              borderRadius: "6px",
                                              cursor: "pointer",
                                              display: "flex",
                                              alignItems: "center",
                                            }}
                                          >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                              <circle cx="12" cy="12" r="1" />
                                              <circle cx="12" cy="5" r="1" />
                                              <circle cx="12" cy="19" r="1" />
                                            </svg>
                                          </button>
                            </div>
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan={5} style={{ padding: "40px 24px", textAlign: "center", color: "#999", fontSize: "14px" }}>
                                    No bookings found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                            </div>
                            </div>

                      {/* OLD KPI Cards - REMOVED - All old content hidden */}
                      {false && (
                    <div>
                      {/* KPI Cards */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0", marginBottom: "32px" }}>
                        {/* Total Bookings */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", border: "none" }}>
                          <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>Total Bookings</div>
                          <div style={{ fontSize: "28px", fontWeight: "600", color: "#222", marginBottom: "8px" }}>
                            {analyticsData.bookingsData.total.toLocaleString()}
                          </div>
                          <div style={{ fontSize: "12px", color: "#22c55e", display: "flex", alignItems: "center", gap: "4px" }}>
                            <span>+12%</span>
                            <span style={{ fontSize: "10px" }}>this month</span>
                          </div>
                        </div>
                        {/* Pending */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", border: "none" }}>
                          <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>Pending</div>
                          <div style={{ fontSize: "28px", fontWeight: "600", color: "#222", marginBottom: "8px" }}>
                            {analyticsData.bookingsData.pending}
                          </div>
                          <div style={{ fontSize: "12px", color: "#666" }}>Awaiting confirmation</div>
                        </div>
                        {/* Completed */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", border: "none" }}>
                          <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>Completed</div>
                          <div style={{ fontSize: "28px", fontWeight: "600", color: "#222", marginBottom: "8px" }}>
                            {analyticsData.bookingsData.completed.toLocaleString()}
                          </div>
                          <div style={{ fontSize: "12px", color: "#22c55e", display: "flex", alignItems: "center", gap: "4px" }}>
                            <span>+15%</span>
                            <span style={{ fontSize: "10px" }}>this month</span>
                          </div>
                        </div>
                        {/* Cancelled */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", border: "none" }}>
                          <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>Cancelled</div>
                          <div style={{ fontSize: "28px", fontWeight: "600", color: "#222", marginBottom: "8px" }}>
                            {analyticsData.bookingsData.cancelled}
                          </div>
                          <div style={{ fontSize: "12px", color: "#ef4444", display: "flex", alignItems: "center", gap: "4px" }}>
                            <span>{analyticsData.bookingsData.cancellationRate}%</span>
                            <span style={{ fontSize: "10px" }}>rate</span>
                            <span style={{ marginLeft: "8px" }}>+8%</span>
                          </div>
                        </div>
                      </div>

                      {/* Bookings Over Time Chart and Metrics */}
                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0", marginBottom: "32px" }}>
                        {/* Bookings Over Time Chart */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "24px", border: "none" }}>
                          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#222", margin: "0 0 16px 0" }}>Bookings Over Time</h3>
                          {/* Legend */}
                          <div style={{ display: "flex", gap: "24px", marginBottom: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#1976d2" }}></div>
                              <span style={{ fontSize: "12px", color: "#666" }}>Completed</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#f97316" }}></div>
                              <span style={{ fontSize: "12px", color: "#666" }}>Pending</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ef4444" }}></div>
                              <span style={{ fontSize: "12px", color: "#666" }}>Cancelled</span>
                            </div>
                          </div>
                          <div style={{ height: "300px", padding: "20px", border: "1px solid #e6e6e6", borderRadius: "4px", backgroundColor: "#fafafa" }}>
                            {(() => {
                              const bookingsData: Array<{ date: string; completed: number; pending: number; cancelled: number }> = Array.isArray(analyticsData.bookingsOverTimeByStatus) ? analyticsData.bookingsOverTimeByStatus : [];
                              if (!bookingsData || bookingsData.length === 0) {
                                return (
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                                    <span style={{ color: "#999", fontSize: "14px" }}>No booking data available</span>
                                  </div>
                                );
                              }
                              const maxCount = Math.max(...bookingsData.map(d => Math.max(d.completed, d.pending, d.cancelled)), 1);
                              const yAxisSteps = 4;
                              const stepValue = Math.ceil(maxCount / yAxisSteps);
                              return (
                                <svg width="100%" height="100%" viewBox="0 0 800 250" style={{ overflow: "visible" }}>
                                  {/* Y-axis labels */}
                                  {Array.from({ length: yAxisSteps + 1 }, (_, i) => {
                                    const value = stepValue * (yAxisSteps - i);
                                    const y = 20 + (i * 200) / yAxisSteps;
                                    return (
                                      <g key={i}>
                                        <line x1="50" y1={y} x2="750" y2={y} stroke="#e6e6e6" strokeWidth="1" strokeDasharray="2,2" />
                                        <text x="45" y={y + 4} fontSize="12" fill="#666" textAnchor="end">{value}</text>
                                      </g>
                                    );
                                  })}
                                  
                                  {/* X-axis labels */}
                                  {bookingsData.map((d, i) => {
                                    if (i % 5 !== 0) return null;
                                    const x = 50 + (i * 700) / (bookingsData.length - 1);
                                    const date = new Date(d.date);
                                    const month = date.toLocaleDateString('en-US', { month: 'short' });
                                    const day = date.getDate();
                                    return (
                                      <text key={i} x={x} y="240" fontSize="10" fill="#666" textAnchor="middle">
                                        {month} {day}
                                      </text>
                                    );
                                  })}
                                  
                                  {/* Completed line */}
                                  <polyline
                                    points={bookingsData.map((d, i) => {
                                      const x = 50 + (i * 700) / (bookingsData.length - 1);
                                      const y = 220 - (d.completed / maxCount) * 200;
                                      return `${x},${y}`;
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#1976d2"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  
                                  {/* Pending line */}
                                  <polyline
                                    points={bookingsData.map((d, i) => {
                                      const x = 50 + (i * 700) / (bookingsData.length - 1);
                                      const y = 220 - (d.pending / maxCount) * 200;
                                      return `${x},${y}`;
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#f97316"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  
                                  {/* Cancelled line */}
                                  <polyline
                                    points={bookingsData.map((d, i) => {
                                      const x = 50 + (i * 700) / (bookingsData.length - 1);
                                      const y = 220 - (d.cancelled / maxCount) * 200;
                                      return `${x},${y}`;
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  
                                  {/* Data points */}
                                  {bookingsData.map((d, i) => {
                                    const x = 50 + (i * 700) / (bookingsData.length - 1);
                                    return (
                                      <g key={i}>
                                        <circle cx={x} cy={220 - (d.completed / maxCount) * 200} r="4" fill="#1976d2" stroke="#fff" strokeWidth="2" />
                                        <circle cx={x} cy={220 - (d.pending / maxCount) * 200} r="4" fill="#f97316" stroke="#fff" strokeWidth="2" />
                                        <circle cx={x} cy={220 - (d.cancelled / maxCount) * 200} r="4" fill="#ef4444" stroke="#fff" strokeWidth="2" />
                                      </g>
                                    );
                                  })}
                                  
                                  {/* Axes */}
                                  <line x1="50" y1="20" x2="50" y2="220" stroke="#333" strokeWidth="2" />
                                  <line x1="50" y1="220" x2="750" y2="220" stroke="#333" strokeWidth="2" />
                                </svg>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Metrics Cards */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                          {/* Booking Conversion */}
                          <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", border: "none" }}>
                            <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>Booking Conversion</div>
                            <div style={{ fontSize: "28px", fontWeight: "600", color: "#222", marginBottom: "8px" }}>
                              {analyticsData.bookingsData.conversionRate}%
                            </div>
                            <div style={{ fontSize: "12px", color: "#22c55e", display: "flex", alignItems: "center", gap: "4px" }}>
                              <span>+1.5%</span>
                              <span style={{ fontSize: "10px" }}>Confirmed</span>
                            </div>
                            <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>Up this month</div>
                          </div>
                          
                          {/* Average Booking Value */}
                          <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", border: "none" }}>
                            <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>Average Booking Value</div>
                            <div style={{ fontSize: "28px", fontWeight: "600", color: "#222", marginBottom: "8px" }}>
                              ₱{analyticsData.bookingsData.averageBookingValue.toLocaleString()}
                            </div>
                            <div style={{ fontSize: "12px", color: "#666" }}>
                              {analyticsData.bookingsData.pending} Pending {analyticsData.bookingsData.completed} Confirmed
                            </div>
                          </div>
                          
                          {/* Cancellation Rate */}
                          <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", border: "none" }}>
                            <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>Cancellation Rate</div>
                            <div style={{ fontSize: "28px", fontWeight: "600", color: "#222", marginBottom: "8px" }}>
                              {analyticsData.bookingsData.cancellationRate}%
                            </div>
                            <div style={{ fontSize: "12px", color: "#ef4444", display: "flex", alignItems: "center", gap: "4px" }}>
                              <span>+6%</span>
                              <span style={{ marginLeft: "8px" }}>+8%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Top Hosts and Top Venues */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", marginBottom: "32px" }}>
                        {/* Top Hosts */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "24px", border: "none" }}>
                          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#222", margin: "0 0 20px 0" }}>Top Hosts</h3>
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {analyticsData.bookingsData.topHosts.length > 0 ? (
                              analyticsData.bookingsData.topHosts.map((host, index) => (
                                <div key={index} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", backgroundColor: "#fafafa", borderRadius: "6px" }}>
                                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#e6e6e6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "600", color: "#666" }}>
                                    {host.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "14px", fontWeight: "500", color: "#222" }}>{host.name}</div>
                                    <div style={{ fontSize: "12px", color: "#666" }}>{host.bookings} Bookings</div>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: host.status === 'Confirmed' ? "#22c55e" : host.status === 'Cancelled' ? "#ef4444" : "#f97316" }}></div>
                                    <span style={{ fontSize: "12px", color: "#666" }}>{host.status}</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div style={{ fontSize: "14px", color: "#999", fontStyle: "italic", textAlign: "center", padding: "20px" }}>No host data available</div>
                            )}
                          </div>
                        </div>

                        {/* Top Venues */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "24px", border: "none" }}>
                          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#222", margin: "0 0 20px 0" }}>Top Venues</h3>
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {analyticsData.bookingsData.topVenues.length > 0 ? (
                              analyticsData.bookingsData.topVenues.map((venue, index) => (
                                <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "#fafafa", borderRadius: "6px" }}>
                                  <div>
                                    <div style={{ fontSize: "14px", fontWeight: "500", color: "#222" }}>{venue.name}</div>
                                    <div style={{ fontSize: "12px", color: "#666" }}>{venue.bookings} Bookings</div>
                                  </div>
                                  <div style={{ display: "flex", gap: "2px" }}>
                                    {Array.from({ length: venue.rating }).map((_, i) => (
                                      <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                      </svg>
                                    ))}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div style={{ fontSize: "14px", color: "#999", fontStyle: "italic", textAlign: "center", padding: "20px" }}>No venue data available</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Calendar, Location Chart, and Activity */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0", marginBottom: "32px" }}>
                        {/* Calendar */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "24px", border: "none" }}>
                          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#222", margin: "0 0 16px 0" }}>April 2024</h3>
                          <div style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}>
                            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </div>
                          {/* Simple calendar grid */}
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                              <div key={day} style={{ fontSize: "10px", color: "#666", textAlign: "center", padding: "4px" }}>{day}</div>
                            ))}
                            {Array.from({ length: 30 }).map((_, i) => {
                              const day = i + 1;
                              const hasBookings = Math.random() > 0.7; // Placeholder logic
                              return (
                                <div key={i} style={{ fontSize: "12px", textAlign: "center", padding: "8px", borderRadius: "4px", backgroundColor: hasBookings ? "#f0f9ff" : "transparent" }}>
                                  {day}
                                  {hasBookings && (
                                    <div style={{ display: "flex", justifyContent: "center", gap: "2px", marginTop: "2px" }}>
                                      <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#22c55e" }}></div>
                                      <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#f97316" }}></div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Location Distribution (Pie Chart) */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "24px", border: "none" }}>
                          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#222", margin: "0 0 16px 0" }}>April 2024</h3>
                          <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                            {analyticsData.bookingsData.bookingsByLocation.length > 0 ? (
                              <svg width="180" height="180" viewBox="0 0 200 200">
                                {(() => {
                                  let currentAngle = -90;
                                  const colors = ['#1976d2', '#22c55e', '#f97316'];
                                  return analyticsData.bookingsData.bookingsByLocation.map((loc, i) => {
                                    const angle = (loc.percentage / 100) * 360;
                                    const startAngle = currentAngle;
                                    const endAngle = currentAngle + angle;
                                    currentAngle = endAngle;
                                    
                                    const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
                                    const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
                                    const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
                                    const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);
                                    const largeArc = angle > 180 ? 1 : 0;
                                    
                                    return (
                                      <path
                                        key={i}
                                        d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                        fill={colors[i % colors.length]}
                                      />
                                    );
                                  });
                                })()}
                              </svg>
                            ) : (
                              <div style={{ fontSize: "12px", color: "#999" }}>No location data</div>
                            )}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {analyticsData.bookingsData.bookingsByLocation.map((loc, i) => {
                              const colors = ['#1976d2', '#22c55e', '#f97316'];
                              return (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <div style={{ width: "12px", height: "12px", borderRadius: "2px", backgroundColor: colors[i % colors.length] }}></div>
                                  <span style={{ fontSize: "12px", color: "#666" }}>{loc.location}: {Math.round(loc.percentage)}%</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Activity Map */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "24px", border: "none" }}>
                          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#222", margin: "0 0 16px 0" }}>Activity</h3>
                          <div style={{ height: "200px", backgroundColor: "#fafafa", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                            <div style={{ fontSize: "12px", color: "#999" }}>Map visualization</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#1976d2" }}></div>
                              <span style={{ fontSize: "12px", color: "#666" }}>Confirmed {analyticsData.bookingsData.completed}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#f97316" }}></div>
                              <span style={{ fontSize: "12px", color: "#666" }}>Pending {analyticsData.bookingsData.pending}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recent Bookings and Activity List */}
                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0" }}>
                        {/* Recent Bookings Table */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "24px", border: "none" }}>
                          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#222", margin: "0 0 20px 0" }}>Recent Bookings</h3>
                          <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <thead>
                                <tr style={{ borderBottom: "1px solid #e6e6e6" }}>
                                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666" }}>ID</th>
                                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666" }}>Venue</th>
                                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666" }}>Host</th>
                                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666" }}>Status</th>
                                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666" }}>Date</th>
                                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666" }}>Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                {analyticsData.bookingsData.recentBookings.length > 0 ? (
                                  analyticsData.bookingsData.recentBookings.map((booking, index) => (
                                    <tr key={index} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                      <td style={{ padding: "12px", fontSize: "14px", color: "#222" }}>{booking.id}</td>
                                      <td style={{ padding: "12px", fontSize: "14px", color: "#222" }}>{booking.venue}</td>
                                      <td style={{ padding: "12px", fontSize: "14px", color: "#222" }}>{booking.host}</td>
                                      <td style={{ padding: "12px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: booking.status === 'confirmed' || booking.status === 'completed' ? "#22c55e" : booking.status === 'cancelled' ? "#ef4444" : "#f97316" }}></div>
                                          <span style={{ fontSize: "14px", color: "#222", textTransform: "capitalize" }}>{booking.status}</span>
                                        </div>
                                      </td>
                                      <td style={{ padding: "12px", fontSize: "14px", color: "#222" }}>
                                        {booking.date ? new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                      </td>
                                      <td style={{ padding: "12px", fontSize: "14px", fontWeight: "500", color: "#222" }}>
                                        ₱{typeof booking.amount === 'number' ? booking.amount.toLocaleString() : booking.amount}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={6} style={{ padding: "20px", textAlign: "center", fontSize: "14px", color: "#999" }}>No recent bookings</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Activity Map List */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "24px", border: "none" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#222", margin: 0 }}>Activity Map</h3>
                            <span style={{ fontSize: "14px", color: "#1976d2", cursor: "pointer" }}>{"›"}</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {analyticsData.bookingsOverTimeByStatus && analyticsData.bookingsOverTimeByStatus.length > 0 ? (
                              analyticsData.bookingsOverTimeByStatus
                                .filter((d, i) => i % 7 === 0) // Show weekly
                                .slice(-5)
                                .map((d, i) => {
                                  const date = new Date(d.date);
                                  return (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px", backgroundColor: "#fafafa", borderRadius: "4px" }}>
                                      <span style={{ fontSize: "12px", color: "#666" }}>
                                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </span>
                                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#1976d2" }}></div>
                                          <span style={{ fontSize: "11px", color: "#666" }}>{d.completed}</span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#f97316" }}></div>
                                          <span style={{ fontSize: "11px", color: "#666" }}>{d.pending}</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                            ) : (
                              <div style={{ fontSize: "12px", color: "#999", textAlign: "center", padding: "20px" }}>No activity data</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                    </div>
                  )}
                  {analyticsTab === 'revenue' && (
                    <div>
                      {/* KPI Cards */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0", marginBottom: "32px" }}>
                        {/* Current Month Revenue */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", border: "none" }}>
                          <div style={{ fontSize: "18px", color: "#666", marginBottom: "12px", fontWeight: "500" }}>
                            Current Month Revenue
                          </div>
                          <div style={{ fontSize: "36px", fontWeight: "600", color: "#222" }}>
                            ₱{(analyticsData.revenueMTD || 0).toLocaleString()}
                        </div>
                        </div>

                        {/* Revenue YTD */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", border: "none" }}>
                          <div style={{ fontSize: "18px", color: "#666", marginBottom: "12px", fontWeight: "500" }}>
                            Revenue YTD
                          </div>
                          <div style={{ fontSize: "36px", fontWeight: "600", color: "#222" }}>
                            ₱{(analyticsData.revenueYTD || 0).toLocaleString()}
                        </div>
                      </div>

                        {/* Pending Payments */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", border: "none" }}>
                          <div style={{ fontSize: "18px", color: "#666", marginBottom: "12px", fontWeight: "500" }}>
                            Pending Payments
                          </div>
                          <div style={{ fontSize: "36px", fontWeight: "600", color: "#222" }}>
                            ₱{(analyticsData.pendingPayouts || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Charts Row */}
                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0", marginBottom: "32px" }}>
                        {/* Revenue Overview Chart */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "24px", border: "none", position: "relative" }}>
                          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#222", margin: "0 0 24px 0" }}>Revenue Overview</h3>
                          <div style={{ height: "300px", position: "relative" }}>
                            {(() => {
                              // Generate monthly data for last 4 months using sample data based on current metrics
                              const months = ['Jan', 'Feb', 'Mar', 'Apr'];
                              const monthlyRevenue = [
                                analyticsData.revenueMTD * 0.6,
                                analyticsData.revenueMTD * 0.8,
                                analyticsData.revenueMTD * 0.6,
                                analyticsData.revenueMTD
                              ];
                              const pendingPayments = [
                                analyticsData.pendingPayouts * 0.5,
                                analyticsData.pendingPayouts * 0.8,
                                analyticsData.pendingPayouts * 0.5,
                                analyticsData.pendingPayouts * 0.7
                              ];
                              
                              // Calculate monthly breakdown (15% commission, 85% host payouts, refunds from cancelled bookings)
                              const monthlyBreakdown = monthlyRevenue.map((revenue) => {
                                const commissions = revenue * 0.15;
                                const hostPayouts = revenue * 0.85;
                                const refunds = revenue * 0.08; // Sample refunds (8% of revenue)
                                return { commissions, hostPayouts, refunds };
                              });
                              
                              const maxValue = Math.max(...monthlyRevenue, ...pendingPayments, 10000);
                              const chartHeight = 220;
                              const chartWidth = 700;
                              const padding = { top: 20, right: 50, bottom: 40, left: 60 };
                              
                              const handleMonthHover = (index: number, event: React.MouseEvent<SVGElement>) => {
                                setHoveredMonthIndex(index);
                                setTooltipPosition({ x: event.clientX, y: event.clientY });
                              };
                              
                              const handleMonthLeave = () => {
                                setHoveredMonthIndex(null);
                                setTooltipPosition(null);
                              };
                              
                              return (
                                <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight + padding.top + padding.bottom}`} style={{ overflow: "visible" }}>
                                  {/* Y-axis labels */}
                                  {[0, 10000, 20000, 30000].map((value, i) => {
                                    const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
                                    return (
                                      <g key={i}>
                                        <line x1={padding.left - 5} y1={y} x2={padding.left} y2={y} stroke="#333" strokeWidth="1" />
                                        <text x={padding.left - 10} y={y + 4} fontSize="12" fill="#666" textAnchor="end">
                                          {value === 0 ? '0' : `${value / 1000}k`}
                                        </text>
                                      </g>
                                    );
                                  })}
                                  
                                  {/* X-axis labels */}
                                  {months.map((month, i) => {
                                    const x = padding.left + (i * (chartWidth - padding.left - padding.right) / (months.length - 1));
                                    return (
                                      <text key={i} x={x} y={chartHeight + padding.top + 20} fontSize="12" fill="#666" textAnchor="middle">
                                        {month}
                                      </text>
                                    );
                                  })}
                                  
                                  {/* Bars for Pending Payments */}
                                  {pendingPayments.map((value, i) => {
                                    const x = padding.left + (i * (chartWidth - padding.left - padding.right) / (months.length - 1)) - 30;
                                    const barWidth = 60;
                                    const barHeight = (value / maxValue) * chartHeight;
                                    const y = padding.top + chartHeight - barHeight;
                                    return (
                                      <rect
                                        key={i}
                                        x={x}
                                        y={y}
                                        width={barWidth}
                                        height={barHeight}
                                        fill="#1976d2"
                                        opacity="0.6"
                                      />
                                    );
                                  })}
                                  
                                  {/* Line for Monthly Revenue */}
                                  <polyline
                                    points={monthlyRevenue.map((value, i) => {
                                      const x = padding.left + (i * (chartWidth - padding.left - padding.right) / (months.length - 1));
                                      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
                                      return `${x},${y}`;
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#1976d2"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  
                                  {/* Data points with hover areas */}
                                  {monthlyRevenue.map((value, i) => {
                                    const x = padding.left + (i * (chartWidth - padding.left - padding.right) / (months.length - 1));
                                    const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
                                    return (
                                      <g key={i}>
                                        {/* Invisible hover area */}
                                        <rect
                                          x={x - 40}
                                          y={padding.top - 10}
                                          width={80}
                                          height={chartHeight + 20}
                                          fill="transparent"
                                          onMouseEnter={(e) => handleMonthHover(i, e)}
                                          onMouseLeave={handleMonthLeave}
                                          style={{ cursor: 'pointer' }}
                                        />
                                        <circle cx={x} cy={y} r="5" fill="#1976d2" stroke="#fff" strokeWidth="2" />
                                      </g>
                                    );
                                  })}
                                  
                                  {/* Axes */}
                                  <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} stroke="#333" strokeWidth="2" />
                                  <line x1={padding.left} y1={padding.top + chartHeight} x2={chartWidth - padding.right} y2={padding.top + chartHeight} stroke="#333" strokeWidth="2" />
                                  
                            </svg>
                              );
                            })()}
                            </div>
                          {/* Legend */}
                          <div style={{ display: "flex", gap: "24px", justifyContent: "center", marginTop: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ width: "40px", height: "3px", backgroundColor: "#1976d2" }}></div>
                              <span style={{ fontSize: "12px", color: "#666" }}>Monthly Revenue</span>
                          </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ width: "30px", height: "10px", backgroundColor: "#1976d2", opacity: 0.6 }}></div>
                              <span style={{ fontSize: "12px", color: "#666" }}>Pending Payments</span>
                            </div>
                          </div>
                          {/* Hover Tooltip */}
                          {hoveredMonthIndex !== null && tooltipPosition && (() => {
                            const months = ['Jan', 'Feb', 'Mar', 'Apr'];
                            const monthlyRevenue = [
                              analyticsData.revenueMTD * 0.6,
                              analyticsData.revenueMTD * 0.8,
                              analyticsData.revenueMTD * 0.6,
                              analyticsData.revenueMTD
                            ];
                            const revenue = monthlyRevenue[hoveredMonthIndex];
                            const commissions = revenue * 0.15;
                            const hostPayouts = revenue * 0.85;
                            const refunds = revenue * 0.08;
                            return (
                              <div
                                style={{
                                  position: "fixed",
                                  left: `${tooltipPosition.x + 20}px`,
                                  top: `${tooltipPosition.y - 100}px`,
                                  backgroundColor: "#fff",
                                  border: "1px solid #e6e6e6",
                                  borderRadius: "8px",
                                  padding: "16px",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                  zIndex: 1000,
                                  minWidth: "200px",
                                  pointerEvents: "none"
                                }}
                              >
                                <div style={{ fontSize: "14px", fontWeight: "600", color: "#222", marginBottom: "12px" }}>
                                  {months[hoveredMonthIndex]} 24
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#1976d2" }}></div>
                                      <span style={{ fontSize: "14px", color: "#666" }}>Commissions</span>
                                    </div>
                                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#222" }}>
                                      ₱{Math.round(commissions).toLocaleString()}
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#4caf50" }}></div>
                                      <span style={{ fontSize: "14px", color: "#666" }}>Host Payouts</span>
                                    </div>
                                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#222" }}>
                                      ₱{Math.round(hostPayouts).toLocaleString()}
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ff9800" }}></div>
                                      <span style={{ fontSize: "14px", color: "#666" }}>Refunds</span>
                                    </div>
                                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#222" }}>
                                      ₱{Math.round(refunds).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Top Revenue Sources */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "24px", border: "none" }}>
                          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#222", margin: "0 0 20px 0" }}>Top Revenue Sources</h3>
                          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {analyticsData.topVenuesThisMonth.slice(0, 4).map((venue, index) => (
                              <div key={index} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "60px", height: "60px", borderRadius: "8px", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: "14px", fontWeight: "500", color: "#222", marginBottom: "4px" }}>
                                    {venue.name || 'Unknown Venue'}
                          </div>
                                  <div style={{ fontSize: "16px", fontWeight: "600", color: "#222" }}>
                                    ₱{venue.revenue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                            ))}
                            {analyticsData.topVenuesThisMonth.length === 0 && (
                              <div style={{ fontSize: "14px", color: "#999", textAlign: "center", padding: "20px" }}>
                                No revenue data available
                    </div>
                  )}
                          </div>
                        </div>
                      </div>

                      {/* Recent Payments Table */}
                      <div style={{ backgroundColor: "#fff", borderRadius: "8px", border: "none", overflow: "hidden" }}>
                        <div style={{ padding: "24px", borderBottom: "1px solid #e6e6e6" }}>
                          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#222", margin: 0 }}>Recent Payments</h3>
                        </div>
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr style={{ borderBottom: "1px solid #e6e6e6", backgroundColor: "#fafafa" }}>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Space</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Client</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Amount</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {analyticsData.bookingsData.recentBookings.length > 0 ? (
                                analyticsData.bookingsData.recentBookings.slice(0, 5).map((booking, index) => {
                                  const isPaid = booking.status === 'confirmed' || booking.status === 'completed';
                                  return (
                                    <tr key={index} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#222", fontWeight: "500" }}>
                                        {booking.venue || 'N/A'}
                                      </td>
                                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#666" }}>
                                        {booking.host || 'N/A'}
                                      </td>
                                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#222", fontWeight: "500" }}>
                                        ₱{typeof booking.amount === 'number' ? booking.amount.toLocaleString() : booking.amount}
                                      </td>
                                      <td style={{ padding: "16px 24px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                          <span
                                            style={{
                                              display: "inline-block",
                                              padding: "4px 12px",
                                              borderRadius: "12px",
                                              fontSize: "12px",
                                              fontWeight: "500",
                                              backgroundColor: isPaid ? "#dcfce7" : "#fee2e2",
                                              color: isPaid ? "#22c55e" : "#ef4444",
                                            }}
                                          >
                                            {isPaid ? 'Paid' : 'Pending'}
                                          </span>
                                          <button
                                            style={{
                                              padding: "4px 8px",
                                              backgroundColor: "#f3f4f6",
                                              border: "none",
                                              borderRadius: "4px",
                                              fontSize: "12px",
                                              color: "#666",
                                              cursor: "pointer",
                                            }}
                                          >
                                            View
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan={4} style={{ padding: "40px", textAlign: "center", fontSize: "14px", color: "#999" }}>
                                    No recent payments
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                  {analyticsTab === 'users' && (
                    <div>
                      {/* KPI Cards */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0", marginBottom: "32px" }}>
                        {/* Total Users */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", border: "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            <div style={{ fontSize: "14px", color: "#666", fontWeight: "500" }}>Total Users</div>
                          </div>
                          <div style={{ fontSize: "32px", fontWeight: "600", color: "#222" }}>
                            {analyticsData.totalUsers.toLocaleString()}
                        </div>
                          </div>

                        {/* Active Users */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", border: "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <div style={{ fontSize: "14px", color: "#666", fontWeight: "500" }}>Active Users</div>
                          </div>
                          <div style={{ fontSize: "32px", fontWeight: "600", color: "#222" }}>
                            {analyticsData.activeUsers.toLocaleString()}
                        </div>
                      </div>

                        {/* New Signups */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", border: "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            <div style={{ fontSize: "14px", color: "#666", fontWeight: "500" }}>New Signups</div>
                            </div>
                          <div style={{ fontSize: "32px", fontWeight: "600", color: "#222" }}>
                            {analyticsData.newSignups} <span style={{ fontSize: "16px", fontWeight: "400", color: "#666" }}>Today</span>
                          </div>
                      </div>

                        {/* User Churn */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", border: "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                              <line x1="12" y1="9" x2="12" y2="13" />
                              <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            <div style={{ fontSize: "14px", color: "#666", fontWeight: "500" }}>User Churn</div>
                            </div>
                          <div style={{ fontSize: "32px", fontWeight: "600", color: "#222" }}>
                            {analyticsData.userChurn} <span style={{ fontSize: "16px", fontWeight: "400", color: "#666" }}>This Month</span>
                          </div>
                        </div>
                      </div>

                      {/* Charts Row */}
                      <div style={{ marginBottom: "32px" }}>
                        {/* User Growth Chart */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "24px", border: "none" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#222", margin: 0 }}>User Growth</h3>
                            <div style={{ display: "flex", gap: "8px", backgroundColor: "#f5f5f5", borderRadius: "6px", padding: "4px" }}>
                              {(['Week', 'Month', 'Year'] as const).map((period) => (
                                <button
                                  key={period}
                                  onClick={() => setUserGrowthPeriod(period)}
                                  style={{
                                    padding: "6px 12px",
                                    backgroundColor: userGrowthPeriod === period ? "#fff" : "transparent",
                                    border: userGrowthPeriod === period ? "1px solid #222" : "none",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                    fontWeight: userGrowthPeriod === period ? "500" : "400",
                                    color: "#222",
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                  }}
                                >
                                  {period}
                                </button>
                              ))}
                    </div>
                          </div>
                          <div style={{ height: "300px", position: "relative" }}>
                            {(() => {
                              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                              const newUsers = [
                                analyticsData.totalUsers * 0.16,
                                analyticsData.totalUsers * 0.20,
                                analyticsData.totalUsers * 0.24,
                                analyticsData.totalUsers * 0.30,
                                analyticsData.totalUsers * 0.36,
                                analyticsData.totalUsers * 0.42
                              ];
                              const activeUsers = [
                                analyticsData.activeUsers * 0.12,
                                analyticsData.activeUsers * 0.16,
                                analyticsData.activeUsers * 0.20,
                                analyticsData.activeUsers * 0.28,
                                analyticsData.activeUsers * 0.34,
                                analyticsData.activeUsers * 0.42
                              ];
                              
                              const maxValue = Math.max(...newUsers, ...activeUsers, 8000);
                              const chartHeight = 220;
                              const chartWidth = 700;
                              const padding = { top: 20, right: 50, bottom: 40, left: 60 };
                              
                              return (
                                <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight + padding.top + padding.bottom}`} style={{ overflow: "visible" }}>
                                  <defs>
                                    <linearGradient id="newUsersGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                      <stop offset="0%" stopColor="#1976d2" stopOpacity="0.3" />
                                      <stop offset="100%" stopColor="#1976d2" stopOpacity="0.05" />
                                    </linearGradient>
                                    <linearGradient id="activeUsersGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
                                    </linearGradient>
                                  </defs>
                                  
                                  {/* Y-axis labels */}
                                  {[0, 2000, 4000, 6000, 8000].map((value, i) => {
                                    const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
                                    return (
                                      <g key={i}>
                                        <line x1={padding.left - 5} y1={y} x2={padding.left} y2={y} stroke="#333" strokeWidth="1" />
                                        <text x={padding.left - 10} y={y + 4} fontSize="12" fill="#666" textAnchor="end">
                                          {value === 0 ? '0' : `${value / 1000}k`}
                                        </text>
                                      </g>
                                    );
                                  })}
                                  
                                  {/* X-axis labels */}
                                  {months.map((month, i) => {
                                    const x = padding.left + (i * (chartWidth - padding.left - padding.right) / (months.length - 1));
                                    return (
                                      <text key={i} x={x} y={chartHeight + padding.top + 20} fontSize="12" fill="#666" textAnchor="middle">
                                        {month}
                                      </text>
                                    );
                                  })}
                                  
                                  {/* Shaded area for New Users */}
                                  <path
                                    d={`M ${padding.left},${padding.top + chartHeight} ${newUsers.map((value, i) => {
                                      const x = padding.left + (i * (chartWidth - padding.left - padding.right) / (months.length - 1));
                                      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
                                      return `L ${x},${y}`;
                                    }).join(' ')} L ${padding.left + (chartWidth - padding.left - padding.right)},${padding.top + chartHeight} Z`}
                                    fill="url(#newUsersGradient)"
                                  />
                                  
                                  {/* Shaded area for Active Users */}
                                  <path
                                    d={`M ${padding.left},${padding.top + chartHeight} ${activeUsers.map((value, i) => {
                                      const x = padding.left + (i * (chartWidth - padding.left - padding.right) / (months.length - 1));
                                      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
                                      return `L ${x},${y}`;
                                    }).join(' ')} L ${padding.left + (chartWidth - padding.left - padding.right)},${padding.top + chartHeight} Z`}
                                    fill="url(#activeUsersGradient)"
                                  />
                                  
                                  {/* Line for New Users */}
                                  <polyline
                                    points={newUsers.map((value, i) => {
                                      const x = padding.left + (i * (chartWidth - padding.left - padding.right) / (months.length - 1));
                                      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
                                      return `${x},${y}`;
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#1976d2"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  
                                  {/* Line for Active Users */}
                                  <polyline
                                    points={activeUsers.map((value, i) => {
                                      const x = padding.left + (i * (chartWidth - padding.left - padding.right) / (months.length - 1));
                                      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
                                      return `${x},${y}`;
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#22c55e"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  
                                  {/* Data points for New Users */}
                                  {newUsers.map((value, i) => {
                                    const x = padding.left + (i * (chartWidth - padding.left - padding.right) / (months.length - 1));
                                    const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
                                    return (
                                      <circle key={i} cx={x} cy={y} r="5" fill="#1976d2" stroke="#fff" strokeWidth="2" />
                                    );
                                  })}
                                  
                                  {/* Data points for Active Users */}
                                  {activeUsers.map((value, i) => {
                                    const x = padding.left + (i * (chartWidth - padding.left - padding.right) / (months.length - 1));
                                    const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
                                    return (
                                      <circle key={i} cx={x} cy={y} r="5" fill="#22c55e" stroke="#fff" strokeWidth="2" />
                                    );
                                  })}
                                  
                                  {/* Axes */}
                                  <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} stroke="#333" strokeWidth="2" />
                                  <line x1={padding.left} y1={padding.top + chartHeight} x2={chartWidth - padding.right} y2={padding.top + chartHeight} stroke="#333" strokeWidth="2" />
                                  
                            </svg>
                              );
                            })()}
                        </div>
                            {/* Legend */}
                            <div style={{ display: "flex", gap: "24px", justifyContent: "center", marginTop: "16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#1976d2" }}></div>
                                <span style={{ fontSize: "12px", color: "#666" }}>New Users</span>
                          </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#22c55e" }}></div>
                                <span style={{ fontSize: "12px", color: "#666" }}>Active Users</span>
                        </div>
                          </div>
                        </div>
                      </div>

                      {/* Tables Row */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>
                        {/* Recent Signups Table */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", border: "none", overflow: "hidden" }}>
                          <div style={{ padding: "24px", borderBottom: "1px solid #e6e6e6" }}>
                            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#222", margin: 0 }}>Recent Signups</h3>
                                </div>
                          <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <thead>
                                <tr style={{ borderBottom: "1px solid #e6e6e6", backgroundColor: "#fafafa" }}>
                                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Name</th>
                                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Date Joined</th>
                                </tr>
                              </thead>
                              <tbody>
                                {analyticsData.recentSignups.length > 0 ? (
                                  analyticsData.recentSignups.map((user, index) => (
                                    <tr key={index} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#222", fontWeight: "500" }}>
                                        {user.name}
                                      </td>
                                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#666" }}>
                                        {user.dateJoined}
                                      </td>
                                    </tr>
                              ))
                            ) : (
                                  <tr>
                                    <td colSpan={2} style={{ padding: "40px", textAlign: "center", fontSize: "14px", color: "#999" }}>
                                      No signups yet
                                    </td>
                                  </tr>
                            )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Churned Users Table */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", border: "none", overflow: "hidden" }}>
                          <div style={{ padding: "24px", borderBottom: "1px solid #e6e6e6" }}>
                            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#222", margin: 0 }}>Churned Users</h3>
                                </div>
                          <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <thead>
                                <tr style={{ borderBottom: "1px solid #e6e6e6", backgroundColor: "#fafafa" }}>
                                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Name</th>
                                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Last Active</th>
                                </tr>
                              </thead>
                              <tbody>
                                {analyticsData.churnedUsers.length > 0 ? (
                                  analyticsData.churnedUsers.map((user, index) => (
                                    <tr key={index} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#222", fontWeight: "500" }}>
                                        {user.name}
                                      </td>
                                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#666" }}>
                                        {user.lastActive}
                                      </td>
                                    </tr>
                              ))
                            ) : (
                                  <tr>
                                    <td colSpan={2} style={{ padding: "40px", textAlign: "center", fontSize: "14px", color: "#999" }}>
                                      No churned users
                                    </td>
                                  </tr>
                            )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {analyticsTab === 'venues' && (
                    <div>
                      {/* Venue KPI Cards */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0", marginBottom: "32px" }}>
                        {/* Total Views */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", border: "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </div>
                            <div style={{ fontSize: "14px", color: "#666", fontWeight: "500" }}>Total Views</div>
                          </div>
                          <div style={{ fontSize: "32px", fontWeight: "600", color: "#1976d2" }}>
                            {(analyticsData.totalViews || 0).toLocaleString()} views
                          </div>
                        </div>

                        {/* Booking Requests */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", border: "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "#fff3e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff9800" strokeWidth="2">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                <path d="M9 10h6" strokeLinecap="round" />
                              </svg>
                            </div>
                            <div style={{ fontSize: "14px", color: "#666", fontWeight: "500" }}>Booking Requests</div>
                          </div>
                          <div style={{ fontSize: "32px", fontWeight: "600", color: "#ff9800" }}>
                            {(analyticsData.bookingRequests || 0)} requests
                          </div>
                        </div>

                        {/* Confirmed Bookings */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", border: "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <div style={{ fontSize: "14px", color: "#666", fontWeight: "500" }}>Confirmed Bookings</div>
                          </div>
                          <div style={{ fontSize: "32px", fontWeight: "600", color: "#4caf50" }}>
                            {(analyticsData.confirmedBookings || 0)} bookings
                          </div>
                        </div>

                        {/* Most Viewed Space */}
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", border: "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            </div>
                            <div style={{ fontSize: "14px", color: "#666", fontWeight: "500" }}>Most Viewed Space</div>
                          </div>
                          {analyticsData.mostViewedSpace ? (
                            <>
                              <div style={{ fontSize: "32px", fontWeight: "600", color: "#1976d2", marginBottom: "4px" }}>
                                {analyticsData.mostViewedSpace.name}
                              </div>
                              <div style={{ fontSize: "14px", color: "#666" }}>
                                {analyticsData.mostViewedSpace.views} views
                              </div>
                            </>
                          ) : (
                            <div style={{ fontSize: "32px", fontWeight: "600", color: "#1976d2" }}>
                              No data
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeMenu === 'listings' && (
                <div>
                  {/* Filter Toggle */}
                  <div style={{ 
                    display: "flex", 
                    gap: "8px", 
                    backgroundColor: "#f5f5f5", 
                    borderRadius: "6px", 
                    padding: "4px",
                    marginBottom: "24px",
                    width: "fit-content"
                  }}>
                    <button
                      onClick={() => setListingFilter('listed')}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: listingFilter === 'listed' ? "#1976d2" : "transparent",
                        border: listingFilter === 'listed' ? "1px solid #1976d2" : "none",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: listingFilter === 'listed' ? "500" : "400",
                        color: listingFilter === 'listed' ? "#fff" : "#222",
                        cursor: "pointer",
                        boxShadow: listingFilter === 'listed' ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                        transition: "all 0.2s",
                      }}
                    >
                      Listed
                    </button>
                    <button
                      onClick={() => setListingFilter('unlisted')}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: listingFilter === 'unlisted' ? "#1976d2" : "transparent",
                        border: listingFilter === 'unlisted' ? "1px solid #1976d2" : "none",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: listingFilter === 'unlisted' ? "500" : "400",
                        color: listingFilter === 'unlisted' ? "#fff" : "#222",
                        cursor: "pointer",
                        boxShadow: listingFilter === 'unlisted' ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                        transition: "all 0.2s",
                      }}
                    >
                      Unlisted
                    </button>
                    <button
                      onClick={() => setListingFilter('in_review')}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: listingFilter === 'in_review' ? "#1976d2" : "transparent",
                        border: listingFilter === 'in_review' ? "1px solid #1976d2" : "none",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: listingFilter === 'in_review' ? "500" : "400",
                        color: listingFilter === 'in_review' ? "#fff" : "#222",
                        cursor: "pointer",
                        boxShadow: listingFilter === 'in_review' ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                        transition: "all 0.2s",
                      }}
                    >
                      In Review
                    </button>
                    <button
                      onClick={() => setListingFilter('deleted')}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: listingFilter === 'deleted' ? "#1976d2" : "transparent",
                        border: listingFilter === 'deleted' ? "1px solid #1976d2" : "none",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: listingFilter === 'deleted' ? "500" : "400",
                        color: listingFilter === 'deleted' ? "#fff" : "#222",
                        cursor: "pointer",
                        boxShadow: listingFilter === 'deleted' ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                        transition: "all 0.2s",
                      }}
                    >
                      Deleted
                    </button>
                  </div>
                  {(() => {
                    // Load all listings from all hosts/users
                    // Listings are stored with keys: hostListings_${userId} or listings_${userId}
                    // listingsRefreshKey is used to force re-render when listings change
                    const _ = listingsRefreshKey; // Reference to force re-render
                    const allListings: any[] = [];
                    const processedListingIds = new Set<string>();
                    
                    // Iterate through all localStorage keys to find listings
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && (key.startsWith('hostListings_') || key.startsWith('listings_'))) {
                        try {
                          const listingsData = localStorage.getItem(key);
                          if (listingsData) {
                            const listings = JSON.parse(listingsData);
                            if (Array.isArray(listings)) {
                              listings.forEach((listing: any) => {
                                // Avoid duplicates based on listing ID
                                if (listing.id && !processedListingIds.has(listing.id)) {
                                  allListings.push(listing);
                                  processedListingIds.add(listing.id);
                                } else if (!listing.id) {
                                  // If no ID, still add it (might be a new listing)
                                  allListings.push(listing);
                                }
                              });
                            }
                          }
                        } catch (e) {
                          console.error(`Error parsing listings from key ${key}:`, e);
                        }
                      }
                    }
                    
                    // Debug: Log all listings to console (remove in production)
                    console.log('Admin Dashboard - All listings loaded:', allListings.length);
                    console.log('Admin Dashboard - Listings by status:', {
                      listed: allListings.filter((l: any) => (l.status || 'unlisted') === 'listed').length,
                      unlisted: allListings.filter((l: any) => (l.status || 'unlisted') === 'unlisted' || !l.status).length,
                      in_review: allListings.filter((l: any) => (l.status || 'unlisted') === 'in_review').length,
                      declined: allListings.filter((l: any) => (l.status || 'unlisted') === 'declined').length,
                      deleted: allListings.filter((l: any) => (l.status || 'unlisted') === 'deleted').length,
                    });
                    console.log('Admin Dashboard - In review listings:', allListings.filter((l: any) => (l.status || 'unlisted') === 'in_review'));

                    // Filter listings based on selected filter
                    const filteredListings = allListings.filter((listing: any) => {
                      const status = listing.status || 'unlisted';
                      switch (listingFilter) {
                        case 'listed':
                          return status === 'listed';
                        case 'unlisted':
                          return status === 'unlisted' || !status || status === '';
                        case 'in_review':
                          return status === 'in_review';
                        case 'deleted':
                          return status === 'declined' || status === 'deleted';
                        default:
                          return true;
                      }
                    });

                    return (
                      <div style={{ backgroundColor: "#fff", borderRadius: "8px", border: "none", overflow: "hidden" }}>
                        <div style={{ padding: "24px", borderBottom: "1px solid #e6e6e6" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#222", margin: 0 }}>
                              {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'}
                            </h3>
                          </div>
                        </div>
                        <div style={{ overflowX: "auto" }}>
                          {filteredListings.length > 0 ? (
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <thead>
                                <tr style={{ borderBottom: "1px solid #e6e6e6", backgroundColor: "#fafafa" }}>
                                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Property Name</th>
                                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Location</th>
                                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Status</th>
                                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Price</th>
                                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredListings.map((listing: any, index: number) => {
                                  const status = listing.status || 'unlisted';
                                  const statusDisplay = status === 'in_review' ? 'In Review' : 
                                                       status === 'listed' ? 'Listed' : 
                                                       status === 'declined' || status === 'deleted' ? 'Deleted' : 
                                                       'Unlisted';
                                  const statusColor = status === 'listed' ? '#22c55e' : 
                                                     status === 'in_review' ? '#f59e0b' : 
                                                     status === 'declined' || status === 'deleted' ? '#ef4444' : 
                                                     '#666';
                                  const locationString = listing.location 
                                    ? `${listing.location.city || ''}${listing.location.city && listing.location.state ? ', ' : ''}${listing.location.state || ''}`
                                    : listing.address || 'Location not specified';
                                  const price = listing.price || listing.totalPrice || 0;
                                  
                                  return (
                                    <tr key={listing.id || index} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#222", fontWeight: "500" }}>
                                        {listing.propertyName || listing.name || 'Untitled Listing'}
                                      </td>
                                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#666" }}>
                                        {locationString}
                                      </td>
                                      <td style={{ padding: "16px 24px" }}>
                                        <span style={{
                                          display: "inline-block",
                                          padding: "4px 12px",
                                          borderRadius: "12px",
                                          fontSize: "12px",
                                          fontWeight: "500",
                                          backgroundColor: status === 'listed' ? "#dcfce7" : 
                                                          status === 'in_review' ? "#fef3c7" : 
                                                          status === 'declined' || status === 'deleted' ? "#fee2e2" : 
                                                          "#f3f4f6",
                                          color: statusColor,
                                        }}>
                                          {statusDisplay}
                                        </span>
                                      </td>
                                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#222", fontWeight: "500" }}>
                                        ₱{typeof price === 'number' ? price.toLocaleString() : price}
                                      </td>
                                      <td style={{ padding: "16px 24px" }}>
                                        <button
                                          onClick={() => {
                                            if (listing.id) {
                                              setSelectedListingId(listing.id);
                                              setListingReviewModalOpen(true);
                                            }
                                          }}
                                          style={{
                                            padding: "6px 12px",
                                            backgroundColor: "#f3f4f6",
                                            border: "none",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                            color: "#666",
                                            cursor: "pointer",
                                            transition: "background-color 0.2s",
                                          }}
                                          onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = "#e5e7eb";
                                          }}
                                          onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = "#f3f4f6";
                                          }}
                                        >
                                          View
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          ) : (
                            <div style={{ padding: "40px", textAlign: "center", fontSize: "14px", color: "#999" }}>
                              No {listingFilter === 'listed' ? 'listed' : listingFilter === 'unlisted' ? 'unlisted' : listingFilter === 'in_review' ? 'in review' : 'deleted'} listings found
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              {activeMenu === 'bookings' && (
                <div>

                  {/* Search and Filter Bar */}
                  <div style={{ display: "flex", gap: "16px", marginBottom: "24px", alignItems: "center" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search bookings..."
                        style={{
                          width: "100%",
                          padding: "10px 12px 10px 36px",
                          border: "1px solid #e6e6e6",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                        }}
                      />
                    </div>
                    <select
                      style={{
                        padding: "10px 32px 10px 12px",
                        border: "1px solid #e6e6e6",
                        borderRadius: "8px",
                        fontSize: "14px",
                        backgroundColor: "#fff",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      <option>All Status</option>
                      <option>Confirmed</option>
                      <option>Pending</option>
                      <option>Cancelled</option>
                    </select>
                    <select
                      style={{
                        padding: "10px 32px 10px 12px",
                        border: "1px solid #e6e6e6",
                        borderRadius: "8px",
                        fontSize: "14px",
                        backgroundColor: "#fff",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      <option>All Spaces</option>
                    </select>
                  </div>

                  {/* Bookings Table */}
                  <div style={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e6e6e6", overflow: "hidden" }}>
                    {/* Table Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #e6e6e6" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#222", margin: 0 }}>Bookings</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#666" }}>
                        <span>Page {bookingsPage} of {Math.max(1, Math.ceil((analyticsData.bookingsData.recentBookings.length || 0) / 10))}</span>
                        {bookingsPage < Math.ceil((analyticsData.bookingsData.recentBookings.length || 0) / 10) && (
                          <button
                            onClick={() => setBookingsPage(prev => prev + 1)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "4px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid #e6e6e6", backgroundColor: "#fafafa" }}>
                            <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Occasion</th>
                            <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Space</th>
                            <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Date</th>
                            <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Status</th>
                            <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const startIndex = (bookingsPage - 1) * 10;
                            const endIndex = startIndex + 10;
                            const paginatedBookings = (analyticsData.bookingsData.recentBookings || []).slice(startIndex, endIndex);
                            
                            return paginatedBookings.length > 0 ? (
                              paginatedBookings.map((booking, index) => {
                                const statusColor = booking.status === 'confirmed' || booking.status === 'completed' ? '#22c55e' : booking.status === 'cancelled' ? '#ef4444' : '#eab308';
                                const statusBg = booking.status === 'confirmed' || booking.status === 'completed' ? '#dcfce7' : booking.status === 'cancelled' ? '#fee2e2' : '#fef9c3';
                                
                                // Extract event name from booking data, replacing "Insert Event Venue" with "Insert Occasion" for Occasion column
                                const venueValue = booking.venue || '';
                                const eventName = venueValue === 'Insert Event Venue' ? 'Insert Occasion' : (venueValue || `Booking ${booking.id}`);
                                const spaceName = venueValue === 'Insert Event Venue' ? 'Insert Event Venue' : (venueValue || 'N/A');
                                
                                return (
                                  <tr key={index} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#222", fontWeight: "500" }}>{eventName}</td>
                                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#666" }}>{spaceName}</td>
                                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#666" }}>
                                      {booking.date ? new Date(booking.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                    </td>
                                    <td style={{ padding: "16px 24px" }}>
                                      <span
                                        style={{
                                          display: "inline-block",
                                          padding: "4px 12px",
                                          borderRadius: "12px",
                                          fontSize: "12px",
                                          fontWeight: "500",
                                          backgroundColor: statusBg,
                                          color: statusColor,
                                        }}
                                      >
                                        {booking.status === 'confirmed' || booking.status === 'completed' ? 'Confirmed' : booking.status === 'cancelled' ? 'Cancelled' : booking.status === 'pending' ? 'Pending' : 'Pending'}
                                      </span>
                                    </td>
                                    <td style={{ padding: "16px 24px" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <button
                                          style={{
                                            padding: "6px 12px",
                                            backgroundColor: "transparent",
                                            color: "#1976d2",
                                            border: "1px solid #1976d2",
                                            borderRadius: "6px",
                                            fontSize: "12px",
                                            fontWeight: "500",
                                            cursor: "pointer",
                                          }}
                                        >
                                          View
                                        </button>
                                        <button
                                          style={{
                                            padding: "6px 12px",
                                            backgroundColor: "transparent",
                                            color: "#666",
                                            border: "1px solid #e6e6e6",
                                            borderRadius: "6px",
                                            fontSize: "12px",
                                            fontWeight: "500",
                                            cursor: "pointer",
                                          }}
                                        >
                                          Edit
                                        </button>
                                        <button
                                          style={{
                                            padding: "6px",
                                            backgroundColor: "transparent",
                                            border: "none",
                                            cursor: "pointer",
                                          }}
                                        >
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                                            <circle cx="12" cy="12" r="1" />
                                            <circle cx="12" cy="5" r="1" />
                                            <circle cx="12" cy="19" r="1" />
                                          </svg>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={5} style={{ padding: "40px", textAlign: "center", fontSize: "14px", color: "#999" }}>No bookings found</td>
                              </tr>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {activeMenu === 'payments' && (
                <div>
                  {/* Filters and Actions Bar */}
                  {(() => {
                    // Calculate current month's date range
                    const now = new Date();
                    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                    const formattedFirstDay = `${monthNames[firstDayOfMonth.getMonth()]} ${firstDayOfMonth.getDate()}, ${firstDayOfMonth.getFullYear()}`;
                    const formattedLastDay = `${monthNames[lastDayOfMonth.getMonth()]} ${lastDayOfMonth.getDate()}, ${lastDayOfMonth.getFullYear()}`;
                    const dateRangeText = `${formattedFirstDay} - ${formattedLastDay}`;
                    
                    return (
                      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                        <select
                          style={{
                            padding: "10px 32px 10px 12px",
                            border: "1px solid #e6e6e6",
                            borderRadius: "8px",
                            fontSize: "14px",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          <option>All Payments</option>
                          <option>Pending</option>
                          <option>Approved</option>
                          <option>Failed</option>
                        </select>
                        <div style={{ position: "relative", display: "flex", alignItems: "center", padding: "10px 12px", border: "1px solid #e6e6e6", borderRadius: "8px", fontSize: "14px", backgroundColor: "#fff", cursor: "pointer" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" style={{ marginRight: "8px" }}>
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span style={{ color: "#666" }}>{dateRangeText}</span>
                        </div>
                        <select
                          style={{
                            padding: "10px 32px 10px 12px",
                            border: "1px solid #e6e6e6",
                            borderRadius: "8px",
                            fontSize: "14px",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            outline: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <option>Export</option>
                          <option>PDF</option>
                        </select>
                        <select
                          style={{
                            padding: "10px 32px 10px 12px",
                            border: "1px solid #e6e6e6",
                            borderRadius: "8px",
                            fontSize: "14px",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          <option>Sort: Newest</option>
                          <option>Sort: Oldest</option>
                          <option>Sort: Amount (High to Low)</option>
                          <option>Sort: Amount (Low to High)</option>
                        </select>
                      </div>
                    );
                  })()}

                  {/* Payments Table */}
                  {(() => {
                    // Load all bookings to create payment records
                    const allBookings: any[] = [];
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && (key.startsWith('upcomingBookings_') || key.startsWith('completedBookings_') || key.startsWith('cancelledBookings_'))) {
                        try {
                          const bookings = JSON.parse(localStorage.getItem(key) || '[]');
                          if (Array.isArray(bookings)) {
                            allBookings.push(...bookings.map((b: any) => ({ ...b, sourceKey: key })));
                          }
                        } catch (e) {
                          console.error('Error parsing bookings:', e);
                        }
                      }
                    }

                    // Load all users for payer information
                    const allUsers: any[] = [];
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && key.startsWith('userData_')) {
                        try {
                          const userData = JSON.parse(localStorage.getItem(key) || 'null');
                          if (userData) {
                            allUsers.push({ ...userData, uid: key.replace('userData_', '') });
                          }
                        } catch (e) {
                          console.error('Error parsing user data:', e);
                        }
                      }
                    }

                    // Create payment records from bookings
                    const payments = allBookings
                      .filter((booking: any) => {
                        // Only include bookings with payment information
                        const price = booking.totalPrice || booking.price;
                        return price && price > 0;
                      })
                      .map((booking: any, index: number) => {
                        const userId = booking.userId || booking.guestId || booking.userId;
                        const user = allUsers.find((u: any) => u.uid === userId);
                        let payerName = 'Unknown User';
                        if (user) {
                          if (user.firstName && user.lastName) {
                            payerName = `${user.firstName} ${user.lastName}`;
                          } else if (user.displayName) {
                            payerName = user.displayName;
                          } else if (user.email) {
                            payerName = user.email.split('@')[0];
                          }
                        } else if (booking.guestName) {
                          payerName = booking.guestName;
                        }
                        
                        const price = booking.totalPrice || booking.price || 0;
                        const amount = typeof price === 'number' ? price : parseFloat(price.toString().replace(/[^0-9.-]+/g, '')) || 0;
                        
                        // Determine payment status based on booking status
                        const bookingStatus = booking.status?.toLowerCase() || '';
                        let paymentStatus = 'pending';
                        if (bookingStatus === 'completed' || bookingStatus === 'confirmed' || booking.reviewed) {
                          paymentStatus = 'approved';
                        } else if (bookingStatus === 'cancelled' || booking.cancelled) {
                          paymentStatus = 'failed';
                        }
                        
                        // Default payment method - can be enhanced later
                        const paymentMethod = booking.paymentMethod || 'gcash';
                        
                        const paymentDate = booking.createdAt || booking.date || booking.checkIn || new Date().toISOString();
                        
                        return {
                          id: `PAY-${10000 + index}`,
                          bookingId: booking.id,
                          payerName,
                          payerPhoto: user?.photoURL || localStorage.getItem(`profilePhoto_${userId}`),
                          venue: booking.venueName || booking.listingName || booking.venue || 'Unknown Venue',
                          paymentMethod,
                          amount,
                          date: paymentDate,
                          status: paymentStatus,
                        };
                      })
                      .sort((a: any, b: any) => {
                        // Sort by newest first
                        const dateA = new Date(a.date).getTime();
                        const dateB = new Date(b.date).getTime();
                        return dateB - dateA;
                      });

                    // Add sample payment if no payments exist
                    if (payments.length === 0) {
                      const sampleDate = new Date();
                      sampleDate.setDate(sampleDate.getDate() - 5);
                      payments.push({
                        id: 'PAY-SAMPLE-001',
                        bookingId: 'sample-booking-001',
                        payerName: 'John Doe',
                        payerPhoto: null,
                        venue: 'Grand Ballroom',
                        paymentMethod: 'gcash',
                        amount: 15000,
                        date: sampleDate.toISOString(),
                        status: 'approved',
                      });
                    }

                    return (
                      <div style={{ backgroundColor: "#fff", borderRadius: "8px", border: "none", overflow: "hidden" }}>
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr style={{ borderBottom: "1px solid #e6e6e6", backgroundColor: "#fafafa" }}>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Payment ID</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Payer</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Venue</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Payment Method</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Amount</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Date</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Status</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {payments.map((payment: any) => {
                                const statusColor = payment.status === 'approved' ? '#22c55e' : payment.status === 'failed' ? '#ef4444' : '#f97316';
                                const statusBg = payment.status === 'approved' ? '#dcfce7' : payment.status === 'failed' ? '#fee2e2' : '#ffedd5';
                                const statusText = payment.status === 'approved' ? 'Approved' : payment.status === 'failed' ? 'Failed' : 'Pending';
                                const paymentMethodIcon = payment.paymentMethod === 'gcash' ? <GCashIcon /> : payment.paymentMethod === 'credit-card' || payment.paymentMethod === 'card' ? <CreditCardIcon /> : <BankIcon />;
                                const paymentMethodText = payment.paymentMethod === 'gcash' ? 'GCash' : payment.paymentMethod === 'credit-card' || payment.paymentMethod === 'card' ? 'Credit Card' : 'Bank Transfer';
                                const paymentDate = new Date(payment.date);
                                const formattedDate = paymentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                const isApproved = payment.status === 'approved';
                                const isFailed = payment.status === 'failed';
                                
                                return (
                                  <tr key={payment.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#222", fontWeight: "500" }}>{payment.id}</td>
                                    <td style={{ padding: "16px 24px" }}>
                                      <span style={{ fontSize: "14px", color: "#222", fontWeight: "500" }}>{payment.payerName}</span>
                                    </td>
                                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#666" }}>{payment.venue}</td>
                                    <td style={{ padding: "16px 24px" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        {paymentMethodIcon}
                                        <span style={{ fontSize: "14px", color: "#666" }}>{paymentMethodText}</span>
                                      </div>
                                    </td>
                                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#222", fontWeight: "500" }}>₱{payment.amount.toLocaleString()}</td>
                                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#666" }}>{formattedDate}</td>
                                    <td style={{ padding: "16px 24px" }}>
                                      <span style={{
                                        display: "inline-block",
                                        padding: "4px 12px",
                                        borderRadius: "12px",
                                        fontSize: "12px",
                                        fontWeight: "500",
                                        backgroundColor: statusBg,
                                        color: statusColor,
                                      }}>{statusText}</span>
                                    </td>
                                    <td style={{ padding: "16px 24px" }}>
                                      <button
                                        style={{
                                          padding: "6px 16px",
                                          borderRadius: "6px",
                                          fontSize: "14px",
                                          fontWeight: "500",
                                          border: "none",
                                          cursor: isApproved || isFailed ? "not-allowed" : "pointer",
                                          backgroundColor: isApproved || isFailed ? "#e6e6e6" : "#22c55e",
                                          color: isApproved || isFailed ? "#999" : "white",
                                          transition: "background-color 0.2s",
                                        }}
                                        disabled={isApproved || isFailed}
                                        onMouseOver={(e) => {
                                          if (!isApproved && !isFailed) {
                                            e.currentTarget.style.backgroundColor = "#16a34a";
                                          }
                                        }}
                                        onMouseOut={(e) => {
                                          if (!isApproved && !isFailed) {
                                            e.currentTarget.style.backgroundColor = "#22c55e";
                                          }
                                        }}
                                        onClick={() => {
                                          if (!isApproved && !isFailed) {
                                            // Handle approve action
                                            console.log('Approve payment:', payment.id);
                                          }
                                        }}
                                      >
                                        Approve
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", padding: "20px 24px", borderTop: "1px solid #e6e6e6" }}>
                          <button
                            style={{
                              padding: "8px 12px",
                              border: "1px solid #e6e6e6",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              cursor: "pointer",
                              fontSize: "14px",
                              color: "#666",
                            }}
                          >
                            &lt; Previous
                          </button>
                          <button
                            style={{
                              padding: "8px 12px",
                              border: "1px solid #1976d2",
                              borderRadius: "6px",
                              backgroundColor: "#1976d2",
                              cursor: "pointer",
                              fontSize: "14px",
                              color: "#fff",
                              fontWeight: "500",
                            }}
                          >
                            1
                          </button>
                          <button
                            style={{
                              padding: "8px 12px",
                              border: "1px solid #e6e6e6",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              cursor: "pointer",
                              fontSize: "14px",
                              color: "#666",
                            }}
                          >
                            2
                          </button>
                          <button
                            style={{
                              padding: "8px 12px",
                              border: "1px solid #e6e6e6",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              cursor: "pointer",
                              fontSize: "14px",
                              color: "#666",
                            }}
                          >
                            3
                          </button>
                          <span style={{ padding: "8px 4px", fontSize: "14px", color: "#666" }}>...</span>
                          <button
                            style={{
                              padding: "8px 12px",
                              border: "1px solid #e6e6e6",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              cursor: "pointer",
                              fontSize: "14px",
                              color: "#666",
                            }}
                          >
                            10
                          </button>
                          <button
                            style={{
                              padding: "8px 12px",
                              border: "1px solid #e6e6e6",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              cursor: "pointer",
                              fontSize: "14px",
                              color: "#666",
                            }}
                          >
                            Next &gt;
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              {activeMenu === 'users' && (
                <div>
                  {(() => {
                    // Reference to force re-render when data changes
                    const _ = usersRefreshKey;
                    
                    // Load all users from localStorage
                    const allUsers: any[] = [];
                    const processedUserIds = new Set<string>();
                    
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && key.startsWith('userData_')) {
                        try {
                          const userData = JSON.parse(localStorage.getItem(key) || 'null');
                          if (userData && userData.uid && !processedUserIds.has(userData.uid)) {
                            allUsers.push(userData);
                            processedUserIds.add(userData.uid);
                          }
                        } catch (e) {
                          console.error('Error parsing user data:', e);
                        }
                      }
                    }

                    // Also check for users in bookings (userId, hostId, guestId fields)
                    const bookingUserIds = new Set<string>();
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && (key.startsWith('upcomingBookings_') || key.startsWith('completedBookings_') || key.startsWith('cancelledBookings_'))) {
                        try {
                          const bookings = JSON.parse(localStorage.getItem(key) || '[]');
                          if (Array.isArray(bookings)) {
                            bookings.forEach((booking: any) => {
                              if (booking.userId && !processedUserIds.has(booking.userId)) {
                                bookingUserIds.add(booking.userId);
                              }
                              if (booking.hostId && !processedUserIds.has(booking.hostId)) {
                                bookingUserIds.add(booking.hostId);
                              }
                              if (booking.guestId && !processedUserIds.has(booking.guestId)) {
                                bookingUserIds.add(booking.guestId);
                              }
                            });
                          }
                        } catch (e) {
                          console.error('Error parsing bookings:', e);
                        }
                      }
                    }

                    // Create user objects for users found in bookings but not in userData
                    bookingUserIds.forEach((userId) => {
                      if (!processedUserIds.has(userId)) {
                        allUsers.push({
                          uid: userId,
                          email: 'N/A',
                          displayName: 'User',
                          createdAt: new Date().toISOString(),
                        });
                        processedUserIds.add(userId);
                      }
                    });

                    // Get all host user IDs (users who have listings)
                    const hostUserIds = new Set<string>();
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && (key.startsWith('hostListings_') || key.startsWith('listings_'))) {
                        const userId = key.split('_')[1];
                        if (userId) {
                          try {
                            const listings = JSON.parse(localStorage.getItem(key) || '[]');
                            if (Array.isArray(listings) && listings.length > 0) {
                              hostUserIds.add(userId);
                              // If this host user is not in allUsers, add them
                              if (!processedUserIds.has(userId)) {
                                allUsers.push({
                                  uid: userId,
                                  email: 'N/A',
                                  displayName: 'Host',
                                  createdAt: new Date().toISOString(),
                                });
                                processedUserIds.add(userId);
                              }
                            }
                          } catch (e) {
                            console.error('Error parsing listings:', e);
                          }
                        }
                      }
                    }

                    // Separate users and hosts
                    const users = allUsers.filter((u: any) => !hostUserIds.has(u.uid || ''));
                    const hosts = allUsers.filter((u: any) => hostUserIds.has(u.uid || ''));

                    // Sort by creation date (newest first)
                    const sortedUsers = users.sort((a: any, b: any) => {
                      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                      return dateB - dateA;
                    });

                    const sortedHosts = hosts.sort((a: any, b: any) => {
                      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                      return dateB - dateA;
                    });

                    const displayUsers = userViewType === 'host' ? sortedHosts : sortedUsers;
                    const userCount = userViewType === 'host' ? hosts.length : users.length;

                    return (
                      <div>
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", border: "none", overflow: "hidden" }}>
                          <div style={{ padding: "24px", borderBottom: "1px solid #e6e6e6" }}>
                            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#222", margin: 0 }}>
                              {userCount} {userCount === 1 ? (userViewType === 'host' ? 'host' : 'user') : (userViewType === 'host' ? 'hosts' : 'users')}
                            </h3>
                          </div>
                          <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <thead>
                                <tr style={{ borderBottom: "1px solid #e6e6e6", backgroundColor: "#fafafa" }}>
                                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Name</th>
                                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Email</th>
                                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Joined</th>
                                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Status</th>
                                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {displayUsers.length > 0 ? (
                                  displayUsers.map((user: any, index: number) => {
                                    let name = user.displayName || '';
                                    if (!name && (user.firstName || user.lastName)) {
                                      name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                                    }
                                    if (!name) {
                                      name = user.email?.split('@')[0] || 'User';
                                    }
                                    
                                    const joinDate = user.createdAt 
                                      ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                      : 'N/A';
                                    
                                    const isAdmin = user.email === 'venuproj00@gmail.com' || user.role === 'admin';
                                    
                                    return (
                                      <tr key={user.uid || index} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                        <td style={{ padding: "16px 24px", fontSize: "14px", color: "#222", fontWeight: "500" }}>
                                          {name}
                                        </td>
                                        <td style={{ padding: "16px 24px", fontSize: "14px", color: "#666" }}>
                                          {user.email || 'N/A'}
                                        </td>
                                        <td style={{ padding: "16px 24px", fontSize: "14px", color: "#666" }}>
                                          {joinDate}
                                        </td>
                                        <td style={{ padding: "16px 24px" }}>
                                          <span
                                            style={{
                                              display: "inline-block",
                                              padding: "4px 12px",
                                              borderRadius: "12px",
                                              fontSize: "12px",
                                              fontWeight: "500",
                                              backgroundColor: isAdmin ? "#dcfce7" : "#f0f0f0",
                                              color: isAdmin ? "#22c55e" : "#666",
                                            }}
                                          >
                                            {isAdmin ? 'Admin' : 'User'}
                                          </span>
                                        </td>
                                        <td style={{ padding: "16px 24px" }}>
                                          <button
                                            style={{
                                              padding: "4px 8px",
                                              backgroundColor: "#f3f4f6",
                                              border: "none",
                                              borderRadius: "4px",
                                              fontSize: "12px",
                                              color: "#666",
                                              cursor: "pointer",
                                            }}
                                          >
                                            View
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })
                                ) : (
                                  <tr>
                                    <td colSpan={5} style={{ padding: "40px", textAlign: "center", fontSize: "14px", color: "#999" }}>
                                      No {userViewType === 'host' ? 'hosts' : 'users'} found
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              {activeMenu === 'verification' && (
                <div>
                  {/* Header */}
                  <div style={{ marginBottom: "24px" }}>
                    <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#222", marginBottom: "4px" }}>Verification</h1>
                  </div>

                  {/* Filters and Actions Bar */}
                  {(() => {
                    // Calculate current month's date range
                    const now = new Date();
                    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                    const formattedFirstDay = `${monthNames[firstDayOfMonth.getMonth()].substring(0, 3)} ${firstDayOfMonth.getDate()}, ${firstDayOfMonth.getFullYear()}`;
                    const formattedLastDay = `${monthNames[lastDayOfMonth.getMonth()].substring(0, 3)} ${lastDayOfMonth.getDate()}, ${lastDayOfMonth.getFullYear()}`;
                    const dateRangeText = `${formattedFirstDay} – ${formattedLastDay}`;
                    
                    return (
                      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: "8px", backgroundColor: "#f5f5f5", borderRadius: "8px", padding: "4px" }}>
                          <button
                            onClick={() => setVerificationViewType('host')}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: verificationViewType === 'host' ? "#1976d2" : "transparent",
                              border: verificationViewType === 'host' ? "1px solid #1976d2" : "none",
                              borderRadius: "6px",
                              fontSize: "14px",
                              fontWeight: verificationViewType === 'host' ? "500" : "400",
                              color: verificationViewType === 'host' ? "#fff" : "#222",
                              cursor: "pointer",
                              boxShadow: verificationViewType === 'host' ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                              transition: "all 0.2s",
                            }}
                          >
                            Host
                          </button>
                          <button
                            onClick={() => setVerificationViewType('user')}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: verificationViewType === 'user' ? "#1976d2" : "transparent",
                              border: verificationViewType === 'user' ? "1px solid #1976d2" : "none",
                              borderRadius: "6px",
                              fontSize: "14px",
                              fontWeight: verificationViewType === 'user' ? "500" : "400",
                              color: verificationViewType === 'user' ? "#fff" : "#222",
                              cursor: "pointer",
                              boxShadow: verificationViewType === 'user' ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                              transition: "all 0.2s",
                            }}
                          >
                            User
                          </button>
                        </div>
                        <select
                          style={{
                            padding: "10px 32px 10px 12px",
                            border: "1px solid #e6e6e6",
                            borderRadius: "8px",
                            fontSize: "14px",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          <option>All Requests</option>
                          <option>Pending</option>
                          <option>Approved</option>
                          <option>Declined</option>
                        </select>
                        <div style={{ position: "relative", display: "flex", alignItems: "center", padding: "10px 12px", border: "1px solid #e6e6e6", borderRadius: "8px", fontSize: "14px", backgroundColor: "#fff", cursor: "pointer" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" style={{ marginRight: "8px" }}>
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span style={{ color: "#666" }}>{dateRangeText}</span>
                        </div>
                        <select
                          style={{
                            padding: "10px 32px 10px 12px",
                            border: "1px solid #e6e6e6",
                            borderRadius: "8px",
                            fontSize: "14px",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            outline: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <option>Export</option>
                          <option>PDF</option>
                        </select>
                        <select
                          style={{
                            padding: "10px 32px 10px 12px",
                            border: "1px solid #e6e6e6",
                            borderRadius: "8px",
                            fontSize: "14px",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          <option>Sort: Newest</option>
                          <option>Sort: Oldest</option>
                        </select>
                      </div>
                    );
                  })()}

                  {/* Verifications Table */}
                  {(() => {
                    // Force re-render when refresh key changes
                    const _refreshKey = verificationRefreshKey;
                    
                    // Load all listings with verification documents
                    const allListings: any[] = [];
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && (key.startsWith('hostListings_') || key.startsWith('listings_'))) {
                        try {
                          const listings = JSON.parse(localStorage.getItem(key) || '[]');
                          if (Array.isArray(listings)) {
                            allListings.push(...listings.map((l: any) => ({ ...l, sourceKey: key })));
                          }
                        } catch (e) {
                          console.error('Error parsing listings:', e);
                        }
                      }
                    }

                    // Load all users for user information
                    const allUsers: any[] = [];
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && key.startsWith('userData_')) {
                        try {
                          const userData = JSON.parse(localStorage.getItem(key) || 'null');
                          if (userData) {
                            allUsers.push({ ...userData, uid: key.replace('userData_', '') });
                          }
                        } catch (e) {
                          console.error('Error parsing user data:', e);
                        }
                      }
                    }

                    // Create verification requests from listings that have documents
                    const verificationRequests = allListings
                      .filter((listing: any) => {
                        // Only include listings with verification documents
                        if (!(listing.businessRegistration || listing.mayorsPermit || listing.proofOfOwnership || listing.validId)) {
                          return false;
                        }
                        
                        // Filter by host/user type based on sourceKey
                        if (verificationViewType === 'host') {
                          // Show only listings from hostListings_ keys
                          return listing.sourceKey && listing.sourceKey.startsWith('hostListings_');
                        } else {
                          // Show only listings from listings_ keys (regular users)
                          return listing.sourceKey && listing.sourceKey.startsWith('listings_');
                        }
                      })
                      .map((listing: any) => {
                        const userId = listing.userId || listing.hostId;
                        const user = allUsers.find((u: any) => u.uid === userId);
                        let userName = 'Unknown User';
                        let userPhoto = null;
                        if (user) {
                          if (user.firstName && user.lastName) {
                            userName = `${user.firstName} ${user.lastName}`;
                          } else if (user.displayName) {
                            userName = user.displayName;
                          } else if (user.email) {
                            userName = user.email.split('@')[0];
                          }
                          userPhoto = user.photoURL || localStorage.getItem(`profilePhoto_${userId}`);
                        }
                        
                        // Determine verification type
                        const hasBusinessDocs = listing.businessRegistration && listing.mayorsPermit;
                        const verificationType = hasBusinessDocs ? 'Business' : 'Individual';
                        
                        // Determine document type
                        let documentType = 'ID Card';
                        if (listing.validId && listing.selfieWithId) {
                          documentType = 'Selfie + ID';
                        } else if (listing.validId) {
                          documentType = 'ID Card';
                        }
                        
                        // Determine status
                        let status = 'pending';
                        if (listing.verificationStatus === 'approved' || listing.verificationStatus === 'verified' || listing.verified || listing.approved) {
                          status = 'approved';
                        } else if (listing.verificationStatus === 'declined' || listing.verificationStatus === 'denied' || listing.denied || listing.declined) {
                          status = 'declined';
                        }
                        
                        const submittedDate = listing.createdAt || listing.submittedAt || listing.date || new Date().toISOString();
                        const formattedDate = new Date(submittedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                        
                        return {
                          id: listing.id,
                          userId,
                          userName,
                          userPhoto,
                          submittedDate: formattedDate,
                          documentType,
                          verificationType,
                          status,
                          listing,
                        };
                      })
                      .sort((a: any, b: any) => {
                        // Sort by newest first
                        const dateA = new Date(a.listing.createdAt || a.listing.submittedAt || a.listing.date || new Date()).getTime();
                        const dateB = new Date(b.listing.createdAt || b.listing.submittedAt || b.listing.date || new Date()).getTime();
                        return dateB - dateA;
                      });

                    // Add sample verification request if none exist
                    if (verificationRequests.length === 0) {
                      const sampleDate = new Date();
                      sampleDate.setDate(sampleDate.getDate() - 3);
                      verificationRequests.push({
                        id: 'sample-verification-001',
                        userId: 'sample-user-001',
                        userName: 'Maria Santos',
                        userPhoto: null,
                        submittedDate: sampleDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                        documentType: 'ID Card',
                        verificationType: 'Individual',
                        status: 'pending',
                        listing: {
                          id: 'sample-listing-001',
                          createdAt: sampleDate.toISOString(),
                          businessRegistration: null,
                          mayorsPermit: null,
                          proofOfOwnership: null,
                          validId: 'sample-id',
                        },
                      });
                    }

                    return (
                      <div style={{ backgroundColor: "#fff", borderRadius: "8px", border: "none", overflow: "hidden" }}>
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr style={{ borderBottom: "1px solid #e6e6e6", backgroundColor: "#fafafa" }}>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>User</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Submitted</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Document</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Type</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Status</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {verificationRequests.map((request: any) => {
                                const statusColor = request.status === 'approved' ? '#22c55e' : request.status === 'declined' ? '#ef4444' : '#f97316';
                                const statusBg = request.status === 'approved' ? '#dcfce7' : request.status === 'declined' ? '#fee2e2' : '#ffedd5';
                                const statusText = request.status === 'approved' ? 'Approved' : request.status === 'declined' ? 'Declined' : 'Pending';
                                
                                // Document icon
                                const DocumentIcon = () => (
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                                    {request.documentType === 'Selfie + ID' ? (
                                      <>
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <circle cx="9" cy="9" r="2" />
                                        <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                      </>
                                    ) : (
                                      <>
                                        <rect x="3" y="4" width="18" height="18" rx="2" />
                                        <line x1="9" y1="9" x2="15" y2="9" />
                                        <line x1="9" y1="13" x2="15" y2="13" />
                                        <line x1="9" y1="17" x2="15" y2="17" />
                                      </>
                                    )}
                                  </svg>
                                );
                                
                                return (
                                  <tr key={request.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                    <td style={{ padding: "16px 24px" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div style={{
                                          width: "40px",
                                          height: "40px",
                                          borderRadius: "50%",
                                          backgroundColor: "#e6e6e6",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          overflow: "hidden",
                                          flexShrink: 0,
                                        }}>
                                          {request.userPhoto ? (
                                            <img src={request.userPhoto} alt={request.userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                          ) : (
                                            <span style={{ fontSize: "16px", color: "#666" }}>{request.userName.charAt(0).toUpperCase()}</span>
                                          )}
                                        </div>
                                        <span style={{ fontSize: "14px", color: "#222", fontWeight: "500" }}>{request.userName}</span>
                                      </div>
                                    </td>
                                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#666" }}>{request.submittedDate}</td>
                                    <td style={{ padding: "16px 24px" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <DocumentIcon />
                                        <span style={{ fontSize: "14px", color: "#666" }}>{request.documentType}</span>
                                      </div>
                                    </td>
                                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#666" }}>{request.verificationType}</td>
                                    <td style={{ padding: "16px 24px" }}>
                                      <span style={{
                                        padding: "4px 12px",
                                        borderRadius: "12px",
                                        fontSize: "12px",
                                        fontWeight: "500",
                                        backgroundColor: statusBg,
                                        color: statusColor,
                                      }}>
                                        {statusText}
                                      </span>
                                    </td>
                                    <td style={{ padding: "16px 24px" }}>
                                      <div style={{ display: "flex", gap: "8px" }}>
                                        {request.status === 'pending' && (
                                          <>
                                            <button
                                              onClick={() => {
                                                // Handle approve
                                                const listing = request.listing;
                                                listing.verificationStatus = 'approved';
                                                listing.approved = true;
                                                listing.verified = true; // Keep for backward compatibility
                                                listing.denied = false;
                                                listing.declined = false;
                                                const key = listing.sourceKey || `hostListings_${request.userId}`;
                                                const listings = JSON.parse(localStorage.getItem(key) || '[]');
                                                const updatedListings = listings.map((l: any) => l.id === listing.id ? listing : l);
                                                localStorage.setItem(key, JSON.stringify(updatedListings));
                                                window.dispatchEvent(new CustomEvent('hostListingsUpdated'));
                                                setVerificationRefreshKey((prev) => prev + 1);
                                              }}
                                              style={{
                                                padding: "6px 16px",
                                                borderRadius: "6px",
                                                fontSize: "12px",
                                                fontWeight: "500",
                                                backgroundColor: "#22c55e",
                                                color: "#fff",
                                                border: "none",
                                                cursor: "pointer",
                                              }}
                                            >
                                              Approve
                                            </button>
                                            <button
                                              onClick={() => {
                                                // Handle decline
                                                const listing = request.listing;
                                                listing.verificationStatus = 'declined';
                                                listing.declined = true;
                                                listing.denied = true; // Keep for backward compatibility
                                                listing.approved = false;
                                                listing.verified = false;
                                                const key = listing.sourceKey || `hostListings_${request.userId}`;
                                                const listings = JSON.parse(localStorage.getItem(key) || '[]');
                                                const updatedListings = listings.map((l: any) => l.id === listing.id ? listing : l);
                                                localStorage.setItem(key, JSON.stringify(updatedListings));
                                                window.dispatchEvent(new CustomEvent('hostListingsUpdated'));
                                                setVerificationRefreshKey((prev) => prev + 1);
                                              }}
                                              style={{
                                                padding: "6px 16px",
                                                borderRadius: "6px",
                                                fontSize: "12px",
                                                fontWeight: "500",
                                                backgroundColor: "#ef4444",
                                                color: "#fff",
                                                border: "none",
                                                cursor: "pointer",
                                              }}
                                            >
                                              Decline
                                            </button>
                                          </>
                                        )}
                                        {(request.status === 'approved' || request.status === 'declined') && (
                                          <button
                                            onClick={() => {
                                              // Handle edit - reset to pending
                                              const listing = request.listing;
                                              listing.verificationStatus = 'pending';
                                              listing.approved = false;
                                              listing.declined = false;
                                              listing.verified = false;
                                              listing.denied = false;
                                              const key = listing.sourceKey || `hostListings_${request.userId}`;
                                              const listings = JSON.parse(localStorage.getItem(key) || '[]');
                                              const updatedListings = listings.map((l: any) => l.id === listing.id ? listing : l);
                                              localStorage.setItem(key, JSON.stringify(updatedListings));
                                              window.dispatchEvent(new CustomEvent('hostListingsUpdated'));
                                              setVerificationRefreshKey((prev) => prev + 1);
                                            }}
                                            style={{
                                              padding: "6px 16px",
                                              borderRadius: "6px",
                                              fontSize: "12px",
                                              fontWeight: "500",
                                              backgroundColor: "#666",
                                              color: "#fff",
                                              border: "none",
                                              cursor: "pointer",
                                            }}
                                          >
                                            Edit
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              {activeMenu === 'reports' && (
                <div>
                  {/* Reports Table Container */}
                  <div style={{ backgroundColor: "#fff", borderRadius: "8px", border: "none", overflow: "hidden" }}>
                    {/* Filters/Sort Bar */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #e6e6e6" }}>
                      <select
                        style={{
                          padding: "10px 32px 10px 12px",
                          border: "1px solid #e6e6e6",
                          borderRadius: "8px",
                          fontSize: "14px",
                          backgroundColor: "#fff",
                          cursor: "pointer",
                          outline: "none",
                        }}
                      >
                        <option>All Reports</option>
                        <option>New</option>
                        <option>In Review</option>
                        <option>Reviewed</option>
                      </select>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <select
                          style={{
                            padding: "10px 32px 10px 12px",
                            border: "1px solid #e6e6e6",
                            borderRadius: "8px",
                            fontSize: "14px",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          <option>Last 7 Days</option>
                          <option>Last 30 Days</option>
                          <option>Last 90 Days</option>
                          <option>All Time</option>
                        </select>
                        <div style={{ position: "relative" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                          </svg>
                          <input
                            type="text"
                            placeholder="Search"
                            style={{
                              padding: "10px 12px 10px 36px",
                              border: "1px solid #e6e6e6",
                              borderRadius: "8px",
                              fontSize: "14px",
                              outline: "none",
                              width: "200px",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Table */}
                    {(() => {
                      // Load reports from localStorage
                      const allReports: any[] = [];
                      for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && (key.startsWith('reports_') || key.startsWith('adminReports_'))) {
                          try {
                            const reports = JSON.parse(localStorage.getItem(key) || '[]');
                            if (Array.isArray(reports)) {
                              allReports.push(...reports);
                            }
                          } catch (e) {
                            console.error('Error parsing reports:', e);
                          }
                        }
                      }

                      // Sort reports by date (newest first)
                      const sortedReports = allReports.sort((a: any, b: any) => {
                        const dateA = new Date(a.date || a.createdAt || a.timestamp || 0).getTime();
                        const dateB = new Date(b.date || b.createdAt || b.timestamp || 0).getTime();
                        return dateB - dateA;
                      });

                      // Add sample reports if none exist
                      if (sortedReports.length === 0) {
                        const sampleDate1 = new Date();
                        sampleDate1.setDate(sampleDate1.getDate() - 2);
                        const sampleDate2 = new Date();
                        sampleDate2.setDate(sampleDate2.getDate() - 4);
                        sortedReports.push({
                          id: 'sample-report-001',
                          reporter: 'Jane Smith',
                          venue: 'Luxury Event Hall',
                          reason: 'Inappropriate content',
                          date: sampleDate1.toISOString(),
                          status: 'new',
                        });
                        sortedReports.push({
                          id: 'sample-report-002',
                          reporter: 'Michael Chen',
                          venue: 'Grand Ballroom',
                          reason: 'False information',
                          date: sampleDate2.toISOString(),
                          status: 'in_review',
                        });
                      }

                      return (
                        <>
                          <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <thead>
                                <tr style={{ borderBottom: "1px solid #e6e6e6", backgroundColor: "#fafafa" }}>
                                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Reporter</th>
                                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Venue</th>
                                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Reason</th>
                                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Date</th>
                                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Status</th>
                                  <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sortedReports.map((report: any, index: number) => {
                                  const status = report.status || 'new';
                                  const statusDisplay = status === 'new' ? 'New' : status === 'in_review' ? 'In Review' : 'Reviewed';
                                  const statusBg = status === 'new' ? '#fef9c3' : status === 'in_review' ? '#dbeafe' : '#dcfce7';
                                  const statusColor = status === 'new' ? '#eab308' : status === 'in_review' ? '#1976d2' : '#22c55e';
                                  const reportDate = report.date || report.createdAt || report.timestamp;
                                  const formattedDate = reportDate ? new Date(reportDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A';
                                  const reporterName = report.reporterName || report.reporter || report.userName || 'Unknown';
                                  const venueName = report.venueName || report.venue || 'Unknown Venue';
                                  const reason = report.reason || report.type || 'No reason provided';

                                  return (
                                    <tr key={report.id || index} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#222", fontWeight: "500" }}>{reporterName}</td>
                                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#666" }}>{venueName}</td>
                                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#666" }}>{reason}</td>
                                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#666" }}>{formattedDate}</td>
                                      <td style={{ padding: "16px 24px" }}>
                                        <span style={{
                                          display: "inline-block",
                                          padding: "4px 12px",
                                          borderRadius: "12px",
                                          fontSize: "12px",
                                          fontWeight: "500",
                                          backgroundColor: statusBg,
                                          color: statusColor,
                                        }}>{statusDisplay}</span>
                                      </td>
                                      <td style={{ padding: "16px 24px" }}>
                                        <button
                                          style={{
                                            padding: "6px 16px",
                                            borderRadius: "6px",
                                            fontSize: "12px",
                                            fontWeight: "500",
                                            backgroundColor: "#1976d2",
                                            color: "#fff",
                                            border: "none",
                                            cursor: "pointer",
                                          }}
                                        >
                                          View
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          {/* Pagination - only show if there are multiple pages */}
                          {sortedReports.length > 10 && (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", padding: "20px 24px", borderTop: "1px solid #e6e6e6" }}>
                              <button
                                style={{
                                  padding: "8px 12px",
                                  border: "1px solid #e6e6e6",
                                  borderRadius: "6px",
                                  backgroundColor: "#fff",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  color: "#666",
                                }}
                              >
                                &lt; Previous
                              </button>
                              <button
                                style={{
                                  padding: "8px 12px",
                                  border: "1px solid #1976d2",
                                  borderRadius: "6px",
                                  backgroundColor: "#1976d2",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  color: "#fff",
                                  fontWeight: "500",
                                }}
                              >
                                1
                              </button>
                              <button
                                style={{
                                  padding: "8px 12px",
                                  border: "1px solid #e6e6e6",
                                  borderRadius: "6px",
                                  backgroundColor: "#fff",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  color: "#666",
                                }}
                              >
                                Next &gt;
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
              {activeMenu === 'messages' && (
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden', height: 'calc(100vh - 145px)' }}>
                  {/* Left Panel - Messages List */}
                  <div style={{
                    width: '400px',
                    borderRight: '1px solid #e6e6e6',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'white',
                  }}>
                    {/* Messages Header */}
                    <div style={{
                      padding: '24px',
                      borderBottom: '1px solid #e6e6e6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      position: 'relative',
                      minHeight: '40px'
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: '24px',
                        right: '24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        opacity: searchOpen ? 0 : 1,
                        transform: searchOpen ? 'translateX(-20px)' : 'translateX(0)',
                        pointerEvents: searchOpen ? 'none' : 'auto'
                      }}>
                        <h1 style={{ 
                          fontSize: '22px', 
                          fontWeight: '600', 
                          color: '#222', 
                          margin: 0
                        }}>
                          Messages
                        </h1>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <button
                            type="button"
                            onClick={() => setSearchOpen(true)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              color: '#222',
                            }}
                          >
                            <MessageSearchIcon />
                          </button>
                          <button
                            type="button"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              color: '#222',
                            }}
                          >
                            <SettingsIcon />
                          </button>
                        </div>
                      </div>
                      <div style={{
                        position: 'absolute',
                        left: '24px',
                        right: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        opacity: searchOpen ? 1 : 0,
                        transform: searchOpen ? 'translateX(0)' : 'translateX(20px)',
                        pointerEvents: searchOpen ? 'auto' : 'none'
                      }}>
                        <div style={{
                          position: 'relative',
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <svg 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            style={{
                              position: 'absolute',
                              left: '16px',
                              color: '#666',
                              pointerEvents: 'none'
                            }}
                          >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                          </svg>
                          <input
                            type="text"
                            placeholder="Search all messages"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                            style={{
                              width: '100%',
                              padding: '12px 16px 12px 48px',
                              border: '1px solid #222',
                              borderRadius: '24px',
                              fontSize: '14px',
                              outline: 'none',
                              transition: 'border-color 0.2s ease'
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                            onBlur={(e) => e.currentTarget.style.borderColor = '#222'}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px 0',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#222',
                            transition: 'opacity 0.2s ease'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>

                    {/* Filter Buttons */}
                    <div style={{
                      padding: '16px 24px',
                      borderBottom: '1px solid #e6e6e6',
                      display: 'flex',
                      gap: '8px',
                    }}>
                      <button
                        type="button"
                        onClick={() => setFilter('all')}
                        style={{
                          background: filter === 'all' ? '#222' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: filter === 'all' ? 'white' : '#222',
                          borderRadius: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        All
                        {filter === 'all' && (
                          <span style={{ fontSize: '10px' }}>▼</span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilter('unread')}
                        style={{
                          background: filter === 'unread' ? '#222' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: filter === 'unread' ? 'white' : '#222',
                          borderRadius: '20px',
                        }}
                      >
                        Unread
                      </button>
                    </div>

                    {/* Conversations List */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      {filteredConversations.length === 0 ? (
                        <div style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '48px',
                          color: '#666',
                        }}>
                          <div style={{ marginBottom: '16px', color: '#b0b0b0' }}>
                            <MessageBubbleIcon />
                          </div>
                          <h2 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#222',
                            marginBottom: '8px',
                          }}>
                            You don't have any messages
                          </h2>
                          <p style={{
                            fontSize: '14px',
                            color: '#666',
                            textAlign: 'center',
                            margin: 0,
                          }}>
                            When you receive a new message, it will appear here.
                          </p>
                        </div>
                      ) : (
                        filteredConversations.map((conv) => {
                          const participant = getParticipantInfo(conv, user?.uid || '');
                          const unreadCount = conv.unreadCount?.[user?.uid || ''] || 0;
                          const isSelected = selectedConversation?.id === conv.id;
                          
                          return (
                            <div
                              key={conv.id}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedConversation(conv);
                                window.scrollTo(0, 0);
                              }}
                              style={{
                                padding: '16px 24px',
                                borderBottom: '1px solid #e6e6e6',
                                cursor: 'pointer',
                                backgroundColor: isSelected ? '#f6f7f8' : 'white',
                                transition: 'background-color 0.2s',
                              }}
                              onMouseOver={(e) => !isSelected && (e.currentTarget.style.backgroundColor = '#fafafa')}
                              onMouseOut={(e) => !isSelected && (e.currentTarget.style.backgroundColor = 'white')}
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <div style={{
                                  width: '48px',
                                  height: '48px',
                                  borderRadius: '50%',
                                  backgroundColor: participant?.photo ? 'transparent' : '#1976d2',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontSize: '18px',
                                  fontWeight: 'bold',
                                  flexShrink: 0,
                                  backgroundImage: participant?.photo ? `url(${participant.photo})` : 'none',
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }}>
                                  {!participant?.photo && (participant?.name.charAt(0).toUpperCase() || 'U')}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                    <h3 style={{ 
                                      margin: 0, 
                                      fontSize: '16px', 
                                      fontWeight: unreadCount > 0 ? '600' : '500',
                                      color: '#222',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}>
                                      {participant?.name || 'User'}
                                    </h3>
                                    {conv.lastMessageTime && (
                                      <span style={{ 
                                        fontSize: '12px', 
                                        color: '#666',
                                        whiteSpace: 'nowrap',
                                        marginLeft: '8px',
                                      }}>
                                        {new Date(conv.lastMessageTime.toMillis()).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                  <p style={{ 
                                    margin: '4px 0 0', 
                                    fontSize: '14px', 
                                    color: '#666', 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis', 
                                    whiteSpace: 'nowrap',
                                    fontWeight: unreadCount > 0 ? '500' : 'normal',
                                  }}>
                                    {conv.listingName && (
                                      <span style={{ color: '#1976d2', marginRight: '4px' }}>
                                        {conv.listingName} • 
                                      </span>
                                    )}
                                    {conv.lastMessage || 'No messages yet'}
                                  </p>
                                  {unreadCount > 0 && (
                                    <div style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      minWidth: '20px',
                                      height: '20px',
                                      padding: '0 6px',
                                      backgroundColor: '#1976d2',
                                      color: 'white',
                                      borderRadius: '10px',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      marginTop: '4px',
                                    }}>
                                      {unreadCount}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right Panel - Message View */}
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'white',
                  }}>
                    {selectedConversation ? (
                      <>
                        {/* Messages Header */}
                        <div style={{ 
                          padding: '16px 24px', 
                          borderBottom: '1px solid #e6e6e6',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: participantInfo?.photo ? 'transparent' : '#1976d2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            backgroundImage: participantInfo?.photo ? `url(${participantInfo.photo})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}>
                            {!participantInfo?.photo && (participantInfo?.name?.charAt(0).toUpperCase() || 'U')}
                          </div>
                          <div>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#222' }}>
                              {participantInfo?.name || 'User'}
                            </h2>
                            {selectedConversation.listingName && (
                              <p style={{ margin: '2px 0 0', fontSize: '14px', color: '#666' }}>
                                {selectedConversation.listingName}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Messages List */}
                        <div 
                          ref={messagesContainerRef}
                          style={{ 
                            flex: 1, 
                            overflowY: 'auto', 
                            overflowX: 'hidden',
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                          }}
                        >
                          {messages.length === 0 ? (
                            <div style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#666',
                              fontSize: '14px',
                            }}>
                              No messages yet. Start the conversation!
                            </div>
                          ) : (
                            messages.map((msg) => {
                              const isOwn = msg.senderId === user?.uid;
                              return (
                                <div
                                  key={msg.id}
                                  style={{
                                    display: 'flex',
                                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                                  }}
                                >
                                  <div style={{
                                    maxWidth: '70%',
                                    padding: '12px 16px',
                                    borderRadius: '18px',
                                    backgroundColor: isOwn ? '#1976d2' : '#f0f0f0',
                                    color: isOwn ? 'white' : '#222',
                                    wordWrap: 'break-word',
                                  }}>
                                    <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.4' }}>
                                      {msg.text}
                                    </p>
                                    <span style={{ 
                                      fontSize: '11px', 
                                      opacity: 0.7, 
                                      display: 'block', 
                                      marginTop: '4px',
                                    }}>
                                      {msg.timestamp && new Date(msg.timestamp.toMillis()).toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                          
                          {/* Typing Indicator */}
                          {typingUsers.length > 0 && (
                            <div style={{
                              display: 'flex',
                              justifyContent: 'flex-start',
                              marginTop: '8px',
                            }}>
                              <div style={{
                                padding: '12px 16px',
                                borderRadius: '18px',
                                backgroundColor: '#f0f0f0',
                                color: '#666',
                                fontSize: '14px',
                                fontStyle: 'italic',
                              }}>
                                {participantInfo?.name || 'User'} is typing
                                <span style={{ 
                                  display: 'inline-flex',
                                  marginLeft: '4px',
                                  gap: '2px',
                                }}>
                                  <span style={{ animation: 'typing 1.4s infinite', animationDelay: '0s' }}>●</span>
                                  <span style={{ animation: 'typing 1.4s infinite', animationDelay: '0.2s' }}>●</span>
                                  <span style={{ animation: 'typing 1.4s infinite', animationDelay: '0.4s' }}>●</span>
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div style={{ 
                          padding: '16px 24px', 
                          borderTop: '1px solid #e6e6e6', 
                          display: 'flex', 
                          gap: '12px',
                        }}>
                          <input
                            type="text"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            placeholder="Type a message..."
                            style={{
                              flex: 1,
                              padding: '12px 16px',
                              border: '1px solid #e6e6e6',
                              borderRadius: '24px',
                              fontSize: '15px',
                              outline: 'none',
                              transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                            onBlur={(e) => e.currentTarget.style.borderColor = '#e6e6e6'}
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={!messageText.trim()}
                            style={{
                              padding: '12px 24px',
                              backgroundColor: messageText.trim() ? '#1976d2' : '#e6e6e6',
                              color: messageText.trim() ? 'white' : '#999',
                              border: 'none',
                              borderRadius: '24px',
                              fontSize: '15px',
                              fontWeight: '600',
                              cursor: messageText.trim() ? 'pointer' : 'not-allowed',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseOver={(e) => {
                              if (messageText.trim()) {
                                e.currentTarget.style.backgroundColor = '#1565c0';
                              }
                            }}
                            onMouseOut={(e) => {
                              if (messageText.trim()) {
                                e.currentTarget.style.backgroundColor = '#1976d2';
                              }
                            }}
                          >
                            Send
                          </button>
                        </div>
                      </>
                    ) : (
                      <div style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: '#666',
                        fontSize: '16px',
                      }}>
                        Select a conversation to view messages
                      </div>
                    )}
                  </div>
                </div>
              )}
              {activeMenu === 'reviews' && (
                <div>
                  {/* Header */}
                  <div style={{ marginBottom: "24px" }}>
                    <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#222", marginBottom: "4px" }}>Reviews</h1>
                    <p style={{ fontSize: "14px", color: "#666" }}>Admin Control for Reviews</p>
                  </div>

                  {/* Filters and Actions Bar */}
                  {(() => {
                    // Calculate current month's date range
                    const now = new Date();
                    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                    const formattedFirstDay = `${monthNames[firstDayOfMonth.getMonth()].substring(0, 3)} ${firstDayOfMonth.getDate()}, ${firstDayOfMonth.getFullYear()}`;
                    const formattedLastDay = `${monthNames[lastDayOfMonth.getMonth()].substring(0, 3)} ${lastDayOfMonth.getDate()}, ${lastDayOfMonth.getFullYear()}`;
                    const dateRangeText = `${formattedFirstDay} - ${formattedLastDay}`;
                    
                    return (
                      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
                        <select
                          style={{
                            padding: "10px 32px 10px 12px",
                            border: "1px solid #e6e6e6",
                            borderRadius: "8px",
                            fontSize: "14px",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          <option>All Pending</option>
                          <option>Pending</option>
                          <option>Approved</option>
                          <option>Declined</option>
                        </select>
                        <div style={{ position: "relative", display: "flex", alignItems: "center", padding: "10px 12px", border: "1px solid #e6e6e6", borderRadius: "8px", fontSize: "14px", backgroundColor: "#fff", cursor: "pointer" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" style={{ marginRight: "8px" }}>
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span style={{ color: "#666" }}>{dateRangeText}</span>
                        </div>
                        <select
                          style={{
                            padding: "10px 32px 10px 12px",
                            border: "1px solid #e6e6e6",
                            borderRadius: "8px",
                            fontSize: "14px",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            outline: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <option>Export</option>
                          <option>PDF</option>
                        </select>
                        <select
                          style={{
                            padding: "10px 32px 10px 12px",
                            border: "1px solid #e6e6e6",
                            borderRadius: "8px",
                            fontSize: "14px",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          <option>Sort: Newest</option>
                          <option>Sort: Oldest</option>
                        </select>
                      </div>
                    );
                  })()}

                  {/* Description */}
                  <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>
                    Pending reviews awaiting admin approval before being visible to others.
                  </p>

                  {/* Reviews Table */}
                  {(() => {
                    // Force re-render when refresh key changes
                    const _refreshKey = reviewsRefreshKey;
                    
                    // Load all reviews from localStorage
                    const allReviews: any[] = [];
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && (key.startsWith('reviews_') || key.startsWith('adminReviews_') || key.startsWith('pendingReviews_'))) {
                        try {
                          const reviews = JSON.parse(localStorage.getItem(key) || '[]');
                          if (Array.isArray(reviews)) {
                            allReviews.push(...reviews.map((r: any) => ({ ...r, sourceKey: key })));
                          }
                        } catch (e) {
                          console.error('Error parsing reviews:', e);
                        }
                      }
                    }

                    // Also check bookings for reviews
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && (key.startsWith('upcomingBookings_') || key.startsWith('completedBookings_') || key.startsWith('cancelledBookings_'))) {
                        try {
                          const bookings = JSON.parse(localStorage.getItem(key) || '[]');
                          if (Array.isArray(bookings)) {
                            bookings.forEach((booking: any) => {
                              if (booking.review || booking.reviewText) {
                                allReviews.push({
                                  id: `review_${booking.id}_${Date.now()}`,
                                  reviewerId: booking.userId || booking.guestId,
                                  reviewerName: booking.guestName || 'Unknown User',
                                  rating: booking.reviewRating || booking.rating || 5,
                                  reviewFor: booking.hostName || booking.venueName || booking.listingName || 'Unknown',
                                  reviewForId: booking.hostId || booking.venueId || booking.listingId,
                                  reviewText: booking.reviewText || booking.review || '',
                                  date: booking.reviewDate || booking.createdAt || booking.date || new Date().toISOString(),
                                  status: booking.reviewStatus || (booking.reviewApproved ? 'approved' : booking.reviewDeclined ? 'declined' : 'pending'),
                                  bookingId: booking.id,
                                  sourceKey: key,
                                  reviewStatus: booking.reviewStatus,
                                  reviewApproved: booking.reviewApproved,
                                  reviewDeclined: booking.reviewDeclined,
                                });
                              }
                            });
                          }
                        } catch (e) {
                          console.error('Error parsing bookings for reviews:', e);
                        }
                      }
                    }

                    // Load all users for reviewer information
                    const allUsers: any[] = [];
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && key.startsWith('userData_')) {
                        try {
                          const userData = JSON.parse(localStorage.getItem(key) || 'null');
                          if (userData) {
                            allUsers.push({ ...userData, uid: key.replace('userData_', '') });
                          }
                        } catch (e) {
                          console.error('Error parsing user data:', e);
                        }
                      }
                    }

                    // Process reviews with user information
                    const processedReviews = allReviews.map((review: any) => {
                      const reviewer = allUsers.find((u: any) => u.uid === review.reviewerId);
                      let reviewerName = review.reviewerName || 'Unknown User';
                      let reviewerPhoto = null;
                      if (reviewer) {
                        if (reviewer.firstName && reviewer.lastName) {
                          reviewerName = `${reviewer.firstName} ${reviewer.lastName}`;
                        } else if (reviewer.displayName) {
                          reviewerName = reviewer.displayName;
                        } else if (reviewer.email) {
                          reviewerName = reviewer.email.split('@')[0];
                        }
                        reviewerPhoto = reviewer.photoURL || localStorage.getItem(`profilePhoto_${review.reviewerId}`);
                      }

                      const reviewFor = allUsers.find((u: any) => u.uid === review.reviewForId);
                      let reviewForName = review.reviewFor || 'Unknown';
                      let reviewForPhoto = null;
                      if (reviewFor) {
                        if (reviewFor.firstName && reviewFor.lastName) {
                          reviewForName = `${reviewFor.firstName} ${reviewFor.lastName}`;
                        } else if (reviewFor.displayName) {
                          reviewForName = reviewFor.displayName;
                        } else if (reviewFor.email) {
                          reviewForName = reviewFor.email.split('@')[0];
                        }
                        reviewForPhoto = reviewFor.photoURL || localStorage.getItem(`profilePhoto_${review.reviewForId}`);
                      }

                      const reviewDate = new Date(review.date);
                      const formattedDate = reviewDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

                      // Determine status from review data
                      let reviewStatus = review.status || 'pending';
                      if (review.reviewStatus) {
                        reviewStatus = review.reviewStatus;
                      } else if (review.reviewApproved) {
                        reviewStatus = 'approved';
                      } else if (review.reviewDeclined) {
                        reviewStatus = 'declined';
                      }

                      return {
                        id: review.id,
                        reviewerName,
                        reviewerPhoto,
                        rating: review.rating || 5,
                        reviewForName,
                        reviewForPhoto,
                        reviewText: review.reviewText || review.text || '',
                        date: formattedDate,
                        status: reviewStatus,
                        review: { ...review, status: reviewStatus },
                      };
                    })
                    .filter((r: any) => r.status === 'pending') // Only show pending reviews
                    .sort((a: any, b: any) => {
                      const dateA = new Date(a.review.date || a.review.reviewDate || 0).getTime();
                      const dateB = new Date(b.review.date || b.review.reviewDate || 0).getTime();
                      return dateB - dateA;
                    });

                    // Add sample reviews if none exist
                    if (processedReviews.length === 0) {
                      const sampleDate1 = new Date();
                      sampleDate1.setDate(sampleDate1.getDate() - 5);
                      const sampleDate2 = new Date();
                      sampleDate2.setDate(sampleDate2.getDate() - 6);
                      const sampleDate3 = new Date();
                      sampleDate3.setDate(sampleDate3.getDate() - 7);
                      const sampleDate4 = new Date();
                      sampleDate4.setDate(sampleDate4.getDate() - 8);
                      const sampleDate5 = new Date();
                      sampleDate5.setDate(sampleDate5.getDate() - 10);
                      const sampleDate6 = new Date();
                      sampleDate6.setDate(sampleDate6.getDate() - 12);

                      processedReviews.push(
                        {
                          id: 'sample-review-001',
                          reviewerName: 'Sara Mendoza',
                          reviewerPhoto: null,
                          rating: 5,
                          reviewForName: 'John Reyes',
                          reviewForPhoto: null,
                          reviewText: 'John was a fantastic host! Very accommodating and the venue was perfect for our event. Highly recommend.',
                          date: sampleDate1.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                          status: 'pending',
                          review: { id: 'sample-review-001', date: sampleDate1.toISOString() },
                        },
                        {
                          id: 'sample-review-002',
                          reviewerName: 'Mike Santos',
                          reviewerPhoto: null,
                          rating: 4,
                          reviewForName: 'Emily Smith',
                          reviewForPhoto: null,
                          reviewText: 'The venue was great and Emily was helpful, but there were some minor issues with the sound system. Overall, a good experience.',
                          date: sampleDate2.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                          status: 'pending',
                          review: { id: 'sample-review-002', date: sampleDate2.toISOString() },
                        },
                        {
                          id: 'sample-review-003',
                          reviewerName: 'Lisa Cruz',
                          reviewerPhoto: null,
                          rating: 5,
                          reviewForName: 'The Grand Ballroom',
                          reviewForPhoto: null,
                          reviewText: 'Amazing venue! The Grand Ballroom was beautifully decorated and the staff were professional and attentive.',
                          date: sampleDate3.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                          status: 'pending',
                          review: { id: 'sample-review-003', date: sampleDate3.toISOString() },
                        },
                        {
                          id: 'sample-review-004',
                          reviewerName: 'Mark Dominguez',
                          reviewerPhoto: null,
                          rating: 2,
                          reviewForName: 'David Tan Host',
                          reviewForPhoto: null,
                          reviewText: 'David did not follow the venue rules and left a mess after his event. Disappointing experience.',
                          date: sampleDate4.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                          status: 'pending',
                          review: { id: 'sample-review-004', date: sampleDate4.toISOString() },
                        },
                        {
                          id: 'sample-review-005',
                          reviewerName: 'Anna Garcia',
                          reviewerPhoto: null,
                          rating: 5,
                          reviewForName: 'Sarah Lee Host',
                          reviewForPhoto: null,
                          reviewText: 'Sarah was an excellent host. The venue was well-maintained and everything went smoothly.',
                          date: sampleDate5.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                          status: 'pending',
                          review: { id: 'sample-review-005', date: sampleDate5.toISOString() },
                        },
                        {
                          id: 'sample-review-006',
                          reviewerName: 'David Tan',
                          reviewerPhoto: null,
                          rating: 4,
                          reviewForName: 'Outdoor Pavilion',
                          reviewForPhoto: null,
                          reviewText: 'Great outdoor venue for our team-building activity. Everything was set up nicely. Thanks to the hosts for making it a success.',
                          date: sampleDate6.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                          status: 'pending',
                          review: { id: 'sample-review-006', date: sampleDate6.toISOString() },
                        }
                      );
                    }

                    if (processedReviews.length === 0) {
                      return (
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", border: "none", padding: "60px 24px", textAlign: "center" }}>
                          <div style={{ fontSize: "16px", color: "#999", marginBottom: "8px" }}>No pending reviews</div>
                          <div style={{ fontSize: "14px", color: "#999" }}>Reviews will appear here when users submit them</div>
                        </div>
                      );
                    }

                    return (
                      <div style={{ backgroundColor: "#fff", borderRadius: "8px", border: "none", overflow: "hidden" }}>
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr style={{ borderBottom: "1px solid #e6e6e6", backgroundColor: "#fafafa" }}>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Reviewer</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Rating</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Review for</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Review</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Date</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Status</th>
                                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase" }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {processedReviews.map((review: any) => {
                                // Star rating component
                                const StarRating = ({ rating }: { rating: number }) => (
                                  <div style={{ display: "flex", gap: "2px" }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <svg
                                        key={star}
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill={star <= rating ? "#fbbf24" : "#e6e6e6"}
                                        stroke={star <= rating ? "#fbbf24" : "#e6e6e6"}
                                        strokeWidth="1"
                                      >
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                      </svg>
                                    ))}
                                  </div>
                                );

                                return (
                                  <tr key={review.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                    <td style={{ padding: "16px 24px" }}>
                                      <span style={{ fontSize: "14px", color: "#222", fontWeight: "500" }}>{review.reviewerName}</span>
                                    </td>
                                    <td style={{ padding: "16px 24px" }}>
                                      <StarRating rating={review.rating} />
                                    </td>
                                    <td style={{ padding: "16px 24px" }}>
                                      <span style={{ fontSize: "14px", color: "#666" }}>{review.reviewForName}</span>
                                    </td>
                                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#222", maxWidth: "400px" }}>
                                      {review.reviewText}
                                    </td>
                                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#666" }}>{review.date}</td>
                                    <td style={{ padding: "16px 24px" }}>
                                      {(() => {
                                        const statusColor = review.status === 'approved' ? '#22c55e' : review.status === 'declined' ? '#ef4444' : '#f97316';
                                        const statusBg = review.status === 'approved' ? '#dcfce7' : review.status === 'declined' ? '#fee2e2' : '#ffedd5';
                                        const statusText = review.status === 'approved' ? 'Approved' : review.status === 'declined' ? 'Declined' : 'Pending';
                                        
                                        return (
                                          <span style={{
                                            padding: "4px 12px",
                                            borderRadius: "12px",
                                            fontSize: "12px",
                                            fontWeight: "500",
                                            backgroundColor: statusBg,
                                            color: statusColor,
                                          }}>
                                            {statusText}
                                          </span>
                                        );
                                      })()}
                                    </td>
                                    <td style={{ padding: "16px 24px" }}>
                                      <div style={{ display: "flex", gap: "8px" }}>
                                        {review.status === 'pending' && (
                                          <>
                                            <button
                                              onClick={() => {
                                                // Handle approve
                                                const reviewData = review.review;
                                                const sourceKey = reviewData.sourceKey || review.review?.sourceKey;
                                                const bookingId = reviewData.bookingId || review.review?.bookingId || review.id?.replace('review_', '').split('_')[0];
                                                
                                                // Update in source
                                                if (sourceKey) {
                                                  try {
                                                    const sourceData = JSON.parse(localStorage.getItem(sourceKey) || '[]');
                                                    const updatedData = sourceData.map((item: any) => {
                                                      if (item.id === bookingId || item.id === reviewData.id || (review.id && item.id === review.id.replace('review_', '').split('_')[0])) {
                                                        return { 
                                                          ...item, 
                                                          reviewStatus: 'approved',
                                                          status: 'approved',
                                                          reviewApproved: true,
                                                          reviewDeclined: false,
                                                          review: item.review || item.reviewText ? {
                                                            ...(typeof item.review === 'object' ? item.review : {}),
                                                            reviewStatus: 'approved',
                                                            status: 'approved',
                                                            reviewApproved: true,
                                                            reviewDeclined: false
                                                          } : undefined
                                                        };
                                                      }
                                                      return item;
                                                    });
                                                    localStorage.setItem(sourceKey, JSON.stringify(updatedData));
                                                  } catch (e) {
                                                    console.error('Error updating review status:', e);
                                                  }
                                                }
                                                
                                                // Also try to update in all bookings keys
                                                for (let i = 0; i < localStorage.length; i++) {
                                                  const key = localStorage.key(i);
                                                  if (key && (key.startsWith('upcomingBookings_') || key.startsWith('completedBookings_') || key.startsWith('cancelledBookings_'))) {
                                                    try {
                                                      const bookings = JSON.parse(localStorage.getItem(key) || '[]');
                                                      let updated = false;
                                                      const updatedBookings = bookings.map((booking: any) => {
                                                        if (booking.id === bookingId && (booking.review || booking.reviewText)) {
                                                          updated = true;
                                                          return {
                                                            ...booking,
                                                            reviewStatus: 'approved',
                                                            reviewApproved: true,
                                                            reviewDeclined: false
                                                          };
                                                        }
                                                        return booking;
                                                      });
                                                      if (updated) {
                                                        localStorage.setItem(key, JSON.stringify(updatedBookings));
                                                      }
                                                    } catch (e) {
                                                      // Continue to next key
                                                    }
                                                  }
                                                }
                                                
                                                window.dispatchEvent(new CustomEvent('reviewsUpdated'));
                                                setReviewsRefreshKey((prev) => prev + 1);
                                              }}
                                              style={{
                                                padding: "6px 16px",
                                                borderRadius: "6px",
                                                fontSize: "12px",
                                                fontWeight: "500",
                                                backgroundColor: "#22c55e",
                                                color: "#fff",
                                                border: "none",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px",
                                              }}
                                            >
                                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12" />
                                              </svg>
                                              Approve
                                            </button>
                                            <button
                                              onClick={() => {
                                                // Handle decline
                                                const reviewData = review.review;
                                                const sourceKey = reviewData.sourceKey || review.review?.sourceKey;
                                                const bookingId = reviewData.bookingId || review.review?.bookingId || review.id?.replace('review_', '').split('_')[0];
                                                
                                                // Update in source
                                                if (sourceKey) {
                                                  try {
                                                    const sourceData = JSON.parse(localStorage.getItem(sourceKey) || '[]');
                                                    const updatedData = sourceData.map((item: any) => {
                                                      if (item.id === bookingId || item.id === reviewData.id || (review.id && item.id === review.id.replace('review_', '').split('_')[0])) {
                                                        return { 
                                                          ...item, 
                                                          reviewStatus: 'declined',
                                                          status: 'declined',
                                                          reviewDeclined: true,
                                                          reviewApproved: false,
                                                          review: item.review || item.reviewText ? {
                                                            ...(typeof item.review === 'object' ? item.review : {}),
                                                            reviewStatus: 'declined',
                                                            status: 'declined',
                                                            reviewDeclined: true,
                                                            reviewApproved: false
                                                          } : undefined
                                                        };
                                                      }
                                                      return item;
                                                    });
                                                    localStorage.setItem(sourceKey, JSON.stringify(updatedData));
                                                  } catch (e) {
                                                    console.error('Error updating review status:', e);
                                                  }
                                                }
                                                
                                                // Also try to update in all bookings keys
                                                for (let i = 0; i < localStorage.length; i++) {
                                                  const key = localStorage.key(i);
                                                  if (key && (key.startsWith('upcomingBookings_') || key.startsWith('completedBookings_') || key.startsWith('cancelledBookings_'))) {
                                                    try {
                                                      const bookings = JSON.parse(localStorage.getItem(key) || '[]');
                                                      let updated = false;
                                                      const updatedBookings = bookings.map((booking: any) => {
                                                        if (booking.id === bookingId && (booking.review || booking.reviewText)) {
                                                          updated = true;
                                                          return {
                                                            ...booking,
                                                            reviewStatus: 'declined',
                                                            reviewDeclined: true,
                                                            reviewApproved: false
                                                          };
                                                        }
                                                        return booking;
                                                      });
                                                      if (updated) {
                                                        localStorage.setItem(key, JSON.stringify(updatedBookings));
                                                      }
                                                    } catch (e) {
                                                      // Continue to next key
                                                    }
                                                  }
                                                }
                                                
                                                window.dispatchEvent(new CustomEvent('reviewsUpdated'));
                                                setReviewsRefreshKey((prev) => prev + 1);
                                              }}
                                              style={{
                                                padding: "6px 16px",
                                                borderRadius: "6px",
                                                fontSize: "12px",
                                                fontWeight: "500",
                                                backgroundColor: "#ef4444",
                                                color: "#fff",
                                                border: "none",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px",
                                              }}
                                            >
                                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                              </svg>
                                              Deny
                                            </button>
                                          </>
                                        )}
                                        {(review.status === 'approved' || review.status === 'declined') && (
                                          <button
                                            onClick={() => {
                                              // Handle edit - reset to pending
                                              const reviewData = review.review;
                                              reviewData.reviewStatus = 'pending';
                                              reviewData.reviewApproved = false;
                                              reviewData.reviewDeclined = false;
                                              
                                              // Update in source
                                              if (reviewData.sourceKey) {
                                                const sourceData = JSON.parse(localStorage.getItem(reviewData.sourceKey) || '[]');
                                                const updatedData = sourceData.map((item: any) => {
                                                  if (item.id === reviewData.bookingId || item.id === reviewData.id) {
                                                    return { ...item, ...reviewData };
                                                  }
                                                  return item;
                                                });
                                                localStorage.setItem(reviewData.sourceKey, JSON.stringify(updatedData));
                                              }
                                              
                                              window.dispatchEvent(new CustomEvent('reviewsUpdated'));
                                              setReviewsRefreshKey((prev) => prev + 1);
                                            }}
                                            style={{
                                              padding: "6px 16px",
                                              borderRadius: "6px",
                                              fontSize: "12px",
                                              fontWeight: "500",
                                              backgroundColor: "#666",
                                              color: "#fff",
                                              border: "none",
                                              cursor: "pointer",
                                            }}
                                          >
                                            Edit
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Listing Review Modal */}
      {listingReviewModalOpen && selectedListingId && (() => {
        // Find the listing from all listings (check both hostListings_ and listings_ keys)
        let selectedListing: any = null;
        let listingOwnerId: string | null = null;
        let storageKeyPrefix: string = '';
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('hostListings_') || key.startsWith('listings_'))) {
            try {
              const listings = JSON.parse(localStorage.getItem(key) || '[]');
              const found = listings.find((l: any) => l.id === selectedListingId);
              if (found) {
                selectedListing = found;
                // Extract user ID from key (works for both hostListings_ and listings_)
                if (key.startsWith('hostListings_')) {
                  listingOwnerId = key.replace('hostListings_', '');
                  storageKeyPrefix = 'hostListings_';
                } else {
                  listingOwnerId = key.replace('listings_', '');
                  storageKeyPrefix = 'listings_';
                }
                break;
              }
            } catch (e) {
              console.error('Error parsing listings:', e);
            }
          }
        }

        if (!selectedListing) {
          return null;
        }

        const handleApprove = () => {
          if (!listingOwnerId || !storageKeyPrefix) return;
          
          // Update listing status to 'listed'
          const listingsKey = `${storageKeyPrefix}${listingOwnerId}`;
          const savedListings = localStorage.getItem(listingsKey);
          if (savedListings) {
            try {
              const listings = JSON.parse(savedListings);
              const updatedListings = listings.map((l: any) =>
                l.id === selectedListingId ? { ...l, status: 'listed' } : l
              );
              localStorage.setItem(listingsKey, JSON.stringify(updatedListings));
              
              // Create user notification
              const userNotificationKey = `userNotifications_${listingOwnerId}`;
              const existingUserNotifications = localStorage.getItem(userNotificationKey);
              const userNotifications = existingUserNotifications ? JSON.parse(existingUserNotifications) : [];
              userNotifications.push({
                id: `listing_approved_${selectedListingId}_${Date.now()}`,
                type: 'listing_approved',
                listingId: selectedListingId,
                listingName: selectedListing.propertyName || selectedListing.name || 'Your listing',
                message: `Your listing "${selectedListing.propertyName || selectedListing.name || 'Untitled'}" has been approved and is now live!`,
                timestamp: new Date().toISOString(),
                read: false,
              });
              localStorage.setItem(userNotificationKey, JSON.stringify(userNotifications));
              
              // Close modal and reload
              setListingReviewModalOpen(false);
              setSelectedListingId(null);
              window.dispatchEvent(new CustomEvent('hostListingsUpdated'));
              window.dispatchEvent(new CustomEvent('listingUpdated'));
              window.dispatchEvent(new CustomEvent('adminNotificationsUpdated'));
              window.dispatchEvent(new CustomEvent('userNotificationsUpdated'));
            } catch (e) {
              console.error('Error approving listing:', e);
            }
          }
        };

        const handleDecline = () => {
          if (!listingOwnerId || !storageKeyPrefix) return;
          
          // Update listing status to 'declined'
          const listingsKey = `${storageKeyPrefix}${listingOwnerId}`;
          const savedListings = localStorage.getItem(listingsKey);
          if (savedListings) {
            try {
              const listings = JSON.parse(savedListings);
              const updatedListings = listings.map((l: any) =>
                l.id === selectedListingId ? { ...l, status: 'declined' } : l
              );
              localStorage.setItem(listingsKey, JSON.stringify(updatedListings));
              
              // Create user notification
              const userNotificationKey = `userNotifications_${listingOwnerId}`;
              const existingUserNotifications = localStorage.getItem(userNotificationKey);
              const userNotifications = existingUserNotifications ? JSON.parse(existingUserNotifications) : [];
              userNotifications.push({
                id: `listing_declined_${selectedListingId}_${Date.now()}`,
                type: 'listing_declined',
                listingId: selectedListingId,
                listingName: selectedListing.propertyName || selectedListing.name || 'Your listing',
                message: `Your listing "${selectedListing.propertyName || selectedListing.name || 'Untitled'}" has been declined. Please review and resubmit.`,
                timestamp: new Date().toISOString(),
                read: false,
              });
              localStorage.setItem(userNotificationKey, JSON.stringify(userNotifications));
              
              // Close modal and reload
              setListingReviewModalOpen(false);
              setSelectedListingId(null);
              window.dispatchEvent(new CustomEvent('hostListingsUpdated'));
              window.dispatchEvent(new CustomEvent('listingUpdated'));
              window.dispatchEvent(new CustomEvent('adminNotificationsUpdated'));
              window.dispatchEvent(new CustomEvent('userNotificationsUpdated'));
            } catch (e) {
              console.error('Error declining listing:', e);
            }
          }
        };

        const mainPhoto = selectedListing.photos?.find((p: any) => p.isMain) || selectedListing.photos?.[0];
        const locationString = selectedListing.location 
          ? `${selectedListing.location.streetAddress || ''}${selectedListing.location.city ? ', ' + selectedListing.location.city : ''}${selectedListing.location.state ? ', ' + selectedListing.location.state : ''}`
          : 'Location not specified';

        return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
            }}
            onClick={() => {
              setListingReviewModalOpen(false);
              setSelectedListingId(null);
            }}
          >
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '800px',
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => {
                  setListingReviewModalOpen(false);
                  setSelectedListingId(null);
                }}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ×
              </button>

              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#222',
                marginBottom: '24px'
              }}>
                Review Listing
              </h2>

              {/* Listing Image */}
              {mainPhoto && (
                <div style={{
                  width: '100%',
                  height: '300px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginBottom: '24px',
                  backgroundColor: '#f5f5f5'
                }}>
                  <img
                    src={mainPhoto.url}
                    alt={selectedListing.propertyName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}

              {/* Listing Details */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Property Name</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#222' }}>
                    {selectedListing.propertyName || 'Untitled'}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Location</div>
                  <div style={{ fontSize: '14px', color: '#222' }}>{locationString}</div>
                </div>

                {selectedListing.propertyDescription && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Description</div>
                    <div style={{ fontSize: '14px', color: '#222', lineHeight: '1.6' }}>
                      {selectedListing.propertyDescription}
                    </div>
                  </div>
                )}

                {selectedListing.pricing?.eventRate && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Price</div>
                    <div style={{ fontSize: '16px', fontWeight: '500', color: '#222' }}>
                      ₱{parseFloat(selectedListing.pricing.eventRate).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                paddingTop: '24px',
                borderTop: '1px solid #e6e6e6'
              }}>
                <button
                  onClick={() => {
                    setListingReviewModalOpen(false);
                    setSelectedListingId(null);
                  }}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#fff',
                    color: '#222',
                    border: '1px solid #e6e6e6',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDecline}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#fff',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#fee2e2';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                  }}
                >
                  Decline
                </button>
                <button
                  onClick={handleApprove}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#22c55e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#16a34a';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#22c55e';
                  }}
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
