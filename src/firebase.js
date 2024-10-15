import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "You must get yours from your firebase app",
  authDomain: "You must get yours from your firebase app",
  databaseURL: "You must get yours from your firebase app",
  projectId: "You must get yours from your firebase app",
  storageBucket: "You must get yours from your firebase app",
  messagingSenderId: "You must get yours from your firebase app",
  appId: "You must get yours from your firebase app"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const storage = getStorage(app);
export const firestore = getFirestore(app);
export const auth = getAuth(app)
