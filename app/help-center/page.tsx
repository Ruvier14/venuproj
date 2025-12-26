'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { getUserProfile } from '@/lib/firestore';
import Logo from '@/app/components/Logo';

const SearchIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="M16.5 16.5 21 21" />
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

const CloseIcon = () => (
  <svg
    aria-hidden="true"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

export default function HelpCenter() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasListings, setHasListings] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [refundsChargesModalOpen, setRefundsChargesModalOpen] = useState(false);
  const burgerRef = useRef<HTMLDivElement>(null);
  const accountModalRef = useRef<HTMLDivElement>(null);
  const privacyModalRef = useRef<HTMLDivElement>(null);
  const securityModalRef = useRef<HTMLDivElement>(null);
  const refundsChargesModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
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
        
        // Get user profile for name
        try {
          const profile = await getUserProfile(currentUser.uid);
          if (profile) {
            const firstName = profile.firstName || '';
            setUserName(firstName || currentUser.displayName?.split(' ')[0] || 'User');
          } else {
            setUserName(currentUser.displayName?.split(' ')[0] || 'User');
          }
        } catch (error) {
          setUserName(currentUser.displayName?.split(' ')[0] || 'User');
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        burgerOpen &&
        burgerRef.current &&
        !burgerRef.current.contains(event.target as Node)
      ) {
        setBurgerOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [burgerOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality
    console.log('Searching for:', searchQuery);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="page-shell">
      <header className="header shrink" style={{ minHeight: '80px', paddingTop: '12px', paddingBottom: '12px' }}>
        <div className="left-section">
          <Logo />
        </div>

        <div className="right-section">
          <button
            className="list-your-place"
            type="button"
            onClick={() => {
              if (hasListings) {
                router.push('/host');
              } else {
                router.push('/list-your-place');
              }
            }}
          >
            {hasListings ? 'Switch to hosting' : 'List your place'}
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
                  <div style={{
                    height: '1px',
                    background: '#e6e6e6',
                    margin: '8px 0'
                  }} />
                  <button 
                    className="menu-item" 
                    type="button"
                    onClick={() => router.push('/profile')}
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
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Profile
                  </button>
                  <button 
                    className="menu-item" 
                    type="button"
                    onClick={async () => {
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{
        padding: '80px 120px',
        width: '100%',
        maxWidth: '100%',
        backgroundColor: '#fff',
        minHeight: 'calc(100vh - 80px)'
      }}>
        {/* Header Section */}
        <div style={{ marginBottom: '60px' }}>
          <h1 style={{
            fontSize: '40px',
            fontWeight: '700',
            color: '#222',
            marginBottom: '20px',
            lineHeight: '1.2'
          }}>
            Help Center
          </h1>
          <p style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#222',
            marginBottom: '48px'
          }}>
            Hi, {userName}
          </p>

          {/* Search Bar - Centered and wide */}
          <form onSubmit={handleSearch} style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '80px',
            justifyContent: 'center',
            maxWidth: '900px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            <div style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              maxWidth: '700px'
            }}>
              <div style={{
                position: 'absolute',
                left: '20px',
                color: '#666',
                pointerEvents: 'none',
                zIndex: 1
              }}>
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="How can we help?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '18px 20px 18px 56px',
                  fontSize: '16px',
                  border: '1px solid #e6e6e6',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  backgroundColor: '#fff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e6e6e6'}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '18px 40px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                whiteSpace: 'nowrap',
                height: 'fit-content'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
            >
              Search
            </button>
          </form>
        </div>

        {/* Manage your bookings section */}
        <div style={{ marginBottom: '80px', maxWidth: '100%' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#222',
            marginBottom: '32px'
          }}>
            Manage your bookings
          </h2>
          
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '16px',
            padding: '40px 60px',
            textAlign: 'center',
            marginBottom: '24px',
            width: '100%',
            maxWidth: '100%'
          }}>
            {/* Beach Illustration */}
            <div style={{
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              gap: '30px',
              flexWrap: 'wrap',
              minHeight: '100px'
            }}>
              {/* Beach Umbrella - Blue and white striped */}
              <svg width="100" height="100" viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
                {/* Umbrella canopy with stripes */}
                <defs>
                  <pattern id="umbrella-stripe" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                    <rect width="8" height="4" fill="#1976d2"/>
                    <rect y="4" width="8" height="4" fill="#ffffff"/>
                  </pattern>
                </defs>
                <path d="M60 15 L25 85 L95 85 Z" fill="url(#umbrella-stripe)" stroke="#1565c0" strokeWidth="2"/>
                {/* Umbrella pole */}
                <rect x="58" y="85" width="4" height="25" fill="#8B4513" rx="2"/>
                {/* Umbrella tip */}
                <circle cx="60" cy="15" r="3" fill="#1976d2"/>
              </svg>
              
              {/* Beach Chair - Yellow */}
              <svg width="80" height="80" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
                {/* Chair back */}
                <rect x="25" y="30" width="50" height="8" fill="#FFD700" rx="3" stroke="#FFA000" strokeWidth="1"/>
                {/* Chair seat */}
                <rect x="25" y="38" width="50" height="8" fill="#FFD700" rx="3" stroke="#FFA000" strokeWidth="1"/>
                {/* Chair legs */}
                <rect x="25" y="46" width="6" height="35" fill="#FFD700" rx="2" stroke="#FFA000" strokeWidth="1"/>
                <rect x="69" y="46" width="6" height="35" fill="#FFD700" rx="2" stroke="#FFA000" strokeWidth="1"/>
                {/* Chair back support */}
                <line x1="25" y1="30" x2="15" y2="15" stroke="#FFD700" strokeWidth="4" strokeLinecap="round"/>
                <line x1="75" y1="30" x2="85" y2="15" stroke="#FFD700" strokeWidth="4" strokeLinecap="round"/>
              </svg>
              
              {/* Sun - Yellow with rays */}
              <svg width="80" height="80" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
                <circle cx="50" cy="50" r="20" fill="#FFD700" stroke="#FFA000" strokeWidth="2"/>
                {/* Sun rays */}
                <line x1="50" y1="15" x2="50" y2="5" stroke="#FFD700" strokeWidth="4" strokeLinecap="round"/>
                <line x1="50" y1="85" x2="50" y2="95" stroke="#FFD700" strokeWidth="4" strokeLinecap="round"/>
                <line x1="15" y1="50" x2="5" y2="50" stroke="#FFD700" strokeWidth="4" strokeLinecap="round"/>
                <line x1="85" y1="50" x2="95" y2="50" stroke="#FFD700" strokeWidth="4" strokeLinecap="round"/>
                <line x1="28" y1="28" x2="20" y2="20" stroke="#FFD700" strokeWidth="4" strokeLinecap="round"/>
                <line x1="72" y1="72" x2="80" y2="80" stroke="#FFD700" strokeWidth="4" strokeLinecap="round"/>
                <line x1="72" y1="28" x2="80" y2="20" stroke="#FFD700" strokeWidth="4" strokeLinecap="round"/>
                <line x1="28" y1="72" x2="20" y2="80" stroke="#FFD700" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </div>

            <p style={{
              fontSize: '18px',
              color: '#666',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              We couldn't find any bookings for you right now.
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              alignItems: 'center'
            }}>
              <button
                type="button"
                onClick={() => router.push('/reservations')}
                style={{
                  padding: '16px 32px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  minWidth: '240px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
              >
                Find an existing booking
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                style={{
                  padding: '0',
                  backgroundColor: 'transparent',
                  color: '#1976d2',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                Start shopping
              </button>
            </div>
          </div>
        </div>

        {/* Explore help articles section */}
        <div style={{ maxWidth: '100%' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#222',
            marginBottom: '32px'
          }}>
            Explore help articles
          </h2>
          
          {/* Help articles grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            maxWidth: '100%'
          }}>
            {/* Account Card */}
            <button
              type="button"
              onClick={() => setAccountModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                backgroundColor: '#fff',
                border: '1px solid #e6e6e6',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                gap: '16px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#222';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e6e6e6';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="8" r="3"/>
                  <path d="M6 21c0-3.314 2.686-6 6-6s6 2.686 6 6"/>
                </svg>
                <span style={{ fontSize: '16px', fontWeight: '500', color: '#1976d2' }}>Account</span>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            {/* Privacy Card */}
            <button
              type="button"
              onClick={() => setPrivacyModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                backgroundColor: '#fff',
                border: '1px solid #e6e6e6',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                gap: '16px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#222';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e6e6e6';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                <span style={{ fontSize: '16px', fontWeight: '500', color: '#1976d2' }}>Privacy</span>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            {/* Security Card */}
            <button
              type="button"
              onClick={() => setSecurityModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                backgroundColor: '#fff',
                border: '1px solid #e6e6e6',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                gap: '16px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#222';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e6e6e6';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span style={{ fontSize: '16px', fontWeight: '500', color: '#1976d2' }}>Security</span>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            {/* Refunds & Charges Card */}
            <button
              type="button"
              onClick={() => setRefundsChargesModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                backgroundColor: '#fff',
                border: '1px solid #e6e6e6',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                gap: '16px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#222';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e6e6e6';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <span style={{ fontSize: '16px', fontWeight: '500', color: '#1976d2' }}>Refunds & Charges</span>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            {/* Event Alerts Card */}
            <button
              type="button"
              onClick={() => {}}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                backgroundColor: '#fff',
                border: '1px solid #e6e6e6',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                gap: '16px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#222';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e6e6e6';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span style={{ fontSize: '16px', fontWeight: '500', color: '#1976d2' }}>Event Alerts</span>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </main>

      {/* Account Modal */}
      {accountModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => setAccountModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
        >
          <div
            ref={accountModalRef}
            className="auth-modal"
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'slideUp 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Close modal"
              onClick={() => setAccountModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: '1px solid #1976d2',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: '50%',
                color: '#1976d2',
                transition: 'all 0.2s ease',
                zIndex: 10
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#1976d2';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#1976d2';
              }}
            >
              <CloseIcon />
            </button>

            <div style={{ padding: '40px' }}>
              <h2 style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '32px',
                fontWeight: '700',
                color: '#222',
                margin: '0 0 32px 0',
                lineHeight: '1.2'
              }}>
                Account
              </h2>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    router.push('/profile');
                    setAccountModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Correct or update your account information
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Handle sign in action
                    setAccountModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Sign in to your account
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Handle delete account action
                    setAccountModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Delete your account
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Handle unsubscribe action
                    setAccountModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Unsubscribe from marketing emails, SMS and push notifications
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {privacyModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => setPrivacyModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
        >
          <div
            ref={privacyModalRef}
            className="auth-modal"
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'slideUp 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Close modal"
              onClick={() => setPrivacyModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: '1px solid #1976d2',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: '50%',
                color: '#1976d2',
                transition: 'all 0.2s ease',
                zIndex: 10
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#1976d2';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#1976d2';
              }}
            >
              <CloseIcon />
            </button>

            <div style={{ padding: '40px' }}>
              <h2 style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '32px',
                fontWeight: '700',
                color: '#222',
                margin: '0 0 32px 0',
                lineHeight: '1.2'
              }}>
                Privacy
              </h2>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    router.push('/profile');
                    setPrivacyModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Correct or update your account information
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPrivacyModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    What privacy and data subject rights are available?
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPrivacyModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Use of surveillance policy
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPrivacyModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Manage the use of your personal data for direct marketing
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPrivacyModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Unsubscribe from marketing emails, SMS and push notifications
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPrivacyModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Other questions and concerns about your personal data
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Modal */}
      {securityModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => setSecurityModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
        >
          <div
            ref={securityModalRef}
            className="auth-modal"
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'slideUp 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Close modal"
              onClick={() => setSecurityModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: '1px solid #1976d2',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: '50%',
                color: '#1976d2',
                transition: 'all 0.2s ease',
                zIndex: 10
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#1976d2';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#1976d2';
              }}
            >
              <CloseIcon />
            </button>

            <div style={{ padding: '40px' }}>
              <h2 style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '32px',
                fontWeight: '700',
                color: '#222',
                margin: '0 0 32px 0',
                lineHeight: '1.2'
              }}>
                Security
              </h2>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setSecurityModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Payment security
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSecurityModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    About weapons at a property
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSecurityModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Report a concern about a Vrbo property
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSecurityModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Natural disaster impacts booking
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSecurityModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Use of surveillance policy
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSecurityModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    About Vrbo's extortion policy
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSecurityModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    About two-factor authentication
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSecurityModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Beware of phone call scams
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSecurityModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Beware of email scams (phishing)
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSecurityModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Gift card scams
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSecurityModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Property safety tips
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refunds & Charges Modal */}
      {refundsChargesModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => setRefundsChargesModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
        >
          <div
            ref={refundsChargesModalRef}
            className="auth-modal"
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'slideUp 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Close modal"
              onClick={() => setRefundsChargesModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: '1px solid #1976d2',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: '50%',
                color: '#1976d2',
                transition: 'all 0.2s ease',
                zIndex: 10
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#1976d2';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#1976d2';
              }}
            >
              <CloseIcon />
            </button>

            <div style={{ padding: '40px' }}>
              <h2 style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '32px',
                fontWeight: '700',
                color: '#222',
                margin: '0 0 32px 0',
                lineHeight: '1.2'
              }}>
                Refunds & Charges
              </h2>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setRefundsChargesModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Payment security
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRefundsChargesModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Failed transactions and split payments
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRefundsChargesModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Download the service fee invoice
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRefundsChargesModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Cancel a reservation and receive a refund
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRefundsChargesModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Get your refund status
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRefundsChargesModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Book online and pay securely
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRefundsChargesModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    About Affirm flexible payment options
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRefundsChargesModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    About failed final payments
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRefundsChargesModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    About the service fee
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRefundsChargesModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    About damage deposits
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRefundsChargesModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    Redeem your BedandBreakfast.com gift card
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRefundsChargesModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e6e6e6',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    About my card on file and property damage charges
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRefundsChargesModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#1976d2'
                  }}>
                    How Vrbo shows up on a bank statement
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

