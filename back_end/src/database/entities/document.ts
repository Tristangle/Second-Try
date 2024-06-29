import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user';

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  text: string;

  @Column()
  content: string;

  @Column()
  fileUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user)
  createdBy: User;

  constructor(id: number, title:string, description: string, text: string, content: string, fileUrl: string, createdBy: User, createdAt: Date, updatedAt:Date) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.text = text;
    this.content = content;
    this.fileUrl = fileUrl; 
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
