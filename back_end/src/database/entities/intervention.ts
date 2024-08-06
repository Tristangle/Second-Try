import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Prestation } from './prestation';
import { Immobilier } from './immobilier';
import { Facture } from './facture';
import { Devis } from './devis';
import { Document } from './document';

@Entity()
export class Intervention {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  dateDebut: Date;

  @UpdateDateColumn()
  dateFin: Date;

  @OneToMany(() => Prestation, prestation => prestation.intervention)
  prestations: Prestation[];

  @ManyToOne(() => Immobilier, immobilier => immobilier.interventions)
  immobilier: Immobilier;

  @ManyToOne(() => Facture, facture => facture.intervention, { nullable: true })
  facture?: Facture;

  @ManyToOne(() => Devis, devis => devis.interventions, { nullable: true })
  devis?: Devis;

  @OneToMany(() => Document, document => document.intervention)
  documents: Document[];

  @Column('decimal')
  price: number;

  constructor(
    id: number,
    name: string,
    dateDebut: Date,
    dateFin: Date,
    prestations: Prestation[],
    immobilier: Immobilier,
    facture: Facture,
    devis: Devis,
    documents: Document[],
    price: number
  ) {
    this.id = id;
    this.name = name;
    this.dateDebut = dateDebut;
    this.dateFin = dateFin;
    this.prestations = prestations;
    this.immobilier = immobilier;
    this.facture = facture;
    this.devis = devis;
    this.documents = documents;
    this.price = price;
  }
}
