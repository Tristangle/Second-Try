import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./user";
import { Vote } from "./vote";

@Entity()
export class VoteResponse {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("simple-array")
    responses: string[];

    @ManyToOne(() => Vote, vote => vote.responses)
    vote: Vote;

    @ManyToOne(() => User, user => user.id)
    user: User;

    constructor(id: number, responses: string[], vote: Vote, user: User) {
        this.id = id;
        this.responses = responses;
        this.vote = vote;
        this.user = user;
    }
}
