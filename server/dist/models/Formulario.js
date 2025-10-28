"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Formulario = void 0;
const typeorm_1 = require("typeorm");
const Pergunta_1 = require("./Pergunta");
let Formulario = class Formulario {
};
exports.Formulario = Formulario;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Formulario.prototype, "idFormulario", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 75 }),
    __metadata("design:type", String)
], Formulario.prototype, "Titulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Formulario.prototype, "Descricao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], Formulario.prototype, "Data_Criacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Formulario.prototype, "Link_Url", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Formulario.prototype, "formId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Pergunta_1.Pergunta, (pergunta) => pergunta.Formulario),
    __metadata("design:type", Array)
], Formulario.prototype, "Perguntas", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Formulario.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Formulario.prototype, "publicado", void 0);
exports.Formulario = Formulario = __decorate([
    (0, typeorm_1.Entity)()
], Formulario);
