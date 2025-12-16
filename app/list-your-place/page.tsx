'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

declare global {
  interface Window {
    google: typeof google;
  }
}

const steps = [
  { id: 1, name: 'Location', active: true },
  { id: 2, name: 'Occasion', active: false },
  { id: 3, name: 'Amenities', active: false },
  { id: 4, name: 'Pricing', active: false },
  { id: 5, name: 'Photos', active: false },
  { id: 6, name: 'Details', active: false },
  { id: 7, name: 'Publish', active: false },
];

export default function ListYourPlacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromHost = searchParams.get('from') === 'host';
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([1]));
  const [searchQuery, setSearchQuery] = useState('');
  
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
      setVisitedSteps(prev => {
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
        return !!propertyName && propertyName.trim().length > 0;
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

  const [country, setCountry] = useState('Philippines');
  
  // Get currency from localStorage or default to PHP
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selectedCurrency');
      return stored || 'PHP ₱';
    }
    return 'PHP ₱';
  });
  
  // Extract currency code (e.g., "PHP" from "PHP ₱")
  const currencyCode = selectedCurrency.split(' ')[0];
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [buildingUnit, setBuildingUnit] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapUrl, setMapUrl] = useState('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15505.0973452802!2d100.5014414!3d13.7563309!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d6032280d61f3%3A0x10100b2de25049e0!2sBangkok%2C%20Thailand!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s');
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [eventRate, setEventRate] = useState('');
  const [rateType, setRateType] = useState<'head' | 'whole'>('head');
  const [paymentMethod, setPaymentMethod] = useState<'bank-transfer' | 'gcash'>('bank-transfer');
  const [photos, setPhotos] = useState<Array<{ id: string; url: string; isMain: boolean }>>([]);
  const [showPhotoWarning, setShowPhotoWarning] = useState(false);
  const [draggedPhoto, setDraggedPhoto] = useState<string | null>(null);
  const [propertyName, setPropertyName] = useState('');
  const [propertyDescription, setPropertyDescription] = useState('');
  const [propertySize, setPropertySize] = useState('');
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
      photos: photos.map(photo => ({
        id: photo.id,
        isMain: photo.isMain,
        // Note: blob URLs won't persist, so we'll need to handle this differently
        // For now, we'll save the structure
        url: photo.url
      })),
      propertyName,
      propertyDescription,
      propertySize,
      acceptTerms,
      searchQuery
    };
    localStorage.setItem('listYourPlaceDraft', JSON.stringify(formData));
  };

  // Load saved form data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('listYourPlaceDraft');
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
        setCountry(data.country || 'Philippines');
        setState(data.state || '');
        setCity(data.city || '');
        setStreetAddress(data.streetAddress || '');
        setBuildingUnit(data.buildingUnit || '');
        setZipCode(data.zipCode || '');
        setMapUrl(data.mapUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15505.0973452802!2d100.5014414!3d13.7563309!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d6032280d61f3%3A0x10100b2de25049e0!2sBangkok%2C%20Thailand!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s');
        setSelectedOccasions(data.selectedOccasions || []);
        setSelectedAmenities(data.selectedAmenities || []);
        setEventRate(data.eventRate || '');
        setRateType(data.rateType || 'head');
        setPaymentMethod(data.paymentMethod || 'bank-transfer');
        // Photos: Only restore if URLs are still valid (blob URLs won't persist)
        if (data.photos && Array.isArray(data.photos)) {
          // Filter out invalid blob URLs
          const validPhotos = data.photos.filter((photo: any) => 
            photo.url && (photo.url.startsWith('http') || photo.url.startsWith('blob:'))
          );
          if (validPhotos.length > 0) {
            setPhotos(validPhotos);
          }
        }
        setPropertyName(data.propertyName || '');
        setPropertyDescription(data.propertyDescription || '');
        setPropertySize(data.propertySize || '');
        setAcceptTerms(data.acceptTerms || false);
        setSearchQuery(data.searchQuery || '');
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, []);

  // Handle Save & Exit
  const handleSaveAndExit = () => {
    saveFormData();
    router.push(fromHost ? '/host?tab=listings' : '/dashboard');
  };
  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const countries = ['Philippines', 'Thailand', 'Singapore', 'Malaysia', 'Indonesia', 'Vietnam'];
  const states = ['Metro Manila', 'Cebu', 'Davao', 'Laguna', 'Cavite', 'Bulacan'];

  const occasions = [
    { id: 'wedding', name: 'Wedding', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )},
    { id: 'conference', name: 'Conference', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18M8 2v4M16 2v4" />
      </svg>
    )},
    { id: 'birthday', name: 'Birthday', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )},
    { id: 'funeral', name: 'Funeral', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )},
    { id: 'sweet-18th', name: 'Sweet 18th', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )},
    { id: 'exhibition', name: 'Exhibition', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 3v18" />
      </svg>
    )},
    { id: 'seminars', name: 'Seminars', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    )},
    { id: 'anniversaries', name: 'Anniversaries', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )},
    { id: 'recreation-fun', name: 'Recreation and Fun', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    )},
    { id: 'prom', name: 'Prom', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )},
    { id: 'acquaintance-party', name: 'Acquaintance Party', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )},
    { id: 'bridal-showers', name: 'Bridal Showers', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )},
    { id: 'family-reunion', name: 'Family Reunion', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )},
    { id: 'graduation', name: 'Graduation', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10 5 10-5-10-5L2 10z" />
        <path d="M6 12v5c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-5" />
      </svg>
    )},
    { id: 'team-building', name: 'Team Building', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )},
    { id: 'baby-showers', name: 'Baby Showers', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )},
    { id: 'christening', name: 'Christening', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )},
  ];

  const toggleOccasion = (occasionId: string) => {
    setSelectedOccasions(prev => 
      prev.includes(occasionId) 
        ? prev.filter(id => id !== occasionId)
        : [...prev, occasionId]
    );
  };

  const amenities = [
    { id: 'main-event-hall', name: 'Main event hall', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18M8 2v4M16 2v4" />
      </svg>
    )},
    { id: 'open-space', name: 'Open space', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    )},
    { id: 'outdoor-garden', name: 'Outdoor garden', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )},
    { id: 'swimming-pool', name: 'Swimming pool', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )},
    { id: 'beach', name: 'Beach', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )},
    { id: 'changing-rooms', name: 'Changing rooms', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18M8 2v4M16 2v4" />
      </svg>
    )},
    { id: 'backstage-area', name: 'Backstage area', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18" />
      </svg>
    )},
    { id: 'catering-services', name: 'Catering services', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )},
    { id: 'service-staff', name: 'Service staff', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )},
    { id: 'tables', name: 'Tables', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 3v18" />
      </svg>
    )},
    { id: 'beverage-stations', name: 'Beverage stations', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )},
    { id: 'cake-table', name: 'Cake table', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
      </svg>
    )},
    { id: 'chairs', name: 'Chairs', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
      </svg>
    )},
    { id: 'linens', name: 'Linens', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    )},
    { id: 'decor-items', name: 'Decor items', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )},
    { id: 'stage-platform', name: 'Stage platform', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18" />
      </svg>
    )},
    { id: 'microphones', name: 'Microphones', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )},
    { id: 'speakers', name: 'Speakers', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
      </svg>
    )},
    { id: 'dj-booth', name: 'DJ booth', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18" />
      </svg>
    )},
    { id: 'projector-screen', name: 'Projector & screen', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
      </svg>
    )},
    { id: 'led-screens', name: 'LED screens', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    )},
    { id: 'lighting-equipments', name: 'Lighting equipments', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    )},
    { id: 'dance-floor', name: 'Dance floor', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 3v18" />
      </svg>
    )},
    { id: 'registration', name: 'Registration', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18M8 2v4M16 2v4" />
      </svg>
    )},
    { id: 'parking', name: 'Parking', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2v20" />
      </svg>
    )},
    { id: 'pwd-access', name: 'PWD access', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    )},
    { id: 'air-conditioning', name: 'Air conditioning', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )},
    { id: 'wifi', name: 'Wifi', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )},
    { id: 'fans', name: 'Fans', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2v20" />
      </svg>
    )},
    { id: 'restrooms', name: 'Restrooms', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18" />
      </svg>
    )},
    { id: 'waste-bins', name: 'Waste bins', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    )},
    { id: 'security', name: 'Security', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )},
    { id: 'emergency-exits', name: 'Emergency Exits', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18" />
      </svg>
    )},
    { id: 'fire-safety-equipments', name: 'Fire safety Equipments', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )},
    { id: 'first-aid', name: 'First-Aid', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )},
    { id: 'cleaning-services', name: 'Cleaning services', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
      </svg>
    )},
  ];

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  // Listen for currency changes
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('selectedCurrency');
      if (stored) {
        setSelectedCurrency(stored);
      }
    };

    // Listen for storage events (when currency changes in other tabs/components)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case currency is updated in the same tab
    const interval = setInterval(() => {
      const stored = localStorage.getItem('selectedCurrency');
      if (stored && stored !== selectedCurrency) {
        setSelectedCurrency(stored);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [selectedCurrency]);

  // Load Google Maps API
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDebebuZpQSlxgNsxYbAYUbKyBtxBKbTIQ';
    
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google && window.google.maps && window.google.maps.places) {
          autocompleteRef.current = new window.google.maps.places.AutocompleteService();
        }
      };
      document.head.appendChild(script);
    } else if (window.google.maps && window.google.maps.places) {
      autocompleteRef.current = new window.google.maps.places.AutocompleteService();
    }
  }, []);

  // Handle search query changes and get suggestions
  useEffect(() => {
    if (searchQuery.length > 2 && autocompleteRef.current) {
      const request = {
        input: searchQuery,
        types: ['geocode', 'establishment'],
      };

      autocompleteRef.current.getPlacePredictions(request, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions.map(p => p.description));
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      });
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extract address components from place details
  const extractAddressComponents = (place: google.maps.places.PlaceResult) => {
    const addressComponents = place.address_components || [];
    
    addressComponents.forEach((component) => {
      const types = component.types;
      
      if (types.includes('country')) {
        setCountry(component.long_name);
      }
      if (types.includes('administrative_area_level_1')) {
        setState(component.long_name);
      }
      if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        setCity(component.long_name);
      }
      if (types.includes('postal_code')) {
        setZipCode(component.long_name);
      }
      if (types.includes('street_number')) {
        setStreetAddress(component.long_name + ' ');
      }
      if (types.includes('route')) {
        setStreetAddress(prev => (prev || '') + component.long_name);
      }
    });

    // Update map URL
    if (place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const encodedQuery = encodeURIComponent(place.formatted_address || searchQuery);
      setMapUrl(`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDebebuZpQSlxgNsxYbAYUbKyBtxBKbTIQ'}&q=${encodedQuery}&zoom=15`);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);

    if (window.google && window.google.maps && window.google.maps.places) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: suggestion }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
          extractAddressComponents(results[0]);
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Venu Logo */}
      <header className="header" style={{ minHeight: '60px', paddingTop: '4px', paddingBottom: '4px' }}>
        <div className="left-section">
          <button 
            className="logo-mark" 
            type="button" 
            aria-label="Venu home" 
            onClick={() => router.push(fromHost ? '/host?tab=listings' : '/dashboard')}
            style={{ marginTop: '0' }}
          >
            <img src="/venu-logo.png" alt="Venu Logo" className="logo-icon" />
          </button>
        </div>
      </header>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div 
          className="modal-overlay"
          onClick={() => setShowCancelConfirm(false)}
        >
          <div 
            className="auth-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              onClick={() => setShowCancelConfirm(false)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4L4 12M4 4l8 8" />
              </svg>
            </button>
            <div className="modal-content">
              <h2 className="modal-header">
                Cancel and go back?
              </h2>
              <p className="text-gray-600 mb-6" style={{ fontFamily: 'Arial, sans-serif', fontSize: '16px', lineHeight: '1.5' }}>
                Are you sure you want to cancel? Your progress will not be saved and you will be redirected to the dashboard.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                  style={{ fontFamily: 'Arial, sans-serif', fontSize: '16px' }}
                >
                  Continue editing
                </button>
                <button
                  onClick={() => {
                    // Clear all draft data
                    localStorage.removeItem('listYourPlaceDraft');
                    // Navigate to host page if came from host, otherwise dashboard
                    router.push(fromHost ? '/host?tab=listings' : '/dashboard');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors"
                  style={{ fontFamily: 'Arial, sans-serif', fontSize: '16px' }}
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
            <div className="absolute left-10 top-24 w-0.5 bg-blue-600" style={{ height: `${(steps.length - 1) * 56}px` }}></div>
            <button 
              onClick={() => setShowCancelConfirm(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-6 flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 12L6 8L10 4" />
              </svg>
              Back
            </button>
            <div className="text-xs text-gray-500 mb-6">Step {currentStep}/7</div>
            {steps.map((step, index) => {
              const isVisited = visitedSteps.has(step.id);
              const isCurrent = step.id === currentStep;
              return (
              <div
                key={step.id}
                  className={`relative mb-6 cursor-pointer ${
                    isCurrent
                    ? 'text-blue-600'
                      : isVisited
                      ? 'text-blue-600'
                    : 'text-gray-300'
                }`}
                  onClick={() => {
                    if (canNavigateToStep(step.id)) {
                      setCurrentStep(step.id);
                      setVisitedSteps(prev => new Set([...prev, step.id]));
                    }
                  }}
                  style={{
                    cursor: canNavigateToStep(step.id) ? 'pointer' : 'not-allowed'
                  }}
              >
                <div className="flex items-center">
                  <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-medium z-10 relative ${
                        isCurrent
                        ? 'bg-blue-600 text-white'
                          : isVisited
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border-2 border-gray-300 text-gray-300'
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
                    <span className="text-sm">
                    {step.name}
                  </span>
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
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">Location</h1>

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
            <h2 className="text-base font-medium text-gray-900 mb-4">Property location</h2>
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
                  showErrors && !state ? 'border-blue-500' : 'border-gray-300'
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
                <p className="mt-1 text-sm text-blue-600">Please enter state to continue</p>
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
                  showErrors && !city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter city"
              />
              {showErrors && !city && (
                <p className="mt-1 text-sm text-red-600">Please enter city to continue</p>
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
                  showErrors && !streetAddress ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter street address"
              />
              {showErrors && !streetAddress && (
                <p className="mt-1 text-sm text-red-600">Please enter street address to continue</p>
              )}
            </div>

            {/* Building, floor or unit number (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Building, floor or unit number <span className="text-gray-400 font-normal">(optional)</span>
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
                ZIP/Postal code <span className="text-gray-400 font-normal">(optional)</span>
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
          <div className="mb-6 border border-gray-300 rounded-md overflow-hidden" style={{ height: '400px' }}>
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
                  setVisitedSteps(prev => new Set([...prev, nextStep]));
                }
              }}
              disabled={!isStepValid(currentStep)}
              className={`px-6 py-2.5 rounded-md font-medium transition-colors ${
                isStepValid(currentStep)
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Occasion</h1>
              <p className="text-sm text-gray-600 mb-6">Select the occasions your venue is suitable for</p>

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
                          ? 'border-2 border-blue-600 bg-white'
                          : 'border border-gray-300 bg-white hover:border-gray-400'
                      }`}
                      style={{ minHeight: '100px' }}
                    >
                      <div className={`mb-3 ${isSelected ? 'text-blue-600' : 'text-gray-900'}`} style={{ fontSize: '24px' }}>
                        {occasion.icon}
        </div>
                      <span className={`text-sm ${isSelected ? 'text-blue-600 font-semibold' : 'text-gray-900'}`}>
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
                      setVisitedSteps(prev => new Set([...prev, nextStep]));
                    }
                  }}
                  disabled={!isStepValid(currentStep)}
                  className={`px-6 py-2.5 rounded-md font-medium transition-colors ${
                    isStepValid(currentStep)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Amenities</h1>
              <p className="text-sm text-gray-600 mb-6">Guest's favorites</p>
              <p className="text-sm text-gray-500 mb-6">Travelers prefer these amenities when booking a place to stay.</p>

              {/* Amenities Grid */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {amenities.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity.id);
                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${
                        isSelected
                          ? 'border-2 border-blue-600 bg-white'
                          : 'border border-gray-300 bg-white hover:border-gray-400'
                      }`}
                      style={{ minHeight: '100px' }}
                    >
                      <div className={`mb-3 ${isSelected ? 'text-blue-600' : 'text-gray-900'}`} style={{ fontSize: '24px' }}>
                        {amenity.icon}
                      </div>
                      <span className={`text-sm ${isSelected ? 'text-blue-600 font-semibold' : 'text-gray-900'}`}>
                        {amenity.name}
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
                      setVisitedSteps(prev => new Set([...prev, nextStep]));
                    }
                  }}
                  disabled={!isStepValid(currentStep)}
                  className={`px-6 py-2.5 rounded-md font-medium transition-colors ${
                    isStepValid(currentStep)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">Pricing</h1>

              {/* Set your rate */}
              <div className="mb-8">
                <h2 className="text-base font-medium text-gray-900 mb-4">Set your rate</h2>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event rate</label>
                      <input
                        type="number"
                        value={eventRate}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 1000000000)) {
                            setEventRate(value);
                          }
                        }}
                        min="0"
                        max="1000000000"
                        placeholder="Enter event rate"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-3 mt-4">
                      <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: rateType === 'head' ? '#2563eb' : '#d1d5db' }}>
                        <input
                          type="radio"
                          name="rateType"
                          value="head"
                          checked={rateType === 'head'}
                          onChange={(e) => setRateType(e.target.value as 'head' | 'whole')}
                          className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className={`font-medium ${rateType === 'head' ? 'text-blue-600' : 'text-gray-900'}`}>
                            Per Head ({currencyCode}/person)
                          </div>
                        </div>
                      </label>

                      <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: rateType === 'whole' ? '#2563eb' : '#d1d5db' }}>
                        <input
                          type="radio"
                          name="rateType"
                          value="whole"
                          checked={rateType === 'whole'}
                          onChange={(e) => setRateType(e.target.value as 'head' | 'whole')}
                          className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className={`font-medium ${rateType === 'whole' ? 'text-blue-600' : 'text-gray-900'}`}>
                            Whole Event (Flat rate)
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

              {/* How will you receive your earnings? */}
              <div className="mb-8">
                <h2 className="text-base font-medium text-gray-900 mb-1">How will you receive your earnings?</h2>
                <p className="text-sm text-gray-500 mb-4">Additional information may be needed.</p>
                
                <div className="space-y-4">
                  {/* Bank transfer */}
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: paymentMethod === 'bank-transfer' ? '#2563eb' : '#d1d5db' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank-transfer"
                      checked={paymentMethod === 'bank-transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'bank-transfer' | 'gcash')}
                      className="mt-1 mr-4 w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className={`font-medium mb-1 ${paymentMethod === 'bank-transfer' ? 'text-blue-600' : 'text-gray-900'}`}>Bank transfer</div>
                      <div className="text-sm text-gray-600">Receive payment directly to your bank account for groups of bookings. Bookings will qualify for payment 30 days after departure.</div>
                    </div>
                  </label>

                  {/* GCash */}
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: paymentMethod === 'gcash' ? '#2563eb' : '#d1d5db' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="gcash"
                      checked={paymentMethod === 'gcash'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'bank-transfer' | 'gcash')}
                      className="mt-1 mr-4 w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className={`font-medium mb-1 ${paymentMethod === 'gcash' ? 'text-blue-600' : 'text-gray-900'}`}>GCash</div>
                      <div className="text-sm text-gray-600">Receive payment directly to your GCash account. Payments will be processed within 24-48 hours after event completion.</div>
                    </div>
                  </label>
                </div>
                
                {/* Note */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Note:</span> Your first payout will be made 30 days after the check-out date of your first booking. Future payouts will occur automatically 24 hours after each guest's check-out date.
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
                      setVisitedSteps(prev => new Set([...prev, nextStep]));
                    }
                  }}
                  disabled={!isStepValid(currentStep)}
                  className={`px-6 py-2.5 rounded-md font-medium transition-colors ${
                    isStepValid(currentStep)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Photos</h1>
              <h2 className="text-base font-semibold text-gray-900 mb-2">Property Photos</h2>
              <p className="text-sm text-gray-600 mb-6">Showcase your property with high-quality photos to attract bookings.</p>

              {/* Photos Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="relative"
                    draggable
                    onDragStart={(e) => {
                      setDraggedPhoto(photo.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedPhoto && draggedPhoto !== photo.id) {
                        const draggedIndex = photos.findIndex(p => p.id === draggedPhoto);
                        const targetIndex = photos.findIndex(p => p.id === photo.id);
                        const newPhotos = [...photos];
                        const [removed] = newPhotos.splice(draggedIndex, 1);
                        newPhotos.splice(targetIndex, 0, removed);
                        setPhotos(newPhotos);
                      }
                      setDraggedPhoto(null);
                    }}
                    style={{ cursor: 'move' }}
                  >
                    {photo.isMain && (
                      <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded text-xs font-medium text-gray-900 z-10">
                        Main photo
                      </div>
                    )}
                    <div className="relative border border-gray-300 rounded-lg overflow-hidden group" style={{ aspectRatio: '4/3' }}>
                      <img
                        src={photo.url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                      {/* Drag handle and delete button */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black bg-opacity-50 rounded p-1 cursor-move">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                            setPhotos(prev => prev.filter(p => p.id !== photo.id));
                          }}
                          className="bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-70"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {/* Set as main button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPhotos(prev => {
                            // Remove main status from all photos
                            const updatedPhotos = prev.map(p => ({ ...p, isMain: false }));
                            // Find the photo to set as main
                            const photoIndex = updatedPhotos.findIndex(p => p.id === photo.id);
                            if (photoIndex !== -1) {
                              // Set this photo as main
                              updatedPhotos[photoIndex].isMain = true;
                              // Move it to the first position
                              const [movedPhoto] = updatedPhotos.splice(photoIndex, 1);
                              return [movedPhoto, ...updatedPhotos];
                            }
                            return updatedPhotos;
                          });
                        }}
                        className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-medium transition-opacity ${
                          photo.isMain 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-700 hover:bg-gray-100 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {photo.isMain ? 'Main photo' : 'Set as main'}
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Add Photos Button */}
                <label className="relative border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors" style={{ aspectRatio: '4/3', minHeight: '200px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (files) {
                        const validPhotos: Array<{ id: string; url: string; isMain: boolean }> = [];
                        let hasInvalidPhotos = false;

                        for (const file of Array.from(files)) {
                          // Check file format
                          const validFormats = ['image/png', 'image/jpeg', 'image/jpg'];
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
                                  isMain: photos.length === 0 && validPhotos.length === 0
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
                          setPhotos(prev => [...prev, ...validPhotos]);
                        }
                      }
                    }}
                  />
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="flex items-start">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-red-600 mr-3 mt-0.5 flex-shrink-0">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="#dc2626" />
                      <path d="M12 9v4M12 17h.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-red-800 mb-2">Some photos weren't added</h3>
                      <p className="text-sm text-red-700 mb-2">Make sure they meet these requirements:</p>
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
                      setVisitedSteps(prev => new Set([...prev, nextStep]));
                    }
                  }}
                  disabled={!isStepValid(currentStep)}
                  className={`px-6 py-2.5 rounded-md font-medium transition-colors ${
                    isStepValid(currentStep)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">Property details</h1>

              {/* Property Name */}
              <div className="mb-8">
                <h2 className="text-base font-semibold text-gray-900 mb-2">Property name</h2>
                <p className="text-sm text-gray-600 mb-4">
                  This is the name customers will see and use to identify your property. Don't worry, we'll generate other languages using a standard translation template.
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
                <h2 className="text-base font-semibold text-gray-900 mb-2">Property description</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Highlight the unique features and benefits of your property to attract guests.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property description</label>
                  <textarea
                    value={propertyDescription}
                    onChange={(e) => setPropertyDescription(e.target.value)}
                    placeholder="Whether you're working remote or traveling with family, this property is a great choice for accommodation. From here, guests can make the most of all that the lively city has to offer. With its convenient location, the property offers easy access to must-see destinations."
                    rows={8}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-y"
                  />
                </div>
              </div>

              {/* Property Size */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property size <span className="text-gray-400 font-normal">(optional)</span>
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
                      setVisitedSteps(prev => new Set([...prev, nextStep]));
                    }
                  }}
                  disabled={!isStepValid(currentStep)}
                  className={`px-6 py-2.5 rounded-md font-medium transition-colors ${
                    isStepValid(currentStep)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">Publish</h1>

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
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {/* Location */}
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="text-sm text-gray-700">
                      {city && state ? `${city}, ${state}` : city || state || 'Location not set'}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Accept Terms & Conditions */}
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-4">Accept the Terms & Conditions</h2>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="acceptTerms" className="text-sm text-gray-700 cursor-pointer">
                      I acknowledge that I have read and agree to Venu's{' '}
                      <a href="#" className="text-blue-600 underline hover:text-blue-700">Terms and Conditions</a>
                      {' '}and{' '}
                      <a href="#" className="text-blue-600 underline hover:text-blue-700">Privacy Policy</a>
                      . Additionally, I confirm my compliance with all relevant{' '}
                      <a href="#" className="text-blue-600 underline hover:text-blue-700">local laws and regulations</a>.
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
                          zipCode
                        },
                        mapUrl,
                        occasions: selectedOccasions,
                        amenities: selectedAmenities,
                        pricing: {
                          eventRate,
                          rateType,
                          paymentMethod,
                          currency: currencyCode
                        },
                        photos: photos.map(photo => ({
                          id: photo.id,
                          url: photo.url,
                          isMain: photo.isMain
                        })),
                        createdAt: new Date().toISOString()
                      };

                      // Save to hostListings in localStorage
                      const hostListingsKey = `hostListings_${currentUser.uid}`;
                      const existingListings = localStorage.getItem(hostListingsKey);
                      const listings = existingListings ? JSON.parse(existingListings) : [];
                      listings.push(listing);
                      localStorage.setItem(hostListingsKey, JSON.stringify(listings));

                      // Clear draft data
                      localStorage.removeItem('listYourPlaceDraft');

                      // Navigate to host page if came from host, otherwise dashboard
                      router.push(fromHost ? '/host?tab=listings' : '/dashboard');
                    }
                  }}
                  disabled={!acceptTerms || !currentUser}
                  className={`px-6 py-2.5 rounded-md font-medium transition-colors ${
                    acceptTerms && currentUser
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Publish
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
