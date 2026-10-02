/**
 * ==========================================================
 * DEVIOZ AI CHATBOT - CONTROLADOR CLIENTE
 * ==========================================================
 * Gestiona la ventana flotante interactiva para los usuarios
 * y visitantes del portafolio. Las consultas se envían al backend
 * donde se utiliza la API Key de Gemini configurada por el
 * administrador desde el panel de administración.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Referencias principales al DOM
    const wrapper = document.getElementById('deviozChatbotRoot');
    if (!wrapper) return;

    const toggleBtn = document.getElementById('chatbotToggleBtn');
    const chatWindow = document.getElementById('chatbotWindow');
    const closeBtn = document.getElementById('chatbotCloseBtn');
    const resetBtn = document.getElementById('chatbotResetBtn');
    const messagesBox = document.getElementById('chatbotMessages');
    const inputForm = document.getElementById('chatbotInputForm');
    const userInput = document.getElementById('chatbotUserInput');
    const sendBtn = document.getElementById('chatbotSendBtn');
    const typingIndicator = document.getElementById('chatbotTypingIndicator');
    const welcomeBubble = document.getElementById('chatbotWelcomeBubble');

    // Historial de conversación en memoria (rol: 'user' | 'model', text: string)
    let conversationHistory = [];
    let isWaitingResponse = false;

    // ----------------------------------------------------------
    // 1. Detección Inteligente del Endpoint del Backend
    // ----------------------------------------------------------
    function getBackendChatbotEndpoint() {
        const port = window.location.port;
        const isLiveDev = (port === '5500' || port === '5501' || port === '3000' || port === '5173' || window.location.protocol === 'file:');
        const host = window.location.hostname || 'localhost';

        if (isLiveDev) {
            return `http://${host}/portafolio-Devioz/backend/api/chatbot.php`;
        }
        return 'backend/api/chatbot.php';
    }

    // ----------------------------------------------------------
    // 2. Control de Apertura / Cierre de la Ventana de Chat
    // ----------------------------------------------------------
    function toggleChat(forceOpen = null) {
        const isOpen = !chatWindow.classList.contains('d-none');
        const shouldOpen = forceOpen !== null ? forceOpen : !isOpen;

        if (shouldOpen) {
            if (welcomeBubble) welcomeBubble.classList.add('d-none');
            chatWindow.classList.remove('d-none', 'closing');
            toggleBtn.classList.add('is-active');
            scrollToBottom();
            setTimeout(() => {
                if (userInput) userInput.focus();
            }, 100);
        } else {
            chatWindow.classList.add('closing');
            toggleBtn.classList.remove('is-active');
            setTimeout(() => {
                chatWindow.classList.add('d-none');
                chatWindow.classList.remove('closing');
            }, 200);
        }
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => toggleChat());
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => toggleChat(false));
    }

    // Bubble de bienvenida
    if (welcomeBubble) {
        welcomeBubble.addEventListener('click', (e) => {
            if (e.target.closest('#chatbotBubbleClose')) {
                e.stopPropagation();
                welcomeBubble.classList.add('d-none');
                return;
            }
            toggleChat(true);
        });

        setTimeout(() => {
            if (welcomeBubble && !chatWindow.classList.contains('is-active')) {
                welcomeBubble.style.opacity = '0';
                welcomeBubble.style.transition = 'opacity 0.6s ease';
                setTimeout(() => welcomeBubble.classList.add('d-none'), 600);
            }
        }, 14000);
    }

    // ----------------------------------------------------------
    // 3. Envío de Mensaje del Usuario
    // ----------------------------------------------------------
    if (inputForm) {
        inputForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = userInput ? userInput.value.trim() : '';
            if (!message || isWaitingResponse) return;

            await handleSendMessage(message);
        });
    }

    async function handleSendMessage(messageText) {
        if (!messageText || isWaitingResponse) return;

        // Limpiar input y bloquear mientras se procesa
        if (userInput) userInput.value = '';
        setChatStateLoading(true);

        // Renderizar mensaje del usuario en el chat
        appendMessage('user', messageText);

        // Guardar en historial
        conversationHistory.push({ role: 'user', text: messageText });

        // Mostrar indicador de "escribiendo..."
        showTypingIndicator(true);

        try {
            const endpoint = getBackendChatbotEndpoint();
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    message: messageText,
                    history: conversationHistory
                })
            });

            const data = await response.json();

            showTypingIndicator(false);

            if (response.ok && data.status === 'success' && data.reply) {
                appendMessage('bot', data.reply);
                conversationHistory.push({ role: 'model', text: data.reply });
            } else {
                const errMsg = data.message || 'Lo siento, no pude procesar tu solicitud en este momento. Por favor, intenta de nuevo.';
                appendMessage('bot', `⚠️ ${errMsg}`);
            }
        } catch (err) {
            console.error('[Devioz Chatbot] Error al consultar API:', err);
            showTypingIndicator(false);
            appendMessage('bot', 'No pude conectar con el servidor en este momento. Si necesitas contactarnos directamente, puedes escribir a **contacto@devioz.com**.');
        } finally {
            setChatStateLoading(false);
            if (userInput) userInput.focus();
        }
    }

    // ----------------------------------------------------------
    // 4. Delegación de Clics en Sugerencias Rápidas (Pills)
    // ----------------------------------------------------------
    if (messagesBox) {
        messagesBox.addEventListener('click', (e) => {
            const pill = e.target.closest('.quick-pill-btn');
            if (pill && !isWaitingResponse) {
                const query = pill.getAttribute('data-query') || pill.textContent.trim();
                handleSendMessage(query);
            }
        });
    }

    // ----------------------------------------------------------
    // 5. Reiniciar Conversación
    // ----------------------------------------------------------
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (isWaitingResponse) return;
            conversationHistory = [];
            messagesBox.innerHTML = `
                <div class="chat-msg bot-msg">
                    <div class="chat-msg-avatar">🤖</div>
                    <div class="chat-msg-bubble">
                        <p class="mb-2">¡Conversación reiniciada! 🔄 ¿En qué puedo asistirte ahora?</p>
                        <p class="mb-0">Puedes hacerme cualquier pregunta o seleccionar una sugerencia:</p>
                    </div>
                </div>
                <div class="chatbot-quick-pills">
                    <button type="button" class="quick-pill-btn" data-query="¿Qué servicios y soluciones ofrece Devioz?">
                        🚀 ¿Qué servicios ofrecen?
                    </button>
                    <button type="button" class="quick-pill-btn" data-query="¿Cuáles son sus proyectos más destacados?">
                        💻 Proyectos destacados
                    </button>
                    <button type="button" class="quick-pill-btn" data-query="¿Qué tecnologías y herramientas manejan?">
                        ⚡ Tecnologías usadas
                    </button>
                    <button type="button" class="quick-pill-btn" data-query="¿Cómo puedo cotizar o contactar a Devioz?">
                        📩 Contactar / Cotizar
                    </button>
                </div>
            `;
            if (userInput) userInput.focus();
        });
    }

    // ----------------------------------------------------------
    // 6. Funciones de Renderizado y Formato Visual
    // ----------------------------------------------------------
    function appendMessage(sender, text) {
        const isBot = sender === 'bot';
        const msgEl = document.createElement('div');
        msgEl.className = `chat-msg ${isBot ? 'bot-msg' : 'user-msg'}`;

        const avatar = isBot ? '🤖' : '👤';
        const formattedHtml = formatChatText(text);

        msgEl.innerHTML = `
            <div class="chat-msg-avatar">${avatar}</div>
            <div class="chat-msg-bubble">${formattedHtml}</div>
        `;

        messagesBox.appendChild(msgEl);
        scrollToBottom();
    }

    function formatChatText(plain) {
        if (!plain) return '';

        // 1. Escapar caracteres HTML peligrosos
        let safe = plain
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // 2. Formato de negrita **texto**
        safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // 3. Formato de código en línea `código`
        safe = safe.replace(/`([^`]+)`/g, '<code style="background: rgba(0, 229, 212, 0.15); color: #5eead4; padding: 2px 6px; border-radius: 4px; font-size: 0.85em;">$1</code>');

        // 4. Formato de enlaces Markdown [texto](url)
        safe = safe.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1 ↗</a>');

        // 5. Detectar URLs directas que no estén ya dentro de etiquetas <a>
        safe = safe.replace(/(?<!href=")(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1 ↗</a>');

        // 6. Viñetas y saltos de línea
        safe = safe.replace(/\n• /g, '<br>• ');
        safe = safe.replace(/\n- /g, '<br>• ');
        safe = safe.replace(/\n/g, '<br>');

        return safe;
    }

    function showTypingIndicator(show) {
        if (!typingIndicator) return;
        if (show) {
            typingIndicator.classList.remove('d-none');
        } else {
            typingIndicator.classList.add('d-none');
        }
        scrollToBottom();
    }

    function setChatStateLoading(loading) {
        isWaitingResponse = loading;
        if (sendBtn) sendBtn.disabled = loading;
        if (userInput) userInput.disabled = loading;
    }

    function scrollToBottom() {
        if (messagesBox) {
            messagesBox.scrollTop = messagesBox.scrollHeight;
        }
    }
});
