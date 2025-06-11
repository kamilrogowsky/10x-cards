import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingSkeleton: React.FC = () => {
  return (
    <main className="min-h-screen pt-16">
      {/* Hero Section Skeleton */}
      <div className="bg-gradient-to-b from-background via-background to-muted/20">
        <section className="text-center py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-16 md:h-20 lg:h-24 mb-6 mx-auto max-w-md" />
            <Skeleton className="h-8 md:h-10 mb-4 mx-auto max-w-2xl" />
            <Skeleton className="h-6 mb-6 mx-auto max-w-xl" />
            <Skeleton className="h-8 w-32 mx-auto rounded-full" />
          </div>
        </section>
      </div>

      {/* Features Section Skeleton */}
      <div className="bg-background">
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Skeleton className="h-12 md:h-14 mb-6 mx-auto max-w-sm" />
              <Skeleton className="h-6 mx-auto max-w-2xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {[1, 2, 3].map((index) => (
                <div key={index} className="space-y-4">
                  <Skeleton className="h-48 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* CTA Section Skeleton */}
      <div className="bg-muted/30">
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Skeleton className="h-12 md:h-14 mb-4 mx-auto max-w-md" />
            <Skeleton className="h-6 mb-8 mx-auto max-w-lg" />
            <Skeleton className="h-12 w-40 mx-auto rounded-lg" />
          </div>
        </section>
      </div>
    </main>
  );
};
