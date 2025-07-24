// OpenAI API Configuration
// IMPORTANT: Insert your OpenAI API key below. Never commit your real key to a public repo!
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE';

function ChatManager() {
    this.conversationHistory = [
        {
            role: "system",
            content: "You are Xiaoyu, a friendly and helpful AI companion. You are cheerful, supportive, and always try to be helpful. Keep your responses concise but warm. You can speak both English and Chinese (Mandarin). If the user speaks Chinese, respond in Chinese. If they speak English, respond in English. Be conversational and engaging."
        }
    ];
    this.speechSynthesis = window.speechSynthesis;
    this.speechUtterance = null;
    this.isSpeaking = false;
}

ChatManager.prototype.sendMessage = async function(userMessage) {
    try {
        this.conversationHistory.push({ role: "user", content: userMessage });
        const response = await this.callOpenAI();
        this.conversationHistory.push({ role: "assistant", content: response });
        return response;
    } catch (error) {
        console.error('Error sending message:', error);
        return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
    }
};

ChatManager.prototype.callOpenAI = async function() {
    if (OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
        return "[ERROR] Please add your OpenAI API key in src/chat.js.";
    }
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: this.conversationHistory,
            max_tokens: 150,
            temperature: 0.7
        })
    });
    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.choices[0].message.content.trim();
};

ChatManager.prototype.speakText = function(text) {
    if (this.isSpeaking) this.stopSpeaking();
    this.speechUtterance = new SpeechSynthesisUtterance(text);
    const isChinese = /[\u4e00-\u9fff]/.test(text);
    if (isChinese) {
        const voices = this.speechSynthesis.getVoices();
        const chineseVoice = voices.find(voice => voice.lang.includes('zh') || voice.lang.includes('cmn'));
        if (chineseVoice) {
            this.speechUtterance.voice = chineseVoice;
            this.speechUtterance.lang = chineseVoice.lang;
        }
    } else {
        this.speechUtterance.lang = 'en-US';
    }
    this.speechUtterance.rate = 0.9;
    this.speechUtterance.pitch = 1.0;
    this.speechUtterance.volume = 0.8;
    this.speechUtterance.onstart = () => { this.isSpeaking = true; };
    this.speechUtterance.onend = () => { this.isSpeaking = false; };
    this.speechUtterance.onerror = () => { this.isSpeaking = false; };
    this.speechSynthesis.speak(this.speechUtterance);
};

ChatManager.prototype.stopSpeaking = function() {
    if (this.speechSynthesis.speaking) {
        this.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
};

window.ChatManager = ChatManager; 