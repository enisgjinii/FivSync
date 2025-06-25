// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCwSjxi9GIeTaD7ARsrj1ZoSPwB0O45ryg",
    authDomain: "fivsync-d4101.firebaseapp.com",
    projectId: "fivsync-d4101",
    storageBucket: "fivsync-d4101.firebasestorage.app",
    messagingSenderId: "787439701239",
    appId: "1:787439701239:web:6d73a67f8d0ad43e5497f2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Initialize FirebaseUI (not used in this implementation)
const initFirebaseUI = (containerId) => {
    // FirebaseUI implementation would go here if needed
    console.log('FirebaseUI initialization not implemented');
};

// User subscription management
const UserSubscription = {
    // Create user document when they sign up
    async createUser(userId, email) {
        try {
            const userRef = db.collection('users').doc(userId);
            await userRef.set({
                email: email,
                isPro: false,
                subscriptionStatus: 'free',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                stripeCustomerId: null,
                subscriptionId: null
            });
            console.log('User document created successfully');
        } catch (error) {
            console.error('Error creating user document:', error);
            throw error;
        }
    },

    // Get user subscription status
    async getUserStatus(userId) {
        try {
            const userRef = db.collection('users').doc(userId);
            const userSnap = await userRef.get();
            
            if (userSnap.exists) {
                const userData = userSnap.data();
                return {
                    isPro: userData.isPro || false,
                    subscriptionStatus: userData.subscriptionStatus || 'free',
                    email: userData.email,
                    stripeCustomerId: userData.stripeCustomerId,
                    subscriptionId: userData.subscriptionId,
                    lastUpdated: userData.lastUpdated
                };
            } else {
                // User document doesn't exist, create it
                console.log('User document not found, creating...');
                const user = auth.currentUser;
                if (user) {
                    await this.createUser(userId, user.email);
                    return {
                        isPro: false,
                        subscriptionStatus: 'free',
                        email: user.email,
                        stripeCustomerId: null,
                        subscriptionId: null
                    };
                }
                return null;
            }
        } catch (error) {
            console.error('Error getting user status:', error);
            throw error;
        }
    },

    // Update user subscription status (called from webhook or success page)
    async updateSubscriptionStatus(userId, subscriptionData) {
        try {
            const userRef = db.collection('users').doc(userId);
            await userRef.update({
                isPro: subscriptionData.isPro,
                subscriptionStatus: subscriptionData.status,
                stripeCustomerId: subscriptionData.stripeCustomerId,
                subscriptionId: subscriptionData.subscriptionId,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('User subscription status updated successfully');
        } catch (error) {
            console.error('Error updating subscription status:', error);
            throw error;
        }
    },

    // Check if user has active subscription
    async checkActiveSubscription(userId) {
        try {
            const status = await this.getUserStatus(userId);
            return status && status.isPro && 
                   ['active', 'trialing'].includes(status.subscriptionStatus);
        } catch (error) {
            console.error('Error checking active subscription:', error);
            return false;
        }
    }
};

// Sign up a new user
const signUp = async (email, password) => {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Create user document in Firestore
        await UserSubscription.createUser(user.uid, email);
        
        console.log("User created successfully:", user.email);
        return user;
    } catch (error) {
        console.error("Sign up error:", error);
        throw error;
    }
};

// Sign in an existing user
const logIn = async (email, password) => {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Ensure user document exists
        const userStatus = await UserSubscription.getUserStatus(user.uid);
        if (!userStatus) {
            await UserSubscription.createUser(user.uid, email);
        }
        
        console.log("User signed in successfully:", user.email);
        return user;
    } catch (error) {
        console.error("Sign in error:", error);
        throw error;
    }
};

// Sign out the current user
const logOut = async () => {
    try {
        await auth.signOut();
        console.log("User signed out successfully");
    } catch (error) {
        console.error("Sign out error:", error);
        throw error;
    }
};

// Listen for authentication state changes
const onAuth = (callback) => {
    return auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Get user subscription status from Firestore
            try {
                const userStatus = await UserSubscription.getUserStatus(user.uid);
                callback({
                    ...user,
                    isPro: userStatus?.isPro || false,
                    subscriptionStatus: userStatus?.subscriptionStatus || 'free'
                });
            } catch (error) {
                console.error('Error getting user status:', error);
                callback(user);
            }
        } else {
            callback(null);
        }
    });
};

// Make functions available globally
window.onAuth = onAuth;
window.signUp = signUp;
window.logIn = logIn;
window.logOut = logOut;
window.UserSubscription = UserSubscription; 