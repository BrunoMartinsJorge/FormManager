"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListaQuestoesDto = void 0;
class ListaQuestoesDto {
    constructor(questao) {
        this.id = questao.idQuestao;
        this.tipo = questao.Tipo_Questao
            ? questao.Tipo_Questao.Descricao || ''
            : '';
        this.quiz = questao.Quiz || undefined;
        this.titulo = questao.Titulo;
        this.opcoes = questao.Alternativas.map((alt) => alt.Texto);
        this.respostasCorretas = Array.isArray(questao.AlternativasCorretas)
            ? this.opcoes.filter((alt) => questao.AlternativasCorretas.some((c) => c.Texto === alt))
            : [];
        this.high = 0;
        this.low = 0;
        this.pontuacao = questao.Pontuacao;
        this.feedbackCorreto = questao.FeedbackCorreto;
        this.feedbackErrado = questao.FeedbackErrado;
        this.favorita = questao.Favorita;
        this.urlImagem = questao.UrlImagem;
        this.descricaoImagem = questao.DescricaoImagem;
        this.anos = questao.anos;
        this.tempo = questao.tempo;
        this.nivelPontuacao = questao.nivelPontuacao;
        this.iconPontuacao = questao.iconPontuacao;
        this.obrigatorio = questao.obrigatorio;
    }
    static convert(questao) {
        return new ListaQuestoesDto(questao);
    }
}
exports.ListaQuestoesDto = ListaQuestoesDto;
