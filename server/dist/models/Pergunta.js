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
exports.Pergunta = void 0;
const typeorm_1 = require("typeorm");
const Tipo_Pergunta_1 = require("./Tipo_Pergunta");
const Formulario_1 = require("./Formulario");
const Alternativa_1 = require("./Alternativa");
let Pergunta = class Pergunta {
};
exports.Pergunta = Pergunta;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Pergunta.prototype, "idPergunta", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Tipo_Pergunta_1.Tipo_Pergunta, (tipo) => tipo.Perguntas),
    __metadata("design:type", Tipo_Pergunta_1.Tipo_Pergunta)
], Pergunta.prototype, "Tipo_Pergunta", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Formulario_1.Formulario, (formulario) => formulario.Perguntas),
    (0, typeorm_1.JoinColumn)({ name: "idFormulario" }),
    __metadata("design:type", Object)
], Pergunta.prototype, "Formulario", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Pergunta.prototype, "Titulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Pergunta.prototype, "Favorita", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Alternativa_1.Alternativa, (alt) => alt.Pergunta),
    __metadata("design:type", Array)
], Pergunta.prototype, "Alternativas", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Pergunta.prototype, "UrlImagem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Pergunta.prototype, "DescricaoImagem", void 0);
exports.Pergunta = Pergunta = __decorate([
    (0, typeorm_1.Entity)()
], Pergunta);
