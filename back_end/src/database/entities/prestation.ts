import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Intervention } from './intervention';
import { User } from './user';
import { Notation } from './notation';
import { InterventionPrestation } from './interventionPrestation';

@Entity()
export class Prestation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  description: string;

  @Column('decimal')
  cost: number;

  @Column()
  date: Date;

  @Column()
  exploratorOnly: boolean;

  @OneToMany(() => Notation, notation => notation.prestation)
  notations?: Notation[];

  @OneToMany(() => InterventionPrestation, interventionPrestation => interventionPrestation.prestation)
  interventionPrestations: InterventionPrestation[];

  @ManyToOne(() => User, prestataire => prestataire.prestations)
  prestataire: User;

  constructor(
    id: number,
    type: string,
    description: string,
    cost: number,
    date: Date,
    exploratorOnly: boolean,
    interventionPrestations: InterventionPrestation[],
    prestataire: User,
    notations?: Notation[]
  ) {
    this.id = id;
    this.type = type;
    this.description = description;
    this.cost = cost;
    this.date = date;
    this.exploratorOnly = exploratorOnly;
    this.notations = notations;
    this.interventionPrestations = interventionPrestations;
    this.prestataire = prestataire;
  }
}
