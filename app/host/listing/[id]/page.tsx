'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { WeddingRingsIcon } from '@/app/components/WeddingRingsIcon';

declare global {
  interface Window {
    google: typeof google;
  }
}

export default function ListingEditor() {
  const router = useRouter();
  const params = useParams();
  const listingId = params?.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [listingStatusModalOpen, setListingStatusModalOpen] = useState(false);
  const [unlistedOptionsModalOpen, setUnlistedOptionsModalOpen] = useState(false);
  const [unlistFeedbackModalOpen, setUnlistFeedbackModalOpen] = useState(false);
  const [unlistCalendarModalOpen, setUnlistCalendarModalOpen] = useState(false);
  const [isRemovingListing, setIsRemovingListing] = useState(false);
  const [selectedFeedbackReasons, setSelectedFeedbackReasons] = useState<string[]>([]);
  const [listingStatus, setListingStatus] = useState<'listed' | 'unlisted' | 'paused'>('listed');
  const [originalListingStatus, setOriginalListingStatus] = useState<'listed' | 'unlisted' | 'paused'>('listed');
  const [unlistOption, setUnlistOption] = useState<'now' | 'dates' | null>(null);
  const [selectedUnlistDate, setSelectedUnlistDate] = useState<Date | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [editingPrice, setEditingPrice] = useState('');
  const [editingRateType, setEditingRateType] = useState<'head' | 'whole'>('head');
  const [editingGuests, setEditingGuests] = useState('');
  const [selectedGuestRange, setSelectedGuestRange] = useState<string>('');
  const [guestLimit, setGuestLimit] = useState<string>('');
  const [editingDescription, setEditingDescription] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedAccessibilityFeatures, setSelectedAccessibilityFeatures] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);
  const listingStatusModalRef = useRef<HTMLDivElement>(null);
  const unlistedOptionsModalRef = useRef<HTMLDivElement>(null);
  const unlistFeedbackModalRef = useRef<HTMLDivElement>(null);
  const unlistCalendarModalRef = useRef<HTMLDivElement>(null);
  const photoTourRef = useRef<HTMLDivElement>(null);
  const titleEditRef = useRef<HTMLDivElement>(null);
  const occasionEditRef = useRef<HTMLDivElement>(null);
  const pricingEditRef = useRef<HTMLDivElement>(null);
  const guestsEditRef = useRef<HTMLDivElement>(null);
  const descriptionEditRef = useRef<HTMLDivElement>(null);
  const amenitiesEditRef = useRef<HTMLDivElement>(null);
  const accessibilityEditRef = useRef<HTMLDivElement>(null);
  const locationEditRef = useRef<HTMLDivElement>(null);
  const houseRulesEditRef = useRef<HTMLDivElement>(null);
  
  // House rules editing state
  const [editingCheckInStart, setEditingCheckInStart] = useState('2:00 PM');
  const [editingCheckInEnd, setEditingCheckInEnd] = useState('Flexible');
  const [editingCheckout, setEditingCheckout] = useState('12:00 PM');
  const [editingPetsAllowed, setEditingPetsAllowed] = useState(false);
  const [editingSmokingAllowed, setEditingSmokingAllowed] = useState(false);
  
  // Location editing state
  const [editingCountry, setEditingCountry] = useState('Philippines');
  const [editingState, setEditingState] = useState('');
  const [editingCity, setEditingCity] = useState('');
  const [editingStreetAddress, setEditingStreetAddress] = useState('');
  const [editingBuildingUnit, setEditingBuildingUnit] = useState('');
  const [editingZipCode, setEditingZipCode] = useState('');
  const [editingMapUrl, setEditingMapUrl] = useState('');
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const locationSuggestionsRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // Calendar helper functions
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

  const isPastDate = (day: number, month: number, year: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const loadListing = () => {
    if (user) {
      const hostListingsKey = `hostListings_${user.uid}`;
      const savedListings = localStorage.getItem(hostListingsKey);
      if (savedListings) {
        try {
          const listingsData = JSON.parse(savedListings);
          const foundListing = listingsData.find((l: any) => l.id === listingId);
          if (foundListing) {
            setListing(foundListing);
            // Initialize listing status from saved data or default to 'listed'
            // Check if listing is currently unlisted (within date range)
            if (foundListing.status === 'unlisted' && foundListing.unlistFromDate && foundListing.unlistUntilDate) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const fromDate = new Date(foundListing.unlistFromDate);
              fromDate.setHours(0, 0, 0, 0);
              const untilDate = new Date(foundListing.unlistUntilDate);
              untilDate.setHours(0, 0, 0, 0);
              
              if (today >= fromDate && today <= untilDate) {
                // Currently within unlist date range
                setListingStatus('unlisted');
              } else if (today > untilDate) {
                // Past the unlist period, should be listed
                setListingStatus('listed');
                // Auto-update the listing status in storage
                const updatedListings = listingsData.map((l: any) => 
                  l.id === foundListing.id ? { ...l, status: 'listed', unlistFromDate: null, unlistUntilDate: null } : l
                );
                localStorage.setItem(hostListingsKey, JSON.stringify(updatedListings));
              } else {
                // Before unlist period, should be listed
                setListingStatus('listed');
              }
            } else if (foundListing.status) {
              setListingStatus(foundListing.status);
            } else {
              setListingStatus('listed');
            }
            // Initialize unlist date if exists
            if (foundListing.unlistUntilDate) {
              setSelectedUnlistDate(new Date(foundListing.unlistUntilDate));
            }
          }
        } catch (error) {
          console.error('Error loading listing:', error);
        }
      }
    }
  };

  const saveListingChanges = (updatedListing: any) => {
    if (!user) return;
    
    const hostListingsKey = `hostListings_${user.uid}`;
    const savedListings = localStorage.getItem(hostListingsKey);
    if (savedListings) {
      try {
        const listingsData = JSON.parse(savedListings);
        const updatedListings = listingsData.map((l: any) => 
          l.id === listingId ? { ...updatedListing, id: listingId } : l
        );
        localStorage.setItem(hostListingsKey, JSON.stringify(updatedListings));
        setListing({ ...updatedListing, id: listingId });
        
        // Trigger storage event for cross-tab sync
        window.dispatchEvent(new StorageEvent('storage', {
          key: hostListingsKey,
          newValue: JSON.stringify(updatedListings),
          storageArea: localStorage
        }));
        
        // Trigger custom event for same-tab sync
        window.dispatchEvent(new CustomEvent('hostListingsUpdated'));
      } catch (error) {
        console.error('Error saving listing:', error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadListing();
      } else {
        router.push('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [listingId, router]);

  // Reload listing when user changes
  useEffect(() => {
    if (user) {
      loadListing();
    }
  }, [user, listingId]);

  // Countries and states for location editing
  const countries = [
    "Philippines",
    "Thailand",
    "Singapore",
    "Malaysia",
    "Indonesia",
    "Vietnam",
  ];
  const states = [
    "Metro Manila",
    "Cebu",
    "Davao",
    "Laguna",
    "Cavite",
    "Bulacan",
  ];

  // Load Google Maps API for location editing
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyDebebuZpQSlxgNsxYbAYUbKyBtxBKbTIQ";
    
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google && window.google.maps && window.google.maps.places) {
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        }
      };
      document.head.appendChild(script);
    } else if (window.google.maps && window.google.maps.places) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    }
  }, []);

  // Handle location search query changes
  useEffect(() => {
    if (locationSearchQuery.length > 2 && autocompleteServiceRef.current) {
      const request = {
        input: locationSearchQuery,
        types: ["geocode", "establishment"],
      };

      autocompleteServiceRef.current.getPlacePredictions(
        request,
        (predictions, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setLocationSuggestions(predictions.map((p) => p.description));
            setShowLocationSuggestions(true);
          } else {
            setLocationSuggestions([]);
            setShowLocationSuggestions(false);
          }
        }
      );
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  }, [locationSearchQuery]);

  // Handle click outside location suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationSuggestionsRef.current &&
        !locationSuggestionsRef.current.contains(event.target as Node) &&
        locationInputRef.current &&
        !locationInputRef.current.contains(event.target as Node)
      ) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize all fields from listing data - sync with list-your-place
  useEffect(() => {
    if (!listing) return;

    // Initialize occasions - handle both old (occasions) and new (selectedOccasions) field names
    const occasionsList = listing.selectedOccasions || listing.occasions;
    if (occasionsList && Array.isArray(occasionsList)) {
      setSelectedOccasions(occasionsList);
    } else {
      setSelectedOccasions([]);
    }

    // Initialize pricing
    if (listing?.pricing?.eventRate) {
      setEditingPrice(listing.pricing.eventRate);
    }
    if (listing?.pricing?.rateType) {
      setEditingRateType(listing.pricing.rateType === 'head' ? 'head' : 'whole');
    }
    
    // Initialize location
    if (listing?.location) {
      setEditingCountry(listing.location.country || 'Philippines');
      setEditingState(listing.location.state || '');
      setEditingCity(listing.location.city || '');
      setEditingStreetAddress(listing.location.streetAddress || '');
      setEditingBuildingUnit(listing.location.buildingUnit || '');
      setEditingZipCode(listing.location.zipCode || '');
    }
    if (listing?.mapUrl) {
      setEditingMapUrl(listing.mapUrl);
    }
    
    // Initialize house rules (check-in/checkout times)
    if (listing?.checkInStart) {
      setEditingCheckInStart(listing.checkInStart);
    }
    if (listing?.checkInEnd) {
      setEditingCheckInEnd(listing.checkInEnd);
    }
    if (listing?.checkout) {
      setEditingCheckout(listing.checkout);
    }
    
    // Initialize house rules (pets, smoking)
    if (listing?.houseRules) {
      setEditingPetsAllowed(listing.houseRules.petsAllowed || false);
      setEditingSmokingAllowed(listing.houseRules.smokingAllowed || false);
    }

    // Initialize guests and guest range - prioritize guestRange from list-your-place
    if (listing?.guestRange) {
      // guestRange is the user's actual selection from list-your-place
      setSelectedGuestRange(listing.guestRange);
      if (listing?.guests) {
        setEditingGuests(listing.guests.toString());
      }
    } else if (listing?.guests) {
      // Fallback: calculate guest range from guests number if guestRange not available
      setEditingGuests(listing.guests.toString());
      const guestNum = typeof listing.guests === 'string' ? parseInt(listing.guests) : listing.guests;
      if (!isNaN(guestNum)) {
        if (guestNum <= 50) {
          setSelectedGuestRange("1-50");
        } else if (guestNum <= 100) {
          setSelectedGuestRange("51-100");
        } else if (guestNum <= 300) {
          setSelectedGuestRange("101-300");
        } else {
          setSelectedGuestRange("300+");
        }
      }
    }
    
    // Initialize guest limit
    if (listing?.guestLimit) {
      setGuestLimit(listing.guestLimit.toString());
    }

    // Initialize description
    if (listing?.propertyDescription) {
      setEditingDescription(listing.propertyDescription);
    }

    // Initialize amenities - handle both old (amenities) and new (selectedAmenities) field names
    const amenitiesList = listing.selectedAmenities || listing.amenities;
    if (amenitiesList && Array.isArray(amenitiesList)) {
      // Filter out accessibility features from amenities
      const accessibilityFeatureIds = accessibilityFeatures.map(f => f.id);
      const regularAmenities = amenitiesList.filter((id: string) => 
        !accessibilityFeatureIds.includes(id)
      );
      setSelectedAmenities(regularAmenities);
    } else {
      setSelectedAmenities([]);
    }
    
    // Initialize accessibility features separately
    if (listing?.accessibilityFeatures && Array.isArray(listing.accessibilityFeatures)) {
      setSelectedAccessibilityFeatures(listing.accessibilityFeatures);
    } else {
      // Fallback: check if accessibility features are in amenities (for backward compatibility)
      const amenitiesList = listing.selectedAmenities || listing.amenities;
      if (amenitiesList && Array.isArray(amenitiesList)) {
        const accessibilityFeatureIds = accessibilityFeatures.map(f => f.id);
        const filteredAccessibilityFeatures = amenitiesList.filter((id: string) => 
          accessibilityFeatureIds.includes(id)
        );
        setSelectedAccessibilityFeatures(filteredAccessibilityFeatures);
      } else {
        setSelectedAccessibilityFeatures([]);
      }
    }
  }, [listing]);

  // Extract address components from place details
  const extractAddressComponents = (place: google.maps.places.PlaceResult) => {
    const addressComponents = place.address_components || [];

    addressComponents.forEach((component) => {
      const types = component.types;

      if (types.includes("country")) {
        setEditingCountry(component.long_name);
      }
      if (types.includes("administrative_area_level_1")) {
        setEditingState(component.long_name);
      }
      if (
        types.includes("locality") ||
        types.includes("administrative_area_level_2")
      ) {
        setEditingCity(component.long_name);
      }
      if (types.includes("postal_code")) {
        setEditingZipCode(component.long_name);
      }
      if (types.includes("street_number")) {
        setEditingStreetAddress(component.long_name + " ");
      }
      if (types.includes("route")) {
        setEditingStreetAddress((prev) => (prev || "") + component.long_name);
      }
    });

    // Update map URL
    if (place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const encodedQuery = encodeURIComponent(
        place.formatted_address || locationSearchQuery
      );
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyDebebuZpQSlxgNsxYbAYUbKyBtxBKbTIQ";
      setEditingMapUrl(
        `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedQuery}&zoom=15`
      );
    }
  };

  // Handle location suggestion selection
  const handleLocationSuggestionClick = (suggestion: string) => {
    setLocationSearchQuery(suggestion);
    setShowLocationSuggestions(false);

    if (window.google && window.google.maps && window.google.maps.places) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: suggestion }, (results, status) => {
        if (
          status === window.google.maps.GeocoderStatus.OK &&
          results &&
          results[0]
        ) {
          extractAddressComponents(results[0]);
        }
      });
    }
  };

  // Accessibility features array
  const accessibilityFeatures = [
    { id: "ramps", name: "Ramps" },
    { id: "elevator", name: "Elevator" },
    { id: "escalator", name: "Escalator" },
    { id: "stairs", name: "Stairs" },
    { id: "pwd-parking", name: "PWD parking" },
    { id: "parking-area", name: "Parking area" },
    { id: "step-free-access", name: "Step-free access" },
    { id: "wide-doorway", name: "Wide doorway" },
    { id: "disabled-bathroom", name: "Disabled bathroom" },
    { id: "wheelchair-accessible", name: "Wheelchair accessible" },
    { id: "proximity-bus-stop", name: "Proximity to bus stop" },
    { id: "pwd-access", name: "PWD access" }
  ];

  // Amenities array - matching list-your-place
  const amenities = [
    { id: "main-event-hall", name: "Main event hall" },
    { id: "open-space", name: "Open space" },
    { id: "outdoor-garden", name: "Outdoor garden" },
    { id: "swimming-pool", name: "Swimming pool" },
    { id: "beach", name: "Beach" },
    { id: "changing-rooms", name: "Changing rooms" },
    { id: "backstage-area", name: "Backstage area" },
    { id: "catering-services", name: "Catering services" },
    { id: "service-staff", name: "Service staff" },
    { id: "tables", name: "Tables" },
    { id: "beverage-stations", name: "Beverage stations" },
    { id: "cake-table", name: "Cake table" },
    { id: "chairs", name: "Chairs" },
    { id: "linens", name: "Linens" },
    { id: "decor-items", name: "Decor items" },
    { id: "stage-platform", name: "Stage platform" },
    { id: "microphones", name: "Microphones" },
    { id: "speakers", name: "Speakers" },
    { id: "dj-booth", name: "DJ booth" },
    { id: "projector-screen", name: "Projector & screen" },
    { id: "led-screens", name: "LED screens" },
    { id: "lighting-equipments", name: "Lighting equipments" },
    { id: "dance-floor", name: "Dance floor" },
    { id: "registration", name: "Registration" },
    { id: "parking", name: "Parking" },
    { id: "pwd-access", name: "PWD access" },
    { id: "air-conditioning", name: "Air conditioning" },
    { id: "wifi", name: "Wifi" },
    { id: "fans", name: "Fans" },
    { id: "restrooms", name: "Restrooms" },
    { id: "waste-bins", name: "Waste bins" },
    { id: "security", name: "Security" },
    { id: "emergency-exits", name: "Emergency Exits" },
    { id: "fire-safety-equipments", name: "Fire safety Equipments" },
    { id: "first-aid", name: "First-Aid" },
    { id: "cleaning-services", name: "Cleaning services" },
  ];

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const toggleAccessibilityFeature = (amenityId: string) => {
    setSelectedAccessibilityFeatures((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  // Occasions array - matching list-your-place
  const occasions = [
    {
      id: "wedding",
      name: "Wedding",
      icon: <WeddingRingsIcon size={40} color="currentColor" />,
    },
    {
      id: "conference",
      name: "Conference",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="3" y="5" width="18" height="11" rx="1" fill="currentColor" />
          <rect x="4" y="6" width="16" height="9" rx="0.5" fill="#fff" />
          <circle cx="12" cy="11" r="2.5" fill="currentColor" />
          <rect x="9" y="13.5" width="6" height="8" rx="0.5" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: "birthday",
      name: "Birthday",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="5" y="16" width="14" height="4" rx="1" fill="currentColor" />
          <rect x="5.5" y="15.5" width="13" height="1" fill="#fff" />
          <rect x="6" y="12" width="12" height="4" rx="0.5" fill="currentColor" />
          <rect x="6.5" y="11.5" width="11" height="1" fill="#fff" />
          <rect x="7" y="8" width="10" height="4" rx="0.5" fill="currentColor" />
          <rect x="11" y="4" width="2" height="4" fill="currentColor" />
          <circle cx="12" cy="3" r="1.5" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: "funeral",
      name: "Funeral",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 7 Q12 2, 18 7 L18 15 L6 15 Z"
            fill="currentColor"
          />
          <rect x="11" y="7" width="2" height="8" fill="#fff" />
          <rect x="9" y="9" width="6" height="2" fill="#fff" />
          <rect x="10.5" y="7" width="3" height="1" fill="#fff" />
          <rect x="5.5" y="15" width="13" height="2" fill="currentColor" />
          <rect x="4.5" y="17" width="15" height="3" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: "sweet-18th",
      name: "Sweet 18th",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="6" y="6" width="2.2" height="12" rx="0.4" fill="currentColor" />
          <ellipse cx="14" cy="9.5" rx="3.5" ry="3.5" fill="currentColor" />
          <ellipse cx="14" cy="15.5" rx="3.5" ry="3.5" fill="currentColor" />
          <circle cx="14" cy="9.5" r="1.8" fill="#fff" />
          <circle cx="14" cy="15.5" r="1.8" fill="#fff" />
        </svg>
      ),
    },
    {
      id: "exhibition",
      name: "Exhibition",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="3" y="3" width="18" height="12" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M4 13 L8 5 L12 8 L12 13 Z" fill="currentColor" />
          <path d="M12 13 L12 8 L16 7 L20 13 Z" fill="currentColor" />
          <circle cx="18" cy="6" r="2" fill="currentColor" />
          <rect x="5" y="16" width="2" height="4" fill="currentColor" />
          <circle cx="6" cy="16" r="1" fill="currentColor" />
          <rect x="17" y="16" width="2" height="4" fill="currentColor" />
          <circle cx="18" cy="16" r="1" fill="currentColor" />
          <path d="M7 17 Q12 15, 17 17" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      ),
    },
    {
      id: "seminars",
      name: "Seminars",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="6" r="3" fill="currentColor" />
          <rect x="8.5" y="9" width="7" height="4" rx="0.5" fill="currentColor" />
          <rect x="5" y="12" width="14" height="2.5" fill="currentColor" />
          <rect x="7" y="14.5" width="10" height="7" rx="1.5" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: "anniversaries",
      name: "Anniversaries",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 2 Q12 2 19 2 Q19 4 19 7 Q19 10 12 10 Q5 10 5 7 Q5 4 5 2" />
          <line x1="12" y1="10" x2="12" y2="17" />
          <path d="M8 19 A4 4 0 0 1 16 19" />
          <line x1="8" y1="19" x2="16" y2="19" />
          <path d="M6.5 8 Q12 7.5 17.5 8" fill="none" />
        </svg>
      ),
    },
    {
      id: "recreation-fun",
      name: "Recreation and Fun",
      icon: (
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 4 L18 12 L12 20 L6 12 Z" fill="currentColor" />
          <line x1="12" y1="4" x2="12" y2="20" stroke="#fff" strokeWidth="1.5" />
          <line x1="6" y1="12" x2="18" y2="12" stroke="#fff" strokeWidth="1.5" />
          <path d="M12 20 L10 22 L12 23 L14 22 Z" fill="currentColor" />
          <circle cx="10" cy="22" r="0.8" fill="currentColor" />
          <circle cx="14" cy="22" r="0.8" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: "prom",
      name: "Prom",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7 1 L11 3 L7 5 Z" fill="currentColor" />
          <path d="M17 1 L13 3 L17 5 Z" fill="currentColor" />
          <rect x="11" y="2.5" width="2" height="1" fill="currentColor" />
          <path d="M4 4 Q4 5 5 6.5 Q6 8 7.5 9 Q9 10 10.5 10.5 Q12 11 13.5 10.5 Q15 10 16.5 9 Q18 8 19 6.5 Q20 5 20 4 L20 20 L4 20 Z" fill="currentColor" />
          <path d="M8.5 6.5 Q9 7.5 9.5 8.5 Q10 9.5 10.5 10 Q11 10.5 12 10.5 Q13 10.5 13.5 10 Q14 9.5 14.5 8.5 Q15 7.5 15.5 6.5 L15.5 18 L8.5 18 Z" fill="#fff" />
          <circle cx="12" cy="10.5" r="0.7" fill="currentColor" />
          <circle cx="12" cy="13" r="0.7" fill="currentColor" />
          <circle cx="12" cy="15.5" r="0.7" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: "acquaintance-party",
      name: "Acquaintance Party",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: "bridal-showers",
      name: "Bridal Showers",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="3.5" r="3" fill="currentColor" />
          <circle cx="12" cy="3.5" r="2" fill="#fff" />
          <path d="M9 1.5 Q12 0.5 15 1.5 Q15 1 12 1 Q9 1 9 1.5" fill="currentColor" />
          <path d="M8.5 2 Q12 1.2 15.5 2" stroke="currentColor" strokeWidth="2" fill="none" />
          <line x1="11" y1="6.5" x2="11" y2="7.5" strokeWidth="1.5" />
          <line x1="13" y1="6.5" x2="13" y2="7.5" strokeWidth="1.5" />
          <path d="M10 7.5 L10 10.5 L14 10.5 L14 7.5 Q12 7 10 7.5" />
          <path d="M10 8 L8.5 7 L5 4.5 L3 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M14 8 L15.5 7 L19 4.5 L21 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <line x1="10" y1="7.5" x2="9" y2="9" strokeWidth="1.5" />
          <line x1="14" y1="7.5" x2="15" y2="9" strokeWidth="1.5" />
          <line x1="10" y1="10.5" x2="14" y2="10.5" strokeWidth="2" />
          <path d="M10 10.5 L14 10.5 L18 22 L6 22 Z" />
        </svg>
      ),
    },
    {
      id: "family-reunion",
      name: "Family Reunion",
      icon: (
        <svg
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="6" cy="6" r="1.6" fill="currentColor" />
          <path d="M4 8.5 L8 8.5 L7.5 13.5 L4.5 13.5 Z" fill="currentColor" />
          <path d="M3.8 9.2 Q3.3 9.7 2.8 10.5 Q2.3 11.3 2.3 12.2 Q2.3 12.8 3.3 12.8 Q4.3 12.8 4.3 11.8 Q4.3 10.5 3.8 9.5 Z" fill="currentColor" />
          <path d="M8.2 9.2 Q8.7 9.7 9.2 10.5 Q9.7 11.3 9.7 12.2 Q9.7 12.8 8.7 12.8 Q7.7 12.8 7.7 11.8 Q7.7 10.5 8.2 9.5 Z" fill="currentColor" />
          <circle cx="18" cy="6" r="1.6" fill="currentColor" />
          <path d="M16 8.5 L20 8.5 L19.5 13.5 L16.5 13.5 Z" fill="currentColor" />
          <path d="M15.8 9.2 Q15.3 9.7 14.8 10.5 Q14.3 11.3 14.3 12.2 Q14.3 12.8 15.3 12.8 Q16.3 12.8 16.3 11.8 Q16.3 10.5 15.8 9.5 Z" fill="currentColor" />
          <path d="M20.2 9.2 Q20.7 9.7 21.2 10.5 Q21.7 11.3 21.7 12.2 Q21.7 12.8 20.7 12.8 Q19.7 12.8 19.7 11.8 Q19.7 10.5 20.2 9.5 Z" fill="currentColor" />
          <circle cx="12" cy="8" r="1.3" fill="currentColor" />
          <path d="M10.5 10.2 L13.5 10.2 L13 13.5 L11 13.5 Z" fill="currentColor" />
          <path d="M10.2 10.2 Q10.2 10.7 9.7 11.2 Q9.2 11.7 8.7 12.2 Q8.2 12.7 8.7 13.2 Q9.2 13.7 9.7 13.2 Q10.2 12.7 10.7 12.2 Q11.2 11.7 11.2 11.2 Q11.2 10.7 10.7 10.2 Z" fill="currentColor" />
          <path d="M13.8 10.2 Q13.8 10.7 14.3 11.2 Q14.8 11.7 15.3 12.2 Q15.8 12.7 15.3 13.2 Q14.8 13.7 14.3 13.2 Q13.8 12.7 13.3 12.2 Q12.8 11.7 12.8 11.2 Q12.8 10.7 13.3 10.2 Z" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: "graduation",
      name: "Graduation",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 10v6M2 10l10 5 10-5-10-5L2 10z" />
          <path d="M6 12v5c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-5" />
        </svg>
      ),
    },
    {
      id: "team-building",
      name: "Team Building",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="5" y="18" width="14" height="2" rx="0.2" fill="currentColor" />
          <rect x="6" y="16" width="12" height="2" rx="0.2" fill="currentColor" />
          <rect x="5" y="14" width="14" height="2" rx="0.2" fill="currentColor" />
          <rect x="6" y="12" width="12" height="2" rx="0.2" fill="currentColor" />
          <rect x="5" y="10" width="14" height="2" rx="0.2" fill="currentColor" />
          <rect x="6" y="8" width="12" height="2" rx="0.2" fill="currentColor" />
          <rect x="5" y="6" width="14" height="2" rx="0.2" fill="currentColor" />
          <rect x="6" y="4" width="12" height="2" rx="0.2" fill="currentColor" />
          <rect x="3" y="10" width="3" height="2" rx="0.2" fill="currentColor" />
          <rect x="18" y="8" width="3" height="2" rx="0.2" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: "baby-showers",
      name: "Baby Showers",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="6" r="3" fill="currentColor" />
          <rect x="9" y="9" width="6" height="4" rx="0.5" fill="currentColor" />
          <path d="M10 13 L14 13 L15.5 17 L8.5 17 Z" fill="#fff" />
          <path d="M9 9 L9 13 Q6 11 6.5 12.5 Q7 13.5 7.2 12.5 Q7.5 11 9 9" fill="currentColor" />
          <circle cx="7" cy="13" r="1.2" fill="currentColor" />
          <path d="M15 9 L15 13 Q18 11 17.5 12.5 Q17 13.5 16.8 12.5 Q16.5 11 15 9" fill="currentColor" />
          <circle cx="17" cy="13" r="1.2" fill="currentColor" />
          <path d="M10 13 L8 15.5 L7 18 L8.5 20 L11 18 L11.5 15.5 L10 13" fill="currentColor" />
          <path d="M14 13 L16 15.5 L17 18 L15.5 20 L13 18 L12.5 15.5 L14 13" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: "christening",
      name: "Christening",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="11" y="4" width="2" height="16" fill="currentColor" />
          <rect x="6" y="8" width="12" height="2" fill="currentColor" />
        </svg>
      ),
    },
  ];

  const toggleOccasion = (occasionId: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(occasionId)
        ? prev.filter((id) => id !== occasionId)
        : [...prev, occasionId]
    );
  };

  // Listen for storage changes to sync updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (user && e.key === `hostListings_${user.uid}`) {
        loadListing();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Also listen for custom storage events (same-tab updates)
    const handleCustomStorageChange = () => {
      loadListing();
    };
    
    window.addEventListener('hostListingsUpdated', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener('hostListingsUpdated', handleCustomStorageChange);
    };
  }, [user, listingId]);

  // Handle click outside modal to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setViewModalOpen(false);
      }
    };

    if (viewModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [viewModalOpen]);

  // Handle click outside settings dropdown to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target as Node)) {
        setSettingsDropdownOpen(false);
      }
    };

    if (settingsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [settingsDropdownOpen]);

  // Handle click outside listing status modal to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listingStatusModalRef.current && !listingStatusModalRef.current.contains(event.target as Node)) {
        setListingStatusModalOpen(false);
      }
    };

    if (listingStatusModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [listingStatusModalOpen]);

  // Handle click outside unlisted options modal to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (unlistedOptionsModalRef.current && !unlistedOptionsModalRef.current.contains(event.target as Node)) {
        setUnlistedOptionsModalOpen(false);
      }
    };

    if (unlistedOptionsModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [unlistedOptionsModalOpen]);

  // Handle click outside unlist feedback modal to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (unlistFeedbackModalRef.current && !unlistFeedbackModalRef.current.contains(event.target as Node)) {
        setUnlistFeedbackModalOpen(false);
      }
    };

    if (unlistFeedbackModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [unlistFeedbackModalOpen]);

  // Handle click outside unlist calendar modal to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (unlistCalendarModalRef.current && !unlistCalendarModalRef.current.contains(event.target as Node)) {
        setUnlistCalendarModalOpen(false);
      }
    };

    if (unlistCalendarModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [unlistCalendarModalOpen]);

  // Check if listing should be automatically relisted based on date
  useEffect(() => {
    if (listing && listing.unlistUntilDate) {
      const unlistUntil = new Date(listing.unlistUntilDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      unlistUntil.setHours(0, 0, 0, 0);
      
      if (today > unlistUntil && listing.status === 'unlisted') {
        // Automatically relist if the date has passed
        if (user) {
          const hostListingsKey = `hostListings_${user.uid}`;
          const savedListings = localStorage.getItem(hostListingsKey);
          if (savedListings) {
            try {
              const listingsData = JSON.parse(savedListings);
              const updatedListings = listingsData.map((l: any) => 
                l.id === listing.id ? { ...l, status: 'listed', unlistUntilDate: null, unlistFromDate: null } : l
              );
              localStorage.setItem(hostListingsKey, JSON.stringify(updatedListings));
              setListing({ ...listing, status: 'listed', unlistUntilDate: null, unlistFromDate: null });
              setListingStatus('listed');
            } catch (error) {
              console.error('Error updating listing status:', error);
            }
          }
        }
      } else if (listing.status === 'unlisted' && listing.unlistFromDate && listing.unlistUntilDate) {
        // Check if we're currently within the unlist date range
        const fromDate = new Date(listing.unlistFromDate);
        fromDate.setHours(0, 0, 0, 0);
        const untilDate = new Date(listing.unlistUntilDate);
        untilDate.setHours(0, 0, 0, 0);
        
        if (today >= fromDate && today <= untilDate) {
          // Currently in unlist period
          setListingStatus('unlisted');
        } else if (today < fromDate) {
          // Before unlist period, should be listed
          if (user) {
            const hostListingsKey = `hostListings_${user.uid}`;
            const savedListings = localStorage.getItem(hostListingsKey);
            if (savedListings) {
              try {
                const listingsData = JSON.parse(savedListings);
                const updatedListings = listingsData.map((l: any) => 
                  l.id === listing.id ? { ...l, status: 'listed' } : l
                );
                localStorage.setItem(hostListingsKey, JSON.stringify(updatedListings));
                setListing({ ...listing, status: 'listed' });
                setListingStatus('listed');
              } catch (error) {
                console.error('Error updating listing status:', error);
              }
            }
          }
        }
      }
    }
  }, [listing, user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Listing not found</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #e6e6e6',
        padding: '24px 80px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        position: 'sticky',
        top: 0,
        backgroundColor: '#fff',
        zIndex: 100
      }}>
        <button
          onClick={() => router.push('/host?tab=listings')}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#222',
          margin: 0
        }}>
          Listing editor
        </h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' }}>
          <button
            onClick={() => {
              setSelectedImageIndex(0);
              setViewModalOpen(true);
            }}
            style={{
              padding: '12px',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            View
          </button>
          <div ref={settingsDropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
              style={{
                padding: '12px',
                background: 'transparent',
                color: '#222',
                border: '1px solid #e6e6e6',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
            {settingsDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                minWidth: '200px',
                padding: '8px 0',
                zIndex: 1000,
                border: '1px solid #e6e6e6'
              }}>
                <button
                  onClick={() => {
                    setSettingsDropdownOpen(false);
                    // Set status based on actual listing status, default to 'listed' if not unlisted/paused
                    let initialStatus: 'listed' | 'unlisted' | 'paused' = 'listed';
                    if (listing) {
                      if (listing.status === 'unlisted') {
                        initialStatus = 'unlisted';
                      } else if (listing.status === 'paused' && listing.unlistFromDate && listing.unlistUntilDate) {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const fromDate = new Date(listing.unlistFromDate);
                        fromDate.setHours(0, 0, 0, 0);
                        const untilDate = new Date(listing.unlistUntilDate);
                        untilDate.setHours(0, 0, 0, 0);
                        if (today >= fromDate && today <= untilDate) {
                          initialStatus = 'paused';
                        } else {
                          initialStatus = 'listed';
                        }
                      } else {
                        initialStatus = 'listed';
                      }
                    }
                    setListingStatus(initialStatus);
                    setOriginalListingStatus(initialStatus);
                    setListingStatusModalOpen(true);
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
                  Listing Status
                </button>
                <button
                  onClick={() => {
                    setSettingsDropdownOpen(false);
                    setIsRemovingListing(true);
                    setSelectedFeedbackReasons([]);
                    setUnlistFeedbackModalOpen(true);
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
                  Remove Listing
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        minHeight: 'calc(100vh - 73px)'
      }}>
        {/* Left Sidebar */}
        <div style={{
          width: '320px',
          borderRight: '1px solid #e6e6e6',
          backgroundColor: '#fafafa',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 73px)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1
          }}>
          {/* Photo Tour Card */}
          <div 
            onClick={() => {
              setActiveSection(null); // Set to null to show photo tour editor
              setTimeout(() => {
                photoTourRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
            style={{
              border: '1px solid #e6e6e6',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#fff',
              marginBottom: '24px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#1976d2';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e6e6e6';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #e6e6e6'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#222',
                margin: 0
              }}>
                Event Photos
              </h3>
            </div>
            <div style={{
              position: 'relative',
              padding: '16px'
            }}>
              {/* Stacked Images */}
              <div style={{
                position: 'relative',
                height: '200px',
                marginBottom: '16px'
              }}>
                {listing.photos && listing.photos.length > 0 ? (
                  <>
                    {listing.photos.slice(0, 3).map((photo: any, index: number) => (
                      <div
                        key={photo.id}
                        style={{
                          position: 'absolute',
                          top: `${index * 8}px`,
                          left: `${index * 8}px`,
                          width: 'calc(100% - 16px)',
                          height: 'calc(100% - 16px)',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid #e6e6e6',
                          zIndex: 3 - index
                        }}
                      >
                        <img
                          src={photo.url}
                          alt={`Photo ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        {index === 0 && (
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'rgba(0, 0, 0, 0.6)',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {listing.photos.length} photos
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: '#f6f7f8',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666',
                    fontSize: '14px'
                  }}>
                    No photos
                  </div>
                )}
              </div>
              <p style={{
                fontSize: '14px',
                color: '#666',
                margin: 0
              }}>
                You have {listing.photos?.length || 0} photo{listing.photos?.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Title Card */}
          <div 
            onClick={() => {
              setActiveSection('title');
              setEditingTitle(listing.propertyName || 'Your All-in-One Cebu Stay – Beach, Pool & Dining');
              setTimeout(() => {
                titleEditRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
            style={{
              border: '1px solid #e6e6e6',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#fff',
              marginBottom: '16px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#1976d2';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e6e6e6';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#222',
              marginBottom: '8px'
            }}>
              Title
            </div>
            <div style={{
              fontSize: '16px',
              color: '#666',
              lineHeight: '1.5'
            }}>
              {listing.propertyName || 'Your All-in-One Cebu Stay – Beach, Pool & Dining'}
            </div>
          </div>

          {/* Property Type Card */}
          <div 
            onClick={() => {
              setActiveSection('occasion');
              setTimeout(() => {
                occasionEditRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
            style={{
              border: '1px solid #e6e6e6',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#fff',
              marginBottom: '16px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#1976d2';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e6e6e6';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#222',
              marginBottom: '8px'
            }}>
              Occasion
            </div>
            <div style={{
              fontSize: '14px',
              color: '#999',
              lineHeight: '1.5'
            }}>
              {(listing.selectedOccasions || listing.occasions) && (listing.selectedOccasions || listing.occasions).length > 0
                ? (() => {
                    const occasionsList = listing.selectedOccasions || listing.occasions;
                    const displayedOccasions = occasionsList.slice(0, 3);
                    const remainingCount = occasionsList.length - 3;
                    const occasionNames = displayedOccasions.map((id: string) => {
                      const occasion = occasions.find((o) => o.id === id);
                      return occasion ? occasion.name : id;
                    }).join(' · ');
                    return remainingCount > 0 
                      ? `${occasionNames} · +${remainingCount} more`
                      : occasionNames;
                  })()
                : 'No occasions selected'}
            </div>
          </div>

          {/* Pricing Card */}
          <div 
            onClick={() => {
              setActiveSection('pricing');
              setTimeout(() => {
                pricingEditRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
            style={{
              border: '1px solid #e6e6e6',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#fff',
              marginBottom: '16px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#1976d2';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e6e6e6';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#222',
              marginBottom: '8px'
            }}>
              Pricing
            </div>
            <div style={{
              fontSize: '14px',
              color: '#999',
              lineHeight: '1.8'
            }}>
              {listing.pricing?.eventRate 
                ? `₱${parseFloat(listing.pricing.eventRate).toLocaleString()} ${listing.pricing?.rateType === 'head' ? 'per head' : 'per event'}`
                : 'No price set'}
            </div>
          </div>

          {/* Number of Guests Card */}
          <div 
            onClick={() => {
              setActiveSection('guests');
              setTimeout(() => {
                guestsEditRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
            style={{
              border: '1px solid #e6e6e6',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#fff',
              marginBottom: '16px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#1976d2';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e6e6e6';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#222',
              marginBottom: '8px'
            }}>
              Number of guests
            </div>
            <div style={{
              fontSize: '14px',
              color: '#999',
              lineHeight: '1.8'
            }}>
              {listing.guestRange 
                ? (() => {
                    const rangeLabels: { [key: string]: string } = {
                      '1-50': '1-50 pax (Small)',
                      '51-100': '51-100 pax (Medium)',
                      '101-300': '101-300 pax (Large)',
                      '300+': '300+ pax (Grand Event)'
                    };
                    return rangeLabels[listing.guestRange] || listing.guestRange;
                  })()
                : listing.guests 
                  ? (() => {
                      const guestNum = typeof listing.guests === 'string' ? parseInt(listing.guests) : listing.guests;
                      if (guestNum <= 50) {
                        return '1-50 pax (Small)';
                      } else if (guestNum <= 100) {
                        return '51-100 pax (Medium)';
                      } else if (guestNum <= 300) {
                        return '101-300 pax (Large)';
                      } else {
                        return '300+ pax (Grand Event)';
                      }
                    })()
                  : 'No guests set'}
              {listing.guestLimit && (
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginTop: '4px',
                  fontWeight: '500'
                }}>
                  Guest limit: {listing.guestLimit.toLocaleString()} pax
                </div>
              )}
            </div>
          </div>

          {/* Description Card */}
          <div 
            onClick={() => {
              setActiveSection('description');
              setTimeout(() => {
                descriptionEditRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
            style={{
              border: '1px solid #e6e6e6',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#fff',
              marginBottom: '16px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#1976d2';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e6e6e6';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#222',
              marginBottom: '8px'
            }}>
              Description
            </div>
            <div style={{
              fontSize: '14px',
              color: '#222',
              lineHeight: '1.6',
              maxHeight: '60px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {listing.propertyDescription || 'No description'}
            </div>
          </div>

          {/* Amenities Card */}
          <div 
            onClick={() => {
              setActiveSection('amenities');
              setTimeout(() => {
                amenitiesEditRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
            style={{
              border: '1px solid #e6e6e6',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#fff',
              marginBottom: '24px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#1976d2';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e6e6e6';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#222',
              marginBottom: '16px'
            }}>
              Amenities
            </div>
            {(listing.selectedAmenities || listing.amenities) && (listing.selectedAmenities || listing.amenities).length > 0 ? (
              <div style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.8'
              }}>
                {(() => {
                  const amenitiesList = listing.selectedAmenities || listing.amenities || [];
                  // Filter out accessibility features from amenities display
                  const accessibilityFeatureIds = accessibilityFeatures.map(f => f.id);
                  const regularAmenities = amenitiesList.filter((id: string) => 
                    !accessibilityFeatureIds.includes(id)
                  );
                  const displayedAmenities = regularAmenities.slice(0, 3);
                  const remainingCount = regularAmenities.length - 3;
                  const amenityNames = displayedAmenities.map((amenityId: string) => {
                    const amenity = amenities.find(a => a.id === amenityId);
                    return amenity ? amenity.name : amenityId;
                  }).join(' · ');
                  return remainingCount > 0 
                    ? `${amenityNames} · +${remainingCount} more`
                    : amenityNames;
                })()}
              </div>
            ) : (
              <div style={{
                fontSize: '14px',
                color: '#999',
                lineHeight: '1.5'
              }}>
                No amenities selected
              </div>
            )}
          </div>

          {/* Accessibility Features Card */}
          <div 
            onClick={() => {
              setActiveSection('accessibility');
              setTimeout(() => {
                accessibilityEditRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
            style={{
              border: '1px solid #e6e6e6',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#fff',
              marginBottom: '24px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#1976d2';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e6e6e6';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#222',
              marginBottom: '16px'
            }}>
              Accessibility features
            </div>
            {selectedAccessibilityFeatures && selectedAccessibilityFeatures.length > 0 ? (
              <div style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.8'
              }}>
                {(() => {
                  const displayedFeatures = selectedAccessibilityFeatures.slice(0, 3);
                  const remainingCount = selectedAccessibilityFeatures.length - 3;
                  const featureNames = displayedFeatures.map((amenityId: string) => {
                    const amenity = amenities.find(a => a.id === amenityId);
                    return amenity ? amenity.name : amenityId;
                  }).join(' · ');
                  return remainingCount > 0 
                    ? `${featureNames} · +${remainingCount} more`
                    : featureNames;
                })()}
              </div>
            ) : (
              <div style={{
                fontSize: '14px',
                color: '#999',
                lineHeight: '1.5'
              }}>
                No accessibility features added
              </div>
            )}
          </div>

          {/* Location Card */}
          <div 
            onClick={() => {
              setActiveSection('location');
              setTimeout(() => {
                locationEditRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
            style={{
            border: '1px solid #e6e6e6',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#fff',
            marginBottom: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#1976d2';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e6e6e6';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
          >
            {/* Map */}
            <div style={{
              width: '100%',
              height: '200px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {listing.mapUrl ? (
                <iframe
                  src={listing.mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: '#f6f7f8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  fontSize: '14px'
                }}>
                  Map not available
                </div>
              )}
            </div>
            {/* Address */}
            <div style={{
              padding: '16px'
            }}>
              <div style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.6'
              }}>
                {listing.location 
                  ? `${listing.location.streetAddress || ''}${listing.location.streetAddress && listing.location.city ? ', ' : ''}${listing.location.city || ''}${listing.location.city && listing.location.state ? ', ' : ''}${listing.location.state || ''}${listing.location.zipCode ? `, ${listing.location.zipCode}` : ''}${listing.location.state ? ', Philippines' : ''}`
                  : 'Mactan Newtown, The Mactan Newtown, Lapu-Lapu, 6000, Central Visayas, Philippines'}
              </div>
            </div>
          </div>

          {/* Event Rules Card */}
          <div 
            onClick={() => {
              setActiveSection('houseRules');
              setTimeout(() => {
                houseRulesEditRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
            style={{
              border: '1px solid #e6e6e6',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#fff',
              marginBottom: '24px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#1976d2';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e6e6e6';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#222',
              marginBottom: '16px'
            }}>
              Event Rules
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {/* Check-in */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span style={{ fontSize: '14px', color: '#222' }}>
                  Check-in after {listing?.checkInStart || '2:00 PM'}
                  {listing?.checkInEnd && listing.checkInEnd !== 'Flexible' ? ` - ${listing.checkInEnd}` : ''}
                </span>
              </div>
              
              {/* Checkout */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span style={{ fontSize: '14px', color: '#222' }}>
                  Checkout before {listing?.checkout || '12:00 PM'}
                </span>
              </div>
              
              {/* Event Rules */}
              {listing?.houseRules && (
                <>
                  {/* Pets allowed */}
                  {listing.houseRules.petsAllowed !== undefined && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginTop: '12px'
                    }}>
                      <span style={{ fontSize: '14px', color: '#222' }}>
                        Pets {listing.houseRules.petsAllowed ? 'allowed' : 'not allowed'}
                      </span>
                    </div>
                  )}
                  
                  {/* Smoking allowed */}
                  {listing.houseRules.smokingAllowed !== undefined && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginTop: '12px'
                    }}>
                      <span style={{ fontSize: '14px', color: '#222' }}>
                        Smoking {listing.houseRules.smokingAllowed ? 'allowed' : 'not allowed'}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Spacer to ensure content is scrollable to bottom */}
          <div style={{ marginBottom: '24px' }}></div>
          </div>
        </div>

        {/* Right Content Area */}
        <div 
          ref={
            activeSection === 'title' ? titleEditRef : 
            activeSection === 'occasion' ? occasionEditRef : 
            activeSection === 'pricing' ? pricingEditRef :
            activeSection === 'location' ? locationEditRef :
            activeSection === 'houseRules' ? houseRulesEditRef :
            activeSection === 'guests' ? guestsEditRef :
            activeSection === 'description' ? descriptionEditRef :
            photoTourRef
          }
          style={{
            flex: 1,
            padding: '40px 80px'
          }}
        >
          {activeSection === 'pricing' ? (
            /* Pricing Editor */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '60vh',
              position: 'relative'
            }}>
              {/* Pricing Option Heading */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '24px'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#222',
                  margin: 0
                }}>
                  Pricing Option
                </h2>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ff9800'
                }}></div>
              </div>

              {/* Price Display Box */}
              <div style={{
                backgroundColor: '#fff',
                border: '1px solid #e6e6e6',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#999',
                  fontWeight: '400'
                }}>
                  {editingRateType === 'head' ? 'Per Head' : 'Whole Event'}
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#222'
                }}>
                  ₱{editingPrice ? parseFloat(editingPrice).toLocaleString() : '0'}
                </div>
              </div>

              {/* Event Rate Input */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Event rate
                </label>
                <input
                  type="text"
                  value={editingPrice}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numericValue = value.replace(/[^0-9.]/g, '');
                    const parts = numericValue.split('.');
                    const filteredValue = parts.length > 2 
                      ? parts[0] + '.' + parts.slice(1).join('')
                      : numericValue;
                    if (
                      filteredValue === "" ||
                      (parseFloat(filteredValue) >= 0 &&
                        parseFloat(filteredValue) <= 1000000000)
                    ) {
                      setEditingPrice(filteredValue);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (
                      !/[0-9]/.test(e.key) &&
                      !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', '.', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) &&
                      !(e.ctrlKey || e.metaKey)
                    ) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Enter event rate"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#222'
                  }}
                />
              </div>

              {/* Radio Button Options */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '48px'
              }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #e6e6e6',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (editingRateType !== "head") {
                      e.currentTarget.style.backgroundColor = '#eeeeee';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (editingRateType !== "head") {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                    }
                  }}
                >
                  <span style={{
                    fontSize: '14px',
                    color: '#222',
                    fontWeight: '400'
                  }}>
                    per head
                  </span>
                  <input
                    type="radio"
                    name="rateType"
                    value="head"
                    checked={editingRateType === "head"}
                    onChange={(e) =>
                      setEditingRateType(e.target.value as "head" | "whole")
                    }
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #e6e6e6',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (editingRateType !== "whole") {
                      e.currentTarget.style.backgroundColor = '#eeeeee';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (editingRateType !== "whole") {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                    }
                  }}
                >
                  <span style={{
                    fontSize: '14px',
                    color: '#222',
                    fontWeight: '400'
                  }}>
                    Whole Event
                  </span>
                  <input
                    type="radio"
                    name="rateType"
                    value="whole"
                    checked={editingRateType === "whole"}
                    onChange={(e) =>
                      setEditingRateType(e.target.value as "head" | "whole")
                    }
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                </label>
              </div>

              {/* Save Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingTop: '24px',
                borderTop: '1px solid #e6e6e6'
              }}>
                <button
                  onClick={() => {
                    if (listing && editingPrice.trim()) {
                      const updatedListing = {
                        ...listing,
                        pricing: {
                          ...listing.pricing,
                          eventRate: editingPrice.trim(),
                          rateType: editingRateType
                        }
                      };
                      saveListingChanges(updatedListing);
                      setActiveSection(null);
                    }
                  }}
                  disabled={!editingPrice.trim()}
                  style={{
                    padding: '10px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    background: editingPrice.trim() ? '#1976d2' : '#e0e0e0',
                    color: editingPrice.trim() ? '#fff' : '#999',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: editingPrice.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (editingPrice.trim()) {
                      e.currentTarget.style.backgroundColor = '#1565c0';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (editingPrice.trim()) {
                      e.currentTarget.style.backgroundColor = '#1976d2';
                    }
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : activeSection === 'location' ? (
            /* Location Editor */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '60vh',
              position: 'relative'
            }}>
              {/* Location Heading */}
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#222',
                marginBottom: '24px'
              }}>
                Location
              </h2>

              {/* Search Bar */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    paddingLeft: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                  </div>
                  <input
                    ref={locationInputRef}
                    type="text"
                    value={locationSearchQuery}
                    onChange={(e) => setLocationSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (locationSuggestions.length > 0) {
                        setShowLocationSuggestions(true);
                      }
                    }}
                    placeholder="Search for your property location"
                    style={{
                      width: '100%',
                      paddingLeft: '40px',
                      paddingRight: '16px',
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      color: '#222'
                    }}
                  />
                  {/* Suggestions Dropdown */}
                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div
                      ref={locationSuggestionsRef}
                      style={{
                        position: 'absolute',
                        zIndex: 50,
                        width: '100%',
                        marginTop: '4px',
                        backgroundColor: '#fff',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        maxHeight: '240px',
                        overflowY: 'auto'
                      }}
                    >
                      {locationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleLocationSuggestionClick(suggestion)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '12px 16px',
                            fontSize: '14px',
                            color: '#222',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Property Location Form Fields */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#222',
                  marginBottom: '16px'
                }}>
                  Property location
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Country/Region */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Country/Region
                    </label>
                    <select
                      value={editingCountry}
                      onChange={(e) => setEditingCountry(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#222'
                      }}
                    >
                      {countries.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* State/Province */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      State/Province
                    </label>
                    <select
                      value={editingState}
                      onChange={(e) => setEditingState(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#222'
                      }}
                    >
                      <option value="">Select state/province</option>
                      {states.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      City
                    </label>
                    <input
                      type="text"
                      value={editingCity}
                      onChange={(e) => setEditingCity(e.target.value)}
                      placeholder="Enter city"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#222'
                      }}
                    />
                  </div>

                  {/* Street Address */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Street address
                    </label>
                    <input
                      type="text"
                      value={editingStreetAddress}
                      onChange={(e) => setEditingStreetAddress(e.target.value)}
                      placeholder="Enter street address"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#222'
                      }}
                    />
                  </div>

                  {/* Building, floor or unit number (optional) */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Building, floor or unit number{' '}
                      <span style={{ color: '#999', fontWeight: '400' }}>
                        (optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={editingBuildingUnit}
                      onChange={(e) => setEditingBuildingUnit(e.target.value)}
                      placeholder="Enter building, floor or unit number"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#222'
                      }}
                    />
                  </div>

                  {/* ZIP/Postal code (optional) */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      ZIP/Postal code{' '}
                      <span style={{ color: '#999', fontWeight: '400' }}>
                        (optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={editingZipCode}
                      onChange={(e) => setEditingZipCode(e.target.value)}
                      placeholder="Enter ZIP/postal code"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#222'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Map Container */}
              <div style={{
                marginBottom: '48px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                overflow: 'hidden',
                height: '400px'
              }}>
                {editingMapUrl ? (
                  <iframe
                    src={editingMapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: '#f6f7f8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666',
                    fontSize: '14px'
                  }}>
                    Map will appear after selecting a location
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingTop: '24px',
                borderTop: '1px solid #e6e6e6'
              }}>
                <button
                  onClick={() => {
                    if (listing && editingCity.trim() && editingStreetAddress.trim()) {
                      const updatedListing = {
                        ...listing,
                        location: {
                          country: editingCountry,
                          state: editingState,
                          city: editingCity.trim(),
                          streetAddress: editingStreetAddress.trim(),
                          buildingUnit: editingBuildingUnit.trim(),
                          zipCode: editingZipCode.trim()
                        },
                        mapUrl: editingMapUrl
                      };
                      saveListingChanges(updatedListing);
                      setActiveSection(null);
                    }
                  }}
                  disabled={!editingCity.trim() || !editingStreetAddress.trim()}
                  style={{
                    padding: '10px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    background: (editingCity.trim() && editingStreetAddress.trim()) ? '#1976d2' : '#e0e0e0',
                    color: (editingCity.trim() && editingStreetAddress.trim()) ? '#fff' : '#999',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: (editingCity.trim() && editingStreetAddress.trim()) ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (editingCity.trim() && editingStreetAddress.trim()) {
                      e.currentTarget.style.backgroundColor = '#1565c0';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (editingCity.trim() && editingStreetAddress.trim()) {
                      e.currentTarget.style.backgroundColor = '#1976d2';
                    }
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : activeSection === 'houseRules' ? (
            /* Check-in and Checkout Times Editor */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '60vh',
              position: 'relative'
            }}>
              {/* Heading */}
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#222',
                marginBottom: '32px'
              }}>
                Check-in and checkout times
              </h2>

              {/* Check-in window section */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#222',
                  marginBottom: '16px'
                }}>
                  Check-in window
                </h3>
                <div style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e6e6e6',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {/* Start time */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#222',
                      marginBottom: '8px'
                    }}>
                      Start time
                    </label>
                    <select
                      value={editingCheckInStart}
                      onChange={(e) => setEditingCheckInStart(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e6e6e6',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#222',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        paddingRight: '40px'
                      }}
                    >
                      {['12:00 AM', '12:30 AM', '1:00 AM', '1:30 AM', '2:00 AM', '2:30 AM', '3:00 AM', '3:30 AM', '4:00 AM', '4:30 AM', '5:00 AM', '5:30 AM', '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM'].map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* End time */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#222',
                      marginBottom: '8px'
                    }}>
                      End time
                    </label>
                    <select
                      value={editingCheckInEnd}
                      onChange={(e) => setEditingCheckInEnd(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e6e6e6',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#222',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        paddingRight: '40px'
                      }}
                    >
                      <option value="Flexible">Flexible</option>
                      {['12:00 AM', '12:30 AM', '1:00 AM', '1:30 AM', '2:00 AM', '2:30 AM', '3:00 AM', '3:30 AM', '4:00 AM', '4:30 AM', '5:00 AM', '5:30 AM', '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM'].map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Checkout time section */}
              <div style={{ marginBottom: '48px' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#222',
                  marginBottom: '16px'
                }}>
                  Checkout time
                </h3>
                <div style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e6e6e6',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#222',
                    marginBottom: '8px'
                  }}>
                    Select time
                  </label>
                  <select
                    value={editingCheckout}
                    onChange={(e) => setEditingCheckout(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e6e6e6',
                      borderRadius: '8px',
                      fontSize: '16px',
                      color: '#222',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      paddingRight: '40px'
                    }}
                  >
                    {['12:00 AM', '12:30 AM', '1:00 AM', '1:30 AM', '2:00 AM', '2:30 AM', '3:00 AM', '3:30 AM', '4:00 AM', '4:30 AM', '5:00 AM', '5:30 AM', '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM'].map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Event Rules Section */}
              <div style={{ marginBottom: '48px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#222',
                  marginBottom: '8px'
                }}>
                  Event Rules
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '32px',
                  lineHeight: '1.5'
                }}>
                  Guests are expected to follow your event rules and may be removed from Venu if they don't.
                </p>

                {/* Pets allowed */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '32px',
                  paddingBottom: '32px',
                  borderBottom: '1px solid #e6e6e6'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#222',
                      marginBottom: '8px'
                    }}>
                      Pets allowed
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#666',
                      marginBottom: '8px',
                      lineHeight: '1.5'
                    }}>
                      You can refuse pets, but must reasonably accommodate service animals.
                    </p>
                    <button
                      onClick={() => window.open('https://www.airbnb.com/help/article/2869', '_blank')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#1976d2',
                        fontSize: '14px',
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                    >
                      Learn more
                    </button>
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    marginLeft: '24px'
                  }}>
                    <button
                      onClick={() => setEditingPetsAllowed(false)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: editingPetsAllowed ? '#e6e6e6' : '#1976d2',
                        color: editingPetsAllowed ? '#666' : '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingPetsAllowed(true)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: editingPetsAllowed ? '#1976d2' : '#e6e6e6',
                        color: editingPetsAllowed ? '#fff' : '#666',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Smoking allowed */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '32px'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#222'
                  }}>
                    Smoking, vaping, e-cigarettes allowed
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center'
                  }}>
                    <button
                      onClick={() => setEditingSmokingAllowed(false)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: editingSmokingAllowed ? '#e6e6e6' : '#1976d2',
                        color: editingSmokingAllowed ? '#666' : '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingSmokingAllowed(true)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: editingSmokingAllowed ? '#1976d2' : '#e6e6e6',
                        color: editingSmokingAllowed ? '#fff' : '#666',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingTop: '24px',
                borderTop: '1px solid #e6e6e6'
              }}>
                <button
                  onClick={() => {
                    if (listing) {
                      const updatedListing = {
                        ...listing,
                        checkInStart: editingCheckInStart,
                        checkInEnd: editingCheckInEnd,
                        checkout: editingCheckout,
                        houseRules: {
                          petsAllowed: editingPetsAllowed,
                          smokingAllowed: editingSmokingAllowed
                        }
                      };
                      saveListingChanges(updatedListing);
                      setActiveSection(null);
                    }
                  }}
                  style={{
                    padding: '10px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#1976d2',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
                >
                  Save
                </button>
              </div>
            </div>
          ) : activeSection === 'guests' ? (
            /* Number of Guests Editor */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              position: 'relative'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#222',
                marginBottom: '32px'
              }}>
                Number of Guests:
              </h2>

              <div style={{
                width: '100%',
                maxWidth: '500px',
                marginBottom: '48px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { id: "1-50", label: "1-50 pax (Small)" },
                    { id: "51-100", label: "51-100 pax (Medium)" },
                    { id: "101-300", label: "101-300 pax (Large)" },
                    { id: "300+", label: "300+ pax (Grand Event)" }
                  ].map((range) => (
                    <label
                      key={range.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px',
                        border: `2px solid ${selectedGuestRange === range.id ? '#1976d2' : '#e6e6e6'}`,
                        borderRadius: '8px',
                        backgroundColor: selectedGuestRange === range.id ? '#e3f2fd' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="radio"
                        name="guestRange"
                        value={range.id}
                        checked={selectedGuestRange === range.id}
                        onChange={(e) => {
                          setSelectedGuestRange(e.target.value);
                          // Set guests to the maximum of the range for storage
                          if (e.target.value === "1-50") {
                            setEditingGuests("50");
                          } else if (e.target.value === "51-100") {
                            setEditingGuests("100");
                          } else if (e.target.value === "101-300") {
                            setEditingGuests("300");
                          } else if (e.target.value === "300+") {
                            setEditingGuests("301");
                          }
                        }}
                        style={{
                          marginRight: '12px',
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer'
                        }}
                      />
                      <span style={{
                        fontSize: '14px',
                        color: selectedGuestRange === range.id ? '#1976d2' : '#222',
                        fontWeight: selectedGuestRange === range.id ? '500' : '400'
                      }}>
                        {range.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Guest Limit Input */}
              <div style={{
                width: '100%',
                maxWidth: '500px',
                marginBottom: '48px'
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#222',
                  marginBottom: '12px'
                }}>
                  Guest Number Limit
                </label>
                <input
                  type="number"
                  value={guestLimit}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow positive numbers
                    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
                      setGuestLimit(value);
                    }
                  }}
                  placeholder="e.g., 700"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e6e6e6',
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#222',
                    backgroundColor: '#fff',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1976d2';
                    e.target.style.outline = 'none';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e6e6e6';
                  }}
                />
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  marginTop: '8px',
                  lineHeight: '1.5'
                }}>
                  Set the maximum number of guests allowed for this venue
                </p>
              </div>

              <button
                onClick={() => {
                  if (listing && selectedGuestRange) {
                    let guestValue = 0;
                    if (selectedGuestRange === "1-50") {
                      guestValue = 50;
                    } else if (selectedGuestRange === "51-100") {
                      guestValue = 100;
                    } else if (selectedGuestRange === "101-300") {
                      guestValue = 300;
                    } else if (selectedGuestRange === "300+") {
                      guestValue = 301;
                    }
                    const updatedListing = {
                      ...listing,
                      guests: guestValue,
                      guestRange: selectedGuestRange,
                      guestLimit: guestLimit ? parseInt(guestLimit) : undefined
                    };
                    saveListingChanges(updatedListing);
                    setActiveSection(null);
                  }
                }}
                disabled={!selectedGuestRange}
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  padding: '10px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  background: selectedGuestRange ? '#1976d2' : '#e0e0e0',
                  color: selectedGuestRange ? '#fff' : '#999',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: selectedGuestRange ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (selectedGuestRange) {
                    e.currentTarget.style.backgroundColor = '#1565c0';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedGuestRange) {
                    e.currentTarget.style.backgroundColor = '#1976d2';
                  }
                }}
              >
                Save
              </button>
            </div>
          ) : activeSection === 'description' ? (
            /* Description Editor */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '60vh',
              position: 'relative'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#222',
                marginBottom: '8px'
              }}>
                Description
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '32px'
              }}>
                Share what makes your place special
              </p>

              {/* Character Counter */}
              <div style={{
                fontSize: '14px',
                color: '#999',
                marginBottom: '8px',
                textAlign: 'right'
              }}>
                {editingDescription.length}/500 available
              </div>

              <div style={{
                width: '100%',
                marginBottom: '48px'
              }}>
                <textarea
                  value={editingDescription}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 500) {
                      setEditingDescription(value);
                    }
                  }}
                  placeholder="Escape from home, and heal in a luxury lifestyle in Mactan Newtown. Located near airport. Ideal for Travelers, Couples, and Families..."
                  maxLength={500}
                  style={{
                    width: '100%',
                    minHeight: '300px',
                    padding: '16px',
                    border: '1px solid #e6e6e6',
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#222',
                    lineHeight: '1.6',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <button
                onClick={() => {
                  if (listing) {
                    const updatedListing = {
                      ...listing,
                      propertyDescription: editingDescription.trim()
                    };
                    saveListingChanges(updatedListing);
                    setActiveSection(null);
                  }
                }}
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  padding: '10px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#1976d2',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
              >
                Save
              </button>
            </div>
          ) : activeSection === 'amenities' ? (
            /* Amenities Editor */
            <div ref={amenitiesEditRef} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              position: 'relative'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#222',
                marginBottom: '8px'
              }}>
                Amenities
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '8px'
              }}>
                Guest's favorites
              </p>
              <p style={{
                fontSize: '14px',
                color: '#999',
                marginBottom: '32px'
              }}>
                Travelers prefer these amenities when booking a place to stay.
              </p>

              <div style={{
                width: '100%',
                maxWidth: '800px',
                marginBottom: '48px'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px'
                }}>
                  {amenities.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity.id);
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => toggleAmenity(amenity.id)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '8px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #1976d2' : '1px solid #e6e6e6',
                          backgroundColor: '#fff',
                          minHeight: '60px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = '#999';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = '#e6e6e6';
                          }
                        }}
                      >
                        <span style={{
                          fontSize: '16px',
                          color: isSelected ? '#1976d2' : '#222',
                          fontWeight: isSelected ? '600' : '400',
                          textAlign: 'center'
                        }}>
                          + {amenity.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => {
                  if (listing) {
                    const updatedListing = {
                      ...listing,
                      selectedAmenities: selectedAmenities
                    };
                    saveListingChanges(updatedListing);
                    setActiveSection(null);
                  }
                }}
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  padding: '10px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#1976d2',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
              >
                Save
              </button>
            </div>
          ) : activeSection === 'accessibility' ? (
            /* Accessibility Features Editor */
            <div ref={accessibilityEditRef} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              position: 'relative'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#222',
                marginBottom: '8px'
              }}>
                Accessibility features
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '8px'
              }}>
                Guest's favorites
              </p>
              <p style={{
                fontSize: '14px',
                color: '#999',
                marginBottom: '32px'
              }}>
                Travelers prefer these accessibility features when booking a place to stay.
              </p>

              <div style={{
                width: '100%',
                maxWidth: '800px',
                marginBottom: '48px'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px'
                }}>
                  {accessibilityFeatures.map((feature) => {
                    const isSelected = selectedAccessibilityFeatures.includes(feature.id);
                    return (
                      <button
                        key={feature.id}
                        type="button"
                        onClick={() => toggleAccessibilityFeature(feature.id)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '8px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #1976d2' : '1px solid #e6e6e6',
                          backgroundColor: '#fff',
                          minHeight: '60px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = '#999';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = '#e6e6e6';
                          }
                        }}
                      >
                        <span style={{
                          fontSize: '16px',
                          color: isSelected ? '#1976d2' : '#222',
                          fontWeight: isSelected ? '600' : '400',
                          textAlign: 'center'
                        }}>
                          + {feature.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => {
                  if (listing) {
                    // Remove accessibility features from selectedAmenities if they were previously added
                    const accessibilityFeatureIds = accessibilityFeatures.map(f => f.id);
                    const regularAmenities = (listing.selectedAmenities || listing.amenities || []).filter((id: string) => 
                      !accessibilityFeatureIds.includes(id)
                    );
                    // Store accessibility features separately, not in amenities
                    const updatedListing = {
                      ...listing,
                      selectedAmenities: regularAmenities,
                      accessibilityFeatures: selectedAccessibilityFeatures
                    };
                    saveListingChanges(updatedListing);
                    setActiveSection(null);
                  }
                }}
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  padding: '10px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#1976d2',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
              >
                Save
              </button>
            </div>
          ) : activeSection === 'occasion' ? (
            /* Occasion Editor */
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#222',
                marginBottom: '8px'
              }}>
                Occasion
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '32px'
              }}>
                Select the occasions your venue is suitable for
              </p>

              {/* Occasion Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '32px'
              }}>
                {occasions.map((occasion) => {
                  const isSelected = selectedOccasions.includes(occasion.id);
                  return (
                    <button
                      key={occasion.id}
                      type="button"
                      onClick={() => toggleOccasion(occasion.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #1976d2' : '1px solid #e6e6e6',
                        background: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        minHeight: '100px'
                      }}
                      onMouseOver={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#999';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#e6e6e6';
                        }
                      }}
                    >
                      <div
                        style={{
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isSelected ? '#1976d2' : '#222',
                          fontSize: '40px',
                          ...(occasion.id === "family-reunion" && {
                            marginTop: '16px',
                            marginBottom: '0px'
                          })
                        }}
                      >
                        {occasion.icon}
                      </div>
                      <span
                        style={{
                          fontSize: '14px',
                          color: isSelected ? '#1976d2' : '#222',
                          fontWeight: isSelected ? '600' : '400',
                          ...(occasion.id === "family-reunion" && {
                            marginTop: '-8px'
                          })
                        }}
                      >
                        {occasion.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Save Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                paddingTop: '24px',
                borderTop: '1px solid #e6e6e6'
              }}>
                <button
                  onClick={() => {
                    if (listing) {
                      const updatedListing = {
                        ...listing,
                        selectedOccasions: selectedOccasions
                      };
                      saveListingChanges(updatedListing);
                      setActiveSection(null);
                    }
                  }}
                  style={{
                    padding: '10px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    background: selectedOccasions.length > 0 ? '#1976d2' : '#e0e0e0',
                    color: selectedOccasions.length > 0 ? '#fff' : '#999',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: selectedOccasions.length > 0 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (selectedOccasions.length > 0) {
                      e.currentTarget.style.backgroundColor = '#1565c0';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedOccasions.length > 0) {
                      e.currentTarget.style.backgroundColor = '#1976d2';
                    }
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : activeSection === 'title' ? (
            /* Title Editor */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              position: 'relative'
            }}>
              {/* Character Counter */}
              <div style={{
                fontSize: '14px',
                color: '#999',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                {editingTitle.length}/50 available
              </div>

              {/* Title Input */}
              <div style={{
                width: '100%',
                maxWidth: '800px',
                marginBottom: '48px'
              }}>
                <textarea
                  value={editingTitle}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 50) {
                      setEditingTitle(value);
                    }
                  }}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: '32px',
                    fontWeight: '600',
                    color: '#222',
                    lineHeight: '1.3',
                    textAlign: 'center',
                    resize: 'none',
                    minHeight: '100px',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Your All-in-One Cebu Stay – Beach, Pool & Dining"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={() => {
                  if (listing && editingTitle.trim()) {
                    const updatedListing = {
                      ...listing,
                      propertyName: editingTitle.trim()
                    };
                    saveListingChanges(updatedListing);
                    setActiveSection(null);
                  }
                }}
                disabled={!editingTitle.trim() || editingTitle.length > 50}
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  padding: '10px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  background: editingTitle.trim() && editingTitle.length <= 50 ? '#1976d2' : '#e0e0e0',
                  color: editingTitle.trim() && editingTitle.length <= 50 ? '#fff' : '#999',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: editingTitle.trim() && editingTitle.length <= 50 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (editingTitle.trim() && editingTitle.length <= 50) {
                    e.currentTarget.style.backgroundColor = '#1565c0';
                  }
                }}
                onMouseOut={(e) => {
                  if (editingTitle.trim() && editingTitle.length <= 50) {
                    e.currentTarget.style.backgroundColor = '#1976d2';
                  }
                }}
              >
                Save
              </button>
            </div>
          ) : (
            /* Photo Tour Editor */
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#222',
                  margin: 0
                }}>
                  Event Photos
                </h2>
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <button
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e6e6e6',
                  borderRadius: '8px',
                  background: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#222',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                All photos
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const files = e.target.files;
                  if (files && files.length > 0 && listing && user) {
                    const newPhotos: Array<{ id: string; url: string; isMain: boolean }> = [];
                    
                    for (let i = 0; i < files.length; i++) {
                      const file = files[i];
                      const validFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
                      
                      if (!validFormats.includes(file.type)) {
                        alert(`${file.name} is not a valid image format. Please use PNG, JPEG, or WebP.`);
                        continue;
                      }
                      
                      const maxSize = 10 * 1024 * 1024; // 10MB
                      if (file.size > maxSize) {
                        alert(`${file.name} is too large. Maximum size is 10MB.`);
                        continue;
                      }
                      
                      // Create a blob URL for preview
                      const imageUrl = URL.createObjectURL(file);
                      const photoId = `photo_${Date.now()}_${i}`;
                      
                      newPhotos.push({
                        id: photoId,
                        url: imageUrl,
                        isMain: listing.photos?.length === 0 && i === 0 // Set first photo as main if no photos exist
                      });
                    }
                    
                    if (newPhotos.length > 0) {
                      const updatedListing = {
                        ...listing,
                        photos: [...(listing.photos || []), ...newPhotos]
                      };
                      saveListingChanges(updatedListing);
                    }
                    
                    // Reset input
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '1px solid #e6e6e6',
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          </div>

          <p style={{
            fontSize: '16px',
            color: '#666',
            marginBottom: '32px'
          }}>
            Manage photos and add details. Guests will only see your tour if every room has a photo.
          </p>

          {/* Room Categories */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px'
          }}>
            {/* Living Room */}
            <div style={{
              border: '1px solid #e6e6e6',
              borderRadius: '12px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{
                aspectRatio: '1',
                background: '#f6f7f8',
                position: 'relative'
              }}>
                {listing.photos && listing.photos[0] ? (
                  <img
                    src={listing.photos[0].url}
                    alt="Living room"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666'
                  }}>
                    No photo
                  </div>
                )}
              </div>
              <div style={{
                padding: '16px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#222',
                  margin: '0 0 4px 0'
                }}>
                  Living room
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  margin: 0
                }}>
                  {listing.photos && listing.photos[0] ? '1 photo' : '0 photos'}
                </p>
              </div>
            </div>

            {/* Bedroom */}
            <div style={{
              border: '1px solid #e6e6e6',
              borderRadius: '12px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{
                aspectRatio: '1',
                background: '#f6f7f8',
                position: 'relative'
              }}>
                {listing.photos && listing.photos[1] ? (
                  <img
                    src={listing.photos[1].url}
                    alt="Bedroom"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666'
                  }}>
                    No photo
                  </div>
                )}
              </div>
              <div style={{
                padding: '16px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#222',
                  margin: '0 0 4px 0'
                }}>
                  Bedroom
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  margin: 0
                }}>
                  {listing.photos && listing.photos[1] ? '1 photo' : '0 photos'}
                </p>
              </div>
            </div>

            {/* Full Bathroom */}
            <div style={{
              border: '1px solid #e6e6e6',
              borderRadius: '12px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{
                aspectRatio: '1',
                background: '#f6f7f8',
                position: 'relative'
              }}>
                {listing.photos && listing.photos[2] ? (
                  <img
                    src={listing.photos[2].url}
                    alt="Full bathroom"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666'
                  }}>
                    No photo
                  </div>
                )}
              </div>
              <div style={{
                padding: '16px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#222',
                  margin: '0 0 4px 0'
                }}>
                  Full bathroom
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  margin: 0
                }}>
                  {listing.photos && listing.photos[2] ? '1 photo' : '0 photos'}
                </p>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </div>

      {/* View Modal */}
      {viewModalOpen && listing && (
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
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={() => setViewModalOpen(false)}
        >
          <div
            ref={modalRef}
            className="auth-modal"
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '1200px',
              maxHeight: '85vh',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Top Right Corner */}
            <button
              className="modal-close"
              type="button"
              onClick={() => setViewModalOpen(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '24px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background-color 0.2s',
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Website Content Container */}
            <div style={{
              overflowY: 'auto',
              overflowX: 'hidden',
              flex: 1,
              backgroundColor: '#fff'
            }}>
              {/* Main Content - matching venue/[id]/page.tsx structure */}
              <main style={{
                padding: 0,
                backgroundColor: '#fff',
                maxWidth: '100%',
                margin: '0 auto'
              }}>
                {/* Title and Actions */}
                <div style={{ padding: '18px 60px', borderBottom: '1px solid #e6e6e6' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <h1 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#222',
                    margin: 0,
                    flex: 1
                  }}>
                    {listing.propertyName || 'Untitled Listing'}
                  </h1>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                      type="button"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        border: '1px solid #e6e6e6',
                        borderRadius: '18px',
                        backgroundColor: 'white',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: '#222',
                        cursor: 'pointer'
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        border: '1px solid #e6e6e6',
                        borderRadius: '18px',
                        backgroundColor: 'white',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: '#222',
                        cursor: 'pointer'
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      Saved
                    </button>
                  </div>
                </div>
              </div>

              {/* Image Gallery - Full Width */}
              <div style={{
                width: '100%',
                marginBottom: '36px',
                display: 'flex',
                justifyContent: 'center'
              }}>
                {(() => {
                  // Create gallery images array - always ensure we have 5 images
                  const listingPhotos = listing.photos && listing.photos.length > 0
                    ? listing.photos.map((p: any) => p.url)
                    : [];
                  
                  const galleryImages = [
                    listingPhotos[0] || '/api/placeholder/800/600',
                    listingPhotos[1] || '/api/placeholder/400/300',
                    listingPhotos[2] || '/api/placeholder/400/300',
                    listingPhotos[3] || '/api/placeholder/400/300',
                    listingPhotos[4] || '/api/placeholder/400/300',
                  ];
                  
                  // Ensure selectedImageIndex is within bounds
                  const safeIndex = Math.min(Math.max(0, selectedImageIndex), galleryImages.length - 1);
                  const photoCount = listingPhotos.length;
                  
                  return (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr',
                      gridTemplateRows: 'repeat(2, 1fr)',
                      gap: '6px',
                      borderRadius: '0',
                      overflow: 'hidden',
                      width: '90%',
                      maxWidth: '1000px',
                      height: '260px'
                    }}>
                      {/* Large main image on the left - spans all 2 rows */}
                      <div
                        style={{
                          gridColumn: '1',
                          gridRow: '1 / 3',
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#f6f7f8',
                          backgroundImage: `url(${galleryImages[safeIndex]})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          cursor: 'pointer',
                          borderRadius: '0'
                        }}
                        onClick={() => {
                          setViewModalOpen(false);
                          router.push(`/venue/${listingId}`);
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
                          cursor: photoCount > 1 ? 'pointer' : 'default'
                        }}
                        onClick={() => {
                          if (photoCount > 1) {
                            setSelectedImageIndex(1);
                          }
                        }}
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
                          cursor: photoCount > 2 ? 'pointer' : 'default',
                          borderRadius: '0'
                        }}
                        onClick={() => {
                          if (photoCount > 2) {
                            setSelectedImageIndex(2);
                          }
                        }}
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
                          cursor: photoCount > 3 ? 'pointer' : 'default'
                        }}
                        onClick={() => {
                          if (photoCount > 3) {
                            setSelectedImageIndex(3);
                          }
                        }}
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
                          position: 'relative'
                        }}
                        onClick={() => {
                          setViewModalOpen(false);
                          router.push(`/venue/${listingId}`);
                        }}
                      >
                        {photoCount > 4 && (
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0,0,0,0.4)',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            Show all photos
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Content Section */}
              <div style={{ display: 'flex', gap: '60px', padding: '0 60px 36px 60px' }}>
                {/* Left Side - Details */}
                <div style={{ flex: 1 }}>
                  {/* Listing Summary */}
                  <div style={{
                    marginBottom: '24px',
                    paddingBottom: '24px',
                    borderBottom: '1px solid #e6e6e6'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '12px'
                    }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#222' }}>
                        Entire {listing.propertyType || 'rental unit'} in {listing.location?.city || 'Lapu-Lapu City'}, {listing.location?.state || 'Philippines'}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#666',
                      marginBottom: '18px'
                    }}>
                      {listing.beds || 2} beds · {listing.baths || 1} bath{listing.baths !== 1 ? 's' : ''} · {listing.guests || 3} guests
                    </div>
                  </div>

                  {/* Hosted by Section */}
                  <div style={{
                    marginBottom: '24px',
                    paddingBottom: '24px',
                    borderBottom: '1px solid #e6e6e6'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '18px',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          backgroundColor: '#e6e6e6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '15px',
                          fontWeight: '600',
                          color: '#222'
                        }}>
                          {user?.displayName?.charAt(0).toUpperCase() || 'H'}
                        </div>
                        <div>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#222',
                            marginBottom: '3px'
                          }}>
                            Hosted by {user?.displayName || 'Host'}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            color: '#666',
                            marginBottom: '3px'
                          }}>
                            Host • 0 years hosting
                          </div>
                          <div style={{
                            fontSize: '11px',
                            color: '#1976d2',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            marginBottom: '6px'
                          }}>
                            See host profile
                          </div>
                          <button
                            type="button"
                            style={{
                              padding: '6px 12px',
                              border: '1px solid #e6e6e6',
                              borderRadius: '6px',
                              backgroundColor: 'white',
                              color: '#1976d2',
                              fontSize: '11px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          >
                            Contact host
                          </button>
                        </div>
                      </div>

                      {/* Metrics Card */}
                      <div style={{
                        backgroundColor: '#e3f2fd',
                        borderRadius: '9px',
                        padding: '15px',
                        display: 'flex',
                        gap: '24px',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#1565c0',
                            marginBottom: '3px'
                          }}>
                            0/10
                          </div>
                          <div style={{ fontSize: '11px', color: '#1565c0' }}>
                            Communication rating
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#1565c0',
                            marginBottom: '3px'
                          }}>
                            0/10
                          </div>
                          <div style={{ fontSize: '11px', color: '#1565c0' }}>
                            Ease of check-in
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#1565c0',
                            marginBottom: '3px'
                          }}>
                            0%
                          </div>
                          <div style={{ fontSize: '11px', color: '#1565c0' }}>
                            Cancellation rate
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amenities Section */}
                  {(() => {
                    const amenitiesList = listing.selectedAmenities || listing.amenities || [];
                    // Filter out accessibility features from amenities display
                    const accessibilityFeatureIds = accessibilityFeatures.map(f => f.id);
                    const regularAmenities = amenitiesList.filter((id: string) => 
                      !accessibilityFeatureIds.includes(id)
                    );
                    return regularAmenities.length > 0 ? (
                    <div style={{
                      marginBottom: '24px',
                      paddingBottom: '24px',
                      borderBottom: '1px solid #e6e6e6'
                    }}>
                      <h2 style={{
                        fontSize: '17px',
                        fontWeight: '600',
                        color: '#222',
                        marginBottom: '18px'
                      }}>
                        What this place offers
                      </h2>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '12px'
                      }}>
                        {regularAmenities.slice(0, 6).map((amenityId: string, index: number) => {
                          const amenity = amenities.find(a => a.id === amenityId);
                          const amenityName = amenity ? amenity.name : amenityId;
                          return (
                            <div key={index} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '9px'
                            }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                              <span style={{ fontSize: '12px', color: '#222' }}>
                                {amenityName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    ) : null;
                  })()}

                  {/* Description Section */}
                  {listing.propertyDescription && (
                    <div style={{
                      marginBottom: '24px',
                      paddingBottom: '24px',
                      borderBottom: '1px solid #e6e6e6'
                    }}>
                      <h2 style={{
                        fontSize: '17px',
                        fontWeight: '600',
                        color: '#222',
                        marginBottom: '12px'
                      }}>
                        About this place
                      </h2>
                      <div style={{
                        fontSize: '12px',
                        color: '#222',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-line'
                      }}>
                        {listing.propertyDescription}
                      </div>
                    </div>
                  )}

                  {/* Event Rules Section */}
                  <div style={{
                    marginBottom: '24px',
                    paddingBottom: '24px',
                    borderBottom: '1px solid #e6e6e6'
                  }}>
                    <h2 style={{
                      fontSize: '17px',
                      fontWeight: '600',
                      color: '#222',
                      marginBottom: '12px'
                    }}>
                      House Rules
                    </h2>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '12px',
                      marginBottom: '18px'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '12px',
                          color: '#222',
                          marginBottom: '6px'
                        }}>
                          Check in after 3:00 PM
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#222',
                          marginBottom: '6px'
                        }}>
                          Check out before 11:00 AM
                        </div>
                        <div style={{ marginBottom: '9px' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: '3px'
                          }}>
                            <div style={{
                              position: 'relative',
                              width: '15px',
                              height: '15px'
                            }}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <circle cx="18" cy="7" r="2" />
                                <path d="M19 11v2" />
                              </svg>
                              <svg width="15" height="15" viewBox="0 0 24 24" style={{ position: 'absolute', top: 0, left: 0 }}>
                                <line x1="2" y1="22" x2="22" y2="2" stroke="#ff385c" strokeWidth="2.5" />
                              </svg>
                            </div>
                            <div style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#222'
                            }}>
                              Children
                            </div>
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#222',
                            paddingLeft: '21px'
                          }}>
                            Adults only
                          </div>
                        </div>
                        <div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: '3px'
                          }}>
                            <div style={{
                              position: 'relative',
                              width: '15px',
                              height: '15px'
                            }}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                                <path d="M11.25 4.533A9.707 9.707 0 0 1 15 10c0 2.123-.78 4.06-2.063 5.533m0 0a8.5 8.5 0 0 1-1.687 1.766m1.687-1.766L13.5 15m-4.75-4.467A9.707 9.707 0 0 0 9 10c0-2.123.78-4.06 2.063-5.533m0 0L10.5 5m-4.75 4.467L5 10m5.75 4.467L15 10" />
                              </svg>
                              <svg width="15" height="15" viewBox="0 0 24 24" style={{ position: 'absolute', top: 0, left: 0 }}>
                                <line x1="2" y1="22" x2="22" y2="2" stroke="#ff385c" strokeWidth="2.5" />
                              </svg>
                            </div>
                            <div style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#222'
                            }}>
                              Pets
                            </div>
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#222',
                            paddingLeft: '21px'
                          }}>
                            No pets allowed
                          </div>
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: '12px',
                          color: '#222',
                          marginBottom: '15px'
                        }}>
                          Minimum age to rent: 25
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '4px'
                          }}>
                            <div style={{
                              position: 'relative',
                              width: '20px',
                              height: '20px'
                            }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                                <path d="M5 8h14M5 8a2 2 0 1 0 0-4h14a2 2 0 1 0 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
                                <path d="M9 12h6" />
                              </svg>
                              <svg width="20" height="20" viewBox="0 0 24 24" style={{ position: 'absolute', top: 0, left: 0 }}>
                                <line x1="2" y1="22" x2="22" y2="2" stroke="#ff385c" strokeWidth="2.5" />
                              </svg>
                            </div>
                            <div style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#222'
                            }}>
                              Events
                            </div>
                          </div>
                          <div style={{
                            fontSize: '16px',
                            color: '#222',
                            paddingLeft: '28px'
                          }}>
                            No events allowed
                          </div>
                        </div>
                        <div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '4px'
                          }}>
                            <div style={{
                              position: 'relative',
                              width: '20px',
                              height: '20px'
                            }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                                <line x1="18" y1="10" x2="6" y2="10" />
                                <line x1="21" y1="6" x2="3" y2="6" />
                                <line x1="21" y1="14" x2="3" y2="14" />
                                <line x1="18" y1="18" x2="6" y2="18" />
                              </svg>
                              <svg width="20" height="20" viewBox="0 0 24 24" style={{ position: 'absolute', top: 0, left: 0 }}>
                                <line x1="2" y1="22" x2="22" y2="2" stroke="#ff385c" strokeWidth="2.5" />
                              </svg>
                            </div>
                            <div style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#222'
                            }}>
                              Smoking
                            </div>
                          </div>
                          <div style={{
                            fontSize: '16px',
                            color: '#222',
                            paddingLeft: '28px'
                          }}>
                            Smoking is not permitted
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{
                      borderTop: '1px solid #e6e6e6',
                      marginTop: '24px',
                      paddingTop: '24px'
                    }}></div>

                    {/* Check-out instructions */}
                    <div>
                      <h3 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#222',
                        marginBottom: '9px'
                      }}>
                        Check-out instructions
                      </h3>
                      <p style={{
                        fontSize: '12px',
                        color: '#222',
                        marginBottom: '9px'
                      }}>
                        The host requires you complete the following before checking out:
                      </p>
                      <ul style={{
                        fontSize: '12px',
                        color: '#222',
                        lineHeight: '1.8',
                        paddingLeft: '15px',
                        marginBottom: '9px'
                      }}>
                        <li>Gather used towels</li>
                        <li>Remove personal items</li>
                        <li>Turn off the lights and lock the doors</li>
                        <li>Replace key under doormat. Check for personal items.</li>
                      </ul>
                      <p style={{
                        fontSize: '12px',
                        color: '#222',
                        marginBottom: '9px'
                      }}>
                        Failure to complete these may result in a negative review from the host.
                      </p>
                      <p style={{ fontSize: '12px', color: '#222' }}>
                        Be respectful of the property. Please walk carefully around the springs and trails. Only park on granite drive
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{
                    borderTop: '1px solid #e6e6e6',
                    marginTop: '18px',
                    paddingTop: '18px'
                  }}></div>

                  {/* Damage and incidentals */}
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px',
                      gap: '12px'
                    }}>
                      <h3 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#222',
                        margin: 0
                      }}>
                        Damage and incidentals
                      </h3>
                      <p style={{
                        fontSize: '12px',
                        color: '#666',
                        margin: 0,
                        textAlign: 'right'
                      }}>
                        If you incur incidental fees or cause damage to the rental property, your credit card may be charged up to $200.
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{
                    borderTop: '1px solid #e6e6e6',
                    marginTop: '18px',
                    paddingTop: '18px'
                  }}></div>

                  {/* Cancellation */}
                  <div>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#222',
                      marginBottom: '18px'
                    }}>
                      Cancellation
                    </h3>

                    {/* Timeline */}
                    <div style={{
                      backgroundColor: '#f6f7f8',
                      borderRadius: '6px',
                      padding: '24px 18px',
                      marginBottom: '18px'
                    }}>
                      <div style={{ position: 'relative', height: '45px' }}>
                        {/* Horizontal line */}
                        <div style={{
                          position: 'absolute',
                          top: '22px',
                          left: '0',
                          right: '0',
                          height: '2px',
                          backgroundColor: '#222',
                          zIndex: 1
                        }}></div>

                        {/* Points and labels container */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          position: 'relative',
                          alignItems: 'flex-start'
                        }}>
                          {/* Today */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative'
                          }}>
                            <div style={{
                              width: '9px',
                              height: '9px',
                              borderRadius: '50%',
                              backgroundColor: '#222',
                              position: 'absolute',
                              top: '18px',
                              zIndex: 2
                            }}></div>
                            <div style={{
                              fontSize: '11px',
                              fontWeight: '500',
                              color: '#222',
                              marginTop: '30px'
                            }}>
                              Today
                            </div>
                          </div>

                          {/* Jan 2 */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative'
                          }}>
                            <div style={{
                              width: '9px',
                              height: '9px',
                              borderRadius: '50%',
                              backgroundColor: '#222',
                              position: 'absolute',
                              top: '18px',
                              zIndex: 2
                            }}></div>
                            <div style={{
                              fontSize: '11px',
                              fontWeight: '500',
                              color: '#222',
                              marginTop: '30px'
                            }}>
                              Jan 2
                            </div>
                          </div>

                          {/* Jan 9 */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative'
                          }}>
                            <div style={{
                              width: '9px',
                              height: '9px',
                              borderRadius: '50%',
                              border: '2px solid #222',
                              backgroundColor: 'white',
                              position: 'absolute',
                              top: '18px',
                              zIndex: 2
                            }}></div>
                            <div style={{
                              fontSize: '11px',
                              fontWeight: '500',
                              color: '#222',
                              marginTop: '30px'
                            }}>
                              Jan 9
                            </div>
                          </div>

                          {/* Check-in */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative'
                          }}>
                            <div style={{
                              width: '9px',
                              height: '9px',
                              borderRadius: '50%',
                              border: '2px solid #222',
                              backgroundColor: 'white',
                              position: 'absolute',
                              top: '18px',
                              zIndex: 2
                            }}></div>
                            <div style={{
                              fontSize: '11px',
                              fontWeight: '500',
                              color: '#222',
                              marginTop: '30px'
                            }}>
                              Check-in
                            </div>
                          </div>
                        </div>

                        {/* Refund labels above segments */}
                        <div style={{
                          position: 'absolute',
                          top: '0',
                          left: '0',
                          right: '0',
                          display: 'flex',
                          height: '100%'
                        }}>
                          {/* Full refund */}
                          <div style={{
                            flex: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            paddingTop: '0'
                          }}>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#222'
                            }}>
                              Full refund
                            </div>
                          </div>

                          {/* Partial refund */}
                          <div style={{
                            flex: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            paddingTop: '0'
                          }}>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#222'
                            }}>
                              Partial refund
                            </div>
                          </div>

                          {/* No refund */}
                          <div style={{
                            flex: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            paddingTop: '0'
                          }}>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#222'
                            }}>
                              No refund
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Refund policies */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px'
                    }}>
                      <div style={{
                        borderBottom: '1px solid #e6e6e6',
                        paddingBottom: '20px'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '8px'
                        }}>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#222'
                          }}>
                            Before Jan 2
                          </div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#222'
                          }}>
                            Full refund
                          </div>
                        </div>
                        <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
                          Cancel your reservation before Jan 2 at 11:59pm, and you'll get a full refund. Times are based on the property's local time.
                        </p>
                      </div>
                      <div style={{
                        borderBottom: '1px solid #e6e6e6',
                        paddingBottom: '20px'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '8px'
                        }}>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#222'
                          }}>
                            Before Jan 9
                          </div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#222'
                          }}>
                            Partial refund
                          </div>
                        </div>
                        <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
                          If you cancel your reservation before Jan 9 at 11:59pm you'll get a refund of 50% of the amount paid (minus the service fee). Times are based on the property's local time.
                        </p>
                      </div>
                      <div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '8px'
                        }}>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#222'
                          }}>
                            After Jan 9
                          </div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#222'
                          }}>
                            No refund
                          </div>
                        </div>
                        <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
                          After that, you won't get a refund.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reviews Section */}
                  <div style={{
                    marginBottom: '24px',
                    paddingBottom: '24px',
                    borderBottom: '1px solid #e6e6e6'
                  }}>
                    <h2 style={{
                      fontSize: '17px',
                      fontWeight: '600',
                      color: '#222',
                      marginBottom: '18px'
                    }}>
                      Reviews
                    </h2>

                    <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                      {/* Summary Review Card */}
                      <div style={{
                        backgroundColor: '#e3f2fd',
                        borderRadius: '9px',
                        padding: '18px',
                        minWidth: '210px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '9px'
                      }}>
                        <div style={{
                          fontSize: '36px',
                          fontWeight: '700',
                          color: '#2e7d32',
                          lineHeight: '1'
                        }}>
                          10/10
                        </div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#222'
                        }}>
                          Exceptional
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#222',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          147 verified reviews
                          <svg
                            width="12"
                            height="12"
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
                        <div style={{
                          backgroundColor: '#1976d2',
                          color: 'white',
                          padding: '6px 9px',
                          borderRadius: '15px',
                          fontSize: '11px',
                          fontWeight: '500',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          width: 'fit-content'
                        }}>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="white"
                          >
                            <path d="M12 21s-6-4.35-10-9c-3.33-4 0-11 6-8 3 1 4 3 4 3s1-2 4-3c6-3 9.33 4 6 8-4 4.65-10 9-10 9z" />
                          </svg>
                          Loved by Guests
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#666',
                          marginTop: '3px'
                        }}>
                          Guests rate this one of the best homes on Venu, giving it exceptional reviews.
                        </div>
                      </div>

                      {/* Individual Review Cards */}
                      <div style={{
                        display: 'flex',
                        gap: '12px',
                        flex: 1,
                        position: 'relative',
                        alignItems: 'center'
                      }}>
                        {/* Left Navigation Arrow */}
                        <button
                          type="button"
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            border: '1px solid #e6e6e6',
                            backgroundColor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            position: 'absolute',
                            left: '-15px',
                            zIndex: 10
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                          </svg>
                        </button>

                        {/* Review Card 1 */}
                        <div style={{
                          backgroundColor: 'white',
                          borderRadius: '9px',
                          padding: '18px',
                          border: '1px solid #e6e6e6',
                          flex: 1,
                          minWidth: '225px'
                        }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#222',
                            marginBottom: '9px'
                          }}>
                            10/10 Excellent
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#222',
                            lineHeight: '1.6',
                            marginBottom: '6px'
                          }}>
                            Place was lovely. Location was ideal
                          </div>
                          <button
                            type="button"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#1976d2',
                              fontSize: '14px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              padding: 0,
                              marginBottom: '20px'
                            }}
                          >
                            Show more
                          </button>
                          <div style={{
                            borderTop: '1px solid #e6e6e6',
                            paddingTop: '16px'
                          }}>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#222',
                              marginBottom: '4px'
                            }}>
                              deb a.
                            </div>
                            <div style={{
                              fontSize: '14px',
                              color: '#666',
                              marginBottom: '4px'
                            }}>
                              Stayed 2 nights in Oct 2025
                            </div>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                              Verified review
                            </div>
                          </div>
                        </div>

                        {/* Review Card 2 */}
                        <div style={{
                          backgroundColor: 'white',
                          borderRadius: '12px',
                          padding: '24px',
                          border: '1px solid #e6e6e6',
                          flex: 1,
                          minWidth: '300px'
                        }}>
                          <div style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#222',
                            marginBottom: '12px'
                          }}>
                            10/10 Excellent
                          </div>
                          <div style={{
                            fontSize: '16px',
                            color: '#222',
                            lineHeight: '1.6',
                            marginBottom: '8px'
                          }}>
                            Clean, nice space. Absolutely would stay again.
                          </div>
                          <button
                            type="button"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#1976d2',
                              fontSize: '14px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              padding: 0,
                              marginBottom: '20px'
                            }}
                          >
                            Show more
                          </button>
                          <div style={{
                            borderTop: '1px solid #e6e6e6',
                            paddingTop: '16px'
                          }}>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#222',
                              marginBottom: '4px'
                            }}>
                              barry
                            </div>
                            <div style={{
                              fontSize: '14px',
                              color: '#666',
                              marginBottom: '4px'
                            }}>
                              Stayed 2 nights in Oct 2025
                            </div>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                              Verified review
                            </div>
                          </div>
                        </div>

                        {/* Right Navigation Arrow */}
                        <button
                          type="button"
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            border: '1px solid #e6e6e6',
                            backgroundColor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            position: 'absolute',
                            right: '-20px',
                            zIndex: 10
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Show all reviews button */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginTop: '24px'
                    }}>
                      <button
                        type="button"
                        style={{
                          padding: '10px 20px',
                          border: '1px solid #222',
                          borderRadius: '8px',
                          backgroundColor: 'white',
                          color: '#222',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        Show all 00 reviews
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Side - Booking Card */}
                <div style={{ width: '300px', position: 'sticky', top: '18px', height: 'fit-content' }}>
                  <div style={{
                    border: '1px solid #e6e6e6',
                    borderRadius: '9px',
                    padding: '18px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{
                      marginBottom: '18px'
                    }}>
                      <div style={{
                        fontSize: '17px',
                        fontWeight: '600',
                        color: '#222',
                        marginBottom: '3px'
                      }}>
                        ₱{listing.pricing?.eventRate ? parseFloat(listing.pricing.eventRate).toLocaleString() : '2,800'}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#666'
                      }}>
                        per event
                      </div>
                    </div>

                    {/* Event Date */}
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: '#222',
                        marginBottom: '6px'
                      }}>
                        Event Date
                      </label>
                      <input
                        type="text"
                        placeholder="Add date"
                        style={{
                          width: '100%',
                          padding: '9px',
                          border: '1px solid #e6e6e6',
                          borderRadius: '6px',
                          fontSize: '11px',
                          color: '#222'
                        }}
                        readOnly
                      />
                    </div>

                    {/* Occasion */}
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: '#222',
                        marginBottom: '6px'
                      }}>
                        Occasion
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          placeholder="Add occasion"
                          style={{
                            width: '100%',
                            padding: '9px',
                            border: '1px solid #e6e6e6',
                            borderRadius: '6px',
                            fontSize: '11px',
                            color: '#222',
                            paddingRight: '30px'
                          }}
                          readOnly
                        />
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#666"
                          strokeWidth="2"
                          style={{
                            position: 'absolute',
                            right: '9px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none'
                          }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>

                    {/* Guests */}
                    <div style={{ marginBottom: '18px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: '#222',
                        marginBottom: '6px'
                      }}>
                        Guests
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          placeholder="Add guests"
                          style={{
                            width: '100%',
                            padding: '9px',
                            border: '1px solid #e6e6e6',
                            borderRadius: '6px',
                            fontSize: '11px',
                            color: '#222',
                            paddingRight: '30px'
                          }}
                          readOnly
                        />
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#666"
                          strokeWidth="2"
                          style={{
                            position: 'absolute',
                            right: '9px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none'
                          }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setViewModalOpen(false);
                        router.push(`/venue/${listingId}`);
                      }}
                      style={{
                        width: '100%',
                        padding: '11px',
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginBottom: '12px'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
                    >
                      Reserve
                    </button>

                    <div style={{
                      fontSize: '11px',
                      color: '#666',
                      textAlign: 'center',
                      marginBottom: '12px'
                    }}>
                      You won't be charged yet
                    </div>

                    {/* Divider */}
                    <div style={{
                      borderTop: '1px solid #e6e6e6',
                      marginTop: '12px',
                      paddingTop: '12px'
                    }}></div>

                    {/* Report this listing */}
                    <button
                      type="button"
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px',
                        background: 'transparent',
                        border: 'none',
                        color: '#666',
                        fontSize: '11px',
                        cursor: 'pointer',
                        justifyContent: 'center'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.color = '#222'}
                      onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                        <line x1="4" y1="22" x2="4" y2="15" />
                      </svg>
                      Report this listing
                    </button>
                  </div>
                </div>
              </div>
              </main>
            </div>
          </div>
        </div>
      )}

      {/* Listing Status Modal */}
      {listingStatusModalOpen && (
        <div
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
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setListingStatusModalOpen(false)}
        >
          <div
            ref={listingStatusModalRef}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '600px',
              width: '90%',
              position: 'relative',
              animation: 'slideUp 0.3s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setListingStatusModalOpen(false)}
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
            <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#222', marginBottom: '32px', paddingRight: '40px' }}>
              Listing status
            </h2>

            {/* Status Cards */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              {/* Listed/Paused Card - Shows "Paused" if paused, "Listed" otherwise */}
              <div
                onClick={() => {
                  setListingStatus('listed');
                  setUnlistOption(null);
                }}
                style={{
                  flex: 1,
                  padding: '24px',
                  borderRadius: '12px',
                  backgroundColor: listingStatus !== 'unlisted' ? '#e3f2fd' : '#fafafa',
                  border: listingStatus !== 'unlisted' ? '2px solid #1976d2' : '1px solid #e6e6e6',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (listingStatus === 'unlisted') {
                    e.currentTarget.style.backgroundColor = '#f6f7f8';
                  }
                }}
                onMouseOut={(e) => {
                  if (listingStatus === 'unlisted') {
                    e.currentTarget.style.backgroundColor = '#fafafa';
                  } else {
                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                  }
                }}
              >
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#222',
                  margin: '0 0 8px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: listingStatus === 'paused' ? '#f97316' : '#22c55e'
                  }} />
                  {listingStatus === 'paused' ? 'Paused' : 'Listed'}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  Your listing appears in search results and can be booked by guests.
                </p>
    </div>

              {/* Unlisted Card */}
              <div
                onClick={() => {
                  // Don't change listingStatus yet - keep it as 'listed' until finalized
                  setUnlistOption(null);
                  setListingStatusModalOpen(false);
                  setUnlistedOptionsModalOpen(true);
                }}
                style={{
                  flex: 1,
                  padding: '24px',
                  borderRadius: '12px',
                  backgroundColor: listingStatus === 'unlisted' ? '#e3f2fd' : '#fafafa',
                  border: listingStatus === 'unlisted' ? '2px solid #1976d2' : '1px solid #e6e6e6',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (listingStatus !== 'unlisted') {
                    e.currentTarget.style.backgroundColor = '#f6f7f8';
                  }
                }}
                onMouseOut={(e) => {
                  if (listingStatus !== 'unlisted') {
                    e.currentTarget.style.backgroundColor = '#fafafa';
                  } else {
                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                  }
                }}
              >
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#222',
                  margin: '0 0 8px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444'
                  }} />
                  Unlisted
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  Your listing won't appear in search results and can't be booked. You can set dates to pause.
                </p>
              </div>
            </div>

            {/* Save Button - Only enabled when changing from unlisted to listed */}
            {(() => {
              const isChangingFromUnlistedToListed = originalListingStatus === 'unlisted' && listingStatus === 'listed';
              return (
                <button
                  type="button"
                  onClick={() => {
                    if (listing && user && isChangingFromUnlistedToListed) {
                      const hostListingsKey = `hostListings_${user.uid}`;
                      const savedListings = localStorage.getItem(hostListingsKey);
                      if (savedListings) {
                        try {
                          const listingsData = JSON.parse(savedListings);
                          const updatedListings = listingsData.map((l: any) => 
                            l.id === listing.id ? { 
                              ...l, 
                              status: 'listed', 
                              unlistFromDate: null, 
                              unlistUntilDate: null 
                            } : l
                          );
                          localStorage.setItem(hostListingsKey, JSON.stringify(updatedListings));
                          setListing({ ...listing, status: 'listed', unlistFromDate: null, unlistUntilDate: null });
                          setOriginalListingStatus('listed');
                        } catch (error) {
                          console.error('Error updating listing status:', error);
                        }
                      }
                    }
                    setListingStatusModalOpen(false);
                  }}
                  disabled={!isChangingFromUnlistedToListed}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    backgroundColor: isChangingFromUnlistedToListed ? '#1976d2' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: isChangingFromUnlistedToListed ? 'pointer' : 'not-allowed',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => {
                    if (isChangingFromUnlistedToListed) {
                      e.currentTarget.style.backgroundColor = '#1565c0';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (isChangingFromUnlistedToListed) {
                      e.currentTarget.style.backgroundColor = '#1976d2';
                    }
                  }}
                >
                  Save
                </button>
              );
            })()}
          </div>
        </div>
      )}

      {/* Unlisted Options Modal */}
      {unlistedOptionsModalOpen && (
        <div
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
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setUnlistedOptionsModalOpen(false)}
        >
          <div
            ref={unlistedOptionsModalRef}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              position: 'relative',
              animation: 'slideUp 0.3s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setUnlistOption(null);
                setUnlistedOptionsModalOpen(false);
              }}
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

            {/* Back Button */}
            <button
              type="button"
              onClick={() => {
                setUnlistOption(null);
                // Keep "Listed" selected when going back
                if (listing && listing.status !== 'unlisted' && listing.status !== 'paused') {
                  setListingStatus('listed');
                } else if (listing && listing.status === 'paused' && listing.unlistFromDate && listing.unlistUntilDate) {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const fromDate = new Date(listing.unlistFromDate);
                  fromDate.setHours(0, 0, 0, 0);
                  const untilDate = new Date(listing.unlistUntilDate);
                  untilDate.setHours(0, 0, 0, 0);
                  if (today >= fromDate && today <= untilDate) {
                    setListingStatus('paused');
                  } else {
                    setListingStatus('listed');
                  }
                } else {
                  setListingStatus('listed');
                }
                setUnlistedOptionsModalOpen(false);
                setListingStatusModalOpen(true);
              }}
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Title */}
            <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#222', marginBottom: '24px', paddingRight: '40px', paddingLeft: '40px' }}>
              Unlist your listing
            </h2>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <button
                type="button"
                onClick={() => {
                  setUnlistOption('now');
                  setUnlistedOptionsModalOpen(false);
                  setUnlistFeedbackModalOpen(true);
                }}
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: unlistOption === 'now' ? '#e3f2fd' : '#fafafa',
                  border: unlistOption === 'now' ? '2px solid #1976d2' : '1px solid #e6e6e6',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#222',
                  textAlign: 'left'
                }}
                onMouseOver={(e) => {
                  if (unlistOption !== 'now') {
                    e.currentTarget.style.backgroundColor = '#f6f7f8';
                  }
                }}
                onMouseOut={(e) => {
                  if (unlistOption !== 'now') {
                    e.currentTarget.style.backgroundColor = '#fafafa';
                  } else {
                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                  }
                }}
              >
                Unlist for now
              </button>
              <button
                type="button"
                onClick={() => {
                  setUnlistOption('dates');
                  setUnlistedOptionsModalOpen(false);
                  setUnlistCalendarModalOpen(true);
                }}
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: unlistOption === 'dates' ? '#e3f2fd' : '#fafafa',
                  border: unlistOption === 'dates' ? '2px solid #1976d2' : '1px solid #e6e6e6',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#222',
                  textAlign: 'left'
                }}
                onMouseOver={(e) => {
                  if (unlistOption !== 'dates') {
                    e.currentTarget.style.backgroundColor = '#f6f7f8';
                  }
                }}
                onMouseOut={(e) => {
                  if (unlistOption !== 'dates') {
                    e.currentTarget.style.backgroundColor = '#fafafa';
                  } else {
                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                  }
                }}
              >
                Choose dates
              </button>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={() => {
                // Handle save - update listing status
                if (listing && user) {
                  const hostListingsKey = `hostListings_${user.uid}`;
                  const savedListings = localStorage.getItem(hostListingsKey);
                  if (savedListings) {
                    try {
                      const listingsData = JSON.parse(savedListings);
                      const updatedListings = listingsData.map((l: any) => 
                        l.id === listing.id ? { ...l, status: 'unlisted', unlistOption } : l
                      );
                      localStorage.setItem(hostListingsKey, JSON.stringify(updatedListings));
                      setListing({ ...listing, status: 'unlisted', unlistOption });
                    } catch (error) {
                      console.error('Error updating listing status:', error);
                    }
                  }
                }
                setUnlistedOptionsModalOpen(false);
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

      {/* Unlist Feedback Modal */}
      {unlistFeedbackModalOpen && (
        <div
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
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => {
            setUnlistFeedbackModalOpen(false);
            setIsRemovingListing(false);
            setSelectedFeedbackReasons([]);
          }}
        >
          <div
            ref={unlistFeedbackModalRef}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '600px',
              width: '90%',
              position: 'relative',
              animation: 'slideUp 0.3s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setUnlistFeedbackModalOpen(false);
                setIsRemovingListing(false);
                setSelectedFeedbackReasons([]);
              }}
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

            {/* Back Button */}
            <button
              type="button"
              onClick={() => {
                if (isRemovingListing) {
                  setUnlistFeedbackModalOpen(false);
                  setIsRemovingListing(false);
                  setSelectedFeedbackReasons([]);
                } else {
                  setUnlistOption(null);
                  setUnlistFeedbackModalOpen(false);
                  setUnlistedOptionsModalOpen(true);
                }
              }}
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Title */}
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#222', marginBottom: '8px', paddingRight: '40px', paddingLeft: '40px' }}>
              Let us know why you changed your mind about hosting
            </h2>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
              Choose all that apply
            </p>

            {/* Feedback Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '24px' }}>
              {[
                "I'm no longer able to host.",
                "I was hoping to make more money.",
                "I'm not ready to host right now.",
                "I expected more from Venu.",
                "I expected things to go more smoothly with guests.",
                "This is a duplicate listing."
              ].map((reason, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setSelectedFeedbackReasons(prev => 
                      prev.includes(reason) 
                        ? prev.filter(r => r !== reason)
                        : [...prev, reason]
                    );
                  }}
                  style={{
                    padding: '16px',
                    border: 'none',
                    borderBottom: index < 5 ? '1px solid #e6e6e6' : 'none',
                    backgroundColor: selectedFeedbackReasons.includes(reason) ? '#e3f2fd' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '16px',
                    color: '#222',
                    textAlign: 'left',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (!selectedFeedbackReasons.includes(reason)) {
                      e.currentTarget.style.backgroundColor = '#f6f7f8';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!selectedFeedbackReasons.includes(reason)) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    } else {
                      e.currentTarget.style.backgroundColor = '#e3f2fd';
                    }
                  }}
                >
                  <span>{reason}</span>
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => {
                if (isRemovingListing) {
                  // Handle remove listing - delete listing
                  if (listing && user) {
                    const hostListingsKey = `hostListings_${user.uid}`;
                    const savedListings = localStorage.getItem(hostListingsKey);
                    if (savedListings) {
                      try {
                        const listingsData = JSON.parse(savedListings);
                        // Remove the listing from the array
                        const updatedListings = listingsData.filter((l: any) => l.id !== listing.id);
                        localStorage.setItem(hostListingsKey, JSON.stringify(updatedListings));
                        
                        // Redirect to listings page
                        router.push('/host?tab=listings');
                      } catch (error) {
                        console.error('Error removing listing:', error);
                      }
                    } else {
                      // No listings, redirect to listings page
                      router.push('/host?tab=listings');
                    }
                  }
                } else {
                  // Handle submit - save feedback and unlist
                  if (listing && user) {
                    const hostListingsKey = `hostListings_${user.uid}`;
                    const savedListings = localStorage.getItem(hostListingsKey);
                    if (savedListings) {
                      try {
                        const listingsData = JSON.parse(savedListings);
                        const updatedListings = listingsData.map((l: any) => 
                          l.id === listing.id ? { 
                            ...l, 
                            status: 'unlisted', 
                            unlistOption: 'now',
                            feedbackReasons: selectedFeedbackReasons
                          } : l
                        );
                        localStorage.setItem(hostListingsKey, JSON.stringify(updatedListings));
                        setListing({ 
                          ...listing, 
                          status: 'unlisted', 
                          unlistOption: 'now',
                          feedbackReasons: selectedFeedbackReasons
                        });
                        setListingStatus('unlisted');
                      } catch (error) {
                        console.error('Error updating listing status:', error);
                      }
                    }
                  }
                }
                setUnlistFeedbackModalOpen(false);
                setSelectedFeedbackReasons([]);
                setIsRemovingListing(false);
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
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Unlist Calendar Modal */}
      {unlistCalendarModalOpen && (
        <div
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
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setUnlistCalendarModalOpen(false)}
        >
          <div
            ref={unlistCalendarModalRef}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              position: 'relative',
              animation: 'slideUp 0.3s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setUnlistCalendarModalOpen(false)}
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

            {/* Back Button */}
            <button
              type="button"
              onClick={() => {
                setUnlistOption(null);
                setUnlistCalendarModalOpen(false);
                setUnlistedOptionsModalOpen(true);
              }}
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Title */}
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#222', marginBottom: '24px', paddingRight: '40px', paddingLeft: '40px' }}>
              Pause this listing
            </h2>

            {/* Calendar */}
            <div style={{ marginBottom: '24px' }}>
              {/* Month Navigation */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (calendarMonth === 0) {
                      setCalendarMonth(11);
                      setCalendarYear(calendarYear - 1);
                    } else {
                      setCalendarMonth(calendarMonth - 1);
                    }
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#222' }}>
                  {monthNames[calendarMonth]} {calendarYear}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (calendarMonth === 11) {
                      setCalendarMonth(0);
                      setCalendarYear(calendarYear + 1);
                    } else {
                      setCalendarMonth(calendarMonth + 1);
                    }
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>

              {/* Calendar Grid - Simple */}
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0' }}>
                  {renderCalendar(calendarMonth, calendarYear).map((day, index) => {
                    if (day === null) {
                      return <div key={index} style={{ height: '40px' }} />;
                    }

                    const isPast = isPastDate(day, calendarMonth, calendarYear);
                    const currentDate = new Date(calendarYear, calendarMonth, day);
                    
                    // Check if date is selected (start or end)
                    let isSelected = false;
                    let isInRange = false;
                    
                    if (selectedStartDate && selectedEndDate) {
                      const start = new Date(selectedStartDate);
                      start.setHours(0, 0, 0, 0);
                      const end = new Date(selectedEndDate);
                      end.setHours(0, 0, 0, 0);
                      currentDate.setHours(0, 0, 0, 0);
                      
                      isSelected = currentDate.getTime() === start.getTime() || currentDate.getTime() === end.getTime();
                      isInRange = currentDate >= start && currentDate <= end;
                    } else if (selectedStartDate) {
                      const start = new Date(selectedStartDate);
                      start.setHours(0, 0, 0, 0);
                      currentDate.setHours(0, 0, 0, 0);
                      isSelected = currentDate.getTime() === start.getTime();
                    }

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          if (!isPast) {
                            const clickedDate = new Date(calendarYear, calendarMonth, day);
                            clickedDate.setHours(0, 0, 0, 0);
                            
                            if (!selectedStartDate) {
                              // First click - set start date
                              setSelectedStartDate(clickedDate);
                              setSelectedEndDate(null);
                            } else if (!selectedEndDate) {
                              // Second click - set end date
                              const start = new Date(selectedStartDate);
                              start.setHours(0, 0, 0, 0);
                              
                              if (clickedDate < start) {
                                // If clicking before start, reset and start new range
                                setSelectedStartDate(clickedDate);
                                setSelectedEndDate(null);
                              } else {
                                // Set end date (must be after start)
                                setSelectedEndDate(clickedDate);
                              }
                            } else {
                              // Reset and start new range
                              setSelectedStartDate(clickedDate);
                              setSelectedEndDate(null);
                            }
                          }
                        }}
                        disabled={isPast}
                        style={{
                          width: '40px',
                          height: '40px',
                          border: 'none',
                          borderRadius: '50%',
                          backgroundColor: isSelected ? '#222' : isInRange ? '#1976d2' : 'transparent',
                          color: isPast ? '#ccc' : isSelected ? '#fff' : isInRange ? '#fff' : '#222',
                          fontSize: '14px',
                          fontWeight: isSelected ? '600' : isInRange ? '600' : '400',
                          cursor: isPast ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto'
                        }}
                        onMouseOver={(e) => {
                          if (!isPast && !isSelected && !isInRange) {
                            e.currentTarget.style.backgroundColor = '#f0f0f0';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isPast && !isSelected && !isInRange) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  setUnlistCalendarModalOpen(false);
                  setSelectedStartDate(null);
                  setSelectedEndDate(null);
                  setSelectedUnlistDate(null);
                }}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  backgroundColor: 'transparent',
                  color: '#222',
                  border: '1px solid #e6e6e6',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedEndDate && listing && user) {
                    const hostListingsKey = `hostListings_${user.uid}`;
                    const savedListings = localStorage.getItem(hostListingsKey);
                    if (savedListings) {
                      try {
                        const listingsData = JSON.parse(savedListings);
                        const updatedListings = listingsData.map((l: any) => 
                          l.id === listing.id ? { 
                            ...l, 
                            status: 'unlisted', 
                            unlistOption: 'dates',
                            unlistUntilDate: selectedEndDate.toISOString(),
                            unlistFromDate: selectedStartDate?.toISOString()
                          } : l
                        );
                        localStorage.setItem(hostListingsKey, JSON.stringify(updatedListings));
                        setListing({ 
                          ...listing, 
                          status: 'unlisted', 
                          unlistOption: 'dates',
                          unlistUntilDate: selectedEndDate.toISOString(),
                          unlistFromDate: selectedStartDate?.toISOString()
                        });
                        setListingStatus('unlisted');
                      } catch (error) {
                        console.error('Error updating listing status:', error);
                      }
                    }
                  }
                  setUnlistCalendarModalOpen(false);
                }}
                disabled={!selectedEndDate}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  backgroundColor: selectedEndDate ? '#1976d2' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: selectedEndDate ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => {
                  if (selectedEndDate) {
                    e.currentTarget.style.backgroundColor = '#1565c0';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedEndDate) {
                    e.currentTarget.style.backgroundColor = '#1976d2';
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

