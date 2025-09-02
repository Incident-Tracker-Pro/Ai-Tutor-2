import React, { useEffect, useRef, useState, useContext } from 'react';
import { Bot } from 'lucide-react';
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

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative shadow-inner">
      {allMessages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transition-transform hover:scale-105">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bot className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {selectedLanguage === 'en' ? 'How can I help you today?' : 'मी तुम्हाला आज कशी मदत करू शकतो?'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {selectedLanguage === 'en'
                ? "I'm your AI tutor, ready to help you learn and answer any questions you might have."
                : 'मी तुमचा एआय शिक्षक आहे, तुम्हाला शिकण्यास आणि तुमच्या कोणत्याही प्रश्नांचे उत्तर देण्यास तयार आहे.'}
            </p>
            {!hasApiKey && (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 text-left">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  <strong>{selectedLanguage === 'en' ? 'Setup Required:' : 'सेटअप आवश्यक:'}</strong>{' '}
                  {selectedLanguage === 'en'
                    ? 'Please configure your API keys in Settings to start chatting.'
                    : 'कृपया चॅटिंग सुरू करण्यासाठी सेटिंग्जमध्ये आपली API की कॉन्फिगर करा.'}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto scroll-smooth messages-container px-4 md:px-6"
          onScroll={handleScroll}
          style={{
            scrollBehavior: userScrolled ? 'auto' : 'smooth',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="max-w-4xl mx-auto py-8">
            {allMessages.map((message, index) => (
              <div
                key={message.id}
                className={`transition-all duration-300 ease-out ${
                  index === allMessages.length - 1 && streamingMessage?.id === message.id
                    ? 'animate-in slide-in-from-bottom-2'
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
          className="absolute bottom-24 right-6 bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-700 dark:to-gray-800 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
          aria-label={selectedLanguage === 'en' ? 'Scroll to bottom' : 'खाली स्क्रोल करा'}
        >
          <svg
            className="w-5 h-5"
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

      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSendMessage={onSendMessage}
            isLoading={isLoading}
            disabled={!hasApiKey}
          />
        </div>
      </div>
    </div>
  );
}
