import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user';
import { Planning } from './planning';
import { Vote } from './vote';

@Entity()
export class Meeting {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nom: string;

    @Column({ type: 'datetime' })
    date_debut: Date;

    @Column({ type: 'datetime' })
    date_fin: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    organisateur: User;

    @ManyToMany(() => User)
    @JoinTable({
        name: 'meeting_participant',
        joinColumns: [{ name: 'meeting_id' }],
        inverseJoinColumns: [{ name: 'user_id' }]
    })
    participants: User[];

    @ManyToMany(() => Planning, planning => planning.meetings)
    planning_id: Planning[];

    @ManyToMany(() => Vote)
    @JoinTable({
        name: 'vote_meeting',
        joinColumns: [{ name: 'meeting_id' }],
        inverseJoinColumns: [{ name: 'vote_id' }]
    })
    votes: Vote[];

    constructor(
        id: number,
        nom: string,
        date_debut: Date,
        date_fin: Date,
        organisateur: User,
        participants: User[],
        planning_id: Planning[],
        votes: Vote[]
    ) {
        this.id = id;
        this.nom = nom;
        this.date_debut = date_debut;
        this.date_fin = date_fin;
        this.organisateur = organisateur;
        this.participants = participants;
        this.planning_id = planning_id;
        this.votes = votes;
    }
}
