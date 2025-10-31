import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GerarGraficos } from '../../shared/components/gerar-graficos/gerar-graficos';
import { GerarPdf } from '../../shared/components/gerar-pdf/gerar-pdf';
import { FormularioPdfModel } from '../../shared/components/gerar-pdf/models/FormularioPdf.model';
import * as XLSX from 'xlsx';
import { Questao } from '../listar-formularios/models/Questao.model';
import { Resposta } from '../../shared/models/resposta.model';
import { QuizService } from '../../services/quiz-service';
import { Resposta_Questao } from '../listar-formularios/models/Resposta.model';
import { QuestaoModel } from '../../shared/models/questao.model';
import { QuizSelected } from '../../shared/models/ChatSelected.model';

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
  selector: 'app-listar-quiz',
  imports: [
    CommonModule,
    Button,
    Dialog,
    ProgressSpinner,
    GerarGraficos,
    GerarPdf,
  ],
  templateUrl: './listar-quiz.html',
  styleUrl: './listar-quiz.css',
})
export class ListarQuiz {
  public listaQuizzes: any[] = [];
  public quizList: any[] = [];
  public carregandoQuiz: boolean = false;
  public quizSelecionado: QuizSelected | null = null;
  public quizSelectedId: number | null = null;
  public questoes: QuestaoModel[] = [];
  public respostasPorUsuario: any[] = [];
  public visibilityOfGraphicCreate: boolean = false;
  public visibilityOfGeneratePDF: boolean = false;
  public quizPdfData: Form | null = null;
  public responsesOrQuestions: 'quest' | 'responses' = 'quest';
  public indexByRespostas: number = 0;

  constructor(private service: QuizService, private router: Router) {
    this.carregarQuizzes();
  }

  trackByQuizId(index: number, quiz: any): number {
    return quiz.idFormulario;
  }

  criarNovoQuiz(): void {
    this.router.navigate(['/adicionar-quiz']);
  }

  fillterQuiz(event: any): void {
    const value: string = event.value;
    if (value === '') {
      this.quizList = this.listaQuizzes;
      return;
    }
    this.quizList = this.listaQuizzes.filter((quiz) =>
      quiz.Titulo?.toLowerCase().includes(value.toLowerCase())
    );
  }

  selectForm(id: number): void {
    this.quizSelectedId = id;
    this.responsesOrQuestions = 'quest';
    this.getDataQuizSelecionado();
  }

  public getLinkByManualForm(): void {
    if (!this.quizSelecionado) return;
    const quiz = this.listaQuizzes.find(
      (q) => q.idFormulario === this.quizSelectedId
    );
    if (!quiz || !quiz.quizId) return;
    const urlPadrao: string = `https://docs.google.com/forms/d/${quiz.quizId}/edit`;
    window.open(urlPadrao, '_blank');
  }

  private carregarQuizzes(): void {
    this.service.getAllQuizzes().subscribe({
      next: (data: any[]) => {
        this.listaQuizzes = data
          .map((q) => ({
            idFormulario: q.idQuiz,
            Titulo: q.titulo,
            Descricao: q.descricao,
            Data_Criacao: new Date(q.data_criacao),
            Link_Url: q.link_url,
            quizId: q.quizId,
          }))
          .sort((a: any, b: any) => b.idFormulario - a.idFormulario);
        this.quizList = [...this.listaQuizzes];
        this.quizSelecionado =
          this.listaQuizzes.length > 0 ? this.listaQuizzes[0] : null;

        this.quizSelectedId =
          this.listaQuizzes.length > 0
            ? this.listaQuizzes[0].idFormulario
            : null;

        this.getDataQuizSelecionado();
      },
      error: (err) => console.error(err),
    });
  }

  private getDataQuizSelecionado(): void {
    console.log(this.quizSelecionado!.quizId);

    const quiz = this.listaQuizzes.find(
      (q) => q.idFormulario === this.quizSelectedId
    );
    this.quizSelecionado = null;
    this.carregandoQuiz = true;
    if (!quiz || !quiz.quizId) {
      this.carregandoQuiz = false;

      return;
    }
    this.service.buscarRespostasDeFormularioPorIdForm(quiz.quizId).subscribe({
      next: (res: QuizSelected) => {
        this.quizSelecionado = res;

        this.respostasPorUsuario = this.mapResponsesByUser(res);

        this.carregandoQuiz = false;
      },
      error: (err) => {
        console.error(err);
        this.carregandoQuiz = false;
      },
    });
  }

  private mapResponsesByUser(data: QuizSelected): any[] {
    const questoes = data.questoes || [];
    const respostas = data.respostas || [];

    if (!questoes.length || !respostas.length) return [];

    return respostas.map((resp: any) => {
      // resp.respostas é um array com as respostas de uma submissão
      const respostasUsuario = resp.respostas.map((r: any) => ({
        idQuestao: r.idQuestao,
        valor: r.valor,
        score: r.score,
        correta: r.correta,
      }));

      return {
        idResposta: resp.idResposta,
        dataEnviada: resp.dataEnviada,
        respostas: respostasUsuario,
        totalScore: resp.totalScore ?? 0,
      };
    });
  }

  private convertQuizData(data: any): any {
    const questoes = data.items || [];
    const responses = data.responses || [];

    const questoesFormatadas = questoes.map((q: any) => {
      const question = q.questionItem?.question;
      let tipo = 'DESCONHECIDO';
      let opcoes: string[] | undefined;

      if (question.textQuestion) tipo = 'Texto';
      if (question.choiceQuestion) {
        tipo = 'Escolha';
        opcoes = question.choiceQuestion.options.map((o: any) => o.value);
      }
      if (question.scaleQuestion) tipo = 'Escala';
      if (question.dateQuestion) tipo = 'Data';

      const grading = question.grading || {};
      const valor = grading.pointValue || 0;
      const opcaoCorreta = grading.correctAnswers?.answers?.[0]?.value || null;

      return {
        id: question.questionId,
        titulo: q.title,
        tipo,
        opcoes,
        opcaoCorreta,
        valor,
      };
    });

    const respostasFormatadas = responses.map((resp: any) => {
      const respostasQuestao: any[] = [];

      Object.values(resp.answers).forEach((answer: any) => {
        const valor = answer.textAnswers?.answers?.[0]?.value ?? null;
        respostasQuestao.push({
          idQuestao: answer.questionId,
          valor,
          score: answer.grade?.score ?? 0,
          correta: answer.grade?.correct ?? false,
        });
      });

      return {
        idResposta: resp.responseId,
        dataEnviada: new Date(resp.lastSubmittedTime),
        respostas: respostasQuestao,
        totalScore: resp.totalScore ?? 0,
      };
    });

    return { questoes: questoesFormatadas, respostas: respostasFormatadas };
  }

  public getPontuacaoByResponse(respostaUsuario: any): {
    total: number;
    max: number;
  } {
    if (!this.quizSelecionado) return { total: 0, max: 0 };

    let total = 0;
    let max = 0;

    for (const quest of this.quizSelecionado.questoes) {
      const valorQuestao = quest.valor || 0;
      max += valorQuestao;

      const resposta = respostaUsuario.respostas.find(
        (r: any) => r.idQuestao === quest.id
      );

      if (
        resposta &&
        quest.opcaoCorreta &&
        resposta.valor === quest.opcaoCorreta
      ) {
        total += valorQuestao;
      }
    }

    return { total, max };
  }

  public openDialogByGraphic(): void {
    this.visibilityOfGraphicCreate = true;
  }

  public openDialogByPdf(quiz: any): void {
    this.visibilityOfGeneratePDF = true;
    this.quizPdfData = {
      titulo: quiz.Titulo,
      descricaoFormulario: quiz.Descricao,
      questoes: quiz.questoes,
    };
  }

  public exportFormToExcel(): void {}

  public toogleResponseOrQuestions(): void {
    this.responsesOrQuestions =
      this.responsesOrQuestions === 'quest' ? 'responses' : 'quest';
  }

  public previousResponse(): void {
    if (this.indexByRespostas > 0) this.indexByRespostas--;
  }

  public nextResponse(): void {
    if (this.indexByRespostas < this.respostasPorUsuario.length - 1)
      this.indexByRespostas++;
  }

  public get getResponseSelectedByIndex(): any {
    return this.respostasPorUsuario[this.indexByRespostas];
  }

  public getTypeQuestByIdQuestion(questId: string): string {
    return (
      this.quizSelecionado?.questoes.find((q: any) => q.id === questId)?.tipo ||
      ''
    );
  }

  public getTitleQuestByIdQuestion(questId: string): string {
    return (
      this.quizSelecionado?.questoes.find((q: any) => q.id === questId)
        ?.titulo || ''
    );
  }

  public getNumberOfResponses(questId: string): number {
    if (!this.quizSelecionado?.respostas?.length) return 0;
    let count = 0;
    this.quizSelecionado.respostas.forEach((resp: any) => {
      resp.respostas.forEach((r: any) => {
        if (r.idQuestao === questId) count++;
      });
    });
    return count;
  }

  acessarQuiz(): void {
    if (!this.quizSelecionado) return;
    const quiz = this.listaQuizzes.find(
      (quiz) => quiz.idFormulario === this.quizSelectedId
    );
    if (!quiz) return;
    window.open(quiz.Link_Url, '_blank');
  }
}
