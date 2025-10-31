"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormulariosListaDto = void 0;
class FormulariosListaDto {
    constructor(formulario) {
        this.idFormulario = formulario.idFormulario;
        this.titulo = formulario.Titulo;
        this.descricao = formulario.Descricao;
        this.dataCriacao = formulario.Data_Criacao;
        this.linkUrl = formulario.Link_Url;
        this.formId = formulario.formId;
        this.email = formulario.email;
        this.publicado = formulario.publicado;
    }
    static convert(formulario) {
        return new FormulariosListaDto(formulario);
    }
}
exports.FormulariosListaDto = FormulariosListaDto;
