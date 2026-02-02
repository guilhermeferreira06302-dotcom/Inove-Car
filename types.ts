
export interface Service {
  id: string;
  name: string;
  price: string;
  description: string;
  icon: string;
}

// Interface for AI car condition analysis result used in services and UI components
export interface AnalysisResult {
  condition: string;
  issues: string[];
  recommendedService: string;
  explanation: string;
  estimatedCost: string;
}
