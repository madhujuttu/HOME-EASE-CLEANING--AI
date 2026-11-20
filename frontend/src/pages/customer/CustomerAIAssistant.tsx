import React, { useState, useRef, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { api } from '../../services/api';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  serviceCard?: {
    name: string;
    price: number;
    description: string;
  };
}

export const CustomerAIAssistant: React.FC = () => {
  const { services, addBooking, showToast } = useCrm();
  const navigate = useNavigate();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'bot',
      text: "Hello Sophia! I am your HomeEase Guru AI Concierge. I can help you choose the ideal sanitization package, calculate custom villa square-footage quotes, or schedule certified specialists. What would you like assistance with today?",
      timestamp: 'Just now'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'How much for a 5,000 sqft villa deep clean?',
    'Do you clean velvet couches without water spots?',
    'What is included in your Kitchen Steam Blitz?',
    'Book emergency move-out cleaning for Thursday'
  ];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: 'm-' + Math.random().toString(36).substring(2, 7),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Attempt query via backend AI customer concierge API
    api.queryCustomerAssistant(query).then(res => {
      if (res?.success && res.answer) {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'm-' + Math.random().toString(36).substring(2, 7),
            sender: 'bot',
            text: res.answer,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            serviceCard: res.serviceCard
          }
        ]);
      } else {
        fallbackCustomerReply();
      }
    }).catch(() => {
      fallbackCustomerReply();
    });

    const fallbackCustomerReply = () => {
      let reply = '';
      let serviceCard: ChatMessage['serviceCard'] = undefined;
      const lower = query.toLowerCase();

      if (lower.includes('villa') || lower.includes('5,000') || lower.includes('5000') || lower.includes('sqft')) {
        reply = `For a 5,000 to 5,500 sqft residence, our recommended package is the **Ultra Deep Villa Sanitization**. It includes a 4-person certified crew, 120-point checklist, 140°C hospital-grade steam scrub, ceiling fans, high chandeliers, and floor crystallization.`;
        serviceCard = {
          name: 'Ultra Deep Villa Sanitization',
          price: 349,
          description: '120-point hospital grade steam sanitation, window detailing, ceiling fans, switchboards, and floor polishing.'
        };
      } else if (lower.includes('couch') || lower.includes('sofa') || lower.includes('velvet') || lower.includes('mattress')) {
        reply = `Yes! We use specialized low-moisture hydro-extraction with pH-balanced conditioners formulated specifically for delicate velvet, linen, and microfiber. It eradicates 99.9% of dust mites and stains without water spots or shrinkage.`;
        serviceCard = {
          name: 'Sofa & Mattress Hydro-Extraction Care',
          price: 149,
          description: 'Anti-allergen hot water deep extraction removes deep stains, dust mites, and bacteria without shrinking fabric.'
        };
      } else if (lower.includes('kitchen') || lower.includes('degrease') || lower.includes('blitz')) {
        reply = `Our **Heavy Kitchen Degrease & Steam Blitz** covers deep chimney internal baffle filters, oven carbon removal, stovetop burners, backsplash grout descaling, and food-safe cabinet sanitization.`;
        serviceCard = {
          name: 'Heavy Kitchen Degrease & Steam Blitz',
          price: 179,
          description: 'Internal & external chimney cleaning, stove burners, oven cavity, backsplash grout, and cabinets degreasing.'
        };
      } else if (lower.includes('book') || lower.includes('thursday') || lower.includes('schedule')) {
        reply = `I have checked our fleet schedule for Thursday. Carlos Mendes (Lead Specialist, 4.95★) is available for deployment at 8:00 AM or 1:00 PM. Would you like me to book the Ultra Deep Villa Clean for Thursday morning?`;
      } else {
        reply = `All HomeEase Guru services utilize hospital-grade HEPA negative air containment and pet-safe botanical cleaners. Would you like me to book a site inspection or provide rate estimates for a specific room?`;
      }

      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: 'm-' + Math.random().toString(36).substring(2, 7),
          sender: 'bot',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          serviceCard
        }
      ]);
    };
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="HomeEase Guru AI" className="w-16 h-16 rounded-2xl object-cover border-2 border-electric-500/40 shadow-glow flex-shrink-0" />
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              AI Home Care Concierge
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-electric-500/20 text-electric-400 uppercase font-bold">
                24/7 Active
              </span>
            </h1>
            <p className="text-xs text-slate-400">Instant answers, custom villa estimates, and direct booking</p>
          </div>
        </div>
      </div>

      {/* Suggested prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs custom-scrollbar flex-shrink-0">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-electric-500 text-slate-700 dark:text-slate-300 whitespace-nowrap text-xs transition-all shadow-sm"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4 custom-scrollbar">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-xs font-bold overflow-hidden shadow-sm ${
              msg.sender === 'bot'
                ? 'border border-electric-500/30'
                : 'bg-blue-600 text-white'
            }`}>
              {msg.sender === 'bot' ? (
                <img src="/logo.png" alt="AI Concierge" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>

            <div className={`max-w-xl space-y-2 text-xs leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-blue-600 text-white p-3.5 rounded-2xl rounded-tr-none'
                : 'bg-slate-50 dark:bg-navy-850 text-slate-800 dark:text-slate-200 p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-navy-800'
            }`}>
              <div className="whitespace-pre-line">{msg.text}</div>

              {msg.serviceCard && (
                <div className="mt-3 p-3.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900 dark:text-white">{msg.serviceCard.name}</h4>
                    <span className="font-mono font-bold text-electric-400 text-sm">₹{msg.serviceCard.price}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{msg.serviceCard.description}</p>
                  <button
                    onClick={() => {
                      addBooking({
                        serviceName: msg.serviceCard?.name,
                        amount: msg.serviceCard?.price,
                        customerName: 'Sophia Montgomery'
                      });
                      navigate('/customer/bookings');
                    }}
                    className="w-full py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs"
                  >
                    Confirm & Reserve This Package
                  </button>
                </div>
              )}

              <span className="block text-[10px] opacity-60 font-mono text-right mt-1">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-electric-500/20 text-electric-400 border border-electric-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-electric-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-electric-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-electric-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex-shrink-0"
      >
        <input
          type="text"
          placeholder="Ask anything about packages, steam temperatures, pet safety..."
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 text-xs px-3 focus:outline-none"
        />
        <button
          type="submit"
          className="p-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold transition-all shadow-glow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
