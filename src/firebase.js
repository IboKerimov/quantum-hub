import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDWZKykg9jmeZQ5WndWCrk1wVWd4cZIMNc",
  authDomain: "quantum-hub-202ec.firebaseapp.com",
  databaseURL: "https://quantum-hub-202ec-default-rtdb.firebaseio.com",
  projectId: "quantum-hub-202ec",
  storageBucket: "quantum-hub-202ec.appspot.com",
  messagingSenderId: "685097069069",
  appId: "1:685097069069:web:5fabab1cbca41e62dcc344"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const storage = getStorage(app);
export const firestore = getFirestore(app);
export const auth = getAuth(app)