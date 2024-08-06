import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Token } from './token';
import { Role } from './role';
import { Abonnement } from './abonnement';
import { Document } from './document';
import 'reflect-metadata';
import { UserAbonnement } from './userAbonnement';
import { Facture } from './facture';
import { Immobilier } from './immobilier';
import { Inspection } from './inspection';
import { Prestation } from './prestation';
import { Reservation } from './reservation';
import { Devis } from './devis';
import { UserDocument } from './userDocument';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Token, token => token.user)
  token: Token[];

  @ManyToOne(() => Role, role => role.users, { eager: true })
  role: Role;

  @OneToMany(() => Document, document => document.createdBy)
  documents: Document[];

  @OneToMany(() => Facture, facture => facture.emetteur)
  facturesEmises: Facture[];

  @OneToMany(() => Facture, facture => facture.receveur)
  facturesRecues: Facture[];

  @OneToMany(() => Immobilier, immobilier => immobilier.owner)
  ownedProperties: Immobilier[];

  @OneToMany(() => Immobilier, immobilier => immobilier.renter)
  rentedProperties: Immobilier[];

  @OneToMany(() => Inspection, inspection => inspection.inspector)
  inspectionsAsInspector: Inspection[];

  @OneToMany(() => Inspection, inspection => inspection.renter)
  inspectionsAsRenter: Inspection[];

  @OneToMany(() => Prestation, prestation => prestation.prestataire)
  prestations: Prestation[];

  @OneToMany(() => Reservation, reservation => reservation.reserveur)
  reservations: Reservation[];

  @OneToMany(() => Devis, devis => devis.user)
  devis: Devis[];

  @OneToMany(() => UserAbonnement, userAbonnement => userAbonnement.user)
  userAbonnement: UserAbonnement[];

  @OneToMany(() => UserDocument, userDocument => userDocument.user)
  userDocuments: UserDocument[];

  constructor(
    id: number,
    username: string,
    email: string,
    password: string,
    token: Token[],
    role: Role,
    documents: Document[],
    facturesEmises: Facture[],
    facturesRecues: Facture[],
    ownedProperties: Immobilier[],
    rentedProperties: Immobilier[],
    inspectionsAsInspector: Inspection[],
    inspectionsAsRenter: Inspection[],
    prestations: Prestation[],
    reservations: Reservation[],
    devis: Devis[],
    userAbonnement: UserAbonnement[],
    userDocuments: UserDocument[]
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.token = token;
    this.role = role;
    this.documents = documents;
    this.facturesEmises = facturesEmises;
    this.facturesRecues = facturesRecues;
    this.ownedProperties = ownedProperties;
    this.rentedProperties = rentedProperties;
    this.inspectionsAsInspector = inspectionsAsInspector;
    this.inspectionsAsRenter = inspectionsAsRenter;
    this.prestations = prestations;
    this.reservations = reservations;
    this.devis = devis;
    this.userAbonnement = userAbonnement;
    this.userDocuments = userDocuments;
  }
}
