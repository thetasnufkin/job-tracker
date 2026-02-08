// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// ↓↓↓ ここを自分のFirebaseの設定値に書き換えてください ↓↓↓
const firebaseConfig = {
  apiKey: "AIzaSyDqHllOC_xuae77vqk1wONTiyAGYxzk_Ds",
  authDomain: "jobtracker-a08a2.firebaseapp.com",
  projectId: "jobtracker-a08a2",
  storageBucket: "jobtracker-a08a2.firebasestorage.app",
  messagingSenderId: "177796781964",
  appId: "1:177796781964:web:6cfe68667d992d3f30a8a9"
};
// ↑↑↑↑↑↑

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();