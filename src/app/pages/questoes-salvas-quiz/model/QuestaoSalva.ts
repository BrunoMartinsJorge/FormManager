import { TypeQuestEnum } from '../../adicionar-formulario/enums/TypeQuestEnum';

export interface QuestaoSalva {
  id?: number;
  titulo: string;
  tipo: TypeQuestEnum | undefined;
  opcoes: string[] | undefined;
  respostasCorretas: string[] | undefined;
  low?: number;
  high?: number;
  startLabel?: string;
  endLabel?: string;
  urlImagem?: string;
  descricaoImagem?: string;
  anos?: boolean;
  tempo?: boolean;
  nivelPontuacao?: number;
  iconPontuacao?: string;
  obrigatorio?: boolean;
  feedbackCorreto?: string;
  feedbackErrado?: string;
  pontuacao?: number;
}