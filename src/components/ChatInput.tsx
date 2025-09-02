import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { Send, Loader2, Paperclip } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, disabled = false }: ChatInputProps) {
  const { selectedLanguage } = useContext(LanguageContext);
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if ((input.trim() || selectedFiles.length > 0) && !isLoading && !disabled) {
        onSendMessage(input.trim(), selectedFiles);
        setInput('');
        setSelectedFiles([]);
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    },
    [input, selectedFiles, isLoading, disabled, onSendMessage]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

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

  useEffect(() => {
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoading && !disabled && textareaRef.current && window.innerWidth >= 768) {
      textareaRef.current.focus();
    }
  }, [isLoading, disabled]);

  const canSend = (input.trim() || selectedFiles.length > 0) && !isLoading && !disabled;

  return (
    <div
      className={`bg-gray-50 dark:bg-gray-800 rounded-xl p-4 transition-all duration-200 ${
        isFocused ? 'ring-2 ring-blue-500/20 shadow-lg' : 'shadow-sm'
      }`}
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={
                disabled
                  ? selectedLanguage === 'en'
                    ? 'Please configure API keys in Settings first...'
                    : 'कृपया प्रथम सेटिंग्जमध्ये API की कॉन्फिगर करा...'
                  : selectedLanguage === 'en'
                  ? 'Send a message...'
                  : 'संदेश पाठवा...'
              }
              disabled={disabled || isLoading}
              className={`w-full min-h-[52px] max-h-[120px] p-3 pr-12 border rounded-lg resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 font-medium ${
                disabled || isLoading
                  ? 'border-gray-300 dark:border-gray-600 cursor-not-allowed'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              rows={1}
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
              }}
            />
          </div>
          <div className="flex items-end pb-1 gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              title={selectedLanguage === 'en' ? 'Upload file' : 'फाइल अपलोड करा'}
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,.pdf,.txt,.doc,.docx"
              className="hidden"
              multiple
            />
            <button
              type="submit"
              disabled={!canSend}
              className={`w-[48px] h-[48px] flex items-center justify-center rounded-lg transition-all duration-200 transform ${
                !canSend
                  ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed scale-95 opacity-60'
                  : 'bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
              } text-white`}
              title={
                selectedLanguage === 'en'
                  ? !canSend
                    ? disabled
                      ? 'Configure API keys first'
                      : 'Enter a message'
                    : 'Send message (Enter)'
                  : !canSend
                  ? disabled
                    ? 'प्रथम API की कॉन्फिगर करा'
                    : 'संदेश प्रविष्ट करा'
                  : 'संदेश पाठवा (Enter)'
              }
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
      {selectedFiles.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-1 rounded-lg flex items-center gap-1"
            >
              <span className="truncate max-w-[120px]">{file.name}</span>
              <button
                onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div
        className={`transition-all duration-200 overflow-hidden ${
          disabled ? 'max-h-10 mt-2 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {disabled && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {selectedLanguage === 'en'
              ? 'Configure your API keys in Settings to start chatting'
              : 'चॅटिंग सुरू करण्यासाठी सेटिंग्जमध्ये आपली API की कॉन्फिगर करा'}
          </p>
        )}
      </div>
      {isFocused && !disabled && (
        <div className="mt-2 flex justify-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 transition-opacity duration-200">
            {selectedLanguage === 'en' ? (
              <>
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Enter</kbd> to send,
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs ml-1">Shift+Enter</kbd> for new line
              </>
            ) : (
              <>
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Enter</kbd> पाठवण्यासाठी,
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs ml-1">Shift+Enter</kbd> नवीन ओळीसाठी
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
