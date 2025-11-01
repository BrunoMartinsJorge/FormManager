import { Component } from '@angular/core';
import { FormulariosServices } from '../../services/formularios-services';
import { TypeQuestEnum } from '../adicionar-formulario/enums/TypeQuestEnum';
import { NewForm } from '../adicionar-formulario/forms/NewForm';
import { NewQuest } from '../adicionar-formulario/forms/NewQuest';
import { NewQuestQuiz } from '../adicionar-formulario/forms/NewQuestQuiz';
import { NewQuiz } from '../adicionar-formulario/forms/NewQuiz';
import { Opcao } from '../adicionar-formulario/adicionar-formulario';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { VisualizarQuestao } from '../../shared/visualizar-questao/visualizar-questao';
import { SplitButton } from 'primeng/splitbutton';
import { MenuItem } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { Checkbox } from 'primeng/checkbox';
import { QuestaoSalva } from '../questoes-salvas-quiz/model/QuestaoSalva';

@Component({
  selector: 'app-adicionar-quiz',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    DatePickerModule,
    ToggleSwitchModule,
    SelectModule,
    FieldsetModule,
    VisualizarQuestao,
    DialogModule,
    ProgressSpinnerModule,
    InputNumberModule,
    TooltipModule,
    InputGroupModule,
    InputGroupAddonModule,
    SplitButton,
    TableModule,
    Checkbox,
  ],
  templateUrl: './adicionar-quiz.html',
  styleUrl: './adicionar-quiz.css',
})
export class AdicionarQuiz {
  public erroAoCriarFormulario: boolean = false;
  public mostrarTelaAcao: boolean = false;
  public visibilidadeDialog: boolean = false;
  public urlQuiz: string = '';
  public carregando: boolean = false;
  public quiz: NewQuiz = {
    titulo: '',
    descricao: '',
    questoes: [],
  };
  public questoesSelecionadas: any[] = [];
  public questoesSalvas: any[] = [];
  public opcao: Opcao[] = [];
  public visibilidadesQuestoesSalvas: boolean = false;

  public opcoesBotao: MenuItem[] = [
    {
      label: 'Utilizar Questão Existente',
      command: () => {
        this.buscarQuestoesSalvas();
      },
    },
  ];

  public tipoDeCampo: any[] = [
    { nome: 'Texto', value: TypeQuestEnum.TEXTO },
    { nome: 'Parágrafo', value: TypeQuestEnum.PARAGRAFO },
    { nome: 'Número', value: TypeQuestEnum.NUMERO },
    { nome: 'Única Escolha', value: TypeQuestEnum.UNICA },
    { nome: 'Múltipla Escolha', value: TypeQuestEnum.MULTIPLA },
    { nome: 'Data', value: TypeQuestEnum.DATA },
    // { nome: 'Data e Hora', value: TypeQuestEnum.DATAHORA },
    { nome: 'Escala', value: TypeQuestEnum.ESCALA },
    { nome: 'Verdadeiro / Falso', value: TypeQuestEnum.VERDADEIRO_FALSO },
  ];

  constructor(private formulariosService: FormulariosServices) {}

  /**
   *
   * @description Adiciona as questões salvas que foram selecionadas ao quiz
   */
  public usarQuestoesSelecionadas(): void {
    if (this.questoesSelecionadas.length === 0) return;
    this.questoesSelecionadas.forEach((question) => {
      console.log(question);

      const novaQuestao: QuestaoSalva = {
        titulo: question.titulo,
        tipo: question.tipo,
        correta: question.correta,
        opcoes: question.opcoes,
        urlImagem: question.imagem,
        descricaoImagem: question.descricaoImagem,
        id: question.id,
        low: question.low,
        high: question.high,
        favorita: question.favorita,
        feedbackCorreto: question.feedbackCorreto,
        feedbackErro: question.feedbackErro,
        pontuacao: question.pontuacao,
      };
      this.quiz.questoes.push(novaQuestao);
    });
    this.visibilidadesQuestoesSalvas = false;
  }

  /**
   *
   * @description Busca as questões salvas do banco
   */
  private buscarQuestoesSalvas(): void {
    this.formulariosService.listarQuestoesQuiz().subscribe({
      next: (res) => {
        this.visibilidadesQuestoesSalvas = true;
        this.questoesSalvas = res;
      },
      error: (error: Error) => {
        console.error(error);
      },
    });
  }

  /**
   *
   * @description Adiciona uma nova questão ao quiz
   */
  public adicionarQuestaoQuiz() {
    const novaQuestao: NewQuestQuiz = {
      titulo: '',
      tipo: TypeQuestEnum.TEXTO,
      opcoes: undefined,
      valorCorreto: [],
      respostasCorretas: [],
    };
    this.quiz.questoes.push(novaQuestao);
  }

  /**
   * 
   * @param index - Indice da questão
   * @description Retorna o indice da questão
   * @returns - Indice da questão
   */
  public trackByIndex(index: number): number {
    return index;
  }

  /**
   * 
   * @param indexQuestao - Indice da questão
   * @param indexOpcao - Indice da opção
   * @description Verifica se a opção for correta
   * @returns - Verdadeiro se a opção for correta
   */
  public opcaoCorreta(indexQuestao: number, indexOpcao: number): boolean {
    const questao = this.quiz.questoes[indexQuestao];
    if (!questao.respostasCorretas) questao.respostasCorretas = [];
    return questao.respostasCorretas.includes(indexOpcao);
  }

  /**
   * 
   * @param indexQuestao - Indice da questão
   * @param opcao - Opção Verdadeiro ou Falso
   * @description Verifica se a opção for correta
   * @returns - Verdadeiro se a opção for correta
   */
  public opcaoCorretaVerdadeiroFalse(
    indexQuestao: number,
    opcao: 'Verdadeiro' | 'Falso'
  ): boolean {
    const questao = this.quiz.questoes[indexQuestao];
    if (!questao.respostasCorretas) questao.respostasCorretas = [];
    if (!questao.valorCorreto) return false;
    return questao.valorCorreto.includes(opcao);
  }

  /**
   * 
   * @param indexQuestao - Indice da questão
   * @param indexOpcao - Indice da opção
   * @description Altera a opção correta para a selecionada
   */
  public alterarOpcaoCorreta(indexQuestao: number, indexOpcao: number): void {
    const questao = this.quiz.questoes[indexQuestao];
    if (!questao.respostasCorretas) questao.respostasCorretas = [];

    if (questao.respostasCorretas.includes(indexOpcao)) {
      questao.respostasCorretas = questao.respostasCorretas.filter(
        (i: any) => i !== indexOpcao
      );
    } else {
      if (questao.tipo === 'UNICA') {
        questao.respostasCorretas = [indexOpcao];
      } else {
        questao.respostasCorretas.push(indexOpcao);
      }
    }
  }

  /**
   * 
   * @param indexQuestao - Indice da questão
   * @param opcao - Opção Verdadeiro ou Falso
   * @description Altera a opção correta para a selecionada
   */
  public alterarOpcaoCorretaVerdadeiroFalso(
    indexQuestao: number,
    opcao: 'Verdadeiro' | 'Falso'
  ): void {
    const questao = this.quiz.questoes[indexQuestao];
    if (!questao.valorCorreto) questao.valorCorreto = [];
    if (questao.valorCorreto.length > 0) questao.valorCorreto = [];
    questao.valorCorreto.push(opcao);
  }

  /**
   * 
   * @description Cria o quiz
   */
  public criarQuiz(): void {
    this.carregando = true;
    this.erroAoCriarFormulario = false;
    this.mostrarTelaAcao = false;
    console.log(this.quiz);

    this.formulariosService.criarQuiz(this.quiz).subscribe(
      (response) => {
        this.urlQuiz = response.formUrl;
        this.visibilidadeDialog = true;
        this.carregando = false;
      },
      (error) => {
        this.carregando = false;
        this.mostrarTelaAcao = true;
        this.erroAoCriarFormulario = true;
        console.error('Erro ao criar formulário:', error);
        setTimeout(() => {
          this.mostrarTelaAcao = false;
          this.erroAoCriarFormulario = false;
        }, 2000);
      }
    );
  }

  /**
   * 
   * @param index - Indice da questão
   * @description Remove a questão do quiz
   */
  public removerQuestao(index: number): void {
    this.quiz.questoes.splice(index, 1);
  }

  /**
   * 
   * @param indexQuestao - Indice da questão
   * @description Adiciona uma opção na questão
   */
  public adicionarOpcao(indexQuestao: number): void {
    const questao = this.quiz.questoes[indexQuestao];
    if (!questao.opcoes) questao.opcoes = [];
    questao.opcoes.push({
      idAlternativa: null,
      texto: '',
    });
    console.log(questao);
  }

  /**
   * 
   * @description Verifica se o quiz for valido
   * @returns - Verdadeiro se o quiz for valido
   */
  public quizValido(): boolean {
    if (!this.quiz.titulo || !this.quiz.descricao) return false;
    if (!this.quiz.questoes || this.quiz.questoes.length === 0) return false;

    for (let questao of this.quiz.questoes) {
      if (!questao.titulo || !questao.tipo) return false;

      if (
        questao.tipo === TypeQuestEnum.MULTIPLA ||
        questao.tipo === TypeQuestEnum.UNICA
      ) {
        if (!questao.opcoes || questao.opcoes.length === 0) return false;

        if (
          questao.opcoes.some(
            (opcao: any) => !opcao || opcao.texto.trim() === ''
          )
        ) {
          return false;
        }
        if (
          !questao.respostasCorretas ||
          questao.respostasCorretas.length === 0
        ) {
          return false;
        }
      }
      if (
        questao.tipo === TypeQuestEnum.TEXTO ||
        questao.tipo === TypeQuestEnum.PARAGRAFO
      ) {
        continue;
      }
    }

    return true;
  }

  /**
   * 
   * @param indexQuestao - Indice da questão
   * @param indexOpcao - Indice da opção
   * @description Remove uma opção da questão
   * @returns - Verdadeiro se o quiz for valido
   */
  public removerOpcao(indexQuestao: number, indexOpcao: number): void {
    const questao = this.quiz.questoes[indexQuestao];

    if (!questao || !questao.opcoes) {
      return;
    }

    for (let i = indexOpcao; i < questao.opcoes.length - 1; i++) {
      questao.opcoes[i] = questao.opcoes[i + 1];
    }
    questao.opcoes.pop();
  }

  /**
   * 
   * @description Copia o link do quiz
   */
  public copiarLink(): void {
    navigator.clipboard.writeText(this.urlQuiz);
  }
}
