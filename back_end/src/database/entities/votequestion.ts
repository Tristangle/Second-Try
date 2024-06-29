import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Vote } from "./vote";
import { VoteOption } from "./voteOption";

@Entity()
export class VoteQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  questionText: string;

  @ManyToOne(() => Vote, vote => vote.questions)
  vote: Vote;

  @OneToMany(() => VoteOption, option => option.question, { cascade: true })
  options: VoteOption[];

  constructor(id: number, questionText: string, vote: Vote, options: VoteOption[]) {
    this.id = id;
    this.questionText = questionText;
    this.vote = vote;
    this.options = options;
  }
}
