import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Pergunta } from "./Pergunta";
import { Questao } from "./Questao";

@Entity()
export class Quiz {
  @PrimaryGeneratedColumn()
  idQuiz!: number;

  @Column({ length: 75 })
  Titulo!: string;

  @Column({ type: "text", nullable: true })
  Descricao!: string;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  Data_Criacao!: Date;

  @Column({ nullable: true })
  Link_Url!: string;

  @Column({ nullable: true })
  quizId!: string;

  @OneToMany(() => Pergunta, (pergunta) => pergunta.Formulario)
  Questoes!: Questao[];

  @Column({ type: "text", nullable: true })
  email!: string;
}
