import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user';
import { Document } from './document';
import { Immobilier } from './immobilier';
import { Intervention } from './intervention';

export enum TauxTVA {
  TVA5 = '5%',
  TVA10 = '10%',
  TVA20 = '20%'
}

@Entity()
export class Facture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Immobilier, immobilier => immobilier.factures, { nullable: true })
  immobilier?: Immobilier;

  @ManyToOne(() => Intervention, intervention => intervention.facture, { nullable: true })
  intervention?: Intervention;

  @ManyToOne(() => User, user => user.facturesEmises)
  emetteur: User;

  @ManyToOne(() => User, user => user.facturesRecues, {nullable: true, onDelete: 'SET NULL'})
  receveur: User | null;

  @CreateDateColumn()
  date: Date;

  @OneToMany(() => Document, document => document.facture)
  documents: Document[];

  @Column()
  emailEmetteur: string;

  @Column()
  adresseEmetteur: string;

  @Column('json')
  content: {
    quantite: number;
    designation: string;
    tauxTVA: TauxTVA;
    prixUnitaire: number;
    totalHT: number;
    totalTTC: number;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  constructor(
    id:number,
    name:string,
    emetteur: User,
    receveur: User,
    date: Date,
    documents: Document[],
    emailEmetteur: string,
    adresseEmetteur: string,
    content:{
        quantite: number;
        designation: string;
        tauxTVA: TauxTVA;
        prixUnitaire: number;
        totalHT: number;
        totalTTC: number;
      }[],
    createdAt: Date,
    updatedAt: Date,
    immobilier?: Immobilier,
    intervention?: Intervention,
  ){
    this.id = id;
    this.name = name;
    this.emetteur = emetteur;
    this.receveur = receveur;
    this.date = date;
    this.documents = documents;
    this.emailEmetteur = emailEmetteur;
    this.adresseEmetteur = adresseEmetteur;
    this.content = content;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.immobilier = immobilier;
    this.intervention = intervention;

  }
}
