import { NewQuest } from './NewQuest';

export interface NewQuestQuiz extends NewQuest {
  pontos?: number;
  feedbackCorreto?: string;
  feedbackErrado?: string;
  valorCorreto?: string[];
  respostasCorretas?: number[];
}
