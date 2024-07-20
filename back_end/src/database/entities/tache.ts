import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinColumn } from 'typeorm';
import { User } from './user';

@Entity()
export class Tache {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nom: string;

    @Column()
    description: string;

    //@Column()
    //status: string;

    @Column({ type: 'datetime' })
    date_debut: Date;

    @Column({ type: 'datetime' })
    date_fin: Date;

    @Column()
    type: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'createur_id' })
    createurTache: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'executeur_id' })
    executeurTache: User;


    constructor(
        id: number,
        nom: string,
        description: string,
        //status: string,
        date_debut: Date,
        date_fin: Date,
        type: string,
        createurTache: User,
        executeurTache: User
    ) {
        this.id = id;
        this.nom = nom;
        this.description = description;
       // this.status = status;
        this.date_debut = date_debut;
        this.date_fin = date_fin;
        this.type = type;
        this.createurTache = createurTache;
        this.executeurTache = executeurTache;
    }
}
