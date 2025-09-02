import React, { useEffect, useRef, useState, useContext } from 'react';
import { Bot, ArrowDown } from 'lucide-react';
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
    <div className="chat-container flex-1 relative">
      {allMessages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4 text-gradient">
              {selectedLanguage === 'en' ? 'AI Tutor' : 'एआय शिक्षक'}
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)] mb-8 leading-relaxed">
              {selectedLanguage === 'en'
                ? "Your intelligent learning companion. Ask me anything and let's explore knowledge together."
                : 'तुमचा बुद्धिमान शिक्षण साथीदार. मला काहीही विचारा आणि चला एकत्र ज्ञान एक्सप्लोर करूया.'}
            </p>
            
            {!hasApiKey && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 max-w-sm mx-auto">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-amber-200">
                    {selectedLanguage === 'en' ? 'Setup Required' : 'सेटअप आवश्यक'}
                  </h3>
                </div>
                <p className="text-sm text-amber-200/80 text-left">
                  {selectedLanguage === 'en'
                    ? 'Please configure your API keys in Settings to start chatting with AI models.'
                    : 'एआय मॉडेल्ससह चॅटिंग सुरू करण्यासाठी कृपया सेटिंग्जमध्ये आपली API की कॉन्फिगर करा.'}
                </p>
              </div>
            )}

            {hasApiKey && (
              <div className="space-y-4">
                <div className="text-sm text-[var(--color-text-muted)] font-medium">
                  {selectedLanguage === 'en' ? 'Try asking me about:' : 'मला याबद्दल विचारून पहा:'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    selectedLanguage === 'en' ? 'Explain a complex topic' : 'जटिल विषय समजावून सांगा',
                    selectedLanguage === 'en' ? 'Help with homework' : 'होमवर्कमध्ये मदत करा',
                    selectedLanguage === 'en' ? 'Generate creative content' : 'सर्जनशील सामग्री तयार करा',
                    selectedLanguage === 'en' ? 'Solve math problems' : 'गणित समस्या सोडवा'
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => onSendMessage(suggestion)}
                      className="text-left p-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-light)] transition-all duration-200 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          ref={messagesContainerRef}
          className="chat-messages flex-1 overflow-y-auto"
          onScroll={handleScroll}
          style={{
            scrollBehavior: userScrolled ? 'auto' : 'smooth',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="max-w-4xl mx-auto space-y-6">
            {allMessages.map((message, index) => (
              <div
                key={message.id}
                className={`animate-slide-in-bottom ${
                  index === allMessages.length - 1 && streamingMessage?.id === message.id
                    ? 'animate-slide-in-bottom'
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
            {isLoading && !streamingMessage && (
              <div className="animate-slide-in-bottom">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-[var(--color-message-assistant)] rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span className="text-[var(--color-text-muted)] text-sm">
                          {selectedLanguage === 'en' ? 'Thinking...' : 'विचार करत आहे...'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
          className="absolute bottom-24 right-6 w-10 h-10 bg-[var(--color-card)] border border-[var(--color-border)] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-10 hover:border-[var(--color-accent)]"
          aria-label={selectedLanguage === 'en' ? 'Scroll to bottom' : 'खाली स्क्रोल करा'}
        >
          <ArrowDown className="w-4 h-4 text-[var(--color-text-secondary)]" />
        </button>
      )}

      <div className="chat-input-container">
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
