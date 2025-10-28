import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { QuizSelected } from '../../models/ChatSelected.model';

@Component({
  selector: 'app-gerar-graficos',
  standalone: true,
  imports: [
    SelectButtonModule,
    CommonModule,
    FormsModule,
    SelectModule,
    ChartModule,
    ButtonModule,
    Dialog,
  ],
  templateUrl: './gerar-graficos.html',
  styleUrls: ['./gerar-graficos.css'],
})
export class GerarGraficos implements OnChanges {
  @Input() formSelected: QuizSelected | null = null;
  @Input() visibilityOfGenerateGraphic: boolean = false;
  @Output() visibilityOfGenerateGraphicChange = new EventEmitter<boolean>();

  public optionsByDropdownQuests: any[] = [];
  public questSelected: any;

  public typeOfChart: any[] = [
    { label: 'Barras', value: 'bar' },
    { label: 'Pizza', value: 'pie' },
    { label: 'Rosca', value: 'doughnut' },
  ];
  public typeOfChartSelected: string = 'bar';

  public graficos: Array<{ id: string; tipo: string; dados: any; titulo: string }> =
    [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formSelected'] && this.formSelected) {      
      this.optionsByDropdownQuests = this.formSelected.questoes.map(
        (q: any, i: number) => ({
          label: `${i + 1}º Questão - ${q.titulo}`,
          value: q.id,
          tipo: q.tipo,
        })
      );

      if (this.optionsByDropdownQuests.length > 0) {
        this.questSelected = this.optionsByDropdownQuests[0];
      }
    }
  }

  public toAddGraphic() {
    if (!this.questSelected || this.formSelected == null) return;

    const questId = this.questSelected.value ?? this.questSelected;
    const quest = this.formSelected.questoes.find((q: any) => q.id === questId);
    if (!quest) return;

    const tipoQuest = (quest.tipo || '').toLowerCase();

    if (tipoQuest.includes('texto')) {
      this.graficos.push({
        id: this.makeId(),
        tipo: 'texto',
        dados: null,
        titulo: quest.titulo,
      });
      return;
    }

    const labels = (quest.opcoes || []).map((o: any) =>
      typeof o === 'string' ? o : o.value ?? o.label ?? String(o)
    );

    const counts = labels.map((label: any) =>
      (this.formSelected!.respostas || []).reduce((acc: number, resp: any) => {
        const r = (resp.respostas || []).find(
          (x: any) => x.idQuestao === quest.id
        );
        return (
          acc + (r && String(r.valor).trim() === String(label).trim() ? 1 : 0)
        );
      }, 0)
    );

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

  public closeDialog(): void {
    this.visibilityOfGenerateGraphicChange.emit(false);
    this.visibilityOfGenerateGraphic = false;
    this.graficos = [];
  }
}
