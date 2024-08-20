import { DataSource } from "typeorm";
import { AppDataSource } from "../../database/database";
import { Devis } from "../../database/entities/devis";
import { Immobilier } from "../../database/entities/immobilier";
import { Document } from '../../database/entities/document';
import { User } from "../../database/entities/user";
import { devisValidationRequest, updateDevisValidationRequest } from "../../handlers/validators/devis-validation";
import { documentUseCase } from "./document-usecase";
import { Intervention } from "../../database/entities/intervention";

export class devisUseCase {
    constructor(private readonly db: DataSource) { }

    // Create Devis
    async createDevis(createDevis: devisValidationRequest): Promise<Devis>{
        const devisRepository = this.db.getRepository(Devis);
        const userRepository = this.db.getRepository(User);
        const immobilierRepository = this.db.getRepository(Immobilier);
    
        // Cherchez l'utilisateur et l'immobilier par leur ID
        const user = await userRepository.findOneBy({ id: createDevis.userId });
        const immobilier = await immobilierRepository.findOneBy({ id: createDevis.immobilierId });
    
        if (!user || !immobilier) {
            throw new Error("User or Immobilier not found");
        }

        // Créez le devis avec les relations correctement associées
        const newDevis = devisRepository.create({
            ...createDevis,
            user: user,
            immobilier: immobilier,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    
        const savedDevis = await devisRepository.save(newDevis);
    
        // Créez un document associé au devis
        const documentUsecase = new documentUseCase(AppDataSource);
        const now = new Date();
        const docDataTransfert = {
            title: createDevis.name,  
            createdBy: createDevis.userId, 
            devisId: savedDevis.id, 
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const fileUrl = `${process.env.SERVER_URL}:${process.env.PORT}/devis/${createDevis.userId}/${savedDevis.id}`;
        await documentUsecase.createDocument(docDataTransfert, fileUrl);
    
        return savedDevis;
    }
    // Update Devis
    async updateDevis(devisId: number,updateDevis: updateDevisValidationRequest): Promise<Devis | null>{
        const devisRepository = this.db.getRepository(Devis);
        const userRepository = this.db.getRepository(User);
        const immobilierRepository = this.db.getRepository(Immobilier);
        const devis = await devisRepository.findOneBy({id : devisId});
        if(!devis){
            return null;
        }
        if (updateDevis.userId) {
        const user = await userRepository.findOneBy({ id: updateDevis.userId });
        if (!user) {
            throw new Error('User not found');
        }
        devis.user = user;
    }
    if(updateDevis.immobilierId){
        const immobilier = await immobilierRepository.findOneBy({id: updateDevis.immobilierId});
        if(!immobilier){
            throw new Error('Immobilier not found');
        }
        devis.immobilier = immobilier;
    }

        Object.assign(devis, updateDevis, { updatedAt: new Date() });
        return await devisRepository.save(devis);
    }
    // Delete Devis
    async deleteDevis(devisId: number): Promise<void> {
        const devisRepository = this.db.getRepository(Devis);
        const interventionRepository = this.db.getRepository(Intervention);
        const documentRepository = this.db.getRepository(Document);
    
        const devisSearch = await devisRepository.findOne({
            where: { id: devisId },
            relations: ["interventions", "document"]
        });
    
        if (devisSearch) {
            // Supprimer toutes les interventions associées
            if (devisSearch.interventions && devisSearch.interventions.length > 0) {
                for (const intervention of devisSearch.interventions) {
                    await interventionRepository.remove(intervention);
                }
            }
    
            // Supprimer tous les documents associés
            if (devisSearch.document && devisSearch.document.length > 0) {
                await documentRepository.remove(devisSearch.document);
            }
    
            // Supprimer le devis
            await devisRepository.remove(devisSearch);
        }
    }
    
}
