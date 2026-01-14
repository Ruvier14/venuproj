import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  getDoc,
  limit,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/firebase';

export interface Listing {
  id: string;
  hostId: string;
  hostName?: string;
  hostEmail?: string;
  hostPhoto?: string;
  propertyName: string;
  description: string;
  location?: string;
  photos: string[];
  amenities: string[];
  selectedAmenities?: string[];
  pricing: {
    basePrice?: number;
    pricePerGuest?: number;
    minimumGuests?: number;
  };
  selectedOccasions?: string[];
  guestRange?: string;
  guestLimit?: number;
  blockedDates?: string[];
  status?: 'active' | 'inactive' | 'reviewing';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  [key: string]: any; // Allow additional fields
}

/**
 * Save or create a new listing in Firestore
 */
export async function saveListing(
  hostId: string,
  hostName: string,
  hostEmail: string,
  listingData: any,
  listingId?: string
): Promise<string> {
  if (!hostId) {
    throw new Error('Host ID is required');
  }

  if (!listingData.propertyName || !listingData.propertyName.trim()) {
    throw new Error('Property name is required');
  }

  try {
    const listingsRef = collection(db, 'listings');

    const listingDocument = {
      hostId,
      hostName: hostName || 'Unknown Host',
      hostEmail: hostEmail || '',
      hostPhoto: listingData.hostPhoto || '',
      propertyName: listingData.propertyName,
      description: listingData.description || '',
      location: listingData.location || '',
      photos: Array.isArray(listingData.photos) ? listingData.photos : [],
      amenities: Array.isArray(listingData.amenities)
        ? listingData.amenities
        : Array.isArray(listingData.selectedAmenities)
        ? listingData.selectedAmenities
        : [],
      selectedAmenities: Array.isArray(listingData.selectedAmenities)
        ? listingData.selectedAmenities
        : [],
      pricing: {
        basePrice: listingData.pricing?.basePrice || 0,
        pricePerGuest: listingData.pricing?.pricePerGuest || 0,
        minimumGuests: listingData.pricing?.minimumGuests || 1,
      },
      selectedOccasions: Array.isArray(listingData.selectedOccasions)
        ? listingData.selectedOccasions
        : [],
      guestRange: listingData.guestRange || '',
      guestLimit: listingData.guestLimit || 100,
      blockedDates: Array.isArray(listingData.blockedDates)
        ? listingData.blockedDates
        : [],
      status: listingData.status || 'active',
      updatedAt: serverTimestamp(),
    };

    let docId: string;

    if (listingId) {
      // Update existing listing
      const docRef = doc(db, 'listings', listingId);
      await updateDoc(docRef, listingDocument);
      docId = listingId;
      console.log('Listing updated in Firestore:', listingId);
    } else {
      // Create new listing
      const newDoc = await addDoc(listingsRef, {
        ...listingDocument,
        createdAt: serverTimestamp(),
      });
      docId = newDoc.id;
      console.log('New listing created in Firestore:', docId);
    }

    return docId;
  } catch (error: any) {
    console.error('Error saving listing to Firestore:', error);
    throw error;
  }
}

/**
 * Get all listings for a specific host
 */
export async function getHostListings(hostId: string): Promise<Listing[]> {
  if (!hostId) {
    return [];
  }

  try {
    const listingsRef = collection(db, 'listings');
    const q = query(
      listingsRef,
      where('hostId', '==', hostId),
      orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const listings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Listing[];

    console.log('Fetched host listings:', listings.length);
    return listings;
  } catch (error: any) {
    console.error('Error fetching host listings:', error);
    return [];
  }
}

/**
 * Get a single listing by ID
 */
export async function getListing(listingId: string): Promise<Listing | null> {
  if (!listingId) {
    return null;
  }

  try {
    const docRef = doc(db, 'listings', listingId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.warn('Listing not found:', listingId);
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Listing;
  } catch (error: any) {
    console.error('Error fetching listing:', error);
    return null;
  }
}

/**
 * Subscribe to host's listings in real-time
 */
export function subscribeToHostListings(
  hostId: string,
  callback: (listings: Listing[]) => void
): () => void {
  if (!hostId) {
    callback([]);
    return () => {};
  }

  try {
    const listingsRef = collection(db, 'listings');
    const q = query(
      listingsRef,
      where('hostId', '==', hostId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const listings = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Listing[];

        console.log('Real-time listings updated:', listings.length);
        callback(listings);
      },
      (error: any) => {
        console.error('Error subscribing to listings:', error);
        callback([]);
      }
    );
  } catch (error: any) {
    console.error('Error setting up listings subscription:', error);
    return () => {};
  }
}

/**
 * Get all public listings (search/browse)
 */
export async function getAllListings(
  constraints: QueryConstraint[] = []
): Promise<Listing[]> {
  try {
    const listingsRef = collection(db, 'listings');
    const q = query(
      listingsRef,
      where('status', '==', 'active'),
      orderBy('updatedAt', 'desc'),
      ...constraints
    );

    const snapshot = await getDocs(q);
    const listings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Listing[];

    console.log('Fetched all public listings:', listings.length);
    return listings;
  } catch (error: any) {
    console.error('Error fetching all listings:', error);
    return [];
  }
}

/**
 * Delete a listing
 */
export async function deleteListing(listingId: string): Promise<void> {
  if (!listingId) {
    throw new Error('Listing ID is required');
  }

  try {
    const docRef = doc(db, 'listings', listingId);
    await deleteDoc(docRef);
    console.log('Listing deleted:', listingId);
  } catch (error: any) {
    console.error('Error deleting listing:', error);
    throw error;
  }
}

/**
 * Update listing status
 */
export async function updateListingStatus(
  listingId: string,
  status: 'active' | 'inactive' | 'reviewing'
): Promise<void> {
  if (!listingId) {
    throw new Error('Listing ID is required');
  }

  try {
    const docRef = doc(db, 'listings', listingId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
    console.log('Listing status updated:', listingId, status);
  } catch (error: any) {
    console.error('Error updating listing status:', error);
    throw error;
  }
}

/**
 * Save blocked dates for a listing
 */
export async function saveBlockedDates(
  listingId: string,
  blockedDates: string[]
): Promise<void> {
  if (!listingId) {
    throw new Error('Listing ID is required');
  }

  try {
    const docRef = doc(db, 'listings', listingId);
    await updateDoc(docRef, {
      blockedDates: blockedDates || [],
      updatedAt: serverTimestamp(),
    });
    console.log('Blocked dates updated for listing:', listingId);
  } catch (error: any) {
    console.error('Error saving blocked dates:', error);
    throw error;
  }
}

/**
 * MIGRATION: Get all listings from localStorage for a user
 */
export function getListingsFromLocalStorage(userId: string): any[] {
  try {
    const hostListingsKey = `hostListings_${userId}`;
    const savedListings = localStorage.getItem(hostListingsKey);

    if (!savedListings) {
      return [];
    }

    const listings = JSON.parse(savedListings);
    console.log(
      `Retrieved ${listings.length} listings from localStorage for user:`,
      userId
    );
    return listings;
  } catch (error: any) {
    console.error('Error reading listings from localStorage:', error);
    return [];
  }
}

/**
 * MIGRATION: Migrate all listings from localStorage to Firestore for a user
 */
export async function migrateListingsFromLocalStorage(
  userId: string,
  userName: string,
  userEmail: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  const result = { success: 0, failed: 0, errors: [] as string[] };

  try {
    const localListings = getListingsFromLocalStorage(userId);

    if (localListings.length === 0) {
      console.log('No listings to migrate for user:', userId);
      return result;
    }

    console.log(`Starting migration of ${localListings.length} listings...`);

    for (const listing of localListings) {
      try {
        const listingId = await saveListing(userId, userName, userEmail, listing);
        result.success++;
        console.log(`Migrated listing: ${listing.propertyName} (ID: ${listingId})`);
      } catch (error: any) {
        result.failed++;
        const errorMsg = `Failed to migrate "${listing.propertyName}": ${error.message}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log(
      `Migration complete: ${result.success} succeeded, ${result.failed} failed`
    );

    if (result.success > 0) {
      // Clear localStorage after successful migration
      const hostListingsKey = `hostListings_${userId}`;
      localStorage.removeItem(hostListingsKey);
      console.log('localStorage cleared after migration');
    }

    return result;
  } catch (error: any) {
    console.error('Error during migration:', error);
    result.errors.push(`Migration error: ${error.message}`);
    return result;
  }
}
