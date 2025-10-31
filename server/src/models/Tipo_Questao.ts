import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Questao } from "./Questao";

@Entity()
export class Tipo_Questao {
  @PrimaryGeneratedColumn()
  idTipo_Pergunta!: number;

  @Column({ type: 'text' })
  Descricao!: string;

  @OneToMany(() => Questao, (questao) => questao.Tipo_Questao)
  Questoes!: Questao[];
}
