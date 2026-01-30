// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { onAuthStateChanged } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1zQR1nlkZfcdZvOsSJhJ4fNG3YQ0YS_A",
  authDomain: "gym-application-546ad.firebaseapp.com",
  projectId: "gym-application-546ad",
  storageBucket: "gym-application-546ad.firebasestorage.app",
  messagingSenderId: "430429618097",
  appId: "1:430429618097:web:b06b31f91e07a90b1e0790"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;