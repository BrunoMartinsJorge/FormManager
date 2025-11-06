import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Questao } from '../../../pages/listar-formularios/models/Questao.model';
import { Tooltip } from 'primeng/tooltip';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'gerar-graficos',
  standalone: true,
  imports: [
    SelectButtonModule,
    CommonModule,
    FormsModule,
    SelectModule,
    ChartModule,
    ButtonModule,
    Dialog,
    Tooltip,
    ConfirmPopupModule,
  ],
  templateUrl: './gerar-graficos.html',
  styleUrls: ['./gerar-graficos.css'],
  providers: [ConfirmationService],
})
export class GerarGraficos implements OnChanges {
  @Input() formularioSelecionado: any = null;
  @Input() quizSelecionado: any = null;
  @Input() visibilityOfGenerateGraphic: boolean = false;
  @Output() visibilityOfGenerateGraphicChange = new EventEmitter<boolean>();

  public opcoesDePerguntasDisponiveis: any[] = [];
  public questSelected: any;

  constructor(private confirmationService: ConfirmationService) {}

  public typeOfChart: any[] = [
    { label: 'Barras', value: 'bar' },
    { label: 'Pizza', value: 'pie' },
    { label: 'Doughnut', value: 'doughnut' },
  ];
  public typeOfChartSelected: string = 'bar';
  private perguntasQuantificadas: Questao[] = [];

  public graficos: Array<{
    id: string;
    tipo: string;
    dados: any;
    titulo: string;
  }> = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formularioSelecionado'] && this.formularioSelecionado) {
      this.filtrarPerguntasGraficos();
    }
  }

  @ViewChildren('graficoRef') graficosRefs!: QueryList<ElementRef>;

  baixarGrafico(index: number, titulo: string, formato: 'png' | 'pdf' = 'png') {
    const element = this.graficosRefs.toArray()[index]?.nativeElement;
    if (!element) return;

    html2canvas(element, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const tituloMenor = titulo ? titulo.toLowerCase() : 'arquivo';
      const nomeArquivoBase =
        (tituloMenor.replace(/\s+/g, '_') || 'grafico') + '_grafico';

      if (formato === 'png') {
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `${nomeArquivoBase}.png`;
        link.click();
      } else {
        const pdf = new jsPDF();
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save(`${nomeArquivoBase}.pdf`);
      }
    });
  }

  public iniciarDownloadGrafico(event: Event, index: number, titulo: string): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Você deseja baixar esse gráfico como PDF ou PNG?',
      icon: 'pi pi-quest',
      rejectLabel: 'Baixar como PNG',
      acceptLabel: 'Baixar como PDF',
      rejectButtonProps: {
        label: 'Baixar como PNG',
        severity: 'success',
        icon: 'pi pi-image',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Baixar como PDF',
        severity: 'info',
        outlined: true,
        icon: 'pi pi-pdf',
      },
      accept: () => {
        this.baixarGrafico(index, titulo, 'pdf');
      },
      reject: () => {
        this.baixarGrafico(index, titulo, 'png');
      },
    });
  }

  private filtrarPerguntasGraficos(): void {
    const perguntas: Questao[] = this.formularioSelecionado.perguntas;
    const respostas: any[] = this.formularioSelecionado.respostas;
    const filtradas = perguntas.filter((pergunta) => {
      const tipo = pergunta.tipo.toUpperCase();

      if (['UNICA', 'MULTIPLA', 'ESCALA'].includes(tipo)) return true;

      if (
        tipo === 'UNICA' &&
        pergunta.opcoes &&
        pergunta.opcoes.length === 2 &&
        pergunta.opcoes.every((op) =>
          ['VERDADEIRO', 'FALSO'].includes(op.toUpperCase())
        )
      ) {
        return true;
      }

      if (tipo === 'TEXTO') {
        const respostasDaPergunta = respostas.filter(
          (r) => r.idQuestao === pergunta.id
        );

        const todasNumericas =
          respostasDaPergunta.length > 0 &&
          respostasDaPergunta.every((r) => /^[0-9]+$/.test(r.valor));

        if (todasNumericas) return true;
      }

      return false;
    });
    if (!filtradas) return;
    this.perguntasQuantificadas = filtradas;
    this.mapearQuestoesParaOpcoes();
  }

  private mapearQuestoesParaOpcoes(): void {
    this.opcoesDePerguntasDisponiveis = this.perguntasQuantificadas.map(
      (q: any, i: number) => ({
        label: `${i + 1}º Questão - ${q.titulo}`,
        value: q.id,
        tipo: q.tipo,
      })
    );
  }

  public adicionarNovoGrafico() {
    if (!this.questSelected || !this.formularioSelecionado) return;

    const questId = this.questSelected.value ?? this.questSelected;
    const quest = this.formularioSelecionado.perguntas.find(
      (q: any) => q.id === questId
    );
    if (!quest) return;

    const todasRespostas = (this.formularioSelecionado.respostas || []).flat();

    const respostasDaQuestao = todasRespostas
      .filter((r: any) => r.idQuestao === quest.id)
      .map((r: any) => String(r.valor).trim());

    if (respostasDaQuestao.length === 0) {
      console.warn(`Nenhuma resposta para: ${quest.titulo}`);
      return;
    }

    const todasNumericas = respostasDaQuestao.every((v: string) =>
      /^[0-9]+$/.test(v)
    );

    let labels: string[] = [];
    let counts: number[] = [];

    if (quest.opcoes && quest.opcoes.length > 0 && !todasNumericas) {
      labels = quest.opcoes.map((o: any) =>
        typeof o === 'string' ? o : o.value ?? o.label ?? String(o)
      );

      counts = labels.map((label: string) =>
        respostasDaQuestao.reduce(
          (acc: number, valor: string) =>
            acc + (String(valor).trim() === String(label).trim() ? 1 : 0),
          0
        )
      );
    } else if (todasNumericas) {
      const valoresNumericos = respostasDaQuestao.map((v: string) => Number(v));

      const min = Math.min(...valoresNumericos);
      const max = Math.max(...valoresNumericos);

      const range = Array.from({ length: max - min + 1 }, (_, i) =>
        String(min + i)
      );

      labels = range;
      counts = range.map(
        (label) =>
          valoresNumericos.filter((v: number) => v === Number(label)).length
      );
    } else {
      console.warn(`Tipo não compatível para gráfico: ${quest.titulo}`);
      return;
    }

    const colors = this.generateColors(labels.length);

    const dados = {
      labels,
      datasets: [
        {
          label: quest.titulo,
          data: counts,
          backgroundColor: colors,
          borderColor: colors,
          fill: false,
        },
      ],
    };

    this.graficos.push({
      id: this.makeId(),
      tipo: this.typeOfChartSelected,
      dados,
      titulo: quest.titulo,
    });
  }

  public removeGraphic(index: number) {
    this.graficos.splice(index, 1);
  }

  public trackByGrafico(index: number, item: any) {
    return item.id;
  }

  private generateColors(n: number) {
    const palette = [
      '#42A5F5',
      '#66BB6A',
      '#FFA726',
      '#AB47BC',
      '#26A69A',
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#9CCC65',
      '#FF9F40',
    ];
    const out: string[] = [];
    for (let i = 0; i < n; i++) out.push(palette[i % palette.length]);
    return out;
  }

  private makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  public fecharDialog(): void {
    this.visibilityOfGenerateGraphicChange.emit(false);
    this.visibilityOfGenerateGraphic = false;
    this.graficos = [];
  }
}
