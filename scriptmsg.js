import { auth, db } from './firebaseInit.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { collection, addDoc, query, where, onSnapshot, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

// Références DOM
const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
const loginEmailInput = document.getElementById('login-email-input');
const loginPasswordInput = document.getElementById('login-password-input');
const loginButton = document.getElementById('login-button');
const loginMessage = document.getElementById('login-message');
const registerEmailInput = document.getElementById('register-email-input');
const registerPasswordInput = document.getElementById('register-password-input');
const pseudoInput = document.getElementById('pseudo-input');
const registerButton = document.getElementById('register-button');
const registerMessage = document.getElementById('register-message');
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const userIdInput = document.getElementById('user-id-input');
const startChatButton = document.getElementById('start-chat-button');

let currentChatId = null;

// Connexion de l'utilisateur
loginButton.addEventListener('click', async () => {
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value.trim();
    if (email && password) {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Erreur de connexion:', error);
            loginMessage.textContent = 'Erreur de connexion. Veuillez réessayer.';
        }
    } else {
        loginMessage.textContent = 'Veuillez entrer un email et un mot de passe.';
    }
});

// Inscription de l'utilisateur
registerButton.addEventListener('click', async () => {
    const email = registerEmailInput.value.trim();
    const password = registerPasswordInput.value.trim();
    const pseudo = pseudoInput.value.trim();
    if (email && password && pseudo) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('Utilisateur créé:', user);
            await addDoc(collection(db, 'users'), {
                uid: user.uid,
                pseudo: pseudo
            });
            registerMessage.textContent = 'Inscription réussie. Veuillez vous connecter.';
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            registerMessage.textContent = 'Erreur d\'inscription. Veuillez réessayer.';
        }
    } else {
        registerMessage.textContent = 'Veuillez remplir tous les champs.';
    }
});

// État de l'authentification
onAuthStateChanged(auth, user => {
    if (user) {
        authContainer.style.display = 'none';
        chatContainer.style.display = 'block';
        listenForMessages();
    } else {
        authContainer.style.display = 'block';
        chatContainer.style.display = 'none';
    }
});

// Écouter les messages
const listenForMessages = () => {
    const messagesQuery = query(collection(db, 'messages'));
    onSnapshot(messagesQuery, snapshot => {
        chatBox.innerHTML = '';
        snapshot.forEach(doc => {
            const message = doc.data();
            chatBox.innerHTML += `<p><strong>${message.sender}:</strong> ${message.text}</p>`;
        });
    });
};

// Envoyer un message
sendButton.addEventListener('click', async () => {
    const message = messageInput.value.trim();
    if (message && currentChatId) {
        try {
            await addDoc(collection(db, 'messages'), {
                text: message,
                sender: auth.currentUser.email,
                chatId: currentChatId,
                timestamp: new Date()
            });
            messageInput.value = '';
        } catch (error) {
            console.error('Erreur d\'envoi du message:', error);
        }
    }
});

// Commencer une discussion
startChatButton.addEventListener('click', () => {
    const userId = userIdInput.value.trim();
    if (userId) {
        currentChatId = userId;
    }
});
document.addEventListener('mousemove', function(e) {
    const navbar = document.querySelector('.navbar');
    if (e.clientX < 200) {
        navbar.style.left = '0';
    } else {
        navbar.style.left = '-200px';
    }
});
