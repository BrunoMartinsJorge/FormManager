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
const Quiz_1 = require("./Quiz");
const Alternativa_Questao_1 = require("./Alternativa_Questao");
const Tipo_Questao_1 = require("./Tipo_Questao");
let Questao = class Questao {
};
exports.Questao = Questao;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Questao.prototype, "idQuestao", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Tipo_Questao_1.Tipo_Questao, (tipo) => tipo.Questoes),
    __metadata("design:type", Tipo_Questao_1.Tipo_Questao)
], Questao.prototype, "Tipo_Questao", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Quiz_1.Quiz, (form) => form.Questoes),
    (0, typeorm_1.JoinColumn)({ name: 'idQuiz' }),
    __metadata("design:type", Object)
], Questao.prototype, "Quiz", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Questao.prototype, "Titulo", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Alternativa_Questao_1.Alternativa_Questao, (alt) => alt.Questao, { cascade: true }),
    __metadata("design:type", Array)
], Questao.prototype, "Alternativas", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Alternativa_Questao_1.Alternativa_Questao),
    (0, typeorm_1.JoinTable)({
        name: 'questao_alternativas_corretas',
        joinColumn: { name: 'questaoId', referencedColumnName: 'idQuestao' },
        inverseJoinColumn: {
            name: 'alternativaId',
            referencedColumnName: 'idAlternativa',
        },
    }),
    __metadata("design:type", Array)
], Questao.prototype, "AlternativasCorretas", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Questao.prototype, "Favorita", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Questao.prototype, "UrlImagem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Questao.prototype, "DescricaoImagem", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, nullable: true, type: 'int' }),
    __metadata("design:type", Number)
], Questao.prototype, "Pontuacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Questao.prototype, "FeedbackCorreto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Questao.prototype, "FeedbackErrado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Questao.prototype, "low", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Questao.prototype, "high", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Questao.prototype, "startLabel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Questao.prototype, "endLabel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true }),
    __metadata("design:type", Boolean)
], Questao.prototype, "anos", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true }),
    __metadata("design:type", Boolean)
], Questao.prototype, "tempo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], Questao.prototype, "nivelPontuacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Questao.prototype, "iconPontuacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true }),
    __metadata("design:type", Boolean)
], Questao.prototype, "obrigatorio", void 0);
exports.Questao = Questao = __decorate([
    (0, typeorm_1.Entity)()
], Questao);
