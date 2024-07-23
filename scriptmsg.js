document.addEventListener("DOMContentLoaded", function() {
    const userId = generateUserId();
    document.getElementById('user-id-value').textContent = userId;

    document.getElementById('start-chat').addEventListener('click', startChat);
    document.getElementById('send-message').addEventListener('click', sendMessage);

    let currentChatId = null;

    function generateUserId() {
        return 'user-' + Math.random().toString(36).substr(2, 9);
    }

    function startChat() {
        const contactId = document.getElementById('contact-id').value;
        if (contactId) {
            currentChatId = contactId;
            document.getElementById('messages').innerHTML += `<div>Discussion avec ${contactId}</div>`;
        } else {
            alert('Veuillez entrer un ID de contact valide.');
        }
    }

    function sendMessage() {
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value;
        if (message && currentChatId) {
            // Simuler l'envoi du message
            document.getElementById('messages').innerHTML += `<div><strong>${userId}:</strong> ${message}</div>`;
            messageInput.value = '';
            // Ajouter ici la logique pour envoyer le message au serveur ou à l'autre utilisateur
        } else {
            alert('Veuillez entrer un message et sélectionner un contact.');
        }
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
