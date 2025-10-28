export interface ListaQuizDto {
    questoes: Questoes_Quiz[];
    respostas: Respostas_Quiz[];
}

export interface Questoes_Quiz {
    id: string;
    titulo: string;
    tipo: string;
    opcaoCorreta: string | null;
    valor: number;
}

export interface Respostas_Quiz {
    idResposta: string;
    dataEnviada: string;
    respostas: any[];
    totalScore: number;
}