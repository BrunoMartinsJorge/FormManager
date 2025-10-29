import { Pergunta } from "../Pergunta";
import { Questao } from "../Questao";
import { Quiz } from "../Quiz";

export class QuizDto {
      idQuiz: number;
      titulo: string;
      descricao: string;
      dataCriacao: Date;
      linkUrl: string;
      quizId: string;
      questoes: Questao[];

      constructor (quiz: Quiz) {
        this.idQuiz = quiz.idQuiz;
        this.titulo = quiz.Titulo;
        this.descricao = quiz.Descricao;
        this.dataCriacao = quiz.Data_Criacao;
        this.quizId = quiz.quizId;
        this.linkUrl = quiz.Link_Url;
        this.questoes = quiz.Questoes || [];
      }

      public static convert(quiz: Quiz): QuizDto {
        return new QuizDto(quiz);
      }
}