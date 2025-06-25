import { initializeApp } from "firebase/app";
import {
    getAuth,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import * as firebaseui from 'firebaseui';
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
// Initialize FirebaseUI
export const initFirebaseUI = (containerId) => {
    const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
    ui.start(containerId, {
        signInOptions: [
            EmailAuthProvider.PROVIDER_ID
        ],
        signInSuccessUrl: '#', // Stay on the same page
        callbacks: {
            signInSuccessWithAuthResult: function(authResult, redirectUrl) {
                // User successfully signed in.
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.
                return false;
            }
        }
    });
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