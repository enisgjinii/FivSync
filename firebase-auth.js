import { initializeApp } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
// TODO: Add your Firebase project's configuration here
const firebaseConfig = {
    apiKey: "AIzaSyCwSjxi9GIeTaD7ARsrj1ZoSPwB0O45ryg",
    authDomain: "fivsync-d4101.firebaseapp.com",
    projectId: "fivsync-d4101",
    storageBucket: "fivsync-d4101.firebasestorage.app",
    messagingSenderId: "787439701239",
    appId: "1:787439701239:web:6d73a67f8d0ad43e5497f2"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// --- Authentication Functions ---
// Sign up new users
export const signUp = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Signed in 
        const user = userCredential.user;
        console.log("Signed up:", user);
        return user;
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Sign up error:", errorCode, errorMessage);
        throw error;
    }
};
// Sign in existing users
export const logIn = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Signed in 
        const user = userCredential.user;
        console.log("Logged in:", user);
        return user;
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Login error:", errorCode, errorMessage);
        throw error;
    }
};
// Sign out the current user
export const logOut = async () => {
    try {
        await signOut(auth);
        console.log("Logged out");
    } catch (error) {
        console.error("Logout error:", error);
        throw error;
    }
};
// Observer for auth state changes
export const onAuth = (callback) => {
    return onAuthStateChanged(auth, callback);
}; 