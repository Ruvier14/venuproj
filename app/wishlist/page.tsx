'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import Logo from '@/app/components/Logo';

const SearchIcon = () => (
  <svg
    aria-hidden="true"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#111"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="M16.5 16.5 21 21" />
  </svg>
);

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

type Venue = {
  id: string;
  name: string;
  location: string;
  price: string;
  rating: number;
  reviewCount: number;
  image: string;
  amenities: string[];
};

export default function Wishlist() {
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
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<Venue[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Get profile photo - prioritize localStorage (most up-to-date), then Firebase
        const savedPhoto = localStorage.getItem(`profilePhoto_${currentUser.uid}`);
        if (savedPhoto) {
          setProfilePhoto(savedPhoto);
        } else if (currentUser.photoURL) {
          setProfilePhoto(currentUser.photoURL);
        } else {
          setProfilePhoto(null);
        }
        // Load wishlist from localStorage
        const savedWishlist = localStorage.getItem(`wishlist_${currentUser.uid}`);
        if (savedWishlist) {
          const items: Venue[] = JSON.parse(savedWishlist);
          // Remove duplicates based on id
          const uniqueItems = items.filter((item, index, self) => 
            index === self.findIndex((t) => t.id === item.id)
          );
          // Update localStorage with deduplicated items
          if (uniqueItems.length !== items.length) {
            localStorage.setItem(`wishlist_${currentUser.uid}`, JSON.stringify(uniqueItems));
          }
          setWishlistItems(uniqueItems);
          setFavorites(uniqueItems.map((item) => item.id));
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

  // Listen for storage changes to sync profile photo across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (user && e.key === `profilePhoto_${user.uid}` && e.newValue) {
        setProfilePhoto(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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

  const toggleFavorite = (venue: Venue) => {
    if (!user) return;
    
    const isCurrentlyFavorite = favorites.includes(venue.id);
    const newFavorites = isCurrentlyFavorite
      ? favorites.filter((fav) => fav !== venue.id)
      : [...favorites, venue.id];
    
    // Update localStorage
    let updatedWishlistItems: Venue[] = [...wishlistItems];
    
    if (isCurrentlyFavorite) {
      updatedWishlistItems = updatedWishlistItems.filter((item) => item.id !== venue.id);
    } else {
      // Check if venue already exists to prevent duplicates
      const alreadyExists = updatedWishlistItems.some((item) => item.id === venue.id);
      if (!alreadyExists) {
        updatedWishlistItems = [...updatedWishlistItems, venue];
      }
    }
    
    localStorage.setItem(`wishlist_${user.uid}`, JSON.stringify(updatedWishlistItems));
    setWishlistItems(updatedWishlistItems);
    setFavorites(newFavorites);
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const displayName = user?.displayName || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  if (loading) {
    return <div>Loading...</div>;
  }

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
                    onClick={() => router.push('/help-center')}
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
                      <path d="M8 9L4 12L8 15" />
                      <path d="M16 9L20 12L16 15" />
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
        </div>
      </header>

      <main style={{ padding: '24px 80px', backgroundColor: '#fff' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '32px' }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#222', marginBottom: '16px' }}>Wishlist</h1>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => {
                if (wishlistItems.length > 0) {
                  setShareModalOpen(true);
                }
              }}
              disabled={wishlistItems.length === 0}
              style={{
                padding: '8px 16px',
                border: '1px solid #e6e6e6',
                borderRadius: '24px',
                backgroundColor: 'white',
                fontSize: '14px',
                fontWeight: '500',
                color: wishlistItems.length === 0 ? '#999' : '#222',
                cursor: wishlistItems.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: wishlistItems.length === 0 ? 0.5 : 1,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={wishlistItems.length === 0 ? "#999" : "#222"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6" cy="12" r="2" />
                <circle cx="18" cy="7" r="2" />
                <circle cx="18" cy="17" r="2" />
                <line x1="8" y1="12" x2="16" y2="7" />
                <line x1="8" y1="12" x2="16" y2="17" />
              </svg>
              Share
            </button>
          </div>
        </div>

        {/* Venue Cards Grid */}
        {wishlistItems.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '60vh',
            padding: '80px 20px',
            textAlign: 'center'
          }}>
            {/* Heart Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#e3f2fd',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            
            {/* No saves yet text */}
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: '700', 
              color: '#222', 
              marginBottom: '8px',
              margin: 0
            }}>
              No saves yet
            </h2>
            
            {/* Subtitle */}
            <p style={{ 
              fontSize: '16px', 
              color: '#666', 
              marginBottom: '32px',
              margin: '0 0 32px 0',
              maxWidth: '400px'
            }}>
              Keep track of your favorite trip items here
            </p>
            
            {/* Start exploring button */}
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              style={{
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
            >
              Start exploring
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 300px))',
              gap: '40px 24px',
              justifyContent: 'flex-start',
            }}
          >
            {wishlistItems.map((venue) => (
              <div
                key={venue.id}
                onClick={() => router.push(`/venue/${venue.id}`)}
                style={{
                  cursor: 'pointer',
                  width: '300px',
                }}
              >
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      backgroundColor: '#f6f7f8',
                      backgroundImage: `url(${venue.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      minWidth: '300px',
                      maxWidth: '300px',
                    }}
                  >
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(venue);
                        }}
                        style={{
                          background: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill={isFavorite(venue.id) ? '#ff385c' : 'none'}
                          stroke={isFavorite(venue.id) ? '#ff385c' : '#222'}
                          strokeWidth={isFavorite(venue.id) ? '0' : '2'}
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h3
                      style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#222',
                        margin: 0,
                      }}
                    >
                      {venue.name}
                    </h3>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#222' }}>★ {venue.rating}</span>
                  </div>
                  
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>{venue.location}</p>
                  
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#222', marginTop: '8px' }}>
                    {venue.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Share Modal */}
      {shareModalOpen && (
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
          onClick={() => setShareModalOpen(false)}
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
              onClick={() => setShareModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Title */}
            <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#222', marginBottom: '16px', paddingRight: '32px' }}>
              Invite others to join
            </h2>

            {/* Wishlist Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              {wishlistItems.length > 0 && (
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    backgroundImage: `url(${wishlistItems[0].image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    flexShrink: 0,
                  }}
                />
              )}
              <div>
                <p style={{ fontSize: '14px', color: '#222', fontWeight: '500', margin: 0 }}>
                  Join my wishlist: Wishlist · {wishlistItems.length} saved
                </p>
              </div>
            </div>

            {/* Sharing Options Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {/* Copy Link */}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px',
                  border: '1px solid #e6e6e6',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span style={{ fontSize: '14px', color: '#222' }}>Copy Link</span>
              </button>

              {/* Messages */}
              <button
                type="button"
                onClick={() => {
                  setShareModalOpen(false);
                  router.push('/messages');
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px',
                  border: '1px solid #e6e6e6',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span style={{ fontSize: '14px', color: '#222' }}>Messages</span>
              </button>

              {/* Messenger */}
              <button
                type="button"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px',
                  border: '1px solid #e6e6e6',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#0084FF">
                  <path d="M12 2C6.48 2 2 6.15 2 11.25c0 2.61 1.21 4.95 3.14 6.55L2 22l4.71-2.8c1.3.36 2.68.55 4.1.55 5.52 0 10-4.15 10-9.25S17.52 2 12 2zm0 16.5c-1.2 0-2.36-.17-3.43-.48l-.25-.07-2.64 1.57.7-2.3-.18-.25c-.96-1.28-1.5-2.87-1.5-4.52 0-3.87 3.58-7 8-7s8 3.13 8 7-3.58 7-8 7z" />
                </svg>
                <span style={{ fontSize: '14px', color: '#222' }}>Messenger</span>
              </button>

              {/* Twitter */}
              <button
                type="button"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px',
                  border: '1px solid #e6e6e6',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#000000">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span style={{ fontSize: '14px', color: '#222' }}>Twitter</span>
              </button>

              {/* Email */}
              <button
                type="button"
                onClick={() => {
                  window.location.href = `mailto:?subject=Check out my wishlist&body=${encodeURIComponent(window.location.href)}`;
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px',
                  border: '1px solid #e6e6e6',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span style={{ fontSize: '14px', color: '#222' }}>Email</span>
              </button>

              {/* WhatsApp */}
              <button
                type="button"
                onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(window.location.href)}`, '_blank');
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px',
                  border: '1px solid #e6e6e6',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span style={{ fontSize: '14px', color: '#222' }}>WhatsApp</span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => {
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px',
                  border: '1px solid #e6e6e6',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span style={{ fontSize: '14px', color: '#222' }}>Facebook</span>
              </button>
            </div>

            {/* Disclaimer */}
            <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', margin: 0 }}>
              Once you share this link, anyone can view your wishlist.{' '}
              <a href="#" style={{ color: '#222', textDecoration: 'underline' }}>Learn more</a>
            </p>
          </div>
        </div>
      )}

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
    </div>
  );
}

