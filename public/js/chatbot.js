/**
 * Kryptohjelpen Chatbot Widget
 * A floating chat widget for crypto/Web3 assistance
 */

(function() {
  'use strict';

  // State
  let isOpen = false;
  let hasAccess = false;
  let userEmail = localStorage.getItem('chatbot_email') || '';
  let messages = [];

  // Create chat widget HTML
  function createChatWidget() {
    const widget = document.createElement('div');
    widget.id = 'krypto-chatbot';
    widget.innerHTML = `
      <!-- Chat Toggle Button -->
      <button id="chat-toggle" class="chat-toggle" aria-label="Åpne chat">
        <span class="chat-icon">💬</span>
        <span class="close-icon">✕</span>
        <span class="chat-badge" style="display: none;">!</span>
      </button>

      <!-- Chat Window -->
      <div id="chat-window" class="chat-window">
        <!-- Header -->
        <div class="chat-header">
          <div class="chat-header-info">
            <span class="chat-header-icon">🔐</span>
            <div class="chat-header-text">
              <span class="chat-header-title">Kryptohjelpen</span>
              <span class="chat-header-status" id="chat-status">Teknisk veiledning</span>
            </div>
          </div>
          <button id="chat-close" class="chat-close-btn" aria-label="Lukk chat">✕</button>
        </div>

        <!-- Messages Container -->
        <div id="chat-messages" class="chat-messages">
          <!-- Welcome message -->
          <div class="chat-message assistant">
            <div class="message-content">
              <strong>Hei! 👋</strong><br><br>
              Jeg er Kryptohjelpen-assistenten. Jeg kan hjelpe deg med spørsmål om krypto, wallets, sikkerhet og Web3.
              <br><br>
              <em>Vi tilbyr tre typer hjelp – fra digital chatbot til personlig rådgivning. Hva kan jeg hjelpe deg med?</em>
            </div>
          </div>
        </div>

        <!-- Email Verification (shown when no access) -->
        <div id="email-verify" class="email-verify" style="display: none;">
          <div class="email-verify-content">
            <p>Har du allerede kjøpt tilgang? Oppgi e-posten din:</p>
            <div class="email-input-group">
              <input type="email" id="email-input" placeholder="din@epost.no" />
              <button id="verify-btn">Sjekk</button>
            </div>
            <p class="email-note">Eller <a href="#" id="buy-access-link">kjøp tilgang her</a></p>
          </div>
        </div>

        <!-- Input Area -->
        <div class="chat-input-container">
          <div class="chat-input-wrapper">
            <input 
              type="text" 
              id="chat-input" 
              class="chat-input" 
              placeholder="Skriv din melding..."
              autocomplete="off"
            />
            <button id="chat-send" class="chat-send-btn" aria-label="Send melding">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"/>
              </svg>
            </button>
          </div>
          <p class="chat-disclaimer">Vi gir kun teknisk veiledning, ikke investeringsråd.</p>
        </div>
      </div>
    `;

    document.body.appendChild(widget);
    injectStyles();
    attachEventListeners();
    loadHistory();
    checkStatus();
  }

  // Inject CSS styles
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #krypto-chatbot {
        --chat-primary: #8DC99C;
        --chat-primary-dark: #5a9a6a;
        --chat-secondary: #1e293b;
        --chat-bg: #ffffff;
        --chat-border: #e2e8f0;
        --chat-message-user: #8DC99C;
        --chat-message-assistant: #f1f5f9;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 10000;
      }

      /* Toggle Button */
      .chat-toggle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--chat-primary) 0%, var(--chat-primary-dark) 100%);
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(141, 201, 156, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        position: relative;
      }

      .chat-toggle:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 25px rgba(141, 201, 156, 0.5);
      }

      .chat-toggle .chat-icon,
      .chat-toggle .close-icon {
        font-size: 24px;
        transition: all 0.3s ease;
      }

      .chat-toggle .close-icon {
        display: none;
        color: white;
        font-size: 20px;
      }

      .chat-toggle.open .chat-icon {
        display: none;
      }

      .chat-toggle.open .close-icon {
        display: block;
      }

      .chat-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: #ef4444;
        color: white;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        font-size: 12px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Chat Window */
      .chat-window {
        position: absolute;
        bottom: 75px;
        right: 0;
        width: 380px;
        max-width: calc(100vw - 48px);
        height: 550px;
        max-height: calc(100vh - 120px);
        background: var(--chat-bg);
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px) scale(0.95);
        transition: all 0.3s ease;
      }

      .chat-window.open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
      }

      /* Header */
      .chat-header {
        background: linear-gradient(135deg, var(--chat-primary) 0%, var(--chat-primary-dark) 100%);
        color: white;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .chat-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .chat-header-icon {
        font-size: 28px;
      }

      .chat-header-text {
        display: flex;
        flex-direction: column;
      }

      .chat-header-title {
        font-weight: 700;
        font-size: 16px;
      }

      .chat-header-status {
        font-size: 12px;
        opacity: 0.9;
      }

      .chat-close-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      .chat-close-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      /* Messages */
      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #fafafa;
      }

      .chat-message {
        max-width: 85%;
        animation: messageSlide 0.3s ease;
      }

      @keyframes messageSlide {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .chat-message.user {
        align-self: flex-end;
      }

      .chat-message.assistant {
        align-self: flex-start;
      }

      .message-content {
        padding: 12px 16px;
        border-radius: 16px;
        line-height: 1.5;
        font-size: 14px;
      }

      .chat-message.user .message-content {
        background: var(--chat-message-user);
        color: white;
        border-bottom-right-radius: 4px;
      }

      .chat-message.assistant .message-content {
        background: white;
        color: var(--chat-secondary);
        border-bottom-left-radius: 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      }

      .message-content strong {
        color: inherit;
      }

      .message-content em {
        opacity: 0.8;
      }

      /* Email Verification */
      .email-verify {
        background: #f8fafc;
        border-top: 1px solid var(--chat-border);
        padding: 12px 16px;
      }

      .email-verify-content p {
        margin: 0 0 8px 0;
        font-size: 13px;
        color: #64748b;
      }

      .email-input-group {
        display: flex;
        gap: 8px;
      }

      .email-input-group input {
        flex: 1;
        padding: 8px 12px;
        border: 2px solid var(--chat-border);
        border-radius: 8px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
      }

      .email-input-group input:focus {
        border-color: var(--chat-primary);
      }

      .email-input-group button {
        padding: 8px 16px;
        background: var(--chat-primary);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }

      .email-input-group button:hover {
        background: var(--chat-primary-dark);
      }

      .email-note {
        font-size: 12px !important;
        margin-top: 8px !important;
      }

      .email-note a {
        color: var(--chat-primary-dark);
        text-decoration: underline;
      }

      /* Input Area */
      .chat-input-container {
        padding: 12px 16px;
        background: white;
        border-top: 1px solid var(--chat-border);
      }

      .chat-input-wrapper {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .chat-input {
        flex: 1;
        padding: 12px 16px;
        border: 2px solid var(--chat-border);
        border-radius: 24px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
      }

      .chat-input:focus {
        border-color: var(--chat-primary);
      }

      .chat-send-btn {
        width: 44px;
        height: 44px;
        background: var(--chat-primary);
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        flex-shrink: 0;
      }

      .chat-send-btn:hover {
        background: var(--chat-primary-dark);
        transform: scale(1.05);
      }

      .chat-send-btn:disabled {
        background: #cbd5e1;
        cursor: not-allowed;
        transform: none;
      }

      .chat-disclaimer {
        margin: 8px 0 0 0;
        font-size: 11px;
        color: #94a3b8;
        text-align: center;
      }

      /* Typing Indicator */
      .typing-indicator {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
        background: white;
        border-radius: 16px;
        border-bottom-left-radius: 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        width: fit-content;
      }

      .typing-dot {
        width: 8px;
        height: 8px;
        background: var(--chat-primary);
        border-radius: 50%;
        animation: typingBounce 1.4s ease-in-out infinite;
      }

      .typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }

      .typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typingBounce {
        0%, 60%, 100% {
          transform: translateY(0);
        }
        30% {
          transform: translateY(-8px);
        }
      }

      /* Access Badge */
      .access-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        background: rgba(141, 201, 156, 0.2);
        color: var(--chat-primary-dark);
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        margin-top: 8px;
      }

      .access-badge.no-access {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }

      /* CTA Button */
      .cta-button {
        display: inline-block;
        margin-top: 12px;
        padding: 10px 20px;
        background: var(--chat-primary);
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        transition: background 0.2s;
      }

      .cta-button:hover {
        background: var(--chat-primary-dark);
      }

      /* Product Options */
      .product-options {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 12px;
      }

      .product-option-btn {
        padding: 12px 16px;
        background: white;
        border: 2px solid var(--chat-primary);
        border-radius: 10px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        color: var(--chat-secondary);
        text-align: left;
        transition: all 0.2s ease;
      }

      .product-option-btn:hover {
        background: var(--chat-primary);
        color: white;
        transform: translateX(4px);
      }

      .product-option-btn:active {
        transform: scale(0.98);
      }

      /* Mobile Responsive */
      @media (max-width: 480px) {
        #krypto-chatbot {
          bottom: 16px;
          right: 16px;
        }

        .chat-toggle {
          width: 54px;
          height: 54px;
        }

        .chat-window {
          width: calc(100vw - 32px);
          height: calc(100vh - 100px);
          bottom: 70px;
          right: -8px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Attach event listeners
  function attachEventListeners() {
    const toggle = document.getElementById('chat-toggle');
    const closeBtn = document.getElementById('chat-close');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const verifyBtn = document.getElementById('verify-btn');
    const emailInput = document.getElementById('email-input');
    const buyLink = document.getElementById('buy-access-link');

    toggle.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);
    
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    verifyBtn.addEventListener('click', verifyEmail);
    emailInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        verifyEmail();
      }
    });

    buyLink.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToProduct();
    });
  }

  // Toggle chat window
  function toggleChat() {
    isOpen = !isOpen;
    const toggle = document.getElementById('chat-toggle');
    const window = document.getElementById('chat-window');
    
    toggle.classList.toggle('open', isOpen);
    window.classList.toggle('open', isOpen);
    
    if (isOpen) {
      document.getElementById('chat-input').focus();
    }
  }

  // Send message
  async function sendMessage(overrideMessage = null, productSelection = null) {
    const input = document.getElementById('chat-input');
    const message = overrideMessage || input.value.trim();
    
    if (!message && !productSelection) return;
    
    if (!overrideMessage) {
      input.value = '';
    }
    
    // Add user message (unless it's a button click)
    if (!productSelection) {
      addMessage('user', message);
    }
    
    // Show typing indicator
    showTyping();
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          message: message || 'Valgte produkt',
          email: userEmail || null,
          productSelection: productSelection || null
        })
      });
      
      const data = await response.json();
      
      hideTyping();
      
      // Update access status
      hasAccess = data.hasAccess;
      updateAccessUI();
      
      // Add response with possible CTA
      let responseHtml = formatResponse(data.response);
      
      // Show product option buttons
      if (data.showProductOptions) {
        responseHtml += `
          <div class="product-options">
            <button class="product-option-btn" onclick="window.chatbot.selectProduct('digital')">
              💬 Digital assistent - 250,-
            </button>
            <button class="product-option-btn" onclick="window.chatbot.selectProduct('personal')">
              👤 Personlig rådgivning - 1 490,-
            </button>
            <button class="product-option-btn" onclick="window.chatbot.selectProduct('business')">
              🏢 Bedriftskurs - Ta kontakt
            </button>
          </div>`;
      }
      
      // Add appropriate CTA button based on selected product
      if (data.redirectToProduct) {
        responseHtml += `<br><br><a href="#" class="cta-button" onclick="window.chatbot.scrollToProduct(); return false;">🛒 Kjøp chatbot-tilgang (250,-)</a>`;
      }
      
      if (data.redirectToKonsultasjon) {
        responseHtml += `<br><br><a href="/konsultasjon" class="cta-button">📅 Bestill konsultasjon (1 490,-)</a>`;
      }
      
      if (data.redirectToKontakt) {
        responseHtml += `<br><br><a href="/kontakt" class="cta-button">✉️ Kontakt oss</a>`;
      }
      
      addMessage('assistant', responseHtml, true);
      
    } catch (error) {
      hideTyping();
      addMessage('assistant', 'Beklager, noe gikk galt. Prøv igjen senere.');
    }
  }

  // Select product (from button click)
  async function selectProduct(productId) {
    // Remove previous product option buttons (they're one-time use)
    const existingOptions = document.querySelectorAll('.product-options');
    existingOptions.forEach(el => el.remove());
    
    // Show what they selected
    const productNames = {
      digital: '💬 Digital assistent',
      personal: '👤 Personlig rådgivning',
      business: '🏢 Bedriftskurs'
    };
    addMessage('user', productNames[productId] || productId);
    
    // Send selection to backend
    await sendMessage(null, productId);
  }

  // Verify email
  async function verifyEmail() {
    const input = document.getElementById('email-input');
    const email = input.value.trim();
    
    if (!email || !isValidEmail(email)) {
      showEmailError('Vennligst oppgi en gyldig e-postadresse');
      return;
    }
    
    try {
      const response = await fetch('/api/chat/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      hasAccess = data.hasAccess;
      
      if (hasAccess) {
        userEmail = email;
        localStorage.setItem('chatbot_email', email);
        addMessage('assistant', `✅ ${data.message}`);
      } else {
        addMessage('assistant', `❌ ${data.message}<br><br><a href="#" class="cta-button" onclick="window.chatbot.scrollToProduct(); return false;">🛒 Kjøp tilgang</a>`, true);
      }
      
      updateAccessUI();
      
    } catch (error) {
      showEmailError('Kunne ikke verifisere. Prøv igjen.');
    }
  }

  // Load chat history
  async function loadHistory() {
    try {
      const response = await fetch('/api/chat/history', {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.messages && data.messages.length > 0) {
        const container = document.getElementById('chat-messages');
        // Keep welcome message, add history
        data.messages.forEach(msg => {
          addMessage(msg.role, formatResponse(msg.content), true, false);
        });
      }
    } catch (error) {
      console.log('Could not load chat history');
    }
  }

  // Check current status
  async function checkStatus() {
    try {
      const response = await fetch('/api/chat/status', {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      hasAccess = data.hasAccess;
      if (data.email) {
        userEmail = data.email;
      }
      
      updateAccessUI();
      
    } catch (error) {
      console.log('Could not check status');
    }
  }

  // Update UI based on access
  function updateAccessUI() {
    const status = document.getElementById('chat-status');
    const emailVerify = document.getElementById('email-verify');
    
    if (hasAccess) {
      status.textContent = '✓ Tilgang aktivert';
      emailVerify.style.display = 'none';
    } else {
      status.textContent = 'Teknisk veiledning';
      emailVerify.style.display = 'block';
    }
  }

  // Add message to chat
  function addMessage(role, content, isHtml = false, scroll = true) {
    const container = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (isHtml) {
      contentDiv.innerHTML = content;
    } else {
      contentDiv.textContent = content;
    }
    
    messageDiv.appendChild(contentDiv);
    container.appendChild(messageDiv);
    
    if (scroll) {
      container.scrollTop = container.scrollHeight;
    }
    
    messages.push({ role, content });
  }

  // Format response (basic markdown-like formatting)
  function formatResponse(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }

  // Show typing indicator
  function showTyping() {
    const container = document.getElementById('chat-messages');
    const typing = document.createElement('div');
    typing.id = 'typing-indicator';
    typing.className = 'chat-message assistant';
    typing.innerHTML = `
      <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
  }

  // Hide typing indicator
  function hideTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  }

  // Show email error
  function showEmailError(message) {
    const input = document.getElementById('email-input');
    input.style.borderColor = '#ef4444';
    setTimeout(() => {
      input.style.borderColor = '';
    }, 2000);
  }

  // Validate email
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Scroll to product
  function scrollToProduct() {
    toggleChat();
    // Find the chatbot product card and scroll to it
    const productCards = document.querySelectorAll('.product-card');
    for (const card of productCards) {
      if (card.textContent.includes('Øyeblikkelig hjelp') || card.textContent.includes('Chatbot')) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.animation = 'pulse 1s ease';
        setTimeout(() => {
          card.style.animation = '';
        }, 1000);
        break;
      }
    }
    
    // Add pulse animation if not exists
    if (!document.getElementById('chatbot-pulse-animation')) {
      const style = document.createElement('style');
      style.id = 'chatbot-pulse-animation';
      style.textContent = `
        @keyframes pulse {
          0%, 100% { box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          50% { box-shadow: 0 0 0 8px rgba(141, 201, 156, 0.3); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Expose functions for use in HTML
  window.chatbot = {
    scrollToProduct,
    selectProduct,
    open: () => { if (!isOpen) toggleChat(); },
    close: () => { if (isOpen) toggleChat(); }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatWidget);
  } else {
    createChatWidget();
  }
})();
