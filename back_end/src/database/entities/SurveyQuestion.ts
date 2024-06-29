import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Survey } from "./Survey";

@Entity()
export class SurveyQuestion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    questionText: string;

    @Column({ nullable: true })
    type: 'radio' | 'text';

    @Column("simple-array", { nullable: true })
    options?: string[];

    @ManyToOne(() => Survey, survey => survey.questions)
    survey: Survey;

    constructor(id: number, questionText: string, type: 'radio' | 'text', options: string[], survey: Survey) {
        this.id = id;
        this.questionText = questionText;
        this.type = type;
        this.options = options;
        this.survey = survey;
    }
}
