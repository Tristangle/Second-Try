import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user';
import { Immobilier } from './immobilier';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  dateDebut: Date;

  @UpdateDateColumn()
  dateFin: Date;

  @ManyToOne(() => User, user => user.reservations)
  reserveur: User;

  @ManyToOne(() => Immobilier, immobilier => immobilier.reservations)
  immobilier: Immobilier;

  constructor(
    id: number,
    dateDebut: Date,
    dateFin: Date,
    reserveur: User,
    immobilier: Immobilier
  ) {
    this.id = id;
    this.dateDebut = dateDebut;
    this.dateFin = dateFin;
    this.reserveur = reserveur;
    this.immobilier = immobilier;
  }
}
