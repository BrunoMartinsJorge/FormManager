import { Component, inject, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormulariosServices } from '../../services/formularios-services';
import { Button } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Questao } from './models/Questao.model';
import { Resposta, Resposta_Questao } from './models/Resposta.model';
import { Dialog } from 'primeng/dialog';
import { GerarGraficos } from '../../shared/components/gerar-graficos/gerar-graficos';
import { GerarPdf } from '../../shared/components/gerar-pdf/gerar-pdf';
import { FormularioPdfModel } from '../../shared/components/gerar-pdf/models/FormularioPdf.model';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import saveAs from 'file-saver';

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
    Button,
    ProgressSpinner,
    Dialog,
    GerarGraficos,
    GerarPdf,
  ],
  templateUrl: './listar-formularios.html',
  styleUrl: './listar-formularios.css',
})
export class ListarFormularios {
  private forms: any[] = [];
  public formsList: any[] = [];

  public visibilityOfGraphicCreate: boolean = false;
  public visibilityOfGeneratePDF: boolean = false;

  public formSelectedId: number | null = null;
  public loadingFormSelected: boolean = false;
  public responsesOrQuestions: 'quest' | 'responses' = 'quest';
  public indexByResponses: number = 0;
  public formSelected: any;
  public responsesByUser: any;
  public formPdfData: FormularioPdfModel | null = null;

  public toogleCreateGraphics(event: any): boolean {
    this.visibilityOfGraphicCreate = !this.visibilityOfGraphicCreate;
    return this.visibilityOfGraphicCreate;
  }

  public toogleGeneratePDF(event: any): boolean {
    this.visibilityOfGeneratePDF = !this.visibilityOfGeneratePDF;
    this.convertFormByDataPdf();
    console.log(this.visibilityOfGeneratePDF);

    return this.visibilityOfGeneratePDF;
  }

  constructor(
    private formulariosService: FormulariosServices,
    private router: Router
  ) {
    this.loadAllForms();
  }

  public createNewForm(): void {
    this.router.navigate(['/adicionar-formulario']);
  }

  public toogleResponseOrQuestions(): void {
    this.responsesOrQuestions =
      this.responsesOrQuestions === 'quest' ? 'responses' : 'quest';
    if (this.responsesOrQuestions == 'responses') {
    }
  }

  public selectForm(id: number): void {
    this.formSelectedId = id;
    this.responsesOrQuestions = 'quest';
    this.getDataFormSelected();
  }

  public getQuestionByQuestionId(questId: any): any {
    return this.formSelected?.questoes.find(
      (quest: Questao) => quest.id === questId
    );
  }

  public getTypeQuestByIdQuestion(questId: any): any {
    return this.formSelected?.questoes.find(
      (quest: Questao) => quest.id === questId
    ).tipo;
  }

  public exportFormToExcel(): void {
    const formFormated = this.formSelected.questoes.map((quest: any) => ({
      titulo: quest.titulo,
      tipo: quest.tipo,
      opcoes: quest.opcoes,
      respostas: this.formSelected.respostas
        ? this.formSelected.respostas.map((resposta: any) => {
            return resposta.respostas.find(
              (resp: any) => resp.idQuestao === quest.id
            );
          })
        : null,
    }));
    const qtdRespostas = formFormated[0].respostas.length;
    const header = [
      'Questão',
      ...Array.from({ length: qtdRespostas }, (_, i) => `Resp. ${i + 1}`),
    ];
    const linhas = formFormated.map((q: any) => [
      q.titulo,
      ...q.respostas.map((r: any) => r.valor),
    ]);
    const planilha = [header, ...linhas];
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(planilha);
    ws['!cols'] = [{ wch: 40 }, ...Array(qtdRespostas).fill({ wch: 20 })];
    header.forEach((_, i) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
      if (!ws[cellRef]) return;
      ws[cellRef].s = {
        font: { bold: true },
        alignment: { horizontal: 'center', vertical: 'center' },
      };
    });

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Respostas');

    XLSX.writeFile(wb, 'respostas.xlsx');
  }

  private mapResponsesByUser(data: any): any[] {
    const questoes = data.items || [];
    const responses = data.responses || [];

    return responses.map((resp: any) => {
      const respostasUsuario: any[] = [];

      Object.values(resp.answers).forEach((answer: any) => {
        const questao = questoes.find(
          (q: any) => q.questionItem?.question?.questionId === answer.questionId
        );

        if (!questao) return;

        const titulo = questao.title;
        const idQuestao = answer.questionId;

        if (answer.textAnswers) {
          answer.textAnswers.answers.forEach((a: any) => {
            respostasUsuario.push({
              idQuestao,
              titulo,
              valor: a.value,
            });
          });
        }

        if (answer.choiceAnswers) {
          answer.choiceAnswers.answers.forEach((a: any) => {
            respostasUsuario.push({
              idQuestao,
              titulo,
              valor: a.value,
            });
          });
        }
      });

      return {
        idResposta: resp.responseId,
        dataEnviada: resp.lastSubmittedTime,
        respostas: respostasUsuario,
      };
    });
  }

  private loadAllForms(): void {
    this.formulariosService.listarFormularios().subscribe({
      next: (res) => {
        this.forms = res;
        this.formsList = res.sort(
          (a: any, b: any) => b.idFormulario - a.idFormulario
        );
        this.formSelectedId = this.forms[0].idFormulario || 0;
        this.getDataFormSelected();
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }

  public alterVisibilityOfGeneratePDF(event: any): void {}

  public openForm(): void {
    if (!this.formSelected) return;
    const form = this.forms.find(
      (form) => form.idFormulario === this.formSelectedId
    );
    if (!form) return;
    window.open(form.Link_Url, '_blank');
  }

  private convertFormByDataPdf(): void {
    const form = this.forms.find(
      (form) => form.idFormulario === this.formSelectedId
    );
    if (!form) return;
    this.formPdfData = {
      id: form.idFormulario,
      titulo: form.Titulo,
      descricao: form.Descricao,
      dataCriacao: form.Data_Criacao,
      questoes: this.formSelected?.questoes.map((questao: Questao) => ({
        id: questao.id,
        titulo: questao.titulo,
        tipo: questao.tipo,
        opcoes: questao.opcoes,
      })),
    };
  }

  private getDataFormSelected(): void {
    const form = this.forms.find(
      (form) => form.idFormulario === this.formSelectedId
    );
    this.formSelected = null;
    this.loadingFormSelected = true;
    if (!form || !form.formId) {
      this.loadingFormSelected = false;
      return;
    }
    this.formulariosService
      .buscarRespostasDeFormularioPorIdForm(form.formId)
      .subscribe({
        next: (res) => {
          this.formSelected = this.convertQuestionData(res);
          console.log(this.formSelected);

          this.responsesByUser = this.mapResponsesByUser(res);
          this.loadingFormSelected = false;
        },
        error: (error: Error) => {
          console.error(error);
          this.loadingFormSelected = false;
        },
      });
  }

  public previousResponse(): void {
    this.indexByResponses--;
  }

  public get getResponseSelectedByIndex(): any {
    return this.responsesByUser[this.indexByResponses];
  }

  public nextResponse(): void {
    this.indexByResponses++;
  }

  /**
   * 
   * @description Retorna a quantidade de respostas de uma questão
   * @param questId - id da questão
   * @returns quantidade de respostas
   */
  public getNumberOfResponses(questId: string): number {
    let count = 0;
    if (!this.formSelected || this.formSelected.respostas.length === 0)
      return count;
    this.formSelected.respostas.forEach((resp: Resposta) => {
      resp.respostas.forEach((r: Resposta_Questao) => {
        if (r.idQuestao === questId) count++;
      });
    });
    return count;
  }

  public get getQuantityOfQuestions(): number {
    return this.forms?.length || 0;
  }

  private convertQuestionData(data: any): {
    questoes: Questao[];
    respostas: Resposta[];
  } {
    const questoes: any[] = data.items || [];
    const responses = data.responses || [];

    const questoesFormatadas: Questao[] = questoes
      .filter((quest) => quest.questionItem && quest.questionItem.question)
      .map((quest) => {
        const q = quest.questionItem.question;
        let tipo = 'DESCONHECIDO';
        let opcoes: string[] | undefined;

        if (q.textQuestion) tipo = 'Texto';
        if (q.choiceQuestion) {
          tipo = 'Escolha';
          opcoes = q.choiceQuestion.options.map((o: any) => o.value);
        }
        if (q.scaleQuestion) tipo = 'Escala';
        if (q.dateQuestion) tipo = 'Data';

        return {
          id: q.questionId,
          titulo: quest.title,
          tipo,
          opcoes,
        };
      });

    const respostasFormatadas: Resposta[] = responses.map((resp: any) => {
      const respostasQuestao: Resposta_Questao[] = [];

      Object.values(resp.answers || {}).forEach((answer: any) => {
        if (answer.textAnswers) {
          answer.textAnswers.answers.forEach((a: any) => {
            respostasQuestao.push({
              idQuestao: answer.questionId,
              valor: a.value,
            });
          });
        }

        if (answer.choiceAnswers) {
          answer.choiceAnswers.answers.forEach((a: any) => {
            respostasQuestao.push({
              idQuestao: answer.questionId,
              valor: a.value,
            });
          });
        }
      });

      return {
        idResposta: resp.responseId,
        dataEnviada: new Date(resp.lastSubmittedTime),
        respostas: respostasQuestao,
      };
    });

    return {
      questoes: questoesFormatadas,
      respostas: respostasFormatadas,
    };
  }

  public fillterForm(event: any): void {
    const value: string = event.value;
    if (value === '') {
      this.formsList = this.forms;
      return;
    }
    this.formsList = this.forms.filter((form) => {
      if (form.Titulo === undefined) return false;
      return form.Titulo.toLowerCase().includes(value.toLowerCase());
    });
  }

  public get getFormSelected(): any | null {
    return this.forms.find((form) => form.idFormulario === this.formSelectedId);
  }
}
