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
  maxFiles?: number;
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  imagemUrl?: string;
  descricaoImagem?: string;
}
