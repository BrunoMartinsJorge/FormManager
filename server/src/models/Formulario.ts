import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Pergunta } from "./Pergunta";

@Entity()
export class Formulario {
  @PrimaryGeneratedColumn()
  idFormulario!: number;

  @Column({ length: 75 })
  Titulo!: string;

  @Column({ type: "text", nullable: true })
  Descricao!: string;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  Data_Criacao!: Date;

  @Column({ nullable: true })
  Link_Url!: string;

  @Column({ nullable: true })
  formId!: string;

  @OneToMany(() => Pergunta, (pergunta) => pergunta.Formulario)
  Perguntas!: Pergunta[];

  @Column({type: "text", nullable: true})
  email!: string;

  @Column({type: "boolean", default: false})
  publicado!: boolean;
}
