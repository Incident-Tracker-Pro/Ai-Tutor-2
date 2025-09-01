import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !disabled) {
      onSendMessage(input.trim());
      setInput('');
      // Reset textarea height after sending
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

  // Debounced resize function for smoother textarea resizing
  const resizeTextarea = useCallback(() => {
    if (textareaRef.current) {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
          textareaRef.current.style.height = `${newHeight}px`;
        }
      }, 50);
    }
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  // Auto-focus on desktop when not loading
  useEffect(() => {
    if (!isLoading && !disabled && textareaRef.current && window.innerWidth >= 768) {
      textareaRef.current.focus();
    }
  }, [isLoading, disabled]);

  const canSend = input.trim() && !isLoading && !disabled;

  return (
    <div className={`bg-gray-50 dark:bg-gray-800 rounded-xl p-4 transition-all duration-200 ${
      isFocused ? 'ring-2 ring-blue-500/20 shadow-lg' : 'shadow-sm'
    }`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={disabled ? "Please configure API keys in Settings first..." : "Send a message..."}
              disabled={disabled || isLoading}
              className={`w-full min-h-[52px] max-h-[120px] p-3 pr-12 border rounded-lg resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 font-medium ${
                disabled || isLoading
                  ? 'border-gray-300 dark:border-gray-600 cursor-not-allowed'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              rows={1}
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
              }}
            />
            {/* Character count indicator */}
            {input.length > 500 && (
              <div className={`absolute bottom-2 right-16 text-xs transition-colors duration-200 ${
                input.length > 1000 ? 'text-red-500' : 'text-gray-400'
              }`}>
                {input.length}/2000
              </div>
            )}
          </div>

          <div className="flex items-center h-[52px]">
            <button
              type="submit"
              disabled={!canSend}
              className={`w-[52px] h-[52px] flex items-center justify-center rounded-lg transition-all duration-200 transform ${
                !canSend
                  ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed scale-95 opacity-60'
                  : 'bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
              } text-white`}
              title={!canSend ? (disabled ? 'Configure API keys first' : 'Enter a message') : 'Send message (Enter)'}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className={`w-5 h-5 transition-transform duration-200 ${canSend ? 'translate-x-0.5' : ''}`} />
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Status text */}
      <div className={`transition-all duration-200 overflow-hidden ${
        disabled || input.length > 1500 ? 'max-h-10 mt-2 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        {disabled && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Configure your API keys in Settings to start chatting
          </p>
        )}
        {input.length > 1500 && (
          <p className={`text-xs text-center ${
            input.length > 1900 ? 'text-red-500' : input.length > 1500 ? 'text-yellow-500' : 'text-gray-500'
          }`}>
            {input.length > 1900 ? 'Message is getting very long!' : 'Long message detected'}
          </p>
        )}
      </div>

      {/* Keyboard shortcuts hint */}
      {isFocused && !disabled && (
        <div className="mt-2 flex justify-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 transition-opacity duration-200">
            <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Enter</kbd> to send,
            <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs ml-1">Shift+Enter</kbd> for new line
          </p>
        </div>
      )}
    </div>
  );
}
