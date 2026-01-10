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
  lastMessage?: string;
  lastMessageTime?: Timestamp;
  listingId?: string;
  listingName?: string;
  unreadCount?: Record<string, number>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Get or create a conversation between two users
export async function getOrCreateConversation(
  userId1: string, 
  userId2: string, 
  listingId?: string,
  listingName?: string
): Promise<string> {
  const conversationsRef = collection(db, 'conversations');
  
  // Check if conversation exists - need to check both ways
  const q1 = query(
    conversationsRef,
    where('participants', 'array-contains', userId1)
  );
  
  const snapshot1 = await getDocs(q1);
  let existingConv = snapshot1.docs.find(doc => {
    const data = doc.data();
    return data.participants.includes(userId2) && 
           (!listingId || data.listingId === listingId);
  });
  
  if (existingConv) {
    return existingConv.id;
  }
  
  // Also check from the other direction
  const q2 = query(
    conversationsRef,
    where('participants', 'array-contains', userId2)
  );
  
  const snapshot2 = await getDocs(q2);
  existingConv = snapshot2.docs.find(doc => {
    const data = doc.data();
    return data.participants.includes(userId1) && 
           (!listingId || data.listingId === listingId);
  });
  
  if (existingConv) {
    return existingConv.id;
  }
  
  // Get user names from localStorage
  const user1Name = getUserDisplayName(userId1);
  const user2Name = getUserDisplayName(userId2);
  const user1Photo = getUserPhoto(userId1);
  const user2Photo = getUserPhoto(userId2);
  
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
    listingId: listingId || null,
    listingName: listingName || null,
    unreadCount: {
      [userId1]: 0,
      [userId2]: 0,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return newConv.id;
}

// Send a message
export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string
): Promise<void> {
  const messagesRef = collection(db, 'messages');
  const conversationRef = doc(db, 'conversations', conversationId);
  
  // Get sender info
  const senderName = getUserDisplayName(senderId);
  const senderPhoto = getUserPhoto(senderId);
  
  // Get conversation to find the other participant
  const convSnap = await getDoc(conversationRef);
  const convData = convSnap.data();
  
  if (!convData) {
    throw new Error('Conversation not found');
  }
  
  const otherParticipantId = convData.participants.find((id: string) => id !== senderId);
  
  // Add message
  const messageDoc = await addDoc(messagesRef, {
    conversationId,
    senderId,
    senderName,
    senderPhoto: senderPhoto || '',
    text,
    timestamp: serverTimestamp(),
    read: false,
    readBy: {},
  });
  
  console.log('Message sent:', messageDoc.id, text);
  
  // Update conversation
  const updateData: any = {
    lastMessage: text,
    lastMessageTime: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  // Increment unread count for the other participant (if exists and not messaging yourself)
  if (otherParticipantId && otherParticipantId !== senderId) {
    updateData[`unreadCount.${otherParticipantId}`] = (convData.unreadCount?.[otherParticipantId] || 0) + 1;
  }
  
  await updateDoc(conversationRef, updateData);
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

// Helper function to get user display name from localStorage
function getUserDisplayName(userId: string): string {
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
    }
    return 'User';
  } catch (e) {
    return 'User';
  }
}

// Helper function to get user photo from localStorage
function getUserPhoto(userId: string): string | null {
  try {
    return localStorage.getItem(`profilePhoto_${userId}`);
  } catch (e) {
    return null;
  }
}

// Get participant info (for display)
export function getParticipantInfo(conversation: Conversation, currentUserId: string) {
  const otherParticipantId = conversation.participants.find(id => id !== currentUserId);
  if (!otherParticipantId) return null;
  
  return {
    id: otherParticipantId,
    name: conversation.participantNames[otherParticipantId] || 'User',
    photo: conversation.participantPhotos[otherParticipantId] || null,
  };
}

// Typing indicator functions
export async function setTypingStatus(
  conversationId: string,
  userId: string,
  isTyping: boolean
): Promise<void> {
  const typingRef = doc(db, 'conversations', conversationId, 'typing', userId);
  
  if (isTyping) {
    await setDoc(typingRef, {
      userId,
      isTyping: true,
      timestamp: serverTimestamp(),
    }, { merge: true });
  } else {
    await setDoc(typingRef, {
      userId,
      isTyping: false,
      timestamp: serverTimestamp(),
    }, { merge: true });
  }
}

// Subscribe to typing status
export function subscribeToTyping(
  conversationId: string,
  callback: (typingUsers: string[]) => void
): () => void {
  const typingRef = collection(db, 'conversations', conversationId, 'typing');
  
  return onSnapshot(typingRef, (snapshot) => {
    const typingUsers = snapshot.docs
      .filter(doc => doc.data().isTyping === true)
      .map(doc => doc.data().userId);
    callback(typingUsers);
  }, (error) => {
    console.error('Error subscribing to typing status:', error);
  });
}

