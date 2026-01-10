"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { WeddingRingsIcon } from "@/app/components/WeddingRingsIcon";
import Logo from "@/app/components/Logo";
import OtpLogin from "@/app/components/OtpLogin";

// Fix for 'cannot find namespace google' error
declare global {
  interface Window {
    google: any;
  }
}

const steps = [
  { id: 1, name: "Location", active: true },
  { id: 2, name: "Occasion", active: false },
  { id: 3, name: "Amenities", active: false },
  { id: 4, name: "Pricing", active: false },
  { id: 5, name: "Photos", active: false },
  { id: 6, name: "Details", active: false },
  { id: 7, name: "Publish", active: false },
];

export default function ListYourPlacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromHost = searchParams.get("from") === "host";
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([1]));
  const [searchQuery, setSearchQuery] = useState("");
  // Add missing auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Show auth modal immediately if not logged in
  useEffect(() => {
    if (!currentUser) {
      setAuthModalOpen(true);
    }
  }, [currentUser]);

  // Get current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Remove step 7 from visitedSteps when navigating away from it
  useEffect(() => {
    if (currentStep !== 7 && visitedSteps.has(7)) {
      setVisitedSteps((prev) => {
        const newSet = new Set(prev);
        newSet.delete(7);
        return newSet;
      });
    }
  }, [currentStep]);

  // Validation functions for each step
  const isStepValid = (stepId: number): boolean => {
    switch (stepId) {
      case 1:
        return !!(state && city && streetAddress);
      case 2:
        return selectedOccasions.length > 0;
      case 3:
        return selectedAmenities.length > 0;
      case 4:
        return !!eventRate && parseFloat(eventRate) > 0;
      case 5:
        return photos.length > 0;
      case 6:
        return (
          !!propertyName &&
          propertyName.trim().length > 0 &&
          !!propertyDescription &&
          propertyDescription.trim().length > 0 &&
          !!selectedGuestRange &&
          selectedGuestRange.length > 0
        );
      case 7:
        return acceptTerms;
      default:
        return false;
    }
  };

  // Check if a step can be navigated to
  const canNavigateToStep = (stepId: number): boolean => {
    // Can always navigate to current step
    if (stepId === currentStep) return true;

    // Can only navigate to visited steps (going back)
    // Cannot skip ahead to unvisited steps
    return visitedSteps.has(stepId);
  };

  const [country, setCountry] = useState("Philippines");

  // Get currency from localStorage or default to PHP
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("selectedCurrency");
      return stored || "PHP ₱";
    }
    return "PHP ₱";
  });

  // Extract currency code (e.g., "PHP" from "PHP ₱")
  const currencyCode = selectedCurrency.split(" ")[0];
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [buildingUnit, setBuildingUnit] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapUrl, setMapUrl] = useState(
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15505.0973452802!2d100.5014414!3d13.7563309!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d6032280d61f3%3A0x10100b2de25049e0!2sBangkok%2C%20Thailand!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
  );
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [eventRate, setEventRate] = useState("");
  const [rateType, setRateType] = useState<"head" | "whole">("head");
  const [paymentMethod, setPaymentMethod] = useState<"bank-transfer" | "gcash">(
    "bank-transfer"
  );
  const [photos, setPhotos] = useState<
    Array<{ id: string; url: string; isMain: boolean }>
  >([]);
  const [showPhotoWarning, setShowPhotoWarning] = useState(false);
  const [draggedPhoto, setDraggedPhoto] = useState<string | null>(null);
  const [propertyName, setPropertyName] = useState("");
  const [propertyDescription, setPropertyDescription] = useState("");
  const [propertySize, setPropertySize] = useState("");
  const [guests, setGuests] = useState("");
  const [selectedGuestRange, setSelectedGuestRange] = useState<string>("");
  const [guestLimit, setGuestLimit] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const autocompleteInputRef = useRef<HTMLInputElement>(null);

  // Save form data to localStorage
  const saveFormData = () => {
    const formData = {
      currentStep,
      country,
      state,
      city,
      streetAddress,
      buildingUnit,
      zipCode,
      mapUrl,
      selectedOccasions,
      selectedAmenities,
      eventRate,
      rateType,
      paymentMethod,
      photos: photos.map((photo) => ({
        id: photo.id,
        isMain: photo.isMain,
        // Note: blob URLs won't persist, so we'll need to handle this differently
        // For now, we'll save the structure
        url: photo.url,
      })),
      propertyName,
      propertyDescription,
      propertySize,
      guests,
      selectedGuestRange,
      guestLimit,
      acceptTerms,
      searchQuery,
    };
    localStorage.setItem("listYourPlaceDraft", JSON.stringify(formData));
  };

  // Load saved form data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("listYourPlaceDraft");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        const savedStep = data.currentStep || 1;
        setCurrentStep(savedStep);
        // Mark all steps up to the saved step as visited
        const savedVisitedSteps = new Set<number>();
        for (let i = 1; i <= savedStep; i++) {
          savedVisitedSteps.add(i);
        }
        setVisitedSteps(savedVisitedSteps);
        setCountry(data.country || "Philippines");
        setState(data.state || "");
        setCity(data.city || "");
        setStreetAddress(data.streetAddress || "");
        setBuildingUnit(data.buildingUnit || "");
        setZipCode(data.zipCode || "");
        setMapUrl(
          data.mapUrl ||
            "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15505.0973452802!2d100.5014414!3d13.7563309!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d6032280d61f3%3A0x10100b2de25049e0!2sBangkok%2C%20Thailand!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
        );
        setSelectedOccasions(data.selectedOccasions || []);
        setSelectedAmenities(data.selectedAmenities || []);
        setEventRate(data.eventRate || "");
        setRateType(data.rateType || "head");
        setPaymentMethod(data.paymentMethod || "bank-transfer");
        // Photos: Only restore if URLs are still valid (blob URLs won't persist)
        if (data.photos && Array.isArray(data.photos)) {
          // Filter out invalid blob URLs
          const validPhotos = data.photos.filter(
            (photo: any) =>
              photo.url &&
              (photo.url.startsWith("http") || photo.url.startsWith("blob:"))
          );
          if (validPhotos.length > 0) {
            setPhotos(validPhotos);
          }
        }
        setPropertyName(data.propertyName || "");
        setPropertyDescription(data.propertyDescription || "");
        setPropertySize(data.propertySize || "");
        setGuests(data.guests || "");
        setSelectedGuestRange(data.selectedGuestRange || "");
        setGuestLimit(data.guestLimit || "");
        // Set selectedGuestRange based on guests value
        if (data.guests) {
          const guestNum = parseInt(data.guests);
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
        setAcceptTerms(data.acceptTerms || false);
        setSearchQuery(data.searchQuery || "");
      } catch (error) {
        console.error("Error loading saved form data:", error);
      }
    }
  }, []);

  // Handle Save & Exit
  const handleSaveAndExit = () => {
    saveFormData();
    router.push(fromHost ? "/host?tab=listings" : "/dashboard");
  };
  // Use 'any' to avoid 'cannot find namespace google' error
  const autocompleteRef = useRef<any>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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
          {/* TV screen at the back (drawn first so it appears behind) */}
          <rect x="3" y="5" width="18" height="11" rx="1" fill="currentColor" />
          <rect x="4" y="6" width="16" height="9" rx="0.5" fill="#fff" />
          {/* Person (drawn on top) */}
          <circle cx="12" cy="11" r="2.5" fill="currentColor" />
          <rect
            x="9"
            y="13.5"
            width="6"
            height="8"
            rx="0.5"
            fill="currentColor"
          />
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
          {/* Simple birthday cake */}
          {/* Cake base */}
          <rect x="5" y="16" width="14" height="4" rx="1" fill="currentColor" />
          {/* White frosting between base and middle */}
          <rect x="5.5" y="15.5" width="13" height="1" fill="#fff" />
          {/* Cake middle layer */}
          <rect
            x="6"
            y="12"
            width="12"
            height="4"
            rx="0.5"
            fill="currentColor"
          />
          {/* White frosting between middle and top */}
          <rect x="6.5" y="11.5" width="11" height="1" fill="#fff" />
          {/* Cake top layer */}
          <rect
            x="7"
            y="8"
            width="10"
            height="4"
            rx="0.5"
            fill="currentColor"
          />
          {/* Single candle */}
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
          {/* Gravestone body with rounded/arched top - matching birthday cake height */}
          <path d="M6 7 Q12 2, 18 7 L18 15 L6 15 Z" fill="currentColor" />
          {/* Jesus Christ cross (crucifix) - longer vertical bar */}
          <rect x="11" y="7" width="2" height="8" fill="#fff" />
          {/* Horizontal bar - positioned higher (typical crucifix position) */}
          <rect x="9" y="9" width="6" height="2" fill="#fff" />
          {/* Small horizontal bar at top (INRI sign representation) */}
          <rect x="10.5" y="7" width="3" height="1" fill="#fff" />
          {/* Gravestone base - top tier */}
          <rect x="5.5" y="15" width="13" height="2" fill="currentColor" />
          {/* Gravestone base - bottom tier */}
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
          {/* Number "1" - thickness aligned with "8" */}
          <rect
            x="6"
            y="6"
            width="2.2"
            height="12"
            rx="0.4"
            fill="currentColor"
          />
          {/* Number "8" - thicker, bold rounded */}
          <ellipse cx="14" cy="9.5" rx="3.5" ry="3.5" fill="currentColor" />
          <ellipse cx="14" cy="15.5" rx="3.5" ry="3.5" fill="currentColor" />
          {/* White circles inside the pink circles */}
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
          {/* Framed picture with landscape - bigger */}
          {/* Picture frame */}
          <rect
            x="3"
            y="3"
            width="18"
            height="12"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Landscape inside frame - two mountains */}
          <path d="M4 13 L8 5 L12 8 L12 13 Z" fill="currentColor" />
          <path d="M12 13 L12 8 L16 7 L20 13 Z" fill="currentColor" />
          {/* Sun/moon circle in upper right */}
          <circle cx="18" cy="6" r="2" fill="currentColor" />
          {/* Barrier system below */}
          {/* Left stanchion */}
          <rect x="5" y="16" width="2" height="4" fill="currentColor" />
          <circle cx="6" cy="16" r="1" fill="currentColor" />
          {/* Right stanchion */}
          <rect x="17" y="16" width="2" height="4" fill="currentColor" />
          <circle cx="18" cy="16" r="1" fill="currentColor" />
          {/* Rope/cord connecting stanchions - curved line */}
          <path
            d="M7 17 Q12 15, 17 17"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
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
          {/* Person - circle on top */}
          <circle cx="12" cy="6" r="3" fill="currentColor" />
          {/* Person body - below the circle */}
          <rect
            x="8.5"
            y="9"
            width="7"
            height="4"
            rx="0.5"
            fill="currentColor"
          />
          {/* Podium top surface */}
          <rect x="5" y="12" width="14" height="2.5" fill="currentColor" />
          {/* Podium body */}
          <rect
            x="7"
            y="14.5"
            width="10"
            height="7"
            rx="1.5"
            fill="currentColor"
          />
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
          {/* Wine glass bowl - wide and rounded */}
          <path d="M5 2 Q12 2 19 2 Q19 4 19 7 Q19 10 12 10 Q5 10 5 7 Q5 4 5 2" />
          {/* Stem */}
          <line x1="12" y1="10" x2="12" y2="17" />
          {/* Base - upside down semi circle, wider */}
          <path d="M8 19 A4 4 0 0 1 16 19" />
          {/* Horizontal line in the middle of the semi circle */}
          <line x1="8" y1="19" x2="16" y2="19" />
          {/* Liquid line - slightly curved upwards, filling bottom 2/3 of bowl */}
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
          {/* Kite - represents recreation and fun */}
          {/* Kite body */}
          <path d="M12 4 L18 12 L12 20 L6 12 Z" fill="currentColor" />
          {/* Kite cross pattern */}
          <line
            x1="12"
            y1="4"
            x2="12"
            y2="20"
            stroke="#fff"
            strokeWidth="1.5"
          />
          <line
            x1="6"
            y1="12"
            x2="18"
            y2="12"
            stroke="#fff"
            strokeWidth="1.5"
          />
          {/* Kite tail */}
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
          {/* Bow tie at the top - two triangles connected and bigger */}
          {/* Left triangle */}
          <path d="M7 1 L11 3 L7 5 Z" fill="currentColor" />
          {/* Right triangle */}
          <path d="M17 1 L13 3 L17 5 Z" fill="currentColor" />
          {/* Center connection */}
          <rect x="11" y="2.5" width="2" height="1" fill="currentColor" />

          {/* Jacket with broad lapels opening outward */}
          <path
            d="M4 4 Q4 5 5 6.5 Q6 8 7.5 9 Q9 10 10.5 10.5 Q12 11 13.5 10.5 Q15 10 16.5 9 Q18 8 19 6.5 Q20 5 20 4 L20 20 L4 20 Z"
            fill="currentColor"
          />

          {/* White V-shaped shirt front */}
          <path
            d="M8.5 6.5 Q9 7.5 9.5 8.5 Q10 9.5 10.5 10 Q11 10.5 12 10.5 Q13 10.5 13.5 10 Q14 9.5 14.5 8.5 Q15 7.5 15.5 6.5 L15.5 18 L8.5 18 Z"
            fill="#fff"
          />

          {/* Three buttons vertically aligned */}
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
          {/* Person's head - larger and more visible */}
          <circle cx="12" cy="3.5" r="3" fill="currentColor" />
          {/* White circle for face */}
          <circle cx="12" cy="3.5" r="2" fill="#fff" />
          {/* Hair - more distinct */}
          <path
            d="M9 1.5 Q12 0.5 15 1.5 Q15 1 12 1 Q9 1 9 1.5"
            fill="currentColor"
          />
          <path
            d="M8.5 2 Q12 1.2 15.5 2"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Neck */}
          <line x1="11" y1="6.5" x2="11" y2="7.5" strokeWidth="1.5" />
          <line x1="13" y1="6.5" x2="13" y2="7.5" strokeWidth="1.5" />
          {/* Wedding dress bodice - fitted top, starts below neck */}
          <path d="M10 7.5 L10 10.5 L14 10.5 L14 7.5 Q12 7 10 7.5" />
          {/* Left arm - raised in celebration, extended more to the side, longer */}
          <path
            d="M10 8 L8.5 7 L5 4.5 L3 3"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Right arm - raised in celebration, extended more to the side, longer */}
          <path
            d="M14 8 L15.5 7 L19 4.5 L21 3"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Straps */}
          <line x1="10" y1="7.5" x2="9" y2="9" strokeWidth="1.5" />
          <line x1="14" y1="7.5" x2="15" y2="9" strokeWidth="1.5" />
          {/* Waistline */}
          <line x1="10" y1="10.5" x2="14" y2="10.5" strokeWidth="2" />
          {/* Full wedding dress skirt - A-line, clearly a dress */}
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
          {/* Left adult - head */}
          <circle cx="6" cy="6" r="1.6" fill="currentColor" />
          {/* Left adult - solid trapezoidal body */}
          <path d="M4 8.5 L8 8.5 L7.5 13.5 L4.5 13.5 Z" fill="currentColor" />
          {/* Left adult's left arm (other side) */}
          <path
            d="M3.8 9.2 Q3.3 9.7 2.8 10.5 Q2.3 11.3 2.3 12.2 Q2.3 12.8 3.3 12.8 Q4.3 12.8 4.3 11.8 Q4.3 10.5 3.8 9.5 Z"
            fill="currentColor"
          />
          {/* Left adult's right arm angled downward */}
          <path
            d="M8.2 9.2 Q8.7 9.7 9.2 10.5 Q9.7 11.3 9.7 12.2 Q9.7 12.8 8.7 12.8 Q7.7 12.8 7.7 11.8 Q7.7 10.5 8.2 9.5 Z"
            fill="currentColor"
          />

          {/* Right adult - head */}
          <circle cx="18" cy="6" r="1.6" fill="currentColor" />
          {/* Right adult - solid trapezoidal body */}
          <path
            d="M16 8.5 L20 8.5 L19.5 13.5 L16.5 13.5 Z"
            fill="currentColor"
          />
          {/* Right adult's left arm angled downward */}
          <path
            d="M15.8 9.2 Q15.3 9.7 14.8 10.5 Q14.3 11.3 14.3 12.2 Q14.3 12.8 15.3 12.8 Q16.3 12.8 16.3 11.8 Q16.3 10.5 15.8 9.5 Z"
            fill="currentColor"
          />
          {/* Right adult's right arm (other side) */}
          <path
            d="M20.2 9.2 Q20.7 9.7 21.2 10.5 Q21.7 11.3 21.7 12.2 Q21.7 12.8 20.7 12.8 Q19.7 12.8 19.7 11.8 Q19.7 10.5 20.2 9.5 Z"
            fill="currentColor"
          />

          {/* Child - head */}
          <circle cx="12" cy="8" r="1.3" fill="currentColor" />
          {/* Child - solid trapezoidal body */}
          <path
            d="M10.5 10.2 L13.5 10.2 L13 13.5 L11 13.5 Z"
            fill="currentColor"
          />
          {/* Child's left arm down */}
          <path
            d="M10.2 10.2 Q10.2 10.7 9.7 11.2 Q9.2 11.7 8.7 12.2 Q8.2 12.7 8.7 13.2 Q9.2 13.7 9.7 13.2 Q10.2 12.7 10.7 12.2 Q11.2 11.7 11.2 11.2 Q11.2 10.7 10.7 10.2 Z"
            fill="currentColor"
          />
          {/* Child's right arm down */}
          <path
            d="M13.8 10.2 Q13.8 10.7 14.3 11.2 Q14.8 11.7 15.3 12.2 Q15.8 12.7 15.3 13.2 Q14.8 13.7 14.3 13.2 Q13.8 12.7 13.3 12.2 Q12.8 11.7 12.8 11.2 Q12.8 10.7 13.3 10.2 Z"
            fill="currentColor"
          />
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
          {/* Tumbling tower - Jenga style blocks */}
          {/* Base layer */}
          <rect
            x="5"
            y="18"
            width="14"
            height="2"
            rx="0.2"
            fill="currentColor"
          />
          {/* Second layer */}
          <rect
            x="6"
            y="16"
            width="12"
            height="2"
            rx="0.2"
            fill="currentColor"
          />
          {/* Third layer */}
          <rect
            x="5"
            y="14"
            width="14"
            height="2"
            rx="0.2"
            fill="currentColor"
          />
          {/* Fourth layer */}
          <rect
            x="6"
            y="12"
            width="12"
            height="2"
            rx="0.2"
            fill="currentColor"
          />
          {/* Fifth layer */}
          <rect
            x="5"
            y="10"
            width="14"
            height="2"
            rx="0.2"
            fill="currentColor"
          />
          {/* Sixth layer */}
          <rect
            x="6"
            y="8"
            width="12"
            height="2"
            rx="0.2"
            fill="currentColor"
          />
          {/* Seventh layer */}
          <rect
            x="5"
            y="6"
            width="14"
            height="2"
            rx="0.2"
            fill="currentColor"
          />
          {/* Top layer */}
          <rect
            x="6"
            y="4"
            width="12"
            height="2"
            rx="0.2"
            fill="currentColor"
          />

          {/* Block being pulled out (left side) */}
          <rect
            x="3"
            y="10"
            width="3"
            height="2"
            rx="0.2"
            fill="currentColor"
          />

          {/* Block being pulled out (right side) */}
          <rect
            x="18"
            y="8"
            width="3"
            height="2"
            rx="0.2"
            fill="currentColor"
          />
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
          {/* Baby head - circular */}
          <circle cx="12" cy="6" r="3" fill="currentColor" />
          {/* Baby torso - rectangular */}
          <rect x="9" y="9" width="6" height="4" rx="0.5" fill="currentColor" />
          {/* Baby brief/diaper - white triangle */}
          <path d="M10 13 L14 13 L15.5 17 L8.5 17 Z" fill="#fff" />
          {/* Left arm - thicker, bent, seamlessly connected to torso */}
          <path
            d="M9 9 L9 13 Q6 11 6.5 12.5 Q7 13.5 7.2 12.5 Q7.5 11 9 9"
            fill="currentColor"
          />
          {/* Left hand - tiny circle */}
          <circle cx="7" cy="13" r="1.2" fill="currentColor" />
          {/* Right arm - thicker, bent, seamlessly connected to torso */}
          <path
            d="M15 9 L15 13 Q18 11 17.5 12.5 Q17 13.5 16.8 12.5 Q16.5 11 15 9"
            fill="currentColor"
          />
          {/* Right hand - tiny circle */}
          <circle cx="17" cy="13" r="1.2" fill="currentColor" />
          {/* Left leg - thicker, bent, knee out, foot in */}
          <path
            d="M10 13 L8 15.5 L7 18 L8.5 20 L11 18 L11.5 15.5 L10 13"
            fill="currentColor"
          />
          {/* Right leg - thicker, bent, knee out, foot in */}
          <path
            d="M14 13 L16 15.5 L17 18 L15.5 20 L13 18 L12.5 15.5 L14 13"
            fill="currentColor"
          />
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
          {/* Jesus Christ cross */}
          {/* Vertical bar */}
          <rect x="11" y="4" width="2" height="16" fill="currentColor" />
          {/* Horizontal bar */}
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

  const amenities = [
    {
      id: "main-event-hall",
      name: "Main event hall",
    },
    {
      id: "open-space",
      name: "Open space",
    },
    {
      id: "outdoor-garden",
      name: "Outdoor garden",
    },
    {
      id: "swimming-pool",
      name: "Swimming pool",
    },
    {
      id: "beach",
      name: "Beach",
    },
    {
      id: "changing-rooms",
      name: "Changing rooms",
    },
    {
      id: "backstage-area",
      name: "Backstage area",
    },
    {
      id: "catering-services",
      name: "Catering services",
    },
    {
      id: "service-staff",
      name: "Service staff",
    },
    {
      id: "tables",
      name: "Tables",
    },
    {
      id: "beverage-stations",
      name: "Beverage stations",
    },
    {
      id: "cake-table",
      name: "Cake table",
    },
    {
      id: "chairs",
      name: "Chairs",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
        </svg>
      ),
    },
    {
      id: "linens",
      name: "Linens",
    },
    {
      id: "decor-items",
      name: "Decor items",
    },
    {
      id: "stage-platform",
      name: "Stage platform",
    },
    {
      id: "microphones",
      name: "Microphones",
    },
    {
      id: "speakers",
      name: "Speakers",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
        </svg>
      ),
    },
    {
      id: "dj-booth",
      name: "DJ booth",
    },
    {
      id: "projector-screen",
      name: "Projector & screen",
    },
    {
      id: "led-screens",
      name: "LED screens",
    },
    {
      id: "lighting-equipments",
      name: "Lighting equipments",
    },
    {
      id: "dance-floor",
      name: "Dance floor",
    },
    {
      id: "registration",
      name: "Registration",
    },
    {
      id: "parking",
      name: "Parking",
    },
    {
      id: "pwd-access",
      name: "PWD access",
    },
    {
      id: "air-conditioning",
      name: "Air conditioning",
    },
    {
      id: "wifi",
      name: "Wifi",
    },
    {
      id: "fans",
      name: "Fans",
    },
    {
      id: "restrooms",
      name: "Restrooms",
    },
    {
      id: "waste-bins",
      name: "Waste bins",
    },
    {
      id: "security",
      name: "Security",
    },
    {
      id: "emergency-exits",
      name: "Emergency Exits",
    },
    {
      id: "fire-safety-equipments",
      name: "Fire safety Equipments",
    },
    {
      id: "first-aid",
      name: "First-Aid",
    },
    {
      id: "cleaning-services",
      name: "Cleaning services",
    },
  ];

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  // Listen for currency changes
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("selectedCurrency");
      if (stored) {
        setSelectedCurrency(stored);
      }
    };

    // Listen for storage events (when currency changes in other tabs/components)
    window.addEventListener("storage", handleStorageChange);

    // Also check periodically in case currency is updated in the same tab
    const interval = setInterval(() => {
      const stored = localStorage.getItem("selectedCurrency");
      if (stored && stored !== selectedCurrency) {
        setSelectedCurrency(stored);
      }
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [selectedCurrency]);

  // Load Google Maps API
  useEffect(() => {
    const apiKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      "AIzaSyDebebuZpQSlxgNsxYbAYUbKyBtxBKbTIQ";

    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google && window.google.maps && window.google.maps.places) {
          autocompleteRef.current =
            new window.google.maps.places.AutocompleteService();
        }
      };
      document.head.appendChild(script);
    } else if (window.google.maps && window.google.maps.places) {
      autocompleteRef.current =
        new window.google.maps.places.AutocompleteService();
    }
  }, []);

  // Handle search query changes and get suggestions
  useEffect(() => {
    if (searchQuery.length > 2 && autocompleteRef.current) {
      const request = {
        input: searchQuery,
        types: ["geocode", "establishment"],
      };

      autocompleteRef.current.getPlacePredictions(
        request,
        (
          predictions: Array<{ description: string }> | null,
          status: string
        ) => {
          if (
            window.google &&
            window.google.maps &&
            window.google.maps.places &&
            typeof status !== "undefined" &&
            status === window.google.maps.places.PlacesServiceStatus?.OK &&
            Array.isArray(predictions) &&
            predictions.length > 0
          ) {
            setSuggestions(predictions.map((p) => p.description));
            setShowSuggestions(true);
          } else {
            // Log error for debugging
            console.error("Google Maps Autocomplete error:", {
              status,
              predictions,
            });
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        autocompleteInputRef.current &&
        !autocompleteInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Local types to avoid 'any' and 'google' namespace errors
  type AddressComponent = {
    long_name: string;
    short_name: string;
    types: string[];
  };
  type PlaceResult = {
    address_components?: AddressComponent[];
    formatted_address?: string;
    geometry?: {
      location?: {
        lat: () => number;
        lng: () => number;
      };
    };
  };

  // Extract address components from place details
  const extractAddressComponents = (place: PlaceResult) => {
    if (!place || !Array.isArray(place.address_components)) return;
    const addressComponents = place.address_components;

    addressComponents.forEach((component: AddressComponent) => {
      if (!component || !Array.isArray(component.types)) return;
      const types = component.types;

      if (types.includes("country") && component.long_name) {
        setCountry(component.long_name);
      }
      if (
        types.includes("administrative_area_level_1") &&
        component.long_name
      ) {
        setState(component.long_name);
      }
      if (
        (types.includes("locality") ||
          types.includes("administrative_area_level_2")) &&
        component.long_name
      ) {
        setCity(component.long_name);
      }
      if (types.includes("postal_code") && component.long_name) {
        setZipCode(component.long_name);
      }
      if (types.includes("street_number") && component.long_name) {
        setStreetAddress(component.long_name + " ");
      }
      if (types.includes("route") && component.long_name) {
        setStreetAddress((prev) => (prev || "") + component.long_name);
      }
    });

    // Update map URL
    if (
      place.geometry &&
      place.geometry.location &&
      typeof place.geometry.location.lat === "function" &&
      typeof place.geometry.location.lng === "function"
    ) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const encodedQuery = encodeURIComponent(
        place.formatted_address || searchQuery
      );
      setMapUrl(
        `https://www.google.com/maps/embed/v1/place?key=${
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
          "AIzaSyDebebuZpQSlxgNsxYbAYUbKyBtxBKbTIQ"
        }&q=${encodedQuery}&zoom=15`
      );
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);

    if (window.google && window.google.maps && window.google.maps.places) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { address: suggestion },
        (results: any, status: string) => {
          if (
            window.google &&
            window.google.maps &&
            status === window.google.maps.GeocoderStatus?.OK &&
            results &&
            results[0]
          ) {
            extractAddressComponents(results[0]);
          } else {
            // Log error for debugging
            console.error("Google Maps Geocoder error:", { status, results });
          }
        }
      );
    }
  };

  if (!currentUser && authModalOpen) {
    // Only show the modal, block the rest of the page
    return (
      <div
        className="modal-overlay"
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
          zIndex: 10000,
          minHeight: "100vh",
          height: "100vh",
          padding: 0,
        }}
        onClick={() => setAuthModalOpen(false)}
      >
        <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
          <h2>Sign in or Create Account</h2>
          {/* ...social login buttons, etc... */}
          <button onClick={() => setAuthModalOpen(false)}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Venu Logo */}
      <header
        className="header"
        style={{ minHeight: "60px", paddingTop: "4px", paddingBottom: "4px" }}
      >
        <div className="left-section">
          <Logo
            onClick={() =>
              router.push(fromHost ? "/host?tab=listings" : "/dashboard")
            }
            className=""
          />
        </div>
      </header>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setShowCancelConfirm(false)}
        >
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              type="button"
              onClick={() => setShowCancelConfirm(false)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 4L4 12M4 4l8 8" />
              </svg>
            </button>
            <div className="modal-content">
              <h2 className="modal-header">Cancel and go back?</h2>
              <p
                className="text-gray-600 mb-6"
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: "16px",
                  lineHeight: "1.5",
                }}
              >
                Are you sure you want to cancel? Your progress will not be saved
                and you will be redirected to the dashboard.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                  style={{ fontFamily: "Arial, sans-serif", fontSize: "16px" }}
                >
                  Continue editing
                </button>
                <button
                  onClick={() => {
                    // Clear all draft data
                    localStorage.removeItem("listYourPlaceDraft");
                    // Navigate to host page if came from host, otherwise dashboard
                    router.push(fromHost ? "/host?tab=listings" : "/dashboard");
                  }}
                  className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors"
                  style={{ fontFamily: "Arial, sans-serif", fontSize: "16px" }}
                >
                  Yes, go back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex max-w-5xl mx-auto">
        {/* Left Sidebar - Progress Steps */}
        <div className="w-48 border-r border-gray-200 min-h-screen py-8 sticky top-0 self-start">
          <div className="px-6 relative">
            <div
              className="absolute left-10 top-24 w-0.5 bg-blue-600"
              style={{ height: `${(steps.length - 1) * 56}px` }}
            ></div>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-6 flex items-center gap-2"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 12L6 8L10 4" />
              </svg>
              Back
            </button>
            <div className="text-xs text-gray-500 mb-6">
              Step {currentStep}/7
            </div>
            {steps.map((step, index) => {
              const isVisited = visitedSteps.has(step.id);
              const isCurrent = step.id === currentStep;
              return (
                <div
                  key={step.id}
                  className={`relative mb-6 cursor-pointer ${
                    isCurrent
                      ? "text-blue-600"
                      : isVisited
                      ? "text-blue-600"
                      : "text-gray-300"
                  }`}
                  onClick={() => {
                    if (canNavigateToStep(step.id)) {
                      setCurrentStep(step.id);
                      setVisitedSteps((prev) => new Set([...prev, step.id]));
                    }
                  }}
                  style={{
                    cursor: canNavigateToStep(step.id)
                      ? "pointer"
                      : "not-allowed",
                  }}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-medium z-10 relative ${
                        isCurrent
                          ? "bg-blue-600 text-white"
                          : isVisited
                          ? "bg-blue-600 text-white"
                          : "bg-white border-2 border-gray-300 text-gray-300"
                      }`}
                    >
                      {isVisited && !isCurrent ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        step.id
                      )}
                    </div>
                    <span className="text-sm">{step.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 px-8 py-8">
          <div className="flex justify-end mb-6">
            <button
              onClick={handleSaveAndExit}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Save & exit
            </button>
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <>
              {/* Location Heading */}
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                Location
              </h1>

              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    ref={autocompleteInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    placeholder="Search for your property location"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                    >
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-sm"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Property Location Form Fields */}
              <div className="mb-8">
                <h2 className="text-base font-medium text-gray-900 mb-4">
                  Property location
                </h2>
                <div className="space-y-4">
                  {/* Country/Region */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country/Region
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className={`w-full px-3 py-2.5 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        showErrors && !state
                          ? "border-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select state/province</option>
                      {states.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {showErrors && !state && (
                      <p className="mt-1 text-sm text-blue-600">
                        Please enter state to continue
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={`w-full px-3 py-2.5 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        showErrors && !city
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter city"
                    />
                    {showErrors && !city && (
                      <p className="mt-1 text-sm text-red-600">
                        Please enter city to continue
                      </p>
                    )}
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street address
                    </label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className={`w-full px-3 py-2.5 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        showErrors && !streetAddress
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter street address"
                    />
                    {showErrors && !streetAddress && (
                      <p className="mt-1 text-sm text-red-600">
                        Please enter street address to continue
                      </p>
                    )}
                  </div>

                  {/* Building, floor or unit number (optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Building, floor or unit number{" "}
                      <span className="text-gray-400 font-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={buildingUnit}
                      onChange={(e) => setBuildingUnit(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter building, floor or unit number"
                    />
                  </div>

                  {/* ZIP/Postal code (optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP/Postal code{" "}
                      <span className="text-gray-400 font-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter ZIP/postal code"
                    />
                  </div>
                </div>
              </div>

              {/* Map Container */}
              <div
                className="mb-6 border border-gray-300 rounded-md overflow-hidden"
                style={{ height: "400px" }}
              >
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-2.5 border border-blue-600 rounded-md text-blue-600 font-medium hover:bg-blue-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!isStepValid(currentStep)) {
                      setShowErrors(true);
                    } else {
                      setShowErrors(false);
                      const nextStep = currentStep + 1;
                      setCurrentStep(nextStep);
                      setVisitedSteps((prev) => new Set([...prev, nextStep]));
                    }
                  }}
                  disabled={!isStepValid(currentStep)}
                  className={`px-6 py-2.5 rounded-md font-medium transition-colors ${
                    isStepValid(currentStep)
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              {/* Occasion Heading */}
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Occasion
              </h1>
              <p className="text-sm text-gray-600 mb-6">
                Select the occasions your venue is suitable for
              </p>

              {/* Occasion Grid */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {occasions.map((occasion) => {
                  const isSelected = selectedOccasions.includes(occasion.id);
                  return (
                    <button
                      key={occasion.id}
                      type="button"
                      onClick={() => toggleOccasion(occasion.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${
                        isSelected
                          ? "border-2 border-blue-600 bg-white"
                          : "border border-gray-300 bg-white hover:border-gray-400"
                      }`}
                      style={{ minHeight: "100px" }}
                    >
                      <div
                        className={`mb-3 flex items-center justify-center ${
                          isSelected ? "text-blue-600" : "text-black"
                        }`}
                        style={{
                          fontSize: "40px",
                          ...(occasion.id === "family-reunion" && {
                            marginTop: "16px",
                            marginBottom: "0px",
                          }),
                        }}
                      >
                        {occasion.icon}
                      </div>
                      <span
                        className={`text-sm ${
                          isSelected
                            ? "text-blue-600 font-semibold"
                            : "text-gray-900"
                        }`}
                        style={{
                          ...(occasion.id === "family-reunion" && {
                            marginTop: "-8px",
                          }),
                        }}
                      >
                        {occasion.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-2.5 border border-blue-600 rounded-md text-blue-600 font-medium hover:bg-blue-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (isStepValid(currentStep)) {
                      const nextStep = currentStep + 1;
                      setCurrentStep(nextStep);
                      setVisitedSteps((prev) => new Set([...prev, nextStep]));
                    }
                  }}
                  disabled={!isStepValid(currentStep)}
                  className={`px-6 py-2.5 rounded-md font-medium transition-colors ${
                    isStepValid(currentStep)
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              {/* Amenities Heading */}
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Amenities
              </h1>
              <p className="text-sm text-gray-600 mb-6">Guest's favorites</p>
              <p className="text-sm text-gray-500 mb-6">
                Travelers prefer these amenities when booking a place to stay.
              </p>

              {/* Amenities Grid */}
              <div className="grid grid-cols-4 gap-3 mb-8">
                {amenities.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity.id);
                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                        isSelected
                          ? "border-2 border-blue-600 bg-white"
                          : "border border-gray-300 bg-white hover:border-gray-400"
                      }`}
                      style={{ minHeight: "60px" }}
                    >
                      <span
                        className={`text-base ${
                          isSelected
                            ? "text-blue-600 font-semibold"
                            : "text-gray-900"
                        }`}
                      >
                        + {amenity.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-2.5 border border-blue-600 rounded-md text-blue-600 font-medium hover:bg-blue-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (isStepValid(currentStep)) {
                      const nextStep = currentStep + 1;
                      setCurrentStep(nextStep);
                      setVisitedSteps((prev) => new Set([...prev, nextStep]));
                    }
                  }}
                  disabled={!isStepValid(currentStep)}
                  className={`px-6 py-2.5 rounded-md font-medium transition-colors ${
                    isStepValid(currentStep)
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {currentStep === 4 && (
            <>
              {/* Pricing Heading */}
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                Pricing
              </h1>

              {/* Set your rate */}
              <div className="mb-8">
                <h2 className="text-base font-medium text-gray-900 mb-4">
                  Set your rate
                </h2>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event rate
                    </label>
                    <input
                      type="text"
                      value={eventRate}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow numbers and decimal point
                        const numericValue = value.replace(/[^0-9.]/g, "");
                        // Prevent multiple decimal points
                        const parts = numericValue.split(".");
                        const filteredValue =
                          parts.length > 2
                            ? parts[0] + "." + parts.slice(1).join("")
                            : numericValue;
                        if (
                          filteredValue === "" ||
                          (parseFloat(filteredValue) >= 0 &&
                            parseFloat(filteredValue) <= 1000000000)
                        ) {
                          setEventRate(filteredValue);
                        }
                      }}
                      onKeyDown={(e) => {
                        // Prevent non-numeric keys except backspace, delete, tab, escape, enter, and decimal point
                        if (
                          !/[0-9]/.test(e.key) &&
                          ![
                            "Backspace",
                            "Delete",
                            "Tab",
                            "Escape",
                            "Enter",
                            ".",
                            "ArrowLeft",
                            "ArrowRight",
                            "ArrowUp",
                            "ArrowDown",
                          ].includes(e.key) &&
                          !(e.ctrlKey || e.metaKey) // Allow Ctrl/Cmd + A, C, V, etc.
                        ) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Enter event rate"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-3 mt-4">
                    <label
                      className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{
                        borderColor:
                          rateType === "head" ? "#2563eb" : "#d1d5db",
                      }}
                    >
                      <input
                        type="radio"
                        name="rateType"
                        value="head"
                        checked={rateType === "head"}
                        onChange={(e) =>
                          setRateType(e.target.value as "head" | "whole")
                        }
                        className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div
                          className={`font-medium ${
                            rateType === "head"
                              ? "text-blue-600"
                              : "text-gray-900"
                          }`}
                        >
                          Per Head ({currencyCode}/person)
                        </div>
                      </div>
                    </label>

                    <label
                      className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{
                        borderColor:
                          rateType === "whole" ? "#2563eb" : "#d1d5db",
                      }}
                    >
                      <input
                        type="radio"
                        name="rateType"
                        value="whole"
                        checked={rateType === "whole"}
                        onChange={(e) =>
                          setRateType(e.target.value as "head" | "whole")
                        }
                        className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div
                          className={`font-medium ${
                            rateType === "whole"
                              ? "text-blue-600"
                              : "text-gray-900"
                          }`}
                        >
                          Whole Event (Flat rate)
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* How will you receive your earnings? */}
              <div className="mb-8">
                <h2 className="text-base font-medium text-gray-900 mb-1">
                  How will you receive your earnings?
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Additional information may be needed.
                </p>

                <div className="space-y-4">
                  {/* Bank transfer */}
                  <label
                    className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor:
                        paymentMethod === "bank-transfer"
                          ? "#2563eb"
                          : "#d1d5db",
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank-transfer"
                      checked={paymentMethod === "bank-transfer"}
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value as "bank-transfer" | "gcash"
                        )
                      }
                      className="mt-1 mr-4 w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div
                        className={`font-medium mb-1 ${
                          paymentMethod === "bank-transfer"
                            ? "text-blue-600"
                            : "text-gray-900"
                        }`}
                      >
                        Bank transfer
                      </div>
                      <div className="text-sm text-gray-600">
                        Receive payment directly to your bank account for groups
                        of bookings. Bookings will qualify for payment 30 days
                        after departure.
                      </div>
                    </div>
                  </label>

                  {/* GCash */}
                  <label
                    className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor:
                        paymentMethod === "gcash" ? "#2563eb" : "#d1d5db",
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="gcash"
                      checked={paymentMethod === "gcash"}
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value as "bank-transfer" | "gcash"
                        )
                      }
                      className="mt-1 mr-4 w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div
                        className={`font-medium mb-1 ${
                          paymentMethod === "gcash"
                            ? "text-blue-600"
                            : "text-gray-900"
                        }`}
                      >
                        GCash
                      </div>
                      <div className="text-sm text-gray-600">
                        Receive payment directly to your GCash account. Payments
                        will be processed within 24-48 hours after event
                        completion.
                      </div>
                    </div>
                  </label>
                </div>

                {/* Note */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Note:</span> Your first payout
                    will be made 30 days after the check-out date of your first
                    booking. Future payouts will occur automatically 24 hours
                    after each guest's check-out date.
                  </p>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-2.5 border border-blue-600 rounded-md text-blue-600 font-medium hover:bg-blue-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (isStepValid(currentStep)) {
                      const nextStep = currentStep + 1;
                      setCurrentStep(nextStep);
                      setVisitedSteps((prev) => new Set([...prev, nextStep]));
                    }
                  }}
                  disabled={!isStepValid(currentStep)}
                  className={`px-6 py-2.5 rounded-md font-medium transition-colors ${
                    isStepValid(currentStep)
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {currentStep === 5 && (
            <>
              {/* Photos Heading */}
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Photos
              </h1>
              <h2 className="text-base font-semibold text-gray-900 mb-2">
                Property Photos
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Showcase your property with high-quality photos to attract
                bookings.
              </p>

              {/* Photos Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="relative"
                    draggable
                    onDragStart={(e) => {
                      setDraggedPhoto(photo.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedPhoto && draggedPhoto !== photo.id) {
                        const draggedIndex = photos.findIndex(
                          (p) => p.id === draggedPhoto
                        );
                        const targetIndex = photos.findIndex(
                          (p) => p.id === photo.id
                        );
                        const newPhotos = [...photos];
                        const [removed] = newPhotos.splice(draggedIndex, 1);
                        newPhotos.splice(targetIndex, 0, removed);
                        setPhotos(newPhotos);
                      }
                      setDraggedPhoto(null);
                    }}
                    style={{ cursor: "move" }}
                  >
                    {photo.isMain && (
                      <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded text-xs font-medium text-gray-900 z-10">
                        Main photo
                      </div>
                    )}
                    <div
                      className="relative border border-gray-300 rounded-lg overflow-hidden group"
                      style={{ aspectRatio: "4/3" }}
                    >
                      <img
                        src={photo.url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                      {/* Drag handle and delete button */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black bg-opacity-50 rounded p-1 cursor-move">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="9" cy="5" r="1" />
                            <circle cx="9" cy="12" r="1" />
                            <circle cx="9" cy="19" r="1" />
                            <circle cx="15" cy="5" r="1" />
                            <circle cx="15" cy="12" r="1" />
                            <circle cx="15" cy="19" r="1" />
                          </svg>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhotos((prev) =>
                              prev.filter((p) => p.id !== photo.id)
                            );
                          }}
                          className="bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-70"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {/* Set as main button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPhotos((prev) => {
                            // Remove main status from all photos
                            const updatedPhotos = prev.map((p) => ({
                              ...p,
                              isMain: false,
                            }));
                            // Find the photo to set as main
                            const photoIndex = updatedPhotos.findIndex(
                              (p) => p.id === photo.id
                            );
                            if (photoIndex !== -1) {
                              // Set this photo as main
                              updatedPhotos[photoIndex].isMain = true;
                              // Move it to the first position
                              const [movedPhoto] = updatedPhotos.splice(
                                photoIndex,
                                1
                              );
                              return [movedPhoto, ...updatedPhotos];
                            }
                            return updatedPhotos;
                          });
                        }}
                        className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-medium transition-opacity ${
                          photo.isMain
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100 opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        {photo.isMain ? "Main photo" : "Set as main"}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Photos Button */}
                <label
                  className="relative border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  style={{ aspectRatio: "4/3", minHeight: "200px" }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (files) {
                        const validPhotos: Array<{
                          id: string;
                          url: string;
                          isMain: boolean;
                        }> = [];
                        let hasInvalidPhotos = false;

                        for (const file of Array.from(files)) {
                          // Check file format
                          const validFormats = [
                            "image/png",
                            "image/jpeg",
                            "image/jpg",
                          ];
                          if (!validFormats.includes(file.type)) {
                            hasInvalidPhotos = true;
                            continue;
                          }

                          // Check file size (10MB = 10 * 1024 * 1024 bytes)
                          const maxSize = 10 * 1024 * 1024;
                          if (file.size > maxSize) {
                            hasInvalidPhotos = true;
                            continue;
                          }

                          // Check image dimensions
                          const img = new Image();
                          const imageUrl = URL.createObjectURL(file);

                          await new Promise((resolve) => {
                            img.onload = () => {
                              if (img.width < 800 || img.height < 600) {
                                hasInvalidPhotos = true;
                                URL.revokeObjectURL(imageUrl);
                              } else {
                                validPhotos.push({
                                  id: `photo-${Date.now()}-${Math.random()}`,
                                  url: imageUrl,
                                  isMain:
                                    photos.length === 0 &&
                                    validPhotos.length === 0,
                                });
                              }
                              resolve(null);
                            };
                            img.onerror = () => {
                              hasInvalidPhotos = true;
                              URL.revokeObjectURL(imageUrl);
                              resolve(null);
                            };
                            img.src = imageUrl;
                          });
                        }

                        if (hasInvalidPhotos) {
                          setShowPhotoWarning(true);
                        }

                        if (validPhotos.length > 0) {
                          setPhotos((prev) => [...prev, ...validPhotos]);
                        }
                      }
                    }}
                  />
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mb-2"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span className="text-blue-600 font-medium">Add photos</span>
                </label>
              </div>

              {/* Photo Warning Message */}
              {showPhotoWarning && (
                <div className="mb-6 relative bg-red-50 border border-red-200 rounded-lg p-4">
                  <button
                    type="button"
                    onClick={() => setShowPhotoWarning(false)}
                    className="absolute top-4 right-4 text-red-700 hover:text-red-900"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="flex items-start">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-red-600 mr-3 mt-0.5 flex-shrink-0"
                    >
                      <path
                        d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                        fill="#dc2626"
                      />
                      <path
                        d="M12 9v4M12 17h.01"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-red-800 mb-2">
                        Some photos weren't added
                      </h3>
                      <p className="text-sm text-red-700 mb-2">
                        Make sure they meet these requirements:
                      </p>
                      <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                        <li>Minimum size: 800x600px</li>
                        <li>Maximum size: 10MB</li>
                        <li>Format: .png or .jpg</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-2.5 border border-blue-600 rounded-md text-blue-600 font-medium hover:bg-blue-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (isStepValid(currentStep)) {
                      const nextStep = currentStep + 1;
                      setCurrentStep(nextStep);
                      setVisitedSteps((prev) => new Set([...prev, nextStep]));
                    }
                  }}
                  disabled={!isStepValid(currentStep)}
                  className={`px-6 py-2.5 rounded-md font-medium transition-colors ${
                    isStepValid(currentStep)
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {currentStep === 6 && (
            <>
              {/* Details Heading */}
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                Property details
              </h1>

              {/* Property Name */}
              <div className="mb-8">
                <h2 className="text-base font-semibold text-gray-900 mb-2">
                  Property name
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  This is the name customers will see and use to identify your
                  property. Don't worry, we'll generate other languages using a
                  standard translation template.
                </p>
                <div className="relative">
                  <input
                    type="text"
                    value={propertyName}
                    onChange={(e) => {
                      if (e.target.value.length <= 50) {
                        setPropertyName(e.target.value);
                      }
                    }}
                    placeholder="Property name"
                    maxLength={50}
                    className="w-full px-3 py-2.5 pb-8 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute bottom-2 left-3 text-xs text-gray-500">
                    {propertyName.length}/50
                  </div>
                </div>
              </div>

              {/* Property Description */}
              <div className="mb-8">
                <h2 className="text-base font-semibold text-gray-900 mb-2">
                  Property description
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Highlight the unique features and benefits of your property to
                  attract guests.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property description
                  </label>
                  <textarea
                    value={propertyDescription}
                    onChange={(e) => setPropertyDescription(e.target.value)}
                    placeholder="Whether you're working remote or traveling with family, this property is a great choice for accommodation. From here, guests can make the most of all that the lively city has to offer. With its convenient location, the property offers easy access to must-see destinations."
                    rows={8}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-y"
                  />
                </div>
              </div>

              {/* Number of Guests */}
              <div className="mb-8">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                  Number of Guests:
                </h2>
                <div className="space-y-3">
                  {[
                    { id: "1-50", label: "1-50 pax (Small)" },
                    { id: "51-100", label: "51-100 pax (Medium)" },
                    { id: "101-300", label: "101-300 pax (Large)" },
                    { id: "300+", label: "300+ pax (Grand Event)" },
                  ].map((range) => (
                    <label
                      key={range.id}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedGuestRange === range.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-300 bg-white hover:bg-gray-50"
                      }`}
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
                            setGuests("50");
                          } else if (e.target.value === "51-100") {
                            setGuests("100");
                          } else if (e.target.value === "101-300") {
                            setGuests("300");
                          } else if (e.target.value === "300+") {
                            setGuests("301");
                          }
                        }}
                        className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span
                        className={`text-sm ${
                          selectedGuestRange === range.id
                            ? "text-blue-600 font-medium"
                            : "text-gray-900"
                        }`}
                      >
                        {range.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Guest Number Limit */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guest Number Limit
                  <span className="text-gray-400 font-normal"> (optional)</span>
                </label>
                <input
                  type="number"
                  value={guestLimit}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow positive numbers
                    if (
                      value === "" ||
                      (!isNaN(Number(value)) && Number(value) >= 0)
                    ) {
                      setGuestLimit(value);
                    }
                  }}
                  placeholder="e.g., 700"
                  min="0"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Set the maximum number of guests allowed for this venue
                </p>
              </div>

              {/* Property Size */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property size{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={propertySize}
                    onChange={(e) => setPropertySize(e.target.value)}
                    placeholder="Enter property size"
                    min="0"
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-600">sqm</span>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-2.5 border border-blue-600 rounded-md text-blue-600 font-medium hover:bg-blue-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (isStepValid(currentStep)) {
                      const nextStep = currentStep + 1;
                      setCurrentStep(nextStep);
                      setVisitedSteps((prev) => new Set([...prev, nextStep]));
                    }
                  }}
                  disabled={!isStepValid(currentStep)}
                  className={`px-6 py-2.5 rounded-md font-medium transition-colors ${
                    isStepValid(currentStep)
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {currentStep === 7 && (
            <>
              {/* Publish Heading */}
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                Publish
              </h1>

              {/* Property Preview Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                    {photos.length > 0 && photos[0]?.url ? (
                      <img
                        src={photos[0].url}
                        alt="Property preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {/* Location */}
                  <div className="flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-600"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="text-sm text-gray-700">
                      {city && state
                        ? `${city}, ${state}`
                        : city || state || "Location not set"}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Accept Terms & Conditions */}
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-4">
                    Accept the Terms & Conditions
                  </h2>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="acceptTerms"
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      I acknowledge that I have read and agree to Venu's{" "}
                      <a
                        href="#"
                        className="text-blue-600 underline hover:text-blue-700"
                      >
                        Terms and Conditions
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="text-blue-600 underline hover:text-blue-700"
                      >
                        Privacy Policy
                      </a>
                      . Additionally, I confirm my compliance with all relevant{" "}
                      <a
                        href="#"
                        className="text-blue-600 underline hover:text-blue-700"
                      >
                        local laws and regulations
                      </a>
                      .
                    </label>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-2.5 border border-blue-600 rounded-md text-blue-600 font-medium hover:bg-blue-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!currentUser) {
                      setAuthModalOpen(true);
                      return;
                    }
                    // Handle publish action
                    if (acceptTerms && currentUser) {
                      // Create listing object
                      const listing = {
                        id: `listing_${Date.now()}`,
                        propertyName,
                        propertyDescription,
                        propertySize,
                        location: {
                          country,
                          state,
                          city,
                          streetAddress,
                          buildingUnit,
                          zipCode,
                        },
                        mapUrl,
                        selectedOccasions: selectedOccasions,
                        selectedAmenities: selectedAmenities,
                        guests: guests || "50",
                        guestRange: selectedGuestRange,
                        guestLimit: guestLimit
                          ? parseInt(guestLimit)
                          : undefined,
                        pricing: {
                          eventRate,
                          rateType,
                          paymentMethod,
                          currency: currencyCode,
                        },
                        photos: photos.map((photo) => ({
                          id: photo.id,
                          url: photo.url,
                          isMain: photo.isMain,
                        })),
                        createdAt: new Date().toISOString(),
                      };

                      // Save to hostListings in localStorage
                      const hostListingsKey = `hostListings_${currentUser.uid}`;
                      const existingListings =
                        localStorage.getItem(hostListingsKey);
                      const listings = existingListings
                        ? JSON.parse(existingListings)
                        : [];
                      // Add status: 'listed' by default for new listings
                      const listingWithStatus = {
                        ...listing,
                        status: 'listed',
                        published: true,
                      };
                      listings.push(listingWithStatus);
                      localStorage.setItem(
                        hostListingsKey,
                        JSON.stringify(listings)
                      );

                      // Trigger custom event to update dashboard
                      window.dispatchEvent(new CustomEvent('hostListingsUpdated'));
                      window.dispatchEvent(new CustomEvent('listingUpdated'));

                      // Clear draft data
                      localStorage.removeItem("listYourPlaceDraft");

                      // Navigate to host page if came from host, otherwise dashboard
                      router.push(
                        fromHost ? "/host?tab=listings" : "/dashboard"
                      );
                    }
                  }}
                  disabled={!acceptTerms}
                  className={`px-6 py-2.5 rounded-md font-medium transition-colors ${
                    acceptTerms
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Publish
                </button>
                {/* Auth Modal for logged out users */}
                {authModalOpen && !currentUser && (
                  <div
                    className="modal-overlay"
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
                      zIndex: 10000,
                      minHeight: "100vh",
                      height: "100vh",
                      padding: 0,
                    }}
                    onClick={() => setAuthModalOpen(false)}
                  >
                    <div
                      className="auth-modal"
                      style={{
                        position: "relative",
                        background: "#fff",
                        borderRadius: "16px",
                        boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
                        width: "100%",
                        maxWidth: 400,
                        padding: "32px 24px 24px 24px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="modal-close"
                        type="button"
                        aria-label="Close modal"
                        onClick={() => setAuthModalOpen(false)}
                        style={{
                          position: "absolute",
                          top: 20,
                          right: 20,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          transition: "background-color 0.2s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f0f0f0")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
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
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                      <div className="modal-content" style={{ width: "100%" }}>
                        <h2
                          className="modal-header"
                          style={{
                            textAlign: "center",
                            fontWeight: 700,
                            fontSize: 22,
                            marginBottom: 8,
                          }}
                        >
                          Log in or sign up
                        </h2>
                        <div
                          className="modal-divider"
                          style={{
                            width: "100%",
                            height: 1,
                            background: "#eee",
                            margin: "16px 0",
                          }}
                        ></div>
                        <h1
                          className="modal-welcome"
                          style={{
                            textAlign: "center",
                            fontWeight: 600,
                            fontSize: 18,
                            marginBottom: 16,
                          }}
                        >
                          Welcome to Venu
                        </h1>
                        {/* OtpLogin for phone authentication */}
                        <OtpLogin
                          onSuccess={() => setAuthModalOpen(false)}
                          onClose={() => setAuthModalOpen(false)}
                        />
                        <div
                          className="modal-divider"
                          style={{
                            width: "100%",
                            height: 1,
                            background: "#eee",
                            margin: "24px 0 16px 0",
                            position: "relative",
                            textAlign: "center",
                          }}
                        >
                          <span
                            style={{
                              position: "relative",
                              top: -12,
                              background: "#fff",
                              padding: "0 12px",
                              color: "#888",
                              fontSize: 14,
                            }}
                          >
                            or
                          </span>
                        </div>
                        <div
                          className="social-buttons"
                          style={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                          }}
                        >
                          <button
                            className="social-button social-google"
                            type="button"
                            style={{
                              background: "#fff",
                              color: "#222",
                              border: "1px solid #ccc",
                              marginBottom: 0,
                              display: "flex",
                              alignItems: "center",
                              fontWeight: 500,
                              fontSize: 15,
                              padding: "10px 0",
                              borderRadius: 8,
                              justifyContent: "center",
                            }}
                            onClick={async () => {
                              try {
                                setAuthModalOpen(false);
                                const { GoogleAuthProvider, signInWithPopup } =
                                  await import("firebase/auth");
                                const provider = new GoogleAuthProvider();
                                const result = await signInWithPopup(
                                  auth,
                                  provider
                                );
                                const user = result.user;
                                router.push("/dashboard");
                              } catch (error) {
                                alert("Failed to sign in with Google.");
                              }
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                marginRight: 8,
                              }}
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 48 48"
                                style={{ display: "block" }}
                              >
                                <g>
                                  <path
                                    fill="#4285F4"
                                    d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7-11.3 7-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.7 20-21 0-1.4-.2-2.7-.4-3.5z"
                                  />
                                  <path
                                    fill="#34A853"
                                    d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c2.7 0 5.2.9 7.2 2.4l6-6C34.5 5.1 29.5 3 24 3 16.3 3 9.3 7.6 6.3 14.7z"
                                  />
                                  <path
                                    fill="#FBBC05"
                                    d="M24 45c5.4 0 10.4-1.8 14.3-4.9l-6.6-5.4C29.5 36.9 26.9 38 24 38c-5.5 0-10.2-3.7-11.8-8.7l-6.5 5C9.3 40.4 16.3 45 24 45z"
                                  />
                                  <path
                                    fill="#EA4335"
                                    d="M43.6 20.5h-1.9V20H24v8h11.3c-1.1 3-3.5 5.2-6.3 6.5l6.6 5.4C39.7 37.1 45 32.5 45 24c0-1.4-.2-2.7-.4-3.5z"
                                  />
                                </g>
                              </svg>
                            </span>
                            Continue with Google
                          </button>
                          <button
                            className="social-button social-apple"
                            type="button"
                            style={{
                              background: "#000",
                              color: "white",
                              marginBottom: 0,
                              display: "flex",
                              alignItems: "center",
                              fontWeight: 500,
                              fontSize: 15,
                              padding: "10px 0",
                              borderRadius: 8,
                              justifyContent: "center",
                            }}
                            onClick={() =>
                              alert("Apple sign-in not yet implemented.")
                            }
                          >
                            <span style={{ marginRight: 8, fontSize: 18 }}>
                              
                            </span>{" "}
                            Continue with Apple
                          </button>
                          <button
                            className="social-button social-email"
                            type="button"
                            style={{
                              background: "#fff",
                              color: "#222",
                              border: "1px solid #ccc",
                              marginBottom: 0,
                              display: "flex",
                              alignItems: "center",
                              fontWeight: 500,
                              fontSize: 15,
                              padding: "10px 0",
                              borderRadius: 8,
                              justifyContent: "center",
                            }}
                            onClick={() =>
                              alert("Email sign-in not yet implemented.")
                            }
                          >
                            <span style={{ marginRight: 8, fontSize: 18 }}>
                              ✉️
                            </span>{" "}
                            Continue with email
                          </button>
                          <button
                            className="social-button social-facebook"
                            type="button"
                            style={{
                              background: "#fff",
                              color: "#1877F3",
                              border: "1px solid #ccc",
                              marginBottom: 0,
                              display: "flex",
                              alignItems: "center",
                              fontWeight: 500,
                              fontSize: 15,
                              padding: "10px 0",
                              borderRadius: 8,
                              justifyContent: "center",
                            }}
                            onClick={async () => {
                              try {
                                setAuthModalOpen(false);
                                const {
                                  FacebookAuthProvider,
                                  signInWithPopup,
                                } = await import("firebase/auth");
                                const provider = new FacebookAuthProvider();
                                const result = await signInWithPopup(
                                  auth,
                                  provider
                                );
                                const user = result.user;
                                router.push("/dashboard");
                              } catch (error) {
                                alert("Failed to sign in with Facebook.");
                              }
                            }}
                          >
                            <span style={{ marginRight: 8, fontSize: 18 }}>
                              f
                            </span>{" "}
                            Continue with Facebook
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
