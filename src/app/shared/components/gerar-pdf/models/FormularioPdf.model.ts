export interface FormularioPdfModel {
  id: number;
  titulo: string;
  descricao: string;
  dataCriacao: Date;
  questoes: QuestoesPdfModel[];
}

export interface QuestoesPdfModel {
  id: number;
  titulo: string;
  tipo: string;
  opcoes?: string[];
  escala?: { min: number; max: number };
}
