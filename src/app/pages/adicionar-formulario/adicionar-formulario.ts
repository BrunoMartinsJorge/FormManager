import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { FormulariosServices } from '../../services/formularios-services';
import { NewQuest } from './forms/NewQuest';
import { NewForm } from './forms/NewForm';
import { getTypeQuestLabel, TypeQuestEnum } from './enums/TypeQuestEnum';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectModule } from 'primeng/select';
import { FieldsetModule } from 'primeng/fieldset';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { trigger, transition, style, animate } from '@angular/animations';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem, MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { InfoTipoQuestao } from '../../shared/info-tipo-questao/info-tipo-questao';
import { RadioButton } from 'primeng/radiobutton';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TypeQuestEnumTransformPipe } from '../../shared/pipes/type-quest-enum-transform-pipe';
import { ValidarFormulario } from '../../utils/ValidarFormulariosQuiz';

export interface Opcao {
  id: number;
  valor: string;
}

@Component({
  selector: 'app-adicionar-formulario',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    DatePickerModule,
    ToggleSwitchModule,
    SelectModule,
    FieldsetModule,
    DialogModule,
    ProgressSpinnerModule,
    InputNumberModule,
    TooltipModule,
    InputGroupModule,
    InputGroupAddonModule,
    SplitButtonModule,
    CheckboxModule,
    TableModule,
    InfoTipoQuestao,
    RadioButton,
    ToggleButtonModule,
    TypeQuestEnumTransformPipe,
  ],
  standalone: true,
  providers: [FormulariosServices],
  templateUrl: './adicionar-formulario.html',
  styleUrl: './adicionar-formulario.css',
  animations: [
    trigger('questaoAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ opacity: 0, transform: 'translateY(20px)' })
        ),
      ]),
    ]),
  ],
})
export class AdicionarFormulario {
  public erroAoCriarFormulario: boolean = false;
  public mostrarTelaAcao: boolean = false;
  public visibilidadeDialog: boolean = false;
  public respostaCriarFormulario: any = {
    url: '',
    formId: '',
  };
  public carregando: boolean = false;
  public questoesSelecionadas: any[] = [];
  public formulario: NewForm = {
    titulo: '',
    descricao: '',
    questoes: [],
  };
  public visibilidadePerguntasSalvas: boolean = false;
  public opcao: Opcao[] = [];
  public opcoesBotao: MenuItem[] = [
    {
      label: 'Utilizar Questão Existente',
      command: () => {
        this.buscarPerguntasSalvas();
      },
    },
  ];
  public perguntasSalvas: any[] = [];

  public tipoDeCampo: any[] = this.carregarTiposCampos();

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

  /**
   *
   * @param indexQuestao - Indice da questão
   * @description Adiciona uma opção na questão
   */
  public adicionarOpcao(indexQuestao: number): void {
    const questao = this.formulario.questoes[indexQuestao];
    if (!questao.opcoes) questao.opcoes = [];
    questao.opcoes.push('');
  }

  /**
   *
   * @description Adiciona as perguntas selecionadas ao formulário
   */
  public usarPerguntasSelecionadas(): void {
    if (this.questoesSelecionadas.length === 0) return;
    this.questoesSelecionadas.forEach((question) => {
      const novaQuestao: NewQuest = {
        idPergunta: question.id,
        titulo: question.titulo,
        tipo: question.tipo,
        opcoes: question.opcoes,
        imagemUrl: question.urlImagem,
        descricaoImagem: question.descricaoImagem,
        anos: question.anos,
        nivelPontuacao: question.nivelPontuacao,
        endLabel: question.endLabel,
        startLabel: question.startLabel,
        iconPontuacao: question.iconPontuacao,
        tempo: question.tempo,
        low: question.low,
        high: question.high,
        obrigatorio: question.obrigatorio,
      };
      this.formulario.questoes.push(novaQuestao);
    });
    
    this.visibilidadePerguntasSalvas = false;
  }

  constructor(
    private formulariosService: FormulariosServices,
    private toast: MessageService
  ) {}

  /**
   *
   * @description Adiciona uma nova questão ao formulário
   */
  public adicionarQuestao(): void {
    const novaQuestao: NewQuest = {
      titulo: '',
      tipo: TypeQuestEnum.TEXTO,
      opcoes: [],
    };
    this.formulario.questoes.push(novaQuestao);
  }

  /**
   *
   * @description Busca as perguntas salvas do banco
   */
  private buscarPerguntasSalvas(): void {
    this.formulariosService.buscarTodasPerguntasSalvas().subscribe({
      next: (res) => {
        this.visibilidadePerguntasSalvas = true;
        this.perguntasSalvas = res;
      },
      error: (error: Error) => {
        console.error(error);
      },
    });
  }

  /**
   *
   * @param url - URL da imagem
   * @description Verifica se a URL da imagem eh valida
   * @returns - Verifica se a URL da imagem eh valida
   */
  public urlImagemValida(url: string): boolean {
    if (!url || url.trim() === '') return false;
    const regex =
      /^(https?|ftp|file):\/\/((?!(https?|ftp|file):\/\/[-a-zA-Z\d+&@#/%?=~_|!:,.;]*[-a-zA-Z\d+&@#/%=~_|])[-a-zA-Z\d+&@#/%?=~_|!:,.;])*[-a-zA-Z\d+&@#/%=~_|]$/;
    return regex.test(url);
  }

  /**
   *
   * @param index - Indice da questão
   * @description Retorna o indice da questão
   * @returns - Indice da questão
   */
  public trackByIndex(index: number): number {
    return index;
  }

  /**
   *
   * @description Cria um novo formulário
   */
  public criarFormulario(): void {
    this.carregando = true;
    this.erroAoCriarFormulario = false;
    this.mostrarTelaAcao = false;

    const payload = this.formulario;

    this.formulariosService.criarFormulario(payload).subscribe(
      (response) => {
        this.respostaCriarFormulario.formId = response.resposta.formId;
        this.respostaCriarFormulario.url = response.resposta.url;
        this.visibilidadeDialog = true;
        this.carregando = false;
      },
      (error) => {
        this.carregando = false;
        this.mostrarTelaAcao = true;
        this.erroAoCriarFormulario = true;
        setTimeout(() => {
          this.mostrarTelaAcao = false;
          this.erroAoCriarFormulario = false;
        }, 2000);
      }
    );
  }

  /**
   *
   * @description Remove uma questão do formulário
   * @param index - Indice da questão
   */
  public removerQuestao(index: number): void {
    this.formulario.questoes.splice(index, 1);
  }

  public limparSelecaoPerguntas(): void {
    this.questoesSelecionadas = [];
  }

  /**
   *
   * @description Verifica se o formulário esta valido
   * @returns - Retorna true se o formulário for valido
   */
  public formularioValido(): boolean {
    // if (!this.formulario.titulo || !this.formulario.descricao) return false;
    // if (!this.formulario.questoes || this.formulario.questoes.length === 0)
    //   return false;
    // for (let questao of this.formulario.questoes) {
    //   if (questao.tipo !== TypeQuestEnum.IMAGEM) {
    //     if (questao.descricaoImagem && questao.descricaoImagem.trim() === '') {
    //       return false;
    //     }
    //     if (!questao.imagemUrl && questao.imagemUrl?.trim() === '') {
    //       return false;
    //     }
    //     if (!questao.titulo) {
    //       return false;
    //     }
    //   }
    //   if (
    //     questao.tipo === TypeQuestEnum.MULTIPLA ||
    //     questao.tipo === TypeQuestEnum.UNICA
    //   ) {
    //     for (let opcao of questao.opcoes ?? []) {
    //       if (!opcao || opcao.trim() === '') {
    //         return false;
    //       }
    //     }
    //   }
    //   if (questao.opcoes && questao.opcoes.length > 0) {
    //     for (let opcao of questao.opcoes) {
    //       if (!opcao) {
    //         return false;
    //       }
    //     }
    //   }
    //   if (questao.imagemUrl && questao.imagemUrl.trim() != '') {
    //     if (!questao.descricaoImagem || questao.descricaoImagem.trim() === '') {
    //       return false;
    //     }
    //   }
    // }
    // return true;
    return ValidarFormulario(this.formulario);
  }

  /**
   *
   * @param indexQuestao - Indice da questão
   * @param indexOpcao - Indice da opção
   * @description Remove uma opção da questão
   */
  public removerOpcao(indexQuestao: number, indexOpcao: number): void {
    const questao = this.formulario.questoes[indexQuestao];

    if (!questao || !questao.opcoes) {
      return;
    }

    for (let i = indexOpcao; i < questao.opcoes.length - 1; i++) {
      questao.opcoes[i] = questao.opcoes[i + 1];
    }
    questao.opcoes.pop();
  }

  /**
   *
   * @description Copia o link do formulário
   */
  public copiarLink(): void {
    navigator.clipboard.writeText(this.respostaCriarFormulario.url);
    this.toast.add({
      severity: 'success',
      summary: 'Sucesso',
      life: 1000,
      detail: 'Link copiado com sucesso!',
    });
  }

  /**
   *
   * @description Acessa o formulário via Link
   */
  public acessarFormulario(): void {
    if (!this.respostaCriarFormulario || !this.respostaCriarFormulario.url)
      return;
    window.open(this.respostaCriarFormulario.url, '_blank');
  }

  /**
   *
   * @description Acessa o formulário manualmente
   */
  public acessarFormularioManualmente(): void {
    const urlPadrao: string = `https://docs.google.com/forms/d/e/${this.respostaCriarFormulario.formId}/viewform`;
    window.open(urlPadrao, '_blank');
  }
}
