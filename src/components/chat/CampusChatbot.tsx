import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Trash2,
  Bot,
  User,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const STORAGE_KEY = 'qis_chat_history';

const SUGGESTIONS = ['Library Timings', 'Bus Tracking', 'Fees', 'Hostel'];

/**
 * Keyword matching smart replies for QIS Smart Campus
 */
export const getBotResponse = (query: string): string => {
  const clean = query.trim().toLowerCase();
  if (!clean) {
    return "Sorry I didn't understand. Try: library, fees, bus, hostel, exam, canteen, placement";
  }

  if (clean.includes('library')) {
    return "QIS Central Library is in Block A, 2nd Floor. Open 8 AM to 8 PM";
  }
  if (clean.includes('fees') || clean.includes('fee')) {
    return "Please check your fees in Student Portal > Fees Section or contact accounts office: 08647-12345";
  }
  if (clean.includes('bus') || clean.includes('transport')) {
    return "QIS buses start at 7 AM. Track live in Bus Tracking section.";
  }
  if (clean.includes('hostel')) {
    return "Hostel warden contact: 9876543210. Mess timings 7:30 AM, 12:30 PM, 7:30 PM";
  }
  if (clean.includes('exam') || clean.includes('timetable')) {
    return "Check timetable in Academics section. Exams from Dec 15";
  }
  if (clean.includes('principal') || clean.includes('hod')) {
    return "Principal: Dr. XYZ, principal@qis.edu.in";
  }
  if (clean.includes('canteen')) {
    return "Canteen open 8 AM to 6 PM in Block C";
  }
  if (clean.includes('placement')) {
    return "Placement cell in Block D. Contact placement@qis.edu.in";
  }

  return "Sorry I didn't understand. Try: library, fees, bus, hostel, exam, canteen, placement";
};

const getFormattedTime = (): string => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    sender: 'bot',
    text: "Hello! 👋 I'm your QIS Campus Assistant. Ask me anything about campus facilities, timings, or contacts!",
    timestamp: getFormattedTime(),
  },
];

export const CampusChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to retrieve chat history from localStorage', e);
    }
    return INITIAL_MESSAGES;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat history to localStorage', e);
    }
  }, [messages]);

  // Scroll to bottom on updates
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when window opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSend = (textToSend?: string) => {
    const messageText = (textToSend ?? input).trim();
    if (!messageText || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: getFormattedTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // 1-second simulated bot delay with typing indicator
    setTimeout(() => {
      const botResponseText = getBotResponse(messageText);
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponseText,
        timestamp: getFormattedTime(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleClearChat = () => {
    const resetList: ChatMessage[] = [
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: "Chat cleared! ✨ How else can I assist you with QIS Campus today?",
        timestamp: getFormattedTime(),
      },
    ];
    setMessages(resetList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resetList));
    } catch (e) {
      console.error('Failed to reset chat history in localStorage', e);
    }
  };

  return (
    <>
      {/* Floating Toggle Button with Pulse Animation */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center justify-center">
        {/* Glowing Pulse Ring (Active when closed) */}
        {!isOpen && (
          <span
            className="absolute -inset-1 rounded-full bg-[#2563EB] opacity-60 animate-ping pointer-events-none"
            aria-hidden="true"
          />
        )}

        <motion.button
          id="qis-chatbot-toggle-button"
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          aria-label={isOpen ? 'Close QIS Assistant' : 'Open QIS Assistant'}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-xl shadow-blue-600/35 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/30"
        >
          {isOpen ? (
            <X className="h-6 w-6 transition-transform duration-200 rotate-0" />
          ) : (
            <div className="relative">
              <MessageSquare className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
            </div>
          )}
        </motion.button>
      </div>

      {/* Chat Window Modal / Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="qis-chatbot-window"
            initial={{ opacity: 0, y: 25, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.92 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-900 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[350px] sm:h-[450px] sm:rounded-2xl sm:shadow-2xl sm:border sm:border-slate-200/90 sm:dark:border-slate-800 overflow-hidden font-sans"
          >
            {/* Header: "QIS Assistant 🤖" with online green dot, clear button, close button */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-[#2563EB] to-blue-700 text-white select-none flex-shrink-0 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-xs border border-white/20">
                  <Bot className="h-5 w-5" />
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-blue-700"></span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1">
                      QIS Assistant <span>🤖</span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    <p className="text-[11px] text-blue-100 font-medium">Online</p>
                  </div>
                </div>
              </div>

              {/* Actions: Clear Chat & Close */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="qis-chatbot-clear-btn"
                  onClick={handleClearChat}
                  title="Clear chat history"
                  aria-label="Clear chat history"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-100 hover:text-white hover:bg-white/15 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  id="qis-chatbot-close-btn"
                  onClick={() => setIsOpen(false)}
                  title="Close assistant"
                  aria-label="Close assistant"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-100 hover:text-white hover:bg-white/15 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Area: User messages (blue, right side), Bot messages (gray, left side) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60 dark:bg-slate-900/60 scroll-smooth">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed break-words shadow-xs ${
                        isUser
                          ? 'bg-[#2563EB] text-white rounded-2xl rounded-tr-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/70 rounded-2xl rounded-tl-xs shadow-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
                      {msg.timestamp}
                    </span>
                  </motion.div>
                );
              })}

              {/* Bot Typing Indicator (3 Animated Dots) */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-start"
                >
                  <div className="flex items-center gap-1.5 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 rounded-2xl rounded-tl-xs shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">Typing...</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-3 pt-2 pb-1.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {SUGGESTIONS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    disabled={isTyping}
                    onClick={() => handleSend(chip)}
                    className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-[#2563EB] dark:bg-blue-950/50 dark:hover:bg-blue-900/60 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60 font-medium transition-all active:scale-95 disabled:opacity-50"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Box with Send Button */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 flex-shrink-0"
            >
              <input
                ref={inputRef}
                id="qis-chatbot-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about library, bus, fees..."
                disabled={isTyping}
                className="flex-1 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3.5 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition disabled:opacity-60"
              />
              <button
                type="submit"
                id="qis-chatbot-send-btn"
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
                className="flex-shrink-0 w-9 h-9 rounded-full bg-[#2563EB] hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 active:scale-95"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
