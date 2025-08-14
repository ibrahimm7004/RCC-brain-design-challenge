"use client";

import { useState, useEffect } from 'react';
import { BrainCircuit, Code, FileText, Lightbulb, Moon, Sun, ClipboardCheck, BookOpen, Puzzle, FileStack, Bot } from 'lucide-react';
import { Card } from '@/app/components/Card';
import { ChatInput } from '@/app/components/ChatInput';
import Link from 'next/link';

export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const prompts = [
    { title: "Summarize OUAF Process Flow", description: "Condense a complex process document", icon: <FileStack /> },
    { title: "Explain OUAF Configuration", description: "Break down a specific config step", icon: <Puzzle /> },
    { title: "Locate OUAF Documentation", description: "Find a section in the docs", icon: <BookOpen /> },
    { title: "Brainstorm OUAF Solutions", description: "Generate creative concepts for OUAF", icon: <Lightbulb /> },
    { title: "OUAF Technical Q&A", description: "Ask a specific OUAF tech question", icon: <Bot /> },
  ];

  const handleThemeToggle = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    localStorage.setItem('theme', newIsDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newIsDarkMode);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full bg-warm-gradient text-charcoal dark:bg-dark-gradient dark:text-off-white font-sans transition-colors duration-300">
      <header className="absolute top-6 right-6 z-10">
        <button
          onClick={handleThemeToggle}
          className="p-3 rounded-full bg-white/50 dark:bg-charcoal/50 text-charcoal dark:text-off-white shadow-lg backdrop-blur-sm hover:scale-110 transition-all duration-200"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <main className="flex-1 flex justify-center p-4 overflow-y-auto mb-20 pb-32 pt-16">
        <div className="w-full max-w-4xl space-y-12">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Oracle Utilities Assistant</h1>
            <p className="mt-3 text-lg text-medium-gray">Your AI partner for OUAF documentation</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:p-0 md:grid-cols-3 grid-flow-row-dense">
            {prompts.map((prompt) => (
              <Link
                key={prompt.title}
                href={`/chat?message=${encodeURIComponent(prompt.title)}`}
                className="flex h-full"
              >
                <Card {...prompt} />
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="p-4 bg-white/80 dark:bg-charcoal/50 border-t border-light-gray dark:border-medium-gray/20 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl">
          <ChatInput isOnHomePage={true} />
        </div>
      </footer>
    </div>
  );
}