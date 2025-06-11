import React from "react";
import type { AppInfoDto } from "@/types";

interface HeroSectionProps {
  appInfo: AppInfoDto;
  isLoading?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ appInfo, isLoading = false }) => {
  // Early validation as per coding practices
  if (!appInfo && !isLoading) {
    console.warn("HeroSection: Missing appInfo data");
    return null;
  }

  if (isLoading) {
    return (
      <section className="text-center py-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Skeleton loading */}
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6 animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2 mx-auto animate-pulse"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="text-center py-24 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent mb-6 animate-fade-up">
          {appInfo.name}
        </h1>
        <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-6 leading-relaxed animate-fade-up [animation-delay:0.2s] [animation-fill-mode:both]">
          {appInfo.description}
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full animate-fade-up [animation-delay:0.4s] [animation-fill-mode:both]">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <p className="text-sm text-muted-foreground">Wersja {appInfo.version}</p>
        </div>
      </div>
    </section>
  );
};
