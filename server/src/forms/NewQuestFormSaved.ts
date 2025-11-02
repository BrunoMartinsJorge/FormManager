export interface NewQuestFormSaved {
  titulo: string;
  tipo: string;
  opcoes?: string[];
  low?: number;
  high?: number;
  startLabel?: string;
  endLabel?: string;
  imagemUrl?: string;
  descricaoImagem?: string;
  anos?: boolean;
  tempo?: boolean;
}
