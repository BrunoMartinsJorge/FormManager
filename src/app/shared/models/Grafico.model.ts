export class GraficoModel {
  public labels: string[];
  public datasets: DatasetsModel[];
  public descricao: string;
  public posicao: 'left' | 'right' = 'left';
  public options: any = {};
  public titulo: string = '';

  constructor(label: string[], datasets: DatasetsModel[], descricao: string) {
    this.labels = label;
    this.datasets = datasets;
    this.descricao = descricao;
  }
}

export class DatasetsModel {
  public label: string;
  public data: number[];
  public backgroundColor: string[];

  constructor(label: string, data: number[], backgroundColor: string[]) {
    this.label = label;
    this.data = data;
    this.backgroundColor = backgroundColor;
  }
}
