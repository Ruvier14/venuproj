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

const ChevronDownIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export default function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [sortBy, setSortBy] = useState('best-match');
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hasListings, setHasListings] = useState(false);
  
  // Filter states
  const [amenities, setAmenities] = useState({
    'air-conditioning': false,
    outdoor: false,
    indoor: false,
  });
  const [facilities, setFacilities] = useState({
    parking: false,
    wheelchairAccessible: false,
    petsAllowed: false,
    mealsIncluded: false,
  });
  const [ratings, setRatings] = useState({
    oneStar: false,
    twoStar: false,
    threeStar: false,
    fourStar: false,
    fiveStar: false,
  });

  const burgerRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);

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
        // Load favorites from localStorage
        const savedWishlist = localStorage.getItem(`wishlist_${currentUser.uid}`);
        if (savedWishlist) {
          const wishlistItems: typeof venues = JSON.parse(savedWishlist);
          // Remove duplicates based on id
          const uniqueItems = wishlistItems.filter((item, index, self) => 
            index === self.findIndex((t) => t.id === item.id)
          );
          // Update localStorage with deduplicated items
          if (uniqueItems.length !== wishlistItems.length) {
            localStorage.setItem(`wishlist_${currentUser.uid}`, JSON.stringify(uniqueItems));
          }
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
        setLanguageOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [burgerOpen, languageOpen]);

  // Get search values from URL params
  const whereValue = searchParams.get('where') || 'Events Nearby';
  const occasionValue = searchParams.get('occasion') || 'Wedding';
  const whenValue = searchParams.get('when') || 'Nov 8';
  const guestValue = searchParams.get('guest') || 'Large';
  const budgetValue = searchParams.get('budget') || '100k';

  // Sample venue data
  const venues = [
    {
      id: '1',
      name: 'Insert Event Venue',
      location: 'City Name',
      price: 'Insert Price',
      rating: 0,
      reviewCount: 0,
      image: '/api/placeholder/300/300',
      amenities: ['Indoor', 'Parking', 'Pets Allowed'],
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
    },
  ];

  const toggleFavorite = (venue: typeof venues[0]) => {
    setFavorites((prev) => {
      const isCurrentlyFavorite = prev.includes(venue.id);
      const newFavorites = isCurrentlyFavorite
        ? prev.filter((fav) => fav !== venue.id)
        : [...prev, venue.id];
      
      // Save to localStorage with full venue data
      if (user) {
        const savedWishlist = localStorage.getItem(`wishlist_${user.uid}`);
        let wishlistItems: typeof venues = savedWishlist ? JSON.parse(savedWishlist) : [];
        
        if (isCurrentlyFavorite) {
          wishlistItems = wishlistItems.filter((item) => item.id !== venue.id);
        } else {
          // Check if venue already exists to prevent duplicates
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
            onClick={() => router.push('/dashboard')}
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

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        {/* Left Sidebar - Filters */}
        <aside style={{ width: '280px', padding: '24px', borderRight: '1px solid #e6e6e6', backgroundColor: '#fff', overflowY: 'auto' }}>
          {/* Map Search */}
          <div
            onClick={() => {
              const params = new URLSearchParams();
              const where = searchParams.get('where') || '';
              const occasion = searchParams.get('occasion') || '';
              const when = searchParams.get('when') || '';
              const guest = searchParams.get('guest') || '';
              const budget = searchParams.get('budget') || '';
              
              if (where) params.set('where', where);
              if (occasion) params.set('occasion', occasion);
              if (when) params.set('when', when);
              if (guest) params.set('guest', guest);
              if (budget) params.set('budget', budget);
              
              router.push(`/search/map?${params.toString()}`);
            }}
            style={{
              width: '100%',
              height: '150px',
              borderRadius: '8px',
              marginBottom: '24px',
              overflow: 'hidden',
              border: '1px solid #e6e6e6',
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d385396.3210451301!2d120.8772136!3d10.3156992!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33b999258d9f8d0d%3A0x4c3403c8926fd13b!2sCebu%20City%2C%20Cebu!5e0!3m2!1sen!2sph!4v1234567890123!5m2!1sen!2sph"
              width="100%"
              height="150"
              style={{ border: 0, pointerEvents: 'none' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Text Search */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Text search"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '1px solid #e6e6e6',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Your filters */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#222' }}>Your filters</h3>
            
            {/* Amenities */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#222' }}>Amenities</h4>
              {[
                { key: 'air-conditioning', label: 'Air-Conditioning' },
                { key: 'outdoor', label: 'Outdoor' },
                { key: 'indoor', label: 'Indoor' },
              ].map((amenity) => (
                <label key={amenity.key} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={amenities[amenity.key as keyof typeof amenities]}
                    onChange={(e) => {
                      setAmenities((prev) => ({ ...prev, [amenity.key]: e.target.checked }));
                    }}
                    style={{ marginRight: '8px', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', color: '#222' }}>{amenity.label}</span>
                </label>
              ))}
            </div>

            {/* Facilities */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#222' }}>Facilities</h4>
              {[
                { key: 'parking', label: 'Parking' },
                { key: 'wheelchairAccessible', label: 'Wheelchair Accessible' },
                { key: 'petsAllowed', label: 'Pets Allowed' },
                { key: 'mealsIncluded', label: 'Meals Included' },
              ].map((facility) => (
                <label key={facility.key} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={facilities[facility.key as keyof typeof facilities]}
                    onChange={(e) => {
                      setFacilities((prev) => ({ ...prev, [facility.key]: e.target.checked }));
                    }}
                    style={{ marginRight: '8px', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', color: '#222' }}>{facility.label}</span>
                </label>
              ))}
            </div>

            {/* Property Rating */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#222' }}>Property Rating</h4>
              {[1, 2, 3, 4, 5].map((star) => (
                <label key={star} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={ratings[`${star === 1 ? 'one' : star === 2 ? 'two' : star === 3 ? 'three' : star === 4 ? 'four' : 'five'}Star` as keyof typeof ratings]}
                    onChange={(e) => {
                      const key = `${star === 1 ? 'one' : star === 2 ? 'two' : star === 3 ? 'three' : star === 4 ? 'four' : 'five'}Star` as keyof typeof ratings;
                      setRatings((prev) => ({ ...prev, [key]: e.target.checked }));
                    }}
                    style={{ marginRight: '8px', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', color: '#222' }}>{star} Star{star > 1 ? 's' : ''}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '24px', backgroundColor: '#fff' }}>
          {/* Sort and View Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>Sort by</span>
              {['Best Match', 'Top Reviewed', 'Lowest price first', 'Distance', 'Hot deals!'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSortBy(option.toLowerCase().replace(' ', '-'))}
                  style={{
                    padding: '8px 16px',
                    border: sortBy === option.toLowerCase().replace(' ', '-') ? '2px solid #222' : '1px solid #e6e6e6',
                    borderRadius: '24px',
                    backgroundColor: sortBy === option.toLowerCase().replace(' ', '-') ? '#222' : 'transparent',
                    color: sortBy === option.toLowerCase().replace(' ', '-') ? '#fff' : '#222',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {option}
                  {(option === 'Top Reviewed' || option === 'Distance') && <ChevronDownIcon />}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                style={{
                  padding: '8px 16px',
                  border: viewMode === 'list' ? '2px solid #222' : '1px solid #e6e6e6',
                  borderRadius: '8px',
                  backgroundColor: viewMode === 'list' ? '#222' : 'transparent',
                  color: viewMode === 'list' ? '#fff' : '#222',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                List
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '8px 16px',
                  border: viewMode === 'grid' ? '2px solid #222' : '1px solid #e6e6e6',
                  borderRadius: '8px',
                  backgroundColor: viewMode === 'grid' ? '#222' : 'transparent',
                  color: viewMode === 'grid' ? '#fff' : '#222',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Grid
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '14px', color: '#666' }}>Nearby: 0 event spaces found</p>
          </div>

          {/* Venue Cards */}
          <div
            style={{
              display: viewMode === 'grid' ? 'grid' : 'flex',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'none',
              flexDirection: viewMode === 'list' ? 'column' : 'row',
              gap: '24px',
            }}
          >
            {venues.map((venue) => (
              <div
                key={venue.id}
                style={{
                  display: viewMode === 'list' ? 'flex' : 'block',
                  gap: viewMode === 'list' ? '16px' : '0',
                  cursor: 'pointer',
                  padding: viewMode === 'list' ? '0' : '0',
                }}
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
              >
                <div style={{ position: 'relative', flexShrink: 0, width: viewMode === 'list' ? '200px' : '100%' }}>
                  <div
                    style={{
                      width: '100%',
                      height: viewMode === 'list' ? '200px' : '280px',
                      backgroundColor: '#f6f7f8',
                      borderRadius: '12px',
                      backgroundImage: `url(${venue.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(venue);
                      }}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        border: 'none',
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
                <div style={{ flex: 1, paddingTop: viewMode === 'grid' ? '12px' : '0' }}>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1976d2',
                      marginBottom: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    {venue.name}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>{venue.location}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#222' }}>★ {venue.rating}</span>
                    <span style={{ fontSize: '14px', color: '#666' }}>({venue.reviewCount})</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#222', marginBottom: '8px' }}>{venue.price}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {venue.amenities.map((amenity, idx) => (
                      <span key={idx} style={{ fontSize: '12px', color: '#666' }}>
                        {amenity}{idx < venue.amenities.length - 1 ? ' •' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

