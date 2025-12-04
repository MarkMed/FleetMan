// QuickCheck types and interfaces

export interface QuickCheckItem {
  id: string;
  name: string;
  description?: string;
}

export interface QuickCheckItemInput {
  name: string;
  description?: string;
}

export type QuickCheckMode = 'EDITING' | 'EXECUTING' | 'COMPLETED';

export type EvaluationStatus = 'APROBADO' | 'DESAPROBADO' | 'OMITIDO' | null;

export interface EvaluationStats {
  total: number;
  aprobados: number;
  desaprobados: number;
  omitidos: number;
  pendientes: number;
}

export type OverallResult = 'APROBADO' | 'DESAPROBADO' | 'PENDIENTE';

export interface QuickCheckEvaluations {
  [itemId: string]: EvaluationStatus;
}

export interface QuickCheckSubmitPayload {
  machineId: string;
  items: Array<{
    itemId: string;
    name: string;
    description?: string;
    evaluation: Exclude<EvaluationStatus, null>;
  }>;
  overallResult: OverallResult;
  timestamp: string;
}
