"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizDto = void 0;
class QuizDto {
    constructor(quiz) {
        this.idQuiz = quiz.idQuiz;
        this.titulo = quiz.Titulo;
        this.descricao = quiz.Descricao;
        this.dataCriacao = quiz.Data_Criacao;
        this.quizId = quiz.quizId;
        this.linkUrl = quiz.Link_Url;
        this.questoes = quiz.Questoes || [];
    }
    static convert(quiz) {
        return new QuizDto(quiz);
    }
}
exports.QuizDto = QuizDto;
