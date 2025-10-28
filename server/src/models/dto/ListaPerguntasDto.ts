import { Pergunta } from "../Pergunta";

export class ListaPerguntasDto {
    idPergunta: number;
    titulo: string;
    tipo: string;
    opcoes: string[];
    urlImagem: string;
    descricaoImagem: string;

    constructor(
        idPergunta: number,
        titulo: string,
        tipo: string,
        opcoes: string[],
        urlImagem: string,
        descricaoImagem: string
    ){
        this.idPergunta = idPergunta;
        this.titulo = titulo;
        this.tipo = tipo;
        this.opcoes = opcoes;
        this.urlImagem = urlImagem;
        this.descricaoImagem = descricaoImagem;
    }

    static convert(pergunta: Pergunta): ListaPerguntasDto {
        console.log(pergunta);
        return new ListaPerguntasDto(
            pergunta.idPergunta,
            pergunta.Titulo,
            pergunta.Tipo_Pergunta.Descricao ?? "",
            pergunta.Alternativas.map(alt => alt.Texto),
            pergunta.UrlImagem,
            pergunta.DescricaoImagem
        );
    }
}