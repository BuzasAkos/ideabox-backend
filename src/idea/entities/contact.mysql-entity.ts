import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.mysql-entity";

@Entity("training_contacts", { schema: "mean_pr" })
export class Contact {
  @PrimaryGeneratedColumn({ type: "int", name: "trco_id" })
  trcoId: number;

  @Column("varchar", { name: "contact_type", nullable: false, length: 20 })
  contactType: string;

  @Column("varchar", { name: "email", nullable: false, length: 50 })
  email: string;

  @Column("datetime", { name: "cr_date", nullable: true })
  crDate: Date | null;

  @ManyToOne(() => User, (user) => user.contacts, { eager: false })
  user: User;
}