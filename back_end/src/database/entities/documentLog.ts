import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user';
import { Document } from './document';

@Entity()
export class DocumentLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  changeDescription: string;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Document, document => document)
  document: Document;

  @ManyToOne(() => User, user => user.id)
  user: User;

  constructor(id: number, changeDescription: string, timestamp: Date, document: Document, user: User) {
    this.id = id;
    this.changeDescription = changeDescription;
    this.timestamp = timestamp;
    this.document = document;
    this.user = user;
  }
}
