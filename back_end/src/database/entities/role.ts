import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class Role {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => User, user => user.role)
    users: User[];

    constructor(id: number, name: string, users: User[]) {
        this.id = id;
        this.name = name;
        this.users = users;
    }
}
