import { TypeQuestEnum } from '../enums/TypeQuestEnum';

export interface NewQuest {
  idPergunta?: number;
  titulo: string;
  tipo: TypeQuestEnum | undefined;
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
