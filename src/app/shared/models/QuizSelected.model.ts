export interface QuizSelected {
  ativo: boolean;
  titulo: string;
  dataCriacao: Date;
  questoesFormatadas: QuestoesFormatadas;
  respostasPorUsuario: RespostasPorUsuario[];
  idQuiz: number;
  quizId: string;
  descricao: string;
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
  pontuacao?: number;
  opcaoCorreta: string[];
}

export interface Resposta_Questao {
  idQuestao: string;
  valor: string;
}
