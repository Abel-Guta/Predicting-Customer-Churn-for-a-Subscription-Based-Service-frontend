"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PredictionResultProps {
  prediction: number;
  confidence: number;
  isLoading?: boolean;
}

export function PredictionResult({
  prediction,
  confidence,
  isLoading,
}: PredictionResultProps) {
  const willChurn = prediction === 1;
  const confidencePercent = Math.round(confidence * 100);

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Prediction Result</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted" />
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card overflow-hidden">
      <div
        className={cn(
          "h-1 w-full",
          willChurn ? "bg-destructive" : "bg-accent"
        )}
      />
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Prediction Result
          {willChurn ? (
            <TrendingDown className="h-5 w-5 text-destructive" />
          ) : (
            <TrendingUp className="h-5 w-5 text-accent" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full",
              willChurn
                ? "bg-destructive/10 text-destructive"
                : "bg-accent/10 text-accent"
            )}
          >
            {willChurn ? (
              <AlertTriangle className="h-8 w-8" />
            ) : (
              <CheckCircle className="h-8 w-8" />
            )}
          </div>
          <div className="flex-1">
            <p
              className={cn(
                "text-xl font-semibold",
                willChurn ? "text-destructive" : "text-accent"
              )}
            >
              {willChurn
                ? "Customer is likely to churn"
                : "Customer is unlikely to churn"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {willChurn
                ? "Consider implementing retention strategies"
                : "This customer appears to be satisfied"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Prediction Confidence</span>
            <span className="font-mono font-semibold">{confidencePercent}%</span>
          </div>
          <Progress
            value={confidencePercent}
            className={cn(
              "h-3",
              willChurn ? "[&>div]:bg-destructive" : "[&>div]:bg-accent"
            )}
          />
          <p className="text-xs text-muted-foreground">
            {confidencePercent >= 80
              ? "High confidence prediction"
              : confidencePercent >= 60
              ? "Moderate confidence prediction"
              : "Low confidence - consider additional data"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
