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
  serverTimestamp,
  Timestamp,
  getDoc,
  setDoc,
  limit,
  and
} from 'firebase/firestore';
import { db } from '@/firebase';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderPhoto?: string;
  text: string;
  timestamp: Timestamp;
  read: boolean;
  readBy: Record<string, Timestamp>;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantPhotos: Record<string, string>;
  participantRoles: Record<string, 'host' | 'guest'>; // New: Track who is host vs guest
  lastMessage?: string;
  lastMessageTime?: Timestamp;
  listingId?: string;
  listingName?: string;
  listingPhoto?: string; // New: Listing thumbnail
  hostId?: string; // New: Explicitly track who is the listing owner
  unreadCount?: Record<string, number>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Get or create a conversation between two users
export async function getOrCreateConversation(
  userId1: string, 
  userId2: string, 
  listingId?: string,
  listingName?: string,
  hostId?: string // New parameter to explicitly identify the host
): Promise<string> {
  // EDGE CASE: Validate user IDs
  if (!userId1 || !userId2) {
    throw new Error('Both userId1 and userId2 are required');
  }

  // EDGE CASE: Self-messaging support (for testing)
  if (userId1 === userId2) {
    console.warn('Creating self-conversation for userId:', userId1);
  }

  const conversationsRef = collection(db, 'conversations');
  
  try {
    // Check if conversation exists - need to check both ways
    const q1 = query(
      conversationsRef,
      where('participants', 'array-contains', userId1)
    );
    
    const snapshot1 = await getDocs(q1);
    let existingConv = snapshot1.docs.find(doc => {
      const data = doc.data();
      return data.participants && 
             data.participants.includes(userId2) && 
             (!listingId || data.listingId === listingId);
    });
    
    if (existingConv) {
      console.log('Found existing conversation:', existingConv.id);
      return existingConv.id;
    }
    
    // Also check from the other direction (if different user)
    if (userId1 !== userId2) {
      const q2 = query(
        conversationsRef,
        where('participants', 'array-contains', userId2)
      );
      
      const snapshot2 = await getDocs(q2);
      existingConv = snapshot2.docs.find(doc => {
        const data = doc.data();
        return data.participants && 
               data.participants.includes(userId1) && 
               (!listingId || data.listingId === listingId);
      });
      
      if (existingConv) {
        console.log('Found existing conversation (reverse check):', existingConv.id);
        return existingConv.id;
      }
    }
    
    // Get user names and photos from localStorage
    const user1Name = getUserDisplayName(userId1);
    const user2Name = getUserDisplayName(userId2);
    const user1Photo = getUserPhoto(userId1);
    const user2Photo = getUserPhoto(userId2);
    
    // Determine who is the host
    const actualHostId = hostId || userId2; // Default to userId2 if not specified
    
    // Get listing photo if available
    let listingPhoto = '';
    if (listingId) {
      try {
        // Try to find the listing in localStorage to get its photo
        const hostListingsKey = `hostListings_${actualHostId}`;
        const hostListings = localStorage.getItem(hostListingsKey);
        if (hostListings) {
          const listings = JSON.parse(hostListings);
          const listing = listings.find((l: any) => l.id === listingId);
          if (listing?.photos?.length > 0) {
            const mainPhoto = listing.photos.find((p: any) => p.isMain) || listing.photos[0];
            listingPhoto = mainPhoto?.url || '';
          }
        }
      } catch (error) {
        console.warn('Could not load listing photo:', error);
      }
    }
    
    // Create new conversation
    const newConv = await addDoc(conversationsRef, {
      participants: [userId1, userId2],
      participantNames: {
        [userId1]: user1Name,
        [userId2]: user2Name,
      },
      participantPhotos: {
        [userId1]: user1Photo || '',
        [userId2]: user2Photo || '',
      },
      participantRoles: {
        [actualHostId]: 'host',
        [actualHostId === userId1 ? userId2 : userId1]: 'guest',
      },
      listingId: listingId || null,
      listingName: listingName || null,
      listingPhoto: listingPhoto || null,
      hostId: actualHostId,
      unreadCount: {
        [userId1]: 0,
        [userId2]: 0,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    console.log('Created new conversation:', newConv.id);
    return newConv.id;
  } catch (error: any) {
    console.error('Error in getOrCreateConversation:', error);
    throw error;
  }
}

// Send a message
export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string
): Promise<void> {
  // EDGE CASE: Validate inputs
  if (!conversationId || !conversationId.trim()) {
    throw new Error('Conversation ID is required');
  }
  if (!senderId || !senderId.trim()) {
    throw new Error('Sender ID is required');
  }
  if (!text || !text.trim()) {
    throw new Error('Message text cannot be empty');
  }

  // EDGE CASE: Validate message length (optional business logic)
  const trimmedText = text.trim();
  if (trimmedText.length > 10000) {
    console.warn('Message exceeds 10000 characters, will be sent as-is');
  }

  const messagesRef = collection(db, 'messages');
  const conversationRef = doc(db, 'conversations', conversationId);
  
  try {
    // Get sender info
    const senderName = getUserDisplayName(senderId);
    const senderPhoto = getUserPhoto(senderId);
    
    // Get conversation to find the other participant
    const convSnap = await getDoc(conversationRef);
    const convData = convSnap.data();
    
    if (!convData) {
      throw new Error('Conversation not found. Cannot send message.');
    }

    // EDGE CASE: Validate participants array exists
    if (!convData.participants || !Array.isArray(convData.participants)) {
      throw new Error('Invalid conversation structure: participants array missing');
    }

    // EDGE CASE: Verify sender is participant in this conversation
    if (!convData.participants.includes(senderId)) {
      throw new Error('You are not a participant in this conversation');
    }
    
    const otherParticipantId = convData.participants.find((id: string) => id !== senderId);
    
    // Add message with all required fields
    const messageDoc = await addDoc(messagesRef, {
      conversationId,
      senderId,
      senderName: senderName || 'Unknown User',
      senderPhoto: senderPhoto || '',
      text: trimmedText,
      timestamp: serverTimestamp(),
      read: false,
      readBy: {},
    });
    
    console.log('Message sent successfully:', {
      messageId: messageDoc.id,
      senderId,
      conversationId,
      textLength: trimmedText.length,
    });
    
    // Update conversation
    const updateData: any = {
      lastMessage: trimmedText,
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    // EDGE CASE: Only increment unread for other participant (not self-messages)
    if (otherParticipantId && otherParticipantId !== senderId) {
      const currentUnreadCount = convData.unreadCount?.[otherParticipantId] || 0;
      updateData[`unreadCount.${otherParticipantId}`] = currentUnreadCount + 1;
    } else if (!otherParticipantId) {
      // Self-messaging case (for testing) - don't increment unread
      console.warn('Self-messaging detected - unread count not incremented');
    }
    
    await updateDoc(conversationRef, updateData);
    console.log('Conversation updated:', { conversationId, hasOtherParticipant: !!otherParticipantId });
  } catch (error: any) {
    console.error('Error in sendMessage:', error);
    // Re-throw with context
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied: Check Firestore security rules');
    } else if (error.code === 'not-found') {
      throw new Error('Conversation no longer exists');
    }
    throw error;
  }
}

// Subscribe to messages in a conversation (real-time)
export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): () => void {
  const messagesRef = collection(db, 'messages');
  
  // Try with orderBy first (for chronological order)
  let q = query(
    messagesRef,
    where('conversationId', '==', conversationId),
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[];
    
    // Sort messages by timestamp in case orderBy failed
    messages.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return a.timestamp.toMillis() - b.timestamp.toMillis();
    });
    
    console.log('Messages received from Firestore:', messages.length, 'messages for conversation:', conversationId);
    if (messages.length > 0) {
      console.log('Sample message:', messages[0]);
    }
    callback(messages);
  }, (error) => {
    console.error('Error subscribing to messages:', error);
    // If there's an index error, try without orderBy as fallback
    if (error.code === 'failed-precondition') {
      console.warn('Firestore index required for optimal performance. Using fallback query without orderBy.');
      console.warn('Please create the index using the link provided in the error message.');
      
      // Fallback: query without orderBy and sort in code
      const fallbackQ = query(
        messagesRef,
        where('conversationId', '==', conversationId)
      );
      
      const unsubscribe = onSnapshot(fallbackQ, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];
        
        // Sort by timestamp in code
        messages.sort((a, b) => {
          if (!a.timestamp || !b.timestamp) return 0;
          return a.timestamp.toMillis() - b.timestamp.toMillis();
        });
        
        console.log('Messages received (fallback query):', messages.length);
        callback(messages);
      }, (fallbackError) => {
        console.error('Fallback query also failed:', fallbackError);
        callback([]);
      });
      
      return unsubscribe;
    }
    // For other errors, return empty array
    callback([]);
    return () => {}; // Return empty unsubscribe function
  });
}

// Subscribe to user's conversations (real-time)
export function subscribeToConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
): () => void {
  const conversationsRef = collection(db, 'conversations');
  
  // Try with orderBy first (for chronological order)
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, async (snapshot) => {
    const conversations = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        // Update participant names and photos from localStorage if missing
        const updatedNames = { ...data.participantNames };
        const updatedPhotos = { ...data.participantPhotos };
        
        data.participants.forEach((participantId: string) => {
          if (!updatedNames[participantId]) {
            updatedNames[participantId] = getUserDisplayName(participantId);
          }
          if (!updatedPhotos[participantId]) {
            updatedPhotos[participantId] = getUserPhoto(participantId) || '';
          }
        });
        
        return {
          id: doc.id,
          ...data,
          participantNames: updatedNames,
          participantPhotos: updatedPhotos,
        };
      })
    );
    
    // Sort by updatedAt in case orderBy failed
    conversations.sort((a: any, b: any) => {
      if (!a.updatedAt || !b.updatedAt) return 0;
      return b.updatedAt.toMillis() - a.updatedAt.toMillis();
    });
    
    callback(conversations as Conversation[]);
  }, (error) => {
    console.error('Error subscribing to conversations:', error);
    
    // If there's an index error, try without orderBy as fallback
    if (error.code === 'failed-precondition') {
      console.warn('Firestore index required for optimal performance. Using fallback query without orderBy.');
      console.warn('Please create the index using the link provided in the error message.');
      
      // Fallback: query without orderBy and sort in code
      const fallbackQ = query(
        conversationsRef,
        where('participants', 'array-contains', userId)
      );
      
      const unsubscribe = onSnapshot(fallbackQ, async (snapshot) => {
        const conversations = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            // Update participant names and photos from localStorage if missing
            const updatedNames = { ...data.participantNames };
            const updatedPhotos = { ...data.participantPhotos };
            
            data.participants.forEach((participantId: string) => {
              if (!updatedNames[participantId]) {
                updatedNames[participantId] = getUserDisplayName(participantId);
              }
              if (!updatedPhotos[participantId]) {
                updatedPhotos[participantId] = getUserPhoto(participantId) || '';
              }
            });
            
            return {
              id: doc.id,
              ...data,
              participantNames: updatedNames,
              participantPhotos: updatedPhotos,
            };
          })
        );
        
        // Sort by updatedAt in code (descending - most recent first)
        conversations.sort((a: any, b: any) => {
          if (!a.updatedAt || !b.updatedAt) return 0;
          return b.updatedAt.toMillis() - a.updatedAt.toMillis();
        });
        
        console.log('Conversations received (fallback query):', conversations.length);
        callback(conversations as Conversation[]);
      }, (fallbackError) => {
        console.error('Fallback query also failed:', fallbackError);
        callback([]);
      });
      
      return unsubscribe;
    }
    
    // For other errors, return empty array
    callback([]);
    return () => {}; // Return empty unsubscribe function
  });
}

// Mark messages as read
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  try {
    const messagesRef = collection(db, 'messages');
    const conversationRef = doc(db, 'conversations', conversationId);
    
    // First, get all messages for the conversation
    // We'll filter by senderId in code instead of in the query to avoid index requirement
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );
    
    const snapshot = await getDocs(q).catch((error) => {
      // If index error, try without orderBy
      if (error.code === 'failed-precondition') {
        console.warn('Index not found, querying without orderBy');
        const q2 = query(
          messagesRef,
          where('conversationId', '==', conversationId)
        );
        return getDocs(q2);
      }
      throw error;
    });
    
    // Filter unread messages from other users in code
    const unreadMessages = snapshot.docs.filter(doc => {
      const data = doc.data();
      return data.senderId !== userId && (!data.readBy || !data.readBy[userId]);
    });
    
    // Update all unread messages
    if (unreadMessages.length > 0) {
      await Promise.all(unreadMessages.map(doc => {
        const messageData = doc.data();
        return updateDoc(doc.ref, {
          read: true,
          readBy: {
            ...messageData.readBy,
            [userId]: serverTimestamp(),
          },
        });
      }));
    }
    
    // Reset unread count for this user
    const convSnap = await getDoc(conversationRef);
    const convData = convSnap.data();
    
    if (convData) {
      await updateDoc(conversationRef, {
        [`unreadCount.${userId}`]: 0,
      });
    }
  } catch (error: any) {
    // Log error but don't throw - marking as read is not critical
    console.error('Error marking messages as read:', error);
    if (error.code === 'failed-precondition') {
      console.warn('Firestore index required for optimal performance. Please create the index.');
    }
  }
}

// Helper function to get listing owner from localStorage
function getListingOwner(listingId: string): { hostId: string | null; hostName: string | null } {
  if (!listingId) return { hostId: null, hostName: null };
  
  try {
    // Search through all hostListings to find the owner
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('hostListings_')) {
        const hostId = key.replace('hostListings_', '');
        const listings = JSON.parse(localStorage.getItem(key) || '[]');
        const listing = listings.find((l: any) => l.id === listingId);
        if (listing) {
          const hostName = getUserDisplayName(hostId);
          return { hostId, hostName };
        }
      }
    }
  } catch (error) {
    console.warn('Error finding listing owner:', error);
  }
  
  return { hostId: null, hostName: null };
}

// Helper function to get user display name from localStorage
function getUserDisplayName(userId: string): string {
  if (!userId) return 'Unknown User';
  
  try {
    const userDataStr = localStorage.getItem(`userData_${userId}`);
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      if (userData.firstName && userData.lastName) {
        return `${userData.firstName} ${userData.lastName}`;
      }
      if (userData.displayName) {
        return userData.displayName;
      }
      // EDGE CASE: Missing user data - use email as fallback
      if (userData.email) {
        return userData.email.split('@')[0];
      }
    }
    return 'User';
  } catch (e) {
    console.warn('Error parsing user data for userId:', userId, e);
    return 'User';
  }
}

// Helper function to get user photo from localStorage
function getUserPhoto(userId: string): string | null {
  if (!userId) return null;
  
  try {
    const photo = localStorage.getItem(`profilePhoto_${userId}`);
    return photo || null;
  } catch (e) {
    console.warn('Error retrieving user photo for userId:', userId, e);
    return null;
  }
}

// Get participant info (for display)
export function getParticipantInfo(conversation: Conversation, currentUserId: string) {
  if (!conversation || !conversation.participants) {
    console.warn('Invalid conversation passed to getParticipantInfo');
    return null;
  }

  const otherParticipantId = conversation.participants.find(id => id !== currentUserId);
  if (!otherParticipantId) {
    // EDGE CASE: Self-messaging or empty participants
    console.warn('No other participant found in conversation');
    return {
      id: currentUserId,
      name: conversation.participantNames?.[currentUserId] || 'You',
      photo: conversation.participantPhotos?.[currentUserId] || null,
    };
  }
  
  return {
    id: otherParticipantId,
    name: conversation.participantNames?.[otherParticipantId] || 'Deleted User',
    photo: conversation.participantPhotos?.[otherParticipantId] || null,
  };
}

// Get unread message count for a user across all conversations
export async function getUnreadMessageCount(userId: string): Promise<number> {
  if (!userId) return 0;
  
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId)
    );
    
    const snapshot = await getDocs(q);
    let totalUnread = 0;
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const unreadCount = data.unreadCount?.[userId] || 0;
      totalUnread += unreadCount;
    });
    
    return totalUnread;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

// Subscribe to unread message count changes
export function subscribeToUnreadCount(
  userId: string,
  callback: (count: number) => void
): () => void {
  if (!userId) {
    callback(0);
    return () => {};
  }
  
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    let totalUnread = 0;
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const unreadCount = data.unreadCount?.[userId] || 0;
      totalUnread += unreadCount;
    });
    
    callback(totalUnread);
  }, (error) => {
    console.error('Error subscribing to unread count:', error);
    callback(0);
  });
}

// Typing indicator functions
export async function setTypingStatus(
  conversationId: string,
  userId: string,
  isTyping: boolean
): Promise<void> {
  // EDGE CASE: Validate inputs
  if (!conversationId || !userId) {
    console.warn('Invalid conversationId or userId for typing status');
    return;
  }

  try {
    const typingRef = doc(db, 'conversations', conversationId, 'typing', userId);
    
    await setDoc(typingRef, {
      userId,
      isTyping: isTyping === true, // Ensure boolean
      timestamp: serverTimestamp(),
    }, { merge: true });
    
    console.log('Typing status updated:', { conversationId, userId, isTyping });
  } catch (error: any) {
    console.error('Error setting typing status:', error);
    // Don't throw - typing status is not critical to message delivery
  }
}

// Subscribe to typing status
export function subscribeToTyping(
  conversationId: string,
  callback: (typingUsers: string[]) => void
): () => void {
  if (!conversationId) {
    console.warn('Invalid conversationId for typing subscription');
    return () => {}; // Return empty unsubscribe function
  }

  const typingRef = collection(db, 'conversations', conversationId, 'typing');
  
  return onSnapshot(typingRef, (snapshot) => {
    const typingUsers = snapshot.docs
      .filter(doc => {
        const data = doc.data();
        return data.isTyping === true; // Explicit true check
      })
      .map(doc => doc.data().userId)
      .filter(userId => userId); // Filter out empty user IDs
    
    callback(typingUsers);
  }, (error) => {
    console.error('Error subscribing to typing status:', error);
    // Don't throw - provide empty array on error
    callback([]);
  });
}

