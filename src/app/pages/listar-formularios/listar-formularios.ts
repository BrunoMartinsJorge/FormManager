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
import {
  FormularioPdfModel,
  QuestoesPdfModel,
} from '../../shared/components/gerar-pdf/models/FormularioPdf.model';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import saveAs from 'file-saver';
import {
  QuestaoUnica,
  RespostasFormDto,
  RespostaUnica,
} from './models/RespostasFormDto';
import { Formulario } from './models/Formulario';

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
  private forms: Formulario[] = [];
  public formsList: Formulario[] = [];

  public visibilityOfGraphicCreate: boolean = false;
  public visibilityOfGeneratePDF: boolean = false;

  public formSelectedId: number | null = null;
  public loadingFormSelected: boolean = false;
  public responsesOrQuestions: 'quest' | 'responses' = 'quest';
  public indexByResponses: number = 0;
  public formSelected!: RespostasFormDto | null;
  public responsesByUser: any;
  public formPdfData: FormularioPdfModel | null = null;

  public toogleCreateGraphics(event: any): boolean {
    this.visibilityOfGraphicCreate = !this.visibilityOfGraphicCreate;
    return this.visibilityOfGraphicCreate;
  }

  public toogleGeneratePDF(event: any): boolean {
    this.visibilityOfGeneratePDF = !this.visibilityOfGeneratePDF;
    this.convertFormByDataPdf();
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
    return this.formSelected?.questoesFormatadas.questoes.find(
      (quest: Questao) => quest.id === questId
    );
  }

  public getTypeQuestByIdQuestion(questId: any): any {
    if (!this.formSelected) return '';
    const questoes = this.formSelected.questoesFormatadas.questoes;
    if (!questoes) return '';
    const questao = questoes.find(
      (quest: QuestaoUnica) => quest.id === questId
    );
    if (!questao) return '';
    return questao.tipo;
  }

  public get buscarLabelBotao(): string {
    if (this.responsesOrQuestions == 'responses') {
      return 'Ver Questões';
    }

    const respostas = this.formSelected?.respostasPorUsuario;

    if (!respostas || respostas.length === 0) {
      return 'Nenhuma Resposta';
    }

    return 'Ver Respostas';
  }

  public exportFormToExcel(): void {
    if (
      !this.formSelected ||
      !this.formSelected.questoesFormatadas ||
      !this.formSelected.questoesFormatadas.respostas
    )
      return;
    const formFormated = this.formSelected.questoesFormatadas.questoes.map(
      (quest: any) => ({
        titulo: quest.titulo,
        tipo: quest.tipo,
        opcoes: quest.opcoes,
        respostas: this.formSelected?.questoesFormatadas.respostas.map(
          (resp: any) => ({
            idQuestao: resp.idQuestao,
            valor: resp.respostas.find((r: any) => r.idQuestao === quest.id)
              ?.valor,
          })
        ),
      })
    );
    if (!formFormated[0].respostas) return;
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
    const form: Formulario = this.forms.find(
      (form) => form.idFormulario === this.formSelectedId
    ) as Formulario;
    if (!form) return;
    window.open(form.linkUrl, '_blank');
  }

  private convertFormByDataPdf(): void {
    const form: Formulario = this.forms.find(
      (form) => form.idFormulario === this.formSelectedId
    ) as Formulario;
    if (!form) return;

    const questoesConvertidas: QuestoesPdfModel[] =
      this.formSelected?.questoesFormatadas.questoes.map(
        (questao: QuestaoUnica) => ({
          id: Number(questao.id),
          titulo: questao.titulo,
          tipo: questao.tipo,
          opcoes: questao.opcoes?.map((opcao) => opcao),
          escala: undefined,
        })
      ) || [];

    this.formPdfData = {
      id: form.idFormulario,
      titulo: form.titulo,
      descricao: form.descricao,
      dataCriacao: form.dataCriacao,
      questoes: questoesConvertidas,
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
          this.formSelected = res;
          this.formSelected!.dataCriacao = form.dataCriacao;
          this.formSelected!.formId = form.formId;
          this.formSelected!.idFormulario = form.idFormulario;
          this.formSelected!.titulo = form.titulo;
          console.log(this.formSelected);
          
          this.responsesByUser = res.respostasPorUsuario;
          this.loadingFormSelected = false;
        },
        error: (error: Error) => {
          console.error(error);
          this.loadingFormSelected = false;
        },
      });
  }

  public get getQuestoes(): any[] {
    return this.formSelected?.questoesFormatadas?.questoes || [];
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
    if (
      !this.formSelected ||
      this.formSelected.questoesFormatadas.respostas.length === 0
    )
      return count;
    this.formSelected.questoesFormatadas.respostas.forEach(
      (resp: RespostaUnica) => {
        resp.respostas.forEach((r: Resposta_Questao) => {
          if (r.idQuestao === questId) count++;
        });
      }
    );
    return count;
  }

  public get getQuantityOfQuestions(): number {
    return this.forms?.length || 0;
  }

  public fillterForm(event: any): void {
    const value: string = event.value;
    if (value === '') {
      this.formsList = this.forms;
      return;
    }
    this.formsList = this.forms.filter((form: Formulario) => {
      if (form.titulo === undefined) return false;
      return form.titulo.toLowerCase().includes(value.toLowerCase());
    });
  }

  public get getFormSelected(): any | null {
    return this.forms.find((form) => form.idFormulario === this.formSelectedId);
  }
}
