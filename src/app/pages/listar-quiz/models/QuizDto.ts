export class QuizDto {
  idQuiz: number;
  titulo: string;
  descricao: string;
  dataCriacao: Date;
  linkUrl: string;
  quizId: string;

  constructor(quiz: Quiz) {
    this.idQuiz = quiz.idQuiz;
    this.titulo = quiz.Titulo;
    this.descricao = quiz.Descricao;
    this.dataCriacao = quiz.Data_Criacao;
    this.quizId = quiz.quizId;
    this.linkUrl = quiz.Link_Url;
  }

  public static convert(quiz: Quiz): QuizDto {
    return new QuizDto(quiz);
  }
}

export class Quiz {
  idQuiz!: number;
  Titulo!: string;
  Descricao!: string;
  Data_Criacao!: Date;
  Link_Url!: string;
  quizId!: string;
  email!: string;
}
