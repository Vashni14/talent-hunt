import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBeD07M8UtKogXxyBMU78ujjaQRptVRmc4",
    authDomain: "team-mentorship.firebaseapp.com",
    projectId: "team-mentorship",
    storageBucket: "team-mentorship.firebasestorage.app",
    messagingSenderId: "117203147290",
    appId: "1:117203147290:web:08ea33f87cf8dfb0830fa3",
    measurementId: "G-P84XHJCPVK"  
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider(); // ✅ Fix: Correctly initialize Google Provider

export { auth, googleProvider }; // ✅ Fix: Ensure googleProvider is properly exported
