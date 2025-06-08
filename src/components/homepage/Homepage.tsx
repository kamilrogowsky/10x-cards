import React from 'react';
import { useHomepageData } from '@/lib/hooks/useHomepageData';
import { TopBar } from '@/components/TopBar';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { CallToActionSection } from './CallToActionSection';

interface HomepageProps {
  user?: {
    id: string;
    email: string;
  };
}

export const Homepage: React.FC<HomepageProps> = ({ user }) => {
  const { data, isLoading, error } = useHomepageData();

  // Error boundary style error handling
  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Coś poszło nie tak
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Mamy problem z załadowaniem strony. Spróbuj odświeżyć stronę.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Odśwież stronę
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <TopBar 
        cta={data?.cta} 
        isLoading={isLoading}
        user={user} 
      />
      
      <main className="min-h-screen">
        {/* Hero Section */}
        <div id="hero" className="bg-gradient-to-b from-background via-background to-muted/20 scroll-mt-4 pt-16">
          <HeroSection 
            appInfo={data?.app_info || { name: '', description: '', version: '' }} 
            isLoading={isLoading} 
          />
        </div>

      {/* Features Section */}
      <div id="features" className="bg-background scroll-mt-4">
        <FeaturesSection 
          features={data?.features || []} 
          isLoading={isLoading} 
        />
      </div>

      {/* Call to Action Section */}
      <div id="get-started" className="scroll-mt-4">
        <CallToActionSection 
          cta={data?.cta || { title: 'Zacznij już dziś', description: 'Zaloguj się i zacznij generować fiszki w kilka minut', login_url: '/login' }} 
          isLoading={isLoading} 
        />
      </div>

      {/* Error indicator for non-critical errors */}
      {error && data && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg shadow-lg animate-slide-up backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <p className="text-sm font-medium">
              Niektóre dane mogą być nieaktualne. Używamy zapisanej wersji.
            </p>
          </div>
        </div>
      )}
    </main>
    </>
  );
}; 