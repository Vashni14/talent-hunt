import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// ✅ Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyBeD07M8UtKogXxyBMU78ujjaQRptVRmc4",
    authDomain: "team-mentorship.firebaseapp.com",
    projectId: "team-mentorship",
    storageBucket: "team-mentorship.appspot.com", // ✅ Fixed storageBucket
    messagingSenderId: "117203147290",
    appId: "1:117203147290:web:08ea33f87cf8dfb0830fa3",
    measurementId: "G-P84XHJCPVK"  
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

// ✅ Connect to Firebase Emulators
if (window.location.hostname === "localhost") {
    console.log("🔥 Running in Emulator Mode");
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, "localhost", 8081);
}


// ✅ Export Everything Properly
export { auth, googleProvider, db };
