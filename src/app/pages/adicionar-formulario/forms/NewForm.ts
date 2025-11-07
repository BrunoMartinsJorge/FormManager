import { NewQuest } from "./NewQuest";

export interface NewForm {
    titulo: string;
    descricao: string;
    questoes: NewQuest[];
}