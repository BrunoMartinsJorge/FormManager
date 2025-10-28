import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  accessToken!: string;

  @Column()
  refreshToken!: string;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "integer" })
  expiryDate!: number;

  @Column({ type: "text", nullable: true })
  email?: string | null;
}
