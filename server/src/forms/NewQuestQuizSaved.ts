export class NewQuestQuizSaved {
    titulo: string;
    tipo: string;
    opcoes?: OpcaoDaQuestao[];
    favorita: boolean;
    respostasCorretas?: OpcaoDaQuestao[];
    pontos?: number;
    feedbackCorreto?: string;
    feedbackErrado?: string;

    constructor(
        titulo: string,
        tipo: string,
        favorita: boolean,
        opcoes?: OpcaoDaQuestao[],
        respostasCorretas?: OpcaoDaQuestao[],
        pontos?: number,
        feedbackCorreto?: string,
        feedbackErrado?: string
    ) {
        this.titulo = titulo;
        this.tipo = tipo;
        this.favorita = favorita;
        this.opcoes = opcoes || [];
        this.respostasCorretas = respostasCorretas || [];
        this.pontos = pontos;
        this.feedbackCorreto = feedbackCorreto;
        this.feedbackErrado = feedbackErrado;
    }
}

export class OpcaoDaQuestao {
    idAlternativa?: number | null;
    texto: string;

    constructor(texto: string, idAlternativa?: number | null) {
        this.texto = texto;
        this.idAlternativa = idAlternativa;
    }
}