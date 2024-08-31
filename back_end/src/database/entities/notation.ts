import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Prestation } from './prestation';
import { User } from './user';

@Entity()
export class Notation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  score: number;

  @Column({ type: 'text', nullable: true }) 
  commentaire?: string;

  @ManyToOne(() => Prestation, prestation => prestation.notations)
  prestation: Prestation;

  @ManyToOne(() => User, user => user.notations)
  user: User;

  constructor(id: number, score: number, prestation: Prestation, user: User,commentaire?: string) {
    this.id = id;
    this.score = score;
    this.prestation = prestation;
    this.user = user;
    this.commentaire = commentaire;

  }
}
