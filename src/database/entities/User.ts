import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Reserve } from "./Reserve";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  cpf!: string;

  @Column()
  birth!: Date;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column()
  qualified!: boolean;

  @Column()
  cep!: string;

  @Column()
  neighborhood!: string;

  @Column()
  street!: string;

  @Column()
  complement!: string;

  @Column()
  city!: string;

  @Column()
  uf!: string;

  @OneToMany(() => Reserve, (reserve) => reserve.userId)
  reserves!: Reserve[];
}
