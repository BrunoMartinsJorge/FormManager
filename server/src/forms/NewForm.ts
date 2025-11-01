export interface NewQuiz {
    titulo: string;
    descricao: string;
    questoes: QuestQuiz[];
}

export interface QuestQuiz{
    titulo: string;
    tipo: string;
    opcoes?: any[];
    valorCorreto?: any[];
    respostasCorretas?: number[];
    pontos?: number;
    feedbackCorreto?: string;
    feedbackErrado?: string;
}