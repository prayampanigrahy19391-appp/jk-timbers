'use client';

import { useState } from 'react';
import { MessageSquare, X, Send, Bot, Phone, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am the JK Timbers AI Assistant. What kind of project are you working on?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: 'Based on your requirements, I recommend our BWP Marine Plywood. Would you like to see pricing or connect with our sales team via WhatsApp?' 
      }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-[#6b4c2a] hover:bg-[#5a3f22] text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110 z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <div className="relative">
          <Bot size={24} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#dba24a] rounded-full animate-pulse border-2 border-[#6b4c2a]"></span>
        </div>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-full max-w-sm bg-white dark:bg-timber-900 rounded-3xl shadow-2xl z-50 overflow-hidden border border-wood-200 dark:border-timber-800 flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="bg-wood-950 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-wood-800 rounded-full flex items-center justify-center">
                  <Bot size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-bold">JK Timbers AI</h3>
                  <p className="text-xs text-wood-400 flex items-center gap-1"><Sparkles size={10} /> Smart Wood Recommender</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-wood-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-wood-50 dark:bg-timber-950">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-wood-600 text-white rounded-tr-sm' 
                      : 'bg-white dark:bg-timber-800 text-wood-950 dark:text-white border border-wood-200 dark:border-timber-700 rounded-tl-sm shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="p-3 bg-white dark:bg-timber-900 border-t border-wood-100 dark:border-timber-800">
              
              {/* Removed WhatsApp Link per request */}

              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about wood, pricing, etc..." 
                  className="w-full bg-wood-50 dark:bg-timber-950 border border-wood-200 dark:border-timber-800 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-wood-600 text-sm text-wood-950 dark:text-white"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-wood-950 text-white rounded-lg flex items-center justify-center hover:bg-wood-800 transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
