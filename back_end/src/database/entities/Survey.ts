import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user";
import { SurveyQuestion } from "./SurveyQuestion";
import { SurveyResponse } from "./SurveyResponse";
import "reflect-metadata";

@Entity()
export class Survey {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, user => user.id)
    createdBy: User;

    @OneToMany(() => SurveyQuestion, question => question.survey, { eager: true, cascade: true })
    questions: SurveyQuestion[];

    @OneToMany(() => SurveyResponse, response => response.survey)
    responses?: SurveyResponse[];

    constructor(id: number, title: string, createdBy: User, questions: SurveyQuestion[], createdAt: Date, updatedAt: Date) {
        this.id = id;
        this.title = title;
        this.createdBy = createdBy;
        this.questions = questions;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
