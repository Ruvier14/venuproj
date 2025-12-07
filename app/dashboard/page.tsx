'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

type SearchField = {
  id: string;
  label: string;
  placeholder: string;
};

type SectionBlueprint = {
  id: string;
  title: string;
  cardCount: number;
};

type VenueCard = {
  id: string;
  name: string;
  price: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
  amenities?: string[];
};

const searchFields: SearchField[] = [
  { id: "where", label: "Where", placeholder: "Search event" },
  { id: "occasion", label: "Occasion", placeholder: "Add occasion" },
  { id: "when", label: "When", placeholder: "Add dates" },
  { id: "guest", label: "Guest", placeholder: "Add pax" },
  { id: "budget", label: "Budget", placeholder: "Add budget" },
];

const sectionBlueprints: SectionBlueprint[] = [
  {
    id: "popular-cebu",
    title: "Popular Birthday venues in Cebu City >",
    cardCount: 8,
  },
  {
    id: "affordable-anniversary",
    title: "Affordable Anniversary venues near you >",
    cardCount: 8,
  },
  {
    id: "recommended-lapu",
    title: "Recommended venues in Lapu-Lapu City >",
    cardCount: 8,
  },
];

const EventIcon = () => (
  <svg
    aria-hidden="true"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#15a1ff"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <path d="M3 10h18" />
    <path d="M8 2v4" />
    <path d="M16 2v4" />
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

const LeftArrowIcon = () => (
  <svg
    aria-hidden="true"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const RightArrowIcon = () => (
  <svg
    aria-hidden="true"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const PaperPlaneIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#15a1ff"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 2L11 13" />
    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);

const BuildingIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#15a1ff"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12h12" />
    <path d="M6 16h12" />
    <path d="M6 8h12" />
    <path d="M10 2v4" />
    <path d="M14 2v4" />
  </svg>
);

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [searchHovered, setSearchHovered] = useState(false);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [carouselPositions, setCarouselPositions] = useState<Record<string, number>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [budgetType, setBudgetType] = useState<"per head" | "whole event">("per head");
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const searchbarRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const carouselRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const dropdownOptions: Record<string, Array<{ icon: React.ReactNode; title: string; description: string }>> = {
    where: [
      { icon: <PaperPlaneIcon />, title: "Nearby", description: "Event places near you" },
      { icon: <BuildingIcon />, title: "Cebu, Philippines", description: "Event places in Cebu City" },
    ],
    occasion: [
      { icon: <PaperPlaneIcon />, title: "Wedding", description: "Wedding venues" },
      { icon: <BuildingIcon />, title: "Birthday", description: "Birthday party venues" },
      { icon: <PaperPlaneIcon />, title: "Anniversary", description: "Anniversary venues" },
    ],
    when: [
      { icon: <PaperPlaneIcon />, title: "Today", description: "Available today" },
      { icon: <BuildingIcon />, title: "This Week", description: "Available this week" },
      { icon: <PaperPlaneIcon />, title: "This Month", description: "Available this month" },
    ],
    guest: [
      { icon: <PaperPlaneIcon />, title: "1-50 pax (Small)", description: "" },
      { icon: <BuildingIcon />, title: "51-100 pax (Medium)", description: "" },
      { icon: <PaperPlaneIcon />, title: "101-300 pax (Large)", description: "" },
      { icon: <PaperPlaneIcon />, title: "301+ pax (Grand Event)", description: "" },
    ],
  };

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
          const wishlistItems: VenueCard[] = JSON.parse(savedWishlist);
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
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const sectionData = useMemo(() => {
    return sectionBlueprints.map((blueprint) => ({
      ...blueprint,
      venues: Array.from({ length: blueprint.cardCount }, (_, i) => ({
        id: `${blueprint.id}-${i + 1}`,
        name: "Insert Event Venue",
        price: "Insert Price",
        location: "City Name",
        rating: 0,
        reviewCount: 0,
        image: '/api/placeholder/300/300',
        amenities: ['Indoor', 'Parking', 'Pets Allowed'],
      })),
    }));
  }, []);

  const isFavorite = (venueId: string) => favorites.includes(venueId);

  const toggleFavorite = (venue: VenueCard) => {
    setFavorites((prev) => {
      const isCurrentlyFavorite = prev.includes(venue.id);
      const newFavorites = isCurrentlyFavorite
        ? prev.filter((fav) => fav !== venue.id)
        : [...prev, venue.id];
      
      // Save to localStorage with full venue data (including image/thumbnail)
      if (user) {
        const savedWishlist = localStorage.getItem(`wishlist_${user.uid}`);
        let wishlistItems: VenueCard[] = savedWishlist ? JSON.parse(savedWishlist) : [];
        
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

  const scrollCarousel = (sectionId: string, direction: "left" | "right") => {
    const carousel = carouselRefs.current[sectionId];
    if (!carousel) return;

    const scrollAmount = 300;
    const currentScroll = carousel.scrollLeft;
    const newScroll =
      direction === "left"
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;

    carousel.scrollTo({
      left: newScroll,
      behavior: "smooth",
    });
  };

  const handleCarouselScroll = (sectionId: string) => {
    const carousel = carouselRefs.current[sectionId];
    if (!carousel) return;
    setCarouselPositions((prev) => ({
      ...prev,
      [sectionId]: carousel.scrollLeft,
    }));
  };

  const canScrollLeft = (sectionId: string) => {
    const position = carouselPositions[sectionId] || 0;
    return position > 0;
  };

  const canScrollRight = (sectionId: string) => {
    const carousel = carouselRefs.current[sectionId];
    if (!carousel) return false;
    const position = carouselPositions[sectionId] || 0;
    return position < carousel.scrollWidth - carousel.clientWidth - 10;
  };

  // Calendar functions
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

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

  const handleDateClick = (day: number, month: number, year: number) => {
    const date = new Date(year, month, day);
    setSelectedDate(date);
    const input = document.getElementById("search-when") as HTMLInputElement;
    if (input) {
      input.value = `${monthNames[month]} ${day}, ${year}`;
    }
    setActiveField(null);
  };

  const navigateMonth = (direction: "prev" | "next", calendarIndex: number = 0) => {
    if (direction === "prev") {
      if (calendarMonth === 0) {
        setCalendarMonth(11);
        setCalendarYear(calendarYear - 1);
      } else {
        setCalendarMonth(calendarMonth - 1);
      }
    } else {
      if (calendarMonth === 11) {
        setCalendarMonth(0);
        setCalendarYear(calendarYear + 1);
      } else {
        setCalendarMonth(calendarMonth + 1);
      }
    }
  };

  const getNextMonth = () => {
    if (calendarMonth === 11) {
      return { month: 0, year: calendarYear + 1 };
    }
    return { month: calendarMonth + 1, year: calendarYear };
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchbarRef.current &&
        !searchbarRef.current.contains(event.target as Node)
      ) {
        setActiveField(null);
      }
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

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [burgerOpen, languageOpen, activeField]);

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

  const currentYear = new Date().getFullYear();
  const displayName = user.displayName || 'User';

  return (
    <div className="page-shell">
      <header className={`header ${isScrolled ? "shrink" : ""}`}>
        <div className="left-section">
          <button 
            className="logo-mark" 
            type="button" 
            aria-label="Venu home"
            onClick={() => router.push('/')}
          >
            <img src="/venu-logo.png" alt="Venu Logo" className="logo-icon" />
          </button>
        </div>

        <div className="middle-section">
          {!isScrolled && (
            <button className="event-button" type="button">
              <img src="/event-icon.png" alt="Events" className="event-icon-img" />
              <div className="event">EVENTS</div>
            </button>
          )}
        </div>

        <div className="right-section">
          {!isScrolled && (
            <>
              <button 
                className="list-your-place" 
                type="button"
                onClick={() => router.push('/list-your-place')}
              >
                List your place
              </button>
              
            </>
          )}
          {/* Profile Icon - Separate */}
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
              {!profilePhoto && displayName.charAt(0).toUpperCase()}
            </div>
          </button>

          {/* Burger Menu - Separate */}
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
            >
              <BurgerIcon />
            </button>
            <div
              className={`burger-popup ${burgerOpen ? "open" : ""}`}
              role="menu"
              aria-hidden={!burgerOpen}
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
                    <path d="M8 10h.01M12 10h.01M16 10h.01"/>
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>
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
          </div>
        </div>

        {!isScrolled && (
          <div className="venu-motto">
            <p>Plan less, celebrate more</p>
          </div>
        )}

        <div
          className={`searchbar ${searchHovered ? "hovered" : ""} ${isScrolled ? "shrunk" : ""}`}
          ref={searchbarRef}
          onMouseEnter={() => setSearchHovered(true)}
          onMouseLeave={() => setSearchHovered(false)}
        >
          {searchFields.map((field) => (
            <div
              key={field.id}
              className={`field-wrapper ${
                activeField && activeField !== field.id ? "dimmed" : ""
              }`}
            >
              <div
                className={`field ${
                  activeField === field.id ? "active" : ""
                }`}
              >
                <label htmlFor={`search-${field.id}`}>{field.label}</label>
                <input
                  id={`search-${field.id}`}
                  type="text"
                  placeholder={field.placeholder}
                  onFocus={() => setActiveField(field.id)}
                  onClick={() => setActiveField(field.id)}
                />
              </div>
              {activeField === field.id && field.id === "when" && (
                <div className="calendar-dropdown">
                  <div className="calendar-title">When is your event?</div>
                  <div className="calendar-container">
                    {/* First Calendar */}
                    <div className="calendar-month">
                      <div className="calendar-header">
                        <button
                          className="calendar-nav-button"
                          type="button"
                          onClick={() => navigateMonth("prev", 0)}
                          aria-label="Previous month"
                        >
                          <LeftArrowIcon />
                        </button>
                        <div className="calendar-month-name">
                          {monthNames[calendarMonth]} {calendarYear}
                        </div>
                        <button
                          className="calendar-nav-button"
                          type="button"
                          onClick={() => navigateMonth("next", 0)}
                          aria-label="Next month"
                        >
                          <RightArrowIcon />
                        </button>
                      </div>
                      <div className="calendar-grid">
                        <div className="calendar-weekdays">
                          {dayNames.map((day, index) => (
                            <div key={index} className="calendar-weekday">
                              {day}
                            </div>
                          ))}
                        </div>
                        <div className="calendar-days">
                          {renderCalendar(calendarMonth, calendarYear).map((day, index) => (
                            <button
                              key={index}
                              className={`calendar-day ${day === null ? "empty" : ""} ${
                                selectedDate &&
                                day !== null &&
                                selectedDate.getDate() === day &&
                                selectedDate.getMonth() === calendarMonth &&
                                selectedDate.getFullYear() === calendarYear
                                  ? "selected"
                                  : ""
                              }`}
                              type="button"
                              disabled={day === null}
                              onClick={() => day !== null && handleDateClick(day, calendarMonth, calendarYear)}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Second Calendar */}
                    <div className="calendar-month">
                      <div className="calendar-header">
                        <button
                          className="calendar-nav-button"
                          type="button"
                          onClick={() => navigateMonth("prev", 1)}
                          aria-label="Previous month"
                        >
                          <LeftArrowIcon />
                        </button>
                        <div className="calendar-month-name">
                          {(() => {
                            const next = getNextMonth();
                            return `${monthNames[next.month]} ${next.year}`;
                          })()}
                        </div>
                        <button
                          className="calendar-nav-button"
                          type="button"
                          onClick={() => navigateMonth("next", 1)}
                          aria-label="Next month"
                        >
                          <RightArrowIcon />
                        </button>
                      </div>
                      <div className="calendar-grid">
                        <div className="calendar-weekdays">
                          {dayNames.map((day, index) => (
                            <div key={index} className="calendar-weekday">
                              {day}
                            </div>
                          ))}
                        </div>
                        <div className="calendar-days">
                          {(() => {
                            const next = getNextMonth();
                            return renderCalendar(next.month, next.year).map((day, index) => (
                              <button
                                key={index}
                                className={`calendar-day ${day === null ? "empty" : ""} ${
                                  selectedDate &&
                                  day !== null &&
                                  selectedDate.getDate() === day &&
                                  selectedDate.getMonth() === next.month &&
                                  selectedDate.getFullYear() === next.year
                                    ? "selected"
                                    : ""
                                }`}
                                type="button"
                                disabled={day === null}
                                onClick={() => day !== null && handleDateClick(day, next.month, next.year)}
                              >
                                {day}
                              </button>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeField === field.id && field.id === "guest" && dropdownOptions[field.id] && (
                <div className="guest-dropdown">
                  <div className="guest-dropdown-title">Number of Guests:</div>
                  {dropdownOptions[field.id].map((option, index) => (
                    <button
                      key={index}
                      className="guest-option"
                      type="button"
                      onClick={() => {
                        const input = document.getElementById(`search-${field.id}`) as HTMLInputElement;
                        if (input) {
                          input.value = option.title;
                        }
                        setActiveField(null);
                      }}
                    >
                      {option.title}
                    </button>
                  ))}
                </div>
              )}
              {activeField === field.id && field.id === "budget" && (
                <div className="budget-dropdown">
                  <div className="budget-toggle">
                    <button
                      className={`budget-toggle-button ${budgetType === "per head" ? "active" : ""}`}
                      type="button"
                      onClick={() => {
                        setBudgetType("per head");
                        setSelectedBudget(null);
                      }}
                    >
                      per head
                    </button>
                    <button
                      className={`budget-toggle-button ${budgetType === "whole event" ? "active" : ""}`}
                      type="button"
                      onClick={() => {
                        setBudgetType("whole event");
                        setSelectedBudget(null);
                      }}
                    >
                      Whole event
                    </button>
                  </div>
                  <div className="budget-options">
                    {budgetType === "per head" ? (
                      <>
                        <button
                          className={`budget-option ${selectedBudget === "₱300 - ₱500" ? "selected" : ""}`}
                          type="button"
                          onClick={() => {
                            const input = document.getElementById("search-budget") as HTMLInputElement;
                            if (input) {
                              input.value = "₱300 - ₱500";
                            }
                            setSelectedBudget("₱300 - ₱500");
                            setActiveField(null);
                          }}
                        >
                          ₱300 - ₱500
                        </button>
                        <button
                          className={`budget-option ${selectedBudget === "₱500 - ₱1000" ? "selected" : ""}`}
                          type="button"
                          onClick={() => {
                            const input = document.getElementById("search-budget") as HTMLInputElement;
                            if (input) {
                              input.value = "₱500 - ₱1000";
                            }
                            setSelectedBudget("₱500 - ₱1000");
                            setActiveField(null);
                          }}
                        >
                          ₱500 - ₱1000
                        </button>
                        <button
                          className={`budget-option ${selectedBudget === "₱1000+" ? "selected" : ""}`}
                          type="button"
                          onClick={() => {
                            const input = document.getElementById("search-budget") as HTMLInputElement;
                            if (input) {
                              input.value = "₱1000+";
                            }
                            setSelectedBudget("₱1000+");
                            setActiveField(null);
                          }}
                        >
                          ₱1000+
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className={`budget-option ${selectedBudget === "₱10,000 - ₱30,000" ? "selected" : ""}`}
                          type="button"
                          onClick={() => {
                            const input = document.getElementById("search-budget") as HTMLInputElement;
                            if (input) {
                              input.value = "₱10,000 - ₱30,000";
                            }
                            setSelectedBudget("₱10,000 - ₱30,000");
                            setActiveField(null);
                          }}
                        >
                          ₱10,000 - ₱30,000
                        </button>
                        <button
                          className={`budget-option ${selectedBudget === "₱30,000 - ₱60,000" ? "selected" : ""}`}
                          type="button"
                          onClick={() => {
                            const input = document.getElementById("search-budget") as HTMLInputElement;
                            if (input) {
                              input.value = "₱30,000 - ₱60,000";
                            }
                            setSelectedBudget("₱30,000 - ₱60,000");
                            setActiveField(null);
                          }}
                        >
                          ₱30,000 - ₱60,000
                        </button>
                        <button
                          className={`budget-option ${selectedBudget === "₱60,000 - ₱100,000" ? "selected" : ""}`}
                          type="button"
                          onClick={() => {
                            const input = document.getElementById("search-budget") as HTMLInputElement;
                            if (input) {
                              input.value = "₱60,000 - ₱100,000";
                            }
                            setSelectedBudget("₱60,000 - ₱100,000");
                            setActiveField(null);
                          }}
                        >
                          ₱60,000 - ₱100,000
                        </button>
                        <button
                          className={`budget-option ${selectedBudget === "₱100,000+" ? "selected" : ""}`}
                          type="button"
                          onClick={() => {
                            const input = document.getElementById("search-budget") as HTMLInputElement;
                            if (input) {
                              input.value = "₱100,000+";
                            }
                            setSelectedBudget("₱100,000+");
                            setActiveField(null);
                          }}
                        >
                          ₱100,000+
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
              {activeField === field.id && field.id !== "when" && field.id !== "guest" && field.id !== "budget" && dropdownOptions[field.id] && (
                <div className="field-dropdown">
                  <div className="dropdown-title">Suggested Events</div>
                  {dropdownOptions[field.id].map((option, index) => (
                    <button
                      key={index}
                      className="dropdown-option"
                      type="button"
                      onClick={() => {
                        const input = document.getElementById(`search-${field.id}`) as HTMLInputElement;
                        if (input) {
                          input.value = option.title;
                        }
                        setActiveField(null);
                      }}
                    >
                      <div className="dropdown-icon">{option.icon}</div>
                      <div className="dropdown-content">
                        <div className="dropdown-option-title">{option.title}</div>
                        <div className="dropdown-option-description">{option.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button 
            className="search-button" 
            type="button" 
            aria-label="Search venues"
            onClick={() => {
              // Get search values from inputs
              const whereInput = document.getElementById('search-where') as HTMLInputElement;
              const occasionInput = document.getElementById('search-occasion') as HTMLInputElement;
              const whenInput = document.getElementById('search-when') as HTMLInputElement;
              const guestInput = document.getElementById('search-guest') as HTMLInputElement;
              const budgetInput = document.getElementById('search-budget') as HTMLInputElement;
              
              // Check if all fields are filled
              const whereValue = whereInput?.value?.trim() || '';
              const occasionValue = occasionInput?.value?.trim() || '';
              const whenValue = whenInput?.value?.trim() || '';
              const guestValue = guestInput?.value?.trim() || '';
              const budgetValue = budgetInput?.value?.trim() || '';
              
              if (!whereValue || !occasionValue || !whenValue || !guestValue || !budgetValue) {
                // Show error or alert if fields are not filled
                alert('Please fill in all search fields before searching.');
                return;
              }
              
              const params = new URLSearchParams();
              params.set('where', whereValue);
              params.set('occasion', occasionValue);
              params.set('when', whenValue);
              params.set('guest', guestValue);
              params.set('budget', budgetValue);
              
              router.push(`/search?${params.toString()}`);
            }}
          >
            <SearchIcon />
          </button>
        </div>
      </header>

      <main className="content">
        {sectionData.map((section) => (
          <section key={section.id} className="venue-section">
            <div className="section-header">
              <h2 className="venue-suggest">{section.title}</h2>
              <div className="carousel-controls">
                <button
                  className={`carousel-button carousel-button-left ${
                    !canScrollLeft(section.id) ? "disabled" : ""
                  }`}
                  type="button"
                  aria-label="Scroll left"
                  onClick={() => scrollCarousel(section.id, "left")}
                  disabled={!canScrollLeft(section.id)}
                >
                  <LeftArrowIcon />
                </button>
                <button
                  className={`carousel-button carousel-button-right ${
                    !canScrollRight(section.id) ? "disabled" : ""
                  }`}
                  type="button"
                  aria-label="Scroll right"
                  onClick={() => scrollCarousel(section.id, "right")}
                  disabled={!canScrollRight(section.id)}
                >
                  <RightArrowIcon />
                </button>
              </div>
            </div>
            <div className="carousel-container">
              <div
                className="event-carousel"
                ref={(el) => {
                  carouselRefs.current[section.id] = el;
                }}
                onScroll={() => handleCarouselScroll(section.id)}
              >
                {section.venues.map((venue: VenueCard) => (
                  <div 
                    className="event-preview" 
                    key={venue.id}
                    onClick={() => router.push(`/venue/${venue.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="thumb-wrapper">
                      <div 
                        className="thumbnail" 
                        aria-hidden="true"
                        style={{
                          backgroundImage: venue.image ? `url(${venue.image})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                      <button
                        className={`favorite-button ${isFavorite(venue.id) ? "active" : ""}`}
                        type="button"
                        aria-pressed={isFavorite(venue.id)}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleFavorite(venue);
                        }}
                      >
                        <div className="circle" aria-hidden="true" />
                        <svg className="heart" viewBox="0 0 24 24">
                          <path d="M12 21s-6-4.35-10-9c-3.33-4 0-11 6-8 3 1 4 3 4 3s1-2 4-3c6-3 9.33 4 6 8-4 4.65-10 9-10 9z" />
                        </svg>
                      </button>
                      <p className="insert-venue">{venue.name}</p>
                      <p className="insert-price">{venue.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </main>

      <footer style={{
        backgroundColor: '#f5f5f5',
        padding: '60px 80px 40px 80px',
        marginTop: '80px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '40px',
          marginBottom: '40px',
        }}>
          {/* Support Column */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#222',
              marginBottom: '20px',
            }}>Support</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Help center</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>FAQs</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Report</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Service Guarantee</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'underline' }}>Privacy Policy</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'underline' }}>Cookie Policy</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Terms & Conditions</a>
              </li>
            </ul>
          </div>

          {/* Contact Us Column */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#222',
              marginBottom: '20px',
            }}>Contact Us</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Customer Support</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Service Guarantee</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>More Service Info</a>
              </li>
            </ul>
          </div>

          {/* About Column */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#222',
              marginBottom: '20px',
            }}>About</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>About Venu</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Careers</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>News</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Content Guidelines and Reporting</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Accessibility Statement</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>About Venu Group</a>
              </li>
            </ul>
          </div>

          {/* Other Services Column */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#222',
              marginBottom: '20px',
            }}>Other Services</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Investor Relations</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Venu Rewards</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Affiliate Program</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Security</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Advertise on Venu</a>
              </li>
            </ul>
          </div>

          {/* Get the app Column */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#222',
              marginBottom: '20px',
            }}>Get the app</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>iOS app</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Android app</a>
              </li>
            </ul>
          </div>

          {/* Payment Methods Column */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#222',
              marginBottom: '20px',
            }}>Payment Methods</h3>
            <div style={{ marginTop: '40px', textAlign: 'right' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#222', marginBottom: '20px' }}>Our Partners</div>
            </div>
          </div>
        </div>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '20px 80px',
          textAlign: 'center',
          borderTop: '1px solid #e6e6e6',
        }}>
          <p style={{
            color: '#666',
            fontSize: '14px',
            margin: 0,
          }}>&copy; {currentYear} Venu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
