import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Moon, Sun, BookOpen, Home } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { identity, clear, login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-primary via-primary/90 to-secondary shadow-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate({ to: '/' })}
        >
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-sm">PKG</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">PKG Tech Support</h1>
            <p className="text-white/70 text-xs hidden sm:block">Professional IT Helpdesk</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => navigate({ to: '/' })}
          >
            <Home className="w-4 h-4 mr-1" /> Home
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => navigate({ to: '/knowledge-base' })}
          >
            <BookOpen className="w-4 h-4 mr-1" /> Knowledge Base
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button
            onClick={handleAuth}
            disabled={isLoggingIn}
            size="sm"
            className={isAuthenticated
              ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
              : 'bg-white text-primary hover:bg-white/90'
            }
          >
            {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
          </Button>
        </div>
      </div>
    </header>
  );
}
