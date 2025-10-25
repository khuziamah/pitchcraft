// src/firebase.js

// Step 1: Zaroori cheezein import karein (Analytics ki zaroorat nahin hai)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";       // <-- Yeh zaroori hai
import { getFirestore } from "firebase/firestore"; // <-- Yeh zaroori hai

// Step 2: Aapka Firebase project ka configuration object
const firebaseConfig = {
  apiKey: "AIzaSyCcTTXf4-V-osb3x3G97nPuCrfCU5svl1s",
  authDomain: "new-app-3f941.firebaseapp.com",
  projectId: "new-app-3f941",
  storageBucket: "new-app-3f941.appspot.com", // Maine isko theek kar diya hai
  messagingSenderId: "533911762683",
  appId: "1:533911762683:web:996ecaccd910baee39225e",
  measurementId: "G-MENJ11P946"
};

// Step 3: Firebase app ko initialize karein
const app = initializeApp(firebaseConfig);

// Step 4: Authentication aur Firestore ki services ko hasil karein
const auth = getAuth(app);
const db = getFirestore(app);

// Step 5: In services ko export karein (Yeh sab se ahem line hai)
export { auth, db };