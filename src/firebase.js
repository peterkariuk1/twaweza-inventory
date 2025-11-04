// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDCG8aKdxv0N2VNvpCSTGtOgbcG0VbsMr4",
  authDomain: "twaweza-65a40.firebaseapp.com",
  projectId: "twaweza-65a40",
  storageBucket: "twaweza-65a40.firebasestorage.app",
  messagingSenderId: "536311719107",
  appId: "1:536311719107:web:078f04690d254a31062e76",
  measurementId: "G-32M9SFBNZ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);