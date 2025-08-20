
export interface CowAnalysisResult {
  peso_kg: number;
  raza: string;
  comentarios: string;
}

export interface HistoryEntry extends CowAnalysisResult {
    id: string;
    name: string;
    imageUrl: string;
    date: string;
}
