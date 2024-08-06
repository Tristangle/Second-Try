import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user';
import { Document } from './document';
import { Immobilier } from './immobilier';

@Entity()
export class Inspection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  dateDebut: Date;

  @UpdateDateColumn()
  dateFin: Date;

  @ManyToOne(() => Immobilier, immobilier => immobilier.inspections)
  immobilier: Immobilier;

  @ManyToOne(() => User, user => user.inspectionsAsInspector)
  inspector: User;

  @ManyToOne(() => User, user => user.inspectionsAsRenter)
  renter: User;

  @Column()
  validation: boolean;

  @Column()
  details: string;

  @OneToMany(() => Document, document => document.inspection)
  documents: Document[];

  constructor(
    id: number,
    name: string,
    dateDebut: Date,
    dateFin: Date,
    immobilier: Immobilier,
    inspector: User,
    renter: User,
    validation: boolean,
    details: string,
    documents: Document[]
  ) {
    this.id = id;
    this.name = name;
    this.dateDebut = dateDebut;
    this.dateFin = dateFin;
    this.immobilier = immobilier;
    this.inspector = inspector;
    this.renter = renter;
    this.validation = validation;
    this.details = details;
    this.documents = documents;
  }
}
