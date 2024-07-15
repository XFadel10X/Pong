import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot, increment } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCI-J-FAb5Q0rQ27FLtuw4VoXY9yU0yslc",
    authDomain: "clicker-34a35.firebaseapp.com",
    projectId: "clicker-34a35",
    storageBucket: "clicker-34a35.appspot.com",
    messagingSenderId: "947684024719",
    appId: "1:947684024719:web:184b91126c7070f166abfa",
    measurementId: "G-NX9MZBDKXY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', async () => {
    const personalCounter = document.getElementById('personal-counter');
    const globalCounter = document.getElementById('global-counter');
    const image = document.getElementById('clickable-image');

    // Initialize personal counter
    let personalCount = 0;

    // Reference to the global counter in Firestore
    const globalCounterRef = doc(db, 'counters', 'globalCounter');

    try {
        // Get initial value of global counter
        const globalCounterDoc = await getDoc(globalCounterRef);
        if (globalCounterDoc.exists()) {
            globalCounter.textContent = globalCounterDoc.data().count;
        } else {
            await setDoc(globalCounterRef, { count: 0 });
        }
    } catch (error) {
        console.error("Error getting global counter:", error);
    }

    image.addEventListener('click', async () => {
        // Increment personal counter
        personalCount += 1;
        personalCounter.textContent = personalCount;

        try {
            // Increment global counter
            await updateDoc(globalCounterRef, {
                count: increment(1)
            });

            const updatedGlobalCounterDoc = await getDoc(globalCounterRef);
            if (updatedGlobalCounterDoc.exists()) {
                globalCounter.textContent = updatedGlobalCounterDoc.data().count;
            }
        } catch (error) {
            console.error("Error updating global counter:", error);
        }
    });

    // Realtime listener for the global counter
    onSnapshot(globalCounterRef, (doc) => {
        if (doc.exists()) {
            globalCounter.textContent = doc.data().count;
        }
    });
});
function disableScrollDown() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 0) {
            window.scrollTo(0, 0); 
        }
    });
}


disableScrollDown();
document.addEventListener('mousemove', function(e) {
    const navbar = document.querySelector('.navbar');
    if (e.clientX < 100) {
        navbar.style.left = '0';
    } else {
        navbar.style.left = '-200px';
    }
});
