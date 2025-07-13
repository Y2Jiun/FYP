// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCI3cfmtgWQw3rkAmOWpxrdBNSvBH00R8s",
  authDomain: "derrick-3157c.firebaseapp.com",
  projectId: "derrick-3157c",
  storageBucket: "derrick-3157c.appspot.com",
  messagingSenderId: "892123233032",
  appId: "1:892123233032:web:6c922c6204584b031bcabd",
  measurementId: "G-KE7VBSGF8F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
