import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { QuestaoModel } from '../../shared/models/questao.model';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { SelectButton } from 'primeng/selectbutton';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Fieldset } from 'primeng/fieldset';
import { RadioButton } from 'primeng/radiobutton';
import { ChartModule } from 'primeng/chart';
import { TypeQuestEnum } from '../adicionar-formulario/enums/TypeQuestEnum';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { GraficoModel } from '../../shared/models/Grafico.model';
import { Tooltip } from 'primeng/tooltip';
import { InputGroup } from 'primeng/inputgroup';
import { PanelModule } from 'primeng/panel';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { ConfirmationService } from 'primeng/api';
import { InputText } from "primeng/inputtext";

@Component({
  selector: 'app-gerar-graficos',
  imports: [
    Button,
    CommonModule,
    SelectButton,
    FormsModule,
    Fieldset,
    ReactiveFormsModule,
    RadioButton,
    ChartModule,
    Tooltip,
    PanelModule,
    Textarea,
    Select,
    ConfirmPopup,
    InputText
],
  templateUrl: './gerar-graficos.html',
  styleUrl: './gerar-graficos.css',
})
export class GerarGraficos implements OnChanges {
  @Input() questoesRespondidas: QuestaoModel[] = [];
  @ViewChild('pdfGraph', { static: false }) pdfGraph!: ElementRef;
  public gerandoPDF: boolean = false;
  public opcoesDoGrafico: string[] = [];
  public questoesFormatadas: any[] = [];
  public readonly listaOpcoesGraficos: any[] = [
    { label: 'Pizza', value: 'pie' },
    { label: 'Rosca', value: 'doughnut' },
    { label: 'Linha', value: 'line' },
    { label: 'Barra', value: 'bar' },
    { label: 'Area Polar', value: 'polarArea' },
  ];
  public graficoEscolhido:
    | 'bar'
    | 'line'
    | 'scatter'
    | 'bubble'
    | 'pie'
    | 'doughnut'
    | 'polarArea'
    | 'radar'
    | undefined = this.listaOpcoesGraficos[0].value;
  public graficos: GraficoModel[] = [];
  questaoSelecionada: QuestaoModel = new QuestaoModel(
    '',
    '',
    [],
    TypeQuestEnum.UNICA
  );

  constructor(private confirmationService: ConfirmationService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.questoesRespondidas) {
      this.questoesFormatadas = this.convertQuestsAndResponses();
      this.graficos = [];
      this.cleanData();
    }
  }

  public removeGraph(event: Event, index: number): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Você tem certeza que deseja apagar esse gráfico?',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Apagar',
        severity: 'danger',
      },
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.graficos.splice(index, 1);
      },
      reject: () => {},
    });
  }

  public selectGraph(event: any): void {
    this.graficoEscolhido = event.value;
  }

  private convertQuestsAndResponses(): any {
    let quests: any[] = [
      {
        title: '',
        responses: [],
      },
    ];
    this.questoesRespondidas.forEach((questao) => {
      quests[0].title = questao.titulo;
      quests[0].responses.push(questao.resposta.map((resp) => resp.valor));
    });
    return quests;
  }

  /**
   * @description Função para converter a resposta do backend para um objeto com os valores validos
   * @param respostas - Respostas da pergunta selecionada
   */
  public convertResponseToValuesValid(respostas: any[]): string[] {
    return respostas.map((resp) => resp.valor);
  }

  public generateGraph(): void {
    if (!this.graficoEscolhido && !this.questaoSelecionada) return;
    const questao_selecionada = this.questoesRespondidas.filter(
      (questao) => questao.titulo === this.questaoSelecionada.titulo
    );
    if (questao_selecionada.length < 1) return;
    const respostas_formatadas = this.convertResponseToValuesValid(
      questao_selecionada[0].resposta
    );
    if (respostas_formatadas.length < 1) return;
    this.createGraph(
      respostas_formatadas,
      this.questaoSelecionada.titulo,
      this.questaoSelecionada.tipo
    );
  }

  /**
   *
   * @param respostas - Respostas da pergunta já formatadas
   * @param questao - Titulo da questão
   * @param tipo - Tipo da questão
   * @description Função responsavel por criar os gráficos
   */
  private createGraph(
    respostas: any[],
    questao: string,
    tipo: TypeQuestEnum
  ): void {
    let labels: string[] = [];
    let data: number[] = [];

    switch (tipo) {
      case TypeQuestEnum.TEXTO:
      case TypeQuestEnum.PARAGRAFO:
        const normalizadas = respostas.map((r) => this.convertResposes(r));
        const contagemTexto = this.count(normalizadas);
        labels = Object.keys(contagemTexto);
        data = Object.values(contagemTexto);
        break;

      case TypeQuestEnum.NUMERO:
        const numeros = respostas
          .map((r) => Number(r))
          .filter((n) => !isNaN(n));
        const contagemNumero = this.count(numeros.map((n) => n.toString()));
        labels = Object.keys(contagemNumero);
        data = Object.values(contagemNumero);
        break;

      case TypeQuestEnum.UNICA:
        const contagemUnica = this.count(respostas);
        labels = Object.keys(contagemUnica);
        data = Object.values(contagemUnica);
        break;

      case TypeQuestEnum.MULTIPLA:
        const todasOpcoes = respostas.flatMap((r) => r.split(','));
        const normalizadasMulti = todasOpcoes.map((r) =>
          this.convertResposes(r)
        );
        const contagemMulti = this.count(normalizadasMulti);
        labels = Object.keys(contagemMulti);
        data = Object.values(contagemMulti);
        break;

      case TypeQuestEnum.DATA:
        const datas = respostas.map((r) => new Date(r));
        const datasFormatadas = datas.map((d) => d.toISOString().split('T')[0]);
        const contagemDatas = this.count(datasFormatadas);
        labels = Object.keys(contagemDatas);
        data = Object.values(contagemDatas);
        break;

      case TypeQuestEnum.ESCALA:
        const escala = respostas.map((r) => Number(r)).filter((n) => !isNaN(n));
        const contagemEscala = this.count(escala.map((n) => n.toString()));
        labels = Object.keys(contagemEscala);
        data = Object.values(contagemEscala);
        break;

      case TypeQuestEnum.VERDADEIRO_FALSO:
        const bools = respostas.map((r) =>
          r.toLowerCase() === 'true' || r.toLowerCase() === 'sim'
            ? 'Verdadeiro'
            : 'Falso'
        );
        const contagemBool = this.count(bools);
        labels = Object.keys(contagemBool);
        data = Object.values(contagemBool);
        break;
    }

    let option: any;

    switch (this.graficoEscolhido) {
      case 'bar':
      case 'line':
        option = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
            title: {
              display: false,
            },
          },
          scales: {
            x: {
              title: { display: true, text: 'Opções' },
              ticks: { font: { weight: 500 } },
              grid: { drawBorder: false },
            },
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Quantidade' },
              grid: { drawBorder: false },
            },
          },
        };
        break;

      case 'pie':
      case 'doughnut':
        option = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
            },
            title: {
              display: true,
            },
          },
        };
        break;

      case 'radar':
        option = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
            title: {
              display: true,
            },
          },
          scales: {
            r: {
              beginAtZero: true,
              angleLines: { display: true },
              ticks: { stepSize: 1 },
            },
          },
        };
        break;

      default:
        option = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
            title: {
              display: true,
            },
          },
        };
        break;
    }

    let newGraph: GraficoModel = {
      labels,
      titulo: questao,
      datasets: [
        {
          label: questao,
          data,
          backgroundColor: [
            '#795548',
            '#2196F3',
            '#4CAF50',
            '#FFC107',
            '#E91E63',
            '#9C27B0',
            '#FF5722',
            '#00BCD4',
            '#8BC34A',
            '#FFEB3B',
            '#F44336',
            '#673AB7',
            '#3F51B5',
            '#009688',
            '#CDDC39',
            '#FF9800',
            '#9E9E9E',
            '#607D8B',
            '#FF4081',
            '#536DFE',
            '#00E676',
            '#FFD740',
            '#FF1744',
            '#D500F9',
            '#3D5AFE',
            '#00B0FF',
            '#64DD17',
            '#FFC400',
            '#F50057',
            '#651FFF',
            '#304FFE',
            '#1DE9B6',
            '#AEEA00',
            '#FF6D00',
            '#B71C1C',
            '#4A148C',
            '#0D47A1',
            '#00ACC1',
            '#43A047',
            '#F57F17',
            '#C51162',
            '#6200EA',
            '#2962FF',
            '#00BFA5',
            '#64DD17',
            '#FFAB00',
            '#FF5252',
            '#AA00FF',
            '#536DFE',
            '#00E5FF',
          ],
        },
      ],
      options: option,
      descricao: '',
      posicao: 'left',
    };
    setTimeout(() => this.cleanData(), this.graficos.push(newGraph));
  }

  public enablePDFGeneration(): boolean {
    if (this.graficos.length < 1) return false;
    return true;
  }

  public updateGraph(index: number): void {
  }

  public enableGraphGeneration(): boolean {
    if (!this.graficoEscolhido || !this.questaoSelecionada.idQuestao)
      return false;
    return true;
  }
  private convertResposes(texto: string): string {
    let t = texto.toLowerCase().trim();
    t = t.replace('a minha é', '').replace('acho que', '').trim();
    t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    return t;
  }

  private cleanData(): void {
    this.graficoEscolhido = this.listaOpcoesGraficos[0].value;
    this.questaoSelecionada = new QuestaoModel(
      '',
      '',
      [],
      TypeQuestEnum.NUMERO
    );
  }

  public iniciarGeracaoPDF(): void {
    this.gerandoPDF = true;
    this.generatePDFOfGraph();
  }

  public generatePDFOfGraph(): void {
    this.gerandoPDF = true;
    html2canvas(this.pdfGraph.nativeElement).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
      pdf.save('grafico_formularios.pdf');
    });
  }

  private count(respostas: string[]): Record<string, number> {
    const mapa: Record<string, number> = {};
    for (const r of respostas) {
      mapa[r] = (mapa[r] || 0) + 1;
    }
    return mapa;
  }
}
