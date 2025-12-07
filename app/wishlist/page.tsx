'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
};

export default function Wishlist() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<Venue[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

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
          <button className="logo-mark" type="button" aria-label="Venu home" onClick={() => router.push('/dashboard')}>
            <img src="/venu-logo.png" alt="Venu Logo" className="logo-icon" />
          </button>
        </div>

        <div className="right-section" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
          <button
            type="button"
            onClick={() => router.push('/list-your-place')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#222',
              fontWeight: '500',
              padding: '8px 12px',
            }}
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
                  <button className="menu-item" type="button" onClick={() => router.push('/wishlist')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#222' }}>
                    Wishlist
                  </button>
                  <button className="menu-item" type="button" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#222' }}>
                    My Events
                  </button>
                  <button className="menu-item" type="button" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#222' }}>
                    Messages
                  </button>
                  <button className="menu-item" type="button" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#222' }}>
                    Reviews
                  </button>
                  <button className="menu-item" type="button" onClick={() => router.push('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#222' }}>
                    Profile
                  </button>
                  <button className="menu-item" type="button" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#222' }}>
                    Account Settings
                  </button>
                  <button className="menu-item" type="button" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#222' }}>
                    <LanguageIcon />
                    Language & Currency
                  </button>
                  <button className="menu-item" type="button" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#222' }}>
                    Help Center
                  </button>
                  <div style={{ height: '1px', background: '#e6e6e6', margin: '8px 0' }} />
                  <button className="menu-item" type="button" onClick={async () => { const { signOut } = await import('firebase/auth'); await signOut(auth); router.push('/'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#222' }}>
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
              style={{
                padding: '8px 16px',
                border: '1px solid #e6e6e6',
                borderRadius: '24px',
                backgroundColor: 'white',
                fontSize: '14px',
                fontWeight: '500',
                color: '#222',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                <path d="M4 4h16v16H4zM8 8v8M16 8v8" />
              </svg>
              Share
            </button>
          </div>
        </div>

        {/* Venue Cards Grid */}
        {wishlistItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#666' }}>
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>Your wishlist is empty</p>
            <p style={{ fontSize: '14px' }}>Start adding venues to your wishlist by clicking the heart icon</p>
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
    </div>
  );
}

