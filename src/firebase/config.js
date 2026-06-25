// firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBj3G8x80tDXxo_dw0KdRDsdiPJ9eiO-po",
  authDomain: "placement-community-93637.firebaseapp.com",
  projectId: "placement-community-93637",
  storageBucket: "placement-community-93637.firebasestorage.app",
  messagingSenderId: "51828926423",
  appId: "1:51828926423:web:9dc3b674db7783d2004d92"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();