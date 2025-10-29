import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Questao } from "./Questao";

@Entity()
export class Alternativa_Questao {
  @PrimaryGeneratedColumn()
  idAlternativa!: number;

  @ManyToOne(() => Questao, (questao) => questao.Alternativas, {
    onDelete: "CASCADE",
  })
  Questao!: Questao;

  @Column({ type: "text" })
  Texto!: string;
}
