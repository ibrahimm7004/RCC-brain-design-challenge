
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Square } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  handleSendMessage?: (message: string) => void;
  isLoading?: boolean;
  onStop?: () => void;
  placeholder?: string;
  isOnHomePage?: boolean;
  failedPrompt?: string | null;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  handleSendMessage,
  isLoading = false,
  onStop,
  placeholder = "Ask the Oracle Utilities assistant anything...",
  isOnHomePage = false,
  failedPrompt,
}) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // Auto-focus and populate input when there's a failed prompt
  useEffect(() => {
    if (failedPrompt) {
      setInputValue(failedPrompt);
      textareaRef.current?.focus();
    }
  }, [failedPrompt]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  // Handle viewport resize for mobile keyboard interactions
  useEffect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    const handleResize = () => {
      // Scroll to bottom when keyboard closes to fix viewport
      window.scrollTo(0, document.body.scrollHeight);
    };

    visualViewport.addEventListener('resize', handleResize);
    return () => visualViewport.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission if already processing a response
    if (isLoading) {
      return;
    }

    if (!inputValue.trim()) return;

    if (isOnHomePage) {
      router.push(`/chat?message=${encodeURIComponent(inputValue)}`);
    } else if (handleSendMessage) {
      handleSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter key behavior changes based on loading state
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      // If streaming is happening, trigger stop instead of send
      if (isLoading) {
        if (onStop) {
          onStop();
        }
      } else {
        // Only submit if not loading
        handleSubmit(e);
      }
    }

    // Escape to clear
    if (e.key === 'Escape') {
      setInputValue('');
      textareaRef.current?.blur();
    }
  };

  const handleStop = () => {
    if (onStop) {
      onStop();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
        delay: 0.4
      }}
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-off-white dark:from-charcoal to-transparent"
    >
      <div className="mx-auto max-w-4xl p-4">
        <form onSubmit={handleSubmit} className="relative">
          <label htmlFor="chat-input" className="sr-only">
            Chat message input
          </label>

          <div className="relative flex items-center rounded-2xl border border-light-gray dark:border-medium-gray bg-white dark:bg-charcoal shadow-sm focus-within:border-sage focus-within:ring-1 focus-within:ring-sage">
            <textarea
              id="chat-input"
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? "Assistant is responding... (Press Enter to stop)" : placeholder}
              disabled={false} // Keep input enabled even during loading so user can press Enter to stop
              rows={1}
              className="w-full resize-none border-0 bg-transparent py-4 pl-6 pr-12 text-charcoal dark:text-off-white placeholder-medium-gray focus:outline-none focus:ring-0"
              style={{ maxHeight: '120px' }}
              aria-label="Chat message input"
            />

            {/* Send/Stop Button */}
            <div className="absolute bottom-0 right-2 flex h-full items-center">
              {isLoading ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-clay-red text-white shadow-lg transition-all duration-200 hover:bg-clay-red/80 hover:scale-105"
                  aria-label="Stop generation"
                >
                  <Square size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage text-white shadow-lg transition-all duration-200 hover:bg-clay-red hover:brightness-110 hover:scale-110 disabled:bg-medium-gray disabled:hover:scale-100 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="mt-2 hidden sm:flex justify-between text-xs text-medium-gray">
            <span>
              {isLoading ? (
                <>
                  <kbd className="rounded bg-light-gray dark:bg-charcoal px-1">Enter</kbd> to stop, {' '}
                  <kbd className="rounded bg-light-gray dark:bg-charcoal px-1">Esc</kbd> to clear
                </>
              ) : (
                <>
                  <kbd className="rounded bg-light-gray dark:bg-charcoal px-1">Enter</kbd> to send, {' '}
                  <kbd className="rounded bg-light-gray dark:bg-charcoal px-1">Shift+Enter</kbd> for new line, {' '}
                  <kbd className="rounded bg-light-gray dark:bg-charcoal px-1">Esc</kbd> to clear
                </>
              )}
            </span>
          </div>
        </form>
      </div>
    </motion.div>
  );
};