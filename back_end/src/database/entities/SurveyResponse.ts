import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./user";
import { Survey } from "./Survey";

@Entity()
export class SurveyResponse {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("simple-array")
    responses: string[];

    @ManyToOne(() => Survey, survey => survey.responses)
    survey: Survey;

    @ManyToOne(() => User, user => user.id)
    user: User;

    constructor(id: number, responses: string[], survey: Survey, user: User) {
        this.id = id;
        this.responses = responses;
        this.survey = survey;
        this.user = user;
    }
}
