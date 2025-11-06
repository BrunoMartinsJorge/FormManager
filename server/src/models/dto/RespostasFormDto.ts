export interface RespostasFormDto {
  ativo: boolean;
  questoesFormatadas: QuestoesFormatadas;
  respostasPorUsuario: RespostasPorUsuario[];
}

export interface RespostasPorUsuario {
  idQuestao: string;
  questao: QuestaoUnica;
  resposta: RespostaUnica;
}

export interface QuestoesFormatadas {
  questoes: QuestaoUnica[];
  respostas: RespostaUnica[];
}

export interface RespostaUnica {
  usuarioEmail: string;
  idResposta: string;
  dataEnviada: Date;
  respostas: Resposta_Questao[];
}

export interface QuestaoUnica {
  id: string;
  titulo: string;
  tipo: string;
  opcoes?: string[];
  escala?: any;
}

export interface Resposta_Questao {
  idQuestao: string;
  valor: string;
}
