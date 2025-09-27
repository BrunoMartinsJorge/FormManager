import { Component, Type } from '@angular/core';
import { Formulario } from '../../shared/models/formulario.model';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormulariosServices } from '../../services/formularios-services';
import { NewForm } from '../adicionar-formulario/forms/NewForm';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Router } from '@angular/router';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { QuestaoModel } from '../../shared/models/questao.model';
import { Resposta } from '../../shared/models/resposta.model';
import { Fieldset } from 'primeng/fieldset';
import { GerarPdf } from '../gerar-pdf/gerar-pdf';
import { SelectButton } from 'primeng/selectbutton';
import { GerarGraficos } from '../gerar-graficos/gerar-graficos';
import { TypeQuestEnum } from '../adicionar-formulario/enums/TypeQuestEnum';
import { SplitButtonModule } from 'primeng/splitbutton';

export interface Quest {
  titulo: string;
  tipoQuestao: any;
  opcoes?: string[];
  escala?: { min: number; max: number };
}

export interface Form {
  titulo: string;
  descricaoFormulario: string;
  questoes: Quest[];
}

@Component({
  selector: 'app-listar-formularios',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    ConfirmPopupModule,
    ToastModule,
    DialogModule,
    ProgressSpinner,
    Fieldset,
    GerarPdf,
    GerarGraficos,
    SplitButtonModule,
  ],
  templateUrl: './listar-formularios.html',
  styleUrl: './listar-formularios.css',
  providers: [ConfirmationService, MessageService],
})
export class ListarFormularios {
  public listOfForms: Formulario[] = [];
  public carregando_formulario: boolean = false;
  public formularioSelecionado: NewForm | any;
  public questoes: QuestaoModel[] = [];
  public habilitarGerarPDF: boolean = false;
  public habilitarGerarGrafico: boolean = false;
  public formularioParaPDF: NewForm | any;
  public carregando_questoes: boolean = false;
  public idFormSelecionado: number | null = null;
  public form: Form = {
    titulo: '',
    descricaoFormulario: '',
    questoes: [],
  };
  public opcoesGraficos: any[] = [];
  public opcoesMenu: MenuItem[];

  constructor(
    private formulariosService: FormulariosServices,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.getForms();
    this.opcoesMenu = [
      {
        label: 'Acessar Formulário',
        icon: 'pi pi-external-link',
        command: () => {
          this.acessarFormulario(this.formularioSelecionado);
        },
      },
      {
        label: 'Apagar Formulário',
        icon: 'pi pi-trash',
        command: () => {
          this.apagarFormulario(this.formularioSelecionado.idFormulario);
        },
      },
      { separator: true },
      {
        label: 'Gerar PDF',
        icon: 'pi pi-file',
        command: () => {
          this.gerarPDF(this.formularioSelecionado);
        },
      },
    ];
  }

  public selectForm(event: any, form: any): void {
    if (!form) return;
    this.formularioSelecionado = form;
  }

  private getForms(): void {
    this.formulariosService.listarFormularios().subscribe({
      next: (response: Formulario[]) => {
        this.listOfForms = response;
      },
      error: (error: Error) => {
        console.error(error);
      },
    });
  }

  private converterDados(questoes: any[]): Quest[] {
    return questoes
      .map((item) => {
        const question = item.questionItem?.question;

        const tipo = question
          ? question.choiceQuestion
            ? 'MULTIPLA_ESCOLHA'
            : question.textQuestion
            ? 'TEXTO'
            : question.scaleQuestion
            ? 'ESCALA'
            : 'OUTRO'
          : 'IMAGEM';

        const questao: Quest = {
          titulo: item.titulo || '',
          tipoQuestao: item.tipo,
          opcoes: item.opcoes
        };

        return questao;
      })
      .filter((q): q is Quest => q !== null);
  }

  public acessarFormulario(form: any): void {
    window.open(form.Link_Url, '_blank');
  }

  public visualizarFormulario(form: any): void {
    if (!form.formId) return;
    this.formularioSelecionado = null;
    this.carregando_formulario = true;

    this.formulariosService
      .buscarRespostasDeFormularioPorIdForm(form.formId)
      .subscribe({
        next: (response: any) => {
          this.formularioSelecionado = response;
          const questoes: QuestaoModel[] = [];

          const questionMap: {
            [key: string]: { titulo: string; tipo: TypeQuestEnum };
          } = {};

          response.items.forEach((item: any) => {
            if (item.questionItem) {
              const q = item.questionItem.question;
              let tipo: TypeQuestEnum = TypeQuestEnum.UNICA;
              if (q.textQuestion) tipo = TypeQuestEnum.TEXTO;
              else if (q.paragraphQuestion) tipo = TypeQuestEnum.PARAGRAFO;
              else if (q.choiceQuestion) tipo = TypeQuestEnum.UNICA;
              else if (q.checkboxQuestion) tipo = TypeQuestEnum.MULTIPLA;
              else if (q.dateQuestion) tipo = TypeQuestEnum.DATA;
              else if (q.scaleQuestion) tipo = TypeQuestEnum.ESCALA;
              else if (q.boolQuestion) tipo = TypeQuestEnum.VERDADEIRO_FALSO;

              questionMap[q.questionId] = { titulo: item.title, tipo };
            }
          });

          Object.entries(questionMap).forEach(([qId, { titulo, tipo }]) => {
            const respostas: Resposta[] = [];

            response.responses.forEach((resp: any) => {
              const answer = resp.answers[qId];
              if (answer?.textAnswers?.answers?.length) {
                answer.textAnswers.answers.forEach((a: any) => {
                  respostas.push(
                    new Resposta(
                      resp.responseId,
                      qId,
                      a.value,
                      new Date(resp.createTime)
                    )
                  );
                });
              }
            });
            questoes.push(new QuestaoModel(qId, titulo, respostas, tipo));
          });

          this.questoes = questoes;
        },
        error: (error: Error) => {
          console.error(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao buscar respostas',
            detail: error.message,
          });
        },
        complete: () => {
          this.formularioSelecionado = form;
          this.carregando_formulario = false;
        },
      });
  }

  public gerarPDF(formulario: any): void {
    this.habilitarGerarPDF = true;
    this.formularioParaPDF = formulario;
    this.questoes = [];
    this.carregando_questoes = true;
    this.formulariosService
      .buscarQuestoesDeFormularioPorIdForm(formulario.formId)
      .subscribe({
        next: (response: any) => {
          this.form.questoes = this.converterDados(response as any[]);
          console.log(this.form.questoes);
          
          this.form.titulo = formulario.Titulo;
          this.form.descricaoFormulario = formulario.Descricao;
          this.carregando_questoes = false;
        },
        error: (error: Error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao gerar PDF',
            detail: error.message,
          });
          console.error(error);
          this.carregando_questoes = false;
        },
      });
  }

  public adicionarFormulario(): void {
    this.router.navigate(['/adicionar-formulario']);
  }

  public abrirGrafico(): void {
    this.habilitarGerarGrafico = true;
  }

  public apagarFormulario(id: number): void {
    this.formulariosService.deletarFormulario(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Formulário apagado com sucesso',
        });
        this.getForms();
      },
      error: (error: Error) => {
        console.error(error);
      },
    });
  }
}
