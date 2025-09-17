// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCSWXELZqYa7LcCDyQ2pD9GloIMMd-HJ4s",
  authDomain: "newtry-5a471.firebaseapp.com",
  projectId: "newtry-5a471",
  storageBucket: "newtry-5a471.appspot.com",
  messagingSenderId: "591334538209",
  appId: "1:591334538209:web:a2eb331288c8484f81b0a0",
  measurementId: "G-B406XH25PH"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
