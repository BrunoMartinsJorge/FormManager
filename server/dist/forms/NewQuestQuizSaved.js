"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpcaoDaQuestao = exports.NewQuestQuizSaved = void 0;
class NewQuestQuizSaved {
    constructor(titulo, tipo, favorita, opcoes, respostasCorretas, pontos, feedbackCorreto, feedbackErrado) {
        this.titulo = titulo;
        this.tipo = tipo;
        this.favorita = favorita;
        this.opcoes = opcoes || [];
        this.respostasCorretas = respostasCorretas || [];
        this.pontos = pontos;
        this.feedbackCorreto = feedbackCorreto;
        this.feedbackErrado = feedbackErrado;
    }
}
exports.NewQuestQuizSaved = NewQuestQuizSaved;
class OpcaoDaQuestao {
    constructor(texto, idAlternativa) {
        this.texto = texto;
        this.idAlternativa = idAlternativa;
    }
}
exports.OpcaoDaQuestao = OpcaoDaQuestao;
