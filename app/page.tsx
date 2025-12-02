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

export default function Home() {
  const [activeField, setActiveField] = useState<string | null>(null);
  const [searchHovered, setSearchHovered] = useState(false);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const searchbarRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);

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
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [burgerOpen]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setBurgerOpen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const isFavorite = (id: string) => favorites.includes(id);
  const currentYear = new Date().getFullYear();

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
          <button className="sign-in" type="button">
            Sign-in
          </button>
          <button className="create-account" type="button">
            Create an Account
          </button>
          <button className="language-button" type="button" aria-label="Change language">
            <LanguageIcon />
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
                  <button className="popup-signin" type="button">
                    Sign in
                  </button>
                  <button className="popup-create" type="button">
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
          <section key={section.id}>
            <h2 className="venue-suggest">{section.title}</h2>
            <div className="event-grid">
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
          </section>
        ))}
      </main>

      <footer>
        <div className="footer-content">
          <p>&copy; {currentYear} Venu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
