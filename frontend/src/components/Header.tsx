import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { BookOpen, LogIn, LogOut, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Header() {
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{
        background: 'oklch(from var(--card) l c h / 0.92)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-3 group"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            <Monitor className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <span className="font-display font-bold text-lg" style={{ color: 'var(--foreground)' }}>
              PKG Tech
            </span>
            <span className="text-sm ml-1.5 font-medium" style={{ color: 'var(--primary)' }}>
              Support
            </span>
          </div>
        </button>

        {/* Nav */}
        <nav className="flex items-center gap-2">
          {/* Knowledge Base */}
          <button
            onClick={() => navigate({ to: '/knowledge-base' })}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{
              color: 'var(--muted-foreground)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--tab-hover-bg)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--tab-hover-fg)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)';
            }}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Knowledge Base</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{ color: 'var(--muted-foreground)', background: 'var(--muted)' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Login/Logout */}
          <button
            onClick={handleAuth}
            disabled={isLoggingIn}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{
              background: isAuthenticated ? 'var(--muted)' : 'var(--primary)',
              color: isAuthenticated ? 'var(--foreground)' : 'var(--primary-foreground)',
            }}
          >
            {isAuthenticated ? (
              <><LogOut className="w-4 h-4" /><span className="hidden sm:inline">Logout</span></>
            ) : isLoggingIn ? (
              <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /><span className="hidden sm:inline">Logging in...</span></>
            ) : (
              <><LogIn className="w-4 h-4" /><span className="hidden sm:inline">Login</span></>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
