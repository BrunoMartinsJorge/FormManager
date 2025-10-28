"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startExpress = startExpress;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const data_source_1 = require("./database/data-source");
const expressApp = (0, express_1.default)();
const expressPort = 3000;
expressApp.use((0, cors_1.default)());
expressApp.use(express_1.default.json());
expressApp.use(routes_1.default);
async function startExpress() {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log("📦 Banco de dados inicializado com sucesso!");
        expressApp.listen(expressPort, () => {
            console.log(`🚀 Servidor Express iniciado na porta ${expressPort}`);
        });
    }
    catch (err) {
        console.error("❌ Erro ao iniciar servidor:", err);
    }
}
