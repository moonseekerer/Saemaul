import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCkyhnqk4VTX20xEHvmzFe5r9sNYgUXYbk",
  authDomain: "saemaul-sdgs.firebaseapp.com",
  projectId: "saemaul-sdgs",
  storageBucket: "saemaul-sdgs.firebasestorage.app",
  messagingSenderId: "550605640090",
  appId: "1:550605640090:web:4e30a84be713ec065c6a23",
  measurementId: "G-Y500T29XVM"
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
