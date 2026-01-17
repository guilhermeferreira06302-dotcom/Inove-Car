
export interface Service {
  id: string;
  name: string;
  price: string;
  description: string;
  icon: string;
}

// Added AnalysisResult interface to match the AI analysis output structure
export interface AnalysisResult {
  condition: string;
  issues: string[];
  recommendedService: string;
  explanation: string;
  estimatedCost: string;
}
