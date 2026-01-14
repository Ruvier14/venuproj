# Messaging System Testing & Edge Cases Guide

## Overview
This document provides comprehensive testing strategies and edge case scenarios for the bidirectional messaging system between vendors (hosts) and users (guests).

---

## Architecture Summary

### Key Points
- ✅ **Role-Agnostic**: Both hosts and guests use the same `/messages` page
- ✅ **Bidirectional**: Both parties can send/receive messages via the same Firestore queries
- ✅ **Real-time**: Uses `onSnapshot` listeners for instant message delivery
- ✅ **Conversation-Based**: Messages are stored in a conversation document with both participants

### How Bidirectional Messaging Works
1. When User A sends a message to User B:
   - `sendMessage()` adds message to `/messages` collection
   - Updates conversation document (lastMessage, unreadCount for User B)
   - Both users are subscribed to the same conversation via `subscribeToMessages()`
   - User B's listener receives the new message instantly

2. When User B replies:
   - Same process happens in reverse
   - User A's listener receives the message
   - Conversation updates visible to both

---

## Test Cases

### 1. Basic Bidirectional Messaging

#### Test 1.1: Simple Message Exchange
```
Scenario: Guest sends message, Host receives it and replies
Steps:
1. Open two browser windows (or incognito windows)
2. Login Guest in Window 1
3. Login Host in Window 2
4. Guest navigates to venue detail page
5. Guest clicks "Contact Host" → Creates/opens conversation
6. Guest types message: "Hi, interested in your venue"
7. Guest clicks Send

Expected Result in Window 2:
- Host sees new message instantly (no refresh needed)
- Message appears in conversation thread
- Unread count badge updates
- Message shows Guest's name and photo

8. Host types reply: "Great! Let me know your event date"
9. Host clicks Send

Expected Result in Window 1:
- Guest sees reply instantly
- Message thread updates
- Both messages maintain correct order
- Read status may update (check readBy field)
```

**Validation Checklist:**
- [ ] Guest can send message
- [ ] Host receives message in real-time (within 2 seconds)
- [ ] Message contains correct senderId, senderName, senderPhoto
- [ ] Conversation unreadCount increments for Host
- [ ] Host can send reply
- [ ] Guest receives reply in real-time
- [ ] Both users see correct message order
- [ ] Message timestamps are correct

---

### 2. Unread Count Management

#### Test 2.1: Unread Count Increments
```
Scenario: Track unread message count accuracy
Steps:
1. Guest and Host have existing conversation
2. Guest sends 3 messages while Host window is closed/not focused
3. Host returns to messages page

Expected Result:
- Unread count shows "3" in conversation header or badge
- After Host clicks on conversation, unreadCount should reset to 0
- Unread count persists in Firestore (check conversations collection)
```

**Validation:**
- [ ] Unread count increments with each message
- [ ] Unread count specific to each user (not shared)
- [ ] markMessagesAsRead() updates readBy field
- [ ] Read count resets when user opens conversation
- [ ] Closing conversation without opening doesn't reset count

---

### 3. Message Ordering & Timestamps

#### Test 3.1: Chronological Order
```
Scenario: Verify messages appear in correct timestamp order
Steps:
1. Rapid fire: Guest sends 5 messages in quick succession (< 1 second apart)
2. Check message order on both ends

Expected Result:
- Messages appear in chronological order
- No out-of-order messages
- Timestamps reflect actual send time (server timestamp)
```

**Validation:**
- [ ] Messages sort by timestamp ascending (oldest first)
- [ ] No duplicate messages
- [ ] Timestamps are consistent across both users
- [ ] Server timestamp used (not client time)

---

### 4. Typing Indicators

#### Test 4.1: Typing Status Display
```
Scenario: Typing indicator shows when user is typing
Steps:
1. Host has messages conversation open
2. Guest starts typing in message input (but doesn't send)
3. Host should see "User is typing..." indicator

Expected Result:
- Host sees typing indicator within 1 second
- Indicator remains while Guest types
- Indicator disappears when Guest:
  - Stops typing for 3+ seconds, OR
  - Sends the message, OR
  - Closes the conversation
```

**Validation:**
- [ ] Typing indicator displays for other user
- [ ] Indicator doesn't show for current user's own typing
- [ ] Indicator clears after 3 seconds of inactivity
- [ ] Indicator clears on message send
- [ ] Typing status cleanup on component unmount

---

### 5. Network & Error Handling

#### Test 5.1: Message Send Failure Recovery
```
Scenario: Simulate network error during message send
Steps:
1. Open browser DevTools → Network tab
2. Set network to "Offline"
3. User tries to send message
4. Expected: Message send fails with error message
5. Restore network connection
6. User re-sends message

Expected Result:
- Original offline message shows error
- New message sends successfully
- No duplicate messages
- User gets clear error feedback
```

**Validation:**
- [ ] Send fails gracefully when offline
- [ ] Error message displayed to user
- [ ] Message text preserved (not cleared on error)
- [ ] No duplicate messages on retry
- [ ] Connection restored = messages sync

#### Test 5.2: Permission Denied Error
```
Scenario: Test Firestore security rules enforcement
Steps:
1. Create rule that denies message sending from specific user
2. That user tries to send message
3. Check browser console for error

Expected Result:
- Send fails with "permission-denied" error
- User sees alert: "Permission denied. Please check Firestore security rules."
- Message text preserved
```

**Validation:**
- [ ] Permission errors caught and displayed
- [ ] Security rules enforced correctly
- [ ] No silent failures

---

### 6. Conversation Management

#### Test 6.1: Create New Conversation
```
Scenario: Test conversation creation and persistence
Steps:
1. Host: Login as Host A
2. Guest: Login as Guest B
3. Guest: Navigate to Host A's venue page
4. Guest: Click "Contact Host"
5. System calls getOrCreateConversation(hostId, guestId)

Expected Result:
- New conversation document created in Firestore
- Participants array contains both user IDs
- participantNames and participantPhotos populated
- createdAt timestamp set
- redirects to /messages?conversationId={id}
```

**Validation:**
- [ ] Conversation created with both participants
- [ ] Conversation has unique ID
- [ ] Names and photos populated
- [ ] Correct unreadCount structure: `{hostId: 0, guestId: 0}`
- [ ] Timestamps set correctly

#### Test 6.2: Existing Conversation Reuse
```
Scenario: Don't create duplicate conversations
Steps:
1. Guest and Host already have conversation
2. Guest clicks "Contact Host" on venue again
3. System calls getOrCreateConversation() with same users

Expected Result:
- Existing conversation returned (same ID)
- No new conversation created
- User redirected to existing conversation
```

**Validation:**
- [ ] No duplicate conversations created
- [ ] Existing conversation reused
- [ ] Same conversationId returned

---

### 7. Edge Cases

#### Edge Case 7.1: Self-Messaging (Testing Only)
```
Scenario: User sends message to themselves (for testing)
Steps:
1. Create conversation with same user ID twice
2. Send message in that conversation

Expected Result:
- Message sends successfully (for testing purposes)
- Unread count doesn't increment (shouldn't count self as unread)
- Can view own message thread
```

**Validation:**
- [ ] Self-messaging supported for testing
- [ ] Unread count logic handles self-messaging
- [ ] No errors with single participant

#### Edge Case 7.2: Deleted User Handling
```
Scenario: What happens when conversation participant's account is deleted
Steps:
1. Guest and Host have conversation
2. Guest account is deleted from Firebase Auth
3. Host tries to view conversation

Expected Result:
- Host can still view message history
- Participant name shows "Deleted User" or cached name
- No errors when fetching conversation
- Host cannot send new messages to deleted user (optional business logic)
```

**Validation:**
- [ ] App doesn't crash if user deleted
- [ ] Graceful fallback for deleted user info
- [ ] Conversation history preserved
- [ ] Clear messaging about deleted account

#### Edge Case 7.3: Missing Data in Conversation
```
Scenario: Handle malformed conversation documents
Steps:
1. Manually edit conversation doc in Firestore (remove participantPhotos)
2. User opens that conversation in app
3. App attempts to display conversation

Expected Result:
- App doesn't crash
- Missing participant photo shows default avatar
- Participant name still displays
- Messages still load
```

**Validation:**
- [ ] Null checks for optional fields
- [ ] Graceful degradation for missing data
- [ ] Defaults applied (empty string for photo, "User" for name)

#### Edge Case 7.4: Rapid Message Sending
```
Scenario: User sends 10 messages in rapid succession
Steps:
1. User types 10 messages
2. Sends them rapidly (< 100ms apart)
3. Check both user's view

Expected Result:
- All 10 messages appear
- No dropped messages
- Correct chronological order
- No duplicates
```

**Validation:**
- [ ] All messages received
- [ ] No message loss
- [ ] Correct ordering maintained
- [ ] No duplicates

#### Edge Case 7.5: Very Long Message Content
```
Scenario: Send message with 5000+ characters
Steps:
1. User composes long message (copy-paste large text)
2. Sends message
3. Both users view the message

Expected Result:
- Message sends without error
- Full message content preserved
- Displays correctly on both ends
- No truncation
```

**Validation:**
- [ ] Long messages handled
- [ ] No character limit enforced (unless intentional)
- [ ] Message content preserved completely
- [ ] UI wraps text correctly

#### Edge Case 7.6: Special Characters & Emoji
```
Scenario: Send message with special characters and emoji
Steps:
1. User types: "Hey! 🎉 How's venue looking? Cost: $500"
2. Sends message
3. Both users view

Expected Result:
- Emoji displays correctly
- Special characters preserved
- Currency symbols work
- Quotes and punctuation intact
```

**Validation:**
- [ ] Emoji renders correctly
- [ ] Unicode characters preserved
- [ ] Special characters escaped properly
- [ ] No encoding issues

#### Edge Case 7.7: Concurrent Edits
```
Scenario: Two users send message simultaneously
Steps:
1. Guest window: Typing message A
2. Host window: Typing message B
3. Both click Send within 100ms of each other
4. Both windows refresh

Expected Result:
- Both messages appear
- Correct chronological order
- No message loss
- No conflicts
```

**Validation:**
- [ ] No message loss on concurrent sends
- [ ] Ordering preserved via serverTimestamp
- [ ] No database conflicts
- [ ] Both participants see both messages

#### Edge Case 7.8: Reconnect After Network Dropout
```
Scenario: User loses connection mid-operation
Steps:
1. User in conversation with listener active
2. Network goes offline for 30 seconds
3. Network comes back online
4. Host sends message while guest was offline
5. Guest reconnects

Expected Result:
- Guest's listener re-establishes
- Guest sees messages from while offline
- No message loss
- No errors on console
```

**Validation:**
- [ ] Listener reconnects automatically
- [ ] Missed messages fetched/displayed
- [ ] No duplicate messages on reconnect
- [ ] Smooth experience on reconnect

---

## Performance Testing

### Test 8.1: Load Test - High Message Volume
```
Scenario: Conversation with 500+ messages
Steps:
1. Load conversation with 500 historical messages
2. Scroll through message history
3. Add new message

Expected Result:
- Loads within 3 seconds
- Scrolling smooth (no lag)
- New message appears instantly
- No memory leaks
```

### Test 8.2: Many Concurrent Conversations
```
Scenario: User with 50+ conversations
Steps:
1. User opens messages page
2. Load all 50 conversations
3. Switch between conversations rapidly

Expected Result:
- Page loads in < 2 seconds
- Switching is responsive (< 500ms)
- No memory issues
- All unread counts correct
```

---

## Manual Testing Checklist

### Before Each Release
- [ ] Bidirectional message sending works (both directions)
- [ ] Real-time message delivery (< 2 second latency)
- [ ] Unread counts accurate and persistent
- [ ] Typing indicators display correctly
- [ ] Conversation list updates in real-time
- [ ] Message ordering correct (chronological)
- [ ] Read receipts/readBy updates
- [ ] Handles network errors gracefully
- [ ] No console errors during messaging
- [ ] Mobile responsive (if applicable)
- [ ] Handles deleted users gracefully
- [ ] Performance acceptable with many messages

### Debug Logging to Enable
In `app/lib/messaging.ts`:
```typescript
// Already enabled:
console.log('Message sent:', messageDoc.id, text);
console.log('Messages received from Firestore:', messages.length);
console.log('Conversations received (fallback query):', conversations.length);

// Check DevTools Console during testing for these messages
```

In `app/messages/page.tsx`:
```typescript
// Already enabled:
console.log('Sending message:', messageToSend, 'to conversation:', selectedConversation.id);
console.log('Message sent successfully');
console.log('Error sending message:', error);

// Enable more detailed logging if needed:
// Uncomment selective logs in handleSendMessage and useEffect hooks
```

---

## Firestore Query Validation

### Check Your Indexes
The messaging system requires these Firestore indexes:

1. **Messages Index** (for messages/page.tsx)
   ```
   Collection: messages
   Fields: conversationId (Ascending), timestamp (Ascending)
   ```

2. **Conversations Index**
   ```
   Collection: conversations
   Fields: participants (Array), updatedAt (Descending)
   ```

### Validate Index Creation
```
1. Go to Firebase Console → Firestore → Indexes
2. Confirm both composite indexes exist
3. Status should be "Enabled" (not "Building...")
4. If status is "Building...", wait for completion
```

---

## Troubleshooting Guide

### Issue: Messages not appearing for other user
**Possible Causes:**
1. Firestore index still building → Wait for "Enabled" status
2. User not subscribed to conversation → Check `subscribeToMessages()` listener active
3. Security rules blocking reads → Verify Firestore rules allow both users to read

**Debug Steps:**
```typescript
// Check in browser console:
1. Verify conversation ID is same for both users
2. Check subscribeToMessages callback is firing:
   - Should log "Messages received" on any new message
3. Check Firestore rules in console:
   - Attempt read and check permission error
```

### Issue: Unread count not updating
**Possible Causes:**
1. `sendMessage()` not incrementing unreadCount
2. `markMessagesAsRead()` not called when opening conversation
3. Listener not subscribed to conversation updates

**Debug:**
```typescript
// In sendMessage(), verify this code runs:
if (otherParticipantId && otherParticipantId !== senderId) {
  updateData[`unreadCount.${otherParticipantId}`] = 
    (convData.unreadCount?.[otherParticipantId] || 0) + 1;
}

// Check Firestore console - unreadCount field should increment
```

### Issue: Typing indicator not working
**Possible Causes:**
1. Firestore doesn't have typing subcollection permissions
2. subscribeToTyping() listener not active
3. Cleanup not removing typing status on unmount

**Debug:**
```typescript
// Check in Firestore console:
conversations/{conversationId}/typing/{userId} documents

// Verify typing status updates when typing:
setDoc() should create these documents with isTyping=true
```

### Issue: Message order incorrect
**Possible Causes:**
1. serverTimestamp not used → Using client time instead
2. Messages query not ordered by timestamp
3. Manual sort not working with Timestamp objects

**Debug:**
```typescript
// Verify in messages:
timestamp: serverTimestamp() // Always use this, not Date.now()

// Verify in query:
orderBy('timestamp', 'asc') // Should be in query

// Verify sort in code:
messages.sort((a, b) => 
  a.timestamp.toMillis() - b.timestamp.toMillis()
)
```

---

## Summary

This messaging system is designed to be **bidirectional, real-time, and role-agnostic**. Both guests and vendors use the same `/messages` page and see the same conversation threads. Success depends on:

1. ✅ Both users subscribed to same conversation listeners
2. ✅ Firestore indexes enabled and "Enabled" status
3. ✅ Security rules allowing both users to read/write
4. ✅ Network connectivity and real-time listener stability
5. ✅ Proper error handling for edge cases

Test systematically, check console logs, and verify Firestore collections during testing.
