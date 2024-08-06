import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Immobilier } from './immobilier';
import { User } from './user';
import { Document } from './document';
import { Intervention } from './intervention';
import { AbonnementList } from './abonnement';

@Entity()
export class Devis {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Immobilier, immobilier => immobilier.devis)
  immobilier: Immobilier;

  @ManyToOne(() => User, user => user.devis)
  user: User; // Correspond au loueur

  @OneToMany(() => Document, document => document.devis)
  document: Document[];

  @OneToMany(() => Intervention, intervention => intervention.devis)
  interventions: Intervention[];

  @Column()
  date: Date;

  @Column('json')
  content: {
    startDate: Date;
    endDate: Date;
    price: number;
    cautions: number;
    abonnement: AbonnementList;
    reduction?: number; // Utilisation optionnelle du champ réduction
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(
    id: number,
    name: string,
    immobilier: Immobilier,
    user: User,
    document: Document[],
    interventions: Intervention[],
    date: Date,
    content: {
      startDate: Date;
      endDate: Date;
      price: number;
      cautions: number;
      abonnement: AbonnementList;
      reduction?: number;
    },
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.name = name;
    this.immobilier = immobilier;
    this.user = user;
    this.document = document;
    this.interventions = interventions;
    this.date = date;
    this.content = content;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
