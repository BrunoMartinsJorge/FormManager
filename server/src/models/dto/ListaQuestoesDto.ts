import { Alternativa_Questao } from '../Alternativa_Questao';
import { Questao } from '../Questao';
import { Quiz } from '../Quiz';
import { Tipo_Questao } from '../Tipo_Questao';

export class ListaQuestoesDto {
  id: number;
  tipo: string;
  quiz?: Quiz;
  titulo: string;
  opcoes?: ALternativasDto[];
  correta?: ALternativasDto[];
  pontuacao?: number;
  feedbackCorreto?: string;
  feedbackErro?: string;
  favorita: boolean;
  urlImagem: string;
  descricaoImagem: string;
  high: number;
  low: number;

  constructor(questao: Questao) {
    this.id = questao.idQuestao;
    this.tipo = questao.Tipo_Questao
      ? questao.Tipo_Questao.Descricao || ''
      : '';
    this.quiz = questao.Quiz || undefined;
    this.titulo = questao.Titulo;
    this.opcoes = questao.Alternativas.map((alt) =>
      ALternativasDto.convert(alt)
    );
    this.correta = Array.isArray(questao.AlternativasCorretas)
      ? this.opcoes.filter((alt) =>
          questao.AlternativasCorretas.some(
            (c) =>
              c.idAlternativa === alt.idAlternativa && c.Texto === alt.texto
          )
        )
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
