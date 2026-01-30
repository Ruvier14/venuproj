// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDPjCWL6qLGW8LYq5rU7pMzhhBuE61cLFU",
  authDomain: "venu-40e32.firebaseapp.com",
  projectId: "venu-40e32",
  storageBucket: "venu-40e32.firebasestorage.app",
  messagingSenderId: "368791864104",
  appId: "1:368791864104:web:3a811ab7faa40bc770861d",
  measurementId: "G-M20TE6CM3J"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Only initialize analytics in the browser
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export const auth = getAuth(app);
export const db = getFirestore(app);