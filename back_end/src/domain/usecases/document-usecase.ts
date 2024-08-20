import { DataSource } from 'typeorm';
import { Devis } from '../../database/entities/devis';
import { Document, DocumentType } from '../../database/entities/document';
import { Facture } from '../../database/entities/facture';
import { Inspection } from '../../database/entities/inspection';
import { Intervention } from '../../database/entities/intervention';
import { User } from '../../database/entities/user';
import { documentCreateValidationRequest } from '../../handlers/validators/document-validation';

export interface listDocumentFilter {
  page: number;
  result: number;
}

export class documentUseCase {
  constructor(private readonly db: DataSource) {}

  async documentList(listDocumentFilter: listDocumentFilter): Promise<{ document: Document[] }> {
    const query = this.db.createQueryBuilder(Document, 'document');
    query.take(listDocumentFilter.result);
    const listeDocument = await query.getMany();
    return { document: listeDocument };
  }

  async createDocument(createDocumentData: any, filePath: string): Promise<Document> {
    const documentRepository = this.db.getRepository(Document);

    const user = await this.db.getRepository(User).findOne({ where: { id: createDocumentData.createdBy } });
    if (!user) {
        throw new Error("User not found");
    }

    // Créez le document avec les champs de base
    const newDocument: Partial<Document> = {
        title: createDocumentData.title,
        content: createDocumentData.content,
        fileUrl: filePath,
        type: createDocumentData.Autres,
        createdBy: user,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    // Associez le document à la bonne entité
    if (createDocumentData.devisId) {
        const devis = await this.db.getRepository(Devis).findOne({ where: { id: createDocumentData.devisId } });
        if (!devis) throw new Error("Devis not found");
        newDocument.devis = devis;
        newDocument.type = DocumentType.Devis;
    } else if (createDocumentData.factureId) {
        const facture = await this.db.getRepository(Facture).findOne({ where: { id: createDocumentData.factureId } });
        if (!facture) throw new Error("Facture not found");
        newDocument.facture = facture;
        newDocument.type = DocumentType.Facture;
    } else if (createDocumentData.interventionId) {
        const intervention = await this.db.getRepository(Intervention).findOne({ where: { id: createDocumentData.interventionId } });
        if (!intervention) throw new Error("Intervention not found");
        newDocument.intervention = intervention;
        newDocument.type = DocumentType.Intervention;
    } else if (createDocumentData.inspectionId) {
        const inspection = await this.db.getRepository(Inspection).findOne({ where: { id: createDocumentData.inspectionId } });
        if (!inspection) throw new Error("Inspection not found");
        newDocument.inspection = inspection;
        newDocument.type = DocumentType.Inspection;
    }

    return await documentRepository.save(newDocument as Document);
}


  async updateDocument(documentId: number, updateDocument: documentCreateValidationRequest): Promise<Document | null> {
    const documentRepository = this.db.getRepository(Document);
    const document = await documentRepository.findOneBy({id : documentId});
    if(!document){
        return null;
    }
    Object.assign(document, updateDocument, { updatedAt: new Date() });
    return await documentRepository.save(document);
   
  }

  async deleteDocument(documentId: number): Promise<void>{
    const documentRepository = this.db.getRepository(Document);
    const documentSearch =  await documentRepository.findOneBy({id: documentId});
    if(documentSearch){
        await documentRepository.remove(documentSearch);
    }
}
}
