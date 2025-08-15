"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatMessage } from '@/app/components/ChatMessage';
import { ChatInput } from '@/app/components/ChatInput';
import { Palette, Moon, Sun, ChevronDown, MessageSquare, Menu, X, ChevronLeft, ArrowBigLeftDash } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

type AnimationStyle = 'claude' | 'chatgpt' | 'gemini' | 'smooth';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [animationStyle, setAnimationStyle] = useState<AnimationStyle>('smooth');
  const [currentStreamingMessageId, setCurrentStreamingMessageId] = useState<string | null>(null);
  const [failedPrompt, setFailedPrompt] = useState<string | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const initialMessageProcessed = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Scrolling helpers
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isNearBottom = () => {
    const el = scrollContainerRef.current;
    if (!el) return true;
    const threshold = 80; // px from bottom counts as "at bottom"
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  const scrollToBottom = (smooth: boolean) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  };

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // Check if the user is scrolled near the bottom
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    stickToBottomRef.current = isAtBottom;
  };

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Auto-scroll when new messages arrive (only if user is near bottom)
  useEffect(() => {
    if (stickToBottomRef.current) {
      scrollToBottom(isLoading ? false : true); // Instant scroll during streaming, smooth otherwise
    }
  }, [messages, isLoading]);

  // Handle initial message from URL params
  useEffect(() => {
    const initialMessage = searchParams.get('message');
    if (initialMessage && !initialMessageProcessed.current) {
      initialMessageProcessed.current = true;
      handleSendMessage(initialMessage);
    }
  }, [searchParams]);

  // Handle closing settings menu with Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSettings]);

  // Apply dark mode to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Handle content resizing for streaming messages
  useEffect(() => {
    const target = contentRef.current;
    if (!target) return;
    const ro = new ResizeObserver(() => {
      if (stickToBottomRef.current) {
        scrollToBottom(false);
      }
    });
    ro.observe(target);
    return () => ro.disconnect();
  }, []);

  // Main message sending logic
  const handleSendMessage = async (userMessage: string) => {
    setFailedPrompt(null);
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    const messageId = `msg-${Date.now()}`;
    const assistantMessageId = `assistant-${messageId}`;
    const userId = `user-${messageId}`;
    
    try {
      // Add user message to chat
      setMessages(prev => [...prev, {
        id: userId,
        role: 'user',
        content: userMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

      setCurrentStreamingMessageId(assistantMessageId);

      // Add empty assistant message for streaming
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, stream: true }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) { throw new Error(`Network response was not ok`); }
      if (!response.body) { throw new Error("No response body"); }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";
      let streamError = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim();
            if (dataStr === '{"type":"complete"}') continue;

            try {
              const data = JSON.parse(dataStr);

              // Check for an error message within the stream
              if (data.type === 'error') {
                streamError = data.error || "An unknown error occurred during the stream.";
                break;
              }

              if (data.type === 'chunk' && data.content) {
                accumulatedResponse += data.content;
                setMessages(prev => prev.map(msg =>
                  msg.id === assistantMessageId ? { ...msg, content: accumulatedResponse } : msg
                ));
              }
            } catch (e) { /* Ignore incomplete JSON */ }
          }
        }
        if (streamError) {
          throw new Error(streamError);
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Stream stopped by user.');
        setMessages(prev => prev.map(msg => msg.id === assistantMessageId && msg.content === '' ? { ...msg, content: 'Generation stopped.' } : msg));
      } else {
        console.error("Error during message send:", error);
        toast.error(error.message || "The request failed. Please try again.");
        setFailedPrompt(userMessage);
        setMessages(prev => prev.filter(msg => msg.id !== userId && msg.id !== assistantMessageId));
      }
    } finally {
      setIsLoading(false);
      setCurrentStreamingMessageId(null);
      abortControllerRef.current = null;
    }
  };

  const handleRetryMessage = (failedMessageId: string) => {
    // Find the index of the failed assistant message
    const failedMessageIndex = messages.findIndex(msg => msg.id === failedMessageId);

    // Find the user message that came before the failed one
    if (failedMessageIndex > 0) {
      const originalUserMessage = messages[failedMessageIndex - 1];

      if (originalUserMessage && originalUserMessage.role === 'user') {
        // Remove the failed assistant message from the history
        setMessages(prev => prev.slice(0, failedMessageIndex));

        // Resend the original user message
        handleSendMessage(originalUserMessage.content);
      }
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleThemeToggle = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    localStorage.setItem('theme', newIsDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newIsDarkMode);
  };

  const animationOptions = [
    { value: 'claude', label: 'Claude Style', description: 'Thoughtful pace with sage cursor' },
    { value: 'chatgpt', label: 'ChatGPT Style', description: 'Fast confident typing with clay cursor' },
    { value: 'gemini', label: 'Gemini Style', description: 'Deliberate pace with sand cursor' },
    { value: 'smooth', label: 'Smooth Style', description: 'Ultra-smooth MS Word-like typing' }
  ];

  return (
    <div className="h-screen flex flex-col w-full bg-off-white dark:bg-charcoal font-sans transition-colors duration-200">
      <header className="flex-shrink-0 border-b border-b border-light-gray dark:border-medium-gray/20 bg-white/80 dark:bg-charcoal/50 backdrop-blur-sm shadow-sm p-4 z-10">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link href="/" className="p-2 rounded-lg hover:bg-light-gray dark:hover:bg-medium-gray/20 transition-colors" aria-label="Back to home">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-xl font-semibold text-charcoal dark:text-off-white cursor-pointer hover:opacity-80 transition-opacity">
            Oracle Assistant
          </h1>
          <div className="flex items-center gap-3">

            {/* Animation Style Selector */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                aria-haspopup="true"
                aria-expanded={showSettings}
                className="flex items-center gap-2 px-3 py-2 text-sm text-medium-gray hover:text-charcoal dark:hover:text-off-white rounded-lg hover:bg-light-gray dark:hover:bg-medium-gray/20 transition-colors duration-200"
                aria-label="Animation settings"
              >
                <Palette size={16} />
                <span className="hidden sm:inline">
                  {animationOptions.find(opt => opt.value === animationStyle)?.label}
                </span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${showSettings ? 'rotate-180' : ''}`} />
              </button>

              {showSettings && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-charcoal rounded-lg border border-light-gray dark:border-medium-gray shadow-lg z-50">
                  <div className="p-3 border-b border-light-gray dark:border-medium-gray">
                    <h3 className="font-medium text-charcoal dark:text-off-white">Typing Animation Style</h3>
                    <p className="text-xs text-medium-gray">Choose how AI responses are typed</p>
                  </div>

                  <div className="p-2">
                    {animationOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setAnimationStyle(option.value as AnimationStyle);
                          setShowSettings(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 ${animationStyle === option.value
                          ? 'bg-sand/20 text-clay-red dark:bg-sage/20 dark:text-sand'
                          : 'hover:bg-light-gray dark:hover:bg-medium-gray/20 text-charcoal dark:text-off-white'
                          }`}
                      >
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-medium-gray">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="p-3 rounded-full bg-white/50 dark:bg-charcoal/50 text-charcoal dark:text-off-white shadow-lg backdrop-blur-sm hover:scale-110 transition-all duration-200"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
        <div ref={contentRef} className="mx-auto pt-4 min-h-full">
          {messages.map((message) => (
            <ChatMessage
              key={`${message.id}-${animationStyle}`}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
              messageId={message.id}
              animationStyle={animationStyle}
              isStreaming={message.id === currentStreamingMessageId}
              onRetry={message.role === 'assistant' ? () => handleRetryMessage(message.id) : undefined}
            />
          ))}
          <div className="h-24 md:h-32" />
          <div ref={messagesEndRef} />
        </div>
      </main>

      <ChatInput
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
        onStop={handleStopGeneration}
        placeholder="Ask about Oracle Utilities..."
        failedPrompt={failedPrompt}
      />
    </div>
  );
}