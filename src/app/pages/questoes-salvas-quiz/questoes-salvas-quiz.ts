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
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Textarea } from 'primeng/textarea';
import { ALternativasDto, QuestaoSalva } from './model/QuestaoSalva';
import { QuizService } from '../../services/quiz-service';

@Component({
  selector: 'app-questoes-salvas-quiz',
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
    InputGroupAddon,
    Textarea,
  ],
  templateUrl: './questoes-salvas-quiz.html',
  styleUrl: './questoes-salvas-quiz.css',
  providers: [FormulariosServices, MessageService],
})
export class QuestoesSalvasQuiz {
  public listaQuestoesSalvas: QuestaoSalva[] = [];
  public visibilidadeDialogAdicionarQuestao: boolean = false;
  public modoDialog: 'add' | 'edit' = 'add';
  public novaQuestao: QuestaoSalva = {
    titulo: '',
    tipo: TypeQuestEnum.TEXTO,
    opcoes: [],
    favorita: true,
    pontuacao: 0,
    feedbackCorreto: '',
    feedbackErro: '',
    respostasCorretas: [],
    urlImagem: '',
    descricaoImagem: '',
  };
  public carregandoQuestoes: boolean = false;
  public tipoDeCampo: any[] = this.carregarTiposCampos();
  public opcoesMenu: any[] = [
    {
      label: 'Ver Imagem',
      icon: 'pi pi-image',
      command: () => {
        //this.acessarFormulario(this.formularioSelecionado);
      },
    },
    { separator: true },
    {
      label: 'Apagar Questão',
      icon: 'pi pi-trash',
      command: () => {
        //this.gerarPDF(this.formularioSelecionado);
      },
    },
  ];

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
    private toast: MessageService,
    private service: QuizService
  ) {
    this.getPerguntasSalvas();
  }

  /**
   *
   * @description Busca as perguntas salvas
   */
  private getPerguntasSalvas(): void {
    this.listaQuestoesSalvas = [];
    this.carregandoQuestoes = true;
    this.formService.listarQuestoesQuiz().subscribe({
      next: (response: any) => {
        this.listaQuestoesSalvas = response || [];
        this.carregandoQuestoes = false;
      },
      error: (err) => {
        console.error('Erro ao buscar questões salvas:', err);
        this.toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as questões salvas.',
        });
        this.carregandoQuestoes = false;
      },
    });
  }

  public limparQuestao(event: any): void {
    const value = event.value;
    if (!value) return;
    const questao = this.novaQuestao;
    this.novaQuestao = {
    titulo: questao.titulo || '',
    tipo: value,
    opcoes: [],
    favorita: true,
    pontuacao: 0,
    feedbackCorreto: '',
    feedbackErro: '',
    respostasCorretas: [],
    urlImagem: '',
    descricaoImagem: '',
  };
  }

  /**
   *
   * @param indexOpcao - Indice da opcao
   * @description Verifica se a opção selecionada eh a correta
   * @returns - Verdadeiro ou Falso
   */
  public opcaoCorreta(indexOpcao: number): boolean {
    const questao: QuestaoSalva = this.novaQuestao;
    if (!questao.opcoes) return false;
    console.log(questao);
    if (!questao.respostasCorretas) {
      console.log(questao.respostasCorretas);
      return false;
    }
    const alternativa = questao.opcoes[indexOpcao];
    if (!alternativa) return false;
    for (let i = 0; i < questao.respostasCorretas!.length; i++) {
      console.log(questao.respostasCorretas![i].texto);
      console.log(alternativa.texto);
      
      if (questao.respostasCorretas![i].texto === alternativa.texto) {
        return true;
      }
    }
    return false;
  }

  /**
   *
   * @param opcao - Verdadeiro ou Falso
   * @description Verifica se a opção selecionada eh a correta
   * @returns - Verdadeiro ou Falso
   */
  public opcaoCorretaVerdadeiroFalse(opcao: 'Verdadeiro' | 'Falso'): boolean {
    const questao = this.novaQuestao;
    if (!questao || !questao.opcoes) return false;
    const op = questao.opcoes.find((o: ALternativasDto) => o.texto === opcao);
    let res = false;
    if (!questao.respostasCorretas || !op) return false;
    questao.respostasCorretas.forEach((c: ALternativasDto) => {
      if (c.texto === opcao) {
        res = true;
      } else res = false;
    });
    return res;
  }

  /**
   *
   * @param indexOpcao - Indice da opcao
   * @description Verifica se a opção selecionada eh a correta
   * @returns - Verdadeiro ou Falso
   */
  public mudarOpcaoCorreta(indexOpcao: number): void {
    const questao: QuestaoSalva = this.novaQuestao;
    const idx = Number(indexOpcao);

    if (!questao.opcoes) return; // segurança

    if (!Array.isArray(questao.respostasCorretas)) {
      questao.respostasCorretas = [];
    }

    const alternativaSelecionada = questao.opcoes[idx];

    if (!alternativaSelecionada) return;

    const indexNaCorreta = questao.respostasCorretas.findIndex(
      (a) => a.idAlternativa === alternativaSelecionada.idAlternativa
    );

    if (indexNaCorreta > -1) {
      questao.respostasCorretas.splice(indexNaCorreta, 1);
    } else {
      if (questao.tipo === 'UNICA') {
        questao.respostasCorretas = [alternativaSelecionada];
      } else {
        questao.respostasCorretas.push(alternativaSelecionada);
      }
    }

    this.novaQuestao = { ...questao };
  }

  /**
   *
   * @param opcao - Verdadeiro ou Falso
   * @description Verifica se a opção selecionada eh a correta
   * @returns - Verdadeiro ou Falso
   */
  public mudarOpcaoCorretaVerdadeiroFalso(opcao: 'Verdadeiro' | 'Falso'): void {
    const questao = this.novaQuestao;
    questao.opcoes = [
      {
        idAlternativa: null,
        texto: 'Verdadeiro',
      },
      {
        idAlternativa: null,
        texto: 'Falso',
      },
    ];
    const alternativa = questao.opcoes.find((a: any) => a.texto === opcao);
    if (!alternativa) return;
    questao.respostasCorretas = [];
    questao.respostasCorretas.push(alternativa);
  }

  /**
   *
   * @param event - Evento
   * @param quest - Objeto da questão
   * @description Verifica se a opção selecionada eh a correta
   */
  public selecionarQuestao(event: any, quest: any): void {
    if (quest.imagem == null || quest.imagem == '') {
      this.opcoesMenu = [
        {
          label: 'Apagar Questão',
          icon: 'pi pi-trash',
          command: () => {
            //this.gerarPDF(this.formularioSelecionado);
          },
        },
      ];
    } else {
      this.opcoesMenu = [
        {
          label: 'Ver Imagem',
          icon: 'pi pi-image',
          command: () => {
            this.verImagemQuestão(quest.imagem);
          },
        },
        { separator: true },
        {
          label: 'Apagar Questão',
          icon: 'pi pi-trash',
          command: () => {
            //this.gerarPDF(this.formularioSelecionado);
          },
        },
      ];
    }
  }

  /**
   *
   * @description Abre o dialog para adicionar uma Questão
   */
  public abrirDialogAdcionarPergunta(): void {
    this.modoDialog = 'add';
    this.visibilidadeDialogAdicionarQuestao = true;
    this.novaQuestao = {
      titulo: '',
      tipo: TypeQuestEnum.TEXTO,
      opcoes: [],
      favorita: true,
    };
  }

  /**
   *
   * @description Edita uma Questão
   */
  public editarQuestaoSalva(): void {
    this.service.editarQuestao(this.novaQuestao).subscribe({
      next: (response: any) => {
        this.toast.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Questão editada com sucesso.',
        });
        this.getPerguntasSalvas();
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
   * @param questao - Objeto da questão
   * @description Abre o dialog para editar uma Questão
   */
  public mudarVisibilidadeDialogEditarQuestao(questao: any): void {
    this.modoDialog = 'edit';

    this.visibilidadeDialogAdicionarQuestao =
      !this.visibilidadeDialogAdicionarQuestao;
    if (this.visibilidadeDialogAdicionarQuestao) {
      this.novaQuestao = {
        descricaoImagem: questao.descricaoImagem,
        favorita: questao.favorito,
        id: questao.id,
        urlImagem: questao.urlImagem,
        opcoes: questao.opcoes || [],
        respostasCorretas: questao.respostasCorretas,
        titulo: questao.titulo,
        pontuacao: questao.pontuacao,
        feedbackCorreto: questao.feedbackCorreto,
        feedbackErro: questao.feedbackErro,
        tipo: questao.tipo,
      };
    } else
      this.novaQuestao = {
        titulo: '',
        tipo: TypeQuestEnum.TEXTO,
        opcoes: [],
        favorita: true,
        pontuacao: 0,
        feedbackCorreto: '',
        feedbackErro: '',
        respostasCorretas: [],
        urlImagem: '',
        descricaoImagem: '',
      };
  }

  /**
   *
   * @param url - URL da imagem
   * @description Abre uma nova aba com a imagem
   */
  public verImagemQuestão(url: string): void {
    window.open(url, '_blank');
  }

  /**
   *
   * @description Adiciona uma nova opção
   */
  public adicionarOpcao(): void {
    if (!this.novaQuestao.opcoes) this.novaQuestao.opcoes = [];
    this.novaQuestao.opcoes.push({ idAlternativa: null, texto: '' });
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
   * @description Remove uma opcao
   * @returns - Indice da opcao
   */
  public removerOpcao(indexOpcao: number): void {
    if (!this.novaQuestao || !this.novaQuestao.opcoes) {
      return;
    }

    for (let i = indexOpcao; i < this.novaQuestao.opcoes.length - 1; i++) {
      this.novaQuestao.opcoes[i] = this.novaQuestao.opcoes[i + 1];
    }
    this.novaQuestao.opcoes.pop();
  }

  /**
   *
   * @param url - URL da imagem
   * @description Verifica se a URL da imagem eh valida
   * @returns - Verdadeiro se a URL da imagem eh valida
   */
  public urlImagemValida(url: string): boolean {
    if (!url || url.trim() === '') return false;
    const regex =
      /^(https?|ftp|file):\/\/((?!(https?|ftp|file):\/\/[-a-zA-Z\d+&@#/%?=~_|!:,.;]*[-a-zA-Z\d+&@#/%=~_|])[-a-zA-Z\d+&@#/%?=~_|!:,.;])*[-a-zA-Z\d+&@#/%=~_|]$/;
    return regex.test(url);
  }

  /**
   *
   * @description Verifica se a questão eh valida
   * @returns - Verdadeiro se a questão eh valida
   */
  public questaoValida(): boolean {
    if (!this.novaQuestao.titulo || this.novaQuestao.titulo.trim() === '') {
      return false;
    }
    if (this.novaQuestao.urlImagem && this.novaQuestao.urlImagem.trim() != '') {
      if (
        !this.novaQuestao.descricaoImagem ||
        this.novaQuestao.descricaoImagem.trim() === ''
      ) {
        return false;
      }
    }
    if (
      this.novaQuestao.tipo === TypeQuestEnum.MULTIPLA ||
      this.novaQuestao.tipo === TypeQuestEnum.UNICA
    ) {
      for (let opcao of this.novaQuestao.opcoes ?? []) {
        if (!opcao || opcao.texto.trim() === '') {
          return false;
        }
      }
    }
    if (!this.novaQuestao.opcoes) return false;
    for (let opcao of this.novaQuestao.opcoes) {
      if (!opcao || opcao.texto.trim() === '') {
        return false;
      }
    }
    return true;
  }

  /**
   *
   * @description Adiciona uma nova questão
   */
  public adicionarQuestaoSalva(): void {
    if (!this.questaoValida()) return;
    this.formService.cadastrarNovaQuestao(this.novaQuestao).subscribe({
      next: (response: any) => {
        this.toast.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Questão salva com sucesso!',
        });
        this.visibilidadeDialogAdicionarQuestao = false;
        this.getPerguntasSalvas();
      },
      error: (err) => {
        console.error('Erro ao salvar Questão:', err);
        this.toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível salvar a Questão.',
        });
      },
    });
  }
}
