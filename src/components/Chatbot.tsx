'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  upsell?: {
    type: 'chatbot' | 'consultation';
    message: string;
    productId?: number;
  };
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage, 
          history: messages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      const data = await res.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply || 'Beklager, noe gikk galt. Prøv igjen.',
      };

      if (data.upsell) {
        assistantMessage.upsell = data.upsell;
      }

      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Kunne ikke koble til. Prøv igjen senere.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAvailability = async () => {
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: '📅 Sjekk ledige tider for konsultasjon' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_availability' }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.reply,
        upsell: { type: 'consultation', message: 'Book konsultasjon', productId: 10 }
      }]);
    } catch {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Kunne ikke sjekke kalenderen. Prøv igjen senere.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: number) => {
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId, quantity: 1 })
      });

      if (res.ok) {
        window.dispatchEvent(new Event('cartUpdated'));
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: '✅ Lagt til i handlekurven! Gå til kassen for å fullføre kjøpet.' 
        }]);
      }
    } catch (error) {
      console.error('Add to cart error:', error);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#8DC99C] hover:bg-[#7ab889] text-white rounded-full shadow-lg flex items-center justify-center transition-all z-50"
        aria-label="Åpne chat"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-48px)] h-[550px] max-h-[75vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-[#8DC99C] text-white p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-bold">Kryptohjelpen</h3>
              <p className="text-sm opacity-90">Spør meg om krypto!</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-6">
                <p className="mb-3">👋 Hei! Jeg er her for å hjelpe.</p>
                <p className="text-sm mb-4">Generelle spørsmål er gratis. For krypto-hjelp trenger du chatbot-tilgang.</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={checkAvailability}
                    className="text-sm px-4 py-2 bg-white border border-[#8DC99C] text-[#8DC99C] rounded-full hover:bg-[#8DC99C]/10 transition-colors"
                  >
                    📅 Se ledige tider for konsultasjon
                  </button>
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-[#8DC99C] text-white rounded-br-md'
                        : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
                
                {/* Upsell buttons */}
                {msg.upsell && (
                  <div className="mt-2 flex gap-2 justify-start">
                    {msg.upsell.type === 'chatbot' && (
                      <button
                        onClick={() => addToCart(msg.upsell!.productId || 9)}
                        className="text-xs px-3 py-2 bg-[#8DC99C] text-white rounded-full hover:bg-[#7ab889] transition-colors flex items-center gap-1"
                      >
                        🔓 Kjøp chatbot-tilgang (250 kr)
                      </button>
                    )}
                    {msg.upsell.type === 'consultation' && (
                      <a
                        href="/konsultasjon"
                        className="text-xs px-3 py-2 bg-[#8DC99C] text-white rounded-full hover:bg-[#7ab889] transition-colors flex items-center gap-1"
                      >
                        📞 Book konsultasjon (1490 kr)
                      </a>
                    )}
                    <button
                      onClick={checkAvailability}
                      className="text-xs px-3 py-2 bg-white border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      📅 Se ledige tider
                    </button>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-white flex gap-2 overflow-x-auto">
              <button
                onClick={checkAvailability}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                📅 Ledige tider
              </button>
              <button
                onClick={() => {
                  setInput('Hva koster tjenestene?');
                }}
                className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                💰 Priser
              </button>
              <button
                onClick={() => {
                  setInput('Hvordan kontakter jeg dere?');
                }}
                className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                📧 Kontakt
              </button>
            </div>
          )}

          {/* Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Skriv en melding..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-[#8DC99C] text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 bg-[#8DC99C] hover:bg-[#7ab889] disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
