import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCkyhnqk4VTX20xEHvmzFe5r9sNYgUXYbk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "saemaul-sdgs.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "saemaul-sdgs",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "saemaul-sdgs.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "550605640090",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:550605640090:web:4e30a84be713ec065c6a23",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-Y500T29XVM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Only initialize analytics in supported environments
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Export instances to be used in other parts of the app
export const auth = getAuth(app);
export const db = getFirestore(app);
export { analytics };

export default app;
