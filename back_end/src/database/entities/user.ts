import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { Token } from "./token";
import { Role } from "./roles";
import { Meeting } from "./meeting";
import { Planning } from "./planning";
import "reflect-metadata";
import { Tache } from "./tache";



@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @OneToMany(() => Token, token => token.user)
    tokens: Token[];

    @ManyToOne(() => Role, role => role.users, {eager: true})
    roles: Role;

    @ManyToMany(() => Meeting, meeting => meeting.participants)
    meetings: Meeting[];

    @OneToMany(() => Planning, planning => planning.user)
    plannings: Planning[];

    @OneToMany(() => Tache, tache => tache.tachesAssignees)
    taches_assignees : Tache[]

    @OneToMany(() => Tache, tache => tache.tachesAttribues)
    taches_attribues : Tache[]

    constructor(id: number,
        username: string,
        email: string,
        password: string,
        tokens: Token[],
        roles: Role,
        meetings: Meeting[],
        plannings: Planning[],
        taches_assignees: Tache[],
        taches_attribues: Tache[]){
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.tokens = tokens;
        this.roles = roles;
        this.meetings = meetings;
        this.plannings = plannings;
        this.taches_assignees = taches_assignees;
        this.taches_attribues = taches_attribues;
    }
}
