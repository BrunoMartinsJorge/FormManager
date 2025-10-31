import { Formulario } from "../Formulario";

export class FormulariosListaDto {
  idFormulario: number;
  titulo: string;
  descricao: string;
  dataCriacao: Date;
  linkUrl: string;
  formId: string;
  email: string;
  publicado: boolean;

  constructor(
    formulario: Formulario
  ) {
    this.idFormulario = formulario.idFormulario;
    this.titulo = formulario.Titulo;
    this.descricao = formulario.Descricao;
    this.dataCriacao = formulario.Data_Criacao;
    this.linkUrl = formulario.Link_Url;
    this.formId = formulario.formId;
    this.email = formulario.email;
    this.publicado = formulario.publicado;
  }

  public static convert(formulario: Formulario): FormulariosListaDto {
    return new FormulariosListaDto(formulario);
  }
}
