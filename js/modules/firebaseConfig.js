// js/modules/firebaseConfig.js
<<<<<<< HEAD
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
=======
>>>>>>> 1b627e9a5f889384fc218102de95a9cee8a5a4c9

// 1. CẤU HÌNH VÀ KHỞI TẠO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDHAr8A7pV5VG8vlT-JyMu0sX6PoX9VAfY",
  authDomain: "vocab-5000-en-13cda.firebaseapp.com",
  projectId: "vocab-5000-en-13cda",
  storageBucket: "vocab-5000-en-13cda.firebasestorage.app",
  messagingSenderId: "354480151513",
  appId: "1:354480151513:web:3c52157c1b071f237417c8",
  measurementId: "G-S471NR63TR"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);

// Export các đối tượng Firebase cần thiết
export const auth = firebase.auth();
export const db = firebase.firestore();
