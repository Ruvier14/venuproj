// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getAnalytics, Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDebebuZpQSlxgNsxYbAYUbKyBtxBKbTIQ",
  authDomain: "venu-5c409.firebaseapp.com",
  projectId: "venu-5c409",
  storageBucket: "venu-5c409.firebasestorage.app",
  messagingSenderId: "25894961406",
  appId: "1:25894961406:web:dff6707129d702473c65af",
  measurementId: "G-DYESGX5XTE"
};

// Initialize Firebase
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth: Auth = getAuth(app);

// Initialize Analytics only on client side
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };