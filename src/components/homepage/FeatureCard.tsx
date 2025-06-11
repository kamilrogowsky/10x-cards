import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FeatureDto } from "@/types";

interface FeatureCardProps {
  feature: FeatureDto;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
  // Early validation as per coding practices
  if (!feature.title || !feature.description) {
    console.warn("FeatureCard: Missing required feature data", feature);
    return null;
  }

  return (
    <Card className="h-full transition-all duration-300 ease-out hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02] hover:-translate-y-1 focus-within:ring-2 focus-within:ring-primary/50 group cursor-pointer">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
          {feature.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-200">
          {feature.description}
        </p>
      </CardContent>
    </Card>
  );
};
