import React from 'react';
import { Button } from '@/components/ui/button';
import type { CtaDto } from '@/types';

interface CallToActionSectionProps {
  cta: CtaDto;
  isLoading?: boolean;
}

export const CallToActionSection: React.FC<CallToActionSectionProps> = ({ cta, isLoading = false }) => {
  // Early validation as per coding practices
  if (!cta && !isLoading) {
    console.warn('CallToActionSection: Missing CTA data');
    return null;
  }

  // Validate login URL
  if (cta && !cta.login_url) {
    console.warn('CallToActionSection: Invalid login_url', cta);
    return null;
  }

  const handleLoginClick = () => {
    if (cta?.login_url) {
      window.location.href = cta.login_url;
    }
  };

  if (isLoading) {
    return (
      <section className="bg-gray-50 dark:bg-gray-800 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Skeleton loading */}
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8 animate-pulse"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-40 mx-auto animate-pulse"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-muted/30 py-16 px-4 relative">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
          {cta.title}
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
          {cta.description}
        </p>
        <Button
          onClick={handleLoginClick}
          size="lg"
          className="px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary group"
        >
          <span className="group-hover:scale-110 transition-transform duration-200">
            Rozpocznij
          </span>
          <svg 
            className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Button>
      </div>
    </section>
  );
}; 