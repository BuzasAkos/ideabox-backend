import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Contact } from "./contact.mysql-entity";

@Entity("training_users", { schema: "mean_pr" })
export class User {
  @PrimaryGeneratedColumn({ type: "int", name: "trus_id" })
  trusId: number;

  @Column("varchar", { name: "user_name", nullable: false, length: 10 })
  userName: string;

  @Column("varchar", { name: "full_name", nullable: false, length: 50 })
  fullName: string;

  @Column("datetime", { name: "cr_date", nullable: true })
  crDate: Date | null;

  @OneToMany(() => Contact, (contact) => contact.user)
  contacts: Contact[];
}
