import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-[var(--color-text-primary)]" />
      ) : (
        <Sun className="w-5 h-5 text-[var(--color-text-primary)]" />
      )}
    </button>
  );
}
