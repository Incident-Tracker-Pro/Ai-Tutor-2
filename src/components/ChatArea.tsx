import React, { useEffect, useRef, useState, useContext } from 'react';
import { Bot, Sparkles, Brain, Zap } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Message } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  streamingMessage?: Message | null;
  hasApiKey: boolean;
  model?: 'google' | 'zhipu' | 'mistral-small' | 'mistral-codestral';
  onEditMessage?: (messageId: string, newContent: string) => void;
  onRegenerateResponse?: (messageId: string) => void;
}

export function ChatArea({
  messages,
  onSendMessage,
  isLoading,
  streamingMessage,
  hasApiKey,
  model,
  onEditMessage,
  onRegenerateResponse
}: ChatAreaProps) {
  const { selectedLanguage } = useContext(LanguageContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const lastScrollTop = useRef(0);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end'
    });
  };

  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 100;
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
    const scrollingUp = scrollTop < lastScrollTop.current;

    if (scrollingUp && !isAtBottom) {
      setUserScrolled(true);
      setShowScrollToBottom(true);
    }

    if (isAtBottom) {
      setUserScrolled(false);
      setShowScrollToBottom(false);
    }

    lastScrollTop.current = scrollTop;
  };

  useEffect(() => {
    if (!userScrolled && (messages.length > 0 || streamingMessage)) {
      scrollToBottom();
    }
  }, [messages.length, streamingMessage?.content, userScrolled]);

  useEffect(() => {
    if (messages.length === 0) {
      setUserScrolled(false);
      setShowScrollToBottom(false);
    }
  }, [messages.length]);

  const allMessages = streamingMessage ? [...messages, streamingMessage] : messages;

  const getModelIcon = () => {
    switch (model) {
      case 'google':
        return <Sparkles className="w-8 h-8 text-blue-500" />;
      case 'zhipu':
        return <Brain className="w-8 h-8 text-purple-500" />;
      case 'mistral-small':
        return <Zap className="w-8 h-8 text-green-500" />;
      case 'mistral-codestral':
        return <Bot className="w-8 h-8 text-orange-500" />;
      default:
        return <Bot className="w-8 h-8 text-blue-500" />;
    }
  };

  const getModelName = () => {
    const names = {
      google: { en: "Gemma Ma'am", mr: "जेम्मा मॅम" },
      zhipu: { en: "Zhipu Sir", mr: "झिपू सर" },
      'mistral-small': { en: "Misty Miss", mr: "मिस्टी मिस" },
      'mistral-codestral': { en: "Cody Guru", mr: "कोडी गुरु" },
    };
    return names[model || 'google'][selectedLanguage];
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl relative border-l border-white/20 dark:border-gray-700/30">
      {allMessages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-2xl">
            {/* Animated AI Avatar */}
            <div className="relative mx-auto mb-8 w-24 h-24">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full animate-pulse opacity-75"></div>
              <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-full flex items-center justify-center w-full h-full shadow-2xl border border-white/30 hover:scale-110 transition-all duration-500">
                {getModelIcon()}
              </div>
              {/* Floating particles */}
              <div className="absolute -inset-4">
                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                <div className="absolute bottom-3 left-1 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping animation-delay-1000"></div>
                <div className="absolute top-1/2 -right-2 w-1 h-1 bg-pink-400 rounded-full animate-ping animation-delay-2000"></div>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 dark:border-gray-700/30">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                {selectedLanguage === 'en' ? `Hello! I'm ${getModelName()}` : `नमस्कार! मी ${getModelName()} आहे`}
              </h1>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                {selectedLanguage === 'en'
                  ? "I'm your AI learning companion, ready to help you explore, understand, and master any topic. Let's start this journey together!"
                  : 'मी तुमचा एआय शिक्षण साथीदार आहे, तुम्हाला कोणताही विषय एक्सप्लोर करण्यास, समजून घेण्यास आणि मास्टर करण्यास मदत करण्यास तयार आहे. चला हा प्रवास एकत्र सुरू करूया!'}
              </p>
              
              {/* Feature highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {selectedLanguage === 'en' ? 'Smart Learning' : 'स्मार्ट लर्निंग'}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50/50 dark:bg-purple-900/20 rounded-2xl">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    {selectedLanguage === 'en' ? 'Creative Thinking' : 'सर्जनशील विचार'}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-pink-50/50 dark:bg-pink-900/20 rounded-2xl">
                  <div className="w-8 h-8 bg-pink-100 dark:bg-pink-800 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  </div>
                  <span className="text-sm font-medium text-pink-700 dark:text-pink-300">
                    {selectedLanguage === 'en' ? 'Quick Responses' : 'जलद प्रतिसाद'}
                  </span>
                </div>
              </div>
              
              {!hasApiKey && (
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-amber-200 dark:bg-amber-800 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                    </div>
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                      {selectedLanguage === 'en' ? 'Setup Required' : 'सेटअप आवश्यक'}
                    </h3>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                    {selectedLanguage === 'en'
                      ? 'Please configure your API keys in Settings to unlock the full potential of your AI tutor and start having amazing conversations!'
                      : 'कृपया तुमच्या एआय शिक्षकाची पूर्ण क्षमता अनलॉक करण्यासाठी आणि अद्भुत संभाषण सुरू करण्यासाठी सेटिंग्जमध्ये आपली API की कॉन्फिगर करा!'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto scroll-smooth messages-container"
          onScroll={handleScroll}
          style={{
            scrollBehavior: userScrolled ? 'auto' : 'smooth',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="max-w-4xl mx-auto px-4 py-6">
            {allMessages.map((message, index) => (
              <div
                key={message.id}
                className={`transition-all duration-500 ease-out transform ${
                  index === allMessages.length - 1 && streamingMessage?.id === message.id
                    ? 'animate-in slide-in-from-bottom-2 fade-in-0'
                    : ''
                }`}
              >
                <MessageBubble
                  message={message}
                  isStreaming={streamingMessage?.id === message.id}
                  model={model}
                  onEditMessage={onEditMessage}
                  onRegenerateResponse={onRegenerateResponse}
                />
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />
        </div>
      )}
      
      {showScrollToBottom && (
        <button
          onClick={() => {
            setUserScrolled(false);
            setShowScrollToBottom(false);
            scrollToBottom();
          }}
          className="absolute bottom-24 right-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-full p-3 shadow-2xl hover:shadow-xl transition-all duration-300 z-10 hover:scale-110 group"
          aria-label={selectedLanguage === 'en' ? 'Scroll to bottom' : 'खाली स्क्रोल करा'}
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}

      <div className="border-t border-white/20 dark:border-gray-700/30 p-4 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSendMessage={onSendMessage}
            isLoading={isLoading}
            disabled={!hasApiKey}
          />
        </div>
      </div>
      
      {/* CSS for custom animations */}
      <style jsx>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
