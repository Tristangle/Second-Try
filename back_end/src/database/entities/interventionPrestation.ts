import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Intervention } from './intervention';
import { Prestation } from './prestation';

@Entity()
export class InterventionPrestation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Intervention, intervention => intervention.interventionPrestations)
  intervention: Intervention;

  @ManyToOne(() => Prestation, prestation => prestation.interventionPrestations)
  prestation: Prestation;

  @Column('decimal')
  cost: number;

  // Vous pouvez ajouter d'autres colonnes spécifiques à cette relation ici, comme la quantité, les notes, etc.

  constructor(id: number, intervention: Intervention, prestation: Prestation, cost: number) {
    this.id = id;
    this.intervention = intervention;
    this.prestation = prestation;
    this.cost = cost;
  }
}
