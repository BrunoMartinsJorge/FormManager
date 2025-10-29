export class NewQuestQuizSaved {
    titulo: string;
    tipo: string;
    opcoes?: string[];
    favorita: boolean;
    respostasCorretas?: number[];
    pontos?: number;
    feedbackCorreto?: string;
    feedbackErrado?: string;

    constructor(
        titulo: string,
        tipo: string,
        favorita: boolean,
        opcoes?: string[],
        respostasCorretas?: number[],
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