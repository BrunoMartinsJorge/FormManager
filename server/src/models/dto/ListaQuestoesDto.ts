import { Alternativa_Questao } from '../Alternativa_Questao';
import { Questao } from '../Questao';
import { Quiz } from '../Quiz';
import { Tipo_Pergunta } from '../Tipo_Pergunta';

export class ListaQuestoesDto {
  id: number;
  tipo: string;
  quiz?: Quiz;
  titulo: string;
  alternativas?: ALternativasDto[];
  correta?: ALternativasDto[];
  favorita: boolean;
  urlImagem: string;
  descricaoImagem: string;

  constructor(questao: Questao) {
    this.id = questao.idPergunta;
    this.tipo = questao.Tipo_Pergunta.Descricao;
    this.quiz = questao.Quiz || undefined;
    this.titulo = questao.Titulo;
    this.alternativas = questao.Alternativas.map((alt) =>
      ALternativasDto.convert(alt)
    );
    this.correta = Array.isArray(questao.AlternativasCorretas)
      ? this.alternativas.filter((alt) =>
          questao.AlternativasCorretas.some(
            (c) =>
              c.idAlternativa === alt.idAlternativa && c.Texto === alt.texto
          )
        )
      : [];
    this.favorita = questao.Favorita;
    this.urlImagem = questao.UrlImagem;
    this.descricaoImagem = questao.DescricaoImagem;
  }

  static convert(questao: Questao): ListaQuestoesDto {
    return new ListaQuestoesDto(questao);
  }
}

export class ALternativasDto {
  idAlternativa: number;
  texto: string;

  constructor(alt: Alternativa_Questao) {
    this.idAlternativa = alt.idAlternativa;
    this.texto = alt.Texto;
  }

  static convert(alt: Alternativa_Questao): ALternativasDto {
    return new ALternativasDto(alt);
  }
}
