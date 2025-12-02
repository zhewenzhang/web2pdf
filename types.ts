export interface ProcessedDocument {
  title: string;
  originalHtml: string;
  optimizedHtml: string | null;
}

export enum ViewMode {
  ORIGINAL = 'ORIGINAL',
  OPTIMIZED = 'OPTIMIZED'
}
