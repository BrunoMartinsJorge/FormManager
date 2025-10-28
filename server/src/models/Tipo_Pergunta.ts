import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Pergunta } from "./Pergunta";

@Entity()
export class Tipo_Pergunta {
  @PrimaryGeneratedColumn()
  idTipo_Pergunta!: number;

  @Column({ type: "text" })
  Descricao!: string;

  @OneToMany(() => Pergunta, (pergunta) => pergunta.Tipo_Pergunta)
  Perguntas!: Pergunta[];
}
