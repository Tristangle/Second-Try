import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Immobilier } from './immobilier';

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(() => Immobilier, immobilier => immobilier.images)
  immobilier: Immobilier;

  constructor(id: number, url: string, immobilier: Immobilier) {
    this.id = id;
    this.url = url;
    this.immobilier = immobilier;
  }
}
