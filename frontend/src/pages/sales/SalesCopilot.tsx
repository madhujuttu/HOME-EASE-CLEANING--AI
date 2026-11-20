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
  Clock,
  Phone,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  actionCard?: {
    title: string;
    items: string[];
    link?: string;
  };
}

export const SalesCopilot: React.FC = () => {
  const { leads, meetings, customers, tasks, showToast } = useCrm();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'copilot',
      text: "Hello Marcus! I am your AI Sales Copilot. I have real-time read access to your assigned leads, today's consultations, conversion analytics, and follow-up queues. How can I assist you close deals today?",
      timestamp: 'Just now'
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'Who are my meetings today?',
    'Show my overdue follow-ups.',
    'Which leads are inactive?',
    'Summarize my last customer meeting.',
    'Prepare a calling script for Dr. Raymond.',
    'Show my conversion performance.',
    'Which customers need attention?'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: 'm-' + Math.random().toString(36).substring(2, 7),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsThinking(true);

    // Connect with backend AI Sales Copilot API with local synthesis fallback
    api.queryCopilot(query).then(res => {
      if (res?.success && res.answer) {
        setIsThinking(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'm-' + Math.random().toString(36).substring(2, 7),
            sender: 'copilot',
            text: res.answer,
            actionCard: res.actionCard,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        fallbackSynthesis();
      }
    }).catch(() => {
      fallbackSynthesis();
    });

    const fallbackSynthesis = () => {
      let replyText = '';
      let actionCard: ChatMessage['actionCard'] = undefined;
      const lower = query.toLowerCase();

      if (lower.includes('meeting') || lower.includes('schedule') || lower.includes('today')) {
        const todayMeets = meetings.filter(m => m.status === 'scheduled');
        replyText = `You have ${todayMeets.length} consultation(s) scheduled on your calendar today. Here is your current itinerary:`;
        actionCard = {
          title: "Today's Consultations",
          items: todayMeets.map(m => `${m.dateTime.split(' ')[1] || '4:30 PM'} — ${m.customerName} (${m.type})`)
        };
      } else if (lower.includes('overdue') || lower.includes('follow-up') || lower.includes('followup')) {
        const urgentLeads = leads.filter(l => l.priority === 'urgent' || l.id === 'lead-104');
        replyText = `Found ${urgentLeads.length} urgent follow-up item(s) that require contact to prevent lead decay:`;
        actionCard = {
          title: 'High Priority Follow-ups',
          items: urgentLeads.map(l => `${l.name} — ${l.serviceInterest} (AI Score: ${l.aiScore})`)
        };
      } else if (lower.includes('inactive') || lower.includes('stale') || lower.includes('decay')) {
        replyText = `Lead #104 (Melinda Vasquez) and Lead #106 (Reginald Croft) have had zero touchpoints for over 24 hours. Melinda Vasquez expressed high interest in velvet sofa hydro-extraction and viewed our demo video. I suggest an express SMS offer.`;
      } else if (lower.includes('summarize') || lower.includes('last customer') || lower.includes('last meeting')) {
        const lastMeet = meetings[0];
        replyText = `Here is the AI synthesis for your last consultation with ${lastMeet?.customerName || 'Dr. Raymond Thornton'}:\n\n` +
          `• Customer Scope: 5,500 sqft residence post-renovation.\n` +
          `• Core Requirements: High-ceiling scaffolding, limestone tile sealing, and completion before Friday arrival.\n` +
          `• Primary Objection: Strict delivery timeline.\n` +
          `• Next Step: Send binding quote for ₹750 by 8 PM today.`;
      } else if (lower.includes('script') || lower.includes('calling script') || lower.includes('raymond')) {
        replyText = `Here is your personalized high-converting calling script for Dr. Raymond Thornton:\n\n` +
          `"Good afternoon Dr. Thornton! This is Marcus Vance following up on your 5,500 sqft villa walkthrough in Marina Bay.\n\n` +
          `I have coordinated with our master crew supervisor Carlos Mendes. We can deploy our 4-person senior crew this Thursday morning at 8:00 AM with our 140°C hospital-grade HEPA steam extractors.\n\n` +
          `We will guarantee complete post-construction dust eradication before your family arrives for the weekend. I can lock in your slot immediately with our digital contract link."`;
      } else if (lower.includes('conversion') || lower.includes('performance') || lower.includes('quota')) {
        replyText = `Your current sales performance is outstanding! 🚀\n\n` +
          `• Achieved Revenue: ₹38,200 of ₹45,000 monthly quota (84.8%)\n` +
          `• Closed Deals: 42 Deals Won\n` +
          `• Lead Conversion Rate: 34.8% (Team Average: 31.2%)\n` +
          `• Pacing: On track to exceed quota by +₹4,500 this month.`;
      } else if (lower.includes('attention') || lower.includes('customer')) {
        replyText = `Client Harrison Wells has an open inquiry regarding COI delivery for building management, and Claire Beauchamp requires confirmation of our 100% security deposit return guarantee. Both are high-probability deals if responded to within the next 2 hours.`;
      } else {
        replyText = `Based on your CRM records: You currently have ${leads.length} total leads assigned with an average deal size of ₹450. Your highest priority action right now is finalizing the site audit proposal for Dr. Raymond Thornton.`;
      }

      setIsThinking(false);
      setMessages(prev => [
        ...prev,
        {
          id: 'm-' + Math.random().toString(36).substring(2, 7),
          sender: 'copilot',
          text: replyText,
          actionCard,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    };
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="AI Sales Copilot" className="w-16 h-16 rounded-2xl object-cover border-2 border-electric-500/40 shadow-glow flex-shrink-0" />
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              AI Sales Copilot
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-electric-500/20 text-electric-400 uppercase font-bold">
                Connected to Live CRM
              </span>
            </h1>
            <p className="text-xs text-slate-400">RAG-powered intelligence assistant tailored for sales executives</p>
          </div>
        </div>
      </div>

      {/* Suggested Prompts Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs custom-scrollbar flex-shrink-0">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-electric-500/50 text-slate-700 dark:text-slate-300 hover:text-white whitespace-nowrap text-xs transition-all shadow-sm flex items-center gap-1.5"
          >
            <Lightbulb className="w-3.5 h-3.5 text-electric-400" />
            <span>{q}</span>
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
              msg.sender === 'copilot'
                ? 'border border-electric-500/30'
                : 'bg-blue-600 text-white'
            }`}>
              {msg.sender === 'copilot' ? <img src="/logo.png" alt="Copilot" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
            </div>

            <div className={`max-w-xl space-y-2 text-xs leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-blue-600 text-white p-3.5 rounded-2xl rounded-tr-none'
                : 'bg-slate-50 dark:bg-navy-850 text-slate-800 dark:text-slate-200 p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-navy-800'
            }`}>
              <div className="whitespace-pre-line">{msg.text}</div>

              {msg.actionCard && (
                <div className="mt-3 p-3 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 space-y-1.5">
                  <h4 className="font-bold text-electric-400 font-mono text-[11px] uppercase">
                    {msg.actionCard.title}
                  </h4>
                  <ul className="space-y-1">
                    {msg.actionCard.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-electric-400 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <span className="block text-[10px] opacity-60 font-mono text-right mt-1">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isThinking && (
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex-shrink-0"
      >
        <input
          type="text"
          placeholder="Ask Copilot (e.g. 'Show my overdue follow-ups', 'Draft quote for Raymond')..."
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
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
