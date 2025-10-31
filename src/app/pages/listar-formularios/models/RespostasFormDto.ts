export interface RespostasFormDto {
  ativo: boolean;
  titulo: string;
  idFormulario: number;
  formId: string;
  dataCriacao: Date;
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
  idResposta: string;
  dataEnviada: Date;
  usuarioEmail: string;
  respostas: Resposta_Questao[];
}

export interface QuestaoUnica {
  id: string;
  titulo: string;
  tipo: string;
  opcoes?: string[];
}

export interface Resposta_Questao {
  idQuestao: string;
  valor: string;
}
