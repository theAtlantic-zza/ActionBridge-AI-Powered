export type Confidence = "high" | "medium" | "low";

interface BaseItem {
  id: string;
  description: string;
  sourceExcerpt: string;
  confidence: Confidence;
  confirmed: boolean;
}

export interface TaskItem extends BaseItem {
  owner: string | null;
  deadline: string | null;
}

export interface ConfirmationItem extends BaseItem {
  relatedTo: string | null;
}

export interface RiskItem extends BaseItem {
  impact: string;
}

export interface NextStepItem extends BaseItem {
  owner: string | null;
  priority: "high" | "medium" | "low";
}

export interface AnalysisResult {
  tasks: TaskItem[];
  pendingConfirmations: ConfirmationItem[];
  risks: RiskItem[];
  nextSteps: NextStepItem[];
  meta: {
    inputWordCount: number;
    analyzedAt: string;
  };
}
