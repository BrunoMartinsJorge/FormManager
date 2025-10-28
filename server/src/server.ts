import express from "express";
import cors from "cors";
import routes from "./routes";
import { AppDataSource } from "./database/data-source";

const expressApp = express();
const expressPort = 3000;

expressApp.use(cors());
expressApp.use(express.json());
expressApp.use(routes);

export async function startExpress(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log("📦 Banco de dados inicializado com sucesso!");

    expressApp.listen(expressPort, () => {
      console.log(`🚀 Servidor Express iniciado na porta ${expressPort}`);
    });
  } catch (err) {
    console.error("❌ Erro ao iniciar servidor:", err);
  }
}
