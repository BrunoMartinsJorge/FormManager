import { Pergunta } from "../Pergunta";
import { Quiz } from "../Quiz";

export class QuizDto {
      idQuiz: number;
      titulo: string;
      descricao: string;
      dataCriacao: Date;
      linkUrl: string;
      quizId: string;
      perguntas: Pergunta[];

      constructor (quiz: Quiz) {
        this.idQuiz = quiz.idFormulario;
        this.titulo = quiz.Titulo;
        this.descricao = quiz.Descricao;
        this.dataCriacao = quiz.Data_Criacao;
        this.quizId = quiz.formId;
        this.linkUrl = quiz.Link_Url;
        this.perguntas = quiz.Perguntas || [];
      }

      public static convert(quiz: Quiz): QuizDto {
        return new QuizDto(quiz);
      }
}