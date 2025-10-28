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
exports.Alternativa = void 0;
const typeorm_1 = require("typeorm");
const Pergunta_1 = require("./Pergunta");
const Questao_1 = require("./Questao");
let Alternativa = class Alternativa {
};
exports.Alternativa = Alternativa;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Alternativa.prototype, "idAlternativa", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Pergunta_1.Pergunta, (pergunta) => pergunta.Alternativas),
    __metadata("design:type", Pergunta_1.Pergunta)
], Alternativa.prototype, "Pergunta", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Questao_1.Questao, (questao) => questao.Alternativas),
    __metadata("design:type", Questao_1.Questao)
], Alternativa.prototype, "Questao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], Alternativa.prototype, "Texto", void 0);
exports.Alternativa = Alternativa = __decorate([
    (0, typeorm_1.Entity)()
], Alternativa);
