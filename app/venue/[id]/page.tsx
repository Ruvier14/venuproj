'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

type SearchField = {
  id: string;
  label: string;
  placeholder: string;
};

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

const LeftArrowIcon = () => (
  <svg
    aria-hidden="true"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#222"
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
    stroke="#222"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const PaperPlaneIcon = () => (
  <svg
    aria-hidden="true"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#222"
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
    aria-hidden="true"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#222"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 21h18" />
    <path d="M5 21V7l8-4v18" />
    <path d="M19 21V11l-6-4" />
    <path d="M9 9v0" />
    <path d="M9 12v0" />
    <path d="M9 15v0" />
    <path d="M9 18v0" />
  </svg>
);

const searchFields: SearchField[] = [
  { id: "where", label: "Where", placeholder: "Search event" },
  { id: "occasion", label: "Occasion", placeholder: "Add occasion" },
  { id: "when", label: "When", placeholder: "Add dates" },
  { id: "guest", label: "Guest", placeholder: "Add pax" },
  { id: "budget", label: "Budget", placeholder: "Add budget" },
];

type Venue = {
  id: string;
  name: string;
  location: string;
  price: string;
  rating: number;
  reviewCount: number;
  image: string;
  amenities: string[];
  guests?: number;
  beds?: number;
  baths?: number;
  type?: string;
  hostName?: string;
  hostInfo?: string;
  description?: string;
};

export default function VenueDetails() {
  const router = useRouter();
  const params = useParams();
  const venueId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [searchHovered, setSearchHovered] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [budgetType, setBudgetType] = useState<"per head" | "whole event">("per head");
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);

  const burgerRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const searchbarRef = useRef<HTMLDivElement>(null);

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

  // Sample images for gallery - 6 images total (1 main + 5 thumbnails)
  const galleryImages = [
    venue?.image || '/api/placeholder/800/600',
    '/api/placeholder/400/300',
    '/api/placeholder/400/300',
    '/api/placeholder/400/300',
    '/api/placeholder/400/300',
    '/api/placeholder/400/300',
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchbarRef.current && !searchbarRef.current.contains(event.target as Node)) {
        setActiveField(null);
      }
      if (burgerRef.current && !burgerRef.current.contains(event.target as Node)) {
        setBurgerOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setLanguageOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
        // Load favorites from localStorage
        const savedWishlist = localStorage.getItem(`wishlist_${currentUser.uid}`);
        if (savedWishlist) {
          const wishlistItems: Venue[] = JSON.parse(savedWishlist);
          const uniqueItems = wishlistItems.filter((item, index, self) => 
            index === self.findIndex((t) => t.id === item.id)
          );
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
    // Load venue data from localStorage or use sample data
    if (user) {
      const savedWishlist = localStorage.getItem(`wishlist_${user.uid}`);
      if (savedWishlist) {
        const wishlistItems: Venue[] = JSON.parse(savedWishlist);
        const foundVenue = wishlistItems.find((item) => item.id === venueId);
        if (foundVenue) {
          setVenue({
            ...foundVenue,
            guests: foundVenue.guests || 3,
            beds: foundVenue.beds || 2,
            baths: foundVenue.baths || 1,
            type: foundVenue.type || 'Studio',
          });
          return;
        }
      }
      
      // If not in wishlist, try to get from a venues cache or create sample data
      // For now, create sample venue data based on the ID
      setVenue({
        id: venueId,
        name: 'Insert Event Venue',
        location: 'City Name',
        price: 'Insert Price',
        rating: 0,
        reviewCount: 0,
        image: '/api/placeholder/300/300',
        amenities: ['Indoor', 'Parking', 'Pets Allowed'],
        guests: 3,
        beds: 2,
        baths: 1,
        type: 'Studio',
        hostName: 'Robert',
        hostInfo: 'Superhost • 2 years hosting',
        description: 'Snuggle up in this calm Luxurious, Modern Industrial inspired 27sq.m studio unit at 17th Floor which is located in an understated area in Lapu-Lapu City, that is easily accessible from Mactan Cebu int\'l Airport (13 mins ride), public markets, churches, and 7/11 on site. Luke\'s Ergo Pad is an Ideal options for travelers\' looking for reasonable-priced lodging to visit Cebu. Note: The Guest in Excess of 3 will be using the floor mattress Provided.',
      });
    }
  }, [venueId, user]);

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

  const toggleFavorite = () => {
    if (!user || !venue) return;
    
    const isCurrentlyFavorite = favorites.includes(venue.id);
    const newFavorites = isCurrentlyFavorite
      ? favorites.filter((fav) => fav !== venue.id)
      : [...favorites, venue.id];
    
    // Update localStorage
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
    setFavorites(newFavorites);
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const displayName = user?.displayName || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  if (loading || !venue) {
    return <div>Loading...</div>;
  }

  return (
    <div className="page-shell">
      {/* Header */}
      <header className="header shrink" style={{ minHeight: '80px', paddingTop: '12px', paddingBottom: '12px' }}>
        <div className="left-section">
          <button className="logo-mark" type="button" aria-label="Venu home" onClick={() => router.push('/dashboard')}>
            <img src="/venu-logo.png" alt="Venu Logo" className="logo-icon" />
          </button>
        </div>

        <div className="middle-section" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <div
            className={`searchbar shrunk ${searchHovered ? "hovered" : ""}`}
            ref={searchbarRef}
            onMouseEnter={() => setSearchHovered(true)}
            onMouseLeave={() => setSearchHovered(false)}
            style={{ position: 'relative', top: 'auto', left: 'auto', transform: 'none' }}
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
                            className={`budget-option ${selectedBudget === "₱500 - ₱1,000" ? "selected" : ""}`}
                            type="button"
                            onClick={() => {
                              const input = document.getElementById("search-budget") as HTMLInputElement;
                              if (input) {
                                input.value = "₱500 - ₱1,000";
                              }
                              setSelectedBudget("₱500 - ₱1,000");
                              setActiveField(null);
                            }}
                          >
                            ₱500 - ₱1,000
                          </button>
                          <button
                            className={`budget-option ${selectedBudget === "₱1,000 - ₱2,000" ? "selected" : ""}`}
                            type="button"
                            onClick={() => {
                              const input = document.getElementById("search-budget") as HTMLInputElement;
                              if (input) {
                                input.value = "₱1,000 - ₱2,000";
                              }
                              setSelectedBudget("₱1,000 - ₱2,000");
                              setActiveField(null);
                            }}
                          >
                            ₱1,000 - ₱2,000
                          </button>
                          <button
                            className={`budget-option ${selectedBudget === "₱2,000+" ? "selected" : ""}`}
                            type="button"
                            onClick={() => {
                              const input = document.getElementById("search-budget") as HTMLInputElement;
                              if (input) {
                                input.value = "₱2,000+";
                              }
                              setSelectedBudget("₱2,000+");
                              setActiveField(null);
                            }}
                          >
                            ₱2,000+
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className={`budget-option ${selectedBudget === "₱10,000 - ₱20,000" ? "selected" : ""}`}
                            type="button"
                            onClick={() => {
                              const input = document.getElementById("search-budget") as HTMLInputElement;
                              if (input) {
                                input.value = "₱10,000 - ₱20,000";
                              }
                              setSelectedBudget("₱10,000 - ₱20,000");
                              setActiveField(null);
                            }}
                          >
                            ₱10,000 - ₱20,000
                          </button>
                          <button
                            className={`budget-option ${selectedBudget === "₱20,000 - ₱30,000" ? "selected" : ""}`}
                            type="button"
                            onClick={() => {
                              const input = document.getElementById("search-budget") as HTMLInputElement;
                              if (input) {
                                input.value = "₱20,000 - ₱30,000";
                              }
                              setSelectedBudget("₱20,000 - ₱30,000");
                              setActiveField(null);
                            }}
                          >
                            ₱20,000 - ₱30,000
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
                          {option.description && (
                            <div className="dropdown-option-description">{option.description}</div>
                          )}
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
              onClick={() => {
                const whereInput = document.getElementById('search-where') as HTMLInputElement;
                const occasionInput = document.getElementById('search-occasion') as HTMLInputElement;
                const whenInput = document.getElementById('search-when') as HTMLInputElement;
                const guestInput = document.getElementById('search-guest') as HTMLInputElement;
                const budgetInput = document.getElementById('search-budget') as HTMLInputElement;

                if (!whereInput?.value || !occasionInput?.value || !whenInput?.value || !guestInput?.value || !budgetInput?.value) {
                  alert('Please fill in all search fields before searching.');
                  return;
                }

                const params = new URLSearchParams();
                params.set('where', whereInput.value);
                params.set('occasion', occasionInput.value);
                params.set('when', whenInput.value);
                params.set('guest', guestInput.value);
                params.set('budget', budgetInput.value);

                router.push(`/search?${params.toString()}`);
              }}
            >
              <SearchIcon />
            </button>
          </div>
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

      {/* Main Content */}
      <main style={{ padding: '0', backgroundColor: '#fff', maxWidth: '1760px', margin: '0 auto' }}>
        {/* Title and Actions */}
        <div style={{ padding: '24px 80px', borderBottom: '1px solid #e6e6e6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '600', color: '#222', margin: 0, flex: 1 }}>
              {venue.name}
            </h1>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  border: '1px solid #e6e6e6',
                  borderRadius: '24px',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#222',
                  cursor: 'pointer',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                  <path d="M4 4h16v16H4zM8 8v8M16 8v8" />
                </svg>
                Share
              </button>
              <button
                type="button"
                onClick={toggleFavorite}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  border: '1px solid #e6e6e6',
                  borderRadius: '24px',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#222',
                  cursor: 'pointer',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={isFavorite(venue.id) ? '#ff385c' : 'none'}
                  stroke={isFavorite(venue.id) ? '#ff385c' : '#222'}
                  strokeWidth={isFavorite(venue.id) ? '0' : '2'}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                Saved
              </button>
            </div>
          </div>
        </div>

        {/* Image Gallery - Full Width */}
        <div style={{ width: '100%', marginBottom: '48px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr 1fr', 
            gridTemplateRows: 'repeat(2, 1fr)',
            gap: '8px', 
            borderRadius: '0', 
            overflow: 'hidden',
            width: '100%',
            height: '400px',
          }}>
               {/* Large main image on the left - spans all 2 rows */}
               <div
                 style={{
                   gridColumn: '1',
                   gridRow: '1 / 3',
                   width: '100%',
                   height: '100%',
                   backgroundColor: '#f6f7f8',
                   backgroundImage: `url(${galleryImages[selectedImageIndex]})`,
                   backgroundSize: 'cover',
                   backgroundPosition: 'center',
                   cursor: 'pointer',
                   borderRadius: '0',
                 }}
                 onClick={() => {
                   // Could open full image modal here
                 }}
               />
               
               {/* Top-left thumbnail */}
               <div
                 style={{
                   gridColumn: '2',
                   gridRow: '1',
                   width: '100%',
                   height: '100%',
                   backgroundColor: '#f6f7f8',
                   backgroundImage: `url(${galleryImages[1]})`,
                   backgroundSize: 'cover',
                   backgroundPosition: 'center',
                   cursor: 'pointer',
                 }}
                 onClick={() => setSelectedImageIndex(1)}
               />
               
               {/* Top-right thumbnail */}
               <div
                 style={{
                   gridColumn: '3',
                   gridRow: '1',
                   width: '100%',
                   height: '100%',
                   backgroundColor: '#f6f7f8',
                   backgroundImage: `url(${galleryImages[2]})`,
                   backgroundSize: 'cover',
                   backgroundPosition: 'center',
                   cursor: 'pointer',
                   borderRadius: '0',
                 }}
                 onClick={() => setSelectedImageIndex(2)}
               />
               
               {/* Middle-left thumbnail */}
               <div
                 style={{
                   gridColumn: '2',
                   gridRow: '2',
                   width: '100%',
                   height: '100%',
                   backgroundColor: '#f6f7f8',
                   backgroundImage: `url(${galleryImages[3]})`,
                   backgroundSize: 'cover',
                   backgroundPosition: 'center',
                   cursor: 'pointer',
                 }}
                 onClick={() => setSelectedImageIndex(3)}
               />
               
               {/* Middle-right thumbnail with "Show all photos" overlay */}
               <div
                 style={{
                   gridColumn: '3',
                   gridRow: '2',
                   width: '100%',
                   height: '100%',
                   backgroundColor: '#f6f7f8',
                   backgroundImage: `url(${galleryImages[4]})`,
                   backgroundSize: 'cover',
                   backgroundPosition: 'center',
                   cursor: 'pointer',
                   position: 'relative',
                 }}
                 onClick={() => {
                   // Show all photos
                 }}
               >
                 <div style={{
                   position: 'absolute',
                   inset: 0,
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   backgroundColor: 'rgba(0,0,0,0.4)',
                   color: 'white',
                   fontSize: '14px',
                   fontWeight: '600',
                 }}>
                   Show all photos
                 </div>
               </div>
          </div>
        </div>

        {/* Content Section */}
        <div style={{ display: 'flex', gap: '80px', padding: '0 80px 48px 80px' }}>
          {/* Left Side - Details */}
          <div style={{ flex: 1 }}>
            {/* Listing Summary */}
            <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #e6e6e6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#222' }}>
                  Entire {venue.type || 'rental unit'} in {venue.location}
                </span>
              </div>
              <div style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
                {venue.guests || 3} guests · {venue.type || 'Studio'} · {venue.beds || 2} beds · {venue.baths || 1} bath
              </div>
            </div>

            {/* Hosted by Section */}
            <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #e6e6e6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#e6e6e6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#222',
                }}>
                  {(venue.hostName || 'Host').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>
                    Hosted by {venue.hostName || 'Host'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {venue.hostInfo || 'Superhost • 2 years hosting'}
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities Section */}
            {venue.amenities && venue.amenities.length > 0 && (
              <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #e6e6e6' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#222', marginBottom: '24px' }}>What this place offers</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {venue.amenities.map((amenity, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      <span style={{ fontSize: '16px', color: '#222' }}>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description Section */}
            {venue.description && (
              <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #e6e6e6' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#222', marginBottom: '16px' }}>About this place</h2>
                <div style={{ fontSize: '16px', color: '#222', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {venue.description}
                </div>
              </div>
            )}

            {/* Ratings and Reviews */}
            <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #e6e6e6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '22px', fontWeight: '600', color: '#222' }}>★ {venue.rating || 0}</span>
                </div>
                <span style={{ fontSize: '16px', color: '#666' }}>({venue.reviewCount || 0} reviews)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px', backgroundColor: '#f6f7f8', borderRadius: '12px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff385c">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#222' }}>Guest favorite</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>One of the most loved homes on Venu, according to guests</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Booking Panel */}
          <div style={{ width: '400px', position: 'sticky', top: '100px', height: 'fit-content' }}>
            <div style={{
              border: '1px solid #e6e6e6',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 16px rgba(0,0,0,0.1)',
            }}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '22px', fontWeight: '600', color: '#222' }}>{venue.price}</span>
                  <span style={{ fontSize: '14px', color: '#666' }}>per event</span>
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '8px' }}>Event Date</div>
                <div style={{
                  padding: '12px',
                  border: '1px solid #e6e6e6',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '16px',
                }}>
                  <div style={{ fontSize: '14px', color: '#666' }}>Add date</div>
                </div>
                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginBottom: '8px',
                  }}
                >
                  Reserve
                </button>
                <div style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
                  You won't be charged yet
                </div>
              </div>
              <div style={{ paddingTop: '16px', borderTop: '1px solid #e6e6e6' }}>
                <button
                  type="button"
                  onClick={() => {
                    // Handle report listing
                    alert('Report this listing functionality');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: '#222',
                    fontSize: '14px',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                    <line x1="4" y1="22" x2="4" y2="15" />
                  </svg>
                  Report this listing
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

