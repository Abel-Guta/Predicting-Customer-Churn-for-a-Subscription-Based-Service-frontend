"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureContribution {
  name: string;
  value: string | number;
  contribution: "positive" | "negative" | "neutral";
  explanation: string;
}

interface PredictionExplanationProps {
  contributions: FeatureContribution[];
  prediction: number;
}

export function PredictionExplanation({
  contributions,
  prediction,
}: PredictionExplanationProps) {
  const willChurn = prediction === 1;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Prediction Explanation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {willChurn
            ? "The following factors contributed to the high churn risk prediction:"
            : "The following factors indicate a low churn risk for this customer:"}
        </p>
        <div className="space-y-3">
          {contributions.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3"
            >
              <div
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                  feature.contribution === "positive" &&
                    "bg-destructive/10 text-destructive",
                  feature.contribution === "negative" &&
                    "bg-accent/10 text-accent",
                  feature.contribution === "neutral" &&
                    "bg-muted text-muted-foreground"
                )}
              >
                {feature.contribution === "positive" ? (
                  <ArrowUp className="h-4 w-4" />
                ) : feature.contribution === "negative" ? (
                  <ArrowDown className="h-4 w-4" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground truncate">
                    {feature.name}
                  </span>
                  <span className="text-sm font-mono text-muted-foreground shrink-0">
                    {feature.value}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {feature.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-3">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Note:</strong> This explanation is based on the
            model&apos;s learned patterns. Individual predictions may vary based on the
            specific combination of customer attributes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
