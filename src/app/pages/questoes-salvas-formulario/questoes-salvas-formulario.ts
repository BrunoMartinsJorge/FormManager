import { Component } from '@angular/core';
import { FormulariosServices } from '../../services/formularios-services';
import { Dialog } from 'primeng/dialog';
import { TypeQuestEnum } from '../adicionar-formulario/enums/TypeQuestEnum';
import { CommonModule } from '@angular/common';
import { InputNumber } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Fieldset } from 'primeng/fieldset';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { InputGroup } from 'primeng/inputgroup';
import { VisualizarQuestao } from '../../shared/visualizar-questao/visualizar-questao';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TypeQuestEnumTransformPipe } from '../../shared/pipes/type-quest-enum-transform-pipe';
import { SplitButton } from 'primeng/splitbutton';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-questoes-salvas-formulario',
  imports: [
    Dialog,
    CommonModule,
    InputNumber,
    ReactiveFormsModule,
    FormsModule,
    Fieldset,
    Button,
    Select,
    InputText,
    InputGroup,
    VisualizarQuestao,
    TableModule,
    TypeQuestEnumTransformPipe,
    SplitButton,
    ProgressSpinner,
  ],
  providers: [FormulariosServices, MessageService],
  templateUrl: './questoes-salvas-formulario.html',
  styleUrl: './questoes-salvas-formulario.css',
})
export class QuestoesSalvasFormulario {
  public listOfSavedQuestions: any[] = [];
  public visibleDialogAddQuestion: boolean = false;
  public dialogMode: 'add' | 'edit' = 'add';
  public newQuestion: any = {};
  public load_questions: boolean = false;
  public tipoDeCampo: any[] = [
    { nome: 'Texto', value: TypeQuestEnum.TEXTO },
    { nome: 'Parágrafo', value: TypeQuestEnum.PARAGRAFO },
    { nome: 'Número', value: TypeQuestEnum.NUMERO },
    { nome: 'Única Escolha', value: TypeQuestEnum.UNICA },
    { nome: 'Múltipla Escolha', value: TypeQuestEnum.MULTIPLA },
    { nome: 'Data', value: TypeQuestEnum.DATA },
    { nome: 'Escala', value: TypeQuestEnum.ESCALA },
    { nome: 'Verdadeiro / Falso', value: TypeQuestEnum.VERDADEIRO_FALSO },
  ];
  public menuOptions: any[] = [
    {
      label: 'Ver Imagem',
      icon: 'pi pi-image',
      command: () => {
        //this.acessarFormulario(this.formularioSelecionado);
      },
    },
    { separator: true },
    {
      label: 'Apagar Questão',
      icon: 'pi pi-trash',
      command: () => {
        //this.gerarPDF(this.formularioSelecionado);
      },
    },
  ];

  constructor(
    private formService: FormulariosServices,
    private toast: MessageService
  ) {
    this.getSavedQuestions();
  }

  private getSavedQuestions(): void {
    this.listOfSavedQuestions = [];
    this.load_questions = true;
    this.formService.findAllQuestionsFavorites().subscribe({
      next: (response: any) => {
        this.listOfSavedQuestions = response || [];
        this.load_questions = false;
      },
      error: (err) => {
        console.error('Erro ao buscar questões salvas:', err);
        this.toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as questões salvas.',
        });
        this.load_questions = false;
      },
    });
  }

  public selectQuestion(event: any, quest: any): void {
    if (quest.imagem == null || quest.imagem == '') {
      this.menuOptions = [
        {
          label: 'Apagar Questão',
          icon: 'pi pi-trash',
          command: () => {
            //this.gerarPDF(this.formularioSelecionado);
          },
        },
      ];
    } else {
      this.menuOptions = [
        {
          label: 'Ver Imagem',
          icon: 'pi pi-image',
          command: () => {
            this.viewImageQuest(quest.imagem);
          },
        },
        { separator: true },
        {
          label: 'Apagar Questão',
          icon: 'pi pi-trash',
          command: () => {
            //this.gerarPDF(this.formularioSelecionado);
          },
        },
      ];
    }
  }

  public openDialogAddQuestion(): void {
    this.dialogMode = 'add';
    this.visibleDialogAddQuestion = true;
    this.newQuestion = {
      titulo: '',
      tipo: TypeQuestEnum.TEXTO,
      opcoes: [],
      favorita: true,
    };
  }

  public editSavedQuestion(): void {}

  public toggleVisibilityDialogEditQuestion(questao: any): void {
    this.dialogMode = 'edit';

    this.visibleDialogAddQuestion = !this.visibleDialogAddQuestion;
    if (this.visibleDialogAddQuestion) {
      this.newQuestion = {
        descricaoImagem: questao.descricaoImagem,
        favorita: questao.favorito,
        id: questao.id,
        imagem: questao.imagem,
        opcoes: questao.opcoes,
        titulo: questao.titulo,
        tipo: questao.tipo,
      };
    } else this.newQuestion = {};
  }

  public viewImageQuest(url: string): void {
    window.open(url, '_blank');
  }

  public adicionarOpcao(): void {
    if (!this.newQuestion.opcoes) this.newQuestion.opcoes = [];
    this.newQuestion.opcoes.push('');
  }

  public trackByIndex(index: number): number {
    return index;
  }

  public removerOpcao(indexOpcao: number): void {
    if (!this.newQuestion || !this.newQuestion.opcoes) {
      return;
    }

    for (let i = indexOpcao; i < this.newQuestion.opcoes.length - 1; i++) {
      this.newQuestion.opcoes[i] = this.newQuestion.opcoes[i + 1];
    }
    this.newQuestion.opcoes.pop();
  }

  public urlImageIsValid(url: string): boolean {
    if (!url || url.trim() === '') return false;
    const regex =
      /^(https?|ftp|file):\/\/((?!(https?|ftp|file):\/\/[-a-zA-Z\d+&@#/%?=~_|!:,.;]*[-a-zA-Z\d+&@#/%=~_|])[-a-zA-Z\d+&@#/%?=~_|!:,.;])*[-a-zA-Z\d+&@#/%=~_|]$/;
    return regex.test(url);
  }

  public questIsValid(): boolean {
    if (!this.newQuestion.titulo || this.newQuestion.titulo.trim() === '') {
      return false;
    }
    if (this.newQuestion.imagemUrl && this.newQuestion.imagemUrl.trim() != '') {
      if (
        !this.newQuestion.descricaoImagem ||
        this.newQuestion.descricaoImagem.trim() === ''
      ) {
        return false;
      }
    }
    if (
      this.newQuestion.tipo === TypeQuestEnum.MULTIPLA ||
      this.newQuestion.tipo === TypeQuestEnum.UNICA
    ) {
      for (let opcao of this.newQuestion.opcoes ?? []) {
        if (!opcao || opcao.trim() === '') {
          return false;
        }
      }
    }
    for (let opcao of this.newQuestion.opcoes) {
      if (!opcao || opcao.trim() === '') {
        return false;
      }
    }
    return true;
  }

  public addSavedQuestion(): void {
    if (!this.questIsValid()) return;
    this.formService.addQuestionToFavorites(this.newQuestion).subscribe({
      next: (response) => {
        this.toast.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Questão salva com sucesso!',
        });
        this.visibleDialogAddQuestion = false;
        this.getSavedQuestions();
      },
      error: (err) => {
        console.error('Erro ao salvar questão:', err);
        this.toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível salvar a questão.',
        });
      },
    });
  }
}
