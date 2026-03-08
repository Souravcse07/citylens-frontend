import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAQ3yYnFUqvGi1LdNQT-ezDZ6A4_hGNQVc",
  authDomain: "citylens-7fe59.firebaseapp.com",
  projectId: "citylens-7fe59",
  storageBucket: "citylens-7fe59.firebasestorage.app",
  messagingSenderId: "673964916805",
  appId: "1:673964916805:web:27c7af223ee99829f9e32c",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
auth.useDeviceLanguage();

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export { auth, googleProvider };