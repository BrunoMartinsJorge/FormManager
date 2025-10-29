"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALternativasDto = exports.ListaQuestoesDto = void 0;
class ListaQuestoesDto {
    constructor(questao) {
        this.id = questao.idPergunta;
        this.tipo = questao.Tipo_Pergunta.Descricao;
        this.quiz = questao.Quiz || undefined;
        this.titulo = questao.Titulo;
        this.alternativas = questao.Alternativas.map((alt) => ALternativasDto.convert(alt));
        this.correta = Array.isArray(questao.AlternativasCorretas)
            ? this.alternativas.filter((alt) => questao.AlternativasCorretas.some((c) => c.idAlternativa === alt.idAlternativa && c.Texto === alt.texto))
            : [];
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
