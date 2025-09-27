import { Component } from '@angular/core';
import { QuizService } from '../../services/quiz-service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DialogModule } from 'primeng/dialog';
import { Fieldset } from 'primeng/fieldset';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { QuestaoModel } from '../../shared/models/questao.model';
import { Resposta } from '../../shared/models/resposta.model';
import { TypeQuestEnum } from '../adicionar-formulario/enums/TypeQuestEnum';
import { GerarGraficos } from '../gerar-graficos/gerar-graficos';
import { GerarPdf } from '../gerar-pdf/gerar-pdf';
import { Form, Quest } from '../listar-formularios/listar-formularios';
import { NewForm } from '../adicionar-formulario/forms/NewForm';

@Component({
  selector: 'app-listar-quiz',
  imports: [
    TableModule,
    ButtonModule,
    CommonModule,
    TooltipModule,
    ConfirmPopupModule,
    ToastModule,
    DialogModule,
    ProgressSpinner,
    Fieldset,
    GerarPdf,
    GerarGraficos,
  ],
  templateUrl: './listar-quiz.html',
  styleUrl: './listar-quiz.css',
  providers: [ConfirmationService, MessageService],
})
export class ListarQuiz {
  public listaQuizzes: any[] = [];
    public carregando_formulario: boolean = false;
    public formularioSelecionado: NewForm | any;
    public questoes: QuestaoModel[] = [];
    public habilitarGerarPDF: boolean = false;
    public habilitarGerarGrafico: boolean = false;
    public formularioParaPDF: NewForm | any;
    public carregando_questoes: boolean = false;
    public form: Form = {
      titulo: '',
      descricaoFormulario: '',
      questoes: [],
    };
    public opcoesGraficos: any[] = [];

  constructor(
    private service: QuizService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.carregarQuizzes();
  }

  private carregarQuizzes(): void {
    this.service.getAllQuizzes().subscribe({
      next: (data) => {
        this.listaQuizzes = data;
      },
      error: (err) => {
        console.error('Erro ao carregar quizzes:', err);
      },
    });
  }

  private converterDados(questoes: any[]): Quest[] {
    return questoes
      .map((item) => {
        const question = item.questionItem?.question;

        if (!question) return null;

        if (question.choiceQuestion) {
          return {
            titulo: item.title,
            tipoQuestao: 'RADIO',
            opcoes: question.choiceQuestion.options.map(
              (opt: any) => opt.value
            ),
          } as Quest;
        }

        if (question.textQuestion) {
          return {
            titulo: item.title,
            tipoQuestao: 'TEXT',
          } as Quest;
        }

        if (question.scaleQuestion) {
          return {
            titulo: item.title,
            tipoQuestao: 'ESCALA',
            escala: {
              min: question.scaleQuestion.low,
              max: question.scaleQuestion.high,
            },
          } as Quest;
        }

        return null;
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

    this.service.buscarRespostasDeFormularioPorIdForm(form.formId).subscribe({
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
    this.service
      .buscarQuestoesDeFormularioPorIdForm(formulario.formId)
      .subscribe({
        next: (response: any) => {
          this.form.questoes = this.converterDados(response.items as any[]);
          this.form.titulo = formulario.Titulo;
          this.form.descricaoFormulario = formulario.Descricao;
        },
        error: (error: Error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao gerar PDF',
            detail: error.message,
          });
          console.error(error);
        },
        complete: () => {
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

  public apagarFormulario(event: Event, id: number): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Você tem certeza que desejá apagar esse formulário?',
      header: 'Confirmar exclusão',
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Apagar',
      },
      accept: () => {
        this.service.deletarFormulario(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Formulário apagado com sucesso',
            });
            this.carregarQuizzes();
          },
          error: (error: Error) => {
            console.error(error);
          },
        });
      },
      reject: () => {},
    });
  }
}
