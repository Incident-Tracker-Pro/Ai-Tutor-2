import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { Send, Loader2, PlusCircle } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, disabled = false }: ChatInputProps) {
  const { selectedLanguage } = useContext(LanguageContext);
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !disabled) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [input, isLoading, disabled, onSendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const resizeTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  useEffect(() => {
    if (!isLoading && !disabled && textareaRef.current && window.innerWidth >= 768) {
      textareaRef.current.focus();
    }
  }, [isLoading, disabled]);

  const canSend = input.trim() && !isLoading && !disabled;

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-end w-full p-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl">
        <button type="button" className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
          <PlusCircle className="w-5 h-5" />
        </button>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled 
            ? (selectedLanguage === 'en' ? 'Please configure API keys in Settings first...' : 'कृपया प्रथम सेटिंग्जमध्ये API की कॉन्फिगर करा...') 
            : (selectedLanguage === 'en' ? 'Ask anything...' : 'काहीही विचारा...')
          }
          disabled={disabled || isLoading}
          className="flex-1 min-h-[24px] max-h-[120px] p-2 bg-transparent resize-none focus:outline-none disabled:bg-transparent disabled:text-[var(--color-text-placeholder)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] font-medium"
          rows={1}
          style={{ scrollbarWidth: 'none' }}
        />
        <button
          type="submit"
          disabled={!canSend}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 ${
            !canSend
              ? 'bg-transparent text-[var(--color-text-placeholder)] cursor-not-allowed'
              : 'bg-[var(--color-text-primary)] text-[var(--color-bg)] hover:bg-[var(--color-accent-bg-hover)]'
          }`}
          title={selectedLanguage === 'en' ? 'Send message' : 'संदेश पाठवा'}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </form>
  );
}
