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

            // Générer un ID unique pour l'utilisateur
            const uniqueId = await generateUniqueId(pseudo);

            await addDoc(collection(db, 'users'), {
                uid: user.uid,
                email: user.email,
                pseudo: pseudo,
                uniqueId: uniqueId
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


// Générer un ID unique
const generateUniqueId = async (pseudo) => {
    let uniqueId;
    let idExists = true;
    while (idExists) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        uniqueId = `${pseudo}#${randomNum.toString().padStart(4, '0')}`;

        // Vérifier si l'ID existe déjà dans Firestore
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, where('uniqueId', '==', uniqueId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            idExists = false;
        }
    }
    return uniqueId;
};


// État d'authentification de l'utilisateur
onAuthStateChanged(auth, async user => {
    if (user) {
        authContainer.style.display = 'none';
        chatContainer.style.display = 'flex';

        // Obtenir le pseudo et l'ID unique de l'utilisateur
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            userIdDisplay.textContent = `Votre ID: ${userData.uniqueId}`;
        }

        await loadChatHistory();
        listenForMessages();
    } else {
        authContainer.style.display = 'block';
        chatContainer.style.display = 'none';
    }
});

// Écouter les messages
const listenForMessages = () => {
    if (currentChatId) {
        const messagesQuery = query(collection(db, 'messages'), where('chatId', '==', currentChatId));
        onSnapshot(messagesQuery, async snapshot => {
            chatBox.innerHTML = '';
            for (const doc of snapshot.docs) {
                const message = doc.data();
                const senderPseudo = await getPseudo(message.sender);
                chatBox.innerHTML += `
                    <div>
                        <p><strong>${senderPseudo}:</strong> ${message.text}</p>
                        ${message.sender === auth.currentUser.uid ? `<button onclick="deleteMessage('${doc.id}')">Supprimer</button>` : ''}
                    </div>
                `;
            }
        });
    }
};



// Obtenir le pseudo d'un utilisateur
const getPseudo = async (uid) => {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return userDoc.data().uniqueId;
    }
    return uid;  // En cas d'erreur, retourne l'UID par défaut
};

// Envoyer un message
sendButton.addEventListener('click', async () => {
    const message = messageInput.value.trim();
    if (message && currentChatId) {
        try {
            await addDoc(collection(db, 'messages'), {
                text: message,
                sender: auth.currentUser.uid,
                chatId: currentChatId,
                timestamp: new Date()
            });
            messageInput.value = '';
        } catch (error) {
            console.error('Erreur d\'envoi du message:', error);
        }
    }
});

// Charger l'historique des discussions
// Charger l'historique des discussions
const loadChatHistory = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        const userChatsCollection = collection(db, 'userChats', currentUser.uid, 'chats');
        const querySnapshot = await getDocs(userChatsCollection);
        chatHistoryList.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const chatData = doc.data();
            chatHistoryList.innerHTML += `
                <li data-chat-id="${doc.id}">
                    ${chatData.pseudo}
                    <button onclick="deleteChatHistory('${doc.id}')">Supprimer</button>
                </li>`;
        });
    }
};

// Supprimer une discussion de l'historique de l'utilisateur
window.deleteChatHistory = async (chatId) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        const chatDocRef = doc(db, 'userChats', currentUser.uid, 'chats', chatId);
        await deleteDoc(chatDocRef);
        await loadChatHistory();
    }
};

// Sauvegarder une discussion dans l'historique de l'utilisateur
const saveChatToHistory = async (chatId, pseudo) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        await addDoc(collection(db, 'userChats', currentUser.uid, 'chats'), {
            chatId: chatId,
            pseudo: pseudo
        });
    }
};

// Commencer une discussion
startChatButton.addEventListener('click', async () => {
    const userId = userIdInput.value.trim();
    if (userId) {
        currentChatId = userId;
        const pseudo = await getPseudo(userId);
        await saveChatToHistory(userId, pseudo);
        await listenForMessages();
    }
});

// Fonction pour envoyer un message de notification aux deux utilisateurs
const sendStartChatNotification = async (otherUserId) => {
    if (auth.currentUser) {
        const currentUserUid = auth.currentUser.uid;
        try {
            // Envoyer un message à l'autre utilisateur
            await addDoc(collection(db, 'messages'), {
                text: 'La discussion a commencé !',
                sender: currentUserUid,
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

// Réinitialiser la conversation
resetChatButton.addEventListener('click', () => {
    currentChatId = null;
    chatBox.innerHTML = '';
});


// Supprimer une discussion de l'historique de l'utilisateur
window.deleteChatHistory = async (chatId) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        const chatDocRef = doc(db, 'userChats', currentUser.uid, 'chats', chatId);
        await deleteDoc(chatDocRef);
        await loadChatHistory();
    }
};

// Sauvegarder une discussion dans l'historique de l'utilisateur


// Commencer une discussion
startChatButton.addEventListener('click', async () => {
    const userId = userIdInput.value.trim();
    if (userId) {
        currentChatId = userId;
        const pseudo = await getPseudo(userId);
        await saveChatToHistory(userId, pseudo);
        await listenForMessages();
    }
});

// Fonction pour envoyer un message de notification aux deux utilisateurs

// Réinitialiser la conversation
resetChatButton.addEventListener('click', () => {
    currentChatId = null;
    chatBox.innerHTML = '';
});
document.addEventListener('mousemove', function(e) {
    const navbar = document.querySelector('.navbar');
    if (e.clientX < 100) {
        navbar.style.left = '0';
    } else {
        navbar.style.left = '-200px';
    }
});






