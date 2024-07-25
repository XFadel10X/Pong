import { auth, db } from './firebaseInit.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { collection, addDoc, query, where, onSnapshot, getDocs, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

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
const chatHistoryList = document.getElementById('chat-history-list');
const resetChatButton = document.getElementById('reset-chat-button');
const userIdDisplay = document.getElementById('user-id-display');

let currentChatId = null;
let unsubscribe = null;

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
onAuthStateChanged(auth, async user => {
    if (user) {
        authContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        userIdDisplay.textContent = `Votre ID: ${user.uid}`;
        await loadChatHistory();
        listenForMessages();
    } else {
        authContainer.style.display = 'block';
        chatContainer.style.display = 'none';
    }
});

// Écouter les messages
const listenForMessages = () => {
    if (unsubscribe) {
        unsubscribe();  // Supprimez l'écouteur précédent
    }
    
    if (currentChatId) {
        const messagesQuery = query(collection(db, 'messages'), where('chatId', '==', currentChatId));
        unsubscribe = onSnapshot(messagesQuery, async snapshot => {
            chatBox.innerHTML = '';
            for (const doc of snapshot.docs) {
                const message = doc.data();
                const senderPseudo = await getPseudo(message.sender);
                chatBox.innerHTML += `
                    <div>
                        <p><strong>${senderPseudo}:</strong> ${message.text}</p>
                        ${message.sender === auth.currentUser.email ? `<button onclick="deleteMessage('${doc.id}')">Supprimer</button>` : ''}
                    </div>
                `;
            }
        });
    }
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
startChatButton.addEventListener('click', async () => {
    const userId = userIdInput.value.trim();
    if (userId) {
        // Définir l'ID du chat actuel
        currentChatId = userId;
        
        // Envoyer un message de notification aux deux utilisateurs
        await sendStartChatNotification(userId);

        // Démarrer l'écoute des messages
        await listenForMessages();
    }
});

// Charger l'historique des discussions
const loadChatHistory = async () => {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection);
    const querySnapshot = await getDocs(q);
    chatHistoryList.innerHTML = '';
    querySnapshot.forEach((doc) => {
        chatHistoryList.innerHTML += `<li onclick="startChat('${doc.data().uid}')">${doc.data().pseudo}</li>`;
    });
};

// Commencer une discussion
window.startChat = async (chatId) => {
    currentChatId = chatId;
    await listenForMessages();
};

// Supprimer un message
window.deleteMessage = async (messageId) => {
    try {
        await deleteDoc(doc(db, 'messages', messageId));
    } catch (error) {
        console.error('Erreur de suppression du message:', error);
    }
};

// Réinitialiser la discussion
resetChatButton.addEventListener('click', async () => {
    if (currentChatId) {
        const messagesQuery = query(collection(db, 'messages'), where('chatId', '==', currentChatId));
        const querySnapshot = await getDocs(messagesQuery);
        querySnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });
    }
});

// Obtenir le pseudo d'un utilisateur
const getPseudo = async (email) => {
    try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, where('uid', '==', email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            return userDoc.data().pseudo;
        }
        return email;  // Retourner l'email en cas de problème
    } catch (error) {
        console.error('Erreur lors de la récupération du pseudo:', error);
        return email;  // Retourner l'email en cas d'erreur
    }
};

// Déplacement de la navbar
document.addEventListener('mousemove', function(e) {
    const navbar = document.querySelector('.navbar');
    if (e.clientX < 200) {
        navbar.style.left = '0';
    } else {
        navbar.style.left = '-200px';
    }
});
const sendStartChatNotification = async (otherUserId) => {
    if (auth.currentUser) {
        const currentUserEmail = auth.currentUser.email;
        try {
            // Envoyer un message à l'autre utilisateur
            await addDoc(collection(db, 'messages'), {
                text: 'La discussion a commencé !',
                sender: currentUserEmail,
                chatId: currentChatId,
                timestamp: new Date()
            });

            // Envoyer un message à l'utilisateur courant
            await addDoc(collection(db, 'messages'), {
                text: 'La discussion a commencé !',
                sender: otherUserId,
                chatId: currentChatId,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Erreur d\'envoi du message de notification:', error);
        }
    }
};