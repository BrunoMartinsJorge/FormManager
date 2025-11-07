import { Pergunta } from '../Pergunta';

export class ListaPerguntasDto {
  idPergunta: number;
  titulo: string;
  tipo: string;
  opcoes: string[];
  urlImagem: string;
  descricaoImagem: string;
  low!: number;
  high!: number;
  startLabel!: string;
  endLabel!: string;
  anos!: boolean;
  tempo!: boolean;
  nivelPontuacao!: number;
  iconPontuacao!: string;
  obrigatorio!: boolean;

  constructor(pergunta: Pergunta) {
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

  static convert(pergunta: Pergunta): ListaPerguntasDto {
    return new ListaPerguntasDto(pergunta);
  }
}
