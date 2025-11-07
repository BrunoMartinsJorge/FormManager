import { Component } from '@angular/core';
import { FormulariosServices } from '../../services/formularios-services';
import { Dialog } from 'primeng/dialog';
import {
  getTypeQuestLabel,
  TypeQuestEnum,
} from '../adicionar-formulario/enums/TypeQuestEnum';
import { CommonModule } from '@angular/common';
import { InputNumber } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { InputGroup } from 'primeng/inputgroup';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TypeQuestEnumTransformPipe } from '../../shared/pipes/type-quest-enum-transform-pipe';
import { SplitButton } from 'primeng/splitbutton';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Tooltip } from 'primeng/tooltip';
import { FieldsetModule } from 'primeng/fieldset';
import { RadioButton } from 'primeng/radiobutton';
import { NewQuest } from '../adicionar-formulario/forms/NewQuest';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { ToggleButton } from "primeng/togglebutton";

@Component({
  selector: 'app-questoes-salvas-formulario',
  imports: [
    Dialog,
    CommonModule,
    InputNumber,
    ReactiveFormsModule,
    FormsModule,
    Button,
    Select,
    InputText,
    InputGroup,
    TableModule,
    TypeQuestEnumTransformPipe,
    SplitButton,
    ProgressSpinner,
    Tooltip,
    FieldsetModule,
    RadioButton,
    ToggleSwitch,
    ToggleButton
],
  providers: [FormulariosServices, MessageService],
  templateUrl: './questoes-salvas-formulario.html',
  styleUrl: './questoes-salvas-formulario.css',
})
export class QuestoesSalvasFormulario {
  private listaPerguntasSalvas: NewQuest[] = [];
  public listaFiltrada: NewQuest[] = [];
  public visibilidadeAdicionarPergunta: boolean = false;
  public modoDialog: 'add' | 'edit' = 'add';
  public novaPergunta: NewQuest = this.montarPergunta;
  public carregandoPergunta: boolean = false;
  private idPerguntaSelecionada: number = 0;
  public tipoDeCampo: any[] = this.carregarTiposCampos();
  public opcoesMenu: any[] = [
    {
      label: 'Ver Imagem',
      icon: 'pi pi-image',
      command: () => {
        this.verImagemPergunta(this.novaPergunta?.imagemUrl || '');
      },
    },
    { separator: true },
    {
      label: 'Apagar Pergunta',
      icon: 'pi pi-trash',
      command: () => {
        this.apagarPergunta();
      },
    },
  ];

  public filtroTipo: TypeQuestEnum | undefined = undefined;

  private get montarPergunta(): NewQuest {
    return {
      titulo: '',
      tipo: TypeQuestEnum.TEXTO,
      opcoes: [],
    };
  }

  /**
   *
   * @description Carrega os tipos de campos
   * @returns - Tipos de campos
   */
  private carregarTiposCampos(): {
    nome: string;
    value: TypeQuestEnum;
  }[] {
    let tipos = Object.values(TypeQuestEnum);
    let tiposFormatados = [];
    for (let i = 0; i < tipos.length; i++) {
      const tipoF = {
        nome: '',
        value: TypeQuestEnum.TEXTO,
      };
      tipoF.nome = getTypeQuestLabel(tipos[i]);
      tipoF.value = tipos[i];
      tiposFormatados[i] = tipoF;
    }

    return tiposFormatados;
  }

  constructor(
    private formService: FormulariosServices,
    private toast: MessageService
  ) {
    this.getPerguntasSalvas();
  }

  /**
   * 
   * @description Funcionalidade para recarregar o filtro
   */
  public recarregarFiltro(): void {
    if (!this.filtroTipo) return;
    this.listaFiltrada = this.listaPerguntasSalvas.filter(
      (pergunta) => pergunta.tipo === this.filtroTipo
    );
  }

  public limparFiltros(): void {
    this.filtroTipo = undefined;
    this.getPerguntasSalvas();
  }

  /**
   *
   * @description Funcionalidade para apagar uma pergunta
   */
  public apagarPergunta(): void {
    if (!this.idPerguntaSelecionada) return;
    this.formService.apagarPerguntaSalva(this.idPerguntaSelecionada).subscribe({
      next: (response: any) => {
        this.toast.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Questão apagada com sucesso.',
        });
        this.getPerguntasSalvas();
        this.visibilidadeAdicionarPergunta = false;
      },
      error: (err) => {
        console.error('Erro ao apagar questão:', err);
        this.toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao apagar questão.',
        });
      },
    });
  }

  /**
   *
   * @description Funcionalidade para buscar as perguntas salvas
   */
  private getPerguntasSalvas(): void {
    this.listaPerguntasSalvas = [];
    this.listaFiltrada = [];
    this.carregandoPergunta = true;
    this.formService.buscarTodasPerguntasSalvas().subscribe({
      next: (response: any) => {
        this.listaPerguntasSalvas = response || [];
        this.listaFiltrada = response || [];
        if (this.filtroTipo) this.recarregarFiltro();
        this.carregandoPergunta = false;
      },
      error: (err) => {
        console.error('Erro ao buscar questões salvas:', err);
        this.toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as questões salvas.',
        });
        this.carregandoPergunta = false;
      },
    });
  }

  /**
   *
   * @param event - Evento
   * @param quest - Questão
   * @description Funcionalidade para selecionar uma pergunta
   */
  public selecionarPergunta(event: any, quest: any): void {
    this.idPerguntaSelecionada = quest.idPergunta;
    if (quest.tipo !== 'IMAGEM') {
      this.opcoesMenu = [
        {
          label: 'Apagar Pergunta',
          icon: 'pi pi-trash',
          command: () => {
            this.apagarPergunta();
          },
        },
      ];
    } else {
      this.opcoesMenu = [
        {
          label: 'Ver Imagem',
          icon: 'pi pi-image',
          command: () => {
            this.verImagemPergunta(quest.urlImagem);
          },
        },
        { separator: true },
        {
          label: 'Apagar Pergunta',
          icon: 'pi pi-trash',
          command: () => {
            this.apagarPergunta();
          },
        },
      ];
    }
  }

  /**
   *
   * @description Funcionalidade para abrir o dialog de adicionar uma pergunta
   */
  public abrirDialogAdcionarPergunta(): void {
    this.modoDialog = 'add';
    this.visibilidadeAdicionarPergunta = true;
    this.novaPergunta = {
      titulo: '',
      tipo: TypeQuestEnum.TEXTO,
      opcoes: [],
    };
  }

  /**
   *
   * @description Funcionalidade para recarregar a tabela
   */
  public recarregarTabela(): void {
    this.getPerguntasSalvas();
  }

  /**
   *
   * @description Funcionalidade para editar uma pergunta salva
   */
  public editarPerguntaSalva(): void {
    if (!this.novaPergunta) return;
    const quest: NewQuest = {
      idPergunta: this.novaPergunta.idPergunta,
      descricaoImagem: this.novaPergunta.descricaoImagem,
      imagemUrl: this.novaPergunta.imagemUrl,
      opcoes: this.novaPergunta.opcoes,
      titulo: this.novaPergunta.titulo,
      tipo: this.novaPergunta.tipo,
      nivelPontuacao: this.novaPergunta.nivelPontuacao,
      anos: this.novaPergunta.anos,
      tempo: this.novaPergunta.tempo,
      low: this.novaPergunta.low,
      high: this.novaPergunta.high,
      startLabel: this.novaPergunta.startLabel,
      endLabel: this.novaPergunta.endLabel,
      iconPontuacao: this.novaPergunta.iconPontuacao,
      obrigatorio: this.novaPergunta.obrigatorio,
    };
    this.formService.editarPergunta(quest).subscribe({
      next: (response: any) => {
        this.toast.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Questão editada com sucesso.',
        });
        this.getPerguntasSalvas();
        this.visibilidadeAdicionarPergunta = false;
      },
      error: (err) => {
        console.error('Erro ao editar questão:', err);
        this.toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao editar questão.',
        });
      },
    });
  }

  /**
   *
   * @param questao - Questão a ser editada
   * @description Abre o dialog de editar pergunta
   */
  public mudarVisibilidadeDialogEditarPergunta(questao: any): void {
    this.modoDialog = 'edit';

    this.visibilidadeAdicionarPergunta = !this.visibilidadeAdicionarPergunta;
    if (this.visibilidadeAdicionarPergunta) {
      this.novaPergunta = {
        descricaoImagem: questao.descricaoImagem,
        idPergunta: questao.idPergunta,
        imagemUrl: questao.urlImagem,
        opcoes: questao.opcoes,
        titulo: questao.titulo,
        tipo: questao.tipo,
        anos: questao.anos,
        endLabel: questao.endLabel,
        startLabel: questao.startLabel,
        high: questao.high,
        low: questao.low,
        tempo: questao.tempo,
        nivelPontuacao: questao.nivelPontuacao,
        iconPontuacao: questao.iconPontuacao,
        obrigatorio: questao.obrigatorio,
      };
    } else this.novaPergunta = this.montarPergunta;
  }

  /**
   *
   * @param url - URL da imagem
   * @description Abre uma nova aba com a imagem
   */
  public verImagemPergunta(url: string): void {
    window.open(url, '_blank');
  }

  /**
   *
   * @description Adiciona uma opcao na pergunta
   */
  public adicionarOpcao(): void {
    if (!this.novaPergunta) return;
    if (!this.novaPergunta.opcoes) this.novaPergunta.opcoes = [];
    this.novaPergunta.opcoes.push('');
  }

  /**
   *
   * @param index - Indice da opcao
   * @description Retorna o indice da opcao
   * @returns - Indice da opcao
   */
  public trackByIndex(index: number): number {
    return index;
  }

  /**
   *
   * @param indexOpcao - Indice da opcao
   * @description Remove uma opcao da pergunta
   */
  public removerOpcao(indexOpcao: number): void {
    if (!this.novaPergunta || !this.novaPergunta.opcoes) {
      return;
    }

    for (let i = indexOpcao; i < this.novaPergunta.opcoes.length - 1; i++) {
      this.novaPergunta.opcoes[i] = this.novaPergunta.opcoes[i + 1];
    }
    this.novaPergunta.opcoes.pop();
  }

  /**
   *
   * @param url - URL da imagem
   * @description Verifica se a url eh valida
   * @returns - Verifica se a url eh valida
   */
  public urlImagemValida(url: string): boolean {
    if (!url || url.trim() === '') return false;
    const regex =
      /^(https?|ftp|file):\/\/((?!(https?|ftp|file):\/\/[-a-zA-Z\d+&@#/%?=~_|!:,.;]*[-a-zA-Z\d+&@#/%=~_|])[-a-zA-Z\d+&@#/%?=~_|!:,.;])*[-a-zA-Z\d+&@#/%=~_|]$/;
    return regex.test(url);
  }

  /**
   *
   * @description Verifica se a pergunta eh valida
   * @returns - Verifica se a pergunta eh valida
   */
  public perguntaValida(): boolean {
    if (!this.novaPergunta) return false;
    if (this.novaPergunta.tipo !== 'IMAGEM') {
      if (!this.novaPergunta.titulo || this.novaPergunta.titulo.trim() === '') {
        return false;
      }
    }
    if (
      this.novaPergunta.imagemUrl &&
      this.novaPergunta.imagemUrl.trim() != ''
    ) {
      if (
        !this.novaPergunta.descricaoImagem ||
        this.novaPergunta.descricaoImagem.trim() === ''
      ) {
        return false;
      }
    }
    if (
      this.novaPergunta.tipo === TypeQuestEnum.MULTIPLA ||
      this.novaPergunta.tipo === TypeQuestEnum.UNICA
    ) {
      for (let opcao of this.novaPergunta.opcoes ?? []) {
        if (!opcao || opcao.trim() === '') {
          return false;
        }
      }
    }
    if (!this.novaPergunta.opcoes) return false;
    for (let opcao of this.novaPergunta.opcoes) {
      if (!opcao || opcao.trim() === '') {
        return false;
      }
    }
    return true;
  }

  /**
   *
   * @description Adiciona uma pergunta aos favoritos
   */
  public adicionarPergunta(): void {
    if (!this.perguntaValida()) return;
    this.formService.adicionarNovaPerguntaSalva(this.novaPergunta).subscribe({
      next: (response) => {
        this.toast.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Questão salva com sucesso!',
        });
        this.visibilidadeAdicionarPergunta = false;
        this.getPerguntasSalvas();
      },
      error: (err) => {
        console.error('Erro ao salvar questão:', err);
        this.toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível salvar a questão.',
        });
      },
    });
  }
}
