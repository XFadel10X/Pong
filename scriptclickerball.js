import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot, increment } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBE7224f3PMvPm9BlRCypbOzRBVZphawBo",
    authDomain: "clicker-fefc2.firebaseapp.com",
    projectId: "clicker-fefc2",
    storageBucket: "clicker-fefc2.appspot.com",
    messagingSenderId: "38772888846",
    appId: "1:38772888846:web:dcfdf968f362f1dc59735f",
    measurementId: "G-998T26M16X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', async () => {
    const personalCounterElement = document.getElementById('personal-counter');
    const globalCounterElement = document.getElementById('global-counter');
    const clickableImage = document.getElementById('clickable-image');

    // Initialize personal counter
    let personalCount = 0;

    // Reference to the global counter in Firestore
    const globalCounterRef = doc(db, 'counters', 'globalCounter');

    try {
        // Get initial value of global counter
        const globalCounterDoc = await getDoc(globalCounterRef);
        if (globalCounterDoc.exists()) {
            globalCounterElement.textContent = globalCounterDoc.data().count;
        } else {
            await setDoc(globalCounterRef, { count: 0 });
            globalCounterElement.textContent = 0;
        }
    } catch (error) {
        console.error("Error getting global counter:", error);
    }

    clickableImage.addEventListener('click', async () => {
        // Increment personal counter
        personalCount += 1;
        personalCounterElement.textContent = personalCount;

        try {
            // Increment global counter
            await updateDoc(globalCounterRef, {
                count: increment(1)
            });
        } catch (error) {
            console.error("Error updating global counter:", error);
        }
    });

    // Realtime listener for the global counter
    onSnapshot(globalCounterRef, (doc) => {
        if (doc.exists()) {
            globalCounterElement.textContent = doc.data().count;
        }
    });
});
document.addEventListener('mousemove', function(e) {
    const navbar = document.querySelector('.navbar');
    if (e.clientX < 100) {
        navbar.style.left = '0';
    } else {
        navbar.style.left = '-200px';
    }
});
