
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDG--9UW5sIVNvYnHO1U_Bv5S7lXGIisro",
  authDomain: "ujjval-samiti.firebaseapp.com",
  projectId: "ujjval-samiti",
  storageBucket: "ujjval-samiti.firebasestorage.app",
  messagingSenderId: "595088837715",
  appId: "1:595088837715:web:f094353dcaea9e2017caa6",
  measurementId: "G-KKW3JM25V1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

