import React, { useEffect, useRef, useState, useContext } from 'react';
import { Bot, Sparkles, ArrowDown } from 'lucide-react';
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
  model?: 'google' | 'zhipu';
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

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
      {allMessages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-2xl mx-auto">
            {/* Enhanced welcome section with floating animation */}
            <div className="relative mb-8">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-110 transition-all duration-500 hover:rotate-6 group">
                <Bot className="w-10 h-10 text-white group-hover:animate-bounce" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 leading-tight">
                  {selectedLanguage === 'en' ? 'How can I help you today?' : 'मी तुम्हाला आज कशी मदत करू शकतो?'}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  {selectedLanguage === 'en'
                    ? "I'm your AI tutor, ready to help you learn and answer any questions you might have."
                    : 'मी तुमचा एआय शिक्षक आहे, तुम्हाला शिकण्यास आणि तुमच्या कोणत्याही प्रश्नांचे उत्तर देण्यास तयार आहे.'}
                </p>
              </div>

              {/* Feature cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {[
                  {
                    icon: '🧠',
                    title: selectedLanguage === 'en' ? 'Smart Learning' : 'स्मार्ट शिक्षण',
                    desc: selectedLanguage === 'en' ? 'Personalized explanations' : 'वैयक्तिक स्पष्टीकरण'
                  },
                  {
                    icon: '💬',
                    title: selectedLanguage === 'en' ? 'Natural Chat' : 'नैसर्गिक चॅट',
                    desc: selectedLanguage === 'en' ? 'Conversational interface' : 'संभाषण इंटरफेस'
                  },
                  {
                    icon: '🌍',
                    title: selectedLanguage === 'en' ? 'Multi-lingual' : 'बहुभाषिक',
                    desc: selectedLanguage === 'en' ? 'English & Marathi' : 'इंग्रजी आणि मराठी'
                  }
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-4 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-default"
                  >
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>

              {!hasApiKey && (
                <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 text-left shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">⚡</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                        {selectedLanguage === 'en' ? 'Setup Required' : 'सेटअप आवश्यक'}
                      </h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        {selectedLanguage === 'en'
                          ? 'Please configure your API keys in Settings to start chatting.'
                          : 'कृपया चॅटिंग सुरू करण्यासाठी सेटिंग्जमध्ये आपली API की कॉन्फिगर करा.'}
                      </p>
                    </div>
                  </div>
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
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="space-y-6">
              {allMessages.map((message, index) => (
                <div
                  key={message.id}
                  className={`transition-all duration-500 ease-out transform ${
                    index === allMessages.length - 1 && streamingMessage?.id === message.id
                      ? 'animate-in slide-in-from-bottom-4 fade-in-0'
                      : 'opacity-100 translate-y-0'
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
          </div>
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Enhanced scroll to bottom button */}
      {showScrollToBottom && (
        <button
          onClick={() => {
            setUserScrolled(false);
            setShowScrollToBottom(false);
            scrollToBottom();
          }}
          className="absolute bottom-24 right-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 z-20 hover:scale-110 group animate-in slide-in-from-bottom-4"
          aria-label={selectedLanguage === 'en' ? 'Scroll to bottom' : 'खाली स्क्रोल करा'}
        >
          <ArrowDown className="w-5 h-5 group-hover:animate-bounce" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
        </button>
      )}

      {/* Enhanced chat input area */}
      <div className="relative z-10">
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-t from-white/80 via-white/40 to-transparent dark:from-gray-900/80 dark:via-gray-900/40 pointer-events-none"></div>
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 p-4 shadow-2xl">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              onSendMessage={onSendMessage}
              isLoading={isLoading}
              disabled={!hasApiKey}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
