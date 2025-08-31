import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Smile, Sparkles, Copy, Check } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  model?: 'google' | 'zhipu';
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
    <div className={`flex gap-3 mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <Sparkles className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </div>
      )}
      
      <div
        className={`relative max-w-[80%] p-4 rounded-xl bg-gray-200 dark:bg-gray-300 ${
          isUser ? 'text-black font-semibold' : 'text-black font-medium'
        }`}
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
        
        {!isUser && !isStreaming && message.content.length > 0 && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            style={{ zIndex: 10 }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        )}
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-600 dark:bg-gray-500">
          <Smile className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
}
