/**
 * API Service for Customer Churn Prediction
 * Handles all communication with the FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Types matching the FastAPI schemas
export interface CustomerData {
  gender: "Male" | "Female";
  SeniorCitizen: 0 | 1;
  Partner: "Yes" | "No";
  Dependents: "Yes" | "No";
  tenure: number;
  PhoneService: "Yes" | "No";
  MultipleLines: "Yes" | "No" | "No phone service";
  InternetService: "DSL" | "Fiber optic" | "No";
  OnlineSecurity: "Yes" | "No" | "No internet service";
  OnlineBackup: "Yes" | "No" | "No internet service";
  DeviceProtection: "Yes" | "No" | "No internet service";
  TechSupport: "Yes" | "No" | "No internet service";
  StreamingTV: "Yes" | "No" | "No internet service";
  StreamingMovies: "Yes" | "No" | "No internet service";
  Contract: "Month-to-month" | "One year" | "Two year";
  PaperlessBilling: "Yes" | "No";
  PaymentMethod: "Electronic check" | "Mailed check" | "Bank transfer (automatic)" | "Credit card (automatic)";
  MonthlyCharges: number;
  TotalCharges: number;
}

export interface PredictionResponse {
  prediction: "Yes" | "No";
  probability: number;
  confidence: "High" | "Medium" | "Low";
  risk_factors: string[];
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  auc_score: number;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
}

export interface ModelInfoResponse {
  model_name: string;
  model_version: string;
  training_date: string;
  total_samples_trained: number;
  metrics: ModelMetrics;
}

export interface HealthCheckResponse {
  status: "healthy" | "unhealthy";
  model_loaded: boolean;
  version: string;
}

export interface BatchPredictionRequest {
  customers: CustomerData[];
}

export interface BatchPredictionResponse {
  total: number;
  predictions: Array<PredictionResponse & { customer_id?: string }>;
  timestamp: string;
}

class ChurnPredictionAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Check API health status
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to check API health: ${error}`);
    }
  }

  /**
   * Get model information and metrics
   */
  async getModelInfo(): Promise<ModelInfoResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/model/info`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Map backend response to frontend ModelInfoResponse shape
      return {
        model_name: data.model_name,
        model_version: data.model_version || data.model_type || "",
        training_date: data.last_trained || data.training_date || "",
        total_samples_trained: data.total_samples_trained || 0,
        metrics: {
          accuracy: data.accuracy ?? 0,
          precision: data.precision ?? 0,
          recall: data.recall ?? 0,
          f1_score: data.f1_score ?? 0,
          auc_score: data.roc_auc ?? data.auc_score ?? 0,
        },
      };
    } catch (error) {
      throw new Error(`Failed to fetch model info: ${error}`);
    }
  }

  /**
   * Get feature importance
   */
  async getFeatureImportance(): Promise<FeatureImportanceItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/model/features`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch feature importance: ${error}`);
    }
  }

  /**
   * Make a prediction for a single customer
   */
  async predict(customerData: CustomerData): Promise<PredictionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Prediction failed: ${error}`);
    }
  }

  /**
   * Make batch predictions for multiple customers
   */
  async predictBatch(customers: CustomerData[]): Promise<BatchPredictionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/predict/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customers }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Batch prediction failed: ${error}`);
    }
  }
}

// Export singleton instance
export const api = new ChurnPredictionAPI();
