import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user';

@Entity()
export class Bannissement {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.bannissements)
    user: User;

    @Column()
    reason: string;

    @CreateDateColumn()
    startDate: Date;

    @Column({ nullable: true })
    endDate: Date;

    @Column({ default: false })
    isPermanent: boolean;

    @ManyToOne(() => User, user => user.banInitiatedBy)
    initiatedBy: User;

    constructor(id:number, user: User, reason: string, startDate: Date, endDate: Date, isPermanent: boolean, initiatedBy: User){
        this.id = id;
        this.user = user;
        this.reason = reason;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isPermanent = isPermanent;
        this.initiatedBy = initiatedBy;
    }
}