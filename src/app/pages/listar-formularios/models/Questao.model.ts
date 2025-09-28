export interface Questao {
  id: string;
  titulo: string;
  tipo: string;
  opcoes?: string[]; // só se for choiceQuestion
}