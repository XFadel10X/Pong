import { auth, db } from './firebaseInit.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js';
import { collection, addDoc, doc, getDoc, setDoc, onSnapshot, updateDoc, getDocs } from 'https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js';

const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');
const logoutButton = document.getElementById('logout-button');
const newChatButton = document.getElementById('new-chat-button');
const startChatButton = document.getElementById('start-chat-button');
const startNewChatButton = document.getElementById('start-new-chat-button');
const resetChatButton = document.getElementById('reset-chat-button');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatBox = document.getElementById('chat-box');
const userIdDisplay = document.getElementById('user-id-display');
const chatHistoryList = document.getElementById('chat-history-list');
const messageForm = document.getElementById('message-form');
const startChatDiv = document.querySelector('.start-chat');
const newChatPopup = document.getElementById('new-chat-popup');
const cancelNewChatButton = document.getElementById('cancel-new-chat-button');

let currentUserId = null;
let activeChatId = null;
let unsubscribeChat = null;

// Fonction de connexion
loginButton.addEventListener('click', async () => {
    const email = document.getElementById('login-email-input').value;
    const password = document.getElementById('login-password-input').value;
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Connecté:', userCredential.user);
        authContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        currentUserId = userCredential.user.uid;
        userIdDisplay.textContent = `Votre ID : ${currentUserId}`;
        loadChatHistory(currentUserId);
    } catch (error) {
        console.error('Erreur de connexion:', error);
    }
});

// Fonction d'inscription
registerButton.addEventListener('click', async () => {
    const email = document.getElementById('register-email-input').value;
    const password = document.getElementById('register-password-input').value;
    const pseudo = document.getElementById('pseudo-input').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Inscription réussie:', userCredential.user);
        
        // Enregistrement du pseudo dans Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            pseudo: pseudo,
            email: email
        });
        
        authContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        currentUserId = userCredential.user.uid;
        userIdDisplay.textContent = `Votre ID : ${currentUserId}`;
        loadChatHistory(currentUserId);
    } catch (error) {
        console.error('Erreur d\'inscription:', error);
    }
});

// Fonction de déconnexion
logoutButton.addEventListener('click', () => {
    signOut(auth).then(() => {
        console.log('Déconnecté');
        authContainer.style.display = 'flex';
        chatContainer.style.display = 'none';
        currentUserId = null;
        activeChatId = null;
        if (unsubscribeChat) unsubscribeChat();
    }).catch((error) => {
        console.error('Erreur de déconnexion:', error);
    });
});

// Fonction pour charger l'historique des discussions
async function loadChatHistory(userId) {
    chatHistoryList.innerHTML = ''; // Clear the list first

    const userChatsSnapshot = await getDocs(collection(db, 'users', userId, 'chats'));
    userChatsSnapshot.forEach(docSnapshot => {
        const chatData = docSnapshot.data();
        const listItem = document.createElement('li');
        listItem.textContent = `Chat avec ${chatData.chatWith}`;
        listItem.addEventListener('click', () => loadChat(docSnapshot.id));
        chatHistoryList.appendChild(listItem);
    });
}

// Fonction pour charger une discussion spécifique
function loadChat(chatId) {
    if (unsubscribeChat) unsubscribeChat();

    activeChatId = chatId;
    chatBox.innerHTML = '';
    messageForm.style.display = 'flex';
    startChatDiv.style.display = 'none';

    const messagesCollection = collection(db, 'chats', chatId, 'messages');
    unsubscribeChat = onSnapshot(messagesCollection, snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                const messageData = change.doc.data();
                const messageElement = document.createElement('p');
                messageElement.textContent = `${messageData.senderId}: ${messageData.text}`;
                chatBox.appendChild(messageElement);
            }
        });
    });
}

// Envoyer un message
sendButton.addEventListener('click', async () => {
    const messageText = messageInput.value;
    if (messageText && activeChatId) {
        await addDoc(collection(db, 'chats', activeChatId, 'messages'), {
            senderId: currentUserId,
            text: messageText,
            timestamp: new Date()
        });
        messageInput.value = '';
    }
});

// Démarrer une nouvelle discussion
startNewChatButton.addEventListener('click', async () => {
    const chatWithId = document.getElementById('new-chat-id-input').value;
    if (chatWithId) {
        const newChatDocRef = await addDoc(collection(db, 'chats'), {});
        const newChatId = newChatDocRef.id;

        await setDoc(doc(db, 'users', currentUserId, 'chats', newChatId), {
            chatWith: chatWithId
        });

        await setDoc(doc(db, 'users', chatWithId, 'chats', newChatId), {
            chatWith: currentUserId
        });

        await loadChatHistory(currentUserId);
        newChatPopup.style.display = 'none';
    }
});

// Réinitialiser une discussion (supprimer tous les messages)
resetChatButton.addEventListener('click', async () => {
    if (activeChatId) {
        const messagesSnapshot = await getDocs(collection(db, 'chats', activeChatId, 'messages'));
        messagesSnapshot.forEach(async docSnapshot => {
            await deleteDoc(docSnapshot.ref);
        });
        chatBox.innerHTML = '';
    }
});

// Ouvrir la fenêtre pop-up pour une nouvelle discussion
newChatButton.addEventListener('click', () => {
    newChatPopup.style.display = 'block';
});

// Fermer la fenêtre pop-up pour une nouvelle discussion
cancelNewChatButton.addEventListener('click', () => {
    newChatPopup.style.display = 'none';
});

// État de l'authentification
onAuthStateChanged(auth, user => {
    if (user) {
        console.log('Utilisateur connecté:', user);
        authContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        currentUserId = user.uid;
        userIdDisplay.textContent = `Votre ID : ${currentUserId}`;
        loadChatHistory(currentUserId);
    } else {
        console.log('Aucun utilisateur connecté');
        authContainer.style.display = 'flex';
        chatContainer.style.display = 'none';
    }
});
