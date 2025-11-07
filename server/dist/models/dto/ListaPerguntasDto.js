"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListaPerguntasDto = void 0;
class ListaPerguntasDto {
    constructor(pergunta) {
        this.idPergunta = pergunta.idPergunta;
        this.titulo = pergunta.Titulo;
        this.tipo = pergunta.Tipo_Pergunta?.Descricao ?? '';
        this.opcoes = pergunta.Alternativas.map((alt) => alt.Texto);
        this.urlImagem = pergunta.UrlImagem;
        this.descricaoImagem = pergunta.DescricaoImagem;
        this.low = pergunta.low ?? 0;
        this.high = pergunta.high ?? 0;
        this.startLabel = pergunta.startLabel ?? '';
        this.endLabel = pergunta.endLabel ?? '';
        this.anos = pergunta.anos ?? false;
        this.tempo = pergunta.tempo ?? false;
        this.nivelPontuacao = pergunta.nivelPontuacao ?? 0;
        this.iconPontuacao = pergunta.iconPontuacao ?? '';
        this.obrigatorio = pergunta.obrigatorio ?? false;
    }
    static convert(pergunta) {
        return new ListaPerguntasDto(pergunta);
    }
}
exports.ListaPerguntasDto = ListaPerguntasDto;
