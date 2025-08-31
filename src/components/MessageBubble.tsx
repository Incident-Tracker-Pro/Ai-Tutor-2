import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { User, Bot, Copy, Check, Edit2 } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  model?: 'google' | 'zhipu';
  isTyping?: boolean;
  onEdit: (messageId: string, content: string) => void;
  editMessageId: string | null;
  editContent: string;
  onSaveEdit: (messageId: string) => void;
}

export function MessageBubble({ message, isStreaming = false, model, isTyping, onEdit, editMessageId, editContent, onSaveEdit }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Estimate token count (rough approximation: 0.75 words per token)
  const wordCount = message.content.trim().split(/\s+/).length;
  const tokenCount = Math.ceil(wordCount / 0.75);

  useEffect(() => {
    if (isUser && !isStreaming) {
      const timer = setTimeout(() => setIsRead(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isUser, isStreaming]);

  if (editMessageId === message.id && isUser) {
    return (
      <div className="flex gap-3 mb-2 justify-end">
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-600 dark:bg-gray-500">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="relative max-w-[80%] p-4 rounded-xl bg-gray-200 dark:bg-gray-300 text-black">
          <textarea
            value={editContent}
            onChange={(e) => onSaveEdit(message.id)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            onBlur={() => setIsEditing(false)}
            autoFocus
          />
          <button
            onClick={() => onSaveEdit(message.id)}
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <Bot className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </div>
      )}
      <div
        className={`relative max-w-[80%] p-4 rounded-xl ${isUser ? 'bg-gray-600 dark:bg-gray-500 text-white font-semibold' : 'bg-gray-200 dark:bg-gray-300 text-black font-medium'}`}
      >
        {!isUser && model && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
            {model === 'google' ? 'Google Gemini' : 'ZhipuAI'}
          </div>
        )}
        <div className={`prose prose-base max-w-none leading-relaxed ${isUser ? 'font-semibold' : ''}`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-md my-2"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-gray-300 dark:bg-gray-600 px-1.5 py-0.5 rounded text-sm" {...props}>
                    {children}
                  </code>
                );
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-4">
                    <table className="border-collapse border border-gray-300 dark:border-gray-600 w-full">
                      {children}
                    </table>
                  </div>
                );
              },
              th({ children }) {
                return (
                  <th className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-100 dark:bg-gray-600 font-medium">
                    {children}
                  </th>
                );
              },
              td({ children }) {
                return <td className="border border-gray-300 dark:border-gray-600 p-2">{children}</td>;
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse ml-1"></span>
          )}
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-gray-500 dark:text-gray-400">
            {tokenCount} tokens
          </span>
          {isUser && isRead && <span className="text-green-500">Read</span>}
          {isUser && !isRead && !isStreaming && <span className="text-gray-500">Sent</span>}
        </div>
        {!isUser && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            style={{ zIndex: 10 }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        )}
        {isUser && !isStreaming && (
          <button
            onClick={() => {
              setIsEditing(true);
              onEdit(message.id, message.content);
            }}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-600 dark:bg-gray-500">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
}
