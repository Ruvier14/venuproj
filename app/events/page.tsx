'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth as firebaseAuth } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, } from 'firebase/auth';
import { onAuthStateChanged, User } from 'firebase/auth';

const LanguageIcon = () => (
  <svg
    aria-hidden="true"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#222"
    strokeWidth="1.5"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9z" />
  </svg>
);

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

export default function Events() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [languageClosing, setLanguageClosing] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('Philippines');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedCurrency, setSelectedCurrency] = useState('PHP ₱');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [pastEventsFilter, setPastEventsFilter] = useState<'completed' | 'cancelled'>('completed');
  const [bookingConfirmationOpen, setBookingConfirmationOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [completedBookings, setCompletedBookings] = useState<any[]>([]);
  const [cancelledBookings, setCancelledBookings] = useState<any[]>([]);
  const [hasListings, setHasListings] = useState(false);

  const burgerRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);

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

  // Function to close language modal with animation
  const closeLanguageModal = useCallback(() => {
    setLanguageClosing(true);
    setTimeout(() => {
      setLanguageOpen(false);
      setLanguageClosing(false);
    }, 300); // Match animation duration
  }, []);

  // Function to handle Google sign-in
 const handleGoogleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
};

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
        
        // Load bookings from localStorage
        const savedBookings = localStorage.getItem(`upcomingBookings_${currentUser.uid}`);
        const savedCompleted = localStorage.getItem(`completedBookings_${currentUser.uid}`);
        const savedCancelled = localStorage.getItem(`cancelledBookings_${currentUser.uid}`);
        
        if (savedBookings) {
          try {
            const bookings = JSON.parse(savedBookings);
            // Filter bookings based on date and review status
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const upcoming: any[] = [];
            const completed: any[] = [];
            
            bookings.forEach((booking: any) => {
              // Parse the event date (format: "January 2, 2026")
              const eventDateStr = booking.checkIn;
              if (eventDateStr) {
                const eventDate = new Date(eventDateStr);
                eventDate.setHours(0, 0, 0, 0);
                
                // If event date has passed and booking is reviewed, move to completed
                if (eventDate < today && booking.reviewed) {
                  completed.push(booking);
                } else {
                  upcoming.push(booking);
                }
              } else {
                upcoming.push(booking);
              }
            });
            
            setUpcomingBookings(upcoming);
            
            // Update localStorage
            localStorage.setItem(`upcomingBookings_${currentUser.uid}`, JSON.stringify(upcoming));
            if (completed.length > 0) {
              const existingCompleted = savedCompleted ? JSON.parse(savedCompleted) : [];
              const allCompleted = [...existingCompleted, ...completed.filter(b => !existingCompleted.find((eb: any) => eb.id === b.id))];
              localStorage.setItem(`completedBookings_${currentUser.uid}`, JSON.stringify(allCompleted));
              setCompletedBookings(allCompleted);
            } else if (savedCompleted) {
              setCompletedBookings(JSON.parse(savedCompleted));
            }
          } catch (error) {
            console.error('Error parsing bookings:', error);
            setUpcomingBookings([]);
          }
        } else {
          setUpcomingBookings([]);
        }
        
        // Load completed bookings
        if (savedCompleted) {
          try {
            setCompletedBookings(JSON.parse(savedCompleted));
          } catch (error) {
            console.error('Error parsing completed bookings:', error);
            setCompletedBookings([]);
          }
        }
        
        // Load cancelled bookings
        if (savedCancelled) {
          try {
            setCancelledBookings(JSON.parse(savedCancelled));
          } catch (error) {
            console.error('Error parsing cancelled bookings:', error);
            setCancelledBookings([]);
          }
        }
        // Check if user has listings
        const listings = localStorage.getItem(`listings_${currentUser.uid}`);
        const hostListings = localStorage.getItem(`hostListings_${currentUser.uid}`);
        setHasListings(!!(listings && JSON.parse(listings).length > 0) || !!(hostListings && JSON.parse(hostListings).length > 0));
      } else {
        router.push('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Function to filter and organize bookings
  const filterBookings = (bookings: any[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcoming: any[] = [];
    const completed: any[] = [];
    
    bookings.forEach((booking: any) => {
      const eventDateStr = booking.checkIn;
      if (eventDateStr) {
        const eventDate = new Date(eventDateStr);
        eventDate.setHours(0, 0, 0, 0);
        
        if (eventDate < today && booking.reviewed) {
          completed.push(booking);
        } else {
          upcoming.push(booking);
        }
      } else {
        upcoming.push(booking);
      }
    });
    
    return { upcoming, completed };
  };

  // Listen for storage changes to update bookings when new ones are added
  useEffect(() => {
    const handleStorageChange = () => {
      if (user) {
        const savedBookings = localStorage.getItem(`upcomingBookings_${user.uid}`);
        const savedCompleted = localStorage.getItem(`completedBookings_${user.uid}`);
        
        if (savedBookings) {
          try {
            const bookings = JSON.parse(savedBookings);
            const { upcoming, completed } = filterBookings(bookings);
            
            setUpcomingBookings(upcoming);
            localStorage.setItem(`upcomingBookings_${user.uid}`, JSON.stringify(upcoming));
            
            if (completed.length > 0) {
              const existingCompleted = savedCompleted ? JSON.parse(savedCompleted) : [];
              const allCompleted = [...existingCompleted, ...completed.filter(b => !existingCompleted.find((eb: any) => eb.id === b.id))];
              localStorage.setItem(`completedBookings_${user.uid}`, JSON.stringify(allCompleted));
              setCompletedBookings(allCompleted);
            }
          } catch (error) {
            console.error('Error parsing bookings:', error);
          }
        }
        
        if (savedCompleted) {
          try {
            setCompletedBookings(JSON.parse(savedCompleted));
          } catch (error) {
            console.error('Error parsing completed bookings:', error);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        burgerOpen &&
        burgerRef.current &&
        !burgerRef.current.contains(event.target as Node)
      ) {
        setBurgerOpen(false);
      }
      if (
        languageOpen &&
        languageRef.current &&
        !languageRef.current.contains(event.target as Node)
      ) {
        closeLanguageModal();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [burgerOpen, languageOpen, closeLanguageModal]);

  const handleSignOut = async () => {
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const displayName = user?.displayName || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="page-shell">
      <header className="header shrink" style={{ minHeight: '80px', paddingTop: '12px', paddingBottom: '12px' }}>
        <div className="left-section">
          <button className="logo-mark" type="button" aria-label="Venu home" onClick={() => router.push('/dashboard')}>
            <img src="/venu-logo.png" alt="Venu Logo" className="logo-icon" />
          </button>
        </div>

        <div className="right-section">
          <button
            className="list-your-place"
            type="button"
            onClick={() => router.push('/list-your-place')}
          >
            List your place
          </button>

          <button
            className="profile-button"
            type="button"
            aria-label="Profile"
            onClick={() => router.push('/profile')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              marginLeft: '10px',
              marginTop: '15px',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: profilePhoto ? 'transparent' : '#1976d2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              backgroundImage: profilePhoto ? `url(${profilePhoto})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}>
              {!profilePhoto && userInitial}
            </div>
          </button>

          <div className="burger-wrapper" ref={burgerRef}>
            <button
              className="burger-button"
              type="button"
              aria-expanded={burgerOpen}
              aria-label={burgerOpen ? "Close menu" : "Open menu"}
              onClick={(event) => {
                event.stopPropagation();
                setBurgerOpen((prev) => !prev);
                setLanguageOpen(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BurgerIcon />
            </button>
            {burgerOpen && (
              <div
                className="burger-popup open"
                role="menu"
                style={{
                  position: 'absolute',
                  top: '50px',
                  right: '0',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                  minWidth: '240px',
                  padding: '8px 0',
                  zIndex: 1000,
                }}
              >
                <div className="popup-menu">
                  <button 
                    className="menu-item" 
                    type="button"
                    onClick={() => router.push('/wishlist')}
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    Wishlist
                  </button>
                  <button 
                    className="menu-item" 
                    type="button"
                    onClick={() => router.push('/events')}
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1"/>
                      <circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    My Events
                  </button>
                  <button 
                    className="menu-item" 
                    type="button"
                    onClick={() => router.push('/messages')}
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Messages
                  </button>
                  <button 
                    className="menu-item" 
                    type="button"
                    onClick={() => router.push('/reviews')}
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
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Reviews
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
                      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Account Settings
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
                    onClick={(event) => {
                      event.stopPropagation();
                      setLanguageOpen(true);
                      setBurgerOpen(false);
                    }}
                  >
                    <LanguageIcon />
                    Language & Currency
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
                    Help Center
                  </button>
                  <div style={{
                    height: '1px',
                    background: '#e6e6e6',
                    margin: '8px 0'
                  }} />
                  <button 
                    className="menu-item" 
                    type="button"
                    onClick={() => {
                      if (hasListings) {
                        router.push('/host');
                      }
                    }}
                    disabled={!hasListings}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: hasListings ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      color: hasListings ? '#222' : '#999',
                      opacity: hasListings ? 1 : 0.5
                    }}
                    onMouseOver={(e) => {
                      if (hasListings) {
                        e.currentTarget.style.backgroundColor = '#f6f7f8';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (hasListings) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 6L4 10L8 14" />
                      <path d="M16 18L20 14L16 10" />
                    </svg>
                    Switch to Hosting
                  </button>
                  <div style={{
                    height: '1px',
                    background: '#e6e6e6',
                    margin: '8px 0'
                  }} />
                  <button 
                    className="menu-item" 
                    type="button"
                    onClick={handleSignOut}
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
        </div>
      </header>

      <main style={{ padding: '24px 80px', backgroundColor: '#fff', minHeight: 'calc(100vh - 80px)' }}>
        {/* Page Title */}
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#222', marginBottom: '32px' }}>My Events</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '32px', borderBottom: '1px solid #e6e6e6' }}>
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'upcoming' ? '#e3f2fd' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'upcoming' ? '2px solid #1976d2' : '2px solid transparent',
              color: activeTab === 'upcoming' ? '#1976d2' : '#666',
              fontSize: '16px',
              fontWeight: activeTab === 'upcoming' ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Upcoming Events
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('past')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'past' ? '#e3f2fd' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'past' ? '2px solid #1976d2' : '2px solid transparent',
              color: activeTab === 'past' ? '#1976d2' : '#666',
              fontSize: '16px',
              fontWeight: activeTab === 'past' ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Past Events
          </button>
        </div>

        {/* Past Events Filter Buttons */}
        {activeTab === 'past' && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
            <button
              type="button"
              onClick={() => setPastEventsFilter('completed')}
              style={{
                padding: '10px 20px',
                background: pastEventsFilter === 'completed' ? '#1976d2' : 'transparent',
                border: pastEventsFilter === 'completed' ? '1px solid #1976d2' : '1px solid #e6e6e6',
                borderRadius: '8px',
                color: pastEventsFilter === 'completed' ? '#fff' : '#666',
                fontSize: '14px',
                fontWeight: pastEventsFilter === 'completed' ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                if (pastEventsFilter !== 'completed') {
                  e.currentTarget.style.borderColor = '#1976d2';
                  e.currentTarget.style.color = '#1976d2';
                }
              }}
              onMouseOut={(e) => {
                if (pastEventsFilter !== 'completed') {
                  e.currentTarget.style.borderColor = '#e6e6e6';
                  e.currentTarget.style.color = '#666';
                }
              }}
            >
              Completed
            </button>
            <button
              type="button"
              onClick={() => setPastEventsFilter('cancelled')}
              style={{
                padding: '10px 20px',
                background: pastEventsFilter === 'cancelled' ? '#1976d2' : 'transparent',
                border: pastEventsFilter === 'cancelled' ? '1px solid #1976d2' : '1px solid #e6e6e6',
                borderRadius: '8px',
                color: pastEventsFilter === 'cancelled' ? '#fff' : '#666',
                fontSize: '14px',
                fontWeight: pastEventsFilter === 'cancelled' ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                if (pastEventsFilter !== 'cancelled') {
                  e.currentTarget.style.borderColor = '#1976d2';
                  e.currentTarget.style.color = '#1976d2';
                }
              }}
              onMouseOut={(e) => {
                if (pastEventsFilter !== 'cancelled') {
                  e.currentTarget.style.borderColor = '#e6e6e6';
                  e.currentTarget.style.color = '#666';
                }
              }}
            >
              Cancelled
            </button>
          </div>
        )}

        {/* Upcoming Events - Booking Cards */}
        {activeTab === 'upcoming' && upcomingBookings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                style={{
                  border: '1px solid #e6e6e6',
                  borderRadius: '12px',
                  padding: '24px',
                  backgroundColor: '#fff',
                }}
              >
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#222', margin: 0 }}>
                        {booking.venueName}
                      </h2>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {Array.from({ length: booking.rating }).map((_, i) => (
                          <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                        {booking.address}
                      </p>
                      <a
                        href="#"
                        style={{
                          fontSize: '14px',
                          color: '#1976d2',
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        View on map
                      </a>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <a
                        href={`tel:${booking.phone}`}
                        style={{
                          fontSize: '14px',
                          color: '#1976d2',
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        Call {booking.phone}
                      </a>
                      <span style={{ fontSize: '14px', color: '#666' }}>•</span>
                      <a
                        href="#"
                        style={{
                          fontSize: '14px',
                          color: '#1976d2',
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        Message property
                      </a>
                    </div>
                  </div>
                </div>

                {/* Image and Booking Details Side by Side */}
                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                  <img
                    src={booking.image || '/api/placeholder/400/300'}
                    alt={booking.venueName}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/api/placeholder/400/300';
                    }}
                    style={{
                      width: '240px',
                      height: '240px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      backgroundColor: '#f6f7f8',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, display: 'flex', gap: '24px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Booking ID</p>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#222' }}>{booking.id}</p>
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Event date</p>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#222' }}>
                          {booking.checkIn}
                        </p>
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Occasion</p>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#222' }}>
                          {booking.occasion || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Guest pax</p>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#222' }}>
                          {booking.capacity || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start', width: '100%', maxWidth: '300px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBookingId(booking.id);
                          setConfirmationEmail(booking.contactEmail);
                          setBookingConfirmationOpen(true);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 20px',
                          backgroundColor: '#1976d2',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
                      >
                        Get booking confirmation
                      </button>
                      {(() => {
                        // Check if event date is between 24 hours and 30 days away
                        const eventDateStr = booking.checkIn;
                        if (!eventDateStr) return null;
                        
                        const eventDate = new Date(eventDateStr);
                        eventDate.setHours(0, 0, 0, 0);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        const diffTime = eventDate.getTime() - today.getTime();
                        const diffDays = diffTime / (1000 * 60 * 60 * 24);
                        
                        // Enable if between 1 day (24 hours) and 30 days
                        const isWithinWindow = diffDays >= 1 && diffDays <= 30;
                        
                        return (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                if (isWithinWindow) {
                                  // Handle cancel booking
                                  if (confirm('Are you sure you want to cancel this booking?')) {
                                    // Move to cancelled
                                    const updatedBookings = upcomingBookings.filter(b => b.id !== booking.id);
                                    setUpcomingBookings(updatedBookings);
                                    localStorage.setItem(`upcomingBookings_${user?.uid}`, JSON.stringify(updatedBookings));
                                    
                                    const cancelled = cancelledBookings || [];
                                    cancelled.push({ ...booking, cancelledAt: new Date().toISOString() });
                                    setCancelledBookings(cancelled);
                                    localStorage.setItem(`cancelledBookings_${user?.uid}`, JSON.stringify(cancelled));
                                  }
                                }
                              }}
                              disabled={!isWithinWindow}
                              style={{
                                width: '100%',
                                padding: '10px 20px',
                                backgroundColor: isWithinWindow ? '#1976d2' : '#e6e6e6',
                                color: isWithinWindow ? 'white' : '#999',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: isWithinWindow ? 'pointer' : 'not-allowed',
                                transition: 'background-color 0.2s',
                              }}
                              onMouseOver={(e) => {
                                if (isWithinWindow) {
                                  e.currentTarget.style.backgroundColor = '#1565c0';
                                }
                              }}
                              onMouseOut={(e) => {
                                if (isWithinWindow) {
                                  e.currentTarget.style.backgroundColor = '#1976d2';
                                }
                              }}
                            >
                              Cancel Booking
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (isWithinWindow) {
                                  // Handle edit booking - navigate to venue page with booking data
                                  router.push(`/venue/${booking.venueId}?edit=${booking.id}`);
                                }
                              }}
                              disabled={!isWithinWindow}
                              style={{
                                width: '100%',
                                padding: '10px 20px',
                                backgroundColor: isWithinWindow ? '#1976d2' : '#e6e6e6',
                                color: isWithinWindow ? 'white' : '#999',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: isWithinWindow ? 'pointer' : 'not-allowed',
                                transition: 'background-color 0.2s',
                              }}
                              onMouseOver={(e) => {
                                if (isWithinWindow) {
                                  e.currentTarget.style.backgroundColor = '#1565c0';
                                }
                              }}
                              onMouseOut={(e) => {
                                if (isWithinWindow) {
                                  e.currentTarget.style.backgroundColor = '#1976d2';
                                }
                              }}
                            >
                              Edit Booking
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Past Events - Completed/Cancelled */}
        {activeTab === 'past' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {(pastEventsFilter === 'completed' ? completedBookings : cancelledBookings).map((booking) => (
              <div
                key={booking.id}
                style={{
                  border: '1px solid #e6e6e6',
                  borderRadius: '12px',
                  padding: '24px',
                  backgroundColor: '#fff',
                }}
              >
                {/* Same booking card structure as upcoming */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#222', margin: 0 }}>
                        {booking.venueName}
                      </h2>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {Array.from({ length: booking.rating || 0 }).map((_, i) => (
                          <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                        {booking.address}
                      </p>
                      <a
                        href="#"
                        style={{
                          fontSize: '14px',
                          color: '#1976d2',
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        View on map
                      </a>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <a
                        href={`tel:${booking.phone}`}
                        style={{
                          fontSize: '14px',
                          color: '#1976d2',
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        Call {booking.phone}
                      </a>
                      <span style={{ fontSize: '14px', color: '#666' }}>•</span>
                      <a
                        href="#"
                        style={{
                          fontSize: '14px',
                          color: '#1976d2',
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        Message property
                      </a>
                    </div>
                  </div>
                </div>

                {/* Image and Booking Details Side by Side */}
                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                  <img
                    src={booking.image || '/api/placeholder/400/300'}
                    alt={booking.venueName}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/api/placeholder/400/300';
                    }}
                    style={{
                      width: '240px',
                      height: '240px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      backgroundColor: '#f6f7f8',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Booking ID</p>
                      <p style={{ fontSize: '16px', fontWeight: '600', color: '#222' }}>{booking.id}</p>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Event date</p>
                      <p style={{ fontSize: '16px', fontWeight: '600', color: '#222' }}>
                        {booking.checkIn}
                      </p>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Occasion</p>
                      <p style={{ fontSize: '16px', fontWeight: '600', color: '#222' }}>
                        {booking.occasion || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Guest pax</p>
                      <p style={{ fontSize: '16px', fontWeight: '600', color: '#222' }}>
                        {booking.capacity || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'upcoming' && upcomingBookings.length === 0) || (activeTab === 'past' && (pastEventsFilter === 'completed' ? completedBookings.length === 0 : cancelledBookings.length === 0))) && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '60vh',
            padding: '80px 20px',
            textAlign: 'center'
          }}>
            {/* Main Text */}
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: '700', 
              color: '#222', 
              marginBottom: '8px',
              margin: 0
            }}>
              No Events Found
            </h2>image.png

            {/* Subtitle */}
            <p style={{ 
              fontSize: '16px', 
              color: '#666', 
              marginBottom: '32px',
              margin: '0 0 32px 0',
              maxWidth: '400px'
            }}>
              {activeTab === 'upcoming' 
                ? "You have no upcoming events"
                : activeTab === 'past' && pastEventsFilter === 'completed'
                ? "You have no completed events"
                : activeTab === 'past' && pastEventsFilter === 'cancelled'
                ? "You have no cancelled events"
                : "You have no past events"
              }
            </p>
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
                // Handle save - automatically close modal
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

      {/* Booking Confirmation Modal */}
      {bookingConfirmationOpen && (
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
          onClick={() => setBookingConfirmationOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setBookingConfirmationOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Title */}
            <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#222', marginBottom: '24px', paddingRight: '40px' }}>
              Get booking confirmation
            </h2>

            {/* Email Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={confirmationEmail}
                  onChange={(e) => setConfirmationEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingRight: '40px',
                    border: '1px solid #e6e6e6',
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#222',
                    backgroundColor: 'white',
                  }}
                  placeholder="Enter your email"
                />
                {confirmationEmail && (
                  <button
                    type="button"
                    onClick={() => setConfirmationEmail('')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  // Handle send to email
                  console.log('Send to email:', confirmationEmail);
                  setBookingConfirmationOpen(false);
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
                Send to email
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e6e6e6' }} />
                <span style={{ fontSize: '14px', color: '#666' }}>or</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e6e6e6' }} />
              </div>

              <button
                type="button"
                onClick={() => {
                  // Handle download
                  console.log('Download confirmation for booking:', selectedBookingId);
                  setBookingConfirmationOpen(false);
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
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

