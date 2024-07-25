import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyAJkQmq5sIArN5V0pU8HTbSSKalXSDYz3E",
    authDomain: "messagerie-fadb3.firebaseapp.com",
    projectId: "messagerie-fadb3",
    storageBucket: "messagerie-fadb3.appspot.com",
    messagingSenderId: "87654683796",
    appId: "1:87654683796:web:78461bc5813a0d9768d081",
    measurementId: "G-V7PMT2B4GQ"
  };

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export { auth, db };