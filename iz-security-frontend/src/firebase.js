import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBpT4Rr0QkgfJhwKX_-9G3V2jdPasof7BQ",
  authDomain: "iz-security-system-8c11f.firebaseapp.com",
  projectId: "iz-security-system-8c11f",
  storageBucket: "iz-security-system-8c11f.firebasestorage.app",
  messagingSenderId: "879603630025",
  appId: "1:879603630025:web:376f253574539499f43218",
  measurementId: "G-RYDRBDRHCG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
