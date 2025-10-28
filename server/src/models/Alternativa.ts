import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Pergunta } from "./Pergunta";
import { Questao } from "./Questao";

@Entity()
export class Alternativa {
  @PrimaryGeneratedColumn()
  idAlternativa!: number;

  @ManyToOne(() => Pergunta, (pergunta) => pergunta.Alternativas)
  Pergunta!: Pergunta;

  @ManyToOne(() => Questao, (questao) => questao.Alternativas)
  Questao!: Questao;

  @Column({ type: "text" })
  Texto!: string;
}
