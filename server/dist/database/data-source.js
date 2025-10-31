"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const Formulario_1 = require("../models/Formulario");
const Tipo_Pergunta_1 = require("../models/Tipo_Pergunta");
const Pergunta_1 = require("../models/Pergunta");
const Alternativa_Questao_1 = require("../models/Alternativa_Questao");
const Alternativa_Pergunta_1 = require("../models/Alternativa_Pergunta");
const Token_1 = require("../models/Token");
const Quiz_1 = require("../models/Quiz");
const Questao_1 = require("../models/Questao");
const Tipo_Questao_1 = require("../models/Tipo_Questao");
const userDataPath = electron_1.app.getPath("userData");
const dbPath = path_1.default.join(userDataPath, "banco_dados.db");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "better-sqlite3",
    database: dbPath,
    synchronize: true,
    entities: [
        Formulario_1.Formulario,
        Tipo_Pergunta_1.Tipo_Pergunta,
        Tipo_Questao_1.Tipo_Questao,
        Pergunta_1.Pergunta,
        Alternativa_Pergunta_1.Alternativa_Pergunta,
        Alternativa_Questao_1.Alternativa_Questao,
        Token_1.Token,
        Quiz_1.Quiz,
        Questao_1.Questao,
    ],
});
console.log("Uso: ", exports.AppDataSource.options.database);
