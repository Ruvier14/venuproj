import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { app } from '@/firebase';

const db = getFirestore(app);

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  birthDate: {
    month: number;
    day: number;
    year: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export async function createUserProfile(uid: string, userData: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const now = new Date();
    
    await setDoc(userRef, {
      ...userData,
      createdAt: now,
      updatedAt: now,
    }, { merge: false }); // merge: false means it will fail if user already exists
    
    console.log('User profile created successfully');
  } catch (error: any) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile');
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    return null;
  }
}
