"use client";

import { useEffect, useState, useRef } from "react";

// LocationAutocomplete component using OpenStreetMap Nominatim API
function LocationAutocomplete({
  onSelect,
}: {
  onSelect?: (location: any) => void;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce API calls
    timeoutRef.current = setTimeout(() => {
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          value
        )}&addressdetails=1&limit=5`
      )
        .then((res) => res.json())
        .then((data) => {
          setSuggestions(data);
          setShowSuggestions(true);
        });
    }, 300);
  };

  const handleSuggestionClick = (suggestion: any) => {
    setQuery(suggestion.display_name);
    setShowSuggestions(false);
    if (onSelect) onSelect(suggestion);
  };

  return (
    <div style={{ position: "relative", width: 400, marginBottom: 24 }}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search for a location"
        style={{ width: "100%", padding: 8, fontSize: 16 }}
        onFocus={() => query.length >= 3 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: 36,
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #ccc",
            zIndex: 10,
            listStyle: "none",
            margin: 0,
            padding: 0,
            maxHeight: 200,
            overflowY: "auto",
          }}
        >
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onMouseDown={() => handleSuggestionClick(s)}
              style={{
                padding: 8,
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { auth } from "@/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { WeddingRingsIcon } from "@/app/components/WeddingRingsIcon";

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
  const searchParams = useSearchParams();
  const venueId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [photoGalleryOpen, setPhotoGalleryOpen] = useState(false);
  const [selectedPhotoCategory, setSelectedPhotoCategory] =
    useState<string>("all");
  const [amenitiesModalOpen, setAmenitiesModalOpen] = useState(false);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [searchHovered, setSearchHovered] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookingDateOpen, setBookingDateOpen] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [bookingOccasionOpen, setBookingOccasionOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
  const [bookingGuestOpen, setBookingGuestOpen] = useState(false);
  const [budgetType, setBudgetType] = useState<"per head" | "whole event">(
    "per head"
  );
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [hasListings, setHasListings] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const burgerRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const searchbarRef = useRef<HTMLDivElement>(null);
  const bookingCalendarRef = useRef<HTMLDivElement>(null);
  const bookingOccasionRef = useRef<HTMLDivElement>(null);
  const bookingGuestRef = useRef<HTMLDivElement>(null);

  const dropdownOptions: Record<
    string,
    Array<{ icon: React.ReactNode; title: string; description: string }>
  > = {
    where: [
      {
        icon: <PaperPlaneIcon />,
        title: "Nearby",
        description: "Event places near you",
      },
      {
        icon: <BuildingIcon />,
        title: "Cebu, Philippines",
        description: "Event places in Cebu City",
      },
    ],
    occasion: [
      {
        icon: <WeddingRingsIcon size={24} color="#1976d2" />,
        title: "Wedding",
        description: "Wedding venues",
      },
      {
        icon: <BuildingIcon />,
        title: "Birthday",
        description: "Birthday party venues",
      },
      {
        icon: <PaperPlaneIcon />,
        title: "Anniversary",
        description: "Anniversary venues",
      },
    ],
    when: [
      {
        icon: <PaperPlaneIcon />,
        title: "Today",
        description: "Available today",
      },
      {
        icon: <BuildingIcon />,
        title: "This Week",
        description: "Available this week",
      },
      {
        icon: <PaperPlaneIcon />,
        title: "This Month",
        description: "Available this month",
      },
    ],
    guest: [
      { icon: <PaperPlaneIcon />, title: "1-50 pax (Small)", description: "" },
      { icon: <BuildingIcon />, title: "51-100 pax (Medium)", description: "" },
      {
        icon: <PaperPlaneIcon />,
        title: "101-300 pax (Large)",
        description: "",
      },
      {
        icon: <PaperPlaneIcon />,
        title: "301+ pax (Grand Event)",
        description: "",
      },
    ],
  };

  // Calendar functions
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
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

  const handleDateClick = (
    day: number,
    month: number,
    year: number,
    isBooking: boolean = false
  ) => {
    const date = new Date(year, month, day);
    setSelectedDate(date);

    if (isBooking) {
      // Update booking date display
      const bookingDateElement = document.getElementById(
        "booking-date-display"
      );
      if (bookingDateElement) {
        bookingDateElement.textContent = `${monthNames[month]} ${day}, ${year}`;
      }
      setBookingDateOpen(false);
    } else {
      // Update search bar date
      const input = document.getElementById("search-when") as HTMLInputElement;
      if (input) {
        input.value = `${monthNames[month]} ${day}, ${year}`;
      }
      setActiveField(null);
    }
  };

  const navigateMonth = (
    direction: "prev" | "next",
    calendarIndex: number = 0
  ) => {
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
    venue?.image || "/api/placeholder/800/600",
    "/api/placeholder/400/300",
    "/api/placeholder/400/300",
    "/api/placeholder/400/300",
    "/api/placeholder/400/300",
  ];

  // Photo gallery data with categories
  type PhotoItem = {
    id: string;
    url: string;
    caption: string;
    category: string;
  };

  const photoGallery: PhotoItem[] = [
    {
      id: "1",
      url: venue?.image || "/api/placeholder/800/600",
      caption: venue?.name || "Insert Event Venue",
      category: "exterior",
    },
    {
      id: "2",
      url: "/api/placeholder/400/300",
      caption: "Side Porch",
      category: "outdoor",
    },
    {
      id: "3",
      url: "/api/placeholder/400/300",
      caption: "Front Entrance",
      category: "entrance",
    },
    {
      id: "4",
      url: "/api/placeholder/400/300",
      caption: "Event Space",
      category: "event-space",
    },
    {
      id: "5",
      url: "/api/placeholder/400/300",
      caption: "Lobby Reception",
      category: "lobby",
    },
    {
      id: "6",
      url: "/api/placeholder/400/300",
      caption: "Main Space",
      category: "main-space",
    },
    {
      id: "7",
      url: "/api/placeholder/400/300",
      caption: "Secondary Space",
      category: "secondary-space",
    },
    {
      id: "8",
      url: "/api/placeholder/400/300",
      caption: "Outdoor Area",
      category: "outdoor",
    },
  ];

  const photoCategories = [
    { id: "all", label: "All photos", count: 0 },
    {
      id: "event-space",
      label: "Event space",
      count: photoGallery.filter((p) => p.category === "event-space").length,
    },
    {
      id: "exterior",
      label: "Exterior",
      count: photoGallery.filter((p) => p.category === "exterior").length,
    },
    {
      id: "entrance",
      label: "Entrance",
      count: photoGallery.filter((p) => p.category === "entrance").length,
    },
    {
      id: "lobby",
      label: "Lobby/reception",
      count: photoGallery.filter((p) => p.category === "lobby").length,
    },
    {
      id: "main-space",
      label: "Main space",
      count: photoGallery.filter((p) => p.category === "main-space").length,
    },
    {
      id: "secondary-space",
      label: "Secondary space",
      count: photoGallery.filter((p) => p.category === "secondary-space")
        .length,
    },
    {
      id: "outdoor",
      label: "Outdoor area",
      count: photoGallery.filter((p) => p.category === "outdoor").length,
    },
  ];

  const filteredPhotos =
    selectedPhotoCategory === "all"
      ? photoGallery
      : photoGallery.filter((p) => p.category === selectedPhotoCategory);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchbarRef.current &&
        !searchbarRef.current.contains(event.target as Node)
      ) {
        setActiveField(null);
      }
      if (
        burgerRef.current &&
        !burgerRef.current.contains(event.target as Node)
      ) {
        setBurgerOpen(false);
      }
      if (
        languageRef.current &&
        !languageRef.current.contains(event.target as Node)
      ) {
        setLanguageOpen(false);
      }
      if (
        bookingCalendarRef.current &&
        !bookingCalendarRef.current.contains(event.target as Node)
      ) {
        setBookingDateOpen(false);
      }
      if (
        bookingOccasionRef.current &&
        !bookingOccasionRef.current.contains(event.target as Node)
      ) {
        setBookingOccasionOpen(false);
      }
      if (
        bookingGuestRef.current &&
        !bookingGuestRef.current.contains(event.target as Node)
      ) {
        setBookingGuestOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Get profile photo - prioritize localStorage (most up-to-date), then Firebase
        const savedPhoto = localStorage.getItem(
          `profilePhoto_${currentUser.uid}`
        );
        if (savedPhoto) {
          setProfilePhoto(savedPhoto);
        } else if (currentUser.photoURL) {
          setProfilePhoto(currentUser.photoURL);
        } else {
          setProfilePhoto(null);
        }
        // Load favorites from localStorage
        const savedWishlist = localStorage.getItem(
          `wishlist_${currentUser.uid}`
        );
        if (savedWishlist) {
          const wishlistItems: Venue[] = JSON.parse(savedWishlist);
          const uniqueItems = wishlistItems.filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.id === item.id)
          );
          setFavorites(uniqueItems.map((item) => item.id));
        }
        // Check if user has listings
        const listings = localStorage.getItem(`listings_${currentUser.uid}`);
        const hostListings = localStorage.getItem(
          `hostListings_${currentUser.uid}`
        );
        setHasListings(
          !!(listings && JSON.parse(listings).length > 0) ||
            !!(hostListings && JSON.parse(hostListings).length > 0)
        );
      } else {
        router.push("/");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    // Prevent body scroll when photo gallery modal is open
    if (photoGalleryOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
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
  }, [photoGalleryOpen]);

  useEffect(() => {
    // Prevent body scroll when amenities modal is open
    if (amenitiesModalOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
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
  }, [amenitiesModalOpen]);

  useEffect(() => {
    // Prevent body scroll when reviews modal is open
    if (reviewsModalOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
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
  }, [reviewsModalOpen]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (photoGalleryOpen) {
          setPhotoGalleryOpen(false);
        }
        if (amenitiesModalOpen) {
          setAmenitiesModalOpen(false);
        }
        if (reviewsModalOpen) {
          setReviewsModalOpen(false);
        }
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [photoGalleryOpen, amenitiesModalOpen, reviewsModalOpen]);

  // Sync searchbar inputs from URL params
  useEffect(() => {
    // Populate searchbar inputs from URL params
    const whereParam = searchParams.get("where");
    const occasionParam = searchParams.get("occasion");
    const whenParam = searchParams.get("when");
    const guestParam = searchParams.get("guest");
    const budgetParam = searchParams.get("budget");

    // Use setTimeout to ensure DOM elements are available
    setTimeout(() => {
      const whereInput = document.getElementById(
        "search-where"
      ) as HTMLInputElement;
      const occasionInput = document.getElementById(
        "search-occasion"
      ) as HTMLInputElement;
      const whenInput = document.getElementById(
        "search-when"
      ) as HTMLInputElement;
      const guestInput = document.getElementById(
        "search-guest"
      ) as HTMLInputElement;
      const budgetInput = document.getElementById(
        "search-budget"
      ) as HTMLInputElement;

      if (whereInput && whereParam) {
        whereInput.value = whereParam;
      }
      if (occasionInput && occasionParam) {
        occasionInput.value = occasionParam;
      }
      if (whenInput && whenParam) {
        whenInput.value = whenParam;
      }
      if (guestInput && guestParam) {
        guestInput.value = guestParam;
      }
      if (budgetInput && budgetParam) {
        budgetInput.value = budgetParam;
      }
    }, 100);
  }, [searchParams]);

  // Autofill booking form from search params
  useEffect(() => {
    // Only autofill if values are not already set (allows editing)
    if (!selectedDate) {
      const whenParam = searchParams.get("when");
      if (whenParam) {
        // Try to parse the date - format could be "January 15, 2024"
        let parsedDate: Date | null = null;

        // Try parsing as-is first
        parsedDate = new Date(whenParam);
        if (isNaN(parsedDate.getTime())) {
          // If that fails, try to parse "Month Day, Year" format manually
          const dateMatch = whenParam.match(/(\w+)\s+(\d+),\s+(\d+)/);
          if (dateMatch) {
            const monthName = dateMatch[1];
            const day = parseInt(dateMatch[2]);
            const year = parseInt(dateMatch[3]);
            const monthIndex = monthNames.findIndex(
              (m) => m.toLowerCase() === monthName.toLowerCase()
            );
            if (monthIndex !== -1) {
              parsedDate = new Date(year, monthIndex, day);
            }
          }
        }

        if (parsedDate && !isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate);
          // Also update calendar month/year to show the selected month
          setCalendarMonth(parsedDate.getMonth());
          setCalendarYear(parsedDate.getFullYear());
        }
      }
    }

    if (!selectedOccasion) {
      const occasionParam = searchParams.get("occasion");
      if (occasionParam) {
        // Try to match with one of the occasion options
        const occasionOptions = dropdownOptions.occasion.map(
          (opt) => opt.title
        );
        // Try exact match first
        let matchedOption = occasionOptions.find(
          (opt) => opt === occasionParam
        );
        if (!matchedOption) {
          // Try partial match
          matchedOption = occasionOptions.find(
            (opt) =>
              opt.toLowerCase().includes(occasionParam.toLowerCase()) ||
              occasionParam.toLowerCase().includes(opt.toLowerCase())
          );
        }
        if (matchedOption) {
          setSelectedOccasion(matchedOption);
        } else {
          // If no match, just use the param value as fallback
          setSelectedOccasion(occasionParam);
        }
      }
    }

    if (!selectedGuest) {
      const guestParam = searchParams.get("guest");
      if (guestParam) {
        // Try to match with one of the guest options
        const guestOptions = dropdownOptions.guest.map((opt) => opt.title);
        // Try exact match first
        let matchedOption = guestOptions.find((opt) => opt === guestParam);
        if (!matchedOption) {
          // Try partial match
          matchedOption = guestOptions.find(
            (opt) =>
              opt.toLowerCase().includes(guestParam.toLowerCase()) ||
              guestParam.toLowerCase().includes(opt.toLowerCase().split(" ")[0])
          );
        }
        if (matchedOption) {
          setSelectedGuest(matchedOption);
        } else {
          // If no match, just use the param value as fallback
          setSelectedGuest(guestParam);
        }
      }
    }
  }, [searchParams, selectedDate, selectedOccasion, selectedGuest]);

  // Listen for storage changes to sync profile photo across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (user && e.key === `profilePhoto_${user.uid}` && e.newValue) {
        setProfilePhoto(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user]);

  const loadVenueData = () => {
    if (user) {
      // First, try to load from hostListings (most up-to-date)
      const allHostListings: any[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('hostListings_')) {
          try {
            const listings = JSON.parse(localStorage.getItem(key) || '[]');
            allHostListings.push(...listings);
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
      
      const foundHostListing = allHostListings.find((listing: any) => listing.id === venueId);
      if (foundHostListing) {
        const mainPhoto = foundHostListing.photos?.find((p: any) => p.isMain) || foundHostListing.photos?.[0];
        const locationString = foundHostListing.location 
          ? `${foundHostListing.location.city || ''}${foundHostListing.location.city && foundHostListing.location.state ? ', ' : ''}${foundHostListing.location.state || ''}`
          : 'Location not specified';
        
        setVenue({
          id: foundHostListing.id,
          name: foundHostListing.propertyName || "Insert Event Venue",
          location: locationString,
          price: foundHostListing.pricing?.eventRate ? `₱${parseFloat(foundHostListing.pricing.eventRate).toLocaleString()}` : "Insert Price",
          rating: 0,
          reviewCount: 0,
          image: mainPhoto?.url || "/api/placeholder/300/300",
          amenities: foundHostListing.selectedAmenities || foundHostListing.amenities || ["Indoor", "Parking", "Pets Allowed"],
          guests: foundHostListing.guests || 3,
          beds: foundHostListing.beds || 2,
          baths: foundHostListing.baths || 1,
          type: foundHostListing.propertyType || "Studio",
          hostName: foundHostListing.hostName || "Host Name",
          hostInfo: foundHostListing.hostInfo || "Host • 0 years hosting",
          description: foundHostListing.propertyDescription || "No description available.",
          hostId: foundHostListing.hostId || user.uid,
        });
        return;
      }

      // Then try wishlist
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
            type: foundVenue.type || "Studio",
          });
          return;
        }
      }

      // If not found, create sample venue data
      setVenue({
        id: venueId,
        name: "Insert Event Venue",
        location: "City Name",
        price: "Insert Price",
        rating: 0,
        reviewCount: 0,
        image: "/api/placeholder/300/300",
        amenities: ["Indoor", "Parking", "Pets Allowed"],
        guests: 3,
        beds: 2,
        baths: 1,
        type: "Studio",
        hostName: "Host Name",
        hostInfo: "Host • 0 years hosting",
        description:
          "Snuggle up in this calm Luxurious, Modern Industrial inspired 27sq.m studio unit at 17th Floor which is located in an understated area in Lapu-Lapu City, that is easily accessible from Mactan Cebu int'l Airport (13 mins ride), public markets, churches, and 7/11 on site. Luke's Ergo Pad is an Ideal options for travelers' looking for reasonable-priced lodging to visit Cebu. Note: The Guest in Excess of 3 will be using the floor mattress Provided.",
      });
    }
  };

  useEffect(() => {
    loadVenueData();
  }, [venueId, user]);

  // Listen for storage changes to sync listing updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('hostListings_')) {
        // Reload venue data when hostListings change
        loadVenueData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Also listen for custom storage events (same-tab updates)
    const handleCustomStorageChange = () => {
      loadVenueData();
    };
    
    window.addEventListener('hostListingsUpdated', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener('hostListingsUpdated', handleCustomStorageChange);
    };
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

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
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

  const displayName = user?.displayName || "User";
  const userInitial = displayName.charAt(0).toUpperCase();

  if (loading || !venue) {
    return <div>Loading...</div>;
  }

  // ...existing code...

  return (
    <div className="page-shell">
      {/* Header */}
      <header
        className="header shrink"
        style={{ minHeight: "80px", paddingTop: "12px", paddingBottom: "12px" }}
      >
        <div className="left-section">
          <button
            className="logo-mark"
            type="button"
            aria-label="Venu home"
            onClick={() => router.push("/dashboard")}
          >
            <img src="/venu-logo.png" alt="Venu Logo" className="logo-icon" />
          </button>
        </div>

        <div
          className="middle-section"
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div
            className={`searchbar shrunk ${searchHovered ? "hovered" : ""}`}
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
                    defaultValue={searchParams.get(field.id) || ""}
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
                            {renderCalendar(calendarMonth, calendarYear).map(
                              (day, index) => {
                                const isPast =
                                  day !== null &&
                                  isPastDate(day, calendarMonth, calendarYear);
                                return (
                                  <button
                                    key={index}
                                    className={`calendar-day ${
                                      day === null ? "empty" : ""
                                    } ${
                                      selectedDate &&
                                      day !== null &&
                                      selectedDate.getDate() === day &&
                                      selectedDate.getMonth() ===
                                        calendarMonth &&
                                      selectedDate.getFullYear() ===
                                        calendarYear
                                        ? "selected"
                                        : ""
                                    } ${isPast ? "past" : ""}`}
                                    type="button"
                                    disabled={day === null || isPast}
                                    onClick={() =>
                                      day !== null &&
                                      !isPast &&
                                      handleDateClick(
                                        day,
                                        calendarMonth,
                                        calendarYear
                                      )
                                    }
                                  >
                                    {day}
                                  </button>
                                );
                              }
                            )}
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
                              return renderCalendar(next.month, next.year).map(
                                (day, index) => {
                                  const isPast =
                                    day !== null &&
                                    isPastDate(day, next.month, next.year);
                                  return (
                                    <button
                                      key={index}
                                      className={`calendar-day ${
                                        day === null ? "empty" : ""
                                      } ${
                                        selectedDate &&
                                        day !== null &&
                                        selectedDate.getDate() === day &&
                                        selectedDate.getMonth() ===
                                          next.month &&
                                        selectedDate.getFullYear() === next.year
                                          ? "selected"
                                          : ""
                                      } ${isPast ? "past" : ""}`}
                                      type="button"
                                      disabled={day === null || isPast}
                                      onClick={() =>
                                        day !== null &&
                                        !isPast &&
                                        handleDateClick(
                                          day,
                                          next.month,
                                          next.year
                                        )
                                      }
                                    >
                                      {day}
                                    </button>
                                  );
                                }
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeField === field.id &&
                  field.id === "guest" &&
                  dropdownOptions[field.id] && (
                    <div className="guest-dropdown">
                      <div className="guest-dropdown-title">
                        Number of Guests:
                      </div>
                      {dropdownOptions[field.id].map((option, index) => (
                        <button
                          key={index}
                          className="guest-option"
                          type="button"
                          onClick={() => {
                            const input = document.getElementById(
                              `search-${field.id}`
                            ) as HTMLInputElement;
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
                        className={`budget-toggle-button ${
                          budgetType === "per head" ? "active" : ""
                        }`}
                        type="button"
                        onClick={() => {
                          setBudgetType("per head");
                          setSelectedBudget(null);
                        }}
                      >
                        per head
                      </button>
                      <button
                        className={`budget-toggle-button ${
                          budgetType === "whole event" ? "active" : ""
                        }`}
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
                            className={`budget-option ${
                              selectedBudget === "₱300 - ₱500" ? "selected" : ""
                            }`}
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(
                                "search-budget"
                              ) as HTMLInputElement;
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
                            className={`budget-option ${
                              selectedBudget === "₱500 - ₱1,000"
                                ? "selected"
                                : ""
                            }`}
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(
                                "search-budget"
                              ) as HTMLInputElement;
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
                            className={`budget-option ${
                              selectedBudget === "₱1,000 - ₱2,000"
                                ? "selected"
                                : ""
                            }`}
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(
                                "search-budget"
                              ) as HTMLInputElement;
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
                            className={`budget-option ${
                              selectedBudget === "₱2,000+" ? "selected" : ""
                            }`}
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(
                                "search-budget"
                              ) as HTMLInputElement;
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
                            className={`budget-option ${
                              selectedBudget === "₱10,000 - ₱20,000"
                                ? "selected"
                                : ""
                            }`}
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(
                                "search-budget"
                              ) as HTMLInputElement;
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
                            className={`budget-option ${
                              selectedBudget === "₱20,000 - ₱30,000"
                                ? "selected"
                                : ""
                            }`}
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(
                                "search-budget"
                              ) as HTMLInputElement;
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
                            className={`budget-option ${
                              selectedBudget === "₱30,000 - ₱60,000"
                                ? "selected"
                                : ""
                            }`}
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(
                                "search-budget"
                              ) as HTMLInputElement;
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
                            className={`budget-option ${
                              selectedBudget === "₱60,000 - ₱100,000"
                                ? "selected"
                                : ""
                            }`}
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(
                                "search-budget"
                              ) as HTMLInputElement;
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
                            className={`budget-option ${
                              selectedBudget === "₱100,000+" ? "selected" : ""
                            }`}
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(
                                "search-budget"
                              ) as HTMLInputElement;
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
                {activeField === field.id &&
                  field.id !== "when" &&
                  field.id !== "guest" &&
                  field.id !== "budget" &&
                  dropdownOptions[field.id] && (
                    <div className="field-dropdown">
                      <div className="dropdown-title">Suggested Events</div>
                      {dropdownOptions[field.id].map((option, index) => (
                        <button
                          key={index}
                          className="dropdown-option"
                          type="button"
                          onClick={() => {
                            const input = document.getElementById(
                              `search-${field.id}`
                            ) as HTMLInputElement;
                            if (input) {
                              input.value = option.title;
                            }
                            setActiveField(null);
                          }}
                        >
                          <div className="dropdown-icon">{option.icon}</div>
                          <div className="dropdown-content">
                            <div className="dropdown-option-title">
                              {option.title}
                            </div>
                            {option.description && (
                              <div className="dropdown-option-description">
                                {option.description}
                              </div>
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
                const whereInput = document.getElementById(
                  "search-where"
                ) as HTMLInputElement;
                const occasionInput = document.getElementById(
                  "search-occasion"
                ) as HTMLInputElement;
                const whenInput = document.getElementById(
                  "search-when"
                ) as HTMLInputElement;
                const guestInput = document.getElementById(
                  "search-guest"
                ) as HTMLInputElement;
                const budgetInput = document.getElementById(
                  "search-budget"
                ) as HTMLInputElement;

                if (
                  !whereInput?.value ||
                  !occasionInput?.value ||
                  !whenInput?.value ||
                  !guestInput?.value ||
                  !budgetInput?.value
                ) {
                  alert("Please fill in all search fields before searching.");
                  return;
                }

                const params = new URLSearchParams();
                params.set("where", whereInput.value);
                params.set("occasion", occasionInput.value);
                params.set("when", whenInput.value);
                params.set("guest", guestInput.value);
                params.set("budget", budgetInput.value);

                router.push(`/search?${params.toString()}`);
              }}
            >
              <SearchIcon />
            </button>
          </div>
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
            onClick={() => router.push("/profile")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              marginLeft: "10px",
              marginTop: "15px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: profilePhoto ? "transparent" : "#1976d2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "14px",
                fontWeight: "bold",
                border: "2px solid white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                backgroundImage: profilePhoto ? `url(${profilePhoto})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
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
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BurgerIcon />
            </button>
            {burgerOpen && (
              <div
                className="burger-popup open"
                role="menu"
                style={{
                  position: "absolute",
                  top: "50px",
                  right: "0",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                  minWidth: "240px",
                  padding: "8px 0",
                  zIndex: 1000,
                }}
              >
                <div className="popup-menu">
                  <button
                    className="menu-item"
                    type="button"
                    onClick={() => router.push("/wishlist")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#222",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f6f7f8")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    Wishlist
                  </button>
                  <button
                    className="menu-item"
                    type="button"
                    onClick={() => router.push("/events")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#222",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f6f7f8")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    My Events
                  </button>
                  <button
                    className="menu-item"
                    type="button"
                    onClick={() => router.push("/messages")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#222",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f6f7f8")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Messages
                  </button>
                  <button
                    className="menu-item"
                    type="button"
                    onClick={() => router.push("/reviews")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#222",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f6f7f8")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Reviews
                  </button>

                  <button
                    className="menu-item"
                    type="button"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#222",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f6f7f8")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
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
                    onClick={() => router.push('/help-center')}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#222",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f6f7f8")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Help Center
                  </button>
                  <div
                    style={{
                      height: "1px",
                      background: "#e6e6e6",
                      margin: "8px 0",
                    }}
                  />
                  <button
                    className="menu-item"
                    type="button"
                    onClick={() => {
                      if (hasListings) {
                        router.push("/host");
                      }
                    }}
                    disabled={!hasListings}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: hasListings ? "pointer" : "not-allowed",
                      fontSize: "14px",
                      color: hasListings ? "#222" : "#999",
                      opacity: hasListings ? 1 : 0.5,
                    }}
                    onMouseOver={(e) => {
                      if (hasListings) {
                        e.currentTarget.style.backgroundColor = "#f6f7f8";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (hasListings) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8 9L4 12L8 15" />
                      <path d="M16 9L20 12L16 15" />
                    </svg>
                    Switch to Hosting
                  </button>
                  <div
                    style={{
                      height: "1px",
                      background: "#e6e6e6",
                      margin: "8px 0",
                    }}
                  />
                  <button
                    className="menu-item"
                    type="button"
                    onClick={async () => {
                      const { signOut } = await import("firebase/auth");
                      await signOut(auth);
                      router.push("/");
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#222",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f6f7f8")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          padding: "0",
          backgroundColor: "#fff",
          maxWidth: "1760px",
          margin: "0 auto",
        }}
      >
        {/* Title and Actions */}
        <div
          style={{ padding: "24px 80px", borderBottom: "1px solid #e6e6e6" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "16px",
            }}
          >
            <h1
              style={{
                fontSize: "26px",
                fontWeight: "600",
                color: "#222",
                margin: 0,
                flex: 1,
              }}
            >
              {venue.name}
            </h1>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setShareModalOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  border: "1px solid #e6e6e6",
                  borderRadius: "24px",
                  backgroundColor: "white",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#222",
                  cursor: "pointer",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#222"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="6" cy="12" r="2" />
                  <circle cx="18" cy="7" r="2" />
                  <circle cx="18" cy="17" r="2" />
                  <line x1="8" y1="12" x2="16" y2="7" />
                  <line x1="8" y1="12" x2="16" y2="17" />
                </svg>
                Share
              </button>
              <button
                type="button"
                onClick={toggleFavorite}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  border: "1px solid #e6e6e6",
                  borderRadius: "24px",
                  backgroundColor: "white",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#222",
                  cursor: "pointer",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={isFavorite(venue.id) ? "#ff385c" : "none"}
                  stroke={isFavorite(venue.id) ? "#ff385c" : "#222"}
                  strokeWidth={isFavorite(venue.id) ? "0" : "2"}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Saved
              </button>
            </div>
          </div>
        </div>

        {/* Image Gallery - Full Width */}
        <div
          style={{
            width: "100%",
            marginBottom: "48px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr",
              gridTemplateRows: "repeat(2, 1fr)",
              gap: "8px",
              borderRadius: "0",
              overflow: "hidden",
              width: "80%",
              maxWidth: "1200px",
              height: "400px",
            }}
          >
            {/* Large main image on the left - spans all 2 rows */}
            <div
              style={{
                gridColumn: "1",
                gridRow: "1 / 3",
                width: "100%",
                height: "100%",
                backgroundColor: "#f6f7f8",
                backgroundImage: `url(${galleryImages[selectedImageIndex]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                cursor: "pointer",
                borderRadius: "0",
              }}
              onClick={() => {
                // Could open full image modal here
              }}
            />

            {/* Top-left thumbnail */}
            <div
              style={{
                gridColumn: "2",
                gridRow: "1",
                width: "100%",
                height: "100%",
                backgroundColor: "#f6f7f8",
                backgroundImage: `url(${galleryImages[1]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                cursor: "pointer",
              }}
              onClick={() => setSelectedImageIndex(1)}
            />

            {/* Top-right thumbnail */}
            <div
              style={{
                gridColumn: "3",
                gridRow: "1",
                width: "100%",
                height: "100%",
                backgroundColor: "#f6f7f8",
                backgroundImage: `url(${galleryImages[2]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                cursor: "pointer",
                borderRadius: "0",
              }}
              onClick={() => setSelectedImageIndex(2)}
            />

            {/* Middle-left thumbnail */}
            <div
              style={{
                gridColumn: "2",
                gridRow: "2",
                width: "100%",
                height: "100%",
                backgroundColor: "#f6f7f8",
                backgroundImage: `url(${galleryImages[3]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                cursor: "pointer",
              }}
              onClick={() => setSelectedImageIndex(3)}
            />

            {/* Middle-right thumbnail with "Show all photos" overlay */}
            <div
              style={{
                gridColumn: "3",
                gridRow: "2",
                width: "100%",
                height: "100%",
                backgroundColor: "#f6f7f8",
                backgroundImage: `url(${galleryImages[4]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                cursor: "pointer",
                position: "relative",
              }}
              onClick={() => {
                setPhotoGalleryOpen(true);
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(0,0,0,0.4)",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Show all photos
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div
          style={{ display: "flex", gap: "80px", padding: "0 80px 48px 80px" }}
        >
          {/* Left Side - Details */}
          <div style={{ flex: 1 }}>
            {/* Listing Summary */}
            <div
              style={{
                marginBottom: "32px",
                paddingBottom: "32px",
                borderBottom: "1px solid #e6e6e6",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                <span
                  style={{ fontSize: "16px", fontWeight: "600", color: "#222" }}
                >
                  Entire {venue.type || "rental unit"} in {venue.location}
                </span>
              </div>
              <div
                style={{
                  fontSize: "16px",
                  color: "#666",
                  marginBottom: "24px",
                }}
              >
                Insert features
              </div>
            </div>

            {/* Hosted by Section */}
            <div
              style={{
                marginBottom: "32px",
                paddingBottom: "32px",
                borderBottom: "1px solid #e6e6e6",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "24px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      backgroundColor: "#e6e6e6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      fontWeight: "600",
                      color: "#222",
                    }}
                  >
                    {(venue.hostName || "Host").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#222",
                        marginBottom: "4px",
                      }}
                    >
                      Hosted by {venue.hostName || "Host"}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#666",
                        marginBottom: "4px",
                      }}
                    >
                      {venue.hostInfo || "host • X years hosting"}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#1976d2",
                        textDecoration: "underline",
                        cursor: "pointer",
                        marginBottom: "8px",
                      }}
                    >
                      See host profile
                    </div>
                    <button
                      type="button"
                      style={{
                        padding: "8px 16px",
                        border: "1px solid #e6e6e6",
                        borderRadius: "8px",
                        backgroundColor: "white",
                        color: "#1976d2",
                        fontSize: "14px",
                        fontWeight: "500",
                        cursor: "pointer",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f6f7f8")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = "white")
                      }
                    >
                      Contact host
                    </button>
                  </div>
                </div>

                {/* Metrics Card */}
                <div
                  style={{
                    backgroundColor: "#e3f2fd",
                    borderRadius: "12px",
                    padding: "20px",
                    display: "flex",
                    gap: "32px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#1565c0",
                        marginBottom: "4px",
                      }}
                    >
                      0/10
                    </div>
                    <div style={{ fontSize: "14px", color: "#1565c0" }}>
                      Communication rating
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#1565c0",
                        marginBottom: "4px",
                      }}
                    >
                      0/10
                    </div>
                    <div style={{ fontSize: "14px", color: "#1565c0" }}>
                      Ease of check-in
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#1565c0",
                        marginBottom: "4px",
                      }}
                    >
                      0%
                    </div>
                    <div style={{ fontSize: "14px", color: "#1565c0" }}>
                      Cancellation rate
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities Section */}
            {venue.amenities && venue.amenities.length > 0 && (
              <div
                style={{
                  marginBottom: "32px",
                  paddingBottom: "32px",
                  borderBottom: "1px solid #e6e6e6",
                }}
              >
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: "600",
                    color: "#222",
                    marginBottom: "24px",
                  }}
                >
                  What this place offers
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "16px",
                  }}
                >
                  {venue.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#222"
                        strokeWidth="2"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      <span style={{ fontSize: "16px", color: "#222" }}>
                        Insert Amenties
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "16px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setAmenitiesModalOpen(true)}
                    style={{
                      padding: "10px 20px",
                      border: "1px solid #222",
                      borderRadius: "8px",
                      backgroundColor: "white",
                      color: "#1976d2",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f6f7f8")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "white")
                    }
                  >
                    See more amenities
                  </button>
                </div>
              </div>
            )}

            {/* Description Section */}
            {venue.description && (
              <div
                style={{
                  marginBottom: "32px",
                  paddingBottom: "32px",
                  borderBottom: "1px solid #e6e6e6",
                }}
              >
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: "600",
                    color: "#222",
                    marginBottom: "16px",
                  }}
                >
                  About this place
                </h2>
                <div
                  style={{
                    fontSize: "16px",
                    color: "#222",
                    lineHeight: "1.6",
                    whiteSpace: "pre-line",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    maxHeight: descriptionExpanded ? "none" : "200px",
                    overflow: descriptionExpanded ? "visible" : "hidden",
                    position: "relative",
                  }}
                >
                  {venue.description}
                  {!descriptionExpanded && venue.description.length > 200 && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "60px",
                        background: "linear-gradient(to bottom, transparent, white)",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </div>
                {venue.description.length > 200 && (
                  <button
                    onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                    style={{
                      marginTop: "12px",
                      padding: "8px 16px",
                      backgroundColor: "transparent",
                      border: "1px solid #222",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#222",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#f5f5f5";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {descriptionExpanded ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
            )}

            {/* House Rules Section */}
            <div
              style={{
                marginBottom: "32px",
                paddingBottom: "32px",
                borderBottom: "1px solid #e6e6e6",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: "600",
                    color: "#222",
                    marginBottom: "16px",
                  }}
                >
                  House Rules
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "16px",
                        color: "#222",
                        marginBottom: "8px",
                      }}
                    >
                      Check in after 3:00 PM
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        color: "#222",
                        marginBottom: "8px",
                      }}
                    >
                      Check out before 11:00 AM
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            width: "20px",
                            height: "20px",
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#222"
                            strokeWidth="2"
                          >
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <circle cx="18" cy="7" r="2" />
                            <path d="M19 11v2" />
                          </svg>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            style={{ position: "absolute", top: 0, left: 0 }}
                          >
                            <line
                              x1="2"
                              y1="22"
                              x2="22"
                              y2="2"
                              stroke="#ff385c"
                              strokeWidth="2.5"
                            />
                          </svg>
                        </div>
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#222",
                          }}
                        >
                          Children
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          color: "#222",
                          paddingLeft: "28px",
                        }}
                      >
                        Adults only
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            width: "20px",
                            height: "20px",
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#222"
                            strokeWidth="2"
                          >
                            <path d="M11.25 4.533A9.707 9.707 0 0 1 15 10c0 2.123-.78 4.06-2.063 5.533m0 0a8.5 8.5 0 0 1-1.687 1.766m1.687-1.766L13.5 15m-4.75-4.467A9.707 9.707 0 0 0 9 10c0-2.123.78-4.06 2.063-5.533m0 0L10.5 5m-4.75 4.467L5 10m5.75 4.467L15 10" />
                          </svg>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            style={{ position: "absolute", top: 0, left: 0 }}
                          >
                            <line
                              x1="2"
                              y1="22"
                              x2="22"
                              y2="2"
                              stroke="#ff385c"
                              strokeWidth="2.5"
                            />
                          </svg>
                        </div>
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#222",
                          }}
                        >
                          Pets
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          color: "#222",
                          paddingLeft: "28px",
                        }}
                      >
                        No pets allowed
                      </div>
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "16px",
                        color: "#222",
                        marginBottom: "20px",
                      }}
                    >
                      Minimum age to rent: 25
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            width: "20px",
                            height: "20px",
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#222"
                            strokeWidth="2"
                          >
                            <path d="M5 8h14M5 8a2 2 0 1 0 0-4h14a2 2 0 1 0 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
                            <path d="M9 12h6" />
                          </svg>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            style={{ position: "absolute", top: 0, left: 0 }}
                          >
                            <line
                              x1="2"
                              y1="22"
                              x2="22"
                              y2="2"
                              stroke="#ff385c"
                              strokeWidth="2.5"
                            />
                          </svg>
                        </div>
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#222",
                          }}
                        >
                          Events
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          color: "#222",
                          paddingLeft: "28px",
                        }}
                      >
                        No events allowed
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            width: "20px",
                            height: "20px",
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#222"
                            strokeWidth="2"
                          >
                            <line x1="18" y1="10" x2="6" y2="10" />
                            <line x1="21" y1="6" x2="3" y2="6" />
                            <line x1="21" y1="14" x2="3" y2="14" />
                            <line x1="18" y1="18" x2="6" y2="18" />
                          </svg>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            style={{ position: "absolute", top: 0, left: 0 }}
                          >
                            <line
                              x1="2"
                              y1="22"
                              x2="22"
                              y2="2"
                              stroke="#ff385c"
                              strokeWidth="2.5"
                            />
                          </svg>
                        </div>
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#222",
                          }}
                        >
                          Smoking
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          color: "#222",
                          paddingLeft: "28px",
                        }}
                      >
                        Smoking is not permitted
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div
                  style={{
                    borderTop: "1px solid #e6e6e6",
                    marginTop: "24px",
                    paddingTop: "24px",
                  }}
                ></div>

                {/* Check-out instructions */}
                <div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#222",
                      marginBottom: "12px",
                    }}
                  >
                    Check-out instructions
                  </h3>
                  <p
                    style={{
                      fontSize: "16px",
                      color: "#222",
                      marginBottom: "12px",
                    }}
                  >
                    The host requires you complete the following before checking
                    out:
                  </p>
                  <ul
                    style={{
                      fontSize: "16px",
                      color: "#222",
                      lineHeight: "1.8",
                      paddingLeft: "20px",
                      marginBottom: "12px",
                    }}
                  >
                    <li>Gather used towels</li>
                    <li>Remove personal items</li>
                    <li>Turn off the lights and lock the doors</li>
                    <li>
                      Replace key under doormat. Check for personal items.
                    </li>
                  </ul>
                  <p
                    style={{
                      fontSize: "16px",
                      color: "#222",
                      marginBottom: "12px",
                    }}
                  >
                    Failure to complete these may result in a negative review
                    from the host.
                  </p>
                  <p style={{ fontSize: "16px", color: "#222" }}>
                    Be respectful of the property. Please walk carefully around
                    the springs and trails. Only park on granite drive
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div
                style={{
                  borderTop: "1px solid #e6e6e6",
                  marginTop: "24px",
                  paddingTop: "24px",
                }}
              ></div>

              {/* Damage and incidentals */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "16px",
                    gap: "16px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#222",
                      margin: 0,
                    }}
                  >
                    Damage and incidentals
                  </h3>
                  <p
                    style={{
                      fontSize: "16px",
                      color: "#666",
                      margin: 0,
                      textAlign: "right",
                    }}
                  >
                    If you incur incidental fees or cause damage to the rental
                    property, your credit card may be charged up to $200.
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div
                style={{
                  borderTop: "1px solid #e6e6e6",
                  marginTop: "24px",
                  paddingTop: "24px",
                }}
              ></div>

              {/* Cancellation */}
              <div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#222",
                    marginBottom: "24px",
                  }}
                >
                  Cancellation
                </h3>

                {/* Timeline */}
                <div
                  style={{
                    backgroundColor: "#f6f7f8",
                    borderRadius: "8px",
                    padding: "32px 24px",
                    marginBottom: "24px",
                  }}
                >
                  <div style={{ position: "relative", height: "60px" }}>
                    {/* Horizontal line */}
                    <div
                      style={{
                        position: "absolute",
                        top: "30px",
                        left: "0",
                        right: "0",
                        height: "2px",
                        backgroundColor: "#222",
                        zIndex: 1,
                      }}
                    ></div>

                    {/* Points and labels container */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        position: "relative",
                        alignItems: "flex-start",
                      }}
                    >
                      {/* Today */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            backgroundColor: "#222",
                            position: "absolute",
                            top: "24px",
                            zIndex: 2,
                          }}
                        ></div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#222",
                            marginTop: "40px",
                          }}
                        >
                          Today
                        </div>
                      </div>

                      {/* Jan 2 */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            backgroundColor: "#222",
                            position: "absolute",
                            top: "24px",
                            zIndex: 2,
                          }}
                        ></div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#222",
                            marginTop: "40px",
                          }}
                        >
                          Jan 2
                        </div>
                      </div>

                      {/* Jan 9 */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            border: "2px solid #222",
                            backgroundColor: "white",
                            position: "absolute",
                            top: "24px",
                            zIndex: 2,
                          }}
                        ></div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#222",
                            marginTop: "40px",
                          }}
                        >
                          Jan 9
                        </div>
                      </div>

                      {/* Check-in */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            border: "2px solid #222",
                            backgroundColor: "white",
                            position: "absolute",
                            top: "24px",
                            zIndex: 2,
                          }}
                        ></div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#222",
                            marginTop: "40px",
                          }}
                        >
                          Check-in
                        </div>
                      </div>
                    </div>

                    {/* Refund labels above segments - positioned between points */}
                    <div
                      style={{
                        position: "absolute",
                        top: "0",
                        left: "0",
                        right: "0",
                        display: "flex",
                        height: "100%",
                      }}
                    >
                      {/* Full refund - between Today and Jan 2 */}
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "flex-start",
                          paddingTop: "0",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#222",
                          }}
                        >
                          Full refund
                        </div>
                      </div>

                      {/* Partial refund - between Jan 2 and Jan 9 */}
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "flex-start",
                          paddingTop: "0",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#222",
                          }}
                        >
                          Partial refund
                        </div>
                      </div>

                      {/* No refund - between Jan 9 and Check-in */}
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "flex-start",
                          paddingTop: "0",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#222",
                          }}
                        >
                          No refund
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Refund policies */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <div
                    style={{
                      borderBottom: "1px solid #e6e6e6",
                      paddingBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#222",
                        }}
                      >
                        Before Jan 2
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#222",
                        }}
                      >
                        Full refund
                      </div>
                    </div>
                    <p style={{ fontSize: "16px", color: "#666", margin: 0 }}>
                      Cancel your reservation before Jan 2 at 11:59pm, and
                      you'll get a full refund. Times are based on the
                      property's local time.
                    </p>
                  </div>
                  <div
                    style={{
                      borderBottom: "1px solid #e6e6e6",
                      paddingBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#222",
                        }}
                      >
                        Before Jan 9
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#222",
                        }}
                      >
                        Partial refund
                      </div>
                    </div>
                    <p style={{ fontSize: "16px", color: "#666", margin: 0 }}>
                      If you cancel your reservation before Jan 9 at 11:59pm
                      you'll get a refund of 50% of the amount paid (minus the
                      service fee). Times are based on the property's local
                      time.
                    </p>
                  </div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#222",
                        }}
                      >
                        After Jan 9
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#222",
                        }}
                      >
                        No refund
                      </div>
                    </div>
                    <p style={{ fontSize: "16px", color: "#666", margin: 0 }}>
                      After that, you won't get a refund.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div
              style={{
                marginBottom: "32px",
                paddingBottom: "32px",
                borderBottom: "1px solid #e6e6e6",
              }}
            >
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "600",
                  color: "#222",
                  marginBottom: "24px",
                }}
              >
                Reviews
              </h2>

              <div
                style={{ display: "flex", gap: "16px", position: "relative" }}
              >
                {/* Summary Review Card */}
                <div
                  style={{
                    backgroundColor: "#e3f2fd",
                    borderRadius: "12px",
                    padding: "24px",
                    minWidth: "280px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "48px",
                      fontWeight: "700",
                      color: "#2e7d32",
                      lineHeight: "1",
                    }}
                  >
                    10/10
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#222",
                    }}
                  >
                    Exceptional
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#222",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    147 verified reviews
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#666"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#1976d2",
                      color: "white",
                      padding: "8px 12px",
                      borderRadius: "20px",
                      fontSize: "14px",
                      fontWeight: "500",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      width: "fit-content",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M12 21s-6-4.35-10-9c-3.33-4 0-11 6-8 3 1 4 3 4 3s1-2 4-3c6-3 9.33 4 6 8-4 4.65-10 9-10 9z" />
                    </svg>
                    Loved by Guests
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    Guests rate this one of the best homes on Venu, giving it
                    exceptional reviews.
                  </div>
                </div>

                {/* Individual Review Cards */}
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    flex: 1,
                    position: "relative",
                    alignItems: "center",
                  }}
                >
                  {/* Left Navigation Arrow */}
                  <button
                    type="button"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "1px solid #e6e6e6",
                      backgroundColor: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                      position: "absolute",
                      left: "-20px",
                      zIndex: 10,
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f6f7f8")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "white")
                    }
                  >
                    <LeftArrowIcon />
                  </button>

                  {/* Review Card 1 */}
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "12px",
                      padding: "24px",
                      border: "1px solid #e6e6e6",
                      flex: 1,
                      minWidth: "300px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#222",
                        marginBottom: "12px",
                      }}
                    >
                      10/10 Excellent
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        color: "#222",
                        lineHeight: "1.6",
                        marginBottom: "8px",
                      }}
                    >
                      Place was lovely. Location was ideal
                    </div>
                    <button
                      type="button"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#1976d2",
                        fontSize: "14px",
                        fontWeight: "500",
                        cursor: "pointer",
                        padding: 0,
                        marginBottom: "20px",
                      }}
                    >
                      Show more
                    </button>
                    <div
                      style={{
                        borderTop: "1px solid #e6e6e6",
                        paddingTop: "16px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#222",
                          marginBottom: "4px",
                        }}
                      >
                        deb a.
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#666",
                          marginBottom: "4px",
                        }}
                      >
                        Stayed 2 nights in Oct 2025
                      </div>
                      <div style={{ fontSize: "14px", color: "#666" }}>
                        Verified review
                      </div>
                    </div>
                  </div>

                  {/* Review Card 2 */}
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "12px",
                      padding: "24px",
                      border: "1px solid #e6e6e6",
                      flex: 1,
                      minWidth: "300px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#222",
                        marginBottom: "12px",
                      }}
                    >
                      10/10 Excellent
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        color: "#222",
                        lineHeight: "1.6",
                        marginBottom: "8px",
                      }}
                    >
                      Clean, nice space. Absolutely would stay again.
                    </div>
                    <button
                      type="button"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#1976d2",
                        fontSize: "14px",
                        fontWeight: "500",
                        cursor: "pointer",
                        padding: 0,
                        marginBottom: "20px",
                      }}
                    >
                      Show more
                    </button>
                    <div
                      style={{
                        borderTop: "1px solid #e6e6e6",
                        paddingTop: "16px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#222",
                          marginBottom: "4px",
                        }}
                      >
                        barry
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#666",
                          marginBottom: "4px",
                        }}
                      >
                        Stayed 2 nights in Oct 2025
                      </div>
                      <div style={{ fontSize: "14px", color: "#666" }}>
                        Verified review
                      </div>
                    </div>
                  </div>

                  {/* Right Navigation Arrow */}
                  <button
                    type="button"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "none",
                      backgroundColor: "#e3f2fd",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                      position: "absolute",
                      right: "-20px",
                      zIndex: 10,
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#bbdefb")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e3f2fd")
                    }
                  >
                    <RightArrowIcon />
                  </button>
                </div>
              </div>

              {/* Show all reviews and How reviews work */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "16px",
                  marginTop: "24px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setReviewsModalOpen(true)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#f6f7f8",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#222",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#e6e6e6")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f6f7f8")
                  }
                >
                  Show all 00 reviews
                </button>
                <a
                  href="#"
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#222")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#666")}
                ></a>
              </div>
            </div>
          </div>

          {/* Right Side - Booking Panel */}
          <div
            style={{
              width: "400px",
              position: "sticky",
              top: "100px",
              height: "fit-content",
            }}
          >
            <div
              style={{
                border: "1px solid #e6e6e6",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 2px 16px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "22px",
                      fontWeight: "600",
                      color: "#222",
                    }}
                  >
                    {venue.price}
                  </span>
                  <span style={{ fontSize: "14px", color: "#666" }}>
                    per event
                  </span>
                </div>
              </div>
              <div style={{ marginBottom: "24px", position: "relative" }}>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#222",
                    marginBottom: "8px",
                  }}
                >
                  Event Date
                </div>
                <div
                  style={{
                    padding: "12px",
                    border: "1px solid #e6e6e6",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginBottom: "16px",
                  }}
                  onClick={() => setBookingDateOpen(!bookingDateOpen)}
                >
                  <div
                    id="booking-date-display"
                    style={{
                      fontSize: "14px",
                      color: selectedDate ? "#222" : "#666",
                    }}
                  >
                    {selectedDate
                      ? `${
                          monthNames[selectedDate.getMonth()]
                        } ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
                      : "Add date"}
                  </div>
                </div>
                {bookingDateOpen && (
                  <div
                    ref={bookingCalendarRef}
                    className="calendar-dropdown"
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      left: 0,
                      right: 0,
                      zIndex: 2000,
                      marginTop: "4px",
                    }}
                  >
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
                            {renderCalendar(calendarMonth, calendarYear).map(
                              (day, index) => {
                                const isPast =
                                  day !== null &&
                                  isPastDate(day, calendarMonth, calendarYear);
                                return (
                                  <button
                                    key={index}
                                    className={`calendar-day ${
                                      day === null ? "empty" : ""
                                    } ${
                                      selectedDate &&
                                      day !== null &&
                                      selectedDate.getDate() === day &&
                                      selectedDate.getMonth() ===
                                        calendarMonth &&
                                      selectedDate.getFullYear() ===
                                        calendarYear
                                        ? "selected"
                                        : ""
                                    } ${isPast ? "past" : ""}`}
                                    type="button"
                                    disabled={day === null || isPast}
                                    onClick={() =>
                                      day !== null &&
                                      !isPast &&
                                      handleDateClick(
                                        day,
                                        calendarMonth,
                                        calendarYear,
                                        true
                                      )
                                    }
                                  >
                                    {day}
                                  </button>
                                );
                              }
                            )}
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
                              return renderCalendar(next.month, next.year).map(
                                (day, index) => {
                                  const isPast =
                                    day !== null &&
                                    isPastDate(day, next.month, next.year);
                                  return (
                                    <button
                                      key={index}
                                      className={`calendar-day ${
                                        day === null ? "empty" : ""
                                      } ${
                                        selectedDate &&
                                        day !== null &&
                                        selectedDate.getDate() === day &&
                                        selectedDate.getMonth() ===
                                          next.month &&
                                        selectedDate.getFullYear() === next.year
                                          ? "selected"
                                          : ""
                                      } ${isPast ? "past" : ""}`}
                                      type="button"
                                      disabled={day === null || isPast}
                                      onClick={() =>
                                        day !== null &&
                                        !isPast &&
                                        handleDateClick(
                                          day,
                                          next.month,
                                          next.year,
                                          true
                                        )
                                      }
                                    >
                                      {day}
                                    </button>
                                  );
                                }
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ marginBottom: "24px", position: "relative" }}>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#222",
                    marginBottom: "8px",
                  }}
                >
                  Occasion
                </div>
                <div
                  style={{
                    padding: "12px",
                    border: "1px solid #e6e6e6",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginBottom: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onClick={() => setBookingOccasionOpen(!bookingOccasionOpen)}
                >
                  <div
                    id="booking-occasion-display"
                    style={{
                      fontSize: "14px",
                      color: selectedOccasion ? "#222" : "#666",
                    }}
                  >
                    {selectedOccasion || "Add occasion"}
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#666"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                {bookingOccasionOpen && (
                  <div
                    ref={bookingOccasionRef}
                    className="guest-dropdown"
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      left: 0,
                      right: 0,
                      zIndex: 2000,
                      marginTop: "4px",
                    }}
                  >
                    <div className="guest-dropdown-title">Select Occasion:</div>
                    {dropdownOptions.occasion.map((option, index) => (
                      <button
                        key={index}
                        className="guest-option"
                        type="button"
                        onClick={() => {
                          setSelectedOccasion(option.title);
                          setBookingOccasionOpen(false);
                        }}
                      >
                        {option.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: "24px", position: "relative" }}>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#222",
                    marginBottom: "8px",
                  }}
                >
                  Guests
                </div>
                <div
                  style={{
                    padding: "12px",
                    border: "1px solid #e6e6e6",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginBottom: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onClick={() => setBookingGuestOpen(!bookingGuestOpen)}
                >
                  <div
                    id="booking-guest-display"
                    style={{
                      fontSize: "14px",
                      color: selectedGuest ? "#222" : "#666",
                    }}
                  >
                    {selectedGuest || "Add guests"}
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#666"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                {bookingGuestOpen && (
                  <div
                    ref={bookingGuestRef}
                    className="guest-dropdown"
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      left: 0,
                      right: 0,
                      zIndex: 2000,
                      marginTop: "4px",
                    }}
                  >
                    <div className="guest-dropdown-title">
                      Number of Guests:
                    </div>
                    {dropdownOptions.guest.map((option, index) => (
                      <button
                        key={index}
                        className="guest-option"
                        type="button"
                        onClick={() => {
                          setSelectedGuest(option.title);
                          setBookingGuestOpen(false);
                        }}
                      >
                        {option.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: "24px" }}>
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      alert("Please sign in to make a reservation");
                      return;
                    }

                    if (!selectedDate) {
                      alert("Please select a date");
                      return;
                    }

                    if (!selectedOccasion) {
                      alert("Please select an occasion");
                      return;
                    }

                    if (!selectedGuest) {
                      alert("Please select number of guests");
                      return;
                    }

                    // Generate booking ID
                    const bookingId = Date.now().toString();

                    // Format dates
                    const checkInDate = selectedDate;
                    const checkOutDate = new Date(checkInDate);
                    checkOutDate.setDate(checkOutDate.getDate() + 1); // Assuming 1 night stay, adjust as needed

                    const checkIn = `${
                      monthNames[checkInDate.getMonth()]
                    } ${checkInDate.getDate()}, ${checkInDate.getFullYear()}`;
                    const checkOut = `${
                      monthNames[checkOutDate.getMonth()]
                    } ${checkOutDate.getDate()}, ${checkOutDate.getFullYear()}`;
                    const nights = 1; // Calculate based on check-in/check-out

                    // Create booking object
                    const booking = {
                      id: bookingId,
                      venueId: venueId,
                      venueName: venue?.name || "Venue",
                      rating: venue?.rating || 0,
                      address: venue?.location || "",
                      phone: "", // Phone can be added to venue type if needed
                      image: venue?.image || "/api/placeholder/400/300",
                      checkIn: checkIn,
                      checkOut: checkOut,
                      nights: nights,
                      guestName: user.displayName || "Guest",
                      contactEmail: user.email || "",
                      roomType: "Standard Room", // Default, can be customized
                      capacity: selectedGuest,
                      occasion: selectedOccasion,
                      amenities:
                        venue?.amenities && venue.amenities.length > 0
                          ? venue.amenities
                          : ["FREE Wi-Fi", "Breakfast"], // Use venue amenities or default
                      specialRequests: "",
                      paymentStatus: "Pay the property at check-in",
                      createdAt: new Date().toISOString(),
                    };

                    // Save to localStorage
                    const existingBookings = JSON.parse(
                      localStorage.getItem(`upcomingBookings_${user.uid}`) ||
                        "[]"
                    );
                    existingBookings.push(booking);
                    localStorage.setItem(
                      `upcomingBookings_${user.uid}`,
                      JSON.stringify(existingBookings)
                    );

                    // Show success message and redirect
                    alert(
                      'Booking confirmed! Check "My Events" to view your booking.'
                    );
                    router.push("/events");
                  }}
                  style={{
                    width: "100%",
                    padding: "14px",
                    backgroundColor: "#1976d2",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    marginBottom: "8px",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#1565c0")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "#1976d2")
                  }
                >
                  Reserve
                </button>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    textAlign: "center",
                  }}
                >
                  You won't be charged yet
                </div>
              </div>
              <div
                style={{
                  paddingTop: "16px",
                  borderTop: "1px solid #e6e6e6",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    // Handle report listing
                    alert("Report this listing functionality");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "transparent",
                    border: "none",
                    color: "#222",
                    fontSize: "14px",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#222"
                    strokeWidth="2"
                  >
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

      {/* Share Modal */}
      {shareModalOpen && venue && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
          onClick={() => setShareModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "500px",
              width: "90%",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShareModalOpen(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#222"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Title */}
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "600",
                color: "#222",
                marginBottom: "16px",
                paddingRight: "32px",
              }}
            >
              Share this venue
            </h2>

            {/* Venue Info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "8px",
                  backgroundImage: `url(${venue.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  flexShrink: 0,
                }}
              />
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#222",
                    fontWeight: "500",
                    margin: 0,
                  }}
                >
                  {venue.name}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    margin: "4px 0 0 0",
                  }}
                >
                  {venue.location}
                </p>
              </div>
            </div>

            {/* Sharing Options Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              {/* Copy Link */}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  padding: "16px",
                  border: "1px solid #e6e6e6",
                  borderRadius: "8px",
                  background: "white",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f6f7f8")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "white")
                }
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#222"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span style={{ fontSize: "14px", color: "#222" }}>
                  Copy Link
                </span>
              </button>

              {/* Messages */}
              <button
                type="button"
                onClick={() => {
                  setShareModalOpen(false);
                  router.push("/messages");
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  padding: "16px",
                  border: "1px solid #e6e6e6",
                  borderRadius: "8px",
                  background: "white",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f6f7f8")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "white")
                }
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#222"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span style={{ fontSize: "14px", color: "#222" }}>
                  Messages
                </span>
              </button>

              {/* Messenger */}
              <button
                type="button"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  padding: "16px",
                  border: "1px solid #e6e6e6",
                  borderRadius: "8px",
                  background: "white",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f6f7f8")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "white")
                }
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#0084FF">
                  <path d="M12 2C6.48 2 2 6.15 2 11.25c0 2.61 1.21 4.95 3.14 6.55L2 22l4.71-2.8c1.3.36 2.68.55 4.1.55 5.52 0 10-4.15 10-9.25S17.52 2 12 2zm0 16.5c-1.2 0-2.36-.17-3.43-.48l-.25-.07-2.64 1.57.7-2.3-.18-.25c-.96-1.28-1.5-2.87-1.5-4.52 0-3.87 3.58-7 8-7s8 3.13 8 7-3.58 7-8 7z" />
                </svg>
                <span style={{ fontSize: "14px", color: "#222" }}>
                  Messenger
                </span>
              </button>

              {/* Twitter */}
              <button
                type="button"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  padding: "16px",
                  border: "1px solid #e6e6e6",
                  borderRadius: "8px",
                  background: "white",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f6f7f8")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "white")
                }
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#000000">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span style={{ fontSize: "14px", color: "#222" }}>Twitter</span>
              </button>

              {/* Email */}
              <button
                type="button"
                onClick={() => {
                  window.location.href = `mailto:?subject=Check out this venue: ${encodeURIComponent(
                    venue.name
                  )}&body=${encodeURIComponent(window.location.href)}`;
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  padding: "16px",
                  border: "1px solid #e6e6e6",
                  borderRadius: "8px",
                  background: "white",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f6f7f8")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "white")
                }
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#222"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span style={{ fontSize: "14px", color: "#222" }}>Email</span>
              </button>

              {/* WhatsApp */}
              <button
                type="button"
                onClick={() => {
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(
                      `Check out this venue: ${venue.name} ${window.location.href}`
                    )}`,
                    "_blank"
                  );
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  padding: "16px",
                  border: "1px solid #e6e6e6",
                  borderRadius: "8px",
                  background: "white",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f6f7f8")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "white")
                }
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span style={{ fontSize: "14px", color: "#222" }}>
                  WhatsApp
                </span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => {
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      window.location.href
                    )}`,
                    "_blank"
                  );
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  padding: "16px",
                  border: "1px solid #e6e6e6",
                  borderRadius: "8px",
                  background: "white",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f6f7f8")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "white")
                }
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span style={{ fontSize: "14px", color: "#222" }}>
                  Facebook
                </span>
              </button>
            </div>

            {/* Disclaimer */}
            <p
              style={{
                fontSize: "12px",
                color: "#666",
                textAlign: "center",
                margin: 0,
              }}
            >
              Once you share this link, anyone can view this venue.{" "}
              <a
                href="#"
                style={{ color: "#222", textDecoration: "underline" }}
              >
                Learn more
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Photo Gallery Modal */}
      {photoGalleryOpen && venue && (
        <div
          className="modal-overlay"
          onClick={() => setPhotoGalleryOpen(false)}
        >
          <div
            className="auth-modal"
            style={{
              maxWidth: "1200px",
              width: "100%",
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{ padding: "24px" }}>
              {/* Header with return button */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setPhotoGalleryOpen(false)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#1976d2",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#1565c0")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "#1976d2")
                  }
                >
                  Return to property
                </button>
              </div>

              {/* Category Filter Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "24px",
                  flexWrap: "wrap",
                }}
              >
                {photoCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedPhotoCategory(category.id)}
                    style={{
                      padding: "8px 16px",
                      border: "1px solid #e6e6e6",
                      borderRadius: "24px",
                      backgroundColor:
                        selectedPhotoCategory === category.id
                          ? "#222"
                          : "white",
                      color:
                        selectedPhotoCategory === category.id
                          ? "white"
                          : "#222",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {category.label} ({category.count})
                  </button>
                ))}
              </div>

              {/* Category Title */}
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "600",
                  color: "#222",
                  marginBottom: "24px",
                }}
              >
                {photoCategories.find((c) => c.id === selectedPhotoCategory)
                  ?.label || "All photos"}
              </h2>

              {/* Photo Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "16px",
                  marginBottom: "40px",
                }}
              >
                {filteredPhotos.map((photo) => (
                  <div key={photo.id} style={{ position: "relative" }}>
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      style={{
                        width: "100%",
                        height: "300px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        backgroundColor: "#e6e6e6",
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/api/placeholder/400/300";
                      }}
                    />
                    <p
                      style={{
                        marginTop: "8px",
                        fontSize: "14px",
                        color: "#222",
                        fontWeight: "500",
                      }}
                    >
                      {photo.caption}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Amenities Modal */}
      {amenitiesModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setAmenitiesModalOpen(false)}
        >
          <div
            className="auth-modal"
            style={{
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Close modal"
              onClick={() => setAmenitiesModalOpen(false)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="modal-content" style={{ padding: "24px" }}>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "600",
                  color: "#222",
                  marginBottom: "24px",
                  paddingRight: "40px",
                }}
              >
                Amenities
              </h2>

              <div
                style={{
                  maxHeight: "calc(90vh - 120px)",
                  overflowY: "auto",
                  paddingRight: "8px",
                }}
              >
                {/* Essentials */}
                <div style={{ marginBottom: "24px" }}>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#222",
                      marginBottom: "16px",
                    }}
                  >
                    Essentials
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {[
                      "Wireless internet",
                      "WiFi",
                      "Internet",
                      "Towels provided",
                      "Linens provided",
                      "Air conditioning",
                      "Hair dryer",
                      "Shampoo",
                      "Toilet paper",
                      "Paper towels",
                      "Basic soaps",
                      "Heating",
                    ].map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#222"
                          strokeWidth="2"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                        <span style={{ fontSize: "16px", color: "#222" }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kitchen */}
                <div style={{ marginBottom: "24px" }}>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#222",
                      marginBottom: "16px",
                    }}
                  >
                    Kitchen
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {[
                      "Kitchen",
                      "Kitchenette",
                      "Refrigerator",
                      "Small refrigerator",
                      "Microwave",
                      "Dishes & utensils",
                      "Coffee maker",
                      "Toaster",
                      "Toaster Oven",
                    ].map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#222"
                          strokeWidth="2"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                        <span style={{ fontSize: "16px", color: "#222" }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Outside */}
                <div style={{ marginBottom: "24px" }}>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#222",
                      marginBottom: "16px",
                    }}
                  >
                    Outside
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {["Outdoor furniture"].map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#222"
                          strokeWidth="2"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                        <span style={{ fontSize: "16px", color: "#222" }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Entertainment */}
                <div style={{ marginBottom: "24px" }}>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#222",
                      marginBottom: "16px",
                    }}
                  >
                    Entertainment
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {["Games", "Television", "Satellite / cable"].map(
                      (item, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#222"
                            strokeWidth="2"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                          <span style={{ fontSize: "16px", color: "#222" }}>
                            {item}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Laundry */}
                <div style={{ marginBottom: "24px" }}>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#222",
                      marginBottom: "16px",
                    }}
                  >
                    Laundry
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {[
                      "Washing machine",
                      "Dryer",
                      "Iron",
                      "Laundry detergent",
                    ].map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#222"
                          strokeWidth="2"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                        <span style={{ fontSize: "16px", color: "#222" }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Modal */}
      {reviewsModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setReviewsModalOpen(false)}
        >
          <div
            className="auth-modal"
            style={{
              maxWidth: "700px",
              width: "100%",
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Close modal"
              onClick={() => setReviewsModalOpen(false)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="modal-content" style={{ padding: "24px" }}>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "600",
                  color: "#222",
                  marginBottom: "16px",
                  paddingRight: "40px",
                }}
              >
                78 reviews
              </h2>

              {/* Tab */}
              <div
                style={{
                  borderBottom: "1px solid #e6e6e6",
                  marginBottom: "24px",
                }}
              >
                <div style={{ display: "flex", gap: "24px" }}>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#222",
                      paddingBottom: "12px",
                      borderBottom: "2px solid #222",
                      cursor: "pointer",
                    }}
                  >
                    From guests · 77
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div
                style={{
                  maxHeight: "calc(90vh - 200px)",
                  overflowY: "auto",
                  paddingRight: "8px",
                }}
              >
                {/* Sample Review 1 */}
                <div
                  style={{
                    marginBottom: "32px",
                    paddingBottom: "32px",
                    borderBottom: "1px solid #e6e6e6",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        backgroundColor: "#e6e6e6",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        fontWeight: "600",
                        color: "#222",
                      }}
                    >
                      M
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#222",
                          marginBottom: "4px",
                        }}
                      >
                        Matthew
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#666",
                          marginBottom: "8px",
                        }}
                      >
                        Crest Hill, IL
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "8px",
                        }}
                      >
                        <div style={{ display: "flex", gap: "2px" }}>
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="#222"
                              stroke="#222"
                              strokeWidth="0"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ))}
                        </div>
                        <span style={{ fontSize: "14px", color: "#666" }}>
                          November 2025
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      color: "#222",
                      lineHeight: "1.6",
                    }}
                  >
                    This is my third time in the Philippines every 6 months.
                    This time I was at a resort in Cebu for 3 weeks, then came
                    back to Manila. The resort had no wifi and inconvenient, so
                    I looked at Marvie's condo. Best decision. Marvie made sure
                    I had everything, including a back up preloaded data
                    internet modem. The building is secure, quiet, and in an
                    area that doesn't flood. Power was out for only 24 hours
                    after the typhoon, which is outstanding. Seriously
                    considering buying a 2-bedroom unit in the community.
                    Marvie's studio is super clean, no bugs. Extra reading
                    glasses were there too. The security guy got me a stellar
                    ride to the airport in about 5 mins.
                  </div>
                </div>

                {/* Sample Review 2 */}
                <div
                  style={{
                    marginBottom: "32px",
                    paddingBottom: "32px",
                    borderBottom: "1px solid #e6e6e6",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        backgroundColor: "#e6e6e6",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        fontWeight: "600",
                        color: "#222",
                      }}
                    >
                      S
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#222",
                          marginBottom: "4px",
                        }}
                      >
                        Sarah
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#666",
                          marginBottom: "8px",
                        }}
                      >
                        New York, NY
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "8px",
                        }}
                      >
                        <div style={{ display: "flex", gap: "2px" }}>
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="#222"
                              stroke="#222"
                              strokeWidth="0"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ))}
                        </div>
                        <span style={{ fontSize: "14px", color: "#666" }}>
                          October 2025
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      color: "#222",
                      lineHeight: "1.6",
                    }}
                  >
                    Amazing unit! The place was clean and had everything I
                    needed. The amenities were great—especially the
                    complimentary bottled water, and all the small touches made
                    the stay comfortable. Highly recommended!
                  </div>
                </div>

                {/* Sample Review 3 */}
                <div style={{ marginBottom: "32px" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        backgroundColor: "#e6e6e6",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        fontWeight: "600",
                        color: "#222",
                      }}
                    >
                      J
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#222",
                          marginBottom: "4px",
                        }}
                      >
                        John
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#666",
                          marginBottom: "8px",
                        }}
                      >
                        Los Angeles, CA
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "8px",
                        }}
                      >
                        <div style={{ display: "flex", gap: "2px" }}>
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="#222"
                              stroke="#222"
                              strokeWidth="0"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ))}
                        </div>
                        <span style={{ fontSize: "14px", color: "#666" }}>
                          September 2025
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      color: "#222",
                      lineHeight: "1.6",
                    }}
                  >
                    Great location and excellent value for money. The host was
                    very responsive and helpful throughout our stay. Would
                    definitely stay here again!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
