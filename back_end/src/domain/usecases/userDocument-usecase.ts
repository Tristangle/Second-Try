import { AppDataSource } from '../../database/database';
import { UserDocument } from '../../database/entities/userDocument';
import { User } from '../../database/entities/user';
import { Document } from '../../database/entities/document';
import { createUserDocumentValidation, createUserDocumentValidationRequest } from '../../handlers/validators/userDocument-validation';
import { DataSource } from 'typeorm';


export class UserDocumentUseCase {
    constructor(private readonly db: DataSource) {}

    // Create UserDocument
    async createUserDocument(createUserDocument: createUserDocumentValidationRequest): Promise<UserDocument> {
        const { error } = createUserDocumentValidation.validate(createUserDocument);
        if (error) {
            throw new Error(`Validation error: ${error.details[0].message}`);
        }

        const userRepository = this.db.getRepository(User);
        const documentRepository = this.db.getRepository(Document);
        const userDocumentRepository = this.db.getRepository(UserDocument);

        const user = await userRepository.findOne({ where: { id: createUserDocument.userId } });
        const document = await documentRepository.findOne({ where: { id: createUserDocument.documentId } });

        if (!user || !document) {
            throw new Error("User or Document not found");
        }

        const userDocument = userDocumentRepository.create({ user, document });
        return await userDocumentRepository.save(userDocument);
    }

    async deleteUserDocument(userDocumentId: number): Promise<void> {
        const userDocumentRepository = this.db.getRepository(UserDocument);
        const documentRepository = this.db.getRepository(Document);
    
        // Rechercher le userDocument avec le document associé
        const userDocument = await userDocumentRepository.findOne({
            where: { id: userDocumentId },
            relations: ['document'] // Assurez-vous que la relation est bien établie
        });
    
        if (userDocument) {
            const document = userDocument.document;
    
            // Supprimez toutes les entrées user_document associées au document
            if (document) {
                await userDocumentRepository.delete({ document: { id: document.id } });
    
                // Maintenant que toutes les entrées user_document sont supprimées, supprimez le document lui-même
                await documentRepository.remove(document);
            }
    
            // Supprimez ensuite le userDocument
            await userDocumentRepository.remove(userDocument);
        }
    }
    
    
    
    

    // Get all UserDocuments
    async getAllUserDocuments(): Promise<UserDocument[]> {
        const userDocumentRepository = this.db.getRepository(UserDocument);
        return await userDocumentRepository.find({ relations: ['user', 'document'] });
    }

    async getUserDocumentByUserId(userId: number): Promise<UserDocument[]> {
        const userDocumentRepository = this.db.getRepository(UserDocument);
        return userDocumentRepository.find({
            where: { user: { id: userId } },
            relations: ['user', 'document'],
        });
    }
}
