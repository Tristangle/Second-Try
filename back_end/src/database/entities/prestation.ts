import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Intervention } from './intervention';
import { User } from './user';

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

  @ManyToOne(() => Intervention, intervention => intervention.prestations)
  intervention: Intervention;

  @ManyToOne(() => User, prestataire => prestataire.prestations)
  prestataire: User;

  constructor(
    id: number,
    type: string,
    description: string,
    cost: number,
    date: Date,
    intervention: Intervention,
    prestataire: User
  ) {
    this.id = id;
    this.type = type;
    this.description = description;
    this.cost = cost;
    this.date = date;
    this.intervention = intervention;
    this.prestataire = prestataire;
  }
}
