# Messaging System Architecture Flow

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Components](#architecture-components)
3. [Firebase Firestore Structure](#firebase-firestore-structure)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [User Interaction Flows](#user-interaction-flows)
6. [Real-time Updates](#real-time-updates)
7. [Functions and Responsibilities](#functions-and-responsibilities)
8. [State Management](#state-management)
9. [Technical Details](#technical-details)

---

## System Overview

The messaging system enables real-time communication between users (guests) and hosts (vendors) within the Venu application. It uses **Firebase Firestore** as the backend database and **Firebase Authentication** for user management.

### Key Features
- ✅ Real-time message delivery
- ✅ Conversation management
- ✅ Typing indicators
- ✅ Read receipts and unread counts
- ✅ Message history persistence
- ✅ Listing-based conversations
- ✅ Self-messaging support (for testing)

---

## Architecture Components

### 1. **Frontend Components**

```
┌─────────────────────────────────────────────────────────────┐
│                    Messages Page (/messages)                 │
│  ┌──────────────────┐          ┌──────────────────────────┐ │
│  │  Left Sidebar    │          │   Right Panel            │ │
│  │  - Conversations │          │   - Message Thread       │ │
│  │  - Search        │          │   - Chat Input           │ │
│  │  - Filters       │          │   - Typing Indicator     │ │
│  └──────────────────┘          └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2. **Backend Services**

```
┌─────────────────────────────────────────────────────────────┐
│                      Firebase Services                       │
│  ┌──────────────────┐          ┌──────────────────────────┐ │
│  │  Firestore DB    │          │   Firebase Auth          │ │
│  │  - conversations │          │   - User Authentication  │ │
│  │  - messages      │          │   - User Sessions        │ │
│  │  - typing status │          │                          │ │
│  └──────────────────┘          └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3. **Core Library Module**

```
app/lib/messaging.ts
├── Conversation Management
│   ├── getOrCreateConversation()
│   └── subscribeToConversations()
├── Message Management
│   ├── sendMessage()
│   ├── subscribeToMessages()
│   └── markMessagesAsRead()
├── Typing Indicators
│   ├── setTypingStatus()
│   └── subscribeToTyping()
└── Helper Functions
    ├── getParticipantInfo()
    ├── getUserDisplayName()
    └── getUserPhoto()
```

---

## Firebase Firestore Structure

### Collections and Documents

```
firestore/
├── conversations/
│   ├── {conversationId}/
│   │   ├── participants: string[]              // [userId1, userId2]
│   │   ├── participantNames: Record<string, string>
│   │   ├── participantPhotos: Record<string, string>
│   │   ├── lastMessage: string
│   │   ├── lastMessageTime: Timestamp
│   │   ├── listingId: string | null
│   │   ├── listingName: string | null
│   │   ├── unreadCount: Record<string, number> // {userId: count}
│   │   ├── createdAt: Timestamp
│   │   └── updatedAt: Timestamp
│   │
│   └── {conversationId}/typing/                // Subcollection
│       └── {userId}/
│           ├── userId: string
│           ├── isTyping: boolean
│           └── timestamp: Timestamp
│
└── messages/
    └── {messageId}/
        ├── conversationId: string
        ├── senderId: string
        ├── senderName: string
        ├── senderPhoto: string
        ├── text: string
        ├── timestamp: Timestamp
        ├── read: boolean
        └── readBy: Record<string, Timestamp>
```

### Data Relationships

```
User A ──┐
         ├──> Conversation ──> Messages (Collection)
User B ──┘         │
                   ├──> Typing Status (Subcollection)
                   └──> Listing Reference (Optional)
```

---

## Data Flow Diagrams

### 1. **Starting a Conversation Flow**

```
┌──────────┐
│   User   │
│  (Guest) │
└────┬─────┘
     │
     │ 1. Clicks "Contact host" on venue page
     ▼
┌─────────────────────────────────┐
│  app/venue/[id]/page.tsx        │
│  - Checks if user is logged in  │
│  - Gets host user ID            │
└────┬────────────────────────────┘
     │
     │ 2. Calls getOrCreateConversation()
     ▼
┌─────────────────────────────────┐
│  app/lib/messaging.ts           │
│  getOrCreateConversation()      │
│  ├── Query conversations        │
│  ├── Check if exists            │
│  └── Create new if needed       │
└────┬────────────────────────────┘
     │
     │ 3. Returns conversationId
     ▼
┌─────────────────────────────────┐
│  Navigate to /messages?         │
│  conversationId={id}            │
└─────────────────────────────────┘
```

### 2. **Sending a Message Flow**

```
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ 1. Types message & clicks send
     ▼
┌─────────────────────────────────┐
│  app/messages/page.tsx          │
│  handleSendMessage()            │
│  ├── Validates message text     │
│  ├── Calls sendMessage()        │
│  └── Clears input (optimistic)  │
└────┬────────────────────────────┘
     │
     │ 2. sendMessage()
     ▼
┌─────────────────────────────────┐
│  app/lib/messaging.ts           │
│  sendMessage()                  │
│  ├── Adds message to Firestore  │
│  ├── Updates conversation       │
│  │   - lastMessage              │
│  │   - lastMessageTime          │
│  │   - unreadCount              │
│  └── Updates typing status      │
└────┬────────────────────────────┘
     │
     │ 3. Firestore triggers onSnapshot
     ▼
┌─────────────────────────────────┐
│  subscribeToMessages()          │
│  ├── Receives new message       │
│  ├── Updates messages state     │
│  └── Auto-scrolls to bottom     │
└─────────────────────────────────┘
```

### 3. **Real-time Message Updates Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                    Real-time Update Chain                    │
└─────────────────────────────────────────────────────────────┘

User A sends message
         │
         ▼
┌────────────────────┐
│  Firestore Write   │
│  - messages/{id}   │
└─────────┬──────────┘
          │
          │ onSnapshot listeners trigger
          ▼
┌────────────────────┐          ┌────────────────────┐
│  User A's Browser  │          │  User B's Browser  │
│  (Sender)          │          │  (Receiver)        │
├────────────────────┤          ├────────────────────┤
│ subscribeToMessages│          │ subscribeToMessages│
│ ├── New message    │          │ ├── New message    │
│ ├── Update UI      │          │ ├── Update UI      │
│ └── Show in chat   │          │ ├── Increment      │
│                    │          │ │   unread count   │
│                    │          │ └── Show badge     │
└────────────────────┘          └────────────────────┘
```

### 4. **Typing Indicator Flow**

```
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ 1. Types in input field
     ▼
┌─────────────────────────────────┐
│  app/messages/page.tsx          │
│  handleTyping()                 │
│  ├── Debounces input (500ms)    │
│  ├── Calls setTypingStatus()    │
│  └── Sets local isTyping state  │
└────┬────────────────────────────┘
     │
     │ 2. setTypingStatus(true)
     ▼
┌─────────────────────────────────┐
│  app/lib/messaging.ts           │
│  setTypingStatus()              │
│  └── Updates Firestore          │
│      conversations/{id}/typing/{userId}
└────┬────────────────────────────┘
     │
     │ 3. Firestore triggers subscription
     ▼
┌─────────────────────────────────┐
│  subscribeToTyping()            │
│  (Other user's browser)         │
│  ├── Receives typing status     │
│  ├── Updates typingUsers state  │
│  └── Displays "User is typing..."│
└─────────────────────────────────┘
```

---

## User Interaction Flows

### Flow 1: Guest Initiates Contact

```
1. Guest browses venue detail page (/venue/[id])
   │
   ├─> Sees "Contact host" button
   │
2. Guest clicks "Contact host"
   │
   ├─> If not logged in → Shows auth modal
   │
   ├─> If logged in → Calls getOrCreateConversation()
   │   │
   │   ├─> Checks if conversation exists between:
   │   │   - Current user (guest)
   │   │   - Host user
   │   │   - Same listing (if provided)
   │   │
   │   ├─> If exists → Returns existing conversationId
   │   │
   │   └─> If new → Creates conversation document
   │       ├─> Sets participants [guestId, hostId]
   │       ├─> Sets participantNames from localStorage
   │       ├─> Sets participantPhotos from localStorage
   │       ├─> Links to listing (if provided)
   │       └─> Initializes unreadCount to 0
   │
3. Navigate to /messages?conversationId={id}
   │
   ├─> Messages page loads
   │
   ├─> Subscribes to conversations list
   │
   ├─> Subscribes to messages for selected conversation
   │
   └─> Displays chat interface
```

### Flow 2: Viewing Conversations

```
1. User navigates to /messages
   │
2. Messages page initializes
   │
   ├─> Checks authentication status
   │
   ├─> If logged in:
   │   │
   │   ├─> Calls subscribeToConversations(userId)
   │   │   │
   │   │   ├─> Queries Firestore:
   │   │   │   - where('participants', 'array-contains', userId)
   │   │   │   - orderBy('updatedAt', 'desc')
   │   │   │
   │   │   ├─> Receives conversations in real-time
   │   │   │
   │   │   └─> Updates conversations state
   │   │
   │   ├─> Displays conversation list in left sidebar
   │   │   ├─> Participant name & photo
   │   │   ├─> Last message preview
   │   │   ├─> Unread count badge
   │   │   └─> Listing name (if linked)
   │   │
   │   └─> If URL has conversationId:
   │       └─> Auto-selects that conversation
   │
   └─> If not logged in:
       └─> Shows login prompt
```

### Flow 3: Sending and Receiving Messages

```
┌──────────────────────────────────────────────────────────┐
│                    Sending a Message                      │
└──────────────────────────────────────────────────────────┘

User A (Sender)                        User B (Receiver)
     │                                      │
     │ 1. Types "Hello"                     │
     ├─> Updates messageText state          │
     │                                      │
     │ 2. Clicks send button                │
     ├─> handleSendMessage()                │
     │   ├─> Validates text                 │
     │   ├─> Clears input (optimistic)      │
     │   └─> Calls sendMessage()            │
     │       │                              │
     │       ▼                              │
     │  ┌──────────────────────────┐        │
     │  │  Firestore Write         │        │
     │  │  - messages/{newId}      │        │
     │  │  - conversation/{id}     │        │
     │  │    (updates lastMessage) │        │
     │  │    (increments unreadCount)       │
     │  └──────────────────────────┘        │
     │                                      │
     │ 3. onSnapshot triggers               │
     │                                      │ 3. onSnapshot triggers
     │                                      ├─> subscribeToMessages()
     │                                      │   ├─> New message received
     │                                      │   ├─> Updates messages state
     │                                      │   ├─> Displays in chat
     │                                      │   ├─> Increments unread count
     │                                      │   └─> Shows notification badge
     │                                      │
     │ 4. Message appears in chat           │ 4. Message appears in chat
     │                                      │
     │ 5. User B opens conversation         │
     │                                      ├─> markMessagesAsRead()
     │                                      │   ├─> Updates message.readBy
     │                                      │   ├─> Sets unreadCount to 0
     │                                      │   └─> Removes badge
```

---

## Real-time Updates

### Subscription Pattern

```typescript
// 1. Subscribe to conversations list
subscribeToConversations(userId, (conversations) => {
  // Updates whenever:
  // - New conversation created
  // - Last message updated
  // - Unread count changes
  setConversations(conversations);
});

// 2. Subscribe to messages in selected conversation
subscribeToMessages(conversationId, (messages) => {
  // Updates whenever:
  // - New message sent
  // - Message edited (future feature)
  // - Message deleted (future feature)
  setMessages(messages);
});

// 3. Subscribe to typing status
subscribeToTyping(conversationId, (typingUsers) => {
  // Updates whenever:
  // - User starts typing
  // - User stops typing
  setTypingUsers(typingUsers);
});
```

### Update Triggers

```
Firestore Change Event
         │
         ├─> Document Created
         │   └─> Triggers onSnapshot callback
         │
         ├─> Document Updated
         │   └─> Triggers onSnapshot callback
         │
         └─> Document Deleted
             └─> Triggers onSnapshot callback
```

---

## Functions and Responsibilities

### Core Functions in `app/lib/messaging.ts`

#### 1. `getOrCreateConversation()`
**Purpose**: Gets existing conversation or creates a new one

**Flow**:
```
Input: userId1, userId2, listingId?, listingName?
       │
       ├─> Query conversations where participants include userId1
       │
       ├─> Check if conversation with userId2 exists
       │   ├─> If yes → Return conversationId
       │   └─> If no → Continue
       │
       ├─> Query from other direction (userId2)
       │   ├─> If found → Return conversationId
       │   └─> If not → Create new
       │
       ├─> Get user names/photos from localStorage
       │
       └─> Create new conversation document
           └─> Return new conversationId
```

#### 2. `sendMessage()`
**Purpose**: Sends a message and updates conversation metadata

**Flow**:
```
Input: conversationId, senderId, text
       │
       ├─> Get sender info from localStorage
       │
       ├─> Get conversation document
       │   └─> Find other participant
       │
       ├─> Create message document
       │   ├─> conversationId
       │   ├─> senderId, senderName, senderPhoto
       │   ├─> text
       │   ├─> timestamp
       │   └─> read: false, readBy: {}
       │
       └─> Update conversation document
           ├─> lastMessage: text
           ├─> lastMessageTime: now
           ├─> updatedAt: now
           └─> unreadCount[otherParticipant]++
```

#### 3. `subscribeToMessages()`
**Purpose**: Real-time subscription to messages in a conversation

**Flow**:
```
Input: conversationId, callback
       │
       ├─> Create Firestore query
       │   ├─> where('conversationId', '==', conversationId)
       │   └─> orderBy('timestamp', 'asc')
       │
       ├─> If index missing → Fallback query (no orderBy)
       │
       ├─> Setup onSnapshot listener
       │
       └─> On update:
           ├─> Map documents to Message[]
           ├─> Sort by timestamp (if fallback)
           └─> Call callback(messages)
```

#### 4. `subscribeToConversations()`
**Purpose**: Real-time subscription to user's conversation list

**Flow**:
```
Input: userId, callback
       │
       ├─> Create Firestore query
       │   ├─> where('participants', 'array-contains', userId)
       │   └─> orderBy('updatedAt', 'desc')
       │
       ├─> If index missing → Fallback query (no orderBy)
       │
       ├─> Setup onSnapshot listener
       │
       └─> On update:
           ├─> Map documents to Conversation[]
           ├─> Update participantNames/photos from localStorage
           ├─> Sort by updatedAt (if fallback)
           └─> Call callback(conversations)
```

#### 5. `markMessagesAsRead()`
**Purpose**: Marks messages as read when user views conversation

**Flow**:
```
Input: conversationId, userId
       │
       ├─> Get all messages for conversation
       │
       ├─> Filter unread messages from other users
       │   ├─> senderId !== userId
       │   └─> !readBy[userId]
       │
       ├─> Update each unread message
       │   ├─> read: true
       │   └─> readBy[userId]: now
       │
       └─> Reset unreadCount[userId] = 0 in conversation
```

#### 6. `setTypingStatus()` & `subscribeToTyping()`
**Purpose**: Real-time typing indicators

**Flow**:
```
User starts typing
       │
       ├─> setTypingStatus(conversationId, userId, true)
       │   └─> Updates: conversations/{id}/typing/{userId}
       │       ├─> isTyping: true
       │       └─> timestamp: now
       │
       ├─> Firestore triggers subscription
       │
       └─> Other user's subscribeToTyping() receives update
           └─> Shows "User is typing..." indicator
```

---

## State Management

### Component State (`app/messages/page.tsx`)

```typescript
// Authentication
const [user, setUser] = useState<User | null>(null);

// Conversations
const [conversations, setConversations] = useState<Conversation[]>([]);
const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

// Messages
const [messages, setMessages] = useState<Message[]>([]);
const [messageText, setMessageText] = useState('');
const [previousMessageCount, setPreviousMessageCount] = useState<number>(0);

// UI State
const [participantInfo, setParticipantInfo] = useState<{id: string; name: string; photo: string | null} | null>(null);
const [typingUsers, setTypingUsers] = useState<string[]>([]);
const [isTyping, setIsTyping] = useState(false);
const [filter, setFilter] = useState<'all' | 'unread'>('all');
const [searchQuery, setSearchQuery] = useState('');
```

### State Flow Diagram

```
User Action
     │
     ├─> Updates Component State
     │   │
     │   ├─> setMessageText() ──> Input field updates
     │   ├─> setSelectedConversation() ──> Conversation selected
     │   └─> setMessages() ──> Messages list updates
     │
     └─> Calls Messaging Function
         │
         ├─> sendMessage() ──> Firestore Write
         ├─> setTypingStatus() ──> Firestore Write
         └─> markMessagesAsRead() ──> Firestore Update
             │
             └─> Firestore Triggers Subscription
                 │
                 └─> Updates Component State
                     └─> UI Re-renders
```

---

## Technical Details

### Error Handling

1. **Index Missing**: Falls back to queries without `orderBy`, sorts client-side
2. **Network Errors**: Subscription errors log to console, return empty arrays
3. **Authentication Errors**: Redirects to login or shows auth modal

### Performance Optimizations

1. **Debounced Typing**: 500ms delay before updating typing status
2. **Client-side Sorting**: Fallback when Firestore indexes aren't available
3. **Optimistic UI**: Input clears immediately on send, before Firestore confirms
4. **Conditional Scrolling**: Only scrolls on initial load or new messages

### LocalStorage Usage

```typescript
// User profile data
localStorage.getItem(`userData_${userId}`)
  └─> Contains: {firstName, lastName, displayName}

localStorage.getItem(`profilePhoto_${userId}`)
  └─> Contains: Avatar URL (DiceBear API)
```

### Security Considerations

1. **Firestore Security Rules**: Enforces user can only read/write their own conversations
2. **Authentication Required**: All operations require logged-in user
3. **Participant Validation**: Only conversation participants can send messages

---

## Integration Points

### 1. Venue Detail Page (`app/venue/[id]/page.tsx`)
- "Contact host" button initiates conversation
- Passes listing ID and name to conversation

### 2. Dashboard (`app/dashboard/page.tsx`)
- "Your Messages" section shows recent conversations
- Clicking conversation navigates to `/messages?conversationId={id}`

### 3. Navigation
- Messages link in header navigates to `/messages`
- URL parameters preserve selected conversation

---

## Future Enhancements

- [ ] Message editing
- [ ] Message deletion
- [ ] File/image attachments
- [ ] Push notifications
- [ ] Read receipts per message
- [ ] Message search
- [ ] Conversation archiving
- [ ] Block users
- [ ] Group conversations

---

## Summary

The messaging system follows a **real-time, event-driven architecture** using Firebase Firestore as the backend. Key characteristics:

1. **Real-time**: Uses `onSnapshot` for live updates
2. **Scalable**: Firestore handles concurrent users
3. **Optimistic**: UI updates immediately, syncs with backend
4. **Resilient**: Fallback queries handle missing indexes
5. **User-friendly**: Typing indicators, read receipts, unread counts

The architecture separates concerns with:
- **UI Layer**: React components (`app/messages/page.tsx`)
- **Business Logic**: Messaging functions (`app/lib/messaging.ts`)
- **Data Layer**: Firebase Firestore
- **State Management**: React hooks (useState, useEffect)

