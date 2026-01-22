import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Types
interface Message {
  id: string;
  type: 'user' | 'agent' | 'progress' | 'error';
  content: string;
  timestamp: Date;
}

interface AgentWidgetConfig {
  apiUrl?: string;
  projectName?: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    errorColor?: string;
  };
  position?: {
    bottom?: string;
    right?: string;
    left?: string;
  };
  title?: string;
  subtitle?: string;
  placeholder?: string;
  buttonLabel?: string;
}

interface AgentWidgetProps {
  config?: AgentWidgetConfig;
}

const defaultConfig: Required<AgentWidgetConfig> = {
  apiUrl: 'http://localhost:3100',
  projectName: 'default',
  theme: {
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    accentColor: '#60a5fa',
    errorColor: '#ef4444',
  },
  position: {
    bottom: '20px',
    right: '20px',
    left: 'auto',
  },
  title: 'Agent Assistant',
  subtitle: 'Powered by Claude',
  placeholder: 'Ask me anything...',
  buttonLabel: 'Send',
};

export const AgentWidget: React.FC<AgentWidgetProps> = ({ config = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Merge config with defaults
  const mergedConfig = {
    ...defaultConfig,
    ...config,
    theme: { ...defaultConfig.theme, ...config.theme },
    position: { ...defaultConfig.position, ...config.position },
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket.IO connection
  useEffect(() => {
    if (!isOpen) return;

    const newSocket = io(mergedConfig.apiUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to agent server');
      setIsConnected(true);
      addMessage('system', 'Connected to agent server', 'progress');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from agent server');
      setIsConnected(false);
      addMessage('system', 'Disconnected from server', 'error');
    });

    newSocket.on('agent:progress', (data: { message: string }) => {
      console.log('Progress:', data);
      addMessage('agent-progress', data.message, 'progress');
    });

    newSocket.on('agent:result', (data: { result: string; success: boolean }) => {
      console.log('Result:', data);
      setIsLoading(false);
      addMessage('agent-result', data.result, 'agent');
    });

    newSocket.on('agent:error', (data: { error: string }) => {
      console.log('Error:', data);
      setIsLoading(false);
      addMessage('agent-error', data.error, 'error');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
      addMessage('system', 'Failed to connect to server', 'error');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [isOpen, mergedConfig.apiUrl]);

  const addMessage = (id: string, content: string, type: Message['type']) => {
    const newMessage: Message = {
      id: `${id}-${Date.now()}`,
      type,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !socket || !isConnected) return;

    const userMessage = inputValue.trim();
    addMessage('user', userMessage, 'user');
    setInputValue('');
    setIsLoading(true);

    // Send message to agent via Socket.IO
    socket.emit('agent:execute', {
      prompt: userMessage,
      project: mergedConfig.projectName,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Markdown renderer (simple version)
  const renderMarkdown = (text: string) => {
    // Simple markdown rendering
    let html = text;

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="bg-gray-800 text-gray-100 p-3 rounded-lg overflow-x-auto my-2"><code>${escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm">$1</code>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>');

    // Line breaks
    html = html.replace(/\n/g, '<br />');

    return html;
  };

  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const getMessageStyle = (type: Message['type']) => {
    switch (type) {
      case 'user':
        return {
          container: 'justify-end',
          bubble: `bg-[${mergedConfig.theme.primaryColor}] text-white`,
        };
      case 'agent':
        return {
          container: 'justify-start',
          bubble: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
        };
      case 'progress':
        return {
          container: 'justify-center',
          bubble: `bg-[${mergedConfig.theme.accentColor}] bg-opacity-20 text-gray-700 dark:text-gray-300 italic text-sm`,
        };
      case 'error':
        return {
          container: 'justify-center',
          bubble: `bg-[${mergedConfig.theme.errorColor}] bg-opacity-20 text-red-700 dark:text-red-300 text-sm`,
        };
      default:
        return {
          container: 'justify-start',
          bubble: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
        };
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={toggleWidget}
          style={{
            position: 'fixed',
            bottom: mergedConfig.position.bottom,
            right: mergedConfig.position.right,
            left: mergedConfig.position.left,
            backgroundColor: mergedConfig.theme.primaryColor,
            zIndex: 9998,
          }}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-white hover:scale-110"
          aria-label="Open agent chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
          </svg>
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: mergedConfig.position.bottom,
            right: mergedConfig.position.right,
            left: mergedConfig.position.left,
            zIndex: 9999,
          }}
          className="w-96 h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          {/* Header */}
          <div
            style={{ backgroundColor: mergedConfig.theme.primaryColor }}
            className="p-4 text-white flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold text-lg">{mergedConfig.title}</h3>
              <p className="text-xs opacity-90">{mergedConfig.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Connection status */}
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`}
                title={isConnected ? 'Connected' : 'Disconnected'}
              />
              <button
                onClick={toggleWidget}
                className="hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
                aria-label="Close chat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-12 h-12 mx-auto mb-3 opacity-50"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                  />
                </svg>
                <p className="text-sm">Start a conversation with the agent</p>
              </div>
            )}
            {messages.map((message) => {
              const style = getMessageStyle(message.type);
              return (
                <div key={message.id} className={`flex ${style.container}`}>
                  <div
                    className={`${style.bubble} px-4 py-2 rounded-lg max-w-[80%] break-words`}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(message.content),
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                  <div className="flex space-x-2">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={mergedConfig.placeholder}
                disabled={!isConnected || isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || !isConnected || isLoading}
                style={{
                  backgroundColor: mergedConfig.theme.primaryColor,
                }}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AgentWidget;
