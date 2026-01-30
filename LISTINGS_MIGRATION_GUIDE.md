# Listings Migration: localStorage → Firestore

**Status:** 🔧 Implementation in Progress  
**Date:** January 14, 2026  
**Objective:** Move all venue listings from browser localStorage to Firebase Firestore

---

## 📋 Overview

Your current system stores listings **in localStorage only**, which is why:
- ✅ Listings visible in the browser where created
- ❌ NOT visible in other browsers (Chrome vs Edge)
- ❌ NOT visible in incognito windows
- ❌ NOT visible to other users

**Solution:** Store listings in **Firestore** (persistent, accessible from anywhere)

---

## 📁 Firestore Collection Structure

### New Collection: `/listings`

```
firestore/
└── listings/
    ├── {listingId}/
    │   ├── hostId: string
    │   ├── hostName: string
    │   ├── hostEmail: string
    │   ├── hostPhoto: string
    │   ├── propertyName: string
    │   ├── description: string
    │   ├── location: string
    │   ├── photos: string[]
    │   ├── amenities: string[]
    │   ├── selectedAmenities: string[]
    │   ├── pricing: {
    │   │   basePrice: number
    │   │   pricePerGuest: number
    │   │   minimumGuests: number
    │   }
    │   ├── selectedOccasions: string[]
    │   ├── guestRange: string
    │   ├── guestLimit: number
    │   ├── blockedDates: string[]
    │   ├── status: "active" | "inactive" | "reviewing"
    │   ├── createdAt: Timestamp
    │   └── updatedAt: Timestamp
```

---

## 🔧 New Library File

**Created:** [app/lib/listings.ts](../app/lib/listings.ts) (200+ lines)

### Core Functions

```typescript
// Save or create listing
await saveListing(hostId, hostName, hostEmail, listingData, listingId?)

// Get host's listings
const listings = await getHostListings(hostId)

// Get single listing
const listing = await getListing(listingId)

// Real-time subscription to host's listings
const unsubscribe = subscribeToHostListings(hostId, (listings) => {
  setListings(listings);
})

// Get all public listings
const allListings = await getAllListings()

// Delete listing
await deleteListing(listingId)

// Update status
await updateListingStatus(listingId, 'active')

// Save blocked dates
await saveBlockedDates(listingId, blockedDates)

// MIGRATION: Get listings from localStorage
const localListings = getListingsFromLocalStorage(userId)

// MIGRATION: Move all to Firestore
const result = await migrateListingsFromLocalStorage(userId, userName, email)
```

---

## 🚀 Implementation Steps

### Step 1: Update `list-your-place/page.tsx` ⭐ NEXT

**What to change:**
- Replace localStorage.setItem with `saveListing()`
- Pass listing data to Firestore instead of localStorage

**Find this code (line ~3238):**
```typescript
localStorage.setItem(
  hostListingsKey,
  listingsJson
);
```

**Replace with:**
```typescript
import { saveListing } from '@/app/lib/listings';

// Save to Firestore
const listingId = await saveListing(
  currentUser.uid,
  currentUser.displayName || 'Host',
  currentUser.email || '',
  listingWithStatus
);

console.log('Listing saved to Firestore:', listingId);
```

---

### Step 2: Update All Pages That Read Listings

#### Pages to update:
1. **[app/host/page.tsx](../app/host/page.tsx)** - Host dashboard
2. **[app/dashboard/page.tsx](../app/dashboard/page.tsx)** - Browse listings
3. **[app/venue/[id]/page.tsx](../app/venue/[id]/page.tsx)** - Listing details
4. **[app/venue-preview/[id]/page.tsx](../app/venue-preview/[id]/page.tsx)** - Preview
5. **[app/wishlist/page.tsx](../app/wishlist/page.tsx)** - Wishlist

**Pattern: Replace localStorage with subscribeToHostListings()**

**OLD (localStorage):**
```typescript
useEffect(() => {
  const hostListingsKey = `hostListings_${user.uid}`;
  const savedListings = localStorage.getItem(hostListingsKey);
  if (savedListings) {
    setListings(JSON.parse(savedListings));
  }
}, [user]);
```

**NEW (Firestore):**
```typescript
import { subscribeToHostListings } from '@/app/lib/listings';

useEffect(() => {
  if (!user?.uid) return;
  
  const unsubscribe = subscribeToHostListings(
    user.uid,
    (listings) => setListings(listings)
  );
  
  return unsubscribe;
}, [user?.uid]);
```

---

### Step 3: Add Auto-Migration on User Login

**When user logs in, automatically migrate their localStorage to Firestore:**

```typescript
// Add to app/layout.tsx or app/providers.tsx in useEffect for auth:

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      setUser(currentUser);
      
      // Auto-migrate listings from localStorage
      const { migrateListingsFromLocalStorage } = await import('@/app/lib/listings');
      const localListings = JSON.parse(
        localStorage.getItem(`hostListings_${currentUser.uid}`) || '[]'
      );
      
      if (localListings.length > 0) {
        console.log('Found local listings, starting migration...');
        const result = await migrateListingsFromLocalStorage(
          currentUser.uid,
          currentUser.displayName || 'Host',
          currentUser.email || ''
        );
        
        if (result.success > 0) {
          console.log(
            `✅ Successfully migrated ${result.success} listings to Firestore`
          );
        }
        
        if (result.failed > 0) {
          console.warn(
            `⚠️ Failed to migrate ${result.failed} listings. Errors:`,
            result.errors
          );
        }
      }
    }
  });
}, []);
```

---

### Step 4: Update Firestore Security Rules

**Add to your Firestore Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Listings collection
    match /listings/{listingId} {
      // Anyone can read active listings
      allow read: if resource.data.status == 'active';
      
      // Only the listing owner can edit
      allow write: if request.auth.uid == resource.data.hostId;
      
      // Anyone authenticated can create
      allow create: if request.auth != null;
    }
    
    // Messages (existing)
    match /messages/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Conversations (existing)
    match /conversations/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 📊 Migration Plan

### Phase 1: Preparation (Today)
- ✅ Create [app/lib/listings.ts](../app/lib/listings.ts)
- ⏳ Update Firestore security rules
- ⏳ Test Firestore collection creation

### Phase 2: Implement New Saves (This Week)
- ⏳ Update `list-your-place/page.tsx` to save to Firestore
- ⏳ Add auto-migration on login
- ⏳ Test new listing creation

### Phase 3: Migrate Read Operations (This Week)
- ⏳ Update `host/page.tsx` to read from Firestore
- ⏳ Update `dashboard/page.tsx`
- ⏳ Update `venue/[id]/page.tsx`
- ⏳ Update remaining pages

### Phase 4: Data Migration (Before Launch)
- ⏳ Run auto-migration script
- ⏳ Verify all listings in Firestore
- ⏳ Clear old localStorage data
- ⏳ Test all browsers

---

## 🧪 Testing the Migration

### Test 1: New Listings Save to Firestore
```
1. Login with user account
2. Create new listing via "List your place"
3. Check Firestore Console:
   - Go to: Collections → listings
   - Verify document created with correct data
   ✓ Should appear instantly
```

### Test 2: Auto-Migration on Login
```
1. Create listings in localStorage (using old system)
2. Login to app
3. Check browser console:
   - Look for: "Found local listings, starting migration..."
   - Look for: "✅ Successfully migrated X listings to Firestore"
4. Check Firestore Console:
   - Old listings should now be in /listings collection
```

### Test 3: Cross-Browser Visibility
```
1. Login as Host in Chrome:
   - Create new listing
   - See it appear in listings

2. Switch to Edge (incognito):
   - Login as same Host user
   - Navigate to host dashboard
   ✓ SHOULD SEE SAME LISTING
   
3. Switch to Firefox:
   - Same result
   ✓ SHOULD SEE SAME LISTING
```

### Test 4: Guest Can See Host's Listings
```
1. Login as Host in one window:
   - Create public listing (status: active)

2. Login as Guest in another window:
   - Go to search/browse
   ✓ SHOULD SEE HOST'S LISTING
```

---

## 🔄 Migration Checklist

- [ ] Create [app/lib/listings.ts](../app/lib/listings.ts) ✅ DONE
- [ ] Update Firestore security rules
- [ ] Update `list-your-place/page.tsx` to save to Firestore
- [ ] Add auto-migration on login
- [ ] Update `host/page.tsx` to read from Firestore
- [ ] Update `dashboard/page.tsx`
- [ ] Update `venue/[id]/page.tsx`
- [ ] Update `venue-preview/[id]/page.tsx`
- [ ] Update `wishlist/page.tsx`
- [ ] Test new listing creation
- [ ] Test auto-migration
- [ ] Test cross-browser visibility
- [ ] Test guest can see listings
- [ ] Run full test suite
- [ ] Clear old localStorage data
- [ ] Deploy to production

---

## 💡 Benefits After Migration

### ✅ Listings will be:
- **Persistent** - Available across all browsers/devices
- **Real-time** - Updates visible instantly to all users
- **Shareable** - Guests can see host listings
- **Searchable** - Can query listings by location, price, etc.
- **Scalable** - Handle thousands of listings
- **Backed up** - Firebase handles backups
- **Secure** - Firestore security rules control access

### ✅ Users will be able to:
- Create listing in Chrome, view in Edge ✓
- Create listing in browser, view on mobile ✓
- Create listing on desktop, view on incognito ✓
- Share listing with friends (get link) ✓
- Search public listings ✓
- Message about listings ✓

---

## 🚨 Important Notes

### Data Consistency
- Old localStorage data will remain until auto-migration runs
- After migration, localStorage is cleared
- Can keep localStorage for "draft" functionality (optional)

### Backward Compatibility
- Old localStorage reads still work (for now)
- New saves go to Firestore
- Gradual transition possible

### Performance
- Real-time updates via `subscribeToHostListings()`
- Firestore handles indexing automatically
- Better than localStorage (no size limit)

---

## 📞 Support

### If migration fails:
1. Check browser console for errors
2. Check Firestore Console → Indexes (may need index creation)
3. Check Firestore Rules → Verify read/write permissions
4. Check listings.ts for error handling

### If listings don't appear:
1. Verify listing status is "active"
2. Check hostId matches current user
3. Check Firestore rules allow reads
4. Check subscription is active

---

## 📖 Reference

- **New Library:** [app/lib/listings.ts](../app/lib/listings.ts)
- **Messaging Reference:** [app/lib/messaging.ts](../app/lib/messaging.ts) (similar pattern)
- **Firestore Docs:** https://firebase.google.com/docs/firestore

---

**Next Steps:** Wait for confirmation to proceed with updating pages to use the new listings library.
