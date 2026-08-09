'use client';

import React, { useState } from 'react';
import { ComplaintItem } from '@/lib/types';
import { getAIChatbotResponse, ChatMessage } from '@/lib/ai/chatbot-service';
import { BotMessageSquare, Send, Sparkles, User, Loader2, X } from 'lucide-react';

interface CivicChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userComplaints: ComplaintItem[];
}

export const CivicChatbotDrawer: React.FC<CivicChatbotDrawerProps> = ({
  isOpen,
  onClose,
  userComplaints,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'AI',
      text: 'Namaste! I am your Civic Lens Assistant. Ask me about your report status, assigned workers, or city repair updates.',
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'USER',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsTyping(true);

    try {
      const aiReply = await getAIChatbotResponse(textToSend, userComplaints);
      setMessages((prev) => [...prev, aiReply]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 civic-card rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[480px] animate-in slide-in-from-bottom duration-150">
      
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 bg-blue-600 text-white">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white">
            <BotMessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-display text-xs font-bold text-white flex items-center gap-1.5">
              Civic Lens Assistant <Sparkles className="h-3 w-3 text-blue-200" />
            </h4>
            <p className="text-[10px] text-blue-100 font-medium">Instant Answers & Report Helper</p>
          </div>
        </div>
        <button onClick={onClose} className="text-blue-100 hover:text-white text-xs font-bold p-1 rounded-lg hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs bg-slate-50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-2 ${m.sender === 'USER' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] ${
              m.sender === 'USER' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {m.sender === 'USER' ? <User className="h-3.5 w-3.5" /> : <BotMessageSquare className="h-3.5 w-3.5" />}
            </div>

            <div className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
              m.sender === 'USER'
                ? 'bg-blue-600 text-white font-medium rounded-tr-none shadow-sm'
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
            }`}>
              <p className="whitespace-pre-line text-xs">{m.text}</p>
              <span className={`text-[9px] mt-1 block text-right ${m.sender === 'USER' ? 'text-blue-100' : 'text-slate-400'}`}>
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-slate-500 text-xs p-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
            <span>Checking report updates...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-2 border-t border-slate-200 bg-white flex space-x-1.5 overflow-x-auto text-[10px]">
        <button
          onClick={() => handleSend('Why is my complaint pending?')}
          className="whitespace-nowrap px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-semibold"
        >
          Why is my report pending?
        </button>
        <button
          onClick={() => handleSend('Where is my complaint?')}
          className="whitespace-nowrap px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 font-semibold"
        >
          Track my report status
        </button>
      </div>

      {/* Input Box */}
      <div className="p-2.5 border-t border-slate-200 bg-white flex items-center space-x-2">
        <input
          type="text"
          placeholder="Ask anything about your reports..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 p-2 civic-input text-xs"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || isTyping}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>

    </div>
  );
};
