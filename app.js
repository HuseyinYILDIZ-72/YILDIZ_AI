// API Yapılandırması
const API_CONFIG = {
    apiKey: 'AIzaSyDfWCfD-_Ybtkke6EyjV_IPVUrW80o_Ozk',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
};

// Bot Kimlik Bilgileri
const BOT_IDENTITY = {
    name: "YILDIZ AI",
    version: "1.0",
    creator: "Hüseyin YILDIZ",
    creationDate: "2025",
    specialty: "Yapay Zeka Asistanı",
    currentDate: "2025-04-04 16:02:26",  // Güncellendi
    currentUser: "HuseyinYILDIZ-72",     // Güncellendi
    languages: ["Türkçe", "English"],
    capabilities: [
        "Doğal dil işleme",
        "Metin analizi",
        "Problem çözme",
        "Kod analizi",
        "Sohbet desteği"
    ],
    responses: {
        identity: [
            "Ben YILDIZ AI'yım, Hüseyin YILDIZ tarafından geliştirilen bir yapay zeka asistanıyım.",
            "Adım YILDIZ AI ve yaratıcım Hüseyin YILDIZ.",
            "Ben bir yapay zeka asistanıyım, adım YILDIZ AI."
        ],
        creator: [
            "Beni Hüseyin YILDIZ geliştirdi.",
            "Yaratıcım Hüseyin YILDIZ.",
            "Hüseyin YILDIZ tarafından programlandım."
        ],
        purpose: [
            "Amacım size yardımcı olmak ve sorularınızı yanıtlamak.",
            "Size en iyi şekilde yardımcı olmak için buradayım.",
            "Sorularınızı yanıtlamak ve size destek olmak için varım."
        ]
    }
};

// Global değişkenler
let chats = [];
let currentChatId = null;
let isProcessing = false;
let editingChatId = null;

// Viewport height düzeltmesi
function setVHProperty() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Cihaz yön değişimi kontrolü
function handleOrientationChange() {
    setTimeout(setVHProperty, 100);
}

// Yıldız efekti için yardımcı fonksiyon
function generateStars(count) {
    let stars = '';
    for (let i = 0; i < count; i++) {
        const x = Math.floor(Math.random() * window.innerWidth);
        const y = Math.floor(Math.random() * window.innerHeight);
        const opacity = Math.random();
        stars += `${x}px ${y}px rgba(255, 255, 255, ${opacity}),`;
    }
    return stars.slice(0, -1);
}

// Yıldız efektlerini oluştur
function initializeStarEffects() {
    const stars1 = document.getElementById('stars');
    const stars2 = document.getElementById('stars2');
    const stars3 = document.getElementById('stars3');

    stars1.style.boxShadow = generateStars(700);
    stars2.style.boxShadow = generateStars(200);
    stars3.style.boxShadow = generateStars(100);
}

// Mesaj analizi ve yanıt fonksiyonu
function analyzeAndRespond(message) {
    const lowercaseMessage = message.toLowerCase().trim();
    
    // Kimlik ile ilgili soru kalıpları
    const identityPatterns = [
        'kimsin', 'adın ne', 'sen nesin', 'kendini tanıt',
        'who are you', 'what is your name', 'introduce yourself'
    ];

    // Yaratıcı ile ilgili soru kalıpları
    const creatorPatterns = [
        'seni kim yaptı', 'kim yarattı', 'kim geliştirdi', 'kim programladı',
        'who created you', 'who made you', 'who developed you'
    ];

    // Amaç ile ilgili soru kalıpları
    const purposePatterns = [
        'amacın ne', 'ne için varsın', 'görevin ne',
        'what is your purpose', 'why do you exist'
    ];

    // Rastgele yanıt seçme fonksiyonu
    function getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Soru kalıplarını kontrol et ve uygun yanıtı döndür
    if (identityPatterns.some(pattern => lowercaseMessage.includes(pattern))) {
        return getRandomResponse(BOT_IDENTITY.responses.identity);
    }
    else if (creatorPatterns.some(pattern => lowercaseMessage.includes(pattern))) {
        return getRandomResponse(BOT_IDENTITY.responses.creator);
    }
    else if (purposePatterns.some(pattern => lowercaseMessage.includes(pattern))) {
        return getRandomResponse(BOT_IDENTITY.responses.purpose);
    }

    return null;
}

// Sohbet yönetimi
function startNewChat() {
    const chatId = Date.now().toString();
    const newChat = {
        id: chatId,
        title: "Yeni Sohbet",
        messages: [],
        created: new Date().toISOString()
    };
    
    chats.push(newChat);
    currentChatId = chatId;
    
    document.getElementById('chatBox').innerHTML = '';
    
    addMessage(
        `Merhaba! Ben ${BOT_IDENTITY.name}, size nasıl yardımcı olabilirim?`, 
        'ai'
    );
    
    updateChatList();
    saveChats();
}

// Sohbet silme
function deleteChat(chatId, event) {
    event.stopPropagation();
    if (confirm('Bu sohbeti silmek istediğinizden emin misiniz?')) {
        chats = chats.filter(chat => chat.id !== chatId);
        if (currentChatId === chatId) {
            currentChatId = chats.length > 0 ? chats[0].id : null;
            if (currentChatId) {
                loadChat(currentChatId);
            } else {
                startNewChat();
            }
        }
        saveChats();
        updateChatList();
    }
}

// Sohbet adı düzenleme
function editChatName(chatId, event) {
    event.stopPropagation();
    editingChatId = chatId;
    const chat = chats.find(c => c.id === chatId);
    const modal = document.getElementById('chatNameModal');
    const input = document.getElementById('chatNameInput');
    input.value = chat.title;
    modal.style.display = 'block';
    input.focus();
}

function saveChatName() {
    const input = document.getElementById('chatNameInput');
    const newName = input.value.trim();
    if (newName && editingChatId) {
        const chat = chats.find(c => c.id === editingChatId);
        if (chat) {
            chat.title = newName;
            saveChats();
            updateChatList();
        }
    }
    closeModal();
}

function closeModal() {
    document.getElementById('chatNameModal').style.display = 'none';
    editingChatId = null;
}

// Chat list güncelleme
function updateChatList() {
    const chatList = document.getElementById('chatList');
    chatList.innerHTML = '';
    
    chats.sort((a, b) => new Date(b.created) - new Date(a.created)).forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${chat.id === currentChatId ? 'active' : ''}`;
        chatItem.onclick = () => loadChat(chat.id);
        
        chatItem.innerHTML = `
            <div class="chat-item-content">
                <div class="chat-item-title">${chat.title}</div>
                <div class="chat-item-preview">${chat.messages.length > 0 ? 
                    chat.messages[chat.messages.length - 1].content.substring(0, 30) + '...' : 
                    'Yeni sohbet'}</div>
            </div>
            <div class="chat-item-actions">
                <button class="chat-action-btn" onclick="editChatName('${chat.id}', event)">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="chat-action-btn delete" onclick="deleteChat('${chat.id}', event)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        chatList.appendChild(chatItem);
    });
}

// Sohbet yükleme
function loadChat(chatId) {
    currentChatId = chatId;
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    
    const chatBox = document.getElementById('chatBox');
    chatBox.innerHTML = '';
    
    chat.messages.forEach(msg => {
        addMessage(msg.content, msg.type, false);
    });
    
    updateChatList();

    // Mobilde sidebar'ı kapat
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

// Local storage işlemleri
function saveChats() {
    localStorage.setItem('chats', JSON.stringify(chats));
}

function loadChats() {
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
        chats = JSON.parse(savedChats);
        updateChatList();
        
        if (chats.length > 0) {
            loadChat(chats[0].id);
        } else {
            startNewChat();
        }
    } else {
        startNewChat();
    }
}

// Mesaj ekleme
function addMessage(content, type, saveToChat = true) {
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    messageDiv.className = 'message-container';
    
    function processMessageContent(text) {
        return text
            .replace(/\*/g, '')
            .split('\n')
            .map(line => line.trim())
            .join('\n')
            .replace(/\n\s*\n/g, '\n\n')
            .replace(/\n/g, '<br>')
            .trim();
    }
    
    if (type === 'ai') {
        // AI mesajı için yavaş yazma animasyonu
        messageDiv.innerHTML = `
            <div class="message ${type}-message">
                <div class="message-content">
                    <div class="message-text"></div>
                    <div class="message-time">${time}</div>
                </div>
            </div>
        `;
        
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;

        const messageText = messageDiv.querySelector('.message-text');
        const processedContent = processMessageContent(content);
        let index = 0;
        const speed = 30; // Yazma hızı (düşük = daha hızlı)
        
        function typeText() {
            if (index < processedContent.length) {
                messageText.innerHTML = processedContent.substring(0, index + 1);
                index++;
                chatBox.scrollTop = chatBox.scrollHeight;
                setTimeout(typeText, speed);
            }
        }
        
        typeText();
    } else {
        // Kullanıcı mesajları için anında gösterim
        const processedContent = processMessageContent(content);
        messageDiv.innerHTML = `
            <div class="message ${type}-message">
                <div class="message-content">
                    <div class="message-text">${processedContent}</div>
                    <div class="message-time">${time}</div>
                </div>
            </div>
        `;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    if (saveToChat && currentChatId) {
        const currentChat = chats.find(c => c.id === currentChatId);
        if (currentChat) {
            currentChat.messages.push({
                content,
                type,
                timestamp: new Date().toISOString()
            });
            
            if (type === 'user' && currentChat.messages.length === 1) {
                currentChat.title = content.length > 30 ? content.substring(0, 27) + '...' : content;
                updateChatList();
            }
            
            saveChats();
        }
    }
    
    return messageDiv;
}

// Sidebar Toggle ve Overlay
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainChatArea = document.querySelector('.main-chat-area');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar.classList.contains('collapsed')) {
        // Sidebar'ı aç
        sidebar.classList.remove('collapsed');
        if (window.innerWidth <= 768) {
            if (!overlay) {
                const newOverlay = document.createElement('div');
                newOverlay.className = 'sidebar-overlay';
                newOverlay.onclick = toggleSidebar;
                document.body.appendChild(newOverlay);
                requestAnimationFrame(() => {
                    newOverlay.classList.add('active');
                });
            }
        }
    } else {
        // Sidebar'ı kapat
        sidebar.classList.add('collapsed');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }
    
    // Desktop için main chat area margin'ini güncelle
    if (window.innerWidth > 768) {
        mainChatArea.style.marginLeft = sidebar.classList.contains('collapsed') ? '0' : '';
    }
}

// API İşleyici
async function queryGeminiAPI(prompt) {
    try {
        const response = await fetch(`${API_CONFIG.apiEndpoint}?key=${API_CONFIG.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text || 'Üzgünüm, yanıt oluşturulamadı.';

    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Mesaj gönderme
async function sendMessage() {
    if (isProcessing) return;

    const input = document.getElementById('userInput');
    const message = input.value.trim();
    if (!message) return;

    isProcessing = true;
    
    if (!currentChatId) {
        startNewChat();
    }

    input.value = '';
    input.style.height = 'auto';

    addMessage(message, 'user');
    
    const specialResponse = analyzeAndRespond(message);
    
    if (specialResponse) {
        setTimeout(() => {
            addMessage(specialResponse, 'ai');
            isProcessing = false;
        }, Math.random() * 1000 + 500);
        return;
    }

    try {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator-container';
        typingIndicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        document.getElementById('chatBox').appendChild(typingIndicator);

        let response = await queryGeminiAPI(message);
        typingIndicator.remove();
        addMessage(response, 'ai');
    } catch (error) {
        console.error('API Error:', error);
        const typingIndicator = document.querySelector('.typing-indicator-container');
        if (typingIndicator) typingIndicator.remove();
        addMessage('Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.', 'ai');
    }

    isProcessing = false;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeStarEffects();
    loadChats();
    setVHProperty();
    
    setTimeout(() => {
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('appContainer').style.display = 'block';
    }, 2500);
});

// Enter tuşu ile mesaj gönderme
document.getElementById('userInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isProcessing) {
        e.preventDefault();
        sendMessage();
    }
});

// Textarea otomatik yükseklik
document.getElementById('userInput').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Pencere yeniden boyutlandığında ve yön değiştirdiğinde
window.addEventListener('resize', () => {
    initializeStarEffects();
    setVHProperty();
});

// Cihaz yön değişimi
window.addEventListener('orientationchange', handleOrientationChange);

// iOS Safari için scroll düzeltmesi
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.chat-box, textarea')) {
        e.stopPropagation();
    } else {
        e.preventDefault();
    }
}, { passive: false });

// PWA Servis Worker Kaydı
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker başarıyla kaydedildi');
            })
            .catch(err => {
                console.log('ServiceWorker kaydı başarısız:', err);
            });
    });
}
