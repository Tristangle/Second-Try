import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user';
import { Document } from './document';

@Entity()
export class UserDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.userDocuments)
  user: User;

  @ManyToOne(() => Document, document => document.userDocuments)
  document: Document;

  constructor(id:number, user: User, document: Document) {
    this.id = id;
    this.user = user;
    this.document = document;
  }
}
