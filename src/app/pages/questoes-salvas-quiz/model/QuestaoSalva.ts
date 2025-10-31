export interface QuestaoSalva {
  id: number;
  tipo: string;
  titulo: string;
  opcoes?: ALternativasDto[];
  correta?: ALternativasDto[];
  favorita: boolean;
  urlImagem?: string;
  descricaoImagem?: string;
  low?: number;
  high?: number;
  feedbackCorreto?: string;
  feedbackErro?: string;
  pontuacao?: number;
}

export interface ALternativasDto {
  idAlternativa: number;
  texto: string;
}
