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
exports.Alternativa_Pergunta = void 0;
const typeorm_1 = require("typeorm");
const Pergunta_1 = require("./Pergunta");
let Alternativa_Pergunta = class Alternativa_Pergunta {
};
exports.Alternativa_Pergunta = Alternativa_Pergunta;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Alternativa_Pergunta.prototype, "idAlternativa", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Pergunta_1.Pergunta, (pergunta) => pergunta.Alternativas, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Pergunta_1.Pergunta)
], Alternativa_Pergunta.prototype, "Pergunta", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], Alternativa_Pergunta.prototype, "Texto", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Alternativa_Pergunta.prototype, "Correta", void 0);
exports.Alternativa_Pergunta = Alternativa_Pergunta = __decorate([
    (0, typeorm_1.Entity)()
], Alternativa_Pergunta);
