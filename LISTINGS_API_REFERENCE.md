# Listings Library API Reference

## Quick Start

```typescript
import {
  saveListing,
  getHostListings,
  getListing,
  subscribeToHostListings,
  migrateListingsFromLocalStorage,
} from '@/app/lib/listings';
```

---

## Functions Reference

### 1. **saveListing()** - Create or Update Listing

```typescript
const listingId = await saveListing(
  hostId: string,           // User ID of listing owner
  hostName: string,         // Display name of host
  hostEmail: string,        // Email of host
  listingData: any,         // Listing object with propertyName, etc.
  listingId?: string        // Optional: for updates
);

// Example:
const id = await saveListing(
  'user123',
  'John Doe',
  'john@example.com',
  {
    propertyName: 'Wedding Venue',
    description: 'Beautiful venue...',
    photos: ['url1', 'url2'],
    amenities: ['parking', 'wifi'],
    pricing: {
      basePrice: 5000,
      pricePerGuest: 50,
      minimumGuests: 50
    },
  }
);
```

**Returns:** `string` - The listing ID  
**Throws:** Error if required fields missing or Firebase error

---

### 2. **getHostListings()** - Get All Host's Listings

```typescript
const listings = await getHostListings(hostId: string);

// Example:
const myListings = await getHostListings('user123');
console.log(myListings); // [{ id, propertyName, ...}, ...]
```

**Returns:** `Listing[]` - Array of listings  
**Throws:** None (returns empty array on error)

---

### 3. **getListing()** - Get Single Listing by ID

```typescript
const listing = await getListing(listingId: string);

// Example:
const venue = await getListing('listing_abc123');
console.log(venue.propertyName); // "Wedding Venue"
```

**Returns:** `Listing | null` - The listing or null  
**Throws:** None (returns null if not found)

---

### 4. **subscribeToHostListings()** - Real-time Updates ⭐

**Best for:** Host dashboard showing their own listings

```typescript
const unsubscribe = subscribeToHostListings(
  hostId: string,
  callback: (listings: Listing[]) => void
);

// Example (in useEffect):
useEffect(() => {
  if (!user?.uid) return;
  
  const unsubscribe = subscribeToHostListings(user.uid, (listings) => {
    setMyListings(listings);
  });
  
  return unsubscribe; // Cleanup
}, [user?.uid]);
```

**Returns:** Unsubscribe function  
**Real-time:** Yes (updates when any listing changes)

---

### 5. **getAllListings()** - Get All Public Listings

```typescript
const allListings = await getAllListings(constraints?: QueryConstraint[]);

// Example:
const activeVenues = await getAllListings();

// With filters:
import { where } from 'firebase/firestore';
const venues = await getAllListings([
  where('selectedOccasions', 'array-contains', 'Wedding'),
  where('guestLimit', '>=', 100)
]);
```

**Returns:** `Listing[]` - All active listings  
**Note:** Only returns listings with status='active'

---

### 6. **deleteListing()** - Delete a Listing

```typescript
await deleteListing(listingId: string);

// Example:
await deleteListing('listing_abc123');
```

**Returns:** void  
**Throws:** Error if not found or permission denied

---

### 7. **updateListingStatus()** - Change Status

```typescript
await updateListingStatus(
  listingId: string,
  status: 'active' | 'inactive' | 'reviewing'
);

// Example:
await updateListingStatus('listing_abc123', 'inactive');
```

**Returns:** void  
**Throws:** Error on failure

---

### 8. **saveBlockedDates()** - Update Blocked Dates

```typescript
await saveBlockedDates(
  listingId: string,
  blockedDates: string[]
);

// Example:
await saveBlockedDates('listing_abc123', [
  '2026-02-14',
  '2026-03-15'
]);
```

**Returns:** void  
**Throws:** Error on failure

---

## Migration Functions

### 9. **getListingsFromLocalStorage()** - Read Old Data

```typescript
const localListings = getListingsFromLocalStorage(userId: string);

// Example:
const oldListings = getListingsFromLocalStorage('user123');
console.log(`Found ${oldListings.length} old listings`);
```

**Returns:** `any[]` - Listings from localStorage  
**Note:** Used for migration only

---

### 10. **migrateListingsFromLocalStorage()** - Auto-Migrate ⭐

**Automatically moves all listings from localStorage to Firestore**

```typescript
const result = await migrateListingsFromLocalStorage(
  userId: string,
  userName: string,
  userEmail: string
);

console.log(`Migrated: ${result.success} succeeded, ${result.failed} failed`);
if (result.errors.length > 0) {
  console.warn('Errors:', result.errors);
}
```

**Returns:** `{ success: number, failed: number, errors: string[] }`

**What it does:**
1. Reads listings from `hostListings_${userId}` in localStorage
2. Saves each to Firestore using `saveListing()`
3. Clears localStorage after success
4. Returns result with success/fail counts

**Example (Auto-migrate on login):**
```typescript
useEffect(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Auto-migrate
      const result = await migrateListingsFromLocalStorage(
        user.uid,
        user.displayName || 'Host',
        user.email || ''
      );
      
      if (result.success > 0) {
        alert(`✅ Migrated ${result.success} listings!`);
      }
    }
  });
}, []);
```

---

## Listing Interface

```typescript
interface Listing {
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
}
```

---

## Common Patterns

### Pattern 1: Show Host's Listings (Real-time)

```typescript
useEffect(() => {
  if (!user?.uid) return;
  
  const unsubscribe = subscribeToHostListings(
    user.uid,
    (listings) => setMyListings(listings)
  );
  
  return unsubscribe;
}, [user?.uid]);

return (
  <div>
    {myListings.map(listing => (
      <div key={listing.id}>
        <h3>{listing.propertyName}</h3>
        <p>${listing.pricing.basePrice}</p>
      </div>
    ))}
  </div>
);
```

### Pattern 2: Create New Listing

```typescript
const handleCreateListing = async (formData: any) => {
  try {
    const listingId = await saveListing(
      user.uid,
      user.displayName || 'Host',
      user.email || '',
      formData
    );
    
    alert(`✅ Listing created! ID: ${listingId}`);
    // Redirect or refresh
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
};
```

### Pattern 3: Update Listing

```typescript
const handleUpdateListing = async (listingId: string, updates: any) => {
  try {
    await saveListing(
      user.uid,
      user.displayName || 'Host',
      user.email || '',
      { ...listing, ...updates }, // Merge old + new
      listingId // Pass ID to update instead of create
    );
    
    alert('✅ Listing updated!');
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
};
```

### Pattern 4: Get Guest Can View

```typescript
// For search/browse page
useEffect(() => {
  const loadListings = async () => {
    const allListings = await getAllListings();
    setSearchResults(allListings);
  };
  
  loadListings();
}, []);
```

---

## Error Handling

```typescript
try {
  const listingId = await saveListing(
    hostId,
    hostName,
    hostEmail,
    listingData
  );
} catch (error: any) {
  if (error.code === 'permission-denied') {
    console.error('You don\'t have permission to save this listing');
  } else if (error.message.includes('required')) {
    console.error('Missing required field: property name');
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

---

## Browser Console Debugging

When testing, check browser console (F12) for these logs:

```
✓ "New listing created in Firestore: abc123"
✓ "Listing updated in Firestore: abc123"
✓ "Fetched host listings: 5"
✓ "Real-time listings updated: 5"
✓ "Retrieved 3 listings from localStorage"
✓ "Successfully migrated 3 listings to Firestore"
```

---

## Next Steps

1. **Update list-your-place/page.tsx** to use `saveListing()`
2. **Update host/page.tsx** to use `subscribeToHostListings()`
3. **Update dashboard/page.tsx** to use `getAllListings()`
4. **Add auto-migration** on login
5. **Test cross-browser** visibility

See [LISTINGS_MIGRATION_GUIDE.md](./LISTINGS_MIGRATION_GUIDE.md) for step-by-step instructions.
