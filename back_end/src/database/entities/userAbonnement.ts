import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user';
import { Abonnement } from './abonnement';

export enum UserAbonnementStatus {
  Active = "Active",
  Inactive = "Inactive",
  Delete = "Delete"
}

@Entity()
export class UserAbonnement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.userAbonnement)
  user: User;

  @ManyToOne(() => Abonnement, abonnement => abonnement.userAbonnement)
  abonnement: Abonnement;

  @Column({
    type: "enum",
    enum: UserAbonnementStatus,
    default: UserAbonnementStatus.Active
  })
  status: UserAbonnementStatus;

  @Column()
  startDate: Date;

  @Column({nullable:true})
  endDate: Date;

  constructor(
    id: number,
    user: User,
    abonnement: Abonnement,
    status: UserAbonnementStatus,
    startDate: Date,
    endDate: Date
  ) {
    this.id = id;
    this.user = user;
    this.abonnement = abonnement;
    this.status = status;
    this.startDate = startDate;
    this.endDate = endDate;
  }
}
