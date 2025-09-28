import { Component, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormulariosServices } from '../../services/formularios-services';
import { Button } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Questao } from './models/Questao.model';
import { Resposta, Resposta_Questao } from './models/Resposta.model';

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
  imports: [CommonModule, Button, ProgressSpinner],
  templateUrl: './listar-formularios.html',
  styleUrl: './listar-formularios.css',
})
export class ListarFormularios {
  private forms: any[] = [];
  public formsList: any[] = [];
  public visibilityOfCreateNewFormDialog: boolean = false;
  public formSelectedId: number | null = null;
  public loadingFormSelected: boolean = false;
  public responsesOrQuestions: 'quest' | 'responses' = 'quest';
  public indexByResponses: number = 0;

  public toogleCreateNewFormDialog(): void {
    this.visibilityOfCreateNewFormDialog =
      !this.visibilityOfCreateNewFormDialog;
  }

  constructor(private formulariosService: FormulariosServices) {
    this.loadAllForms();
  }

  public createNewForm(): void {}

  public toogleResponseOrQuestions(): void {
    this.responsesOrQuestions =
      this.responsesOrQuestions === 'quest' ? 'responses' : 'quest';
    if (this.responsesOrQuestions == 'responses') {
      console.log(this.formSelected.respostas);
    }
  }

  public selecForm(id: number): void {
    this.formSelectedId = id;
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
        this.formsList = res;
        this.formSelectedId = this.forms[0].idFormulario || 0;
        this.getDataFormSelected();
      },
      error: (error: Error) => {
        console.error(error);
      },
    });
  }

  public formSelected: any;
  public responsesByUser: any;
  private getDataFormSelected(): void {
    const form = this.forms.find(
      (form) => form.idFormulario === this.formSelectedId
    );
    this.formSelected = null;
    this.loadingFormSelected = true;
    if (!form || !form.formId) return;
    this.formulariosService
      .buscarRespostasDeFormularioPorIdForm(form.formId)
      .subscribe({
        next: (res) => {
          this.formSelected = this.convertQuestionData(res);
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
    console.log(this.indexByResponses);
  }

  public get getResponseSelectedByIndex(): any {
    return this.responsesByUser[this.indexByResponses];
  }

  public nextResponse(): void {
    this.indexByResponses++;
    console.log(this.indexByResponses);
  }

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

    const questoesFormatadas: Questao[] = questoes.map((quest) => {
      const q = quest.questionItem?.question;
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

      Object.values(resp.answers).forEach((answer: any) => {
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
