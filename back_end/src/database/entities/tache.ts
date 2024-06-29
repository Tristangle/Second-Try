import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinColumn } from 'typeorm';
import { User } from './user';
import { Planning } from './planning';

@Entity()
export class Tache {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nom: string;

    @Column()
    description: string;

    @Column()
    status: string;

    @Column({ type: 'datetime' })
    date_debut: Date;

    @Column({ type: 'datetime' })
    date_fin: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'tachesAttribues_id' })
    tachesAttribues: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'tachesAssignees_id' })
    tachesAssignees: User;

    @ManyToMany(() => Planning, planning => planning.taches)
    plannings: Planning[];

    constructor(
        id: number,
        nom: string,
        description: string,
        status: string,
        date_debut: Date,
        date_fin: Date,
        tachesAttribues: User,
        tachesAssignees: User,
        plannings: Planning[]
    ) {
        this.id = id;
        this.nom = nom;
        this.description = description;
        this.status = status;
        this.date_debut = date_debut;
        this.date_fin = date_fin;
        this.tachesAttribues = tachesAttribues;
        this.tachesAssignees = tachesAssignees;
        this.plannings = plannings;
    }
}
