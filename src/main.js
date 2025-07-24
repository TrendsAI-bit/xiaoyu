window.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById('model-canvas');
    var chatInput = document.getElementById('chat-input');
    var sendButton = document.getElementById('send-button');
    var chatMessages = document.getElementById('chat-messages');
    var loading = document.getElementById('loading');

    // Initialize VRM model
    var vrmModel = new window.VRMModel(canvas);
    // Initialize chat manager
    var chatManager = new window.ChatManager();
    var isProcessing = false;

    // Send message handler
    async function handleSendMessage() {
        var message = chatInput.value.trim();
        if (!message || isProcessing) return;
        chatInput.value = '';
        sendButton.disabled = true;
        isProcessing = true;
        addMessageToChat('user', message);
        showTypingIndicator();
        try {
            var response = await chatManager.sendMessage(message);
            removeTypingIndicator();
            addMessageToChat('assistant', response);
            vrmModel.reactToResponse();
            chatManager.speakText(response);
        } catch (error) {
            removeTypingIndicator();
            addMessageToChat('assistant', "I'm sorry, I'm having trouble connecting right now. Please try again later.");
        }
        isProcessing = false;
        sendButton.disabled = false;
        chatInput.focus();
    }

    // UI helpers
    function addMessageToChat(role, content) {
        var messageDiv = document.createElement('div');
        messageDiv.className = 'message ' + role;
        var contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(10px)';
        messageDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        setTimeout(function() {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 10);
    }
    function showTypingIndicator() {
        var typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing-indicator';
        typingDiv.id = 'typing-indicator';
        var contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
        typingDiv.appendChild(contentDiv);
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    function removeTypingIndicator() {
        var typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) typingIndicator.remove();
    }

    // Event listeners
    sendButton.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    chatInput.addEventListener('input', function() {
        sendButton.disabled = !chatInput.value.trim() || isProcessing;
    });

    // Typing indicator CSS
    var style = document.createElement('style');
    style.textContent = '.typing-dots { display: flex; gap: 4px; align-items: center; } .typing-dots span { width: 8px; height: 8px; border-radius: 50%; background-color: #999; animation: typing 1.4s infinite ease-in-out; } .typing-dots span:nth-child(1) { animation-delay: -0.32s; } .typing-dots span:nth-child(2) { animation-delay: -0.16s; } @keyframes typing { 0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }';
    document.head.appendChild(style);

    // Stop speech on tab change or unload
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) chatManager.stopSpeaking();
    });
    window.addEventListener('beforeunload', function() {
        chatManager.stopSpeaking();
    });
}); 