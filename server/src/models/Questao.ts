import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { Tipo_Pergunta } from './Tipo_Pergunta';
import { Quiz } from './Quiz';
import { Alternativa_Questao } from './Alternativa_Questao';
import { Tipo_Questao } from './Tipo_Questao';

@Entity()
export class Questao {
  @PrimaryGeneratedColumn()
  idQuestao!: number;

  @ManyToOne(() => Tipo_Questao, (tipo) => tipo.Questoes)
  Tipo_Questao!: Tipo_Questao;

  @ManyToOne(() => Quiz, (form) => form.Questoes)
  @JoinColumn({ name: 'idQuiz' })
  Quiz!: Quiz | null;

  @Column({ length: 255 })
  Titulo!: string;

  @OneToMany(() => Alternativa_Questao, (alt) => alt.Questao, { cascade: true })
  Alternativas!: Alternativa_Questao[];

  @ManyToMany(() => Alternativa_Questao)
  @JoinTable({
    name: 'questao_alternativas_corretas',
    joinColumn: { name: 'questaoId', referencedColumnName: 'idQuestao' },
    inverseJoinColumn: {
      name: 'alternativaId',
      referencedColumnName: 'idAlternativa',
    },
  })
  AlternativasCorretas!: Alternativa_Questao[];

  @Column({ default: false })
  Favorita!: boolean;

  @Column({ type: 'text', nullable: true })
  UrlImagem!: string;

  @Column({ type: 'text', nullable: true })
  DescricaoImagem!: string;

  @Column({ default: 0, nullable: true, type: 'int' })
  Pontuacao!: number;

  @Column({ type: 'text', nullable: true })
  FeedbackCorreto!: string;

  @Column({ type: 'text', nullable: true })
  FeedbackErrado!: string;

  @Column({ type: 'int', nullable: true })
  low!: number;

  @Column({ type: 'int', nullable: true })
  high!: number;
}
