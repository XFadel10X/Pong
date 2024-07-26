import { auth, db } from './firebaseInit.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
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
const logoutButton = document.getElementById('logout-button');

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
            const uniqueId = generateUniqueId(pseudo);
            await addDoc(collection(db, 'users'), {
                uid: user.uid,
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

// État de l'authentification
onAuthStateChanged(auth, async user => {
    if (user) {
        authContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        userIdDisplay.textContent = `Votre ID: ${await getUserUniqueId(user.uid)}`;
        await loadChatHistory();
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
        currentChatId = userId;
        document.getElementById('message-form').style.display = 'flex';

        // Envoyer un message de démarrage aux deux utilisateurs
        try {
            const senderEmail = auth.currentUser.email;
            const receiverEmail = userId;

            await addDoc(collection(db, 'messages'), {
                text: 'La discussion a commencé!',
                sender: senderEmail,
                chatId: currentChatId,
                timestamp: new Date()
            });

            await addDoc(collection(db, 'messages'), {
                text: 'La discussion a commencé!',
                sender: receiverEmail,
                chatId: currentChatId,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message de démarrage:', error);
        }

        await listenForMessages();
    }
});

// Réinitialiser la discussion
resetChatButton.addEventListener('click', () => {
    chatBox.innerHTML = '';
    messageInput.value = '';
});

// Supprimer un message
const deleteMessage = async (messageId) => {
    try {
        await deleteDoc(doc(db, 'messages', messageId));
    } catch (error) {
        console.error('Erreur lors de la suppression du message:', error);
    }
};

// Supprimer une personne de l'historique
window.removeFromHistory = async (uniqueId) => {
    try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, where('uniqueId', '==', uniqueId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            const messagesQuery = query(collection(db, 'messages'), where('chatId', '==', userData.uid));
            const messagesSnapshot = await getDocs(messagesQuery);
            messagesSnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });

            const listItem = document.getElementById(`user-${uniqueId}`);
            if (listItem) {
                listItem.remove();
            }
        }
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'historique:', error);
    }
};

// Charger l'historique des discussions
const loadChatHistory = async () => {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection);
    const querySnapshot = await getDocs(q);
    chatHistoryList.innerHTML = '';
    const seenUsers = new Set();
    let hasHistory = false; // Variable pour vérifier si l'historique est non vide

    querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (!seenUsers.has(userData.uid) && userData.uid !== auth.currentUser.uid) {
            chatHistoryList.innerHTML += `
                <li id="user-${userData.uniqueId}">
                    ${userData.pseudo}
                    <button onclick="removeFromHistory('${userData.uniqueId}')">Supprimer</button>
                </li>
            `;
            seenUsers.add(userData.uid);
            hasHistory = true;
        }
    });

    // Afficher ou masquer le formulaire de message en fonction de l'historique
    if (hasHistory) {
        document.getElementById('message-form').style.display = 'none';
    } else {
        document.getElementById('message-form').style.display = 'none';
    }
};

// Obtenir le pseudo d'un utilisateur
const getPseudo = async (email) => {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('uid', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data().pseudo;
    }
    return email;
};

// Générer un ID unique pour l'utilisateur
const generateUniqueId = (pseudo) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${pseudo}#${randomNum.toString().padStart(4, '0')}`;
};

// Obtenir l'ID unique d'un utilisateur
const getUserUniqueId = async (userId) => {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('uid', '==', userId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data().uniqueId;
    }
    return 'ID inconnu';
};

// Déconnexion de l'utilisateur
logoutButton.addEventListener('click', async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Erreur de déconnexion:', error);
    }
});
document.addEventListener('mousemove', function(e) {
    const navbar = document.querySelector('.navbar');
    if (e.clientX < 70) {
        navbar.style.left = '0';
    } else {
        navbar.style.left = '-200px';
    }
});
