'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const BurgerIcon = () => (
  <svg
    aria-hidden="true"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#222"
    strokeWidth="1.8"
    strokeLinecap="round"
  >
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </svg>
);

export default function HostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [languageClosing, setLanguageClosing] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('Philippines');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selectedCurrency');
      return stored || 'PHP ₱';
    }
    return 'PHP ₱';
  });
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'listings' | 'messages'>('today');
  
  // Function to close language modal with animation
  const closeLanguageModal = useCallback(() => {
    setLanguageClosing(true);
    setTimeout(() => {
      setLanguageOpen(false);
      setLanguageClosing(false);
    }, 300);
  }, []);
  
  // Region to Currency mapping
  const regionToCurrency: Record<string, string> = {
    'Philippines': 'PHP ₱',
    'United States': 'USD $',
    'United Kingdom': 'GBP £',
    'Canada': 'CAD $',
    'Australia': 'AUD $',
    'Japan': 'JPY ¥',
    'South Korea': 'KRW ₩',
  };
  
  // Set active tab from URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'listings' || tabParam === 'today' || tabParam === 'calendar' || tabParam === 'messages') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [priceOption, setPriceOption] = useState<'open' | 'block' | null>(null);
  const [selectedPricingType, setSelectedPricingType] = useState<'per head' | 'Whole Event' | null>(null);
  const [price, setPrice] = useState<number>(2800);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread'>('all');
  const [todayFilter, setTodayFilter] = useState<'today' | 'upcoming'>('today');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  // Sample reservations - in production, this would come from a database
  const [reservations, setReservations] = useState<string[]>([]);
  
  // Sample host messages - separate from regular messages
  const [hostMessages] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const burgerRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const calendarScrollRef = useRef<HTMLDivElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const priceSettingsRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const savedPhoto = localStorage.getItem(`profilePhoto_${currentUser.uid}`);
        if (savedPhoto) {
          setProfilePhoto(savedPhoto);
        } else if (currentUser.photoURL) {
          setProfilePhoto(currentUser.photoURL);
        } else {
          setProfilePhoto(null);
        }
        // Load listings for the current user
        const hostListingsKey = `hostListings_${currentUser.uid}`;
        const savedListings = localStorage.getItem(hostListingsKey);
        if (savedListings) {
          try {
            const listingsData = JSON.parse(savedListings);
            setListings(Array.isArray(listingsData) ? listingsData : []);
          } catch (error) {
            console.error('Error loading listings:', error);
            setListings([]);
          }
        } else {
          setListings([]);
        }
      } else {
        router.push('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Reload listings when switching to listings tab
  useEffect(() => {
    if (activeTab === 'listings' && user) {
      const hostListingsKey = `hostListings_${user.uid}`;
      const savedListings = localStorage.getItem(hostListingsKey);
      if (savedListings) {
        try {
          const listingsData = JSON.parse(savedListings);
          setListings(Array.isArray(listingsData) ? listingsData : []);
        } catch (error) {
          console.error('Error loading listings:', error);
          setListings([]);
        }
      } else {
        setListings([]);
      }
    }
  }, [activeTab, user]);

  // Redirect to dashboard if no listings remain (only when on listings tab or when page first loads)
  useEffect(() => {
    if (user && !loading && (activeTab === 'listings' || listings.length === 0)) {
      // Check both hostListings and listings keys
      const hostListingsKey = `hostListings_${user.uid}`;
      const listingsKey = `listings_${user.uid}`;
      const hostListings = localStorage.getItem(hostListingsKey);
      const regularListings = localStorage.getItem(listingsKey);
      
      let hasHostListings = false;
      let hasRegularListings = false;
      
      try {
        hasHostListings = hostListings && JSON.parse(hostListings).length > 0;
      } catch (e) {
        // Ignore parse errors
      }
      
      try {
        hasRegularListings = regularListings && JSON.parse(regularListings).length > 0;
      } catch (e) {
        // Ignore parse errors
      }
      
      if (!hasHostListings && !hasRegularListings) {
        // No listings at all, redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [listings, user, loading, router, activeTab]);

  // Initialize price from listing's eventRate when calendar tab is active or listings change
  useEffect(() => {
    if ((activeTab === 'calendar' || activeTab === 'today') && listings.length > 0 && user) {
      const firstListing = listings[0];
      if (firstListing?.pricing?.eventRate) {
        const eventRate = parseFloat(firstListing.pricing.eventRate);
        if (!isNaN(eventRate) && eventRate > 0) {
          setPrice(eventRate);
        }
      }
      if (firstListing?.pricing?.rateType) {
        setSelectedPricingType(firstListing.pricing.rateType === 'head' ? 'per head' : 'Whole Event');
      }
    }
  }, [listings, user, activeTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (burgerRef.current && !burgerRef.current.contains(event.target as Node)) {
        setBurgerOpen(false);
      }
      if (languageOpen && languageRef.current && !languageRef.current.contains(event.target as Node)) {
        closeLanguageModal();
      }
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setMonthDropdownOpen(false);
      }
      if (priceSettingsRef.current) {
        const target = event.target as HTMLElement;
        const modal = target.closest('[data-price-modal]');
        if (!priceSettingsRef.current.contains(target) && !modal) {
          setPriceModalOpen(false);
        }
      }
    };

    if (burgerOpen || monthDropdownOpen || priceModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [burgerOpen, monthDropdownOpen, priceModalOpen]);

  // Calendar functions
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = (month: number, year: number) => {
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const isWeekend = (day: number, month: number, year: number) => {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 5 || dayOfWeek === 6; // Friday (5) or Saturday (6)
  };

  const getDatePrice = (day: number, month: number, year: number) => {
    // Use the current price state, with a small weekend markup (5% increase)
    const basePrice = price || 2800;
    if (isWeekend(day, month, year)) {
      const weekendPrice = Math.round(basePrice * 1.05);
      return `₱${weekendPrice.toLocaleString()}`;
    }
    return `₱${basePrice.toLocaleString()}`;
  };

  const isPastDate = (day: number, month: number, year: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isBeyond12Months = (day: number, month: number, year: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    
    // Calculate 12 months from today
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 12);
    maxDate.setHours(0, 0, 0, 0);
    
    return date > maxDate;
  };

  const hasReservation = (day: number, month: number, year: number) => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return reservations.includes(dateString);
  };

  // Load reservations on mount (in production, fetch from database)
  useEffect(() => {
    // Sample reservations - replace with actual API call
    // For now, adding some sample dates
    const sampleReservations = [
      // Add sample reservation dates here if needed
      // Format: 'YYYY-MM-DD'
    ];
    setReservations(sampleReservations);
  }, []);

  const handleCalendarScroll = () => {
    if (calendarScrollRef.current) {
      setShowScrollToTop(calendarScrollRef.current.scrollTop > 100);
    }
  };

  const scrollToTop = () => {
    if (calendarScrollRef.current) {
      calendarScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDateClick = (day: number, month: number, year: number) => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    // Toggle selection - if date is already selected, remove it; otherwise add it
    setSelectedDates(prev => {
      if (prev.includes(dateString)) {
        return prev.filter(d => d !== dateString);
      } else {
        return [...prev, dateString];
      }
    });
  };

  const handleBlockToggle = () => {
    // Check if all selected dates are already blocked
    const allBlocked = selectedDates.every(date => blockedDates.includes(date));
    
    if (allBlocked) {
      // Unblock all selected dates
      setBlockedDates(prev => prev.filter(date => !selectedDates.includes(date)));
    } else {
      // Block all selected dates
      setBlockedDates(prev => {
        const newBlocked = [...prev];
        selectedDates.forEach(date => {
          if (!newBlocked.includes(date)) {
            newBlocked.push(date);
          }
        });
        return newBlocked;
      });
    }
    // Clear selection after blocking/unblocking
    setSelectedDates([]);
  };

  const handleMonthChange = (month: number, year: number) => {
    setCalendarMonth(month);
    setCalendarYear(year);
    setMonthDropdownOpen(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* Header */}
      <header
        className="header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 80px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Left: Logo - match dashboard */}
        <div className="left-section" style={{ flex: '0 0 auto' }}>
          <button
            className="logo-mark"
            type="button"
            aria-label="Venu home"
             onClick={() => router.push('/host')}
          >
            <img src="/venu-logo.png" alt="Venu Logo" className="logo-icon" />
          </button>
        </div>

        {/* Center: Navigation Tabs */}
        <div
          className="middle-section"
          style={{
            display: 'flex',
            flex: 1,
            justifyContent: 'center',
            gap: '32px',
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <button
            onClick={() => setActiveTab('today')}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'today' ? '2px solid #222' : '2px solid transparent',
              cursor: 'pointer',
              padding: '8px 0',
              fontSize: '14px',
              fontWeight: activeTab === 'today' ? '600' : '400',
              color: '#222',
              transition: 'all 0.2s'
            }}
          >
            Today
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'calendar' ? '2px solid #222' : '2px solid transparent',
              cursor: 'pointer',
              padding: '8px 0',
              fontSize: '14px',
              fontWeight: activeTab === 'calendar' ? '600' : '400',
              color: '#222',
              transition: 'all 0.2s'
            }}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'listings' ? '2px solid #222' : '2px solid transparent',
              cursor: 'pointer',
              padding: '8px 0',
              fontSize: '14px',
              fontWeight: activeTab === 'listings' ? '600' : '400',
              color: '#222',
              transition: 'all 0.2s'
            }}
          >
            Listings
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'messages' ? '2px solid #222' : '2px solid transparent',
              cursor: 'pointer',
              padding: '8px 0',
              fontSize: '14px',
              fontWeight: activeTab === 'messages' ? '600' : '400',
              color: '#222',
              transition: 'all 0.2s'
            }}
          >
            Messages
          </button>
        </div>

        {/* Right: Switch to traveling, Avatar, Menu */}
        <div
          className="right-section"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#222',
              fontWeight: '400',
              padding: '8px 12px',
              borderRadius: '22px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Switch to traveling
          </button>
          
          <div
            ref={burgerRef}
            style={{ position: 'relative' }}
          >
            <button
              onClick={() => setBurgerOpen(!burgerOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#e6e6e6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </button>

            {burgerOpen && (
              <div style={{
                position: 'absolute',
                top: '50px',
                right: '-80px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                minWidth: '240px',
                padding: '8px 0',
                zIndex: 1000
              }}>
                <div className="popup-menu">
                  <button 
                    className="menu-item" 
                    type="button"
                    onClick={() => {
                      setLanguageOpen(true);
                      setBurgerOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#222'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <svg
                      aria-hidden="true"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M3 12h18" />
                      <path d="M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9z" />
                    </svg>
                    Language and currency
                  </button>
                  <button 
                    className="menu-item" 
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#222'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Get help
                  </button>
                  <div style={{
                    height: '1px',
                    background: '#e6e6e6',
                    margin: '8px 0'
                  }} />
                  <button
                    className="menu-item"
                    type="button"
                    onClick={async () => {
                      const { signOut } = await import('firebase/auth');
                      await signOut(auth);
                      router.push('/');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#222'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setBurgerOpen(!burgerOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <BurgerIcon />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        padding: activeTab === 'listings' ? '40px 80px' : '40px 80px',
        maxWidth: activeTab === 'listings' ? '100%' : '1200px',
        margin: activeTab === 'listings' ? '0' : '0 auto',
        width: activeTab === 'listings' ? '100%' : 'auto'
      }}>

        {/* Today Tab Content */}
        {activeTab === 'today' ? (
          <div>
            {/* Today/Upcoming Toggle */}
        <div style={{
          display: 'flex',
              gap: '8px',
              marginBottom: '40px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setTodayFilter('today')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  backgroundColor: todayFilter === 'today' ? '#1976d2' : '#f6f7f8',
                  color: todayFilter === 'today' ? 'white' : '#222',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (todayFilter !== 'today') {
                    e.currentTarget.style.backgroundColor = '#e6e6e6';
                  }
                }}
                onMouseOut={(e) => {
                  if (todayFilter !== 'today') {
                    e.currentTarget.style.backgroundColor = '#f6f7f8';
                  }
                }}
              >
                Today
              </button>
              <button
                onClick={() => setTodayFilter('upcoming')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  backgroundColor: todayFilter === 'upcoming' ? '#1976d2' : '#f6f7f8',
                  color: todayFilter === 'upcoming' ? 'white' : '#222',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (todayFilter !== 'upcoming') {
                    e.currentTarget.style.backgroundColor = '#e6e6e6';
                  }
                }}
                onMouseOut={(e) => {
                  if (todayFilter !== 'upcoming') {
                    e.currentTarget.style.backgroundColor = '#f6f7f8';
                  }
                }}
              >
                Upcoming
              </button>
            </div>

            {/* Empty State */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
          justifyContent: 'center',
              padding: '80px 20px',
              textAlign: 'center'
            }}>
              {/* Message */}
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#222',
                marginBottom: '24px',
                lineHeight: '1.2'
              }}>
                {todayFilter === 'upcoming' ? (
                  <>You don't have<br />any upcoming reservations</>
                ) : (
                  <>You don't have<br />any reservations</>
                )}
              </h2>

              {/* Link */}
              <button
                onClick={() => router.push('/reservations')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#222',
                  textDecoration: 'underline',
                  padding: '8px',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                See all reservations
              </button>
            </div>
          </div>
        ) : activeTab === 'calendar' ? (
          <div style={{
            display: 'flex',
            gap: '32px',
            maxWidth: '1400px',
        margin: '0 auto'
      }}>
            {/* Main Calendar Section */}
            <div style={{ flex: 1 }}>
              {/* Top Controls */}
        <div style={{
          display: 'flex',
                justifyContent: 'space-between',
          alignItems: 'center',
                marginBottom: '24px'
              }}>
                {/* Month Dropdown */}
                <div ref={monthDropdownRef} style={{ position: 'relative' }}>
            <button
                    onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
              style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                padding: '8px 16px',
                      border: '1px solid #e6e6e6',
                      borderRadius: '8px',
                      background: '#fff',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#222',
                      fontWeight: '500'
                    }}
                  >
                    {monthNames[calendarMonth]}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {monthDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '8px',
                      backgroundColor: '#fff',
                      border: '1px solid #e6e6e6',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                      zIndex: 1000,
                      minWidth: '200px',
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}>
                      {Array.from({ length: 12 }, (_, i) => {
                        return (
                          <button
                            key={i}
                            onClick={() => handleMonthChange(i, calendarYear)}
                            style={{
                              display: 'block',
                              width: '100%',
                              padding: '12px 16px',
                              textAlign: 'left',
                              background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                              color: calendarMonth === i ? '#1976d2' : '#222',
                              fontWeight: calendarMonth === i ? '600' : '400'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            {monthNames[i]} {calendarYear}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* Calendar Grid */}
              <div style={{
                border: '1px solid #e6e6e6',
                borderRadius: '12px',
                padding: '24px',
                backgroundColor: '#fff',
                position: 'relative'
              }}>
                {/* Month Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px',
                  position: 'relative'
                }}>
                  <div style={{ width: '96px' }}></div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#222',
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}>
                    {monthNames[calendarMonth]} {calendarYear}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <button
                      onClick={() => {
                        if (calendarMonth === 0) {
                          setCalendarMonth(11);
                          setCalendarYear(calendarYear - 1);
                        } else {
                          setCalendarMonth(calendarMonth - 1);
                        }
                      }}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#f6f7f8',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
          justifyContent: 'center',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s',
                        flexShrink: 0
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#e6e6e6';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = '#f6f7f8';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
            </button>
            <button
                      onClick={() => {
                        if (calendarMonth === 11) {
                          setCalendarMonth(0);
                          setCalendarYear(calendarYear + 1);
                        } else {
                          setCalendarMonth(calendarMonth + 1);
                        }
                      }}
              style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#fff',
                border: 'none',
                cursor: 'pointer',
                        display: 'flex',
          alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                        transition: 'all 0.2s',
                        flexShrink: 0
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.2)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)';
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
            </button>
          </div>
        </div>

                {/* Weekday Headers */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  {dayNames.map((day, index) => (
                    <div
                      key={index}
                      style={{
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#666',
                        padding: '8px'
                      }}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days - Scrollable */}
                <div
                  ref={calendarScrollRef}
                  onScroll={handleCalendarScroll}
                  style={{
                    maxHeight: '600px',
                    overflowY: 'auto',
                    paddingRight: '8px',
                    position: 'relative'
                  }}
                >
          <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '8px'
                  }}>
                    {renderCalendar(calendarMonth, calendarYear).map((day, index) => {
                      if (day === null) {
                        return <div key={index} style={{ aspectRatio: '1', minHeight: '100px' }} />;
                      }

                      const isPast = isPastDate(day, calendarMonth, calendarYear);
                      const isFutureLimit = isBeyond12Months(day, calendarMonth, calendarYear);
                      const hasReservationOnDate = hasReservation(day, calendarMonth, calendarYear);
                      const dateString = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isSelected = selectedDates.includes(dateString);
                      const isBlocked = blockedDates.includes(dateString);
                      const price = getDatePrice(day, calendarMonth, calendarYear);
                      const isDisabled = isPast || isFutureLimit;

                      // Determine background color - make blocked dates darker to distinguish from past dates
                      let backgroundColor = '#fff';
                      let borderColor = '#e6e6e6';
                      if (isBlocked) {
                        backgroundColor = '#e0e0e0'; // Darker gray for blocked dates
                        borderColor = '#b0b0b0'; // Darker border for blocked dates
                      } else if (isSelected) {
                        backgroundColor = '#1976d2'; // Blue for selected dates
                        borderColor = '#1976d2';
                      } else if (hasReservationOnDate) {
                        backgroundColor = '#1976d2'; // Blue for reservations
                        borderColor = '#1976d2';
                      } else if (isPast || isFutureLimit) {
                        backgroundColor = '#f6f7f8'; // Light gray for past dates and future limit
                        borderColor = '#e6e6e6';
                      }

                      // Determine text colors - blocked dates darker, past dates lighter
                      const dateTextColor = isBlocked ? '#666' : (isSelected ? '#fff' : ((isPast || isFutureLimit) ? '#bbb' : (hasReservationOnDate ? '#fff' : '#222')));
                      const priceTextColor = isBlocked ? '#888' : (isSelected ? '#fff' : ((isPast || isFutureLimit) ? '#ccc' : (hasReservationOnDate ? '#fff' : '#666')));

                      return (
                        <button
                          key={index}
                          onClick={() => !isDisabled && handleDateClick(day, calendarMonth, calendarYear)}
                          disabled={isDisabled}
                          style={{
                            aspectRatio: '1',
                            minHeight: '100px',
                            border: `1px solid ${borderColor}`,
                            borderRadius: '12px',
                            background: backgroundColor,
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '12px 8px',
                            transition: 'all 0.2s',
                            position: 'relative',
                            opacity: isDisabled ? 0.4 : (isBlocked ? 0.8 : 1)
                          }}
                          onMouseOver={(e) => {
                            if (!isSelected && !isDisabled && !hasReservationOnDate) {
                              if (isBlocked) {
                                e.currentTarget.style.borderColor = '#222';
                                e.currentTarget.style.backgroundColor = '#f0f0f0';
                              } else {
                                e.currentTarget.style.borderColor = '#222';
                                e.currentTarget.style.backgroundColor = '#f6f7f8';
                              }
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!isSelected && !isDisabled && !hasReservationOnDate) {
                              if (isBlocked) {
                                e.currentTarget.style.borderColor = borderColor;
                                e.currentTarget.style.backgroundColor = backgroundColor;
                              } else {
                                e.currentTarget.style.borderColor = '#e6e6e6';
                                e.currentTarget.style.backgroundColor = '#fff';
                              }
                            }
                          }}
                        >
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: dateTextColor,
                            marginBottom: '8px'
                          }}>
                            {day}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: priceTextColor
                          }}>
                            {price}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Scroll to Top Button */}
                {showScrollToTop && (
                  <button
                    onClick={scrollToTop}
                    style={{
                      position: 'absolute',
                      bottom: '24px',
                      right: '24px',
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      border: '1px solid #e6e6e6',
                      background: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      zIndex: 10
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                )}
              </div>

            </div>

            {/* Right Sidebar - Settings */}
            <div style={{ width: '320px', flexShrink: 0, position: 'sticky', top: '100px', height: 'fit-content', alignSelf: 'flex-start' }}>
              {/* Price Settings */}
              <div
                ref={priceSettingsRef}
                style={{
                  border: '1px solid #e6e6e6',
                  borderRadius: '12px',
                  padding: '24px',
                  marginTop: '72px',
                  marginBottom: '16px',
                  backgroundColor: priceModalOpen ? '#fff' : '#fff',
                  transition: 'all 0.2s'
                }}
              >
                {!priceModalOpen ? (
                  <button
                    onClick={() => {
                      setPriceModalOpen(true);
                      // Set the price option based on current selection
                      if (selectedPricingType === 'per head') {
                        setPriceOption('open');
                      } else if (selectedPricingType === 'Whole Event') {
                        setPriceOption('block');
                      }
                    }}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: 0
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '20px'
                    }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#222',
                        margin: 0
                      }}>
                        Price settings
                      </h3>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                    <div style={{ fontSize: '14px', color: '#222', lineHeight: '1.8' }}>
                      <div>
                        {selectedPricingType 
                          ? (selectedPricingType === 'per head' 
                              ? `₱${price.toLocaleString()} per head` 
                              : `₱${price.toLocaleString()} whole event`) 
                          : `₱${price.toLocaleString()} per head`}
                      </div>
                    </div>
                  </button>
                ) : (
                  <div>
                    {/* Title */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '24px'
                    }}>
                      <h2 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#222',
                        margin: 0
                      }}>
                        Pricing Option
                      </h2>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#ff6b35'
                      }} />
                    </div>

                    {/* Price Display Card */}
                    <div style={{
                      border: '1px solid #e6e6e6',
                      borderRadius: '12px',
                      padding: '16px',
                      backgroundColor: '#fff',
                      marginBottom: '24px'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        color: '#666',
                        fontWeight: '400',
                        marginBottom: '4px'
                      }}>
                        {priceOption === 'open' ? 'Per head' : priceOption === 'block' ? 'Whole Event' : ''}
                      </div>
                      {isEditingPrice ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '32px', fontWeight: '700', color: '#222' }}>₱</span>
                          <input
                            type="number"
                            value={price}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              setPrice(value);
                            }}
                            onBlur={() => setIsEditingPrice(false)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setIsEditingPrice(false);
                              }
                            }}
                            autoFocus
                            style={{
                              fontSize: '32px',
                              fontWeight: '700',
                              color: '#222',
                              border: 'none',
                              outline: 'none',
                              width: '120px',
                              padding: 0,
                              lineHeight: '1.2'
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          onClick={() => setIsEditingPrice(true)}
                          style={{
                            fontSize: '32px',
                            fontWeight: '700',
                            color: '#222',
                            lineHeight: '1.2',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        >
                          ₱{price.toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Radio Options */}
                    <div style={{ marginBottom: '32px' }}>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '16px',
                          borderRadius: '12px',
            backgroundColor: '#f6f7f8',
                          marginBottom: '12px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e6e6e6'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                        onClick={() => setPriceOption('open')}
                      >
                        <span style={{ fontSize: '14px', color: '#222' }}>per head</span>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: '2px solid #666',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: priceOption === 'open' ? '#222' : 'transparent'
                        }}>
                          {priceOption === 'open' && (
                            <div style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: '#fff'
                            }} />
                          )}
                        </div>
                      </label>

                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '16px',
                          borderRadius: '12px',
                          backgroundColor: '#f6f7f8',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e6e6e6'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                        onClick={() => setPriceOption('block')}
                      >
                        <span style={{ fontSize: '14px', color: '#222' }}>Whole Event</span>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: '2px solid #666',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: priceOption === 'block' ? '#222' : 'transparent'
                        }}>
                          {priceOption === 'block' && (
                            <div style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: '#fff'
                            }} />
                          )}
                        </div>
                      </label>
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      justifyContent: 'flex-end'
          }}>
            <button
                        onClick={() => {
                          setPriceModalOpen(false);
                          setPriceOption(null);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#666',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          padding: '8px 16px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#222'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          // Handle save logic here
                          if (priceOption === 'open') {
                            setSelectedPricingType('per head');
                          } else if (priceOption === 'block') {
                            setSelectedPricingType('Whole Event');
                          }
                          
                          // Update all listings with the new price
                          if (user && listings.length > 0) {
                            const hostListingsKey = `hostListings_${user.uid}`;
                            const updatedListings = listings.map((listing: any) => ({
                              ...listing,
                              pricing: {
                                ...listing.pricing,
                                eventRate: price.toString(),
                                rateType: priceOption === 'open' ? 'head' : 'whole'
                              }
                            }));
                            localStorage.setItem(hostListingsKey, JSON.stringify(updatedListings));
                            setListings(updatedListings);
                          }
                          
                          setPriceModalOpen(false);
                          setPriceOption(null);
                        }}
                        style={{
                          background: '#222',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          padding: '8px 24px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#222'}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Block/Unblock Toggle - appears when dates are selected */}
              {selectedDates.length > 0 && (
                <div style={{
                  border: '1px solid #e6e6e6',
                  borderRadius: '12px',
                  padding: '16px',
                  backgroundColor: '#fff',
                  marginTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
          <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#222'
                  }}>
                    {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      Block dates
                    </span>
                    <button
                      onClick={handleBlockToggle}
                      style={{
                        position: 'relative',
                        width: '44px',
                        height: '24px',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        backgroundColor: selectedDates.every(date => blockedDates.includes(date)) ? '#1976d2' : '#ccc',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                      onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#fff',
                        transform: selectedDates.every(date => blockedDates.includes(date)) ? 'translateX(20px)' : 'translateX(0px)',
                        transition: 'transform 0.2s',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                      }} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
         ) : activeTab === 'listings' ? (
           /* Listings Tab Content */
           <div style={{ width: '100%', maxWidth: '100%', padding: '0 80px' }}>
             {/* Header */}
             <div style={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               marginBottom: '32px'
             }}>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '600',
                color: '#222',
                margin: 0
              }}>
                Your listing
              </h1>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                {/* List/Grid Toggle Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
              style={{
                padding: '8px 16px',
                      border: viewMode === 'list' ? '2px solid #1976d2' : '1px solid #e6e6e6',
                      borderRadius: '8px',
                      backgroundColor: viewMode === 'list' ? '#1976d2' : 'transparent',
                      color: viewMode === 'list' ? '#fff' : '#222',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    List
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    style={{
                      padding: '8px 16px',
                      border: viewMode === 'grid' ? '2px solid #1976d2' : '1px solid #e6e6e6',
                      borderRadius: '8px',
                      backgroundColor: viewMode === 'grid' ? '#1976d2' : 'transparent',
                      color: viewMode === 'grid' ? '#fff' : '#222',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Grid
                  </button>
                </div>
                {/* Plus Icon Button with Text */}
                <button
                  onClick={() => router.push('/list-your-place?from=host')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    background: '#e6e6e6',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#d0d0d0';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#e6e6e6';
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#222'
                  }}>
                    Add more listings
                  </span>
                </button>
              </div>
            </div>

            {/* Listings Grid or List */}
             {listings.length > 0 ? (
               viewMode === 'grid' ? (
                 <div style={{
                   display: 'grid',
                   gridTemplateColumns: 'repeat(3, 1fr)',
                   gap: '24px',
                   padding: '0 80px',
                   marginLeft: '-80px',
                   marginRight: '-80px',
                   width: 'calc(100% + 160px)'
                 }}>
                  {listings.map((listing) => {
                    const mainPhoto = listing.photos?.find((p: any) => p.isMain) || listing.photos?.[0];
                    const locationString = listing.location 
                      ? `${listing.location.city || ''}${listing.location.city && listing.location.state ? ', ' : ''}${listing.location.state || ''}`
                      : 'Location not specified';

                  return (
                    <div
                      key={listing.id}
                      onClick={() => router.push(`/host/listing/${listing.id}`)}
                      style={{
                        border: '1px solid #e6e6e6',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Image with Listed Badge */}
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '4/3',
            backgroundColor: '#f6f7f8',
                        overflow: 'hidden'
                      }}>
                        {mainPhoto?.url ? (
                          <img
                            src={mainPhoto.url}
                            alt={listing.propertyName || 'Listing'}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              e.currentTarget.style.display = 'none';
                              const placeholder = e.currentTarget.parentElement?.querySelector('.placeholder') as HTMLElement;
                              if (placeholder) placeholder.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="placeholder"
                          style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: mainPhoto?.url ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '18px',
                            fontWeight: '500'
                          }}
                        >
                          No Image
                        </div>
                        {/* Status Badge */}
                        {(() => {
                          // Check if listing is unlisted (including date-based unlisting)
                          let isUnlisted = false;
                          if (listing.status === 'unlisted' && listing.unlistFromDate && listing.unlistUntilDate) {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const fromDate = new Date(listing.unlistFromDate);
                            fromDate.setHours(0, 0, 0, 0);
                            const untilDate = new Date(listing.unlistUntilDate);
                            untilDate.setHours(0, 0, 0, 0);
                            // Check if we're within the unlist date range
                            isUnlisted = today >= fromDate && today <= untilDate;
                          } else if (listing.status === 'unlisted') {
                            isUnlisted = true;
                          }
                          
                          const badgeColor = isUnlisted ? '#ef4444' : '#22c55e';
                          const badgeText = isUnlisted ? 'Unlisted' : 'Listed';
                          
                          return (
                            <div style={{
                              position: 'absolute',
                              top: '12px',
                              left: '12px',
                              backgroundColor: badgeColor,
                              borderRadius: '20px',
                              padding: '4px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: '#fff'
                              }} />
                              <span style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#fff'
                              }}>
                                {badgeText}
                              </span>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Listing Info */}
                      <div style={{
                        padding: '20px'
                      }}>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#222',
                          margin: '0 0 8px 0',
                          lineHeight: '1.3'
                        }}>
                          {listing.propertyName || 'Untitled Listing'}
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          color: '#666',
                          margin: 0
                        }}>
                          {locationString}
                        </p>
                      </div>
                    </div>
                  );
                  })}
                </div>
              ) : (
                /* List View */
                <div style={{
                  border: '1px solid #e6e6e6',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: '#fff'
                }}>
                  {/* Table Header */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1.5fr 1fr',
                    padding: '16px 24px',
                    borderBottom: '1px solid #e6e6e6',
                    backgroundColor: '#f6f7f8',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#222'
                  }}>
                    <div>Listing</div>
                    <div>Occasion</div>
                    <div>Location</div>
                    <div>Status</div>
                  </div>
                  {/* Table Rows */}
                  {listings.map((listing) => {
                    const mainPhoto = listing.photos?.find((p: any) => p.isMain) || listing.photos?.[0];
                    const locationString = listing.location 
                      ? `${listing.location.city || ''}${listing.location.city && listing.location.state ? ', ' : ''}${listing.location.state || ''}`
                      : 'Location not specified';
                    const listingType = listing.propertyType || 'Home';
                    
                    return (
                      <div
                        key={listing.id}
                        onClick={() => router.push(`/host/listing/${listing.id}`)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1.5fr 1fr',
                          padding: '16px 24px',
                          borderBottom: '1px solid #e6e6e6',
                          alignItems: 'center',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        {/* Listing Column */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <div style={{
                            width: '80px',
                            height: '60px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            flexShrink: 0,
                            backgroundColor: '#f6f7f8'
                          }}>
                            {mainPhoto?.url ? (
                              <img
                                src={mainPhoto.url}
                                alt={listing.propertyName || 'Listing'}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const placeholder = e.currentTarget.parentElement?.querySelector('.placeholder') as HTMLElement;
                                  if (placeholder) placeholder.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className="placeholder"
                              style={{
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: mainPhoto?.url ? 'none' : 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}
                            >
                              No Image
                            </div>
                          </div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#222',
                            lineHeight: '1.4'
                          }}>
                            {listing.propertyName || 'Untitled Listing'}
                          </div>
                        </div>
                        {/* Type Column */}
                        <div style={{
                          fontSize: '14px',
                          color: '#222'
                        }}>
                          {listingType}
                        </div>
                        {/* Location Column */}
                        <div style={{
                          fontSize: '14px',
                          color: '#222'
                        }}>
                          {locationString}
                        </div>
                        {/* Status Column */}
                        {(() => {
                          // Check if listing is unlisted (including date-based unlisting)
                          let isUnlisted = false;
                          if (listing.status === 'unlisted' && listing.unlistFromDate && listing.unlistUntilDate) {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const fromDate = new Date(listing.unlistFromDate);
                            fromDate.setHours(0, 0, 0, 0);
                            const untilDate = new Date(listing.unlistUntilDate);
                            untilDate.setHours(0, 0, 0, 0);
                            // Check if we're within the unlist date range
                            isUnlisted = today >= fromDate && today <= untilDate;
                          } else if (listing.status === 'unlisted') {
                            isUnlisted = true;
                          }
                          
                          const circleColor = isUnlisted ? '#ef4444' : '#22c55e';
                          const statusText = isUnlisted ? 'Unlisted' : 'Listed';
                          
                          return (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: circleColor
                              }} />
                              <span style={{
                                fontSize: '14px',
                                color: '#222'
                              }}>
                                {statusText}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px 20px',
                textAlign: 'center'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#222',
                  marginBottom: '16px'
                }}>
                  No listings yet
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: '#666',
                  marginBottom: '24px'
                }}>
                  Create your first listing to get started
                </p>
                <button
                  onClick={() => router.push('/list-your-place')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#222',
                    color: '#fff',
                border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#222'}
                >
                  Create Listing
                </button>
              </div>
            )}
          </div>
        ) : activeTab === 'messages' ? (
          /* Messages Tab Content */
          <div style={{ 
            position: 'fixed',
            top: '100px',
            left: '80px',
            right: 0,
            bottom: 0,
            display: 'flex', 
            overflow: 'hidden', 
            width: 'calc(100% - 80px)',
            backgroundColor: 'white'
          }}>
            {/* Left Panel - Messages List */}
            <div style={{
              width: '400px',
              minWidth: '400px',
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
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                      </svg>
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
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
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
                  onClick={() => setMessageFilter('all')}
              style={{
                    background: messageFilter === 'all' ? '#222' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: messageFilter === 'all' ? 'white' : '#222',
                borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  All
                  {messageFilter === 'all' && (
                    <span style={{ fontSize: '10px' }}>▼</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setMessageFilter('unread')}
                  style={{
                    background: messageFilter === 'unread' ? '#222' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                    padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                    color: messageFilter === 'unread' ? 'white' : '#222',
                    borderRadius: '20px',
              }}
            >
                  Unread
            </button>
          </div>

              {/* Conversations List */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
              }}>
                {hostMessages.length > 0 ? (
                  hostMessages
                    .filter(msg => messageFilter === 'all' || msg.unread)
                    .map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      style={{
                        padding: '16px 24px',
                        borderBottom: '1px solid #e6e6e6',
                        cursor: 'pointer',
                        backgroundColor: selectedConversation === conversation.id ? '#f6f7f8' : 'white',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => {
                        if (selectedConversation !== conversation.id) {
                          e.currentTarget.style.backgroundColor = '#fafafa';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedConversation !== conversation.id) {
                          e.currentTarget.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start'
                      }}>
                        {/* Profile Picture */}
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: '#222',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '18px',
                          fontWeight: '600',
                          flexShrink: 0
                        }}>
                          {conversation.initial}
                        </div>
                        {/* Conversation Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '4px'
                          }}>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#222',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {conversation.name}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: '#666',
                              flexShrink: 0,
                              marginLeft: '8px'
                            }}>
                              {conversation.date}
                            </div>
                          </div>
                          <div style={{
                            fontSize: '13px',
                            color: '#666',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginBottom: '4px'
                          }}>
                            {conversation.lastMessage}
                          </div>
                          {conversation.bookingDates && (
                            <div style={{
                              fontSize: '12px',
                              color: '#999'
                            }}>
                              {conversation.bookingDates}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
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
                      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
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
                )}
          </div>
        </div>

            {/* Right Panel - Chat View */}
        <div style={{
              flex: 1,
              backgroundColor: 'white',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {selectedConversation ? (() => {
                const conversation = hostMessages.find(c => c.id === selectedConversation);
                if (!conversation) return null;
                
                return (
                  <>
                    {/* Chat Header */}
                    <div style={{
                      padding: '16px 24px',
                      borderBottom: '1px solid #e6e6e6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#222',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '16px',
                          fontWeight: '600'
                        }}>
                          {conversation.initial}
                        </div>
                        <div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#222'
                          }}>
                            {conversation.name}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#666',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            Translation on
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="9" />
                              <path d="M3 12h18" />
                              <path d="M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9z" />
                            </svg>
                          </div>
                        </div>
                      </div>
            <button
              style={{
                padding: '8px 16px',
                          border: '1px solid #e6e6e6',
                          borderRadius: '8px',
                          backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                          color: '#222'
              }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
                        Show reservation
            </button>
          </div>

                    {/* Messages Area */}
                    <div style={{
                      flex: 1,
                      overflowY: 'auto',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}>
                      {conversation.messages?.map((message, index) => (
                        <div key={index}>
                          {message.type === 'system' ? (
                            <div style={{
                              textAlign: 'center',
                              fontSize: '13px',
                              color: '#666',
                              margin: '16px 0'
                            }}>
                              {message.text}
                            </div>
                          ) : message.type === 'incoming' ? (
                            <div style={{
                              display: 'flex',
                              gap: '8px',
                              maxWidth: '70%'
                            }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: '#222',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '600',
                                flexShrink: 0
                              }}>
                                {conversation.initial}
                              </div>
                              <div>
                                <div style={{
                                  backgroundColor: '#f6f7f8',
                                  borderRadius: '18px',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  color: '#222',
                                  lineHeight: '1.5'
                                }}>
                                  {message.text}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-end',
                              maxWidth: '70%',
                              marginLeft: 'auto'
                            }}>
                              {message.time && (
                                <div style={{
                                  fontSize: '11px',
                                  color: '#999',
                                  marginBottom: '4px'
                                }}>
                                  {message.time}
                                </div>
                              )}
                              <div style={{
                                backgroundColor: '#222',
                                borderRadius: '18px',
                                padding: '12px 16px',
                                fontSize: '14px',
                                color: 'white',
                                lineHeight: '1.5'
                              }}>
                                {message.text}
                              </div>
                              {message.read && (
                                <div style={{
                                  fontSize: '11px',
                                  color: '#999',
                                  marginTop: '4px'
                                }}>
                                  Read by {message.readBy}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
        </div>

                    {/* Message Input */}
                    <div style={{
                      padding: '16px 24px',
                      borderTop: '1px solid #e6e6e6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <button
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          border: '1px solid #e6e6e6',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                      <input
                        type="text"
                        placeholder="Write a message..."
                        style={{
                          flex: 1,
                          border: '1px solid #e6e6e6',
                          borderRadius: '24px',
                          padding: '10px 16px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#222'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#e6e6e6'}
                      />
                      <button
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: '#222',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#222'}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          <line x1="9" y1="10" x2="15" y2="10" />
                        </svg>
                      </button>
                    </div>
                  </>
                );
              })() : (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999'
                }}>
                  Select a conversation to view messages
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty State for other tabs */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px',
          textAlign: 'center'
        }}>
          {/* Message */}
          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#222',
            marginBottom: '24px',
            lineHeight: '1.2'
          }}>
            You don't have any reservations
          </h2>

          {/* Link */}
          <button
            onClick={() => router.push('/events')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#222',
              textDecoration: 'underline',
              padding: '8px',
              transition: 'opacity 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            See all reservations
          </button>
        </div>
        )}

      </main>

      {/* Language & Currency Modal */}
      {languageOpen && (
        <div
          className="modal-overlay"
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
            animation: languageClosing ? 'fadeOut 0.3s ease-out' : 'fadeIn 0.2s ease-out',
          }}
          onClick={closeLanguageModal}
        >
          <div
            ref={languageRef}
            className="modal-content"
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              position: 'relative',
              animation: languageClosing ? 'slideDown 0.3s ease-out' : 'slideUp 0.3s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={closeLanguageModal}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#1976d2',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Title */}
            <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#222', marginBottom: '24px', paddingRight: '40px' }}>
              Display settings
            </h2>

            {/* Region Dropdown */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>
                Region
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedRegion}
                  onChange={(e) => {
                    const newRegion = e.target.value;
                    setSelectedRegion(newRegion);
                    // Automatically update currency based on region
                    if (regionToCurrency[newRegion]) {
                      setSelectedCurrency(regionToCurrency[newRegion]);
                      localStorage.setItem('selectedCurrency', regionToCurrency[newRegion]);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e6e6e6',
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#222',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23222' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 16px center',
                    paddingRight: '40px',
                  }}
                >
                  <option value="Philippines">Philippines</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Japan">Japan</option>
                  <option value="South Korea">South Korea</option>
                </select>
              </div>
            </div>

            {/* Currency Display (Read-only) */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>
                Currency
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={selectedCurrency}
                  readOnly
                  disabled
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e6e6e6',
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#666',
                    backgroundColor: '#f5f5f5',
                    cursor: 'not-allowed',
                  }}
                />
              </div>
            </div>

            {/* Language Dropdown */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>
                Language
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e6e6e6',
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#222',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23222' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 16px center',
                    paddingRight: '40px',
                  }}
                >
                  <option value="English">English</option>
                  <option value="Filipino">Filipino</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Korean">Korean</option>
                </select>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={() => {
                // Save currency to localStorage
                localStorage.setItem('selectedCurrency', selectedCurrency);
                closeLanguageModal();
              }}
              style={{
                width: '100%',
                padding: '14px 24px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

