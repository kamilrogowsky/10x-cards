import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function SkeletonList() {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Generowanie fiszek...</h2>
        <p className="text-muted-foreground">AI analizuje twój tekst i tworzy fiszki</p>
      </div>
      
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-16 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 