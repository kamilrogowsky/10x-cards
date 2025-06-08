import React from 'react';
import { Button } from '@/components/ui/button';
import type { CtaDto } from '@/types';

interface TopBarProps {
  cta?: CtaDto;
  isLoading?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ cta, isLoading = false }) => {
  const handleLoginClick = () => {
    if (cta?.login_url) {
      window.location.href = cta.login_url;
    } else {
      // Fallback to /login if no URL provided
      window.location.href = '/login';
    }
  };

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <button 
              onClick={handleLogoClick}
              className="flex items-center gap-2 transition-all duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg px-1 py-1"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                10xCards
              </h1>
            </button>
          </div>

          {/* Login Button */}
          <div className="flex items-center">
            {isLoading ? (
              <div className="h-9 w-16 sm:w-20 bg-muted rounded-md animate-pulse" />
            ) : (
              <Button
                onClick={handleLoginClick}
                variant="default"
                size="sm"
                className="px-3 sm:px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                <span className="hidden sm:inline">Zaloguj się</span>
                <span className="sm:hidden">Loguj</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}; 