import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user';
import { Facture } from './facture';
import { Devis } from './devis';
import { Intervention } from './intervention';
import { Reservation } from './reservation';
import { Inspection } from './inspection';
import { Image } from './image';

@Entity()
export class Immobilier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('json')
  content: {
    description: string;
    adresse: string;
  };

  @ManyToOne(() => User, user => user.ownedProperties)
  owner: User;

  @ManyToOne(() => User, user => user.rentedProperties, {nullable: true})
  renter?: User | null;

  @OneToMany(() => Facture, facture => facture.immobilier)
  factures: Facture[];

  @OneToMany(() => Devis, devis => devis.immobilier)
  devis: Devis[];

  @OneToMany(() => Intervention, intervention => intervention.immobilier)
  interventions: Intervention[];

  @OneToMany(() => Reservation, reservation => reservation.immobilier)
  reservations: Reservation[];

  @OneToMany(() => Inspection, inspection => inspection.immobilier)
  inspections: Inspection[];

  @OneToMany(() => Image, image => image.immobilier, { cascade: true })
  images: Image[];

  constructor(
    id: number,
    name: string,
    content: { description: string; adresse: string },
    owner: User,
    renter: User,
    factures: Facture[],
    devis: Devis[],
    interventions: Intervention[],
    reservations: Reservation[],
    inspections: Inspection[],
    images: Image[]
  ) {
    this.id = id;
    this.name = name;
    this.content = content;
    this.owner = owner;
    this.renter = renter;
    this.factures = factures;
    this.devis = devis;
    this.interventions = interventions;
    this.reservations = reservations;
    this.inspections = inspections;
    this.images = images;
  }
}
