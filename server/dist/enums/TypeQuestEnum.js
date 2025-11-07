"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tiposParaGraficos = exports.TypeQuestEnum = void 0;
exports.getTypeQuestLabel = getTypeQuestLabel;
var TypeQuestEnum;
(function (TypeQuestEnum) {
    TypeQuestEnum["TEXTO"] = "TEXTO";
    TypeQuestEnum["PARAGRAFO"] = "PARAGRAFO";
    TypeQuestEnum["UNICA"] = "UNICA";
    TypeQuestEnum["MULTIPLA"] = "MULTIPLA";
    TypeQuestEnum["DATA"] = "DATA";
    TypeQuestEnum["ESCALA"] = "ESCALA";
    TypeQuestEnum["IMAGEM"] = "IMAGEM";
    TypeQuestEnum["TEMPO"] = "TEMPO";
    TypeQuestEnum["PONTUACAO"] = "PONTUACAO";
})(TypeQuestEnum || (exports.TypeQuestEnum = TypeQuestEnum = {}));
function getTypeQuestLabel(type) {
    switch (type) {
        case TypeQuestEnum.TEXTO:
            return 'Texto curto';
        case TypeQuestEnum.UNICA:
            return 'Única escolha';
        case TypeQuestEnum.MULTIPLA:
            return 'Múltipla escolha';
        case TypeQuestEnum.DATA:
            return 'Data';
        case TypeQuestEnum.ESCALA:
            return 'Escala';
        case TypeQuestEnum.PARAGRAFO:
            return 'Parágrafo';
        case TypeQuestEnum.IMAGEM:
            return 'Imagem';
        case TypeQuestEnum.TEMPO:
            return 'Tempo';
        case TypeQuestEnum.PONTUACAO:
            return 'Pontuação';
        default:
            return 'Desconhecido';
    }
}
exports.tiposParaGraficos = [
    TypeQuestEnum.UNICA,
    TypeQuestEnum.MULTIPLA,
    TypeQuestEnum.ESCALA,
    TypeQuestEnum.PONTUACAO,
];
