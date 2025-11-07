import { Alternativa_Questao } from '../Alternativa_Questao';
import { Questao } from '../Questao';
import { Quiz } from '../Quiz';
import { Tipo_Questao } from '../Tipo_Questao';

export class ListaQuestoesDto {
  id: number;
  tipo: string;
  quiz?: Quiz;
  titulo: string;
  opcoes?: string[];
  respostasCorretas?: string[];
  pontuacao?: number;
  feedbackCorreto?: string;
  feedbackErrado?: string;
  favorita: boolean;
  urlImagem: string;
  descricaoImagem: string;
  high: number;
  low: number;
  startLabel!: string;
  endLabel!: string;
  anos!: boolean;
  tempo!: boolean;
  nivelPontuacao!: number;
  iconPontuacao!: string;
  obrigatorio!: boolean;

  constructor(questao: Questao) {
    this.id = questao.idQuestao;
    this.tipo = questao.Tipo_Questao
      ? questao.Tipo_Questao.Descricao || ''
      : '';
    this.quiz = questao.Quiz || undefined;
    this.titulo = questao.Titulo;
    this.opcoes = questao.Alternativas.map((alt) => alt.Texto);
    this.respostasCorretas = Array.isArray(questao.AlternativasCorretas)
      ? this.opcoes.filter((alt) =>
          questao.AlternativasCorretas.some((c) => c.Texto === alt)
        )
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

  static convert(questao: Questao): ListaQuestoesDto {
    return new ListaQuestoesDto(questao);
  }
}
