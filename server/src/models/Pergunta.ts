import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Tipo_Pergunta } from "./Tipo_Pergunta";
import { Formulario } from "./Formulario";
import { Alternativa } from "./Alternativa";

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

  @OneToMany(() => Alternativa, (alt) => alt.Pergunta)
  Alternativas!: Alternativa[];

  @Column({ type: "text", nullable: true })
  UrlImagem!: string;

  @Column({ type: "text", nullable: true })
  DescricaoImagem!: string;
}
