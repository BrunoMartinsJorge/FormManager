"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALternativasDto = exports.ListaQuestoesDto = void 0;
class ListaQuestoesDto {
    constructor(questao) {
        this.id = questao.idQuestao;
        this.tipo = questao.Tipo_Questao
            ? questao.Tipo_Questao.Descricao || ''
            : '';
        this.quiz = questao.Quiz || undefined;
        this.titulo = questao.Titulo;
        this.opcoes = questao.Alternativas.map((alt) => ALternativasDto.convert(alt));
        this.respostasCorretas = Array.isArray(questao.AlternativasCorretas)
            ? this.opcoes.filter((alt) => questao.AlternativasCorretas.some((c) => c.idAlternativa === alt.idAlternativa && c.Texto === alt.texto))
            : [];
        this.high = 0;
        this.low = 0;
        this.pontuacao = questao.Pontuacao;
        this.feedbackCorreto = questao.FeedbackCorreto;
        this.feedbackErro = questao.FeedbackErrado;
        this.favorita = questao.Favorita;
        this.urlImagem = questao.UrlImagem;
        this.descricaoImagem = questao.DescricaoImagem;
    }
    static convert(questao) {
        return new ListaQuestoesDto(questao);
    }
}
exports.ListaQuestoesDto = ListaQuestoesDto;
class ALternativasDto {
    constructor(alt) {
        this.idAlternativa = alt.idAlternativa;
        this.texto = alt.Texto;
    }
    static convert(alt) {
        return new ALternativasDto(alt);
    }
}
exports.ALternativasDto = ALternativasDto;
