'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

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
  lat?: number;
  lng?: number;
};

export default function MapView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('Best Match');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [hasListings, setHasListings] = useState(false);

  const burgerRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);

  // Sample venues with coordinates and images
  const venues: Venue[] = [
    {
      id: '1',
      name: 'Insert Event Venue',
      location: 'City Name',
      price: 'Insert Price',
      rating: 0,
      reviewCount: 0,
      image: '/api/placeholder/300/300',
      amenities: ['Indoor', 'Parking', 'Pets Allowed'],
      lat: 10.3157,
      lng: 123.8854,
    },
    {
      id: '2',
      name: 'Insert Event Venue',
      location: 'City Name',
      price: 'Insert Price',
      rating: 0,
      reviewCount: 0,
      image: '/api/placeholder/300/300',
      amenities: ['Indoor', 'Parking', 'Pets Allowed'],
      lat: 10.3257,
      lng: 123.8954,
    },
    {
      id: '3',
      name: 'Insert Event Venue',
      location: 'City Name',
      price: 'Insert Price',
      rating: 0,
      reviewCount: 0,
      image: '/api/placeholder/300/300',
      amenities: ['Indoor', 'Parking', 'Pets Allowed'],
      lat: 10.3057,
      lng: 123.8754,
    },
    {
      id: '4',
      name: 'Insert Event Venue',
      location: 'City Name',
      price: 'Insert Price',
      rating: 0,
      reviewCount: 0,
      image: '/api/placeholder/300/300',
      amenities: ['Indoor', 'Parking', 'Pets Allowed'],
      lat: 10.3357,
      lng: 123.9054,
    },
    {
      id: '5',
      name: 'Insert Event Venue',
      location: 'City Name',
      price: 'Insert Price',
      rating: 0,
      reviewCount: 0,
      image: '/api/placeholder/300/300',
      amenities: ['Indoor', 'Parking', 'Pets Allowed'],
      lat: 10.2957,
      lng: 123.8654,
    },
    {
      id: '6',
      name: 'Insert Event Venue',
      location: 'City Name',
      price: 'Insert Price',
      rating: 0,
      reviewCount: 0,
      image: '/api/placeholder/300/300',
      amenities: ['Indoor', 'Parking', 'Pets Allowed'],
      lat: 10.3457,
      lng: 123.9154,
    },
  ];

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
        // Load favorites
        const savedWishlist = localStorage.getItem(`wishlist_${currentUser.uid}`);
        if (savedWishlist) {
          const wishlistItems: Venue[] = JSON.parse(savedWishlist);
          setFavorites(wishlistItems.map((item) => item.id));
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
        setLanguageOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [burgerOpen, languageOpen]);

  const toggleFavorite = (venue: Venue) => {
    setFavorites((prev) => {
      const isCurrentlyFavorite = prev.includes(venue.id);
      const newFavorites = isCurrentlyFavorite
        ? prev.filter((fav) => fav !== venue.id)
        : [...prev, venue.id];
      
      // Save to localStorage
      if (user) {
        const savedWishlist = localStorage.getItem(`wishlist_${user.uid}`);
        let wishlistItems: Venue[] = savedWishlist ? JSON.parse(savedWishlist) : [];
        
        if (isCurrentlyFavorite) {
          wishlistItems = wishlistItems.filter((item) => item.id !== venue.id);
        } else {
          const alreadyExists = wishlistItems.some((item) => item.id === venue.id);
          if (!alreadyExists) {
            wishlistItems = [...wishlistItems, venue];
          }
        }
        
        localStorage.setItem(`wishlist_${user.uid}`, JSON.stringify(wishlistItems));
      }
      
      return newFavorites;
    });
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const displayName = user?.displayName || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  // Get search parameters
  const whereValue = searchParams.get('where') || 'Events Nearby';
  const occasionValue = searchParams.get('occasion') || 'Wedding';
  const whenValue = searchParams.get('when') || 'Nov 8';
  const guestValue = searchParams.get('guest') || 'Large';
  const budgetValue = searchParams.get('budget') || '100k';

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="page-shell">
      <header className="header shrink" style={{ minHeight: '80px', paddingTop: '12px', paddingBottom: '12px' }}>
        <div className="left-section">
          <button className="logo-mark" type="button" aria-label="Venu home" onClick={() => router.push('/dashboard')}>
            <img src="/venu-logo.png" alt="Venu Logo" className="logo-icon" />
          </button>
        </div>

        <div className="middle-section">
          <div
            className="searchbar shrunk"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#f6f7f8',
              borderRadius: '40px',
              border: '1px solid #e6e6e6',
              width: '100%',
              maxWidth: '600px',
              cursor: 'pointer',
            }}
            onClick={() => {
              const params = new URLSearchParams();
              if (whereValue !== 'Events Nearby') params.set('where', whereValue);
              if (occasionValue !== 'Wedding') params.set('occasion', occasionValue);
              if (whenValue !== 'Nov 8') params.set('when', whenValue);
              if (guestValue !== 'Large') params.set('guest', guestValue);
              if (budgetValue !== '100k') params.set('budget', budgetValue);
              router.push(`/search?${params.toString()}`);
            }}
          >
            <span style={{ fontSize: '14px', color: '#222', whiteSpace: 'nowrap' }}>{whereValue}</span>
            <span style={{ fontSize: '14px', color: '#666' }}>•</span>
            <span style={{ fontSize: '14px', color: '#222', whiteSpace: 'nowrap' }}>{occasionValue}</span>
            <span style={{ fontSize: '14px', color: '#666' }}>•</span>
            <span style={{ fontSize: '14px', color: '#222', whiteSpace: 'nowrap' }}>{whenValue}</span>
            <span style={{ fontSize: '14px', color: '#666' }}>•</span>
            <span style={{ fontSize: '14px', color: '#222', whiteSpace: 'nowrap' }}>{guestValue}</span>
            <span style={{ fontSize: '14px', color: '#666' }}>•</span>
            <span style={{ fontSize: '14px', color: '#222', whiteSpace: 'nowrap' }}>{budgetValue}</span>
            <div style={{ marginLeft: 'auto' }}>
              <SearchIcon />
            </div>
          </div>
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
            }}
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
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
                  minWidth: '240px',
                  zIndex: 1000,
                  padding: '8px 0',
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
                      setLanguageOpen((prev) => !prev);
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

      <main style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
        {/* Left Panel - Venue Listings */}
        <div style={{ width: '50%', overflowY: 'auto', padding: '24px', backgroundColor: '#fff' }}>
          {/* Sort Options */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {['Best Match', 'Top Reviewed', 'Lowest price first', 'Distance', 'Hot deals!'].map((option) => (
              <button
                key={option}
                onClick={() => setSortOption(option)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e6e6e6',
                  borderRadius: '24px',
                  backgroundColor: sortOption === option ? '#222' : 'white',
                  color: sortOption === option ? 'white' : '#222',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {option}
                {(option === 'Top Reviewed' || option === 'Distance') && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Venue Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px',
          }}>
            {venues.map((venue) => (
              <div
                key={venue.id}
                onClick={() => {
                  const params = new URLSearchParams();
                  const whereParam = searchParams.get('where');
                  const occasionParam = searchParams.get('occasion');
                  const whenParam = searchParams.get('when');
                  const guestParam = searchParams.get('guest');
                  const budgetParam = searchParams.get('budget');
                  if (whereParam) params.set('where', whereParam);
                  if (occasionParam) params.set('occasion', occasionParam);
                  if (whenParam) params.set('when', whenParam);
                  if (guestParam) params.set('guest', guestParam);
                  if (budgetParam) params.set('budget', budgetParam);
                  const queryString = params.toString();
                  router.push(`/venue/${venue.id}${queryString ? `?${queryString}` : ''}`);
                }}
                style={{
                  cursor: 'pointer',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #e6e6e6',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Image */}
                <div style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: '#f6f7f8' }}>
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundImage: `url(${venue.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  {/* Heart Icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(venue);
                    }}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={isFavorite(venue.id) ? '#ff385c' : 'none'}
                      stroke={isFavorite(venue.id) ? '#ff385c' : '#222'}
                      strokeWidth="2"
                    >
                      <path d="M12 21s-6-4.35-10-9c-3.33-4 0-11 6-8 3 1 4 3 4 3s1-2 4-3c6-3 9.33 4 6 8-4 4.65-10 9-10 9z" />
                    </svg>
                  </button>
                </div>

                {/* Venue Info */}
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '8px' }}>
                    {venue.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                    {venue.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#222' }}>
                      ★ Insert Rating
                    </span>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#222' }}>
                    {venue.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Map */}
        <div style={{ width: '50%', position: 'relative', borderLeft: '1px solid #e6e6e6' }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d385396.3210451301!2d120.8772136!3d10.3156992!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33b999258d9f8d0d%3A0x4c3403c8926fd13b!2sCebu%20City%2C%20Cebu!5e0!3m2!1sen!2sph!4v1234567890123!5m2!1sen!2sph"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </main>
    </div>
  );
}

