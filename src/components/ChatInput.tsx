import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled: boolean;
  onTyping: (typing: boolean) => void;
}

export function ChatInput({ onSendMessage, isLoading, disabled, onTyping }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          onTyping(!!e.target.value);
        }}
        placeholder={disabled ? 'Configure API keys to start chatting' : 'Type your message...'}
        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        disabled={disabled || isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !message.trim() || disabled}
        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
}
