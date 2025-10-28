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
exports.Questao = void 0;
const typeorm_1 = require("typeorm");
const Alternativa_1 = require("./Alternativa");
const Tipo_Pergunta_1 = require("./Tipo_Pergunta");
const Quiz_1 = require("./Quiz");
let Questao = class Questao {
};
exports.Questao = Questao;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Questao.prototype, "idPergunta", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Tipo_Pergunta_1.Tipo_Pergunta, (tipo) => tipo.Perguntas),
    __metadata("design:type", Tipo_Pergunta_1.Tipo_Pergunta)
], Questao.prototype, "Tipo_Pergunta", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Quiz_1.Quiz, (form) => form.Perguntas),
    __metadata("design:type", Quiz_1.Quiz)
], Questao.prototype, "Quiz", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Questao.prototype, "Titulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Questao.prototype, "Descricao", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Alternativa_1.Alternativa, (alt) => alt.Pergunta),
    __metadata("design:type", Array)
], Questao.prototype, "Alternativas", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Alternativa_1.Alternativa, (alt) => alt.Pergunta),
    __metadata("design:type", Alternativa_1.Alternativa)
], Questao.prototype, "Correta", void 0);
exports.Questao = Questao = __decorate([
    (0, typeorm_1.Entity)()
], Questao);
