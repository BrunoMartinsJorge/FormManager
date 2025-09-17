import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { FormulariosServices } from '../../services/formularios-services';
import { NewQuest } from './forms/NewQuest';
import { NewForm } from './forms/NewForm';
import { TypeQuestEnum } from './enums/TypeQuestEnum';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectModule } from 'primeng/select';
import { FieldsetModule } from 'primeng/fieldset';
import { VisualizarQuestao } from '../../shared/visualizar-questao/visualizar-questao';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
import { NewQuiz } from './forms/NewQuiz';
import { NewQuestQuiz } from './forms/NewQuestQuiz';

export interface Opcao {
  id: number;
  valor: string;
}

@Component({
  selector: 'app-adicionar-formulario',
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
  standalone: true,
  providers: [FormulariosServices],
  templateUrl: './adicionar-formulario.html',
  styleUrl: './adicionar-formulario.css',
  animations: [
    trigger('questaoAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ opacity: 0, transform: 'translateY(20px)' })
        ),
      ]),
    ]),
  ],
})
export class AdicionarFormulario {
  erroAoCriarFormulario: boolean = false;
  mostrarTelaAcao: boolean = false;
  visibilidadeDialog: boolean = false;
  urlForm: string = '';
  carregando: boolean = false;
  formulario: NewForm = {
    titulo: '',
    descricao: '',
    questoes: [],
    dataAbertura: new Date(),
    dataFechamento: new Date(),
  };
  opcao: Opcao[] = [];

  tipoDeCampo: any[] = [
    { nome: 'Texto', value: TypeQuestEnum.TEXTO },
    { nome: 'Parágrafo', value: TypeQuestEnum.PARAGRAFO },
    { nome: 'Número', value: TypeQuestEnum.NUMERO },
    { nome: 'Única Escolha', value: TypeQuestEnum.UNICA },
    { nome: 'Múltipla Escolha', value: TypeQuestEnum.MULTIPLA },
    { nome: 'Data', value: TypeQuestEnum.DATA },
    { nome: 'Escala', value: TypeQuestEnum.ESCALA },
    { nome: 'Verdadeiro / Falso', value: TypeQuestEnum.VERDADEIRO_FALSO },
  ];

  public adicionarOpcao(indexQuestao: number): void {
    const questao = this.formulario.questoes[indexQuestao];

    if (!questao.opcoes) questao.opcoes = [];
    questao.opcoes.push('');
  }

  public newDataFechamentoMin(): void {
    let data: Date = new Date(this.formulario.dataAbertura);
    data.setDate(data.getDate() + 1);
    this.formulario.dataFechamento = data;
  }

  constructor(private formulariosService: FormulariosServices) {
    this.newDataFechamentoMin();
  }

  public adicionarQuestao(): void {
    const novaQuestao: NewQuest = {
      titulo: '',
      tipo: TypeQuestEnum.TEXTO,
      opcoes: [],
    };
    this.formulario.questoes.push(novaQuestao);
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

  public criarFormulario(): void {
    this.carregando = true;
    this.erroAoCriarFormulario = false;
    this.mostrarTelaAcao = false;

    const payload = this.formulario;

    this.formulariosService.criarFormulario(payload).subscribe(
      (response) => {
        this.urlForm = response.formUrl;
        this.visibilidadeDialog = true;
        this.carregando = false;
      },
      (error) => {
        this.carregando = false;
        this.mostrarTelaAcao = true;
        this.erroAoCriarFormulario = true;
        setTimeout(() => {
          this.mostrarTelaAcao = false;
          this.erroAoCriarFormulario = false;
        }, 2000);
      }
    );
  }

  public removerQuestao(index: number): void {
    this.formulario.questoes.splice(index, 1);
  }

  public formIsValid(): boolean {
    if (!this.formulario.titulo || !this.formulario.descricao) return false;
    if (!this.formulario.dataAbertura || !this.formulario.dataFechamento)
      return false;
    if (!this.formulario.questoes || this.formulario.questoes.length === 0)
      return false;
    for (let questao of this.formulario.questoes) {
      if (!questao.titulo || !questao.tipo) {
        return false;
      }
      if (
        questao.tipo === TypeQuestEnum.MULTIPLA ||
        questao.tipo === TypeQuestEnum.UNICA
      ) {
        for (let opcao of questao.opcoes ?? []) {
          if (!opcao || opcao.trim() === '') {
            return false;
          }
        }
      }
      if (questao.opcoes && questao.opcoes.length > 0) {
        for (let opcao of questao.opcoes) {
          if (!opcao) {
            return false;
          }
        }
      }
      if (questao.imagemUrl && questao.imagemUrl.trim() != '') {
        if (!questao.descricaoImagem || questao.descricaoImagem.trim() === '') {
          return false;
        }
      }
    }
    if (this.formulario.dataAbertura > this.formulario.dataFechamento)
      return false;
    return true;
  }

  public removerOpcao(indexQuestao: number, indexOpcao: number): void {
    const questao = this.formulario.questoes[indexQuestao];

    if (!questao || !questao.opcoes) {
      return;
    }

    for (let i = indexOpcao; i < questao.opcoes.length - 1; i++) {
      questao.opcoes[i] = questao.opcoes[i + 1];
    }
    questao.opcoes.pop();
  }

  public copyLink(): void {
    navigator.clipboard.writeText(this.urlForm);
  }
}
