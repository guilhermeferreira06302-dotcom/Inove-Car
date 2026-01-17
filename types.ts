
export interface Service {
  id: string;
  name: string;
  price: string;
  description: string;
  icon: string;
}

export interface AnalysisResult {
  condition: string;
  issues: string[];
  recommendedService: string;
  estimatedCost: string;
  explanation: string;
}

export enum AppSection {
  HOME = 'home',
  SERVICES = 'services',
  AI_ANALYZE = 'ai_analyze',
  LOCATION = 'location'
}
