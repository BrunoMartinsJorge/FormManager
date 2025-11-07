export interface NewQuestFormSaved {
  idPergunta?: number;
  titulo: string;
  tipo: string;
  opcoes: string[] | undefined;
  low?: number;
  high?: number;
  startLabel?: string;
  endLabel?: string;
  imagemUrl?: string;
  descricaoImagem?: string;
  anos?: boolean;
  tempo?: boolean;
  nivelPontuacao?: number;
  iconPontuacao?: string;
  obrigatorio?: boolean;
}
