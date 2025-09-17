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
  ],
  templateUrl: './adicionar-quiz.html',
  styleUrl: './adicionar-quiz.css',
})
export class AdicionarQuiz {
  erroAoCriarFormulario: boolean = false;
  mostrarTelaAcao: boolean = false;
  visibilidadeDialog: boolean = false;
  urlForm: string = '';
  carregando: boolean = false;
  quiz: NewQuiz = {
    titulo: '',
    descricao: '',
    questoes: [],
  };
  opcao: Opcao[] = [];

  tipoDeCampo: any[] = [
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

  public changeForm(): void {
    this.quiz.questoes = this.quiz.questoes;
  }

  constructor(private formulariosService: FormulariosServices) {}

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

  public getOpcao(questao: NewQuest, i: number): string {
    return questao.opcoes?.[i] || '';
  }

  public setOpcao(questao: NewQuest, i: number, value: string) {
    if (!questao.opcoes) questao.opcoes = [];
    questao.opcoes[i] = value;
  }

  public trackByIndex(index: number): number {
    return index;
  }

  public opcaoCorreta(indexQuestao: number, indexOpcao: number): boolean {
    const questao = this.quiz.questoes[indexQuestao];
    if (!questao.respostasCorretas) questao.respostasCorretas = [];
    return questao.respostasCorretas.includes(indexOpcao);
  }

  public opcaoCorretaVerdadeiroFalse(
    indexQuestao: number,
    opcao: 'Verdadeiro' | 'Falso'
  ): boolean {
    const questao = this.quiz.questoes[indexQuestao];
    if (!questao.respostasCorretas) questao.respostasCorretas = [];
    if (!questao.valorCorreto)
      return false;
    return questao.valorCorreto.includes(opcao);
  }

  public toggleOpcaoCorreta(indexQuestao: number, indexOpcao: number): void {
    const questao = this.quiz.questoes[indexQuestao];
    if (!questao.respostasCorretas) questao.respostasCorretas = [];

    if (questao.respostasCorretas.includes(indexOpcao)) {
      questao.respostasCorretas = questao.respostasCorretas.filter(
        (i) => i !== indexOpcao
      );
    } else {
      if (questao.tipo === 'UNICA') {
        questao.respostasCorretas = [indexOpcao];
      } else {
        questao.respostasCorretas.push(indexOpcao);
      }
    }
  }

  public toogleOpcaoCorretaVerdadeiroFalso(
    indexQuestao: number,
    opcao: 'Verdadeiro' | 'Falso'
  ): void {
    const questao = this.quiz.questoes[indexQuestao];
    if (!questao.valorCorreto) questao.valorCorreto = [];
    if (questao.valorCorreto.length > 0) questao.valorCorreto = [];
    questao.valorCorreto.push(opcao);
  }

  public criarQuiz(): void {
    this.carregando = true;
    this.erroAoCriarFormulario = false;
    this.mostrarTelaAcao = false;
    this.formulariosService.criarQuiz(this.quiz).subscribe(
      (response) => {
        this.urlForm = response.formUrl;
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

  public removerQuestao(index: number): void {
    this.quiz.questoes.splice(index, 1);
  }

  public adicionarOpcao(indexQuestao: number): void {
    const questao = this.quiz.questoes[indexQuestao];

    if (!questao.opcoes) questao.opcoes = [];
    questao.opcoes.push('');
  }

  public quizIsValid(): boolean {
    if (!this.quiz.titulo || !this.quiz.descricao) return false;
    if (!this.quiz.questoes || this.quiz.questoes.length === 0) return false;

    for (let questao of this.quiz.questoes) {
      if (!questao.titulo || !questao.tipo) return false;

      if (
        questao.tipo === TypeQuestEnum.MULTIPLA ||
        questao.tipo === TypeQuestEnum.UNICA
      ) {
        if (!questao.opcoes || questao.opcoes.length === 0) return false;

        if (questao.opcoes.some((opcao) => !opcao || opcao.trim() === '')) {
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
}
