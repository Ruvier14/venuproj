"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { signIn } from "next-auth/react";

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
  const [activeField, setActiveField] = useState<string | null>(null);
  const [searchHovered, setSearchHovered] = useState(false);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [carouselPositions, setCarouselPositions] = useState<Record<string, number>>({});
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+63");
  const [countryCodeOpen, setCountryCodeOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [budgetType, setBudgetType] = useState<"per head" | "whole event">("per head");
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const searchbarRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const countryCodeRef = useRef<HTMLDivElement>(null);
  const carouselRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const authModalRef = useRef<HTMLDivElement>(null);

  const countryCodes = [
    { code: "+63", country: "Philippines" },
    { code: "+1", country: "United States" },
    { code: "+44", country: "United Kingdom" },
    { code: "+61", country: "Australia" },
    { code: "+65", country: "Singapore" },
  ];

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
        setLanguageOpen(false);
      }
      if (
        countryCodeOpen &&
        countryCodeRef.current &&
        !countryCodeRef.current.contains(event.target as Node)
      ) {
        setCountryCodeOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [burgerOpen, languageOpen, countryCodeOpen]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setBurgerOpen(false);
        setLanguageOpen(false);
        setAuthModalOpen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (authModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [authModalOpen]);

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

  return (
    <div className="page-shell">
      <header className="header">
        
        <div className="left-section">
          <button className="logo-mark" type="button" aria-label="Venu home">
            <img src="/venu-logo.png" alt="Venu Logo" className="logo-icon" />
          </button>
        </div>

        <div className="middle-section">
          <button className="event-button" type="button">
            <img src="/event-icon.png" alt="Events" className="event-icon-img" />
            <div className="event">EVENTS</div>
          </button>
        </div>

        <div className="right-section">
          <button className="list-your-place" type="button">
            List your place
          </button>
          <button className="currency" type="button">
            PHP
          </button>
          <button 
            className="sign-in" 
            type="button"
            onClick={() => {
              setAuthModalOpen(true);
              setLanguageOpen(false);
            }}
          >
            Sign-in
          </button>
          <button 
            className="create-account" 
            type="button"
            onClick={() => {
              setAuthModalOpen(true);
              setLanguageOpen(false);
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
            <div
              className={`language-popup ${languageOpen ? "open" : ""}`}
              role="menu"
              aria-hidden={!languageOpen}
            >
              <div className="popup-menu">
                <button className="menu-item" type="button">
                  English
                </button>
              </div>
            </div>
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
                <div className="menu-top">
                  <button className="menu-item" type="button">
                    Help Center
                  </button>
                  <button className="menu-item" type="button">
                    Favorites
                  </button>
                </div>
                <div className="menu-divider" role="separator" aria-hidden="true" />
                <div className="menu-auth">
                  <button 
                    className="popup-signin" 
                    type="button"
                    onClick={() => {
                      setAuthModalOpen(true);
                      setBurgerOpen(false);
                      setLanguageOpen(false);
                    }}
                  >
                    Sign in
                  </button>
                  <button 
                    className="popup-create" 
                    type="button"
                    onClick={() => {
                      setAuthModalOpen(true);
                      setBurgerOpen(false);
                      setLanguageOpen(false);
                    }}
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="venu-motto">
          <p>Plan less, celebrate more</p>
        </div>

        <div
          className={`searchbar ${searchHovered ? "hovered" : ""}`}
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
          <button className="search-button" type="button" aria-label="Search venues">
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
                  <div className="event-preview" key={venue.id}>
                    <div className="thumb-wrapper">
                      <div className="thumbnail" aria-hidden="true" />
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
              <h1 className="modal-welcome">Welcome to Venu</h1>
              
              <div className="phone-section">
                <div className="phone-input-wrapper">
                  <div className="country-code-wrapper" ref={countryCodeRef}>
                    <button
                      className="country-code-button"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCountryCodeOpen(!countryCodeOpen);
                      }}
                    >
                      <span>{countryCode}</span>
                      <ChevronDownIcon />
                    </button>
                    {countryCodeOpen && (
                      <div className="country-code-dropdown">
                        {countryCodes.map((item: { code: string; country: string }) => (
                          <button
                            key={item.code}
                            className="country-code-option"
                            type="button"
                            onClick={() => {
                              setCountryCode(item.code);
                              setCountryCodeOpen(false);
                            }}
                          >
                            <span className="country-code-value">{item.code}</span>
                            <span className="country-name">{item.country}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    id="auth-phone"
                    type="tel"
                    className="phone-input"
                    placeholder="Phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <p className="phone-disclaimer">
                  We'll call or text you to confirm your number. Standard message and data rates apply.{" "}
                  <a href="#" className="modal-link">Privacy Policy</a>.
                </p>
                <button 
                  className="continue-button" 
                  type="button"
                  disabled={!phoneNumber.trim()}
                >
                  Continue
                </button>
              </div>
              
              <div className="modal-divider">
                <span>or</span>
              </div>
              
              <div className="social-buttons">
                <button 
                  className="social-button social-google" 
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                >
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </button>
                <button 
                  className="social-button social-apple" 
                  type="button"
                  onClick={() => signIn("apple", { callbackUrl: "/" })}
                >
                  <AppleIcon />
                  <span>Continue with Apple</span>
                </button>
                <button 
                  className="social-button social-email" 
                  type="button"
                  onClick={() => {
                    // Switch to email input mode or handle email sign-in
                    setPhoneNumber("");
                    setEmail("");
                  }}
                >
                  <EmailIcon />
                  <span>Continue with email</span>
                </button>
                <button 
                  className="social-button social-facebook" 
                  type="button"
                  onClick={() => signIn("facebook", { callbackUrl: "/" })}
                >
                  <FacebookIcon />
                  <span>Continue with Facebook</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer>
        <div className="footer-content">
          <p>&copy; {currentYear} Venu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
