"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import OtpLogin from "./components/OtpLogin";
import FinishSignup from "./components/FinishSignup";
import Logo from "./components/Logo";
import { WeddingRingsIcon } from "./components/WeddingRingsIcon";
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
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
    <path
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M18 9c0-4.97-4.03-9-9-9S0 4.03 0 9c0 4.42 3.23 8.08 7.45 8.84v-6.26H5.31V9h2.14V7.02c0-2.12 1.26-3.29 3.19-3.29.92 0 1.89.17 1.89.17v2.08h-1.07c-1.05 0-1.38.65-1.38 1.32V9h2.34l-.37 2.58h-1.97v6.26C14.77 17.08 18 13.42 18 9z"
      fill="#1877F2"
    />
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const EmailIcon = () => (
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
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const ChevronDownIcon = () => (
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
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Occasion Icons matching list-your-place
const BirthdayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="16" width="14" height="4" rx="1" fill="#15a1ff" />
    <rect x="5.5" y="15.5" width="13" height="1" fill="#fff" />
    <rect x="6" y="12" width="12" height="4" rx="0.5" fill="#15a1ff" />
    <rect x="6.5" y="11.5" width="11" height="1" fill="#fff" />
    <rect x="7" y="8" width="10" height="4" rx="0.5" fill="#15a1ff" />
    <rect x="11" y="4" width="2" height="4" fill="#15a1ff" />
    <circle cx="12" cy="3" r="1.5" fill="#15a1ff" />
  </svg>
);

const ConferenceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="5" width="18" height="11" rx="1" fill="#15a1ff" />
    <rect x="4" y="6" width="16" height="9" rx="0.5" fill="#fff" />
    <circle cx="12" cy="11" r="2.5" fill="#15a1ff" />
    <rect x="9" y="13.5" width="6" height="8" rx="0.5" fill="#15a1ff" />
  </svg>
);

const FuneralIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 7 Q12 2, 18 7 L18 15 L6 15 Z" fill="#15a1ff" />
    <rect x="11" y="7" width="2" height="8" fill="#fff" />
    <rect x="9" y="9" width="6" height="2" fill="#fff" />
    <rect x="10.5" y="7" width="3" height="1" fill="#fff" />
    <rect x="5.5" y="15" width="13" height="2" fill="#15a1ff" />
    <rect x="4.5" y="17" width="15" height="3" fill="#15a1ff" />
  </svg>
);

const Sweet18thIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="6" width="2.2" height="12" rx="0.4" fill="#15a1ff" />
    <ellipse cx="14" cy="9.5" rx="3.5" ry="3.5" fill="#15a1ff" />
    <ellipse cx="14" cy="15.5" rx="3.5" ry="3.5" fill="#15a1ff" />
    <circle cx="14" cy="9.5" r="1.8" fill="#fff" />
    <circle cx="14" cy="15.5" r="1.8" fill="#fff" />
  </svg>
);

const ExhibitionIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="12" stroke="#15a1ff" strokeWidth="1.5" fill="none" />
    <path d="M4 13 L8 5 L12 8 L12 13 Z" fill="#15a1ff" />
    <path d="M12 13 L12 8 L16 7 L20 13 Z" fill="#15a1ff" />
    <circle cx="18" cy="6" r="2" fill="#15a1ff" />
    <rect x="5" y="16" width="2" height="4" fill="#15a1ff" />
    <circle cx="6" cy="16" r="1" fill="#15a1ff" />
    <rect x="17" y="16" width="2" height="4" fill="#15a1ff" />
    <circle cx="18" cy="16" r="1" fill="#15a1ff" />
    <path d="M7 17 Q12 15, 17 17" stroke="#15a1ff" strokeWidth="1.5" fill="none" />
  </svg>
);

const SeminarsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="6" r="3" fill="#15a1ff" />
    <rect x="8.5" y="9" width="7" height="4" rx="0.5" fill="#15a1ff" />
    <rect x="5" y="12" width="14" height="2.5" fill="#15a1ff" />
    <rect x="7" y="14.5" width="10" height="7" rx="1.5" fill="#15a1ff" />
  </svg>
);

const AnniversariesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15a1ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 2 Q12 2 19 2 Q19 4 19 7 Q19 10 12 10 Q5 10 5 7 Q5 4 5 2" />
    <line x1="12" y1="10" x2="12" y2="17" />
    <path d="M8 19 A4 4 0 0 1 16 19" />
    <line x1="8" y1="19" x2="16" y2="19" />
    <path d="M6.5 8 Q12 7.5 17.5 8" fill="none" />
  </svg>
);

const RecreationFunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4 L18 12 L12 20 L6 12 Z" fill="#15a1ff" />
    <line x1="12" y1="4" x2="12" y2="20" stroke="#fff" strokeWidth="1.5" />
    <line x1="6" y1="12" x2="18" y2="12" stroke="#fff" strokeWidth="1.5" />
    <path d="M12 20 L10 22 L12 23 L14 22 Z" fill="#15a1ff" />
    <circle cx="10" cy="22" r="0.8" fill="#15a1ff" />
    <circle cx="14" cy="22" r="0.8" fill="#15a1ff" />
  </svg>
);

const PromIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 1 L11 3 L7 5 Z" fill="#15a1ff" />
    <path d="M17 1 L13 3 L17 5 Z" fill="#15a1ff" />
    <rect x="11" y="2.5" width="2" height="1" fill="#15a1ff" />
    <path d="M4 4 Q4 5 5 6.5 Q6 8 7.5 9 Q9 10 10.5 10.5 Q12 11 13.5 10.5 Q15 10 16.5 9 Q18 8 19 6.5 Q20 5 20 4 L20 20 L4 20 Z" fill="#15a1ff" />
    <path d="M8.5 6.5 Q9 7.5 9.5 8.5 Q10 9.5 10.5 10 Q11 10.5 12 10.5 Q13 10.5 13.5 10 Q14 9.5 14.5 8.5 Q15 7.5 15.5 6.5 L15.5 18 L8.5 18 Z" fill="#fff" />
    <circle cx="12" cy="10.5" r="0.7" fill="#15a1ff" />
    <circle cx="12" cy="13" r="0.7" fill="#15a1ff" />
    <circle cx="12" cy="15.5" r="0.7" fill="#15a1ff" />
  </svg>
);

const AcquaintancePartyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15a1ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const BridalShowersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15a1ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="3.5" r="3" fill="#15a1ff" />
    <circle cx="12" cy="3.5" r="2" fill="#fff" />
    <path d="M9 1.5 Q12 0.5 15 1.5 Q15 1 12 1 Q9 1 9 1.5" fill="#15a1ff" />
    <line x1="11" y1="6.5" x2="11" y2="7.5" strokeWidth="1.5" />
    <line x1="13" y1="6.5" x2="13" y2="7.5" strokeWidth="1.5" />
    <path d="M10 7.5 L10 10.5 L14 10.5 L14 7.5 Q12 7 10 7.5" />
    <path d="M10 8 L8.5 7 L5 4.5 L3 3" strokeWidth="1.5" fill="none" />
    <path d="M14 8 L15.5 7 L19 4.5 L21 3" strokeWidth="1.5" fill="none" />
    <line x1="10" y1="7.5" x2="9" y2="9" strokeWidth="1.5" />
    <line x1="14" y1="7.5" x2="15" y2="9" strokeWidth="1.5" />
    <line x1="10" y1="10.5" x2="14" y2="10.5" strokeWidth="2" />
    <path d="M10 10.5 L14 10.5 L18 22 L6 22 Z" />
  </svg>
);

const FamilyReunionIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="6" r="1.6" fill="#15a1ff" />
    <path d="M4 8.5 L8 8.5 L7.5 13.5 L4.5 13.5 Z" fill="#15a1ff" />
    <circle cx="18" cy="6" r="1.6" fill="#15a1ff" />
    <path d="M16 8.5 L20 8.5 L19.5 13.5 L16.5 13.5 Z" fill="#15a1ff" />
    <circle cx="12" cy="8" r="1.3" fill="#15a1ff" />
    <path d="M10.5 10.2 L13.5 10.2 L13 13.5 L11 13.5 Z" fill="#15a1ff" />
  </svg>
);

const GraduationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15a1ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10 5 10-5-10-5L2 10z" />
    <path d="M6 12v5c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-5" />
  </svg>
);

const TeamBuildingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="18" width="14" height="2" rx="0.2" fill="#15a1ff" />
    <rect x="6" y="16" width="12" height="2" rx="0.2" fill="#15a1ff" />
    <rect x="5" y="14" width="14" height="2" rx="0.2" fill="#15a1ff" />
    <rect x="6" y="12" width="12" height="2" rx="0.2" fill="#15a1ff" />
    <rect x="5" y="10" width="14" height="2" rx="0.2" fill="#15a1ff" />
    <rect x="6" y="8" width="12" height="2" rx="0.2" fill="#15a1ff" />
    <rect x="5" y="6" width="14" height="2" rx="0.2" fill="#15a1ff" />
    <rect x="6" y="4" width="12" height="2" rx="0.2" fill="#15a1ff" />
    <rect x="3" y="10" width="3" height="2" rx="0.2" fill="#15a1ff" />
    <rect x="18" y="8" width="3" height="2" rx="0.2" fill="#15a1ff" />
  </svg>
);

const BabyShowersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="6" r="3" fill="#15a1ff" />
    <rect x="9" y="9" width="6" height="4" rx="0.5" fill="#15a1ff" />
    <path d="M10 13 L14 13 L15.5 17 L8.5 17 Z" fill="#fff" />
  </svg>
);

const ChristeningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="11" y="4" width="2" height="16" fill="#15a1ff" />
    <rect x="6" y="8" width="12" height="2" fill="#15a1ff" />
  </svg>
);

export default function Home() {
  const router = useRouter();
  const [activeField, setActiveField] = useState<string | null>(null);
  const [searchHovered, setSearchHovered] = useState(false);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [languageClosing, setLanguageClosing] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("Philippines");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedCurrency, setSelectedCurrency] = useState("PHP ₱");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [carouselPositions, setCarouselPositions] = useState<
    Record<string, number>
  >({});
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [hostModalOpen, setHostModalOpen] = useState(false);
  const [manageBookingModalOpen, setManageBookingModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [hostPhoneNumber, setHostPhoneNumber] = useState("");
  const [hostCountryCode, setHostCountryCode] = useState("+63");
  const [bookingReference, setBookingReference] = useState("");
  const [lastNameOrEmail, setLastNameOrEmail] = useState("");
  const [hostCountryCodeOpen, setHostCountryCodeOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<string>("");
  const [funeralStartDate, setFuneralStartDate] = useState<Date | null>(null);
  const [funeralEndDate, setFuneralEndDate] = useState<Date | null>(null);
  const [budgetType, setBudgetType] = useState<"per head" | "whole event">(
    "per head"
  );
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [hasListings, setHasListings] = useState(false);
  const searchbarRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const hostCountryCodeRef = useRef<HTMLDivElement>(null);
  const carouselRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const authModalRef = useRef<HTMLDivElement>(null);
  const hostModalRef = useRef<HTMLDivElement>(null);
  const manageBookingModalRef = useRef<HTMLDivElement>(null);

  // Region to Currency mapping
  const regionToCurrency: Record<string, string> = {
    Philippines: "PHP ₱",
    "United States": "USD $",
    "United Kingdom": "GBP £",
    Canada: "CAD $",
    Australia: "AUD $",
    Japan: "JPY ¥",
    "South Korea": "KRW ₩",
  };

  // Function to close language modal with animation
  const closeLanguageModal = useCallback(() => {
    setLanguageClosing(true);
    setTimeout(() => {
      setLanguageOpen(false);
      setLanguageClosing(false);
    }, 300); // Match animation duration
  }, []);

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
        icon: <WeddingRingsIcon size={20} color="#15a1ff" />,
        title: "Wedding",
        description: "Wedding venues",
      },
      {
        icon: <BirthdayIcon />,
        title: "Birthday",
        description: "Birthday party venues",
      },
      {
        icon: <AnniversariesIcon />,
        title: "Anniversaries",
        description: "Anniversary venues",
      },
      {
        icon: <FuneralIcon />,
        title: "Funeral",
        description: "Funeral venues",
      },
      {
        icon: <Sweet18thIcon />,
        title: "Sweet 18th",
        description: "Sweet 18th venues",
      },
      {
        icon: <ConferenceIcon />,
        title: "Conference",
        description: "Conference venues",
      },
      {
        icon: <ExhibitionIcon />,
        title: "Exhibition",
        description: "Exhibition venues",
      },
      {
        icon: <SeminarsIcon />,
        title: "Seminars",
        description: "Seminar venues",
      },
      {
        icon: <RecreationFunIcon />,
        title: "Recreation and Fun",
        description: "Recreation venues",
      },
      {
        icon: <PromIcon />,
        title: "Prom",
        description: "Prom venues",
      },
      {
        icon: <AcquaintancePartyIcon />,
        title: "Acquaintance Party",
        description: "Acquaintance party venues",
      },
      {
        icon: <BridalShowersIcon />,
        title: "Bridal Showers",
        description: "Bridal shower venues",
      },
      {
        icon: <FamilyReunionIcon />,
        title: "Family Reunion",
        description: "Family reunion venues",
      },
      {
        icon: <GraduationIcon />,
        title: "Graduation",
        description: "Graduation venues",
      },
      {
        icon: <TeamBuildingIcon />,
        title: "Team Building",
        description: "Team building venues",
      },
      {
        icon: <BabyShowersIcon />,
        title: "Baby Showers",
        description: "Baby shower venues",
      },
      {
        icon: <ChristeningIcon />,
        title: "Christening",
        description: "Christening venues",
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

  // Update input field when Funeral dates change
  useEffect(() => {
    const occasionInput = document.getElementById("search-occasion") as HTMLInputElement;
    const occasionValue = occasionInput?.value?.trim() || "";
    const whenInput = document.getElementById("search-when") as HTMLInputElement;
    
    if (occasionValue === "Funeral" && selectedDates.length > 0 && whenInput) {
      const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
      const startDate = sortedDates[0];
      const endDate = sortedDates[sortedDates.length - 1];
      if (sortedDates.length === 1) {
        whenInput.value = `${monthNames[startDate.getMonth()]} ${startDate.getDate()}, ${startDate.getFullYear()}`;
      } else {
        whenInput.value = `${monthNames[startDate.getMonth()]} ${startDate.getDate()}, ${startDate.getFullYear()} - ${monthNames[endDate.getMonth()]} ${endDate.getDate()}, ${endDate.getFullYear()}`;
      }
    } else if (occasionValue !== "Funeral" && selectedDates.length > 0) {
      // Clear multiple dates if occasion changes away from Funeral
      setSelectedDates([]);
      setFuneralStartDate(null);
      setFuneralEndDate(null);
    }
  }, [selectedDates]);

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
        setManageBookingModalOpen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    // Prevent body scroll when modal is open without causing layout shift
    if (authModalOpen || hostModalOpen || manageBookingModalOpen) {
      // Calculate scrollbar width
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
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
  }, [authModalOpen, hostModalOpen, manageBookingModalOpen]);

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
        const scrollPosition =
          window.scrollY || document.documentElement.scrollTop;

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
    const initialScrollPosition =
      window.scrollY || document.documentElement.scrollTop;
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

  const handleDateClick = (day: number, month: number, year: number) => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    
    // Check if Funeral is selected
    const occasionInput = document.getElementById("search-occasion") as HTMLInputElement;
    const occasionValue = occasionInput?.value?.trim() || "";
    const isFuneral = occasionValue === "Funeral";
    
    if (isFuneral) {
      // For Funeral: allow connected date range selection (up to 21 days)
      if (!funeralStartDate) {
        // First click: set start date
        setFuneralStartDate(date);
        setFuneralEndDate(null);
        setSelectedDates([date]);
      } else if (!funeralEndDate) {
        // Second click: set end date and fill in all dates between
        const start = new Date(funeralStartDate);
        start.setHours(0, 0, 0, 0);
        
        // If clicked date is before start date, swap them
        if (date < start) {
          setFuneralStartDate(date);
          setFuneralEndDate(start);
          const daysDiff = Math.ceil((start.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          if (daysDiff <= 21) {
            const rangeDates: Date[] = [];
            for (let d = new Date(date); d <= start; d.setDate(d.getDate() + 1)) {
              rangeDates.push(new Date(d));
            }
            setSelectedDates(rangeDates);
          } else {
            // Range too large, reset
            setFuneralStartDate(date);
            setFuneralEndDate(null);
            setSelectedDates([date]);
          }
        } else {
          const daysDiff = Math.ceil((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          if (daysDiff <= 21) {
            setFuneralEndDate(date);
            const rangeDates: Date[] = [];
            for (let d = new Date(start); d <= date; d.setDate(d.getDate() + 1)) {
              rangeDates.push(new Date(d));
            }
            setSelectedDates(rangeDates);
          } else {
            // Range exceeds 21 days, reset with new start
            setFuneralStartDate(date);
            setFuneralEndDate(null);
            setSelectedDates([date]);
          }
        }
      } else {
        // Third click: reset and start new range
        setFuneralStartDate(date);
        setFuneralEndDate(null);
        setSelectedDates([date]);
      }
      setSelectedDate(null); // Clear single date selection
    } else {
      // For all other occasions: single date selection only
      setSelectedDate(date);
      setSelectedDates([]); // Clear multiple dates
      setFuneralStartDate(null);
      setFuneralEndDate(null);
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

  const [showFinishSignup, setShowFinishSignup] = useState(false);
  const [signedInUser, setSignedInUser] = useState<User | null>(null);

  // Check if user has listings
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const listings = localStorage.getItem(`listings_${user.uid}`);
        const hostListings = localStorage.getItem(`hostListings_${user.uid}`);
        setHasListings(!!(listings && JSON.parse(listings).length > 0) || !!(hostListings && JSON.parse(hostListings).length > 0));
      } else {
        setHasListings(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleOtpSuccess = (user: User) => {
    setAuthModalOpen(false);

    // Check if user has completed signup by checking if they have a displayName
    // displayName is set during the finish signup process
    // If they have displayName, they've completed signup before - redirect to dashboard
    // If no displayName, they're a new user - show finish signup page
    const hasCompletedSignup =
      user.displayName && user.displayName.trim().length > 0;

    if (hasCompletedSignup) {
      // Existing user who has completed signup - redirect directly to dashboard
      router.push("/dashboard");
    } else {
      // New user or user who hasn't completed signup - show finish signup page
      setSignedInUser(user);
      setShowFinishSignup(true);
    }
  };

  const handleFinishSignupComplete = () => {
    setShowFinishSignup(false);
    // Redirect to dashboard after completing signup
    router.push("/dashboard");
  };


  // Get current pathname to conditionally hide the button
  let currentPath = "";
  if (typeof window !== "undefined") {
    currentPath = window.location.pathname;
  }

  // Helper: Hide 'List your place' on /venue-preview/[id] and /venue/[id]
  const hideListYourPlace =
    currentPath.startsWith("/venue-preview/") || currentPath.startsWith("/venue/");

  return (
    <div className="page-shell">
      <header className={`header ${isScrolled ? "shrink" : ""}`}>
        <div className="left-section">
          <Logo />
        </div>

        <div className="middle-section">
          {!isScrolled && (
            <button className="event-button" type="button">
              <img
                src="/event-icon.png"
                alt="Events"
                className="event-icon-img"
              />
              <div className="event">EVENTS</div>
            </button>
          )}
        </div>

        <div className="right-section">
          {!isScrolled && !hideListYourPlace && (
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
              aria-label={
                languageOpen ? "Close language menu" : "Open language menu"
              }
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
                  <button
                    className="menu-item"
                    type="button"
                    onClick={() => {
                      setManageBookingModalOpen(true);
                      setBurgerOpen(false);
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
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Manage Booking
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
          className={`searchbar ${searchHovered ? "hovered" : ""} ${
            isScrolled ? "shrunk" : ""
          }`}
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
                className={`field ${activeField === field.id ? "active" : ""}`}
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
                  <div className="calendar-title">
                    When is your event?
                    {(() => {
                      const occasionInput = document.getElementById("search-occasion") as HTMLInputElement;
                      const occasionValue = occasionInput?.value?.trim() || "";
                      if (occasionValue === "Funeral" && selectedDates.length > 0) {
                        return <span style={{ fontSize: '14px', fontWeight: '400', color: '#666', marginLeft: '8px' }}>({selectedDates.length}/21 days selected)</span>;
                      }
                      return null;
                    })()}
                  </div>
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
                              const date = day !== null ? new Date(calendarYear, calendarMonth, day) : null;
                              date?.setHours(0, 0, 0, 0);
                              const dateStr = date ? date.toISOString().split('T')[0] : '';
                              const isSelected = selectedDate && day !== null &&
                                selectedDate.getDate() === day &&
                                selectedDate.getMonth() === calendarMonth &&
                                selectedDate.getFullYear() === calendarYear;
                              const isInSelectedDates = selectedDates.some(d => {
                                const dStr = d.toISOString().split('T')[0];
                                return dStr === dateStr;
                              });
                              const occasionInput = document.getElementById("search-occasion") as HTMLInputElement;
                              const occasionValue = occasionInput?.value?.trim() || "";
                              const isFuneral = occasionValue === "Funeral";
                              
                              // Check if date is in range (between start and end, or is start/end)
                              const isInRange = isFuneral && funeralStartDate && date && (
                                (funeralEndDate && date >= funeralStartDate && date <= funeralEndDate) ||
                                (!funeralEndDate && dateStr === funeralStartDate.toISOString().split('T')[0])
                              );
                              
                              return (
                                <button
                                  key={index}
                                  className={`calendar-day ${
                                    day === null ? "empty" : ""
                                  } ${
                                    (isSelected || isInSelectedDates || isInRange) ? "selected" : ""
                                  } ${isPast ? "past" : ""} ${isFuneral && (isInSelectedDates || isInRange) ? "funeral-selected" : ""}`}
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
                                  title={isFuneral && selectedDates.length > 0 ? `${selectedDates.length}/21 days selected` : isFuneral && funeralStartDate && !funeralEndDate ? "Select end date (max 21 days)" : ""}
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
                                const date = day !== null ? new Date(next.year, next.month, day) : null;
                                date?.setHours(0, 0, 0, 0);
                                const dateStr = date ? date.toISOString().split('T')[0] : '';
                                const isSelected = selectedDate && day !== null &&
                                  selectedDate.getDate() === day &&
                                  selectedDate.getMonth() === next.month &&
                                  selectedDate.getFullYear() === next.year;
                                const isInSelectedDates = selectedDates.some(d => {
                                  const dStr = d.toISOString().split('T')[0];
                                  return dStr === dateStr;
                                });
                                const occasionInput = document.getElementById("search-occasion") as HTMLInputElement;
                                const occasionValue = occasionInput?.value?.trim() || "";
                                const isFuneral = occasionValue === "Funeral";
                                
                                // Check if date is in range (between start and end, or is start/end)
                                const isInRange = isFuneral && funeralStartDate && date && (
                                  (funeralEndDate && date >= funeralStartDate && date <= funeralEndDate) ||
                                  (!funeralEndDate && dateStr === funeralStartDate.toISOString().split('T')[0])
                                );
                                
                                return (
                                  <button
                                    key={index}
                                    className={`calendar-day ${
                                      day === null ? "empty" : ""
                                    } ${
                                      (isSelected || isInSelectedDates || isInRange) ? "selected" : ""
                                    } ${isPast ? "past" : ""} ${isFuneral && (isInSelectedDates || isInRange) ? "funeral-selected" : ""}`}
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
                                    title={isFuneral && selectedDates.length > 0 ? `${selectedDates.length}/21 days selected` : isFuneral && funeralStartDate && !funeralEndDate ? "Select end date (max 21 days)" : ""}
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
                            selectedBudget === "₱500 - ₱1000" ? "selected" : ""
                          }`}
                          type="button"
                          onClick={() => {
                            const input = document.getElementById(
                              "search-budget"
                            ) as HTMLInputElement;
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
                          className={`budget-option ${
                            selectedBudget === "₱1000+" ? "selected" : ""
                          }`}
                          type="button"
                          onClick={() => {
                            const input = document.getElementById(
                              "search-budget"
                            ) as HTMLInputElement;
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
                          className={`budget-option ${
                            selectedBudget === "₱10,000 - ₱30,000"
                              ? "selected"
                              : ""
                          }`}
                          type="button"
                          onClick={() => {
                            const input = document.getElementById(
                              "search-budget"
                            ) as HTMLInputElement;
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
                    <div
                      className="dropdown-options-scroll"
                      style={{
                        maxHeight: "400px",
                        overflowY: "auto",
                        overflowX: "hidden",
                        scrollBehavior: "smooth",
                      }}
                    >
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
                            // Track selected occasion
                            if (field.id === "occasion") {
                              setSelectedOccasion(option.title);
                              // Reset dates when occasion changes
                              if (option.title !== "Funeral") {
                                setSelectedDates([]);
                                setSelectedDate(null);
                                setFuneralStartDate(null);
                                setFuneralEndDate(null);
                              } else {
                                // Reset funeral dates when switching to Funeral
                                setFuneralStartDate(null);
                                setFuneralEndDate(null);
                                setSelectedDates([]);
                              }
                            }
                            setActiveField(null);
                          }}
                        >
                          <div className="dropdown-icon">{option.icon}</div>
                          <div className="dropdown-content">
                            <div className="dropdown-option-title">
                              {option.title}
                            </div>
                            <div className="dropdown-option-description">
                              {option.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
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

              // Check if all fields are filled
              const whereValue = whereInput?.value?.trim() || "";
              const occasionValue = occasionInput?.value?.trim() || "";
              let whenValue = whenInput?.value?.trim() || "";
              const guestValue = guestInput?.value?.trim() || "";
              const budgetValue = budgetInput?.value?.trim() || "";

              // For Funeral, format multiple dates
              if (occasionValue === 'Funeral' && selectedDates.length > 0) {
                const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
                const startDate = sortedDates[0];
                const endDate = sortedDates[sortedDates.length - 1];
                if (sortedDates.length === 1) {
                  whenValue = `${monthNames[startDate.getMonth()]} ${startDate.getDate()}, ${startDate.getFullYear()}`;
                } else {
                  whenValue = `${monthNames[startDate.getMonth()]} ${startDate.getDate()}, ${startDate.getFullYear()} - ${monthNames[endDate.getMonth()]} ${endDate.getDate()}, ${endDate.getFullYear()}`;
                }
                whenInput.value = whenValue;
              }

              if (
                !whereValue ||
                !occasionValue ||
                !whenValue ||
                !guestValue ||
                !budgetValue
              ) {
                // Show error or alert if fields are not filled
                alert("Please fill in all search fields before searching.");
                return;
              }

              const params = new URLSearchParams();
              params.set("where", whereValue);
              params.set("occasion", occasionValue);
              params.set("when", whenValue);
              params.set("guest", guestValue);
              params.set("budget", budgetValue);

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
                    style={{ cursor: "pointer" }}
                  >
                    <div className="thumb-wrapper">
                      <div
                        className="thumbnail"
                        aria-hidden="true"
                        style={{
                          backgroundImage: venue.image ? `url(${venue.image})` : "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
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
                      <p className="insert-price" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'space-between' }}>
                        <span>{venue.price}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#15a1ff" stroke="#15a1ff" strokeWidth="0" style={{ flexShrink: 0 }}>
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          <span style={{ fontSize: '15px', color: '#222' }}>0.0</span>
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </main>

      {authModalOpen && (
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
            ref={authModalRef}
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
            onClick={e => e.stopPropagation()}
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
              onMouseOver={e => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <CloseIcon />
            </button>
            <div className="modal-content" style={{ width: "100%" }}>
              <h2 className="modal-header" style={{ textAlign: "center", fontWeight: 700, fontSize: 22, marginBottom: 8 }}>
                Log in or sign up
              </h2>
              <div className="modal-divider" style={{ width: "100%", height: 1, background: "#eee", margin: "16px 0" }}></div>
              <h1 className="modal-welcome" style={{ textAlign: "center", fontWeight: 600, fontSize: 18, marginBottom: 16 }}>
                Welcome to Venu
              </h1>
              <OtpLogin onSuccess={handleOtpSuccess} onClose={() => setAuthModalOpen(false)} />
              <div className="modal-divider" style={{ width: "100%", height: 1, background: "#eee", margin: "24px 0 16px 0", position: "relative", textAlign: "center" }}>
                <span style={{ position: "relative", top: -12, background: "#fff", padding: "0 12px", color: "#888", fontSize: 14 }}>or</span>
              </div>
              <div className="social-buttons" style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                <button className="social-button social-google" type="button" style={{ background: "#fff", color: "#222", border: "1px solid #ccc", marginBottom: 0, display: "flex", alignItems: "center", fontWeight: 500, fontSize: 15, padding: "10px 0", borderRadius: 8, justifyContent: "center" }}
                  onClick={async () => {
                    try {
                      setAuthModalOpen(false);
                      const provider = new GoogleAuthProvider();
                      const result = await signInWithPopup(auth, provider);
                      const user = result.user;
                      const { getUserProfile } = await import("@/lib/firestore");
                      const profile = await getUserProfile(user.uid);
                      if (profile) {
                        router.push("/dashboard");
                      } else {
                        setSignedInUser(user);
                        setShowFinishSignup(true);
                      }
                    } catch (error: any) {
                      if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") return;
                      let errorMessage = "Failed to sign in with Google. Please try again.";
                      if (error.code === "auth/operation-not-allowed") errorMessage = "Google sign-in is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method.";
                      else if (error.code === "auth/popup-blocked") errorMessage = "Popup was blocked by your browser. Please allow popups for this site and try again.";
                      else if (error.code === "auth/unauthorized-domain") errorMessage = "This domain is not authorized. Please add localhost to authorized domains in Firebase Console.";
                      else if (error.message) errorMessage = `Failed to sign in: ${error.message}`;
                      alert(errorMessage);
                    }
                  }}
                >
                  <GoogleIcon />
                  <span style={{ marginLeft: 8 }}>Continue with Google</span>
                </button>
                <button className="social-button social-apple" type="button" style={{ background: "#000", color: "white", marginBottom: 0, display: "flex", alignItems: "center", fontWeight: 500, fontSize: 15, padding: "10px 0", borderRadius: 8, justifyContent: "center" }}
                  onClick={() => { alert("Apple sign-in coming soon"); }}
                >
                  <AppleIcon />
                  <span style={{ marginLeft: 8 }}>Continue with Apple</span>
                </button>
                <button className="social-button social-email" type="button" style={{ background: "#fff", color: "#222", border: "1px solid #ccc", marginBottom: 0, display: "flex", alignItems: "center", fontWeight: 500, fontSize: 15, padding: "10px 0", borderRadius: 8, justifyContent: "center" }}
                  onClick={() => { setEmail(""); }}
                >
                  <EmailIcon />
                  <span style={{ marginLeft: 8 }}>Continue with email</span>
                </button>
                <button className="social-button social-facebook" type="button" style={{ background: "#fff", color: "#1877F3", border: "1px solid #ccc", marginBottom: 0, display: "flex", alignItems: "center", fontWeight: 500, fontSize: 15, padding: "10px 0", borderRadius: 8, justifyContent: "center" }}
                  onClick={async () => {
                    try {
                      setAuthModalOpen(false);
                      const provider = new FacebookAuthProvider();
                      const result = await signInWithPopup(auth, provider);
                      const user = result.user;
                      const hasCompletedSignup = user.displayName && user.displayName.trim().length > 0;
                      if (hasCompletedSignup) {
                        router.push("/dashboard");
                      } else {
                        setSignedInUser(user);
                        setShowFinishSignup(true);
                      }
                    } catch (error: any) {
                      if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") return;
                      let errorMessage = "Failed to sign in with Facebook. Please try again.";
                      if (error.code === "auth/operation-not-allowed") errorMessage = "Facebook sign-in is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method.";
                      else if (error.code === "auth/popup-blocked") errorMessage = "Popup was blocked by your browser. Please allow popups for this site and try again.";
                      else if (error.code === "auth/unauthorized-domain") errorMessage = "This domain is not authorized. Please add localhost to authorized domains in Firebase Console.";
                      else if (error.message) errorMessage = `Failed to sign in: ${error.message}`;
                      alert(errorMessage);
                    }
                  }}
                >
                  <FacebookIcon />
                  <span style={{ marginLeft: 8 }}>Continue with Facebook</span>
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

      {/* Manage Booking Modal */}
      {manageBookingModalOpen && (
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
            padding: "20px",
          }}
          onClick={() => setManageBookingModalOpen(false)}
        >
          <div
            className="auth-modal"
            ref={manageBookingModalRef}
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
              onClick={() => setManageBookingModalOpen(false)}
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
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <CloseIcon />
            </button>
            <div className="modal-content" style={{ width: "100%" }}>
              <h2
                style={{
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: 22,
                  marginBottom: 8,
                  color: "#222",
                }}
              >
                Manage booking
              </h2>
              <p
                style={{
                  textAlign: "center",
                  fontSize: 14,
                  color: "#666",
                  marginBottom: 24,
                }}
              >
                Type in your details to manage your booking
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // Handle form submission
                  router.push('/reservations');
                }}
              >
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#222",
                      marginBottom: "8px",
                    }}
                  >
                    Booking Reference Number
                  </label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      type="text"
                      value={bookingReference}
                      onChange={(e) => setBookingReference(e.target.value)}
                      placeholder="e.g. 1AB234 or 013402093131"
                      style={{
                        width: "100%",
                        padding: "12px 40px 12px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "16px",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      style={{
                        position: "absolute",
                        right: "8px",
                        background: "#15a1ff",
                        border: "none",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      title="Help"
                    >
                      <span
                        style={{
                          color: "white",
                          fontSize: "14px",
                          fontWeight: "bold",
                          lineHeight: 1,
                        }}
                      >
                        ?
                      </span>
                    </button>
                  </div>
                </div>
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#222",
                      marginBottom: "8px",
                    }}
                  >
                    Last name or email address
                  </label>
                  <input
                    type="text"
                    value={lastNameOrEmail}
                    onChange={(e) => setLastNameOrEmail(e.target.value)}
                    placeholder="Enter last name or email address"
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "16px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "14px",
                    backgroundColor: "#1976d2",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1565c0")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1976d2")}
                >
                  Continue as guest
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Language & Currency Modal */}
      {languageOpen && (
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
            zIndex: 2000,
            animation: languageClosing
              ? "fadeOut 0.3s ease-out"
              : "fadeIn 0.2s ease-out",
          }}
          onClick={closeLanguageModal}
        >
          <div
            ref={languageRef}
            className="modal-content"
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "500px",
              width: "90%",
              position: "relative",
              animation: languageClosing
                ? "slideDown 0.3s ease-out"
                : "slideUp 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={closeLanguageModal}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "#1976d2",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
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
                marginBottom: "24px",
                paddingRight: "40px",
              }}
            >
              Display settings
            </h2>

            {/* Region Display (Read-only) */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#222",
                  marginBottom: "8px",
                }}
              >
                Region
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value="Philippines"
                  readOnly
                  disabled
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #e6e6e6",
                    borderRadius: "8px",
                    fontSize: "16px",
                    color: "#666",
                    backgroundColor: "#f5f5f5",
                    cursor: "not-allowed",
                  }}
                />
              </div>
            </div>

            {/* Currency Display (Read-only) */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#222",
                  marginBottom: "8px",
                }}
              >
                Currency
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={selectedCurrency}
                  readOnly
                  disabled
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #e6e6e6",
                    borderRadius: "8px",
                    fontSize: "16px",
                    color: "#666",
                    backgroundColor: "#f5f5f5",
                    cursor: "not-allowed",
                  }}
                />
              </div>
            </div>

            {/* Language Display (Read-only) */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#222",
                  marginBottom: "8px",
                }}
              >
                Language
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value="English"
                  readOnly
                  disabled
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #e6e6e6",
                    borderRadius: "8px",
                    fontSize: "16px",
                    color: "#666",
                    backgroundColor: "#f5f5f5",
                    cursor: "not-allowed",
                  }}
                />
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
                width: "100%",
                padding: "14px 24px",
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#1565c0")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#1976d2")
              }
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

