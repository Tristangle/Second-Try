import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Prestation } from './prestation';
import { Immobilier } from './immobilier';
import { Facture } from './facture';
import { Devis } from './devis';
import { Document } from './document';
import { InterventionPrestation } from './interventionPrestation';

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

  @OneToMany(() => InterventionPrestation, interventionPrestation => interventionPrestation.intervention)
  interventionPrestations: InterventionPrestation[];

  @ManyToOne(() => Immobilier, immobilier => immobilier.interventions)
  immobilier: Immobilier;

  @ManyToOne(() => Facture, facture => facture.intervention, { nullable: true })
  facture?: Facture;

  @ManyToOne(() => Devis, devis => devis.interventions, { nullable: true })
  devis?: Devis;

  @OneToMany(() => Document, document => document.intervention)
  documents: Document[];

  @Column('decimal',{ precision: 10, scale: 2 })
  price: number;

  @Column({default: false})
  paye: boolean;

  @Column({nullable: true})
  paymentSessionId: string; 

  constructor(
    id: number,
    name: string,
    dateDebut: Date,
    dateFin: Date,
    interventionPrestations: InterventionPrestation[],
    immobilier: Immobilier,
    facture: Facture,
    devis: Devis,
    documents: Document[],
    price: number,
    paye: boolean,
    paymentSessionId: string
  ) {
    this.id = id;
    this.name = name;
    this.dateDebut = dateDebut;
    this.dateFin = dateFin;
    this.interventionPrestations = interventionPrestations;
    this.immobilier = immobilier;
    this.facture = facture;
    this.devis = devis;
    this.documents = documents;
    this.price = price;
    this.paye = paye;
    this.paymentSessionId = paymentSessionId;
  }
}
