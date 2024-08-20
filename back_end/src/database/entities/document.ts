import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user';
import { DocumentLog } from './documentLog';
import { Devis } from './devis';
import { Facture } from './facture';
import { Inspection } from './inspection';
import { Intervention } from './intervention';
import { UserDocument } from './userDocument';

export enum DocumentType {
  Devis = 'Devis',
  Facture = 'Facture',
  Inspection = 'Inspection',
  Intervention = 'Intervention',
  Autres = 'Autres'
}

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('json', { nullable: true })
  content?: {
    description?: string;
    text?: string;
  };

  @Column()
  fileUrl: string;

  @Column({
    type: "enum",
    enum: DocumentType,
    default: DocumentType.Autres
  })
  type: DocumentType;

  @ManyToOne(() => Devis, devis => devis.document, { nullable: true })
  devis?: Devis;

  @ManyToOne(() => Facture, facture => facture.documents, { nullable: true })
  facture?: Facture;

  @ManyToOne(() => Inspection, inspection => inspection.documents, { nullable: true })
  inspection?: Inspection;

  @ManyToOne(() => Intervention, intervention => intervention.documents, { nullable: true })
  intervention?: Intervention;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => DocumentLog, documentLog => documentLog.document)
  documentLogs: DocumentLog[];

  @OneToMany(() => UserDocument, userDocument => userDocument.document)
  userDocuments: UserDocument[];

  @ManyToOne(() => User, user => user.documents, {nullable: false})
  createdBy: User;

  constructor(
    id: number,
    title: string,
    content: { description?: string; text?: string },
    fileUrl: string,
    type: DocumentType,
    createdBy: User,
    createdAt: Date,
    updatedAt: Date,
    documentLogs: DocumentLog[],
    userDocuments: UserDocument[],
    devis?: Devis,
    facture?: Facture,
    inspection?: Inspection,
    intervention?: Intervention
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.fileUrl = fileUrl;
    this.type = type;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.documentLogs = documentLogs;
    this.userDocuments = userDocuments;
    this.devis = devis;
    this.facture = facture;
    this.inspection = inspection;
    this.intervention = intervention;
  }
}
