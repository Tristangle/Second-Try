import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { Token } from "./token";
import { Role } from "./roles";
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

    @OneToMany(() => Tache, tache => tache.createurTache)
    taches_creer : Tache[]

    @OneToMany(() => Tache, tache => tache.executeurTache)
    taches_execute : Tache[]

    constructor(id: number,
        username: string,
        email: string,
        password: string,
        tokens: Token[],
        roles: Role,
        taches_creer: Tache[],
        taches_execute: Tache[]){
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.tokens = tokens;
        this.roles = roles;
        this.taches_creer = taches_creer;
        this.taches_execute = taches_execute;
    }
}
