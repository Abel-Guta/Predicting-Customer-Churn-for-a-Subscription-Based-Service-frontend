"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface BackendModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  auc_score?: number;
  [key: string]: number | undefined;
}

interface ModelMetricsBackendProps {
  refreshTrigger?: boolean;
}

export function ModelMetricsBackend({ refreshTrigger }: ModelMetricsBackendProps) {
  const [metrics, setMetrics] = useState<BackendModelMetrics | null>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const info = await api.getModelInfo();
        setModelInfo(info);
        if (info.metrics) {
          setMetrics(info.metrics as BackendModelMetrics);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load metrics");
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading metrics from backend...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !metrics) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-sm text-red-500">{error || "Failed to load metrics"}</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const metricsArray = [
    { name: "Accuracy", value: (metrics.accuracy || 0) * 100, actual: metrics.accuracy || 0 },
    { name: "Precision", value: (metrics.precision || 0) * 100, actual: metrics.precision || 0 },
    { name: "Recall", value: (metrics.recall || 0) * 100, actual: metrics.recall || 0 },
    { name: "F1 Score", value: (metrics.f1_score || 0) * 100, actual: metrics.f1_score || 0 },
    { name: "AUC Score", value: (metrics.auc_score || 0) * 100, actual: metrics.auc_score || 0 },
  ];

  // Data for radar chart
  const radarData = metricsArray.map((m) => ({
    name: m.name,
    value: m.value,
    fullMark: 100,
  }));

  // Color mapping
  const getColor = (value: number) => {
    if (value >= 85) return "#10b981"; // green
    if (value >= 70) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  return (
    <div className="space-y-6">
      {/* Header with Model Info */}
      <Card className="border-border bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Model Name</p>
              <p className="text-lg font-bold text-foreground">{modelInfo?.model_name || "ML Model"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Version</p>
              <p className="text-lg font-bold text-foreground">{modelInfo?.model_version || "1.0"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Training Samples</p>
              <p className="text-lg font-bold text-foreground">
                {modelInfo?.total_samples_trained?.toLocaleString() || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Metrics Display */}
      <div className="grid grid-cols-5 gap-3">
        {metricsArray.map((metric) => (
          <Card key={metric.name} className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground font-semibold uppercase mb-2">
                  {metric.name}
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: getColor(metric.value) }}
                >
                  {metric.value.toFixed(1)}%
                </p>
                <div className="mt-2 h-1 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${metric.value}%`,
                      backgroundColor: getColor(metric.value),
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bar Chart */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Performance Metrics Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metricsArray} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--color-foreground)", fontSize: 12 }}
                axisLine={{ stroke: "var(--color-border)" }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "var(--color-foreground)", fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
                axisLine={{ stroke: "var(--color-border)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
                formatter={(value) => {
                  if (typeof value === "number") return `${value.toFixed(1)}%`;
                  const num = Number(value);
                  return isNaN(num) ? String(value) : `${num.toFixed(1)}%`;
                }}
                labelStyle={{ color: "var(--color-popover-foreground)" }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {metricsArray.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radar Chart - Performance Profile */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Model Performance Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis
                dataKey="name"
                tick={{ fill: "var(--color-foreground)", fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "var(--color-foreground)", fontSize: 12 }}
              />
              <Radar
                name="Performance"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
                formatter={(value) => {
                  if (typeof value === "number") return `${value.toFixed(1)}%`;
                  const num = Number(value);
                  return isNaN(num) ? String(value) : `${num.toFixed(1)}%`;
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Metrics Interpretation */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Metrics Interpretation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Accuracy</h4>
              <p className="text-sm text-blue-800">
                Overall correctness of predictions. {metrics.accuracy && metrics.accuracy >= 0.8 ? "✓ Excellent" : "⚠ Needs improvement"}
              </p>
              <p className="text-xs text-blue-700 mt-1">{(metrics.accuracy! * 100).toFixed(1)}% of predictions correct</p>
            </div>

            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">Precision</h4>
              <p className="text-sm text-green-800">
                Of predicted churns, how many actually churned. {metrics.precision && metrics.precision >= 0.8 ? "✓ High reliability" : "⚠ Moderate"}
              </p>
              <p className="text-xs text-green-700 mt-1">{(metrics.precision! * 100).toFixed(1)}% precision</p>
            </div>

            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">Recall</h4>
              <p className="text-sm text-purple-800">
                Of actual churns, how many we caught. {metrics.recall && metrics.recall >= 0.75 ? "✓ Good coverage" : "⚠ Limited coverage"}
              </p>
              <p className="text-xs text-purple-700 mt-1">{(metrics.recall! * 100).toFixed(1)}% recall</p>
            </div>

            <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-2">F1 Score</h4>
              <p className="text-sm text-orange-800">
                Balanced measure of precision and recall. {metrics.f1_score && metrics.f1_score >= 0.75 ? "✓ Well-balanced" : "⚠ Check balance"}
              </p>
              <p className="text-xs text-orange-700 mt-1">{(metrics.f1_score! * 100).toFixed(1)}% F1 score</p>
            </div>
          </div>

          {metrics.auc_score && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-2">AUC-ROC Score</h4>
              <p className="text-sm text-indigo-800">
                Area Under the Receiver Operating Characteristic Curve measures the model's ability to distinguish between classes.
              </p>
              <p className="text-xs text-indigo-700 mt-1">{(metrics.auc_score * 100).toFixed(1)}% AUC score</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Quality Assessment */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Overall Model Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(() => {
              const avg =
                (metricsArray.reduce((sum, m) => sum + m.value, 0) / metricsArray.length) / 100;
              const assessment = avg >= 0.85 ? "Excellent" : avg >= 0.75 ? "Good" : avg >= 0.65 ? "Fair" : "Needs Improvement";
              const color = avg >= 0.85 ? "text-green-600" : avg >= 0.75 ? "text-blue-600" : avg >= 0.65 ? "text-yellow-600" : "text-red-600";

              return (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Average Performance</span>
                    <span className={`text-2xl font-bold ${color}`}>{(avg * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        avg >= 0.85
                          ? "bg-green-500"
                          : avg >= 0.75
                          ? "bg-blue-500"
                          : avg >= 0.65
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${avg * 100}%` }}
                    />
                  </div>
                  <p className={`text-sm font-semibold ${color}`}>
                    Assessment: {assessment}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {assessment === "Excellent"
                      ? "The model demonstrates excellent predictive performance across all metrics."
                      : assessment === "Good"
                      ? "The model shows good performance and can be reliably used for predictions."
                      : assessment === "Fair"
                      ? "The model shows acceptable performance but may benefit from optimization."
                      : "The model requires refinement and retraining for better performance."}
                  </p>
                </>
              );
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
