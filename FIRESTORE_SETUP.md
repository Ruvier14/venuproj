# Firestore Setup Guide for Messaging

## Step 1: Enable Firestore in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `venu-40e32`
3. Click on **Firestore Database** in the left sidebar
4. Click **Create database**
5. Choose **Start in test mode** (we'll add security rules next)
6. Select a location for your database (choose the closest to your users)

## Step 2: Set Up Security Rules

After creating the database, go to the **Rules** tab and replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is a participant in conversation
    function isParticipant(conversation) {
      return request.auth.uid in conversation.data.participants;
    }
    
    // Conversations collection
    match /conversations/{conversationId} {
      // Users can read conversations they're part of
      allow read: if isAuthenticated() && 
        request.auth.uid in resource.data.participants;
      
      // Users can create conversations
      allow create: if isAuthenticated() && 
        request.auth.uid in request.resource.data.participants &&
        request.resource.data.participants.size() == 2;
      
      // Users can update conversations they're part of
      allow update: if isAuthenticated() && 
        request.auth.uid in resource.data.participants;
    }
    
    // Messages collection
    match /messages/{messageId} {
      // Users can read messages from conversations they're part of
      allow read: if isAuthenticated();
      
      // Users can create messages where they are the sender
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.senderId;
      
      // Users can update messages they sent or mark them as read
      allow update: if isAuthenticated() && (
        request.auth.uid == resource.data.senderId ||
        // Allow updating readBy field if user is participant
        (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['read', 'readBy', 'text', 'senderId', 'senderName', 'senderPhoto', 'conversationId']))
      );
    }
    
    // Users collection (optional - for storing user profiles)
    match /users/{userId} {
      // Users can read any user profile
      allow read: if isAuthenticated();
      
      // Users can create/update their own profile
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}
```

## Step 3: Create Indexes (REQUIRED)

Firestore requires composite indexes for certain queries. You **MUST** create these indexes for messaging to work properly.

### Required Indexes:

#### 1. Messages Index (for displaying messages)
**Collection:** `messages`
**Fields:**
- `conversationId` (Ascending)
- `timestamp` (Ascending)

**How to create:**
1. Click the link in the error message when it appears in the browser console
   - OR
2. Go to [Firebase Console](https://console.firebase.google.com/) → Firestore → Indexes
3. Click "Create Index"
4. Set Collection ID: `messages`
5. Add fields:
   - Field: `conversationId`, Order: Ascending
   - Field: `timestamp`, Order: Ascending
6. Click "Create"

#### 2. Conversations Index (for listing conversations) ⚠️ REQUIRED
**Collection:** `conversations`
**Fields:**
- `participants` (Array-contains)
- `updatedAt` (Descending)

**How to create:**
**Method 1 - Quick (Recommended):**
1. Click the link in the error message in your browser console
2. It will take you directly to Firebase Console with the index pre-configured
3. Click "Create Index"
4. Wait 1-2 minutes for the index to build

**Method 2 - Manual:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `venu-40e32`
3. Go to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. Set Collection ID: `conversations`
6. Add fields:
   - Field: `participants`, Query scope: Array-contains
   - Field: `updatedAt`, Order: Descending
7. Click "Create"

**Note:** The code now has fallback mechanisms, so messages will still work without indexes (just slower), but **creating the indexes is highly recommended** for optimal performance.

**Important:** After creating indexes, wait 1-2 minutes for them to build before testing.

## Step 4: Test the Messaging Feature

1. **Create two user accounts** (or use two different browsers/incognito windows)
2. **As User 1**: Go to a venue page and click "Contact host"
3. **Navigate to Messages**: You should see the conversation in the messages page
4. **As User 2 (the host)**: Go to Messages and you should see the conversation
5. **Send messages**: Both users should be able to send and receive messages in real-time

## Data Structure

### Conversations Collection
```
conversations/{conversationId}
  - participants: ["userId1", "userId2"]
  - participantNames: { "userId1": "John Doe", "userId2": "Jane Smith" }
  - participantPhotos: { "userId1": "photo_url", "userId2": "photo_url" }
  - lastMessage: "Latest message text"
  - lastMessageTime: Timestamp
  - listingId: "listing_123" (optional)
  - listingName: "Venue Name" (optional)
  - unreadCount: { "userId1": 0, "userId2": 3 }
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

### Messages Collection
```
messages/{messageId}
  - conversationId: "conversation_123"
  - senderId: "userId1"
  - senderName: "John Doe"
  - senderPhoto: "photo_url"
  - text: "Message content"
  - timestamp: Timestamp
  - read: boolean
  - readBy: { "userId2": Timestamp }
```

## Troubleshooting

### Messages not appearing
- Check browser console for errors
- Verify Firestore rules are correctly set
- Ensure users are authenticated
- Check that conversation participants include both users

### Real-time updates not working
- Verify `onSnapshot` listeners are properly set up
- Check network tab for WebSocket connections
- Ensure Firestore is enabled in Firebase Console

### Permission errors
- Double-check security rules
- Verify user authentication status
- Ensure users are participants in conversations

## Next Steps

1. ✅ Set up Firestore database
2. ✅ Add security rules
3. ✅ Test messaging between two users
4. 🔄 Add push notifications (optional)
5. 🔄 Add file attachments (optional)
6. 🔄 Add typing indicators (optional)
7. 🔄 Add read receipts (already implemented)

