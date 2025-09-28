export interface Resposta {
  idResposta: string;
  dataEnviada: Date;
  respostas: Resposta_Questao[];
}

export interface Resposta_Questao {
  idQuestao: string;
  valor: string;
}