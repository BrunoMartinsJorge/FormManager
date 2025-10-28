import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, OneToMany } from "typeorm";
import { Alternativa } from "./Alternativa";
import { Formulario } from "./Formulario";
import { Tipo_Pergunta } from "./Tipo_Pergunta";
import { Quiz } from "./Quiz";

@Entity()
export class Questao {
  @PrimaryGeneratedColumn()
  idPergunta!: number;

  @ManyToOne(() => Tipo_Pergunta, (tipo) => tipo.Perguntas)
  Tipo_Pergunta!: Tipo_Pergunta;

  @ManyToOne(() => Quiz, (form) => form.Perguntas)
  Quiz!: Quiz;

  @Column({ length: 255 })
  Titulo!: string;

  @Column({ type: "text", nullable: true })
  Descricao!: string;

  @OneToMany(() => Alternativa, (alt) => alt.Pergunta)
  Alternativas!: Alternativa[];

  @ManyToOne(() => Alternativa, (alt) => alt.Pergunta)
  Correta!: Alternativa;
}