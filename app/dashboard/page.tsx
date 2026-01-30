'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { 
  subscribeToConversations,
  getOrCreateConversation,
  getParticipantInfo,
  subscribeToUnreadCount,
  type Conversation
} from '@/app/lib/messaging';
import Logo from '@/app/components/Logo';
import { WeddingRingsIcon } from '@/app/components/WeddingRingsIcon';

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

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const SearchIcon = () => (
  <svg
    aria-hidden="true"
    width="22"
    height="22"
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

const CloseIcon = () => (
  <svg
    width="24"
    height="24"
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

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [searchHovered, setSearchHovered] = useState(false);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [languageClosing, setLanguageClosing] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('Philippines');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedCurrency, setSelectedCurrency] = useState('PHP ₱');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Function to close language modal with animation
  const closeLanguageModal = useCallback(() => {
    setLanguageClosing(true);
    setTimeout(() => {
      setLanguageOpen(false);
      setLanguageClosing(false);
    }, 300); // Match animation duration
  }, []);

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
  const [carouselPositions, setCarouselPositions] = useState<Record<string, number>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<string>("");
  const [funeralStartDate, setFuneralStartDate] = useState<Date | null>(null);
  const [funeralEndDate, setFuneralEndDate] = useState<Date | null>(null);
  const [budgetType, setBudgetType] = useState<"per head" | "whole event">("per head");
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [hasListings, setHasListings] = useState(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [selectedReviewType, setSelectedReviewType] = useState<'host' | 'guest' | 'my' | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    recognition: { email: true, sms: true },
    reminders: { email: true, sms: false },
    messages: { email: true, sms: false },
    news: { email: false, sms: false },
    feedback: { email: false, sms: false },
    travel: { email: false, sms: false }
  });
  const [previousNotificationSettings, setPreviousNotificationSettings] = useState<typeof notificationSettings | null>(null);
  const [unsubscribeAllMarketing, setUnsubscribeAllMarketing] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [unsubscribeConfirmOpen, setUnsubscribeConfirmOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [listingsUpdateKey, setListingsUpdateKey] = useState(0);
  // Track host online status for each venue (venueId -> isOnline)
  const [hostOnlineStatus, setHostOnlineStatus] = useState<Record<string, boolean>>({});
  const searchbarRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const reviewsModalRef = useRef<HTMLDivElement>(null);
  const settingsModalRef = useRef<HTMLDivElement>(null);
  const unsubscribeConfirmRef = useRef<HTMLDivElement>(null);
  const settingsDropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const carouselRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const dropdownOptions: Record<string, Array<{ icon: React.ReactNode; title: string; description: string }>> = {
    where: [
      { icon: <PaperPlaneIcon />, title: "Nearby", description: "Event places near you" },
      { icon: <BuildingIcon />, title: "Cebu, Philippines", description: "Event places in Cebu City" },
    ],
    occasion: [
      { icon: <WeddingRingsIcon size={20} color="#15a1ff" />, title: "Wedding", description: "Wedding venues" },
      { icon: <BirthdayIcon />, title: "Birthday", description: "Birthday party venues" },
      { icon: <AnniversariesIcon />, title: "Anniversaries", description: "Anniversary venues" },
      { icon: <FuneralIcon />, title: "Funeral", description: "Funeral venues" },
      { icon: <Sweet18thIcon />, title: "Sweet 18th", description: "Sweet 18th venues" },
      { icon: <ConferenceIcon />, title: "Conference", description: "Conference venues" },
      { icon: <ExhibitionIcon />, title: "Exhibition", description: "Exhibition venues" },
      { icon: <SeminarsIcon />, title: "Seminars", description: "Seminar venues" },
      { icon: <RecreationFunIcon />, title: "Recreation and Fun", description: "Recreation venues" },
      { icon: <PromIcon />, title: "Prom", description: "Prom venues" },
      { icon: <AcquaintancePartyIcon />, title: "Acquaintance Party", description: "Acquaintance party venues" },
      { icon: <BridalShowersIcon />, title: "Bridal Showers", description: "Bridal shower venues" },
      { icon: <FamilyReunionIcon />, title: "Family Reunion", description: "Family reunion venues" },
      { icon: <GraduationIcon />, title: "Graduation", description: "Graduation venues" },
      { icon: <TeamBuildingIcon />, title: "Team Building", description: "Team building venues" },
      { icon: <BabyShowersIcon />, title: "Baby Showers", description: "Baby shower venues" },
      { icon: <ChristeningIcon />, title: "Christening", description: "Christening venues" },
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
        // Check if user has listings
        const listings = localStorage.getItem(`listings_${currentUser.uid}`);
        const hostListings = localStorage.getItem(`hostListings_${currentUser.uid}`);
        setHasListings(!!(listings && JSON.parse(listings).length > 0) || !!(hostListings && JSON.parse(hostListings).length > 0));
      } else {
        // Allow signed-out users to browse the dashboard
        setUser(null);
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

  // Listen for new listings being added (localStorage changes)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Check if it's a hostListings update
      if (e.key && e.key.startsWith('hostListings_')) {
        setListingsUpdateKey(prev => prev + 1);
      }
    };

    // Listen for custom events from same tab (when host saves a listing)
    const handleCustomStorage = () => {
      setListingsUpdateKey(prev => prev + 1);
    };

    // Listen for storage events (cross-tab sync)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom events (same-tab updates)
    window.addEventListener('hostListingsUpdated', handleCustomStorage);
    window.addEventListener('listingUpdated', handleCustomStorage);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('hostListingsUpdated', handleCustomStorage);
      window.removeEventListener('listingUpdated', handleCustomStorage);
    };
  }, []);

  // Subscribe to conversations for signed-in users
  useEffect(() => {
    if (!user) {
      setConversations([]);
      return;
    }
    
    const unsubscribe = subscribeToConversations(user.uid, (convs) => {
      setConversations(convs);
    });
    
    return unsubscribe;
  }, [user]);

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
      }
      if (languageOpen) {
        closeLanguageModal();
      }
      if (notificationOpen) {
        setNotificationOpen(false);
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
  }, [burgerOpen, notificationOpen, languageOpen, closeLanguageModal]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const sectionData = useMemo(() => {
    // Load all hostListings from localStorage (works for both signed-in and signed-out users)
    const allHostListings: any[] = [];
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('hostListings_')) {
          try {
            const listings = JSON.parse(localStorage.getItem(key) || '[]');
            if (Array.isArray(listings)) {
              // Only include listings that are published/public
              // Show listings by default unless explicitly unlisted, draft, or in_review
              const publicListings = listings.filter((listing: any) => {
                // Hide if explicitly unlisted
                if (listing.status === 'unlisted') return false;
                // Hide if explicitly draft
                if (listing.status === 'draft' || listing.published === false) return false;
                // Hide if in_review (pending admin approval)
                if (listing.status === 'in_review') return false;
                // Show all others (listed, paused, or no status - treated as public)
                return true;
              });
              allHostListings.push(...publicListings);
            }
          } catch (e) {
            console.error('Error parsing listings from localStorage:', e);
          }
        }
      }
    }
    
    // Debug: Log total listings found
    if (allHostListings.length > 0) {
      console.log('Dashboard: Found', allHostListings.length, 'public listings');
      console.log('Dashboard: Sample listing data:', allHostListings[0]);
    }

    // Convert all listings to VenueCard format
    const allConvertedVenues: VenueCard[] = allHostListings.map((listing: any) => {
      const mainPhoto = listing.photos?.find((p: any) => p.isMain) || listing.photos?.[0];
      const priceValue = listing.pricing?.eventRate || '0';
      const currency = listing.pricing?.currency || '₱';
      const priceDisplay = listing.pricing?.rateType === 'per head' 
        ? `${currency}${priceValue}/head`
        : `${currency}${priceValue}`;

      // Extract location info
      const city = listing.location?.city || '';
      const region = listing.location?.region || '';
      const locationString = city || region || '';

      // Extract occasions
      const occasions = listing.selectedOccasions?.map((occ: any) => 
        typeof occ === 'string' 
          ? occ.toLowerCase()
          : (occ.name || occ.id || '').toLowerCase()
      ) || [];

      return {
        id: listing.id,
        name: listing.propertyName || 'Venue',
        price: priceDisplay,
        location: locationString,
        rating: 0,
        reviewCount: 0,
        image: mainPhoto?.url || '/api/placeholder/300/300',
        amenities: listing.selectedAmenities?.map((a: any) => 
          typeof a === 'string' ? a : a.name || a
        ) || [],
        // Store metadata for filtering
        _metadata: {
          city: city.toLowerCase(),
          region: region.toLowerCase(),
          occasions: occasions,
          status: listing.status || 'in_review', // Store listing status
        },
      } as VenueCard & { _metadata?: any };
    });

    return sectionBlueprints.map((blueprint) => {
      const titleLower = blueprint.title.toLowerCase();
      
      // Determine which listings match this section based on title keywords
      const isCebuSection = titleLower.includes('cebu');
      const isLapuSection = titleLower.includes('lapu-lapu') || titleLower.includes('lapu');
      const isBirthdaySection = titleLower.includes('birthday');
      const isAnniversarySection = titleLower.includes('anniversary');
      const isWeddingSection = titleLower.includes('wedding');
      
      // Filter venues that match this section
      let matchingVenues: VenueCard[] = [];
      
      if (isCebuSection) {
        // Cebu City section - prioritize venues in Cebu City
        const cebuVenues = allConvertedVenues.filter((venue: any) => 
          venue._metadata?.city?.includes('cebu')
        );
        
        if (isBirthdaySection) {
          // For birthday section, prioritize Cebu venues with birthday occasion
          const cebuBirthdayVenues = cebuVenues.filter((venue: any) => 
            venue._metadata?.occasions?.includes('birthday')
          );
          // If not enough matching venues, add other Cebu venues, then any venues
          if (cebuBirthdayVenues.length < blueprint.cardCount) {
            const otherCebuVenues = cebuVenues.filter((venue: any) => 
              !venue._metadata?.occasions?.includes('birthday')
            );
            const nonCebuVenues = allConvertedVenues.filter((venue: any) => 
              !venue._metadata?.city?.includes('cebu')
            );
            matchingVenues = [...cebuBirthdayVenues, ...otherCebuVenues, ...nonCebuVenues];
          } else {
            matchingVenues = cebuBirthdayVenues;
          }
        } else {
          // For general Cebu sections, show Cebu venues first, then fill with others
          if (cebuVenues.length < blueprint.cardCount) {
            const nonCebuVenues = allConvertedVenues.filter((venue: any) => 
              !venue._metadata?.city?.includes('cebu')
            );
            matchingVenues = [...cebuVenues, ...nonCebuVenues];
          } else {
            matchingVenues = cebuVenues;
          }
        }
      } else if (isLapuSection) {
        // Lapu-Lapu City section - prioritize Lapu venues, then fill with others
        const lapuVenues = allConvertedVenues.filter((venue: any) => 
          venue._metadata?.city?.includes('lapu')
        );
        // If not enough Lapu venues, fill with other venues
        if (lapuVenues.length < blueprint.cardCount) {
          const otherVenues = allConvertedVenues.filter((venue: any) => 
            !venue._metadata?.city?.includes('lapu')
          );
          matchingVenues = [...lapuVenues, ...otherVenues];
        } else {
          matchingVenues = lapuVenues;
        }
      } else if (isAnniversarySection) {
        // Anniversary section - prioritize venues that support anniversaries
        const anniversaryVenues = allConvertedVenues.filter((venue: any) => 
          venue._metadata?.occasions?.includes('anniversaries') || 
          venue._metadata?.occasions?.includes('anniversary')
        );
        // If not enough anniversary venues, fill with other venues
        if (anniversaryVenues.length < blueprint.cardCount) {
          const otherVenues = allConvertedVenues.filter((venue: any) => 
            !(venue._metadata?.occasions?.includes('anniversaries') || 
              venue._metadata?.occasions?.includes('anniversary'))
          );
          matchingVenues = [...anniversaryVenues, ...otherVenues];
        } else {
          matchingVenues = anniversaryVenues;
        }
      } else if (isBirthdaySection) {
        // Birthday section - prioritize venues that support birthdays
        const birthdayVenues = allConvertedVenues.filter((venue: any) => 
          venue._metadata?.occasions?.includes('birthday')
        );
        // If not enough birthday venues, fill with other venues
        if (birthdayVenues.length < blueprint.cardCount) {
          const otherVenues = allConvertedVenues.filter((venue: any) => 
            !venue._metadata?.occasions?.includes('birthday')
          );
          matchingVenues = [...birthdayVenues, ...otherVenues];
        } else {
          matchingVenues = birthdayVenues;
        }
      } else if (isWeddingSection) {
        // Wedding section - prioritize venues that support weddings
        const weddingVenues = allConvertedVenues.filter((venue: any) => 
          venue._metadata?.occasions?.includes('wedding')
        );
        // If not enough wedding venues, fill with other venues
        if (weddingVenues.length < blueprint.cardCount) {
          const otherVenues = allConvertedVenues.filter((venue: any) => 
            !venue._metadata?.occasions?.includes('wedding')
          );
          matchingVenues = [...weddingVenues, ...otherVenues];
        } else {
          matchingVenues = weddingVenues;
        }
      } else {
        // For other sections, show all venues
        matchingVenues = allConvertedVenues;
      }
      
      // If no matching venues found, show all available venues (to ensure listings are visible)
      if (matchingVenues.length === 0 && allConvertedVenues.length > 0) {
        matchingVenues = allConvertedVenues;
      }
      
      // Limit to section's card count, prioritizing listings over placeholders
      const venuesToShow = matchingVenues.slice(0, blueprint.cardCount);

      // Only fill remaining slots with placeholder venues if we have fewer listings than needed
      // But prioritize showing actual listings
      const remainingSlots = Math.max(0, blueprint.cardCount - venuesToShow.length);
      const placeholderVenues = Array.from({ length: remainingSlots }, (_, i) => ({
        id: `${blueprint.id}-placeholder-${i + 1}`,
        name: "Insert Event Venue",
        price: "Insert Price",
        location: "City Name",
        rating: 0,
        reviewCount: 0,
        image: '/api/placeholder/300/300',
        amenities: ['Indoor', 'Parking', 'Pets Allowed'],
      }));

      // Remove _metadata before returning
      const cleanVenues = venuesToShow.map((venue: any) => {
        const { _metadata, ...rest } = venue;
        return rest;
      });

      return {
        ...blueprint,
        venues: [...cleanVenues, ...placeholderVenues],
      };
    });
  }, [listingsUpdateKey]); // Re-compute when listings are updated (works for both signed-in and signed-out users)

  // Initialize host online status for all venues (default to online/true)
  useEffect(() => {
    const allVenueIds = sectionData.flatMap(section => section.venues.map(venue => venue.id));
    setHostOnlineStatus(prev => {
      const updated = { ...prev };
      allVenueIds.forEach(venueId => {
        // Only set if not already set (preserve existing status)
        if (updated[venueId] === undefined) {
          updated[venueId] = true; // Default to online (green)
        }
      });
      return updated;
    });
  }, [sectionData]);

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
        closeLanguageModal();
      }
      if (
        notificationOpen &&
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
      // Close settings dropdowns when clicking outside
      if (activeDropdown) {
        const dropdownRef = settingsDropdownRefs.current[activeDropdown];
        if (!dropdownRef || !dropdownRef.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [burgerOpen, languageOpen, notificationOpen, activeField, closeLanguageModal, activeDropdown]);

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

  const displayName = user.displayName || 'User';

  return (
    <div className="page-shell">
      <header className={`header ${isScrolled ? "shrink" : ""}`}>
        <div className="left-section">
          <Logo />
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
          {/* Switch to hosting button - Always visible */}
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
          {/* Notification Icon - Always visible */}
          <div className="notification-wrapper" ref={notificationRef} style={{ position: 'relative' }}>
            <button
              className="notification-button"
              type="button"
              aria-label="Notifications"
              aria-expanded={notificationOpen}
              onClick={(event) => {
                event.stopPropagation();
                setNotificationOpen((prev) => !prev);
                if (burgerOpen) {
                  setBurgerOpen(false);
                }
                if (languageOpen) {
                  closeLanguageModal();
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                marginLeft: '10px',
                marginTop: '15px',
                transition: 'transform 0.2s',
                position: 'relative'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Bell shape - outline */}
                <path
                  d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9z"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Clapper line */}
                <path
                  d="M13.73 21a2 2 0 0 1-3.46 0"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Red badge circle and text - only show if there are notifications */}
                {notificationCount > 0 && (
                  <>
                    <circle cx="16.5" cy="6.5" r="5" fill="#FF0000" />
                    <text
                      x="16.5"
                      y="6.5"
                      textAnchor="middle"
                      fill="white"
                      fontSize="8"
                      fontWeight="bold"
                      fontFamily="Arial, sans-serif"
                      dominantBaseline="middle"
                      alignmentBaseline="middle"
                    >
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </text>
                  </>
                )}
              </svg>
            </button>
            <div
              className={`notification-popup ${notificationOpen ? "open" : ""}`}
              role="menu"
              aria-hidden={!notificationOpen}
              style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                marginTop: '8px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 16px rgba(0, 0, 0, 0.12)',
                minWidth: '360px',
                maxWidth: '400px',
                padding: '24px',
                opacity: notificationOpen ? 1 : 0,
                visibility: notificationOpen ? 'visible' : 'hidden',
                transform: notificationOpen ? 'translateY(0)' : 'translateY(-10px)',
                transition: 'opacity 0.2s ease, transform 0.2s ease, visibility 0.2s',
                zIndex: 1000
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#222'
                }}>
                  Notifications
                </h3>
                <button
                  type="button"
                  aria-label="Notification settings"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSettingsModalOpen(true);
                    setNotificationOpen(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#222',
                  }}
                >
                  <SettingsIcon />
                </button>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                textAlign: 'center'
              }}>
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginBottom: '16px', opacity: 0.5 }}
                >
                  {/* Large bell icon - outline */}
                  <path
                    d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9z"
                    stroke="#666"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  {/* Clapper line */}
                  <path
                    d="M13.73 21a2 2 0 0 1-3.46 0"
                    stroke="#666"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
                <p style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#222'
                }}>
                  No New Notifications
                </p>
              </div>
            </div>
          </div>
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
                    onClick={() => router.push('/events')}
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
                  onClick={() => router.push('/messages')}
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
                  onClick={() => {
                    setReviewsModalOpen(true);
                    setBurgerOpen(false);
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
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
                          {renderCalendar(calendarMonth, calendarYear).map((day, index) => {
                            const isPast = day !== null && isPastDate(day, calendarMonth, calendarYear);
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
                                className={`calendar-day ${day === null ? "empty" : ""} ${
                                  (isSelected || isInSelectedDates || isInRange) ? "selected" : ""
                                } ${isPast ? "past" : ""} ${isFuneral && (isInSelectedDates || isInRange) ? "funeral-selected" : ""}`}
                                type="button"
                                disabled={day === null || isPast}
                                onClick={() => day !== null && !isPast && handleDateClick(day, calendarMonth, calendarYear)}
                                title={isFuneral && selectedDates.length > 0 ? `${selectedDates.length}/21 days selected` : isFuneral && funeralStartDate && !funeralEndDate ? "Select end date (max 21 days)" : ""}
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
                              const date = day !== null ? new Date(next.year, next.month, day) : null;
                              const dateStr = date ? date.toISOString().split('T')[0] : '';
                              const isSelected = selectedDate && day !== null &&
                                selectedDate.getDate() === day &&
                                selectedDate.getMonth() === next.month &&
                                selectedDate.getFullYear() === next.year;
                              const isInSelectedDates = selectedDates.some(d => d.toISOString().split('T')[0] === dateStr);
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
                                  className={`calendar-day ${day === null ? "empty" : ""} ${
                                    (isSelected || isInSelectedDates || isInRange) ? "selected" : ""
                                  } ${isPast ? "past" : ""} ${isFuneral && (isInSelectedDates || isInRange) ? "funeral-selected" : ""}`}
                                  type="button"
                                  disabled={day === null || isPast}
                                  onClick={() => day !== null && !isPast && handleDateClick(day, next.month, next.year)}
                                  title={isFuneral && selectedDates.length > 0 ? `${selectedDates.length}/21 days selected` : isFuneral && funeralStartDate && !funeralEndDate ? "Select end date (max 21 days)" : ""}
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
              let whenValue = whenInput?.value?.trim() || '';
              const guestValue = guestInput?.value?.trim() || '';
              const budgetValue = budgetInput?.value?.trim() || '';
              
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
                    onClick={() => {
                      // Get current search values from inputs
                      const whereInput = document.getElementById('search-where') as HTMLInputElement;
                      const occasionInput = document.getElementById('search-occasion') as HTMLInputElement;
                      const whenInput = document.getElementById('search-when') as HTMLInputElement;
                      const guestInput = document.getElementById('search-guest') as HTMLInputElement;
                      const budgetInput = document.getElementById('search-budget') as HTMLInputElement;
                      
                      const params = new URLSearchParams();
                      const whereValue = whereInput?.value?.trim() || '';
                      const occasionValue = occasionInput?.value?.trim() || '';
                      const whenValue = whenInput?.value?.trim() || '';
                      const guestValue = guestInput?.value?.trim() || '';
                      const budgetValue = budgetInput?.value?.trim() || '';
                      
                      if (whereValue) params.set('where', whereValue);
                      if (occasionValue) params.set('occasion', occasionValue);
                      if (whenValue) params.set('when', whenValue);
                      if (guestValue) params.set('guest', guestValue);
                      if (budgetValue) params.set('budget', budgetValue);
                      
                      const queryString = params.toString();
                      router.push(`/venue/${venue.id}${queryString ? `?${queryString}` : ''}`);
                    }}
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
                          position: 'relative',
                        }}
                      >
                        {/* Listing status badge */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            backgroundColor: (venue as any)._metadata?.status === 'listed' ? '#22c55e' : '#eab308',
                            borderRadius: '20px',
                            padding: '4px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            zIndex: 10,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          }}
                        >
                          <div
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: '#fff'
                            }}
                          />
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#fff'
                            }}
                          >
                            {(venue as any)._metadata?.status === 'listed' ? 'Listed' : 'In Review'}
                          </span>
                        </div>
                      </div>
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

        {/* Messages Section - Only for signed-in users */}
        {user && (
          <section className="venue-section" style={{ marginTop: '48px', padding: '0 80px' }}>
            <div className="section-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="venue-suggest" style={{ fontSize: '22px', fontWeight: '600', color: '#222', margin: 0 }}>
                Your Messages
              </h2>
              <button
                type="button"
                onClick={() => router.push('/messages')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
              >
                View All Messages
              </button>
            </div>
            
            {conversations.length === 0 ? (
              <div style={{
                padding: '48px 24px',
                textAlign: 'center',
                backgroundColor: '#fafafa',
                borderRadius: '12px',
                border: '1px solid #e6e6e6',
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#b0b0b0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#222', marginBottom: '8px' }}>
                  No messages yet
                </h3>
                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                  Start a conversation with a host by visiting their venue page and clicking "Contact host"
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '16px',
              }}>
                {conversations.slice(0, 6).map((conv) => {
                  const participant = getParticipantInfo(conv, user.uid);
                  const unreadCount = conv.unreadCount?.[user.uid] || 0;
                  
                  return (
                    <div
                      key={conv.id}
                      onClick={() => router.push(`/messages?conversationId=${conv.id}`)}
                      style={{
                        padding: '16px',
                        backgroundColor: 'white',
                        border: '1px solid #e6e6e6',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative',
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: participant?.photo ? 'transparent' : '#1976d2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          flexShrink: 0,
                          backgroundImage: participant?.photo ? `url(${participant.photo})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}>
                          {!participant?.photo && (participant?.name.charAt(0).toUpperCase() || 'U')}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{
                            margin: 0,
                            fontSize: '16px',
                            fontWeight: unreadCount > 0 ? '600' : '500',
                            color: '#222',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {participant?.name || 'User'}
                          </h4>
                          {conv.listingName && (
                            <p style={{
                              margin: '2px 0 0',
                              fontSize: '12px',
                              color: '#1976d2',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {conv.listingName}
                            </p>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <div style={{
                            minWidth: '20px',
                            height: '20px',
                            padding: '0 6px',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            borderRadius: '10px',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            {unreadCount}
                          </div>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p style={{
                          margin: 0,
                          fontSize: '14px',
                          color: '#666',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontWeight: unreadCount > 0 ? '500' : 'normal',
                        }}>
                          {conv.lastMessage}
                        </p>
                      )}
                      {conv.lastMessageTime && (
                        <p style={{
                          margin: '8px 0 0',
                          fontSize: '12px',
                          color: '#999',
                        }}>
                          {new Date(conv.lastMessageTime.toMillis()).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>

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

            {/* Region Display (Read-only) */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>
                Region
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value="Philippines"
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

            {/* Language Display (Read-only) */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>
                Language
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value="English"
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

      {/* Reviews Modal */}
      {reviewsModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => setReviewsModalOpen(false)}
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
        >
          <div
            ref={reviewsModalRef}
            className="auth-modal"
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'slideUp 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              onClick={() => setReviewsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: '50%',
                color: '#666',
                transition: 'all 0.2s ease',
                zIndex: 10,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.color = '#222';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#666';
              }}
            >
              <CloseIcon />
            </button>

            <div style={{ padding: '40px' }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#222',
                marginBottom: '32px',
                textAlign: 'center',
                marginTop: '8px'
              }}>
                Which reviews do you want to see?
              </h2>

              <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '16px',
                marginBottom: '32px',
                justifyContent: 'center'
              }}>
                {/* Host Reviews Option */}
                <button
                  type="button"
                  onClick={() => {
                    setReviewsModalOpen(false);
                    router.push('/reviews?type=host');
                  }}
                  style={{
                    flex: '1',
                    padding: '24px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                    minWidth: '0'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#1976d2';
                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '500',
                    color: '#222'
                  }}>
                    Host Reviews
                  </span>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '400',
                    color: '#666',
                    textAlign: 'center'
                  }}>
                    See the reviews that your Guests left
                  </span>
                </button>

                {/* Guest Reviews Option */}
                <button
                  type="button"
                  onClick={() => {
                    setReviewsModalOpen(false);
                    router.push('/reviews?type=guest');
                  }}
                  style={{
                    flex: '1',
                    padding: '24px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                    minWidth: '0'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#1976d2';
                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '500',
                    color: '#222'
                  }}>
                    Guest Reviews
                  </span>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '400',
                    color: '#666',
                    textAlign: 'center'
                  }}>
                    See the reviews that you left for your Guests
                  </span>
                </button>

                {/* My Reviews Option */}
                <button
                  type="button"
                  onClick={() => {
                    setReviewsModalOpen(false);
                    router.push('/reviews?type=my');
                  }}
                  style={{
                    flex: '1',
                    padding: '24px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                    minWidth: '0'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#1976d2';
                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '500',
                    color: '#222'
                  }}>
                    My Reviews
                  </span>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '400',
                    color: '#666',
                    textAlign: 'center'
                  }}>
                    See the reviews you gave
                  </span>
                </button>
              </div>

              {/* Next Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '24px'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedReviewType) {
                      // Handle next action - you can navigate or perform other actions here
                      setReviewsModalOpen(false);
                      router.push('/reviews');
                    }
                  }}
                  disabled={!selectedReviewType}
                  style={{
                    padding: '14px 24px',
                    backgroundColor: selectedReviewType ? '#1976d2' : '#e0e0e0',
                    color: selectedReviewType ? 'white' : '#999',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: selectedReviewType ? 'pointer' : 'not-allowed',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    if (selectedReviewType) {
                      e.currentTarget.style.backgroundColor = '#1565c0';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedReviewType) {
                      e.currentTarget.style.backgroundColor = '#1976d2';
                    }
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={(e) => {
            // Close dropdown if clicking outside the modal content
            if (activeDropdown) {
              setActiveDropdown(null);
            }
            // Close modal if clicking directly on overlay (not modal content)
            if (e.target === e.currentTarget) {
              setSettingsModalOpen(false);
            }
          }}
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
        >
          <div
            ref={settingsModalRef}
            className="auth-modal"
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'slideUp 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              onClick={() => {
                setActiveDropdown(null);
                setSettingsModalOpen(false);
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: '50%',
                color: '#1976d2',
                transition: 'all 0.2s ease',
                zIndex: 10,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#e3f2fd';
                e.currentTarget.style.color = '#1565c0';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#1976d2';
              }}
            >
              <CloseIcon />
            </button>

            <div style={{ padding: '40px' }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#222',
                marginBottom: '24px',
                textAlign: 'center',
                marginTop: '8px'
              }}>
                Notifications
              </h2>

              <div style={{
                height: '1px',
                backgroundColor: '#e6e6e6',
                marginBottom: '24px'
              }}></div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0'
              }}>
                {/* Recognition and achievements */}
                <div style={{ position: 'relative', paddingBottom: '24px', borderBottom: '1px solid #e6e6e6' }} ref={(el) => { settingsDropdownRefs.current['recognition'] = el; }}>
                  <div style={{ marginBottom: '8px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#222',
                      marginBottom: '8px'
                    }}>
                      Recognition and achievements
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '16px', color: '#666' }}>
                        {notificationSettings.recognition.email && notificationSettings.recognition.sms ? 'On: Email and SMS' : notificationSettings.recognition.email ? 'On: Email' : notificationSettings.recognition.sms ? 'On: SMS' : 'Off'}
                      </span>
                      <button
                        type="button"
                        disabled={unsubscribeAllMarketing}
                        onClick={(e) => {
                          if (unsubscribeAllMarketing) return;
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === 'recognition' ? null : 'recognition');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: unsubscribeAllMarketing ? '#ccc' : '#1976d2',
                          fontSize: '16px',
                          fontWeight: '500',
                          cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer',
                          padding: '4px 8px',
                          textDecoration: 'underline',
                          opacity: unsubscribeAllMarketing ? 0.5 : 1,
                        }}
                      >
                        Edit
                      </button>
                    </div>
                    {activeDropdown === 'recognition' && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '0',
                          left: '100%',
                          marginLeft: '-180px',
                          backgroundColor: 'white',
                          border: '1px solid #e6e6e6',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          minWidth: '200px',
                          zIndex: 1000,
                          padding: '8px 0',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#222',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <input
                            type="checkbox"
                            checked={notificationSettings.recognition.email}
                            disabled={unsubscribeAllMarketing}
                            onChange={(e) => {
                              if (unsubscribeAllMarketing) return;
                              setNotificationSettings(prev => ({
                                ...prev,
                                recognition: { ...prev.recognition, email: e.target.checked }
                              }));
                            }}
                            style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                          />
                          Email
                        </label>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#222',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <input
                            type="checkbox"
                            checked={notificationSettings.recognition.sms}
                            disabled={unsubscribeAllMarketing}
                            onChange={(e) => {
                              if (unsubscribeAllMarketing) return;
                              setNotificationSettings(prev => ({
                                ...prev,
                                recognition: { ...prev.recognition, sms: e.target.checked }
                              }));
                            }}
                            style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                          />
                          SMS
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reminders */}
                <div style={{ position: 'relative', paddingBottom: '24px', borderBottom: '1px solid #e6e6e6' }} ref={(el) => { settingsDropdownRefs.current['reminders'] = el; }}>
                  <div style={{ marginBottom: '8px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#222',
                      marginBottom: '8px'
                    }}>
                      Reminders
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '16px', color: '#666' }}>
                        {notificationSettings.reminders.email && notificationSettings.reminders.sms ? 'On: Email and SMS' : notificationSettings.reminders.email ? 'On: Email' : notificationSettings.reminders.sms ? 'On: SMS' : 'Off'}
                      </span>
                      <button
                        type="button"
                        disabled={unsubscribeAllMarketing}
                        onClick={(e) => {
                          if (unsubscribeAllMarketing) return;
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === 'reminders' ? null : 'reminders');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: unsubscribeAllMarketing ? '#ccc' : '#1976d2',
                          fontSize: '16px',
                          fontWeight: '500',
                          cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer',
                          padding: '4px 8px',
                          textDecoration: 'underline',
                          opacity: unsubscribeAllMarketing ? 0.5 : 1,
                        }}
                      >
                        Edit
                      </button>
                    </div>
                    {activeDropdown === 'reminders' && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '0',
                          left: '100%',
                          marginLeft: '-250px',
                          backgroundColor: 'white',
                          border: '1px solid #e6e6e6',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          minWidth: '200px',
                          zIndex: 1000,
                          padding: '8px 0',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#222',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <input
                            type="checkbox"
                            checked={notificationSettings.reminders.email}
                            disabled={unsubscribeAllMarketing}
                            onChange={(e) => {
                              if (unsubscribeAllMarketing) return;
                              setNotificationSettings(prev => ({
                                ...prev,
                                reminders: { ...prev.reminders, email: e.target.checked }
                              }));
                            }}
                            style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                          />
                          Email
                        </label>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#222',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <input
                            type="checkbox"
                            checked={notificationSettings.reminders.sms}
                            disabled={unsubscribeAllMarketing}
                            onChange={(e) => {
                              if (unsubscribeAllMarketing) return;
                              setNotificationSettings(prev => ({
                                ...prev,
                                reminders: { ...prev.reminders, sms: e.target.checked }
                              }));
                            }}
                            style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                          />
                          SMS
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div style={{ position: 'relative', paddingBottom: '24px', borderBottom: '1px solid #e6e6e6' }} ref={(el) => { settingsDropdownRefs.current['messages'] = el; }}>
                  <div style={{ marginBottom: '8px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#222',
                      marginBottom: '8px'
                    }}>
                      Messages
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '16px', color: '#666' }}>
                        {notificationSettings.messages.email && notificationSettings.messages.sms ? 'On: Email and SMS' : notificationSettings.messages.email ? 'On: Email' : notificationSettings.messages.sms ? 'On: SMS' : 'Off'}
                      </span>
                      <button
                        type="button"
                        disabled={unsubscribeAllMarketing}
                        onClick={(e) => {
                          if (unsubscribeAllMarketing) return;
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === 'messages' ? null : 'messages');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: unsubscribeAllMarketing ? '#ccc' : '#1976d2',
                          fontSize: '16px',
                          fontWeight: '500',
                          cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer',
                          padding: '4px 8px',
                          textDecoration: 'underline',
                          opacity: unsubscribeAllMarketing ? 0.5 : 1,
                        }}
                      >
                        Edit
                      </button>
                    </div>
                    {activeDropdown === 'messages' && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '0',
                          left: '100%',
                          marginLeft: '-250px',
                          backgroundColor: 'white',
                          border: '1px solid #e6e6e6',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          minWidth: '200px',
                          zIndex: 1000,
                          padding: '8px 0',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#222',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <input
                            type="checkbox"
                            checked={notificationSettings.messages.email}
                            disabled={unsubscribeAllMarketing}
                            onChange={(e) => {
                              if (unsubscribeAllMarketing) return;
                              setNotificationSettings(prev => ({
                                ...prev,
                                messages: { ...prev.messages, email: e.target.checked }
                              }));
                            }}
                            style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                          />
                          Email
                        </label>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#222',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <input
                            type="checkbox"
                            checked={notificationSettings.messages.sms}
                            disabled={unsubscribeAllMarketing}
                            onChange={(e) => {
                              if (unsubscribeAllMarketing) return;
                              setNotificationSettings(prev => ({
                                ...prev,
                                messages: { ...prev.messages, sms: e.target.checked }
                              }));
                            }}
                            style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                          />
                          SMS
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* News and programs */}
                <div style={{ position: 'relative', paddingBottom: '24px', borderBottom: '1px solid #e6e6e6' }} ref={(el) => { settingsDropdownRefs.current['news'] = el; }}>
                  <div style={{ marginBottom: '8px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#222',
                      marginBottom: '8px'
                    }}>
                      News and programs
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '16px', color: '#666' }}>
                        {notificationSettings.news.email && notificationSettings.news.sms ? 'On: Email and SMS' : notificationSettings.news.email ? 'On: Email' : notificationSettings.news.sms ? 'On: SMS' : 'Off'}
                      </span>
                      <button
                        type="button"
                        disabled={unsubscribeAllMarketing}
                        onClick={(e) => {
                          if (unsubscribeAllMarketing) return;
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === 'news' ? null : 'news');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: unsubscribeAllMarketing ? '#ccc' : '#1976d2',
                          fontSize: '16px',
                          fontWeight: '500',
                          cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer',
                          padding: '4px 8px',
                          textDecoration: 'underline',
                          opacity: unsubscribeAllMarketing ? 0.5 : 1,
                        }}
                      >
                        Edit
                      </button>
                    </div>
                    {activeDropdown === 'news' && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '0',
                          left: '100%',
                          marginLeft: '-300px',
                          backgroundColor: 'white',
                          border: '1px solid #e6e6e6',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          minWidth: '200px',
                          zIndex: 1000,
                          padding: '8px 0',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#222',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <input
                            type="checkbox"
                            checked={notificationSettings.news.email}
                            disabled={unsubscribeAllMarketing}
                            onChange={(e) => {
                              if (unsubscribeAllMarketing) return;
                              setNotificationSettings(prev => ({
                                ...prev,
                                news: { ...prev.news, email: e.target.checked }
                              }));
                            }}
                            style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                          />
                          Email
                        </label>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#222',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <input
                            type="checkbox"
                            checked={notificationSettings.news.sms}
                            disabled={unsubscribeAllMarketing}
                            onChange={(e) => {
                              if (unsubscribeAllMarketing) return;
                              setNotificationSettings(prev => ({
                                ...prev,
                                news: { ...prev.news, sms: e.target.checked }
                              }));
                            }}
                            style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                          />
                          SMS
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Feedback */}
                <div style={{ position: 'relative', paddingBottom: '24px', borderBottom: '1px solid #e6e6e6' }} ref={(el) => { settingsDropdownRefs.current['feedback'] = el; }}>
                  <div style={{ marginBottom: '8px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#222',
                      marginBottom: '8px'
                    }}>
                      Feedback
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '16px', color: '#666' }}>
                        {notificationSettings.feedback.email && notificationSettings.feedback.sms ? 'On: Email and SMS' : notificationSettings.feedback.email ? 'On: Email' : notificationSettings.feedback.sms ? 'On: SMS' : 'Off'}
                      </span>
                      <button
                        type="button"
                        disabled={unsubscribeAllMarketing}
                        onClick={(e) => {
                          if (unsubscribeAllMarketing) return;
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === 'feedback' ? null : 'feedback');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: unsubscribeAllMarketing ? '#ccc' : '#1976d2',
                          fontSize: '16px',
                          fontWeight: '500',
                          cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer',
                          padding: '4px 8px',
                          textDecoration: 'underline',
                          opacity: unsubscribeAllMarketing ? 0.5 : 1,
                        }}
                      >
                        Edit
                      </button>
                    </div>
                    {activeDropdown === 'feedback' && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '0',
                          left: '100%',
                          marginLeft: '-300px',
                          backgroundColor: 'white',
                          border: '1px solid #e6e6e6',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          minWidth: '200px',
                          zIndex: 1000,
                          padding: '8px 0',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#222',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <input
                            type="checkbox"
                            checked={notificationSettings.feedback.email}
                            disabled={unsubscribeAllMarketing}
                            onChange={(e) => {
                              if (unsubscribeAllMarketing) return;
                              setNotificationSettings(prev => ({
                                ...prev,
                                feedback: { ...prev.feedback, email: e.target.checked }
                              }));
                            }}
                            style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                          />
                          Email
                        </label>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#222',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <input
                            type="checkbox"
                            checked={notificationSettings.feedback.sms}
                            disabled={unsubscribeAllMarketing}
                            onChange={(e) => {
                              if (unsubscribeAllMarketing) return;
                              setNotificationSettings(prev => ({
                                ...prev,
                                feedback: { ...prev.feedback, sms: e.target.checked }
                              }));
                            }}
                            style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                          />
                          SMS
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Event regulations */}
                <div style={{ position: 'relative' }} ref={(el) => { settingsDropdownRefs.current['travel'] = el; }}>
                  <div style={{ marginBottom: '8px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#222',
                      marginBottom: '8px'
                    }}>
                      Event regulations
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '16px', color: '#666' }}>
                        {notificationSettings.travel.email && notificationSettings.travel.sms ? 'On: Email and SMS' : notificationSettings.travel.email ? 'On: Email' : notificationSettings.travel.sms ? 'On: SMS' : 'Off'}
                      </span>
                      <button
                        type="button"
                        disabled={unsubscribeAllMarketing}
                        onClick={(e) => {
                          if (unsubscribeAllMarketing) return;
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === 'travel' ? null : 'travel');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: unsubscribeAllMarketing ? '#ccc' : '#1976d2',
                          fontSize: '16px',
                          fontWeight: '500',
                          cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer',
                          padding: '4px 8px',
                          textDecoration: 'underline',
                          opacity: unsubscribeAllMarketing ? 0.5 : 1,
                        }}
                      >
                        Edit
                      </button>
                    </div>
                    {activeDropdown === 'travel' && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '0',
                          left: '100%',
                          marginLeft: '-300px',
                          backgroundColor: 'white',
                          border: '1px solid #e6e6e6',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          minWidth: '200px',
                          zIndex: 1000,
                          padding: '8px 0',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#222',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <input
                            type="checkbox"
                            checked={notificationSettings.travel.email}
                            disabled={unsubscribeAllMarketing}
                            onChange={(e) => {
                              if (unsubscribeAllMarketing) return;
                              setNotificationSettings(prev => ({
                                ...prev,
                                travel: { ...prev.travel, email: e.target.checked }
                              }));
                            }}
                            style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                          />
                          Email
                        </label>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#222',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <input
                            type="checkbox"
                            checked={notificationSettings.travel.sms}
                            disabled={unsubscribeAllMarketing}
                            onChange={(e) => {
                              if (unsubscribeAllMarketing) return;
                              setNotificationSettings(prev => ({
                                ...prev,
                                travel: { ...prev.travel, sms: e.target.checked }
                              }));
                            }}
                            style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                          />
                          SMS
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Unsubscribe from all marketing emails */}
              <div style={{
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid #e6e6e6'
              }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: '#222',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={unsubscribeAllMarketing}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setActiveDropdown(null); // Close any open dropdowns
                        setUnsubscribeConfirmOpen(true);
                      } else {
                        // Restore previous settings when unchecking
                        if (previousNotificationSettings) {
                          setNotificationSettings(previousNotificationSettings);
                          setPreviousNotificationSettings(null);
                        }
                        setUnsubscribeAllMarketing(false);
                      }
                    }}
                    style={{
                      marginRight: '12px',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                  Unsubscribe from all marketing emails
                </label>
              </div>

              {/* Save Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid #e6e6e6'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    // Save settings logic can be added here
                    setSettingsModalOpen(false);
                    setActiveDropdown(null);
                  }}
                  style={{
                    padding: '14px 24px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#1565c0';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#1976d2';
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unsubscribe Confirmation Modal */}
      {unsubscribeConfirmOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => setUnsubscribeConfirmOpen(false)}
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
        >
          <div
            ref={unsubscribeConfirmRef}
            className="auth-modal"
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '568px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'slideUp 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              onClick={() => setUnsubscribeConfirmOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: '50%',
                color: '#1976d2',
                transition: 'all 0.2s ease',
                zIndex: 10,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#e3f2fd';
                e.currentTarget.style.color = '#1565c0';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#1976d2';
              }}
            >
              <CloseIcon />
            </button>

            <div style={{ padding: '40px' }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#222',
                marginBottom: '24px',
                textAlign: 'left',
                marginTop: '8px'
              }}>
                Are you sure?
              </h2>

              <p style={{
                fontSize: '16px',
                color: '#666',
                lineHeight: '1.5',
                marginBottom: '32px'
              }}>
                You'll be unsubscribing from all marketing emails from Venu. How Venu works, invites, surveys and research studies.
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '16px',
                marginTop: '32px'
              }}>
                <button
                  type="button"
                  onClick={() => setUnsubscribeConfirmOpen(false)}
                  style={{
                    padding: '14px 24px',
                    backgroundColor: 'transparent',
                    color: '#222',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Save current settings before unsubscribing
                    setPreviousNotificationSettings({ ...notificationSettings });
                    // Set all notifications to off
                    setNotificationSettings({
                      recognition: { email: false, sms: false },
                      reminders: { email: false, sms: false },
                      messages: { email: false, sms: false },
                      news: { email: false, sms: false },
                      feedback: { email: false, sms: false },
                      travel: { email: false, sms: false }
                    });
                    setActiveDropdown(null); // Close any open dropdowns
                    setUnsubscribeAllMarketing(true);
                    setUnsubscribeConfirmOpen(false);
                  }}
                  style={{
                    padding: '14px 24px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#1d4ed8';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }}
                >
                  Unsubscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

