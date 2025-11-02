import { TypeQuestEnum } from '../enums/TypeQuestEnum';

export interface NewQuest {
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
  pontuacao?: number;
  iconPontuacao?: string;
  obrigatorio?: boolean;
}
