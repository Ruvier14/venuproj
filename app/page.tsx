"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

export default function Home() {
  const [activeField, setActiveField] = useState<string | null>(null);
  const [searchHovered, setSearchHovered] = useState(false);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [carouselPositions, setCarouselPositions] = useState<Record<string, number>>({});
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const searchbarRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const carouselRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const authModalRef = useRef<HTMLDivElement>(null);

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
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [burgerOpen, languageOpen]);

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
            <EventIcon />
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
            onClick={() => setAuthModalOpen(true)}
          >
            Sign-in
          </button>
          <button 
            className="create-account" 
            type="button"
            onClick={() => setAuthModalOpen(true)}
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
              className={`field ${
                activeField && activeField !== field.id ? "dimmed" : ""
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
              <h2 className="modal-title">Sign in or create an account</h2>
              <p className="modal-subtitle">
                Sign up for free or log in to access amazing deals and benefits!
              </p>
              
              <div className="social-buttons">
                <button className="social-button social-google" type="button">
                  <GoogleIcon />
                  <span>Sign in with Google</span>
                </button>
                <button className="social-button social-facebook" type="button">
                  <FacebookIcon />
                  <span>Sign in with Facebook</span>
                </button>
                <button className="social-button social-apple" type="button">
                  <AppleIcon />
                  <span>Sign in with Apple</span>
                </button>
              </div>
              
              <div className="modal-divider">
                <span>or</span>
              </div>
              
              <div className="email-section">
                <label htmlFor="auth-email" className="email-label">Email</label>
                <input
                  id="auth-email"
                  type="email"
                  className="email-input"
                  placeholder="id@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button 
                  className="continue-button" 
                  type="button"
                  disabled={!email.trim()}
                >
                  Continue
                </button>
              </div>
              
              <details className="other-ways">
                <summary>Other ways to sign in</summary>
              </details>
              
              <p className="modal-disclaimer">
                By signing in, I agree to Venu's{" "}
                <a href="#" className="modal-link">Terms of Use</a> and{" "}
                <a href="#" className="modal-link">Privacy Policy</a>.
              </p>
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
