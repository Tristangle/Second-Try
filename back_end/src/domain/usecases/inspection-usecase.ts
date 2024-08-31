import { DataSource } from "typeorm";
import { AppDataSource } from "../../database/database";
import { Immobilier } from "../../database/entities/immobilier";
import { Inspection } from "../../database/entities/inspection";
import { User } from "../../database/entities/user";
import { createInspectionValidationRequest, inspectionListValidationRequest, updateInspectionValidationRequest } from "../../handlers/validators/inspection-validation";
import { documentUseCase } from "./document-usecase";
import { Document } from "../../database/entities/document";
import { UserDocumentUseCase } from "./userDocument-usecase";
import { UserDocument } from "../../database/entities/userDocument";

export class inspectionUseCase {
    constructor(private readonly db: DataSource) { }

            // List Inspection
            async inspectionList(immobilierId: number,listInspection: inspectionListValidationRequest): Promise<{inspection: Inspection[]}>{
                    const query = this.db.getRepository(Inspection)
                        .createQueryBuilder('inspection')
                        .where('inspection.immobilierId = :immobilierId', { immobilierId })
                        .take(listInspection.result);
                    
                        const listeInspection = await query.getMany();
                        return {inspection: listeInspection};
            }
        // Create Inspection
        async createInspection(createInspection: createInspectionValidationRequest): Promise<Inspection> {
            const inspectionRepository = this.db.getRepository(Inspection);
            const inspecteur = await this.db.getRepository(User).findOne({ where: { id: createInspection.inspectorId } });
            const renter = await this.db.getRepository(User).findOne({ where: { id: createInspection.renterId } });
            const immobilier = await this.db.getRepository(Immobilier).findOne({where: {id:createInspection.immobilierId}});
            if(!inspecteur || !renter || !immobilier){
                throw new Error("Inspecteur, Locataire ou Immobilier introuvable");
            }
            const newInspection = inspectionRepository.create({ ...createInspection,inspector: inspecteur, renter: renter, immobilier: immobilier });
            const savedInspection = await inspectionRepository.save(newInspection);
        
    
            const documentUsecase = new documentUseCase(AppDataSource);
            
            const docDataTransfert = {
                title: createInspection.name,  
                createdBy: createInspection.inspectorId, 
                inspectionId: savedInspection.id, 
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const fileUrl = `${process.env.SERVER_URL}:${process.env.PORT}/inspection/${createInspection.inspectorId}/${savedInspection.id}`
            await documentUsecase.createDocument(docDataTransfert, fileUrl);
        
            return savedInspection;
        }
        // Update Inspection
        async updateInspection(inspectionId: number,updateInspection: updateInspectionValidationRequest): Promise<Inspection | null>{
                const inspectionRepository = this.db.getRepository(Inspection);
                const documentRepository = this.db.getRepository(Document);
                const inspection = await inspectionRepository.findOneBy({id : inspectionId});
                if(!inspection){
                    return null;
                }
                if (updateInspection.inspectorId !== undefined) {
                    const inspecteur = await this.db.getRepository(User).findOne({ where: { id: updateInspection.inspectorId } });
                    if (!inspecteur) {
                        throw new Error("Inspecteur introuvable");
                    }
                    inspection.inspector = inspecteur;
                }
                if (updateInspection.renterId !== undefined) {
                    const renter = await this.db.getRepository(User).findOne({ where: { id: updateInspection.renterId } });
                    if (!renter) {
                        throw new Error("Locataire introuvable");
                    }
                    inspection.renter = renter;
                }
                if (updateInspection.immobilierId !== undefined) {
                    const immobilier = await this.db.getRepository(Immobilier).findOne({ where: { id: updateInspection.immobilierId } });
                    if (!immobilier) {
                        throw new Error("Immobilier introuvable");
                    }
                    inspection.immobilier = immobilier;
                }
                Object.assign(inspection, updateInspection, { updatedAt: new Date() });
                return await inspectionRepository.save(inspection);
    
            }
            async deleteInspection(inspectionId: number): Promise<void> {
                const inspectionRepository = this.db.getRepository(Inspection);
                const documentRepository = this.db.getRepository(Document);
                const userDocumentRepository = this.db.getRepository(UserDocument);
            
                // Rechercher l'inspection
                const inspectionSearch = await inspectionRepository.findOneBy({ id: inspectionId });
            
                if (inspectionSearch) {
                    // Rechercher le document associé à l'inspection
                    const documentSearch = await documentRepository
                        .createQueryBuilder("document")
                        .where("document.inspectionId = :inspectionId", { inspectionId })
                        .getOne();
            
                    if (documentSearch) {
                        // Rechercher toutes les entrées user_document associées à ce document
                        const userDocuments = await userDocumentRepository.find({ where: { document: {id: documentSearch.id } } });
            
                        // Supprimer chaque user_document qui fait référence à ce document
                        for (const userDocument of userDocuments) {
                            await userDocumentRepository.remove(userDocument);
                        }
            
                        // Supprimer ensuite le document lui-même
                        await documentRepository.remove(documentSearch);
                    }
            
                    // Enfin, supprimer l'inspection
                    await inspectionRepository.remove(inspectionSearch);
                }
            }
            
            
}