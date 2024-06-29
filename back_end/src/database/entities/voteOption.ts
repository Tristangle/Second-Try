import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { VoteQuestion } from "./votequestion";

@Entity()
export class VoteOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @ManyToOne(() => VoteQuestion, question => question.options)
  question: VoteQuestion;

  constructor(id: number, text: string, question: VoteQuestion) {
    this.id = id;
    this.text = text;
    this.question = question;
  }
}
