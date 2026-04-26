import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User as UserIcon, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { chatService, type ChatMessage } from '../services/chat.service';
import { Button } from '../components/ui/Button';

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatService.sendMessage(input, messages);
      const assistantMsg: ChatMessage = { 
        role: 'assistant', 
        content: result.response 
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error. Please try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-lunara-core flex items-center justify-center shadow-premium-lg">
            <Bot className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ask Lunara</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Health Assistant Online</p>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
          <ShieldAlert size={14} className="text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Disclaimer Active</span>
        </div>
      </header>

      {/* Message Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 px-2 custom-scrollbar"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 px-4">
            <div className="w-16 h-16 bg-lunara-mist rounded-full flex items-center justify-center">
              <Sparkles className="text-lunara-core" size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">How can I help you today?</h3>
              <p className="text-slate-500 text-sm max-w-sm">
                Ask me about your symptoms, cycle patterns, or general health tips. I have access to your logged data to provide personalized answers.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {[
                "Why am I feeling so tired today?",
                "Analyze my last 3 cycles",
                "Tips for menstrual cramps",
                "What phase am I in right now?"
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 hover:border-lunara-core/30 hover:bg-lunara-mist/30 transition-all text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-slate-100' : 'bg-lunara-mist'
              }`}>
                {msg.role === 'user' ? <UserIcon size={16} className="text-slate-400" /> : <Bot size={16} className="text-lunara-core" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-lunara-core text-white rounded-tr-none' 
                  : 'bg-white border border-slate-100 text-slate-700 shadow-sm rounded-tl-none'
              }`}>
                {msg.content}
                {msg.role === 'assistant' && (
                  <div className="mt-4 pt-3 border-t border-slate-50 text-[10px] font-medium text-slate-400 italic">
                    I am an AI, not a doctor. Consult a professional for medical advice.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-lunara-mist flex items-center justify-center">
                <Bot size={16} className="text-lunara-core" />
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="shrink-0 pt-4">
        <form 
          onSubmit={handleSend}
          className="relative flex items-center gap-2 bg-white p-2 pl-6 rounded-2xl border border-slate-100 shadow-premium-sm focus-within:border-lunara-core/30 transition-all"
        >
          <input
            type="text"
            placeholder="Ask anything about your health..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 py-3"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button 
            variant="primary" 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="rounded-xl h-11 w-11 p-0 flex items-center justify-center"
          >
            <Send size={18} />
          </Button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-3 flex items-center justify-center gap-1">
          <AlertCircle size={10} />
          Lunara provides general insights and is not a substitute for professional medical consultation.
        </p>
      </div>
    </div>
  );
}