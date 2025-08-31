import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { User, Bot, Copy, Check } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  model?: 'google' | 'zhipu'; // Add model prop
}

export function MessageBubble({ message, isStreaming = false, model }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-200">
          <Bot className="w-4 h-4 text-gray-600" />
        </div>
      )}
      <div
        className={`max-w-[80%] p-3 rounded-lg ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800 font-normal'}`}
      >
        <div className="prose prose-sm max-w-none">
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
                  <code className="bg-gray-200 px-1.5 py-0.5 rounded text-sm" {...props}>
                    {children}
                  </code>
                );
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-4">
                    <table className="border-collapse border border-gray-300 w-full">{children}</table>
                  </div>
                );
              },
              th({ children }) {
                return <th className="border border-gray-300 p-2 bg-gray-100">{children}</th>;
              },
              td({ children }) {
                return <td className="border border-gray-300 p-2">{children}</td>;
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
          {isStreaming && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse ml-1"></span>}
        </div>
        {!isUser && model && (
          <div className="text-xs text-gray-500 mt-1">
            {model === 'google' ? 'Google Gemini' : 'ZhipuAI'}
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-500">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}
