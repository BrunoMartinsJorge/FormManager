import { TypeQuestEnum } from '../enums/TypeQuestEnum';

export interface FormularioForm {
  titulo: string;
  descricao: string;
  questoes: NovaPergunta[];
}

export interface NovaPergunta {
  idPergunta?: number;
  titulo: string;
  tipo: TypeQuestEnum | undefined;
  min?: number;
  max?: number;
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
