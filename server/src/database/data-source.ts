import "reflect-metadata";
import { DataSource } from "typeorm";
import path from "path";
import { app as electronApp } from "electron";
import { Formulario } from "../models/Formulario";
import { Tipo_Pergunta } from "../models/Tipo_Pergunta";
import { Pergunta } from "../models/Pergunta";
import { Alternativa } from "../models/Alternativa";
import { Token } from "../models/Token";
import { Quiz } from "../models/Quiz";
import { Questao } from "../models/Questao";

const userDataPath = electronApp.getPath("userData");
const dbPath = path.join(userDataPath, "banco_dados.db");

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: dbPath,
  synchronize: true,
  entities: [
    Formulario,
    Tipo_Pergunta,
    Pergunta,
    Alternativa,
    Token,
    Quiz,
    Questao,
  ],
});
