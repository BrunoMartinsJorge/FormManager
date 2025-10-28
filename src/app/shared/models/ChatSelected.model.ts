export interface QuizSelected {
  idQuiz: number;
  quizId: string;
  titulo: string;
  descricao: string;
  dataCriacao: string;
  questoes: Questao[];
  respostas: RespostaPorUsuario[];
}

export interface Resposta {
  idQuestao: string;
  valor: string;
}

export interface RespostaPorUsuario {
  dataEnviada: string;
  idResposta: string;
  respostas: Resposta[];
}

export interface Questao {
  id: string;
  opcoes: string[];
  tipo: string;
  titulo: string;
  opcaoCorreta?: string;
  valor?: number;
}
