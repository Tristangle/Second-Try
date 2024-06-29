import { DataSource } from 'typeorm';
import { Document } from '../database/entities/document';
import { AppDataSource } from '../database/database';
import { documentCreateValidationRequest } from '../handlers/validators/document-validation';

export interface listDocumentFilter {
  page: number;
  result: number;
}

export class DocumentUsecase {
  constructor(private readonly db: DataSource) { }

  async documentList(listDocumentFilter: listDocumentFilter): Promise<{ document: Document[] }> {
    const query = this.db.createQueryBuilder(Document, 'document');
    query.take(listDocumentFilter.result);
    const listeDocument = await query.getMany();
    return { document: listeDocument };
  }

  async createDocument(data: documentCreateValidationRequest, filePath: string): Promise<Document> {
    const documentRepository = this.db.getRepository(Document);
    const newDocument = documentRepository.create({
      ...data,
      fileUrl: filePath,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return await documentRepository.save(newDocument);
  }
}
