import { ChangeDetectorRef, Component, inject, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormulariosServices } from '../../services/formularios-services';
import { Button } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Questao } from './models/Questao.model';
import { Resposta, Resposta_Questao } from './models/Resposta.model';
import { Dialog } from 'primeng/dialog';
import { GerarGraficos } from '../../shared/components/gerar-graficos/gerar-graficos';
import { GerarPdf } from '../../shared/components/gerar-pdf/gerar-pdf';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import saveAs from 'file-saver';
import {
  QuestaoUnica,
  RespostasFormDto,
  RespostaUnica,
} from './models/RespostasFormDto';
import { Formulario } from './models/Formulario';
import {
  getTypeQuestLabel,
  TypeQuestEnum,
} from '../adicionar-formulario/enums/TypeQuestEnum';

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
  public listaFormularios: Formulario[] = [];

  public visibilidadeDeCriarGraficos: boolean = false;
  public visibilidadeDeGerarPDF: boolean = false;

  public formularioSelecionadoId: number | null = null;
  public carregandoFormularioSelecionado: boolean = false;
  public problemaAoCarregarFormulario: boolean = false;
  public respostasOuPerguntas: 'quest' | 'responses' = 'quest';
  public indexPorResposta: number = 0;
  public formularioSelecionado!: RespostasFormDto | null;
  public responsesByUser: any;
  public formPdfData: any = null;

  /**
   *
   * @description Função para criar os gráficos
   */
  public criarGraficos(): void {
    this.visibilidadeDeCriarGraficos = !this.visibilidadeDeCriarGraficos;
  }

  /**
   *
   * @description Função para criar o PDF
   */
  public criarPDF(): void {
    this.visibilidadeDeGerarPDF = !this.visibilidadeDeGerarPDF;
    this.converterFormularioParaDadosDePDF();
  }

  constructor(
    private formulariosService: FormulariosServices,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {
    this.carregarTodosFormularios();
  }

  /**
   *
   * @description Função para criar um novo formulário
   */
  public criarNovoFormulario(): void {
    this.router.navigate(['/adicionar-formulario']);
  }

  /**
   *
   * @description Função para mudar entre perguntas e respostas
   */
  public mudarRespostasOuPerguntas(): void {
    this.respostasOuPerguntas =
      this.respostasOuPerguntas === 'quest' ? 'responses' : 'quest';
    if (this.respostasOuPerguntas == 'responses') {
    }
  }

  /**
   *
   * @param id - ID do formulário
   * @description Função para selecionar um formulário
   */
  public selecionarFormularioPorId(id: number): void {
    this.formularioSelecionadoId = id;
    this.respostasOuPerguntas = 'quest';
    this.getDadosFormularioSelecionado();
  }

  /**
   *
   * @param questId - ID da pergunta
   * @description Função para selecionar uma pergunta
   * @returns - Pergunta
   */
  public getPerguntasPorIdPergunta(questId: any): any {
    return this.formularioSelecionado?.questoesFormatadas.questoes.find(
      (quest: Questao) => quest.id === questId
    );
  }

  /**
   *
   * @param tipo - Tipo da pergunta
   * @description Função para procurar a descrição do tipo da pergunta com base no tipo em ENUM
   * @returns - Descrição do tipo da pergunta da questão
   */
  public procurarDescricaoPorTipoPergunta(tipo: any): string {
    if (!tipo) return 'DESCONHECIDO';
    return getTypeQuestLabel(tipo as TypeQuestEnum);
  }

  public procurarDescricaoPorIdPergunta(idPergunta: string): string {
    let pergunta: Questao | undefined =
      this.formularioSelecionado?.questoesFormatadas.questoes.find(
        (p: Questao) => p.id === idPergunta
      );
    if (!pergunta) return 'DESCONHECIDO';
    return getTypeQuestLabel(pergunta.tipo as TypeQuestEnum);
  }

  /**
   *
   * @param questId - ID da pergunta
   * @description Função para selecionar o tipo da pergunta
   * @returns - Tipo da pergunta
   */
  public getTipoPerguntaPorIdPergunta(questId: any): any {
    if (!this.formularioSelecionado) return '';
    const questoes = this.formularioSelecionado.questoesFormatadas.questoes;
    if (!questoes) return '';
    const questao = questoes.find(
      (quest: QuestaoUnica) => quest.id === questId
    );
    if (!questao) return '';
    return '';
  }

  /**
   *
   * @description Função para obter o label do botão
   */
  public get buscarLabelBotao(): string {
    if (this.respostasOuPerguntas == 'responses') {
      return 'Ver Questões';
    }
    const respostas = this.formularioSelecionado?.respostasPorUsuario;
    if (!respostas || respostas.length === 0) {
      return 'Nenhuma Resposta';
    }
    return 'Ver Respostas';
  }

  /**
   *
   * @description Função para exportar o formulário para excel
   */
  public exportarFormularioParaExcel(): void {
    if (
      !this.formularioSelecionado ||
      !this.formularioSelecionado.questoesFormatadas ||
      !this.formularioSelecionado.questoesFormatadas.respostas
    )
      return;
    const formFormated =
      this.formularioSelecionado.questoesFormatadas.questoes.map(
        (quest: any) => ({
          titulo: quest.titulo,
          tipo: quest.tipo,
          opcoes: quest.opcoes,
          respostas:
            this.formularioSelecionado?.questoesFormatadas.respostas.map(
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

  /**
   *
   * @description Função para carregar todos os formulários
   */
  private carregarTodosFormularios(): void {
    this.formulariosService.listarFormularios().subscribe({
      next: (res) => {
        this.forms = res;
        this.listaFormularios =
          res && res.length > 0
            ? res.sort((a: any, b: any) => b.idFormulario - a.idFormulario)
            : [];
        if (this.listaFormularios && this.listaFormularios.length > 0) {
          this.formularioSelecionadoId = this.forms[0].idFormulario || 0;
          this.getDadosFormularioSelecionado();
        }
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }

  /**
   *
   * @description Função para abrir o formulário
   */
  public abrirFormulario(): void {
    if (!this.formularioSelecionado) return;
    const form: Formulario = this.forms.find(
      (form) => form.idFormulario === this.formularioSelecionadoId
    ) as Formulario;
    if (!form) return;
    window.open(form.linkUrl, '_blank');
  }

  /**
   *
   * @description Função para converter o formulário para dados de PDF
   */
  private converterFormularioParaDadosDePDF(): void {
    const form: Formulario = this.forms.find(
      (form) => form.idFormulario === this.formularioSelecionadoId
    ) as Formulario;
    if (!form) return;

    const questoesConvertidas: any[] =
      this.formularioSelecionado?.questoesFormatadas.questoes.map(
        (questao: QuestaoUnica) => ({
          id: questao.id,
          titulo: questao.titulo,
          tipo: questao.tipo,
          opcoes: questao.opcoes?.map((opcao) => opcao),
          escala: {
            
          },
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

  /**
   *
   * @description Função para carregar os dados do formulário selecionado
   */
  private getDadosFormularioSelecionado(): void {
    const form = this.forms.find(
      (form) => form.idFormulario === this.formularioSelecionadoId
    );
    this.formularioSelecionado = null;
    this.carregandoFormularioSelecionado = true;
    this.cdRef.detectChanges();

    if (!form || !form.formId) {
      this.carregandoFormularioSelecionado = false;
      return;
    }

    this.formulariosService
      .buscarRespostasDeFormularioPorIdForm(form.formId)
      .subscribe({
        next: (res) => {
          this.formularioSelecionado = res;
          this.formularioSelecionado!.dataCriacao = form.dataCriacao;
          this.formularioSelecionado!.formId = form.formId;
          this.formularioSelecionado!.idFormulario = form.idFormulario;
          this.formularioSelecionado!.titulo = form.titulo;
          this.responsesByUser = res.respostasPorUsuario;
          this.carregandoFormularioSelecionado = false;
          this.problemaAoCarregarFormulario = false;
        },
        error: (error: Error) => {
          console.error(error);
          this.carregandoFormularioSelecionado = false;
          this.problemaAoCarregarFormulario = true;
        },
      });
  }

  /**
   *
   * @description Função para retornar as perguntas do formulário selecionado
   */
  public get getPerguntas(): any[] {
    if (!this.formularioSelecionado) return [];
    if (!this.formularioSelecionado.questoesFormatadas) return [];
    return this.formularioSelecionado.questoesFormatadas.questoes || [];
  }

  public get getRespostas(): any[] {
    if (!this.formularioSelecionado) return [];
    if (!this.formularioSelecionado.questoesFormatadas) return [];
    
    return (
      this.formularioSelecionado.questoesFormatadas.respostas.map(
        (resp) => resp.respostas
      ) || []
    );
  }

  public get getDadosParaGraficos(): any {
    const perguntas = this.getPerguntas;
    const respostas = this.getRespostas || [];
    return {
      perguntas,
      respostas,
    };
  }

  /**
   *
   * @description Função para retornar as respostas do formulário selecionado
   */
  public voltarResposta(): void {
    this.indexPorResposta--;
  }

  /**
   *
   * @description Função para retornar as respostas do formulário selecionado
   */
  public get getRespostaSelecionadaPorIndex(): any {
    if (!this.formularioSelecionado) return [];
    const questoes = this.formularioSelecionado.questoesFormatadas.questoes;
    const ordemQuestoes = questoes.map((questao: QuestaoUnica) => questao.id);
    const respostas = this.responsesByUser[this.indexPorResposta];
    respostas.respostas.sort((a: any, b: any) => {
      return (
        ordemQuestoes.indexOf(a.idQuestao) - ordemQuestoes.indexOf(b.idQuestao)
      );
    });
    return respostas;
  }

  /**
   *
   * @description Função para retornar as respostas do formulário selecionado
   */
  public avancarResposta(): void {
    this.indexPorResposta++;
  }

  /**
   *
   * @description Retorna a quantidade de respostas de uma questão
   * @param questId - id da questão
   * @returns quantidade de respostas
   */
  public getQuantidadeRespostas(questId: string): number {
    let count = 0;
    if (
      !this.formularioSelecionado ||
      this.formularioSelecionado.questoesFormatadas.respostas.length === 0
    )
      return count;
    this.formularioSelecionado.questoesFormatadas.respostas.forEach(
      (resp: RespostaUnica) => {
        resp.respostas.forEach((r: Resposta_Questao) => {
          if (r.idQuestao === questId) count++;
        });
      }
    );
    return count;
  }

  /**
   *
   * @param event - Evento do filtro
   * @description Função para filtrar os formulários
   */
  public filtrarFormularios(event: any): void {
    const value: string = event.value;
    if (value === '') {
      this.listaFormularios = this.forms;
      return;
    }
    this.listaFormularios = this.forms.filter((form: Formulario) => {
      if (form.titulo === undefined) return false;
      return form.titulo.toLowerCase().includes(value.toLowerCase());
    });
  }

  /**
   *
   * @description Função para retornar o formulário selecionado
   * @return - Formulário selecionado
   */
  public get getFormularioSelecionado(): any | null {
    return this.forms.find(
      (form) => form.idFormulario === this.formularioSelecionadoId
    );
  }
}
