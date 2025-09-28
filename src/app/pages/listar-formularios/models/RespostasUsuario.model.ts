import { Questao } from "./Questao.model";
import { Resposta } from "./Resposta.model";

export interface RespostasUsuario {
    idQuestao: string;
    questao: Questao;
    resposta: Resposta;
}