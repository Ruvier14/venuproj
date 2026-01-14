# Listings Migration: Step-by-Step Implementation

**Goal:** Move all venue listings from localStorage to Firestore  
**Timeline:** This week  
**Complexity:** High (affects multiple files)

---

## Phase 1: Setup & Verification ✅

### ✅ 1.1 Created Library File
- ✅ [app/lib/listings.ts](../app/lib/listings.ts) - 220 lines, 10 functions

### 📝 1.2 Update Firestore Security Rules (DO NOW)

**Go to:** Firebase Console → Firestore → Rules

**Replace the rules with:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Listings collection
    match /listings/{listingId} {
      // Anyone can read active listings (for browsing)
      allow read: if resource.data.status == 'active' 
                     || request.auth.uid == resource.data.hostId;
      
      // Only the listing owner can edit their listings
      allow update, delete: if request.auth.uid == resource.data.hostId;
      
      // Anyone authenticated can create listings
      allow create: if request.auth != null;
    }
    
    // Messages (keep existing)
    match /messages/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Conversations (keep existing)
    match /conversations/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Click:** "Publish"

---

## Phase 2: Update New Listing Creation ⭐ CRITICAL

### 📝 2.1 Update [app/list-your-place/page.tsx](../app/list-your-place/page.tsx)

**Find:** Line ~3238 where listings are saved to localStorage

```typescript
localStorage.setItem(
  hostListingsKey,
  listingsJson
);
```

**Replace with:**

```typescript
// Import at the top
import { saveListing } from '@/app/lib/listings';

// In the save handler, replace localStorage.setItem with:
try {
  const listingId = await saveListing(
    currentUser.uid,
    currentUser.displayName || 'Host',
    currentUser.email || '',
    listingWithStatus
  );
  
  console.log('✅ Listing saved to Firestore:', listingId);
  
  // Show success message
  alert(`✅ Your listing has been submitted for review! Listing ID: ${listingId}`);
  
  // Clear form
  setFormData(initialFormData);
  
  // You can optionally clear localStorage after successful save
  // localStorage.removeItem(`hostListings_${currentUser.uid}`);
} catch (error: any) {
  console.error('❌ Error saving listing:', error);
  alert(`Error: ${error.message}`);
}
```

**What this does:**
- ✅ Saves listing to Firestore instead of localStorage
- ✅ Returns listing ID
- ✅ Shows success message
- ✅ Clears form
- ✅ Has error handling

---

## Phase 3: Update Host Dashboard ⭐ CRITICAL

### 📝 3.1 Update [app/host/page.tsx](../app/host/page.tsx)

**Find:** Lines ~117-145 where listings are loaded from localStorage

**OLD CODE (around line 117):**
```typescript
useEffect(() => {
  if (currentUser) {
    const hostListingsKey = `hostListings_${currentUser.uid}`;
    const savedListings = localStorage.getItem(hostListingsKey);
    if (savedListings) {
      const listingsData = JSON.parse(savedListings);
      setListings(listingsData);
    }
  }
}, [currentUser]);
```

**REPLACE WITH:**
```typescript
import { subscribeToHostListings } from '@/app/lib/listings';

useEffect(() => {
  if (!currentUser?.uid) {
    setListings([]);
    return;
  }

  // Subscribe to real-time listings from Firestore
  const unsubscribe = subscribeToHostListings(
    currentUser.uid,
    (listings) => {
      console.log('Updated listings:', listings.length);
      setListings(listings);
    }
  );

  return () => unsubscribe();
}, [currentUser?.uid]);
```

**What this does:**
- ✅ Reads listings from Firestore (not localStorage)
- ✅ Real-time updates when listings change
- ✅ Proper cleanup on unmount
- ✅ Handles user not logged in

---

## Phase 4: Update Browse/Search Pages

### 📝 4.1 Update [app/dashboard/page.tsx](../app/dashboard/page.tsx)

**Find:** Lines ~560-730 where listings are loaded

**OLD CODE (around line 563):**
```typescript
const listings = localStorage.getItem(`listings_${currentUser.uid}`);
const hostListings = localStorage.getItem(`hostListings_${currentUser.uid}`);
```

**REPLACE WITH:**
```typescript
import { subscribeToHostListings, getAllListings } from '@/app/lib/listings';

// Get host's own listings
useEffect(() => {
  if (!currentUser?.uid) return;
  
  const unsubscribe = subscribeToHostListings(
    currentUser.uid,
    (listings) => setMyListings(listings)
  );
  
  return unsubscribe;
}, [currentUser?.uid]);

// Get all public listings for browsing
useEffect(() => {
  const loadPublicListings = async () => {
    const allListings = await getAllListings();
    setAllListings(allListings);
  };
  
  loadPublicListings();
}, []);
```

---

### 📝 4.2 Update [app/venue/[id]/page.tsx](../app/venue/[id]/page.tsx)

**Find:** Lines ~817-1160 where listing is loaded

**OLD CODE:**
```typescript
const listings = localStorage.getItem(`listings_${currentUser.uid}`);
const hostListings = localStorage.getItem(`hostListings_${currentUser.uid}`);
```

**REPLACE WITH:**
```typescript
import { getListing } from '@/app/lib/listings';

// In useEffect
useEffect(() => {
  const loadListing = async () => {
    const listing = await getListing(venueId);
    if (listing) {
      setListingData(listing);
    }
  };
  
  loadListing();
}, [venueId]);
```

---

### 📝 4.3 Update [app/venue-preview/[id]/page.tsx](../app/venue-preview/[id]/page.tsx)

**Same pattern as venue/[id]/page.tsx:**
```typescript
import { getListing } from '@/app/lib/listings';

useEffect(() => {
  const loadListing = async () => {
    const listing = await getListing(venueId);
    if (listing) {
      setListingData(listing);
    }
  };
  
  loadListing();
}, [venueId]);
```

---

### 📝 4.4 Update [app/wishlist/page.tsx](../app/wishlist/page.tsx)

```typescript
import { getListing } from '@/app/lib/listings';

// For each wishlist item, load the listing
const loadWishlistItem = async (listingId: string) => {
  const listing = await getListing(listingId);
  return listing;
};
```

---

## Phase 5: Add Auto-Migration on Login ⭐ CRITICAL

### 📝 5.1 Update [app/layout.tsx](../app/layout.tsx) OR [app/providers.tsx](../app/providers.tsx)

**Find:** Where you handle `onAuthStateChanged`

**Add this code:**
```typescript
import { onAuthStateChanged } from 'firebase/auth';
import { migrateListingsFromLocalStorage } from '@/app/lib/listings';

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      setUser(user);
      
      // Auto-migrate listings from localStorage to Firestore
      try {
        const localListings = localStorage.getItem(`hostListings_${user.uid}`);
        
        if (localListings) {
          console.log('📦 Found local listings, starting migration...');
          
          const result = await migrateListingsFromLocalStorage(
            user.uid,
            user.displayName || 'Host',
            user.email || ''
          );
          
          if (result.success > 0) {
            console.log(`✅ Migrated ${result.success} listings to Firestore`);
          }
          
          if (result.failed > 0) {
            console.warn(
              `⚠️ Failed to migrate ${result.failed} listings:`,
              result.errors
            );
          }
        }
      } catch (error) {
        console.error('Migration error:', error);
      }
    }
  });
  
  return unsubscribe;
}, []);
```

**What this does:**
- ✅ Checks if user has localStorage listings
- ✅ Automatically migrates to Firestore
- ✅ Logs success/failure
- ✅ Clears localStorage after success
- ✅ Happens silently on login

---

## Phase 6: Testing ✅

### 🧪 6.1 Test New Listing Creation

```
1. Login with new account
2. Go to "List your place"
3. Fill in property details
4. Submit
5. Check:
   ✓ Success message appears
   ✓ Firestore Console shows new document in /listings
   ✓ Host dashboard shows new listing
```

### 🧪 6.2 Test Auto-Migration

```
1. Login with account that has old listings in localStorage
2. Check browser console for:
   ✓ "Found local listings, starting migration..."
   ✓ "Migrated X listings to Firestore"
3. Check Firestore Console:
   ✓ Old listings now in /listings collection
4. Refresh page:
   ✓ Still see listings (now from Firestore, not localStorage)
```

### 🧪 6.3 Test Cross-Browser

```
1. Create listing in Chrome:
   ✓ Appears in host dashboard

2. Login in Edge:
   ✓ Same listing appears
   ✓ No need to create it again

3. Use incognito:
   ✓ Same listing visible
```

### 🧪 6.4 Test Guest Can See

```
1. Host creates listing (status: active)
2. Guest searches/browses:
   ✓ Can see host's listing
   ✓ Can click to view details
   ✓ Can message host about it
```

---

## 📋 Implementation Checklist

### Phase 1: Setup
- [ ] Firestore security rules updated

### Phase 2: Create
- [ ] [list-your-place/page.tsx](../app/list-your-place/page.tsx) updated to save to Firestore
- [ ] Test new listing creation
- [ ] Verify in Firestore Console

### Phase 3: Host Dashboard
- [ ] [host/page.tsx](../app/host/page.tsx) updated to read from Firestore
- [ ] Real-time updates working
- [ ] Tested in multiple browsers

### Phase 4: Browse/Search
- [ ] [dashboard/page.tsx](../app/dashboard/page.tsx) updated
- [ ] [venue/[id]/page.tsx](../app/venue/[id]/page.tsx) updated
- [ ] [venue-preview/[id]/page.tsx](../app/venue-preview/[id]/page.tsx) updated
- [ ] [wishlist/page.tsx](../app/wishlist/page.tsx) updated
- [ ] All pages showing Firestore data

### Phase 5: Migration
- [ ] Auto-migration added to auth handler
- [ ] Tested with old localStorage data
- [ ] Listings successfully migrated

### Phase 6: Testing
- [ ] New listing creation works
- [ ] Cross-browser visibility works
- [ ] Auto-migration works
- [ ] Guest can search and view listings
- [ ] No console errors

### Phase 7: Cleanup
- [ ] All localStorage references removed
- [ ] Old localStorage data cleared
- [ ] Documentation updated

---

## 🚨 Common Issues & Solutions

### Issue: "Listing saved but doesn't appear"
**Solution:**
1. Check Firestore Console → listings collection
2. Verify listing document exists
3. Check status is "active"
4. Refresh page (listener should update automatically)

### Issue: "Can't see listings from other browser"
**Solution:**
1. Verify both browsers logged in as same user
2. Check Firestore rules allow reads
3. Check listing status is "active"
4. Check network tab for errors

### Issue: "Auto-migration didn't run"
**Solution:**
1. Check browser console for migration logs
2. Check localStorage has listings
3. Verify user logged in
4. Manually run migration function

### Issue: "Firestore index error"
**Solution:**
1. Check Firebase Console → Firestore → Indexes
2. Look for any "Building..." indexes
3. Wait for "Enabled" status
4. Refresh page

---

## 📞 Help & Debugging

**Enable debug logging:**
```typescript
// In any file using listings
import { saveListing } from '@/app/lib/listings';

// All functions log to console:
// "New listing created in Firestore: abc123"
// "Fetched host listings: 5"
// etc.
```

**Monitor real-time updates:**
```javascript
// In browser console
localStorage.getItem('hostListings_USER_ID') // Check if still there after migration
```

**Check Firestore data:**
1. Go to Firebase Console
2. Firestore Database
3. Collections → listings
4. Should see documents for each listing

---

## 📚 Files to Update Summary

| File | Lines | What Changes |
|------|-------|--------------|
| list-your-place/page.tsx | ~3238 | Save to Firestore |
| host/page.tsx | ~117-145 | Read from Firestore |
| dashboard/page.tsx | ~560-730 | Read from Firestore |
| venue/[id]/page.tsx | ~817-1160 | Read from Firestore |
| venue-preview/[id]/page.tsx | ~660 | Read from Firestore |
| wishlist/page.tsx | ~137-138 | Read from Firestore |
| layout.tsx or providers.tsx | Auth section | Add auto-migration |

---

**Ready to start implementing?**

1. ✅ Start with Phase 1: Update Firestore Rules
2. ⏭️ Then Phase 2: Update list-your-place to save to Firestore
3. ⏭️ Then Phase 3: Update host dashboard to read from Firestore
4. ⏭️ Then Phase 4-5: Update other pages and add migration
5. ⏭️ Finally: Test everything thoroughly

See [LISTINGS_API_REFERENCE.md](./LISTINGS_API_REFERENCE.md) for function details while implementing.
