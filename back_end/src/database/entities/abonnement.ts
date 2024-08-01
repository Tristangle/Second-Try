import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './user';
import { UserAbonnement } from './userAbonnement';

export enum AbonnementStatus {
    Active = "Active",
    Inactive = "Inactive",
    Delete = "Delete"  
}
@Entity()
export class Abonnement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('decimal')
  price: number;

  @Column()
  duration: number; 

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({
    type: "enum",
    enum: AbonnementStatus,
    default: AbonnementStatus.Active
  })
  status: AbonnementStatus;

  @Column('json')
  benefits: {
    type: string; // Type d'avantage, par exemple "discount", "freeService", "vipAccess"
    description: string; // Description de l'avantage
    value?: number; // Valeur numérique de l'avantage, par exemple le pourcentage de réduction ou le nombre de prestations gratuites
  }[];


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserAbonnement, userAbonnement => userAbonnement.abonnement)
  userAbonnement: UserAbonnement[];
  
  constructor(
    id:number,
    name:string,
    description:string,
    price:number,
    duration:number,
    startDate:Date,
    endDate:Date,
    status:AbonnementStatus,
    benefits: {
        type: string;
        description: string; 
        value?: number | undefined; 
    }[],
    createdAt:Date,
    updatedAt:Date,
    userAbonnement:UserAbonnement[]
  ){
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.duration = duration;
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = status;
    this.benefits = benefits;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.userAbonnement = userAbonnement;
  }
}
