'use client';

import { useState } from 'react';
import { X, Send, Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// FAQ knowledge base for pattern-matched responses
const faqResponses: { keywords: string[]; response: string }[] = [
  {
    keywords: ['price', 'cost', 'rate', 'how much', 'kitna'],
    response: 'Our prices vary by product:\n• Sagwan (Teak): ₹2,350/cft\n• Sal Wood: ₹1,200/cft\n• Marine Plywood 18mm: ₹85/sqft\n• Commercial Plywood 12mm: ₹33/sqft\n\nFor bulk/contractor pricing, please call us or visit the Bulk Orders page.',
  },
  {
    keywords: ['deliver', 'shipping', 'ship', 'track', 'dispatch'],
    response: 'We deliver across Odisha and nearby states. Standard delivery takes 2-5 business days. You can track your order using your Order ID on the "Track Order" page. For urgent deliveries, call us directly.',
  },
  {
    keywords: ['teak', 'sagwan', 'teakwood'],
    response: 'Our Premium Sagwan (Teak) is sourced from Nagpur & CP Region. It features:\n• High natural oil content\n• Distinctive golden-brown grain\n• Excellent moisture resistance\n\nIdeal for premium furniture and outdoor use. Currently priced at ₹2,350/cft.',
  },
  {
    keywords: ['plywood', 'marine', 'ply', 'bwp'],
    response: 'We offer two plywood grades:\n\n1. BWP Marine Plywood 18mm — ₹85/sqft (waterproof, ideal for kitchens/bathrooms)\n2. Commercial Plywood 12mm — ₹33/sqft (great for interiors)\n\nBoth are borer & termite proof. Check our Catalog page for details.',
  },
  {
    keywords: ['door', 'flush'],
    response: 'Our Solid Wood Flush Doors cost ₹2,800/piece. They feature a blockboard core for sound insulation and come in pre-calibrated thickness. Installation service available for ₹500/door.',
  },
  {
    keywords: ['laminate', 'gloss'],
    response: 'Our High-Gloss Laminates are ₹950/sheet and come in hundreds of textures and colors. They are scratch-resistant, heat-resistant, and zero-maintenance — perfect for wardrobes and kitchen surfaces.',
  },
  {
    keywords: ['calculator', 'estimate', 'calculate'],
    response: 'You can use our Smart Calculator on the Calculator page to instantly estimate material costs and carpenter labour charges for plywood, timber, and doors.',
  },
  {
    keywords: ['contact', 'phone', 'call', 'whatsapp', 'number'],
    response: 'You can reach us at:\n📞 +91 8260761620\n📧 info@jktimbers.com\n📍 Near New Bus Stand, Berhampur, Odisha\n\nWorking hours: Mon-Sat, 9 AM to 8 PM.',
  },
  {
    keywords: ['bulk', 'contractor', 'wholesale', 'dealer'],
    response: 'We offer special dealer pricing for contractors and bulk buyers! Benefits include:\n• Volume discounts\n• GST invoicing\n• Priority delivery\n\nApply for a partner account on our Bulk Orders page.',
  },
  {
    keywords: ['veneer', 'walnut'],
    response: 'Our Decorative Walnut Veneer is priced at ₹75/sqft. It provides a real wood feel with rich chocolate-brown color — a beautiful, eco-friendly alternative to solid wood.',
  },
  {
    keywords: ['mdf', 'medium density'],
    response: 'MDF Board 18mm is available at ₹30/sqft. It has no knots or grain, making it perfect for 3D routing and modern cabinetry. Takes paint flawlessly.',
  },
  {
    keywords: ['hello', 'hi', 'hey', 'namaste'],
    response: 'Hello! Welcome to JK Timbers. I can help you with:\n• Product information & pricing\n• Delivery tracking\n• Calculator & estimates\n• Bulk order inquiries\n\nWhat would you like to know?',
  },
];

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const faq of faqResponses) {
    if (faq.keywords.some((kw) => lower.includes(kw))) {
      return faq.response;
    }
  }
  return "I'm not sure about that. For specific queries, I recommend:\n\n• Browse our Product Catalog\n• Use the Smart Calculator for estimates\n• Call us at +91 8260761620\n\nOr try asking about pricing, delivery, plywood, teak wood, or bulk orders!";
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I\'m the JK Timbers assistant. I can help with product info, pricing, delivery, and more. What are you looking for?' },
  ]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 15));

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { role: 'user', text: userMessage }];
    setMessages(newMessages);
    setInput('');

    // Pre-insert a typing placeholder or send request directly
    try {
      const history = newMessages.map((m) => ({
        role: m.role === 'ai' ? ('assistant' as const) : ('user' as const),
        text: m.text,
      }));

      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessage,
          sessionId,
          history,
        }),
      });

      if (!res.ok) {
        throw new Error('Server support request failed');
      }

      const body = await res.json();
      if (body.success && body.data?.reply) {
        setMessages((prev) => [...prev, { role: 'ai', text: body.data.reply }]);
        return;
      }
      throw new Error('Invalid response shape');
    } catch {
      // Fallback to local pattern matching FAQ response
      const response = getAIResponse(userMessage);
      setMessages((prev) => [...prev, { role: 'ai', text: response }]);
    }
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
                  <h3 className="font-bold">JK Timbers</h3>
                  <p className="text-xs text-wood-400 flex items-center gap-1">
                    <Sparkles size={10} /> Smart Wood Assistant
                  </p>
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
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl whitespace-pre-line text-sm ${
                      msg.role === 'user'
                        ? 'bg-wood-600 text-white rounded-tr-sm'
                        : 'bg-white dark:bg-timber-800 text-wood-950 dark:text-white border border-wood-200 dark:border-timber-700 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 bg-white dark:bg-timber-900 border-t border-wood-100 dark:border-timber-800">
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
