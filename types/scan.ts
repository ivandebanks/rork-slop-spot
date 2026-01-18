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
}

export function getGradeLabel(score: number): string {
  if (score <= 29) return "Health Hazard";
  if (score <= 49) return "Slop";
  if (score <= 70) return "Premium Slop";
  if (score <= 89) return "B Grade";
  return "A Grade";
}

export function getGradeColor(score: number): string {
  if (score <= 29) return "#E63946";
  if (score <= 49) return "#F77F00";
  if (score <= 70) return "#FCBF49";
  if (score <= 89) return "#06D6A0";
  return "#118AB2";
}