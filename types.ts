
export type AppMode = 'shopping' | 'cooking';
export type RiskLevel = 'none' | 'alert' | 'critical';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Signal {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  observation: string;
  interpretation: string;
  riskLevel: RiskLevel;
}

export interface AnalysisResponse {
  signals: Signal[];
}
