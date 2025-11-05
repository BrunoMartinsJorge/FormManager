import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { GerarGraficos } from '../../shared/components/gerar-graficos/gerar-graficos';
import { GerarPdf } from '../../shared/components/gerar-pdf/gerar-pdf';
import { FormularioPdfModel } from '../../shared/components/gerar-pdf/models/FormularioPdf.model';
import * as XLSX from 'xlsx';
import { QuizService } from '../../services/quiz-service';
import { QuestaoModel } from '../../shared/models/questao.model';
import { QuizSelected } from '../../shared/models/QuizSelected.model';
import { InplaceModule } from 'primeng/inplace';
import { QuizDto } from './models/QuizDto';
import { RespostasPorUsuario } from '../listar-formularios/models/RespostasFormDto';

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
    InplaceModule,
  ],
  templateUrl: './listar-quiz.html',
  styleUrl: './listar-quiz.css',
})
export class ListarQuiz {
  public listaQuizzes: QuizDto[] = [];
  public listarQuizzes: QuizDto[] = [];
  public carregandoQuiz: boolean = false;
  public quizSelecionado: QuizSelected | null = null;
  public quizSelecionadoPorId: number | null = null;
  public questoes: QuestaoModel[] = [];
  public respostasPorUsuario: RespostasPorUsuario[] = [];
  public visibilidadeDeCriarGraficos: boolean = false;
  public visibilidadeDeGerarPDF: boolean = false;
  public quizPdfData: Form | null = null;
  public respostasOuQuestoes: 'quest' | 'responses' = 'quest';
  public indexByRespostas: number = 0;

  constructor(
    private service: QuizService,
    private router: Router,
    private toast: MessageService
  ) {
    this.carregarQuizzes();
  }

  /**
   *
   * @param index - Indice da questão
   * @param quiz - Objeto da questão
   * @description Retorna o indice da questão
   * @returns - Indice da questão
   */
  public trackByQuizId(index: number, quiz: any): number {
    return quiz.idQuiz;
  }

  /**
   *
   * @description Função para criar um novo quiz
   */
  public criarNovoQuiz(): void {
    this.router.navigate(['/adicionar-quiz']);
  }

  /**
   *
   * @param event - Evento do filtro
   * @description Função para filtrar os quizzes
   * @returns - Objeto da questão
   */
  public filtarQuiz(event: any): void {
    const value: string = event.value;
    if (value === '') {
      this.listarQuizzes = this.listaQuizzes;
      return;
    }
    this.listarQuizzes = this.listaQuizzes.filter((quiz) =>
      quiz.titulo?.toLowerCase().includes(value.toLowerCase())
    );
  }

  /**
   *
   * @param id - ID do quiz
   * @description Função para selecionar um quiz
   */
  public selecionarQuiz(id: number): void {
    this.quizSelecionadoPorId = id;
    this.respostasOuQuestoes = 'quest';
    this.getDadosQuizSelecionado();
  }

  /**
   *
   * @description Função para abrir o link do manual do quiz
   */
  public getLinkManualQuiz(): void {
    if (!this.quizSelecionado) return;
    const quiz = this.listaQuizzes.find(
      (q) => q.idQuiz === this.quizSelecionadoPorId
    );
    if (!quiz || !quiz.quizId) return;
    const urlPadrao: string = `https://docs.google.com/forms/d/${quiz.quizId}/edit`;
    window.open(urlPadrao, '_blank');
  }

  /**
   *
   * @description Função para carregar os quizzes
   */
  private carregarQuizzes(): void {
    this.service.getAllQuizzes().subscribe({
      next: (data: any[]) => {
        this.listaQuizzes = data.sort((a: any, b: any) => b.idQuiz - a.idQuiz);
        this.listarQuizzes = [...this.listaQuizzes];
        this.quizSelecionadoPorId =
          this.listaQuizzes.length > 0 ? this.listaQuizzes[0].idQuiz : null;
        this.getDadosQuizSelecionado();
      },
      error: (err) => {
        console.error(err);
        this.toast.add({
          severity: 'error',
          summary: 'Erro ao carregar os quizzes',
          detail: err.message,
          life: 3000
        })
      },
    });
  }

  /**
   *
   * @description Função para carregar os quizzes
   */
  private getDadosQuizSelecionado(): void {
    const quiz = this.listaQuizzes.find(
      (q) => q.idQuiz === this.quizSelecionadoPorId
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
        this.quizSelecionado!.ativo = res.ativo;
        this.respostasPorUsuario = res.respostasPorUsuario;
        this.carregandoQuiz = false;
        this.quizSelecionado.titulo = quiz.titulo;
        this.quizSelecionado.dataCriacao = quiz.dataCriacao;
        this.quizSelecionado.quizId = quiz.quizId;
        this.quizSelecionado.descricao = quiz.descricao;
      },
      error: (err) => {
        console.error(err);
        this.carregandoQuiz = false;
        this.toast.add({
          severity: 'error',
          summary: 'Erro ao carregar os quiz',
          detail: err.message,
          life: 3000
        })
      },
    });
  }
  
  /**
   *
   * @param respostaUsuario - Resposta do usuário
   * @description Função para calcular a pontuação do usuário
   */
  public getPontuacaoPorResposta(respostaUsuario: any): {
    total: number;
    max: number;
  } {
    if (!this.quizSelecionado) return { total: 0, max: 0 };

    let total = 0;
    let max = 0;

    for (const quest of this.quizSelecionado.questoesFormatadas.questoes) {
      const valorQuestao = quest.pontuacao || 0;
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

  /**
   *
   * @description Função para abrir o dialog de criação de gráficos
   */
  public abrirDialogDeGrafico(): void {
    this.visibilidadeDeCriarGraficos = true;
  }

  /**
   *
   * @param quiz - Quiz
   * @description Função para abrir o dialog de criação de gráficos
   */
  public abrirDialogDePDF(quiz: any): void {
    this.visibilidadeDeGerarPDF = true;
    this.quizPdfData = {
      titulo: quiz.Titulo,
      descricaoFormulario: quiz.Descricao,
      questoes: quiz.questoes,
    };
  }

  /**
   *
   * @description Função para exportar o quiz para excel
   */
  public exportarQuizParaExcel(): void {}

  /**
   *
   * @description Função para mudar entre perguntas e respostas
   */
  public mudarRespostasOuQuestoes(): void {
    this.respostasOuQuestoes =
      this.respostasOuQuestoes === 'quest' ? 'responses' : 'quest';
  }

  /**
   *
   * @description Função para voltar uma resposta
   */
  public voltarResposta(): void {
    if (this.indexByRespostas > 0) this.indexByRespostas--;
  }

  /**
   *
   * @description Função para avançar uma resposta
   */
  public avancarResposta(): void {
    if (this.indexByRespostas < this.respostasPorUsuario.length - 1)
      this.indexByRespostas++;
  }

  /**
   *
   * @description Função para selecionar uma resposta
   * @returns - Resposta selecionada
   */
  public get getRespostaSelecionadaPorIndex(): any {
    return this.respostasPorUsuario[this.indexByRespostas];
  }

  /**
   *
   * @param questId - ID da questão
   * @description Função para retornar o tipo da questão
   * @returns - Tipo da questão
   */
  public getTipoQuestaoPorIdQuestao(questId: string): string {
    return (
      this.quizSelecionado?.questoesFormatadas.questoes.find(
        (q: any) => q.id === questId
      )?.tipo || ''
    );
  }

  /**
   *
   * @param questId - ID da questão
   * @description Função para retornar o título da questão
   * @returns - Título da questão
   */
  public getTituloQuestaoPorId(questId: string): string {
    return (
      this.quizSelecionado?.questoesFormatadas.questoes.find(
        (q: any) => q.id === questId
      )?.titulo || ''
    );
  }

  /**
   *
   * @param questId - ID da questão
   * @description Função para retornar a quantidade de respostas de uma questão
   * @returns - Quantidade de respostas
   */
  public getQuantidadeRespostas(questId: string): number {
    if (!this.quizSelecionado?.questoesFormatadas.respostas?.length) return 0;
    let count = 0;
    this.quizSelecionado.questoesFormatadas.respostas.forEach((resp: any) => {
      resp.respostas.forEach((r: any) => {
        if (r.idQuestao === questId) count++;
      });
    });
    return count;
  }

  /**
   *
   * @description Função para acessar o quiz
   */
  public acessarQuiz(): void {
    if (!this.quizSelecionado) return;
    const quiz = this.listaQuizzes.find(
      (quiz) => quiz.idQuiz === this.quizSelecionadoPorId
    );
    if (!quiz) return;
    window.open(quiz.linkUrl, '_blank');
  }
}