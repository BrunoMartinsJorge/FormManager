"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListaPerguntasDto = void 0;
class ListaPerguntasDto {
    constructor(idPergunta, titulo, tipo, opcoes, urlImagem, descricaoImagem) {
        this.idPergunta = idPergunta;
        this.titulo = titulo;
        this.tipo = tipo;
        this.opcoes = opcoes;
        this.urlImagem = urlImagem;
        this.descricaoImagem = descricaoImagem;
    }
    static convert(pergunta) {
        console.log(pergunta);
        return new ListaPerguntasDto(pergunta.idPergunta, pergunta.Titulo, pergunta.Tipo_Pergunta.Descricao ?? "", pergunta.Alternativas.map(alt => alt.Texto), pergunta.UrlImagem, pergunta.DescricaoImagem);
    }
}
exports.ListaPerguntasDto = ListaPerguntasDto;
