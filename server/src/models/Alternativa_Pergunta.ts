import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Pergunta } from "./Pergunta";

@Entity()
export class Alternativa_Pergunta {
  @PrimaryGeneratedColumn()
  idAlternativa!: number;

  @ManyToOne(() => Pergunta, (pergunta) => pergunta.Alternativas, {
    onDelete: "CASCADE",
  })
  Pergunta!: Pergunta;

  @Column({ type: "text" })
  Texto!: string;

  @Column({ default: false })
  Correta!: boolean; // se essa alternativa foi marcada como correta
}
