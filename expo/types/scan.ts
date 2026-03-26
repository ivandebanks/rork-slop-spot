export interface Citation {
  title: string;
  url: string;
  source: string; // e.g., "FDA", "NIH", "WHO", "PubMed"
}

export interface Ingredient {
  name: string;
  rating: number;
  healthImpact: string;
  explanation: string;
  citations?: Citation[]; // Add citations for each ingredient's health claims
}

export interface CompanyOwnership {
  company: string;
  parentCompany?: string;
  ultimateParent?: string;
  reputationScore: number; // 0-100 company reputation score
}

export interface AlternativeSuggestion {
  productName: string;
  estimatedScore: number;
  reason: string;
}

export interface ScanResult {
  id: string;
  productName: string;
  imageUri: string;
  ingredients: Ingredient[];
  overallScore: number;
  gradeLabel: string;
  timestamp: number;
  citations?: Citation[]; // Overall citations for general health information
  isFavorite?: boolean;
  behindIt?: CompanyOwnership;
  alternatives?: AlternativeSuggestion[];
}

export function getGradeLabel(score: number): string {
  if (score <= 50) return "Avoid At All Cost";
  if (score <= 60) return "Avoid";
  if (score <= 70) return "Find Alternatives";
  if (score <= 89) return "B Grade";
  return "A Grade";
}

export function getGradeColor(score: number): string {
  if (score <= 50) return "#E63946";
  if (score <= 60) return "#F77F00";
  if (score <= 70) return "#FCBF49";
  if (score <= 89) return "#06D6A0";
  return "#118AB2";
}

export function getReputationLabel(score: number): string {
  if (score <= 25) return "Very Poor";
  if (score <= 50) return "Poor";
  if (score <= 70) return "Average";
  if (score <= 85) return "Good";
  return "Excellent";
}