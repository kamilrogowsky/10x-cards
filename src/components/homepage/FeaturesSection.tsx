import React from "react";
import { FeatureCard } from "./FeatureCard";
import type { FeatureDto } from "@/types";

interface FeaturesSectionProps {
  features: FeatureDto[];
  isLoading?: boolean;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features, isLoading = false }) => {
  // Early validation as per coding practices
  if (!Array.isArray(features) && !isLoading) {
    console.warn("FeaturesSection: Features must be an array", features);
    return null;
  }

  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            {/* Skeleton for section header */}
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 w-1/2 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Skeleton for feature cards */}
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (features.length === 0) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Główne funkcje</h2>
          <p className="text-gray-600 dark:text-gray-300">Funkcje są obecnie ładowane. Sprawdź ponownie za chwilę.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">Główne funkcje</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Odkryj, co sprawia, że nasza aplikacja do fiszek jest potężna i łatwa w użyciu
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {features.map((feature, index) => (
            <div
              key={`feature-${index}-${feature.title}`}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "both" }}
            >
              <FeatureCard feature={feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
