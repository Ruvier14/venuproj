'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/firebase';
import { onAuthStateChanged, signOut, updateProfile, User } from 'firebase/auth';
import { getUserProfile } from '@/lib/firestore';
import OtpLogin from '@/app/components/OtpLogin';
import Logo from '@/app/components/Logo';

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

const VerifiedIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="#1976d2"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default function Profile() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('personal-information');
  const [editingFields, setEditingFields] = useState<Set<string>>(new Set());
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profilePhotoChanged, setProfilePhotoChanged] = useState(false);
  const [originalProfilePhoto, setOriginalProfilePhoto] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    cardholderName: '',
    cardNumber: '',
    expirationDate: '',
    cvv: ''
  });
  const [hasListings, setHasListings] = useState(false);
  const [profilePhotoModalOpen, setProfilePhotoModalOpen] = useState(false);
  const profilePhotoModalRef = useRef<HTMLDivElement>(null);

  // Default profile images
  const defaultProfileImages = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=7',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=8',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=9',
  ];

  // User data state
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneCountryCode: '+63',
    phoneNumber: '',
    birthDate: { month: '', day: '', year: '' },
    nationality: '',
    gender: '',
    location: '',
  });

  // Edit field values
  const [editValues, setEditValues] = useState({
    name: '',
    email: '',
    phoneCountryCode: '+63',
    phoneNumber: '',
    birthDate: { month: '', day: '', year: '' },
    nationality: '',
    gender: '',
    location: '',
  });

  const [phoneCountryCodeOpen, setPhoneCountryCodeOpen] = useState(false);
  const phoneCountryCodeRef = useRef<HTMLDivElement>(null);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [pendingPhoneUpdate, setPendingPhoneUpdate] = useState<{ countryCode: string; phoneNumber: string } | null>(null);

  // Country codes list
  const countryCodes = [
    { code: '+1', country: 'United States/Canada' },
    { code: '+7', country: 'Russia/Kazakhstan' },
    { code: '+20', country: 'Egypt' },
    { code: '+27', country: 'South Africa' },
    { code: '+30', country: 'Greece' },
    { code: '+31', country: 'Netherlands' },
    { code: '+32', country: 'Belgium' },
    { code: '+33', country: 'France' },
    { code: '+34', country: 'Spain' },
    { code: '+36', country: 'Hungary' },
    { code: '+39', country: 'Italy' },
    { code: '+40', country: 'Romania' },
    { code: '+41', country: 'Switzerland' },
    { code: '+43', country: 'Austria' },
    { code: '+44', country: 'United Kingdom' },
    { code: '+45', country: 'Denmark' },
    { code: '+46', country: 'Sweden' },
    { code: '+47', country: 'Norway' },
    { code: '+48', country: 'Poland' },
    { code: '+49', country: 'Germany' },
    { code: '+51', country: 'Peru' },
    { code: '+52', country: 'Mexico' },
    { code: '+53', country: 'Cuba' },
    { code: '+54', country: 'Argentina' },
    { code: '+55', country: 'Brazil' },
    { code: '+56', country: 'Chile' },
    { code: '+57', country: 'Colombia' },
    { code: '+58', country: 'Venezuela' },
    { code: '+60', country: 'Malaysia' },
    { code: '+61', country: 'Australia' },
    { code: '+62', country: 'Indonesia' },
    { code: '+63', country: 'Philippines' },
    { code: '+64', country: 'New Zealand' },
    { code: '+65', country: 'Singapore' },
    { code: '+66', country: 'Thailand' },
    { code: '+81', country: 'Japan' },
    { code: '+82', country: 'South Korea' },
    { code: '+84', country: 'Vietnam' },
    { code: '+86', country: 'China' },
    { code: '+90', country: 'Turkey' },
    { code: '+91', country: 'India' },
    { code: '+92', country: 'Pakistan' },
    { code: '+93', country: 'Afghanistan' },
    { code: '+94', country: 'Sri Lanka' },
    { code: '+95', country: 'Myanmar' },
    { code: '+98', country: 'Iran' },
    { code: '+212', country: 'Morocco' },
    { code: '+213', country: 'Algeria' },
    { code: '+216', country: 'Tunisia' },
    { code: '+218', country: 'Libya' },
    { code: '+220', country: 'Gambia' },
    { code: '+221', country: 'Senegal' },
    { code: '+222', country: 'Mauritania' },
    { code: '+223', country: 'Mali' },
    { code: '+224', country: 'Guinea' },
    { code: '+225', country: 'Ivory Coast' },
    { code: '+226', country: 'Burkina Faso' },
    { code: '+227', country: 'Niger' },
    { code: '+228', country: 'Togo' },
    { code: '+229', country: 'Benin' },
    { code: '+230', country: 'Mauritius' },
    { code: '+231', country: 'Liberia' },
    { code: '+232', country: 'Sierra Leone' },
    { code: '+233', country: 'Ghana' },
    { code: '+234', country: 'Nigeria' },
    { code: '+235', country: 'Chad' },
    { code: '+236', country: 'Central African Republic' },
    { code: '+237', country: 'Cameroon' },
    { code: '+238', country: 'Cape Verde' },
    { code: '+239', country: 'São Tomé and Príncipe' },
    { code: '+240', country: 'Equatorial Guinea' },
    { code: '+241', country: 'Gabon' },
    { code: '+242', country: 'Republic of the Congo' },
    { code: '+243', country: 'Democratic Republic of the Congo' },
    { code: '+244', country: 'Angola' },
    { code: '+245', country: 'Guinea-Bissau' },
    { code: '+246', country: 'British Indian Ocean Territory' },
    { code: '+248', country: 'Seychelles' },
    { code: '+249', country: 'Sudan' },
    { code: '+250', country: 'Rwanda' },
    { code: '+251', country: 'Ethiopia' },
    { code: '+252', country: 'Somalia' },
    { code: '+253', country: 'Djibouti' },
    { code: '+254', country: 'Kenya' },
    { code: '+255', country: 'Tanzania' },
    { code: '+256', country: 'Uganda' },
    { code: '+257', country: 'Burundi' },
    { code: '+258', country: 'Mozambique' },
    { code: '+260', country: 'Zambia' },
    { code: '+261', country: 'Madagascar' },
    { code: '+262', country: 'Réunion' },
    { code: '+263', country: 'Zimbabwe' },
    { code: '+264', country: 'Namibia' },
    { code: '+265', country: 'Malawi' },
    { code: '+266', country: 'Lesotho' },
    { code: '+267', country: 'Botswana' },
    { code: '+268', country: 'Eswatini' },
    { code: '+269', country: 'Comoros' },
    { code: '+290', country: 'Saint Helena' },
    { code: '+291', country: 'Eritrea' },
    { code: '+297', country: 'Aruba' },
    { code: '+298', country: 'Faroe Islands' },
    { code: '+299', country: 'Greenland' },
    { code: '+350', country: 'Gibraltar' },
    { code: '+351', country: 'Portugal' },
    { code: '+352', country: 'Luxembourg' },
    { code: '+353', country: 'Ireland' },
    { code: '+354', country: 'Iceland' },
    { code: '+355', country: 'Albania' },
    { code: '+356', country: 'Malta' },
    { code: '+357', country: 'Cyprus' },
    { code: '+358', country: 'Finland' },
    { code: '+359', country: 'Bulgaria' },
    { code: '+370', country: 'Lithuania' },
    { code: '+371', country: 'Latvia' },
    { code: '+372', country: 'Estonia' },
    { code: '+373', country: 'Moldova' },
    { code: '+374', country: 'Armenia' },
    { code: '+375', country: 'Belarus' },
    { code: '+376', country: 'Andorra' },
    { code: '+377', country: 'Monaco' },
    { code: '+378', country: 'San Marino' },
    { code: '+380', country: 'Ukraine' },
    { code: '+381', country: 'Serbia' },
    { code: '+382', country: 'Montenegro' },
    { code: '+383', country: 'Kosovo' },
    { code: '+385', country: 'Croatia' },
    { code: '+386', country: 'Slovenia' },
    { code: '+387', country: 'Bosnia and Herzegovina' },
    { code: '+389', country: 'North Macedonia' },
    { code: '+420', country: 'Czech Republic' },
    { code: '+421', country: 'Slovakia' },
    { code: '+423', country: 'Liechtenstein' },
    { code: '+500', country: 'Falkland Islands' },
    { code: '+501', country: 'Belize' },
    { code: '+502', country: 'Guatemala' },
    { code: '+503', country: 'El Salvador' },
    { code: '+504', country: 'Honduras' },
    { code: '+505', country: 'Nicaragua' },
    { code: '+506', country: 'Costa Rica' },
    { code: '+507', country: 'Panama' },
    { code: '+508', country: 'Saint Pierre and Miquelon' },
    { code: '+509', country: 'Haiti' },
    { code: '+590', country: 'Guadeloupe' },
    { code: '+591', country: 'Bolivia' },
    { code: '+592', country: 'Guyana' },
    { code: '+593', country: 'Ecuador' },
    { code: '+594', country: 'French Guiana' },
    { code: '+595', country: 'Paraguay' },
    { code: '+596', country: 'Martinique' },
    { code: '+597', country: 'Suriname' },
    { code: '+598', country: 'Uruguay' },
    { code: '+599', country: 'Caribbean Netherlands' },
    { code: '+670', country: 'East Timor' },
    { code: '+672', country: 'Antarctica' },
    { code: '+673', country: 'Brunei' },
    { code: '+674', country: 'Nauru' },
    { code: '+675', country: 'Papua New Guinea' },
    { code: '+676', country: 'Tonga' },
    { code: '+677', country: 'Solomon Islands' },
    { code: '+678', country: 'Vanuatu' },
    { code: '+679', country: 'Fiji' },
    { code: '+680', country: 'Palau' },
    { code: '+681', country: 'Wallis and Futuna' },
    { code: '+682', country: 'Cook Islands' },
    { code: '+683', country: 'Niue' },
    { code: '+685', country: 'Samoa' },
    { code: '+686', country: 'Kiribati' },
    { code: '+687', country: 'New Caledonia' },
    { code: '+688', country: 'Tuvalu' },
    { code: '+689', country: 'French Polynesia' },
    { code: '+690', country: 'Tokelau' },
    { code: '+691', country: 'Micronesia' },
    { code: '+692', country: 'Marshall Islands' },
    { code: '+850', country: 'North Korea' },
    { code: '+852', country: 'Hong Kong' },
    { code: '+853', country: 'Macau' },
    { code: '+855', country: 'Cambodia' },
    { code: '+856', country: 'Laos' },
    { code: '+880', country: 'Bangladesh' },
    { code: '+886', country: 'Taiwan' },
    { code: '+960', country: 'Maldives' },
    { code: '+961', country: 'Lebanon' },
    { code: '+962', country: 'Jordan' },
    { code: '+963', country: 'Syria' },
    { code: '+964', country: 'Iraq' },
    { code: '+965', country: 'Kuwait' },
    { code: '+966', country: 'Saudi Arabia' },
    { code: '+967', country: 'Yemen' },
    { code: '+968', country: 'Oman' },
    { code: '+970', country: 'Palestine' },
    { code: '+971', country: 'United Arab Emirates' },
    { code: '+972', country: 'Israel' },
    { code: '+973', country: 'Bahrain' },
    { code: '+974', country: 'Qatar' },
    { code: '+975', country: 'Bhutan' },
    { code: '+976', country: 'Mongolia' },
    { code: '+977', country: 'Nepal' },
    { code: '+992', country: 'Tajikistan' },
    { code: '+993', country: 'Turkmenistan' },
    { code: '+994', country: 'Azerbaijan' },
    { code: '+995', country: 'Georgia' },
    { code: '+996', country: 'Kyrgyzstan' },
    { code: '+998', country: 'Uzbekistan' },
  ];

  const burgerRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          setUser(currentUser);
          
          // Load user data from Firestore first (where registration data is stored)
          try {
            const firestoreProfile = await getUserProfile(currentUser.uid);
          
            if (firestoreProfile) {
              // Parse phone number to extract country code and number
              let phoneCountryCode = '+63';
              let phoneNumber = '';
              if (firestoreProfile.phoneNumber) {
                const phoneMatch = firestoreProfile.phoneNumber.match(/^(\+\d{1,3})(.+)$/);
                if (phoneMatch) {
                  phoneCountryCode = phoneMatch[1];
                  phoneNumber = phoneMatch[2];
                } else {
                  phoneNumber = firestoreProfile.phoneNumber;
                }
              } else if (currentUser.phoneNumber) {
                const phoneMatch = currentUser.phoneNumber.match(/^(\+\d{1,3})(.+)$/);
                if (phoneMatch) {
                  phoneCountryCode = phoneMatch[1];
                  phoneNumber = phoneMatch[2];
                } else {
                  phoneNumber = currentUser.phoneNumber;
                }
              }
              
              // Format birth date (convert numbers to strings with leading zeros)
              const birthDate = firestoreProfile.birthDate ? {
                month: String(firestoreProfile.birthDate.month).padStart(2, '0'),
                day: String(firestoreProfile.birthDate.day).padStart(2, '0'),
                year: String(firestoreProfile.birthDate.year)
              } : { month: '', day: '', year: '' };
              
              // Get additional data from localStorage (nationality, gender, location)
              const savedData = localStorage.getItem(`userData_${currentUser.uid}`);
              let additionalData: any = {};
              if (savedData) {
                try {
                  const parsed = JSON.parse(savedData);
                  additionalData = {
                    nationality: parsed.nationality || '',
                    gender: parsed.gender || '',
                    location: parsed.location || '',
                  };
                } catch (e) {
                  // Ignore parse errors
                }
              }
              
              // Set user data from Firestore
              setUserData({
                firstName: firestoreProfile.firstName || '',
                lastName: firestoreProfile.lastName || '',
                email: firestoreProfile.email || currentUser.email || '',
                phoneCountryCode: phoneCountryCode,
                phoneNumber: phoneNumber,
                birthDate: birthDate,
                nationality: additionalData.nationality || '',
                gender: additionalData.gender || '',
                location: additionalData.location || '',
              });
            } else {
              // No Firestore data, try localStorage
              const savedData = localStorage.getItem(`userData_${currentUser.uid}`);
              if (savedData) {
                try {
                  const parsed = JSON.parse(savedData);
                  setUserData(parsed);
                } catch (e) {
                  // If localStorage parse fails, use Firebase user data
                  if (currentUser.displayName) {
                    const nameParts = currentUser.displayName.split(' ');
                    setUserData((prev) => ({
                      ...prev,
                      firstName: nameParts[0] || '',
                      lastName: nameParts.slice(1).join(' ') || '',
                      email: currentUser.email || '',
                      phoneCountryCode: prev.phoneCountryCode || '+63',
                      phoneNumber: currentUser.phoneNumber?.replace(/^\+\d+/, '') || '',
                    }));
                  } else {
                    setUserData((prev) => ({
                      ...prev,
                      email: currentUser.email || '',
                    }));
                  }
                }
              } else {
                // No data anywhere, use Firebase user data
                if (currentUser.displayName) {
                  const nameParts = currentUser.displayName.split(' ');
                  setUserData((prev) => ({
                    ...prev,
                    firstName: nameParts[0] || '',
                    lastName: nameParts.slice(1).join(' ') || '',
                    email: currentUser.email || '',
                    phoneCountryCode: prev.phoneCountryCode || '+63',
                    phoneNumber: currentUser.phoneNumber?.replace(/^\+\d+/, '') || '',
                  }));
                } else {
                  setUserData((prev) => ({
                    ...prev,
                    email: currentUser.email || '',
                  }));
                }
              }
            }
          } catch (error) {
            console.error('Error loading user profile:', error);
            // Fallback to localStorage or Firebase data
            const savedData = localStorage.getItem(`userData_${currentUser.uid}`);
            if (savedData) {
              try {
                const parsed = JSON.parse(savedData);
                setUserData(parsed);
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
         
          // Check if user has listings
          try {
            const listings = localStorage.getItem(`listings_${currentUser.uid}`);
            const hostListings = localStorage.getItem(`hostListings_${currentUser.uid}`);
            if (listings) {
              const parsedListings = JSON.parse(listings);
              setHasListings(parsedListings.length > 0);
            }
            if (hostListings) {
              const parsedHostListings = JSON.parse(hostListings);
              setHasListings(prev => prev || parsedHostListings.length > 0);
            }
          } catch (e) {
            // Ignore parse errors
          }
         
          // Get profile photo - prioritize localStorage (most up-to-date), then Firebase
          const savedPhoto = localStorage.getItem(`profilePhoto_${currentUser.uid}`);
          if (savedPhoto) {
            setProfilePhoto(savedPhoto);
            setOriginalProfilePhoto(savedPhoto);
          } else if (currentUser.photoURL) {
            setProfilePhoto(currentUser.photoURL);
            setOriginalProfilePhoto(currentUser.photoURL);
          } else {
            setProfilePhoto(null);
            setOriginalProfilePhoto(null);
          }
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Listen for storage changes to sync profile photo across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (user && e.key === `profilePhoto_${user.uid}` && e.newValue) {
        setProfilePhoto(e.newValue);
        if (!originalProfilePhoto) {
          setOriginalProfilePhoto(e.newValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, originalProfilePhoto]);

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
      if (
        phoneCountryCodeOpen &&
        phoneCountryCodeRef.current &&
        !phoneCountryCodeRef.current.contains(event.target as Node)
      ) {
        setPhoneCountryCodeOpen(false);
      }
      if (
        profilePhotoModalOpen &&
        profilePhotoModalRef.current &&
        !profilePhotoModalRef.current.contains(event.target as Node)
      ) {
        setProfilePhotoModalOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [burgerOpen, languageOpen, phoneCountryCodeOpen, profilePhotoModalOpen]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfilePhotoSelect = (imageUrl: string) => {
    // Store original photo if this is the first change
    if (!profilePhotoChanged && !originalProfilePhoto) {
      setOriginalProfilePhoto(profilePhoto);
    }
    setProfilePhoto(imageUrl);
    setProfilePhotoChanged(true);
    // Save to localStorage for preview only
    if (user) {
      localStorage.setItem(`profilePhoto_${user.uid}`, imageUrl);
    }
    setProfilePhotoModalOpen(false);
  };


  const handleEditField = (field: string) => {
    setEditingFields((prev) => new Set(prev).add(field));
    // Initialize edit values if not already set
    if (field === 'name' && !editValues.name) {
      setEditValues((prev) => ({
        ...prev,
        name: `${userData.firstName}|${userData.lastName}`, // Use | as separator for internal use
      }));
    } else if (field === 'email' && !editValues.email) {
      setEditValues((prev) => ({ ...prev, email: userData.email }));
    } else if (field === 'phone' && !editValues.phoneNumber) {
      setEditValues((prev) => ({ 
        ...prev, 
        phoneCountryCode: userData.phoneCountryCode,
        phoneNumber: userData.phoneNumber 
      }));
    } else if (field === 'birthDate' && !editValues.birthDate.month) {
      setEditValues((prev) => ({
        ...prev,
        birthDate: userData.birthDate,
      }));
    } else if (field === 'nationality' && !editValues.nationality) {
      setEditValues((prev) => ({ ...prev, nationality: userData.nationality }));
    } else if (field === 'gender' && !editValues.gender) {
      setEditValues((prev) => ({ ...prev, gender: userData.gender }));
    } else if (field === 'location' && !editValues.location) {
      setEditValues((prev) => ({ ...prev, location: userData.location }));
    }
  };

  const handleCancelEdit = (field: string) => {
    setEditingFields((prev) => {
      const newSet = new Set(prev);
      newSet.delete(field);
      return newSet;
    });
    // Reset the field value
    if (field === 'name') {
      setEditValues((prev) => ({ ...prev, name: '' }));
    } else if (field === 'email') {
      setEditValues((prev) => ({ ...prev, email: '' }));
    } else if (field === 'phone') {
      setEditValues((prev) => ({ ...prev, phoneCountryCode: '+63', phoneNumber: '' }));
    } else if (field === 'birthDate') {
      setEditValues((prev) => ({ ...prev, birthDate: { month: '', day: '', year: '' } }));
    } else if (field === 'nationality') {
      setEditValues((prev) => ({ ...prev, nationality: '' }));
    } else if (field === 'gender') {
      setEditValues((prev) => ({ ...prev, gender: '' }));
    } else if (field === 'location') {
      setEditValues((prev) => ({ ...prev, location: '' }));
    }
  };

  const handleSaveAll = async () => {
    if (!user) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      let newUserData = { ...userData };
      let updateFirebase = false;

      // Save name if edited
      if (editingFields.has('name') && editValues.name) {
        const nameParts = editValues.name.split('|');
        const firstName = nameParts[0]?.trim() || '';
        const lastName = nameParts[1]?.trim() || '';
        if (!firstName || !lastName) {
          setSaveError('Please enter both first name and last name');
          setTimeout(() => setSaveError(null), 3000);
          setSaving(false);
          return;
        }
        newUserData.firstName = firstName;
        newUserData.lastName = lastName;
        updateFirebase = true;
      }

      // Save email if edited
      if (editingFields.has('email') && editValues.email) {
        newUserData.email = editValues.email;
        // Note: Email update requires re-authentication in Firebase
        // We'll still save it to localStorage but show a message
      }

      // Save phone if edited - but first verify with OTP
      if (editingFields.has('phone') && editValues.phoneNumber) {
        // Check if phone number actually changed
        const phoneChanged = 
          editValues.phoneCountryCode !== userData.phoneCountryCode ||
          editValues.phoneNumber !== userData.phoneNumber;
        
        if (phoneChanged) {
          // Store pending phone update and open OTP modal
          setPendingPhoneUpdate({
            countryCode: editValues.phoneCountryCode,
            phoneNumber: editValues.phoneNumber
          });
          setOtpModalOpen(true);
          setSaving(false);
          return; // Don't save yet, wait for OTP verification
        }
      }

      // Save birth date if edited
      if (editingFields.has('birthDate') && editValues.birthDate.month) {
        newUserData.birthDate = editValues.birthDate;
      }

      // Save nationality if edited
      if (editingFields.has('nationality') && editValues.nationality) {
        newUserData.nationality = editValues.nationality;
      }

      // Save gender if edited
      if (editingFields.has('gender') && editValues.gender) {
        newUserData.gender = editValues.gender;
      }

      // Save location if edited
      if (editingFields.has('location') && editValues.location) {
        newUserData.location = editValues.location;
      }

      // Update state
      setUserData(newUserData);
      
      // Save to localStorage
      localStorage.setItem(`userData_${user.uid}`, JSON.stringify(newUserData));

      // Update Firebase if name or profile photo changed
      const firebaseUpdates: { displayName?: string; photoURL?: string } = {};
      if (updateFirebase) {
        firebaseUpdates.displayName = `${newUserData.firstName} ${newUserData.lastName}`;
      }
      // Update profile photo if it was changed
      if (profilePhotoChanged && profilePhoto) {
        firebaseUpdates.photoURL = profilePhoto;
        // Save to localStorage and trigger storage event for cross-tab sync
        localStorage.setItem(`profilePhoto_${user.uid}`, profilePhoto);
        // Trigger custom event for same-tab sync
        window.dispatchEvent(new StorageEvent('storage', {
          key: `profilePhoto_${user.uid}`,
          newValue: profilePhoto,
          storageArea: localStorage
        }));
      }
      if (Object.keys(firebaseUpdates).length > 0) {
        try {
          await updateProfile(user, firebaseUpdates);
        } catch (error: any) {
          console.error('Error updating Firebase profile:', error);
          // Silently fail - data is still saved to localStorage
        }
      }

      // Clear editing fields
      setEditingFields(new Set());
      setProfilePhotoChanged(false);
      setOriginalProfilePhoto(null);
      setEditValues({
        name: '',
        email: '',
        phoneCountryCode: '+63',
        phoneNumber: '',
        birthDate: { month: '', day: '', year: '' },
        nationality: '',
        gender: '',
        location: '',
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Show email update message if email was edited
      if (editingFields.has('email')) {
        alert('Email update requires re-authentication. This feature will be available soon.');
      }
      
      // Note: Phone number update is handled separately via OTP verification
    } catch (error: any) {
      console.error('Error saving fields:', error);
      setSaveError(error.message || 'Failed to save. Please try again.');
      setTimeout(() => setSaveError(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const displayName = user?.displayName || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();
  const fullName = (userData.firstName && userData.lastName) ? `${userData.firstName} ${userData.lastName}` : 'Insert Name';
  
  const months = [
    'Month', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'
  ];
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

  const nationalities = [
    'Afghan', 'Albanian', 'Algerian', 'American', 'Andorran', 'Angolan', 'Antiguans', 'Argentinean', 'Armenian', 'Australian',
    'Austrian', 'Azerbaijani', 'Bahamian', 'Bahraini', 'Bangladeshi', 'Barbadian', 'Barbudans', 'Batswana', 'Belarusian', 'Belgian',
    'Belizean', 'Beninese', 'Bhutanese', 'Bolivian', 'Bosnian', 'Brazilian', 'British', 'Bruneian', 'Bulgarian', 'Burkinabe',
    'Burmese', 'Burundian', 'Cambodian', 'Cameroonian', 'Canadian', 'Cape Verdean', 'Central African', 'Chadian', 'Chilean', 'Chinese',
    'Colombian', 'Comoran', 'Congolese', 'Costa Rican', 'Croatian', 'Cuban', 'Cypriot', 'Czech', 'Danish', 'Djibouti',
    'Dominican', 'Dutch', 'East Timorese', 'Ecuadorean', 'Egyptian', 'Emirian', 'Equatorial Guinean', 'Eritrean', 'Estonian', 'Ethiopian',
    'Fijian', 'Filipino', 'Finnish', 'French', 'Gabonese', 'Gambian', 'Georgian', 'German', 'Ghanaian', 'Greek',
    'Grenadian', 'Guatemalan', 'Guinean', 'Guinea-Bissauan', 'Guyanese', 'Haitian', 'Herzegovinian', 'Honduran', 'Hungarian', 'I-Kiribati',
    'Icelander', 'Indian', 'Indonesian', 'Iranian', 'Iraqi', 'Irish', 'Israeli', 'Italian', 'Ivorian', 'Jamaican',
    'Japanese', 'Jordanian', 'Kazakhstani', 'Kenyan', 'Kittian and Nevisian', 'Kuwaiti', 'Kyrgyz', 'Laotian', 'Latvian', 'Lebanese',
    'Liberian', 'Libyan', 'Liechtensteiner', 'Lithuanian', 'Luxembourger', 'Macedonian', 'Malagasy', 'Malawian', 'Malaysian', 'Maldivian',
    'Malian', 'Maltese', 'Marshallese', 'Mauritanian', 'Mauritian', 'Mexican', 'Micronesian', 'Moldovan', 'Monacan', 'Mongolian',
    'Montenegrin', 'Moroccan', 'Mozambican', 'Namibian', 'Nauruan', 'Nepalese', 'New Zealander', 'Nicaraguan', 'Nigerian', 'Nigerien',
    'North Korean', 'Northern Irish', 'Norwegian', 'Omani', 'Pakistani', 'Palauan', 'Panamanian', 'Papua New Guinean', 'Paraguayan', 'Peruvian',
    'Polish', 'Portuguese', 'Qatari', 'Romanian', 'Russian', 'Rwandan', 'Saint Lucian', 'Salvadoran', 'Samoan', 'San Marinese',
    'Sao Tomean', 'Saudi', 'Scottish', 'Senegalese', 'Serbian', 'Seychellois', 'Sierra Leonean', 'Singaporean', 'Slovak', 'Slovenian',
    'Solomon Islander', 'Somali', 'South African', 'South Korean', 'South Sudanese', 'Spanish', 'Sri Lankan', 'Sudanese', 'Surinamer', 'Swazi',
    'Swedish', 'Swiss', 'Syrian', 'Taiwanese', 'Tajik', 'Tanzanian', 'Thai', 'Togolese', 'Tongan', 'Trinidadian or Tobagonian',
    'Tunisian', 'Turkish', 'Tuvaluan', 'Ugandan', 'Ukrainian', 'Uruguayan', 'Uzbekistani', 'Vanuatuan', 'Vatican', 'Venezuelan',
    'Vietnamese', 'Welsh', 'Yemenite', 'Zambian', 'Zimbabwean'
  ];

  const cities = [
    'Manila', 'Quezon City', 'Caloocan', 'Davao City', 'Cebu City', 'Zamboanga City', 'Antipolo', 'Pasig', 'Taguig', 'Cagayan de Oro',
    'Parañaque', 'Dasmarinas', 'Valenzuela', 'Bacoor', 'Las Piñas', 'General Santos', 'Makati', 'San Jose del Monte', 'Bacolod', 'Muntinlupa',
    'Calamba', 'Marikina', 'Mandaue', 'Mandaluyong', 'Angeles', 'Iloilo City', 'Navotas', 'Lapu-Lapu', 'Batangas City', 'Butuan',
    'Cainta', 'San Pedro', 'Malabon', 'Tarlac City', 'Muntinlupa', 'San Fernando', 'Roxas City', 'Lucena', 'Iligan', 'Olongapo',
    'Baguio', 'Cotabato City', 'Dagupan', 'Naga', 'Tacloban', 'Puerto Princesa', 'Tagbilaran', 'Legazpi', 'Ormoc', 'Dipolog',
    'Sorsogon City', 'Surigao City', 'Tuguegarao', 'Vigan', 'Laoag', 'Bacolod', 'Iloilo', 'Cagayan de Oro', 'Davao', 'Cebu',
    'Bangkok', 'Jakarta', 'Kuala Lumpur', 'Singapore', 'Ho Chi Minh City', 'Hanoi', 'Phnom Penh', 'Yangon', 'Vientiane', 'Bandar Seri Begawan',
    'Tokyo', 'Seoul', 'Beijing', 'Shanghai', 'Hong Kong', 'Taipei', 'Osaka', 'Kyoto', 'Busan', 'Guangzhou',
    'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Auckland', 'Wellington', 'Christchurch', 'New York', 'Los Angeles',
    'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
    'London', 'Paris', 'Berlin', 'Madrid', 'Rome', 'Amsterdam', 'Vienna', 'Brussels', 'Prague', 'Stockholm',
    'Copenhagen', 'Dublin', 'Lisbon', 'Warsaw', 'Budapest', 'Athens', 'Helsinki', 'Oslo', 'Zurich', 'Geneva',
    'Dubai', 'Abu Dhabi', 'Riyadh', 'Jeddah', 'Doha', 'Kuwait City', 'Manama', 'Muscat', 'Tehran', 'Baghdad',
    'Cairo', 'Lagos', 'Nairobi', 'Johannesburg', 'Cape Town', 'Casablanca', 'Tunis', 'Algiers', 'Accra', 'Addis Ababa',
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
    'São Paulo', 'Rio de Janeiro', 'Buenos Aires', 'Lima', 'Bogotá', 'Santiago', 'Caracas', 'Guatemala City', 'Panama City', 'San Jose',
    'Mexico City', 'Montreal', 'Toronto', 'Vancouver', 'Calgary', 'Ottawa', 'Edmonton', 'Winnipeg', 'Quebec City', 'Hamilton'
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="page-shell">
      <header className="header shrink" style={{ minHeight: '80px', paddingTop: '12px', paddingBottom: '12px' }}>
        <div className="left-section">
          <Logo onClick={() => {
            const from = searchParams.get('from');
            if (from === 'host') {
              router.push('/host');
            } else {
              router.push('/dashboard');
            }
          }} />
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
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BurgerIcon />
            </button>
            {burgerOpen && (
              <div
                className="burger-popup open"
                role="menu"
                style={{
                  position: 'absolute',
                  top: '50px',
                  right: '0',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                  minWidth: '240px',
                  padding: '8px 0',
                  zIndex: 1000,
                }}
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
                    onClick={() => router.push('/reviews')}
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
            )}
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        {/* Left Sidebar */}
        <aside style={{ width: '280px', padding: '32px 24px', borderRight: '1px solid #e6e6e6', backgroundColor: '#fff' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px', color: '#222' }}>My Account</h1>
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '14px', color: '#1976d2', fontWeight: '500' }}>
              My Account &gt; {activeSection === 'personal-information' ? 'Personal Information' : activeSection === 'security' ? 'Security' : activeSection === 'payment' ? 'Payment' : 'Privacy and data management'}
            </p>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { id: 'personal-information', label: 'Personal Information' },
              { id: 'security', label: 'Security' },
              { id: 'payment', label: 'Payment' },
              { id: 'privacy', label: 'Privacy and data management' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: activeSection === item.id ? '#222' : '#666',
                  background: activeSection === item.id ? '#f6f7f8' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  if (activeSection !== item.id) {
                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeSection !== item.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '32px 48px', backgroundColor: '#fff', overflowY: 'auto' }}>
          {activeSection === 'personal-information' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#222' }}>About me</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', color: (userData.firstName && userData.lastName) ? '#222' : '#999', marginBottom: '4px' }}>{fullName}</h3>
                    <p style={{ fontSize: '16px', color: userData.location ? '#666' : '#999' }}>{userData.location || 'Insert Location'}</p>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        backgroundColor: profilePhoto ? 'transparent' : '#1976d2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '48px',
                        fontWeight: 'bold',
                        border: '4px solid white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        backgroundImage: profilePhoto ? `url(${profilePhoto})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                      onClick={() => setProfilePhotoModalOpen(true)}
                    >
                      {!profilePhoto && userInitial}
                      {/* Edit overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '0',
                          left: '0',
                          right: '0',
                          backgroundColor: 'transparent',
                          color: 'white',
                          padding: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          textAlign: 'center',
                          borderBottomLeftRadius: '50%',
                          borderBottomRightRadius: '50%',
                          cursor: 'pointer',
                          zIndex: 3,
                          textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setProfilePhotoModalOpen(true);
                        }}
                      >
                        Edit
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '0',
                          right: '0',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: '#1976d2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '3px solid white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          cursor: 'pointer',
                          zIndex: 2,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setProfilePhotoModalOpen(true);
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="white"
                          stroke="white"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </div>
                    </div>
                    {isVerified && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '0',
                          right: '0',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: '#1976d2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '3px solid white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          zIndex: 1,
                        }}
                      >
                        <VerifiedIcon />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {saveSuccess && (
                <div style={{ padding: '12px 16px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '8px', marginBottom: '24px' }}>
                  Changes saved successfully!
                </div>
              )}
              {saveError && (
                <div style={{ padding: '12px 16px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '8px', marginBottom: '24px' }}>
                  {saveError}
                </div>
              )}

              <div style={{ marginTop: '32px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {[
                      { label: 'Name', value: userData.firstName && userData.lastName ? `${userData.lastName}, ${userData.firstName}` : '', field: 'name', type: 'text', placeholder: 'Insert Name' },
                      { label: 'Email', value: userData.email, field: 'email', type: 'email', placeholder: 'Insert Email' },
                      { label: 'Phone', value: userData.phoneNumber ? `${userData.phoneCountryCode} ${userData.phoneNumber}` : '', field: 'phone', type: 'tel', placeholder: 'Insert Phone' },
                      { label: 'Birth Date', value: userData.birthDate.month && userData.birthDate.day && userData.birthDate.year ? `${userData.birthDate.month} / ${userData.birthDate.day} / ${userData.birthDate.year}` : '', field: 'birthDate', type: 'date', placeholder: 'Insert Birth Date' },
                      { label: 'Nationality', value: userData.nationality, field: 'nationality', type: 'select', options: nationalities, placeholder: 'Insert Nationality' },
                      { label: 'Gender', value: userData.gender, field: 'gender', type: 'select', options: ['Male', 'Female', 'Other'], placeholder: 'Insert Gender' },
                      { label: 'Location', value: userData.location, field: 'location', type: 'select', options: cities, placeholder: 'Insert Location' },
                    ].map((row, index) => (
                      <tr key={row.field} style={{ borderBottom: index < 6 ? '1px solid #e6e6e6' : 'none' }}>
                        <td style={{ padding: '20px 0', width: '200px', fontSize: '16px', color: '#666', fontWeight: '500' }}>
                          {row.label}
                        </td>
                        <td style={{ padding: '20px 0', fontSize: '16px', color: row.value ? '#222' : '#999' }}>
                          {editingFields.has(row.field) ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              {row.field === 'name' ? (
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '500' }}>First Name</label>
                                    <input
                                      type="text"
                                      value={editValues.name.split('|')[0] || ''}
                                      onChange={(e) => {
                                        const parts = editValues.name.split('|');
                                        setEditValues((prev) => ({ ...prev, name: `${e.target.value}|${parts[1] || ''}` }));
                                      }}
                                      style={{ padding: '8px 12px', border: '1px solid #e6e6e6', borderRadius: '4px', fontSize: '14px', minWidth: '150px' }}
                                      placeholder="First Name"
                                      autoFocus
                                    />
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '500' }}>Last Name</label>
                                    <input
                                      type="text"
                                      value={editValues.name.split('|')[1] || ''}
                                      onChange={(e) => {
                                        const parts = editValues.name.split('|');
                                        setEditValues((prev) => ({ ...prev, name: `${parts[0] || ''}|${e.target.value}` }));
                                      }}
                                      style={{ padding: '8px 12px', border: '1px solid #e6e6e6', borderRadius: '4px', fontSize: '14px', minWidth: '150px' }}
                                      placeholder="Last Name"
                                    />
                                  </div>
                                </div>
                              ) : row.field === 'birthDate' ? (
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <select
                                    value={editValues.birthDate.month}
                                    onChange={(e) => setEditValues((prev) => ({ ...prev, birthDate: { ...prev.birthDate, month: e.target.value } }))}
                                    style={{ padding: '8px', border: '1px solid #e6e6e6', borderRadius: '4px', fontSize: '14px' }}
                                  >
                                    {months.map((m) => (
                                      <option key={m} value={m === 'Month' ? '' : m}>
                                        {m}
                                      </option>
                                    ))}
                                  </select>
                                  <span>/</span>
                                  <select
                                    value={editValues.birthDate.day}
                                    onChange={(e) => setEditValues((prev) => ({ ...prev, birthDate: { ...prev.birthDate, day: e.target.value } }))}
                                    style={{ padding: '8px', border: '1px solid #e6e6e6', borderRadius: '4px', fontSize: '14px' }}
                                  >
                                    {days.map((d) => (
                                      <option key={d} value={d}>
                                        {d}
                                      </option>
                                    ))}
                                  </select>
                                  <span>/</span>
                                  <select
                                    value={editValues.birthDate.year}
                                    onChange={(e) => setEditValues((prev) => ({ ...prev, birthDate: { ...prev.birthDate, year: e.target.value } }))}
                                    style={{ padding: '8px', border: '1px solid #e6e6e6', borderRadius: '4px', fontSize: '14px' }}
                                  >
                                    {years.map((y) => (
                                      <option key={y} value={y}>
                                        {y}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ) : row.field === 'phone' ? (
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <div style={{ position: 'relative' }} ref={phoneCountryCodeRef}>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPhoneCountryCodeOpen(!phoneCountryCodeOpen);
                                      }}
                                      style={{
                                        padding: '8px 12px',
                                        border: '1px solid #e6e6e6',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        minWidth: '100px',
                                      }}
                                    >
                                      <span>{editValues.phoneCountryCode}</span>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="6 9 12 15 18 9"/>
                                      </svg>
                                    </button>
                                    {phoneCountryCodeOpen && (
                                      <div
                                        style={{
                                          position: 'absolute',
                                          top: '100%',
                                          left: '0',
                                          marginTop: '4px',
                                          backgroundColor: 'white',
                                          border: '1px solid #e6e6e6',
                                          borderRadius: '8px',
                                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                          maxHeight: '300px',
                                          overflowY: 'auto',
                                          zIndex: 1000,
                                          minWidth: '200px',
                                        }}
                                      >
                                        {countryCodes.map((item) => (
                                          <button
                                            key={item.code}
                                            type="button"
                                            onClick={() => {
                                              setEditValues((prev) => ({ ...prev, phoneCountryCode: item.code }));
                                              setPhoneCountryCodeOpen(false);
                                            }}
                                            style={{
                                              display: 'flex',
                                              justifyContent: 'space-between',
                                              alignItems: 'center',
                                              padding: '10px 16px',
                                              width: '100%',
                                              background: editValues.phoneCountryCode === item.code ? '#f6f7f8' : 'transparent',
                                              border: 'none',
                                              textAlign: 'left',
                                              cursor: 'pointer',
                                              fontSize: '14px',
                                              color: '#222',
                                            }}
                                            onMouseOver={(e) => {
                                              if (editValues.phoneCountryCode !== item.code) {
                                                e.currentTarget.style.backgroundColor = '#f9f9f9';
                                              }
                                            }}
                                            onMouseOut={(e) => {
                                              if (editValues.phoneCountryCode !== item.code) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                              }
                                            }}
                                          >
                                            <span style={{ fontWeight: '500' }}>{item.code}</span>
                                            <span style={{ fontSize: '12px', color: '#666' }}>{item.country}</span>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <input
                                    type="tel"
                                    value={editValues.phoneNumber}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\D/g, '');
                                      setEditValues((prev) => ({ ...prev, phoneNumber: value }));
                                    }}
                                    style={{ padding: '8px 12px', border: '1px solid #e6e6e6', borderRadius: '4px', fontSize: '14px', minWidth: '200px' }}
                                    placeholder="Phone number"
                                    autoFocus
                                  />
                                </div>
                              ) : row.type === 'select' ? (
                                <select
                                  value={editValues[row.field as keyof typeof editValues] as string}
                                  onChange={(e) => setEditValues((prev) => ({ ...prev, [row.field]: e.target.value }))}
                                  style={{ padding: '8px 12px', border: '1px solid #e6e6e6', borderRadius: '4px', fontSize: '14px', minWidth: '200px' }}
                                >
                                  {row.options?.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={row.type}
                                  value={editValues[row.field as keyof typeof editValues] as string}
                                  onChange={(e) => setEditValues((prev) => ({ ...prev, [row.field]: e.target.value }))}
                                  style={{ padding: '8px 12px', border: '1px solid #e6e6e6', borderRadius: '4px', fontSize: '14px', minWidth: '300px' }}
                                  autoFocus
                                />
                              )}
                            </div>
                          ) : (
                            row.value || row.placeholder || ''
                          )}
                        </td>
                        <td style={{ padding: '20px 0', textAlign: 'right' }}>
                          {!editingFields.has(row.field) ? (
                            <button
                              type="button"
                              onClick={() => handleEditField(row.field)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#1976d2',
                                fontSize: '16px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                padding: '4px 8px',
                              }}
                              onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                              onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                            >
                              Edit
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleCancelEdit(row.field)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#666',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                padding: '4px 8px',
                              }}
                              onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                              onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Save All Button - Show when any field is being edited OR profile photo is changed */}
                {(editingFields.size > 0 || profilePhotoChanged) && (
                  <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFields(new Set());
                        setProfilePhotoChanged(false);
                        // Reset profile photo to original if it was changed
                        if (originalProfilePhoto !== null) {
                          setProfilePhoto(originalProfilePhoto);
                          if (user) {
                            localStorage.setItem(`profilePhoto_${user.uid}`, originalProfilePhoto);
                          }
                        }
                        setOriginalProfilePhoto(null);
                        setEditValues({
                          name: '',
                          email: '',
                          phoneCountryCode: '+63',
                          phoneNumber: '',
                          birthDate: { month: '', day: '', year: '' },
                          nationality: '',
                          gender: '',
                          location: '',
                        });
                      }}
                      disabled={saving}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: 'transparent',
                        color: '#666',
                        border: '1px solid #e6e6e6',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: saving ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Cancel All
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAll}
                      disabled={saving}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        opacity: saving ? 0.6 : 1,
                      }}
                    >
                      {saving ? 'Saving...' : 'Save All Changes'}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {activeSection === 'security' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                  <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#222', marginBottom: '4px' }}>Security</h2>
                  <p style={{ fontSize: '14px', color: '#1976d2', fontWeight: '500' }}>My Account &gt; Security</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', color: (userData.firstName && userData.lastName) ? '#222' : '#999', marginBottom: '4px' }}>{fullName}</h3>
                    <p style={{ fontSize: '16px', color: userData.location ? '#666' : '#999' }}>{userData.location || 'Insert Location'}</p>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        backgroundColor: profilePhoto ? 'transparent' : '#1976d2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '48px',
                        fontWeight: 'bold',
                        border: '4px solid white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        backgroundImage: profilePhoto ? `url(${profilePhoto})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {!profilePhoto && userInitial}
                    </div>
                    {isVerified && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '0',
                          right: '0',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: '#1976d2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '3px solid white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          zIndex: 1,
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <path d="M9 12l2 2 4-4" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '32px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {[
                      { 
                        label: 'Passkeys', 
                        description: 'Change password', 
                        action: 'Set up' 
                      },
                      { 
                        label: 'Two-factor Authentication', 
                        description: 'Increase security of your account by setting up two-factor Authentication.', 
                        action: 'Set up' 
                      },
                      { 
                        label: 'Active Sessions', 
                        description: 'Sign out from all devices except this one.', 
                        action: 'Set up' 
                      },
                      { 
                        label: 'Deactivate Account', 
                        description: 'Temporarily deactivate your account.', 
                        action: 'Set up' 
                      },
                      { 
                        label: 'Delete Account', 
                        description: 'Permanently delete your account.', 
                        action: 'Set up' 
                      },
                    ].map((row, index) => (
                      <tr key={index} style={{ borderBottom: index < 4 ? '1px solid #e6e6e6' : 'none' }}>
                        <td style={{ padding: '20px 0', width: '250px', fontSize: '16px', color: '#222', fontWeight: '500' }}>
                          {row.label}
                        </td>
                        <td style={{ padding: '20px 0', fontSize: '16px', color: '#666' }}>
                          {row.description}
                        </td>
                        <td style={{ padding: '20px 0', textAlign: 'right' }}>
                          <button
                            type="button"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#1976d2',
                              fontSize: '16px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              padding: '4px 8px',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                          >
                            {row.action}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeSection === 'payment' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                  <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#222', marginBottom: '4px' }}>Payment</h2>
                  <p style={{ fontSize: '14px', color: '#1976d2', fontWeight: '500' }}>My Account &gt; Payment</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', color: (userData.firstName && userData.lastName) ? '#222' : '#999', marginBottom: '4px' }}>{fullName}</h3>
                    <p style={{ fontSize: '16px', color: userData.location ? '#666' : '#999' }}>{userData.location || 'Insert Location'}</p>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        backgroundColor: profilePhoto ? 'transparent' : '#1976d2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '48px',
                        fontWeight: 'bold',
                        border: '4px solid white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        backgroundImage: profilePhoto ? `url(${profilePhoto})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {!profilePhoto && userInitial}
                    </div>
                    {isVerified && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '0',
                          right: '0',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: '#1976d2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '3px solid white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          zIndex: 1,
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <path d="M9 12l2 2 4-4" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '32px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {[
                      { 
                        label: 'Payment Card', 
                        details: (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <div style={{ width: '32px', height: '20px', backgroundColor: '#1434CB', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 'bold' }}>VISA</div>
                              <div style={{ width: '32px', height: '20px', backgroundColor: '#EB001B', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '8px', fontWeight: 'bold' }}>MC</div>
                              <div style={{ width: '32px', height: '20px', backgroundColor: '#0D4F96', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '8px', fontWeight: 'bold' }}>JCB</div>
                            </div>
                            <span style={{ fontSize: '16px', color: '#666' }}>... 3858</span>
                          </div>
                        ), 
                        action: 'Add' 
                      },
                      { 
                        label: 'Gcash / Pay Maya', 
                        details: (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <div style={{ width: '50px', height: '24px', backgroundColor: '#0070BA', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 'bold' }}>GCash</div>
                              <div style={{ width: '40px', height: '24px', backgroundColor: '#00A859', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 'bold' }}>maya</div>
                            </div>
                            <span style={{ fontSize: '16px', color: '#666' }}>(+63) *******4454</span>
                          </div>
                        ), 
                        action: 'Add' 
                      },
                    ].map((row, index) => (
                      <tr key={index} style={{ borderBottom: index < 1 ? '1px solid #e6e6e6' : 'none' }}>
                        <td style={{ padding: '20px 0', width: '200px', fontSize: '16px', color: '#222', fontWeight: '500' }}>
                          {row.label}
                        </td>
                        <td style={{ padding: '20px 0', fontSize: '16px', color: '#666' }}>
                          {row.details}
                        </td>
                        <td style={{ padding: '20px 0', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (row.label === 'Payment Card') {
                                setPaymentModalOpen(true);
                              }
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#1976d2',
                              fontSize: '16px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              padding: '4px 8px',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                          >
                            {row.action}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeSection === 'privacy' && (
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#222', marginBottom: '24px' }}>Privacy and data management</h2>
              <p style={{ color: '#666' }}>Privacy settings coming soon...</p>
            </div>
          )}
        </main>
      </div>

      {/* OTP Modal for Phone Number Verification */}
      {otpModalOpen && pendingPhoneUpdate && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="auth-modal" style={{ maxWidth: '400px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#222', margin: 0 }}>
                  Verify Phone Number
                </h2>
                <button
                  className="modal-close"
                  onClick={() => {
                    setOtpModalOpen(false);
                    setPendingPhoneUpdate(null);
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div style={{ padding: '24px' }}>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
                  We need to verify your new phone number. An OTP will be sent to{' '}
                  <strong>{pendingPhoneUpdate.countryCode} {pendingPhoneUpdate.phoneNumber}</strong>
                </p>
                <OtpLogin
                  onSuccess={async (verifiedUser) => {
                    // OTP verified successfully, now save the phone number
                    try {
                      const newUserData = { ...userData };
                      newUserData.phoneCountryCode = pendingPhoneUpdate.countryCode;
                      newUserData.phoneNumber = pendingPhoneUpdate.phoneNumber;
                      
                      setUserData(newUserData);
                      localStorage.setItem(`userData_${user?.uid}`, JSON.stringify(newUserData));
                      
                      // Clear editing fields
                      setEditingFields((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete('phone');
                        return newSet;
                      });
                      setEditValues((prev) => ({
                        ...prev,
                        phoneCountryCode: '+63',
                        phoneNumber: '',
                      }));
                      
                      setOtpModalOpen(false);
                      setPendingPhoneUpdate(null);
                      setSaveSuccess(true);
                      setTimeout(() => setSaveSuccess(false), 3000);
                    } catch (error: any) {
                      console.error('Error saving phone number:', error);
                      setSaveError('Failed to save phone number. Please try again.');
                      setTimeout(() => setSaveError(null), 3000);
                    }
                  }}
                  onClose={() => {
                    setOtpModalOpen(false);
                    setPendingPhoneUpdate(null);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods Modal */}
      {paymentModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={() => setPaymentModalOpen(false)}>
          <div className="auth-modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ padding: '32px' }}>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#222', marginBottom: '8px' }}>
                  Payment methods
                </h2>
                <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
                  Securely add or remove payment methods to make it easier when you book.
                </p>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#222', marginBottom: '16px' }}>
                  Payment cards
                </h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  {/* Card logos */}
                  <div style={{ width: '48px', height: '32px', backgroundColor: '#1434CB', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 'bold' }}>VISA</div>
                  <div style={{ width: '48px', height: '32px', backgroundColor: '#EB001B', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '8px', fontWeight: 'bold' }}>MC</div>
                  <div style={{ width: '48px', height: '32px', backgroundColor: '#0D4F96', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '8px', fontWeight: 'bold' }}>JCB</div>
                  <div style={{ width: '48px', height: '32px', backgroundColor: '#006FCF', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '8px', fontWeight: 'bold' }}>AMEX</div>
                  <div style={{ width: '48px', height: '32px', backgroundColor: '#0079BE', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '8px', fontWeight: 'bold' }}>DC</div>
                  <div style={{ width: '48px', height: '32px', backgroundColor: '#FF6000', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '8px', fontWeight: 'bold' }}>DISC</div>
                  <div style={{ width: '48px', height: '32px', backgroundColor: '#1B4B9A', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '8px', fontWeight: 'bold' }}>UP</div>
                  <div style={{ width: '48px', height: '32px', backgroundColor: '#00579F', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '8px', fontWeight: 'bold' }}>CB</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Cardholder's name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>
                      Cardholder's name <span style={{ color: '#d32f2f' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={paymentFormData.cardholderName}
                      onChange={(e) => setPaymentFormData(prev => ({ ...prev, cardholderName: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e6e6e6',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none',
                      }}
                      placeholder="Enter cardholder name"
                    />
                  </div>

                  {/* Card number */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>
                      Card number <span style={{ color: '#d32f2f' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={paymentFormData.cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                          setPaymentFormData(prev => ({ ...prev, cardNumber: value }));
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 12px 12px 48px',
                          border: '1px solid #e6e6e6',
                          borderRadius: '8px',
                          fontSize: '16px',
                          outline: 'none',
                        }}
                        placeholder="1234 5678 9012 3456"
                      />
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '16px', backgroundColor: '#1434CB', borderRadius: '2px' }} />
                    </div>
                  </div>

                  {/* Expiration date and CVV */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>
                        Expiration date <span style={{ color: '#d32f2f' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={paymentFormData.expirationDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                          }
                          setPaymentFormData(prev => ({ ...prev, expirationDate: value }));
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e6e6e6',
                          borderRadius: '8px',
                          fontSize: '16px',
                          outline: 'none',
                        }}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>
                        CVV <span style={{ color: '#d32f2f' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={paymentFormData.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setPaymentFormData(prev => ({ ...prev, cvv: value }));
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e6e6e6',
                          borderRadius: '8px',
                          fontSize: '16px',
                          outline: 'none',
                        }}
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentModalOpen(false);
                    setPaymentFormData({ cardholderName: '', cardNumber: '', expirationDate: '', cvv: '' });
                  }}
                  style={{
                    padding: '12px 24px',
                    border: '1px solid #1976d2',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#1976d2',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Handle save payment card
                    if (!paymentFormData.cardholderName || !paymentFormData.cardNumber || !paymentFormData.expirationDate || !paymentFormData.cvv) {
                      alert('Please fill in all required fields');
                      return;
                    }
                    // Here you would save the payment card
                    alert('Payment card saved successfully!');
                    setPaymentModalOpen(false);
                    setPaymentFormData({ cardholderName: '', cardNumber: '', expirationDate: '', cvv: '' });
                  }}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Photo Selection Modal */}
      {profilePhotoModalOpen && (
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
          }}
          onClick={() => setProfilePhotoModalOpen(false)}
        >
          <div
            ref={profilePhotoModalRef}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setProfilePhotoModalOpen(false)}
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
            </button>

            {/* Title */}
            <h2
              style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#222',
                marginBottom: '24px',
                paddingRight: '40px',
              }}
            >
              Choose a Profile Picture
            </h2>

            {/* Default Images Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              {defaultProfileImages.map((imageUrl, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleProfilePhotoSelect(imageUrl)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '12px',
                    border: profilePhoto === imageUrl ? '3px solid #1976d2' : '2px solid #e0e0e0',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    padding: 0,
                    background: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    if (profilePhoto !== imageUrl) {
                      e.currentTarget.style.borderColor = '#1976d2';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (profilePhoto !== imageUrl) {
                      e.currentTarget.style.borderColor = '#e0e0e0';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={`Profile avatar ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Remove Photo Option */}
            {profilePhoto && (
              <button
                type="button"
                onClick={() => {
                  if (!profilePhotoChanged && !originalProfilePhoto) {
                    setOriginalProfilePhoto(profilePhoto);
                  }
                  setProfilePhoto(null);
                  setProfilePhotoChanged(true);
                  if (user) {
                    localStorage.removeItem(`profilePhoto_${user.uid}`);
                  }
                  setProfilePhotoModalOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#d32f2f',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.borderColor = '#d32f2f';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              >
                Remove Profile Picture
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

