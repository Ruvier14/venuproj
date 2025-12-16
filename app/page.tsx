"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import OtpLogin from "./components/OtpLogin";
import FinishSignup from "./components/FinishSignup";
import { User, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { auth } from "@/firebase";

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
  image?: string;
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

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
    <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M18 9c0-4.97-4.03-9-9-9S0 4.03 0 9c0 4.42 3.23 8.08 7.45 8.84v-6.26H5.31V9h2.14V7.02c0-2.12 1.26-3.29 3.19-3.29.92 0 1.89.17 1.89.17v2.08h-1.07c-1.05 0-1.38.65-1.38 1.32V9h2.34l-.37 2.58h-1.97v6.26C14.77 17.08 18 13.42 18 9z" fill="#1877F2"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export default function Home() {
  const router = useRouter();
  const [activeField, setActiveField] = useState<string | null>(null);
  const [searchHovered, setSearchHovered] = useState(false);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [languageClosing, setLanguageClosing] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('Philippines');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedCurrency, setSelectedCurrency] = useState('PHP ₱');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [carouselPositions, setCarouselPositions] = useState<Record<string, number>>({});
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [hostModalOpen, setHostModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [hostPhoneNumber, setHostPhoneNumber] = useState("");
  const [hostCountryCode, setHostCountryCode] = useState("+63");
  const [hostCountryCodeOpen, setHostCountryCodeOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [budgetType, setBudgetType] = useState<"per head" | "whole event">("per head");
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const searchbarRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const hostCountryCodeRef = useRef<HTMLDivElement>(null);
  const carouselRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const authModalRef = useRef<HTMLDivElement>(null);
  const hostModalRef = useRef<HTMLDivElement>(null);

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

  const sectionData = useMemo(
    () =>
      sectionBlueprints.map((section) => ({
        ...section,
        venues: Array.from({ length: section.cardCount }, (_, index) => ({
          id: `${section.id}-${index + 1}`,
          name: "Insert Event Venue",
          price: "Insert Price",
        })),
      })),
    []
  );

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
        closeLanguageModal();
      }
      if (
        hostCountryCodeOpen &&
        hostCountryCodeRef.current &&
        !hostCountryCodeRef.current.contains(event.target as Node)
      ) {
        setHostCountryCodeOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [burgerOpen, languageOpen, hostCountryCodeOpen, closeLanguageModal]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setBurgerOpen(false);
        setLanguageOpen(false);
        setAuthModalOpen(false);
        setHostModalOpen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    // Prevent body scroll when modal is open without causing layout shift
    if (authModalOpen || hostModalOpen) {
      // Calculate scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      // Prevent scroll and compensate for scrollbar to prevent layout shift
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [authModalOpen, hostModalOpen]);

  useEffect(() => {
    // Handle header shrink on scroll with transition lock to prevent feedback loops
    let timeoutId: NodeJS.Timeout | null = null;
    let isTransitioning = false; // Lock flag to prevent state changes during CSS transitions
    let currentIsScrolled = false; // Track state with ref to avoid unnecessary updates
    const SHRINK_THRESHOLD = 150; // Scroll down past 150px to shrink
    const EXPAND_THRESHOLD = 80; // Scroll up past 80px to expand (wider gap prevents flickering)
    const DEBOUNCE_DELAY = 50; // Debounce delay to prevent rapid toggling
    const TRANSITION_DURATION = 250; // Slightly longer than CSS transition (200ms) to ensure it completes
    
    const handleScroll = () => {
      // Close burger menu on scroll
      if (burgerOpen) {
        setBurgerOpen(false);
        setLanguageOpen(false);
      }
      
      // Block all scroll events during transition to prevent feedback loop
      if (isTransitioning) {
        return;
      }
      
      // Clear any pending timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Debounce the scroll handler
      timeoutId = setTimeout(() => {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        
        // Determine what the state should be
        const shouldBeScrolled = scrollPosition > SHRINK_THRESHOLD;
        const shouldBeExpanded = scrollPosition < EXPAND_THRESHOLD;
        
        // Only update if state actually needs to change
        if (shouldBeScrolled && !currentIsScrolled) {
          isTransitioning = true; // Lock during transition
          currentIsScrolled = true;
          setIsScrolled(true);
          // Unlock after transition completes
          setTimeout(() => {
            isTransitioning = false;
          }, TRANSITION_DURATION);
        } else if (shouldBeExpanded && currentIsScrolled) {
          isTransitioning = true; // Lock during transition
          currentIsScrolled = false;
          setIsScrolled(false);
          // Unlock after transition completes
          setTimeout(() => {
            isTransitioning = false;
          }, TRANSITION_DURATION);
        }
      }, DEBOUNCE_DELAY);
    };

    // Check initial scroll position
    const initialScrollPosition = window.scrollY || document.documentElement.scrollTop;
    currentIsScrolled = initialScrollPosition > SHRINK_THRESHOLD;
    setIsScrolled(currentIsScrolled);
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [burgerOpen]);

  useEffect(() => {
    // Initialize carousel positions and check scrollability
    const updateCarouselStates = () => {
      sectionData.forEach((section) => {
        const carousel = carouselRefs.current[section.id];
        if (carousel) {
          setCarouselPositions((prev) => ({
            ...prev,
            [section.id]: carousel.scrollLeft,
          }));
        }
      });
    };

    // Initial update after render
    const timeoutId = setTimeout(updateCarouselStates, 100);

    // Update on window resize
    window.addEventListener("resize", updateCarouselStates);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateCarouselStates);
    };
  }, [sectionData]);

  const toggleFavorite = (id: string) => {
    // Open auth modal instead of toggling favorite
    setAuthModalOpen(true);
  };

  const isFavorite = (id: string) => favorites.includes(id);
  const currentYear = new Date().getFullYear();

  const scrollCarousel = (sectionId: string, direction: "left" | "right") => {
    const carousel = carouselRefs.current[sectionId];
    if (!carousel) return;

    const cardWidth = 202; // 180px card + 22px gap
    const scrollAmount = cardWidth * 3; // Scroll 3 cards at a time
    const currentPosition = carouselPositions[sectionId] || 0;
    
    let newPosition: number;
    if (direction === "right") {
      newPosition = currentPosition + scrollAmount;
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      newPosition = Math.min(newPosition, maxScroll);
    } else {
      newPosition = currentPosition - scrollAmount;
      newPosition = Math.max(newPosition, 0);
    }

    carousel.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });

    setCarouselPositions((prev) => ({
      ...prev,
      [sectionId]: newPosition,
    }));
  };

  const handleCarouselScroll = (sectionId: string) => {
    const carousel = carouselRefs.current[sectionId];
    if (carousel) {
      setCarouselPositions((prev) => ({
        ...prev,
        [sectionId]: carousel.scrollLeft,
      }));
    }
  };

  const canScrollLeft = (sectionId: string) => {
    return (carouselPositions[sectionId] || 0) > 0;
  };

  const canScrollRight = (sectionId: string) => {
    const carousel = carouselRefs.current[sectionId];
    if (!carousel) return false;
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    return (carouselPositions[sectionId] || 0) < maxScroll - 10;
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

  const isPastDate = (day: number, month: number, year: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(year, month, day);
    return date < today;
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

  const [showFinishSignup, setShowFinishSignup] = useState(false);
  const [signedInUser, setSignedInUser] = useState<User | null>(null);

  const handleOtpSuccess = (user: User) => {
    setAuthModalOpen(false);
    
    // Check if user has completed signup by checking if they have a displayName
    // displayName is set during the finish signup process
    // If they have displayName, they've completed signup before - redirect to dashboard
    // If no displayName, they're a new user - show finish signup page
    const hasCompletedSignup = user.displayName && user.displayName.trim().length > 0;
    
    if (hasCompletedSignup) {
      // Existing user who has completed signup - redirect directly to dashboard
      router.push('/dashboard');
    } else {
      // New user or user who hasn't completed signup - show finish signup page
      setSignedInUser(user);
      setShowFinishSignup(true);
    }
  };

  const handleFinishSignupComplete = () => {
    setShowFinishSignup(false);
    // Redirect to dashboard after completing signup
    router.push('/dashboard');
  };

  return (
    <div className="page-shell">
      <header className={`header ${isScrolled ? "shrink" : ""}`}>
        
        <div className="left-section">
          <button className="logo-mark" type="button" aria-label="Venu home" onClick={() => router.push('/dashboard')}>
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
                onClick={() => {
                  setAuthModalOpen(true);
                  if (languageOpen) {
                    closeLanguageModal();
                  }
                }}
              >
                List your place
              </button>
             
              <button className="currency" type="button">
                {selectedCurrency.split(' ')[0]}
              </button>
            </>
          )}
          <button 
            className="sign-in" 
            type="button"
            onClick={() => {
              setAuthModalOpen(true);
              if (languageOpen) {
                closeLanguageModal();
              }
            }}
          >
            Sign-in
          </button>
          <button 
            className="create-account" 
            type="button"
            onClick={() => {
              setAuthModalOpen(true);
              if (languageOpen) {
                closeLanguageModal();
              }
            }}
          >
            Create an Account
          </button>
          <div className="language-wrapper" ref={languageRef}>
            <button
              className="language-button"
              type="button"
              aria-expanded={languageOpen}
              aria-label={languageOpen ? "Close language menu" : "Open language menu"}
              onClick={(event) => {
                event.stopPropagation();
                setLanguageOpen((prev) => !prev);
                setBurgerOpen(false);
              }}
            >
              <LanguageIcon />
            </button>
          </div>
          <div className="burger-wrapper" ref={burgerRef}>
            <button
              className="burger-button"
              type="button"
              aria-expanded={burgerOpen}
              aria-label={burgerOpen ? "Close menu" : "Open menu"}
              onClick={(event) => {
                event.stopPropagation();
                setBurgerOpen((prev) => !prev);
                if (languageOpen) {
                  closeLanguageModal();
                }
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
                <div className="menu-top">
                  <button className="menu-item" type="button" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#222' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Help Center
                  </button>
                </div>
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
                          {renderCalendar(calendarMonth, calendarYear).map((day, index) => {
                            const isPast = day !== null && isPastDate(day, calendarMonth, calendarYear);
                            return (
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
                                } ${isPast ? "past" : ""}`}
                                type="button"
                                disabled={day === null || isPast}
                                onClick={() => day !== null && !isPast && handleDateClick(day, calendarMonth, calendarYear)}
                              >
                                {day}
                              </button>
                            );
                          })}
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
                            return renderCalendar(next.month, next.year).map((day, index) => {
                              const isPast = day !== null && isPastDate(day, next.month, next.year);
                              return (
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
                                  } ${isPast ? "past" : ""}`}
                                  type="button"
                                  disabled={day === null || isPast}
                                  onClick={() => day !== null && !isPast && handleDateClick(day, next.month, next.year)}
                                >
                                  {day}
                                </button>
                              );
                            });
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
                          toggleFavorite(venue.id);
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

      {authModalOpen && (
        <div className="modal-overlay" onClick={() => setAuthModalOpen(false)}>
          <div 
            className="auth-modal" 
            ref={authModalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Close modal"
              onClick={() => setAuthModalOpen(false)}
            >
              
              <CloseIcon />
            </button>
            
            <div className="modal-content">
              <h2 className="modal-header">Log in or sign up</h2>
              <div className="modal-divider">
              </div>
              <h1 className="modal-welcome">Welcome to Venu</h1>
              
              <OtpLogin onSuccess={handleOtpSuccess} onClose={() => setAuthModalOpen(false)} />
              
              <div className="modal-divider">
                <span>or</span>
              </div>
              
              <div className="social-buttons">
                <button 
                  className="social-button social-google" 
                  type="button"
                  onClick={async () => {
                    try {
                      setAuthModalOpen(false);
                      const provider = new GoogleAuthProvider();
                      const result = await signInWithPopup(auth, provider);
                      const user = result.user;
                      
                      // Check if user has completed signup by checking if they have a displayName
                      // displayName is set during the finish signup process
                      const hasCompletedSignup = user.displayName && user.displayName.trim().length > 0;
                      
                      if (hasCompletedSignup) {
                        // Existing user who has completed signup - redirect directly to dashboard
                        // onAuthStateChanged will fire automatically in all pages
                        router.push('/dashboard');
                      } else {
                        // New user or user who hasn't completed signup - show finish signup page
                        setSignedInUser(user);
                        setShowFinishSignup(true);
                      }
                    } catch (error: any) {
                      console.error('Error signing in with Google:', error);
                      console.error('Error code:', error.code);
                      console.error('Error message:', error.message);
                      
                      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
                        // User closed the popup, don't show error
                        return;
                      }
                      
                      // Show more specific error messages
                      let errorMessage = 'Failed to sign in with Google. Please try again.';
                      
                      if (error.code === 'auth/operation-not-allowed') {
                        errorMessage = 'Google sign-in is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method.';
                      } else if (error.code === 'auth/popup-blocked') {
                        errorMessage = 'Popup was blocked by your browser. Please allow popups for this site and try again.';
                      } else if (error.code === 'auth/unauthorized-domain') {
                        errorMessage = 'This domain is not authorized. Please add localhost to authorized domains in Firebase Console.';
                      } else if (error.message) {
                        errorMessage = `Failed to sign in: ${error.message}`;
                      }
                      
                      alert(errorMessage);
                    }
                  }}
                >
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </button>
                <button 
                  className="social-button social-apple" 
                  type="button"
                  onClick={() => {
                    // Apple sign-in can be implemented later with Firebase Auth
                    alert('Apple sign-in coming soon');
                  }}
                >
                  <AppleIcon />
                  <span>Continue with Apple</span>
                </button>
                <button 
                  className="social-button social-email" 
                  type="button"
                  onClick={() => {
                    // Switch to email input mode or handle email sign-in
                    setEmail("");
                  }}
                >
                  <EmailIcon />
                  <span>Continue with email</span>
                </button>
                <button 
                  className="social-button social-facebook" 
                  type="button"
                  onClick={async () => {
                    try {
                      setAuthModalOpen(false);
                      const provider = new FacebookAuthProvider();
                      const result = await signInWithPopup(auth, provider);
                      const user = result.user;
                      
                      // Check if user has completed signup by checking if they have a displayName
                      // displayName is set during the finish signup process
                      const hasCompletedSignup = user.displayName && user.displayName.trim().length > 0;
                      
                      if (hasCompletedSignup) {
                        // Existing user who has completed signup - redirect directly to dashboard
                        // onAuthStateChanged will fire automatically in all pages
                        router.push('/dashboard');
                      } else {
                        // New user or user who hasn't completed signup - show finish signup page
                        setSignedInUser(user);
                        setShowFinishSignup(true);
                      }
                    } catch (error: any) {
                      console.error('Error signing in with Facebook:', error);
                      console.error('Error code:', error.code);
                      console.error('Error message:', error.message);
                      
                      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
                        // User closed the popup, don't show error
                        return;
                      }
                      
                      // Show more specific error messages
                      let errorMessage = 'Failed to sign in with Facebook. Please try again.';
                      
                      if (error.code === 'auth/operation-not-allowed') {
                        errorMessage = 'Facebook sign-in is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method.';
                      } else if (error.code === 'auth/popup-blocked') {
                        errorMessage = 'Popup was blocked by your browser. Please allow popups for this site and try again.';
                      } else if (error.code === 'auth/unauthorized-domain') {
                        errorMessage = 'This domain is not authorized. Please add localhost to authorized domains in Firebase Console.';
                      } else if (error.message) {
                        errorMessage = `Failed to sign in: ${error.message}`;
                      }
                      
                      alert(errorMessage);
                    }
                  }}
                >
                  <FacebookIcon />
                  <span>Continue with Facebook</span>
                </button>
              </div>
            </div>
          </div>
        </div>
   

      )}

      {showFinishSignup && signedInUser && (
        <FinishSignup
          user={signedInUser}
          onComplete={handleFinishSignupComplete}
          onClose={() => {
            setShowFinishSignup(false);
            setSignedInUser(null);
          }}
        />
      )}

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
