import { Component } from '@angular/core';
import { FormulariosServices } from '../../services/formularios-services';
import { Dialog } from 'primeng/dialog';
import { TypeQuestEnum } from '../adicionar-formulario/enums/TypeQuestEnum';
import { CommonModule } from '@angular/common';
import { InputNumber } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Fieldset } from 'primeng/fieldset';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { InputGroup } from 'primeng/inputgroup';
import { VisualizarQuestao } from '../../shared/visualizar-questao/visualizar-questao';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TypeQuestEnumTransformPipe } from '../../shared/pipes/type-quest-enum-transform-pipe';
import { SplitButton } from 'primeng/splitbutton';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-questoes-salvas-formulario',
  imports: [
    Dialog,
    CommonModule,
    InputNumber,
    ReactiveFormsModule,
    FormsModule,
    Fieldset,
    Button,
    Select,
    InputText,
    InputGroup,
    VisualizarQuestao,
    TableModule,
    TypeQuestEnumTransformPipe,
    SplitButton,
    ProgressSpinner,
  ],
  providers: [FormulariosServices, MessageService],
  templateUrl: './questoes-salvas-formulario.html',
  styleUrl: './questoes-salvas-formulario.css',
})
export class QuestoesSalvasFormulario {
  public listaPerguntasSalvas: any[] = [];
  public visibilidadeAdicionarPergunta: boolean = false;
  public modoDialog: 'add' | 'edit' = 'add';
  public novaPergunta: any = {};
  public carregandoPergunta: boolean = false;
  private idPerguntaSelecionada: number = 0;
  public tipoDeCampo: any[] = [
    { nome: 'Texto', value: TypeQuestEnum.TEXTO },
    { nome: 'Parágrafo', value: TypeQuestEnum.PARAGRAFO },
    { nome: 'Número', value: TypeQuestEnum.NUMERO },
    { nome: 'Única Escolha', value: TypeQuestEnum.UNICA },
    { nome: 'Múltipla Escolha', value: TypeQuestEnum.MULTIPLA },
    { nome: 'Data', value: TypeQuestEnum.DATA },
    { nome: 'Escala', value: TypeQuestEnum.ESCALA },
    { nome: 'Verdadeiro / Falso', value: TypeQuestEnum.VERDADEIRO_FALSO },
  ];
  public opcoesMenu: any[] = [
    {
      label: 'Ver Imagem',
      icon: 'pi pi-image',
      command: () => {
        this.verImagemPergunta(this.novaPergunta.imagem);
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

  constructor(
    private formService: FormulariosServices,
    private toast: MessageService
  ) {
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
    this.carregandoPergunta = true;
    this.formService.buscarTodasPerguntasSalvas().subscribe({
      next: (response: any) => {
        this.listaPerguntasSalvas = response || [];
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
    if (quest.imagem == null || quest.imagem == '') {
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
            this.verImagemPergunta(quest.imagem);
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
      favorita: true,
    };
  }

  /**
   * 
   * @description Funcionalidade para editar uma pergunta salva
   */
  public editarPerguntaSalva(): void {
    const quest: any = {
      idPergunta: this.novaPergunta.id,
      descricaoImagem: this.novaPergunta.descricaoImagem,
      favorita: this.novaPergunta.favorito,
      id: this.novaPergunta.idPergunta,
      imagem: this.novaPergunta.imagem,
      opcoes: this.novaPergunta.opcoes,
      titulo: this.novaPergunta.titulo,
      tipo: this.novaPergunta.tipo,
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
        favorita: questao.favorito,
        id: questao.idPergunta,
        imagem: questao.imagem,
        opcoes: questao.opcoes,
        titulo: questao.titulo,
        tipo: questao.tipo,
      };
    } else this.novaPergunta = {};
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
    if (!this.novaPergunta.titulo || this.novaPergunta.titulo.trim() === '') {
      return false;
    }
    if (this.novaPergunta.imagemUrl && this.novaPergunta.imagemUrl.trim() != '') {
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
