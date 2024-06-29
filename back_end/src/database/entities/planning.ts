import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user';
import { Meeting } from './meeting';
import { Tache } from './tache';

@Entity()
export class Planning {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => User, user => user.plannings)
    user: User;

    @ManyToMany(() => Meeting)
    @JoinTable({
        name: 'planning_meeting',
        joinColumns: [{ name: 'planning_id' }],
        inverseJoinColumns: [{ name: 'meeting_id' }]
    })
    meetings: Meeting[];

    @ManyToMany(() => Tache, tache => tache.plannings)
    @JoinTable({
        name: 'planning_tache',
        joinColumns: [{ name: 'planning_id' }],
        inverseJoinColumns: [{ name: 'tache_id' }]
    })
    taches: Tache[];

    constructor(
        id:number,
        name:string,
        user: User,
        meetings: Meeting[],
        taches: Tache[]
        ){
            this.id = id;
            this.name = name;
            this.user = user;
            this.meetings = meetings;
            this.taches = taches;
        }
}
