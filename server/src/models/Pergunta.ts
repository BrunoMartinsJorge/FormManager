import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Tipo_Pergunta } from "./Tipo_Pergunta";
import { Formulario } from "./Formulario";
import { Alternativa_Pergunta } from "./Alternativa_Pergunta";

@Entity()
export class Pergunta {
  @PrimaryGeneratedColumn()
  idPergunta!: number;

  @ManyToOne(() => Tipo_Pergunta, (tipo) => tipo.Perguntas)
  Tipo_Pergunta!: Tipo_Pergunta;

  @ManyToOne(() => Formulario, (formulario) => formulario.Perguntas)
  @JoinColumn({ name: "idFormulario" })
  Formulario!: Formulario | null;

  @Column({ length: 255 })
  Titulo!: string;

  @Column({ default: false })
  Favorita!: boolean;

  @OneToMany(() => Alternativa_Pergunta, (alt) => alt.Pergunta)
  Alternativas!: Alternativa_Pergunta[];

  @Column({ type: "text", nullable: true })
  UrlImagem!: string;

  @Column({ type: "text", nullable: true })
  DescricaoImagem!: string;
}
