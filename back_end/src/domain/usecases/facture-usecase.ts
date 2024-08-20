import { DataSource} from "typeorm";
import { AppDataSource } from "../../database/database";
import { Facture } from "../../database/entities/facture";
import { Immobilier } from "../../database/entities/immobilier";
import { Intervention } from "../../database/entities/intervention";
import { Document } from "../../database/entities/document";
import { User } from "../../database/entities/user";
import { createFactureValidationRequest, updateFactureValidationRequest } from "../../handlers/validators/facture-validation";
import { documentUseCase } from "./document-usecase";

export class factureUseCase {
    constructor(private readonly db: DataSource) {}

    // Create Facture
    async createFacture(createFacture: createFactureValidationRequest): Promise<Facture> {
        const factureRepository = this.db.getRepository(Facture);
    
        // Création de la facture
        const emetteur = await this.db.getRepository(User).findOne({ where: { id: createFacture.emetteurId } });
        const receveur = await this.db.getRepository(User).findOne({ where: { id: createFacture.receveurId } });
        if (!emetteur || !receveur) {
            throw new Error("Émetteur ou receveur introuvable");
        }
    
        let immobilier: Immobilier | null = null;
        let intervention: Intervention | null = null;
    
        if (createFacture.immobilierId) {
            immobilier = await this.db.getRepository(Immobilier).findOne({ where: { id: createFacture.immobilierId } });
            if (!immobilier) {
                throw new Error("Immobilier introuvable");
            }
        }
    
        if (createFacture.interventionId) {
            intervention = await this.db.getRepository(Intervention).findOne({ where: { id: createFacture.interventionId } });
            if (!intervention) {
                throw new Error("Intervention introuvable");
            }
        }

        // Créer la facture avec les champs requis
        const newFacture: Partial<Facture> = {
            ...createFacture,
            immobilier: immobilier || undefined,
            intervention: intervention || undefined,
            emetteur,
            receveur,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    
        const savedFacture = await factureRepository.save(newFacture as Facture);
    
        // Création du document lié
        const documentUsecase = new documentUseCase(AppDataSource);
        const docDataTransfert = {
            title: createFacture.name,
            createdBy: createFacture.emetteurId,
            factureId: savedFacture.id,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const fileUrl = `${process.env.SERVER_URL}:${process.env.PORT}/facture/${createFacture.emetteurId}/${savedFacture.id}`;
        
        await documentUsecase.createDocument(docDataTransfert, fileUrl);
    
        return savedFacture;
    }
    
    
    
    // Update Facture
    async updateFacture(factureId: number, updateFacture: updateFactureValidationRequest): Promise<Facture | null> {
        const factureRepository = this.db.getRepository(Facture);
        const facture = await factureRepository.findOne({ where: { id: factureId }, relations: ["immobilier", "intervention", "emetteur", "receveur"] });
        
        if (!facture) {
            return null;
        }
    
        // Gérer les mises à jour des relations
        if (updateFacture.immobilierId !== undefined) {
            const immobilier = await this.db.getRepository(Immobilier).findOne({ where: { id: updateFacture.immobilierId } });
            if (!immobilier) {
                throw new Error("Immobilier introuvable");
            }
            facture.immobilier = immobilier;
        }
    
        if (updateFacture.interventionId !== undefined) {
            const intervention = await this.db.getRepository(Intervention).findOne({ where: { id: updateFacture.interventionId } });
            if (!intervention) {
                throw new Error("Intervention introuvable");
            }
            facture.intervention = intervention;
        }
    
        if (updateFacture.emetteurId !== undefined) {
            const emetteur = await this.db.getRepository(User).findOne({ where: { id: updateFacture.emetteurId } });
            if (!emetteur) {
                throw new Error("Émetteur introuvable");
            }
            facture.emetteur = emetteur;
        }
    
        if (updateFacture.receveurId !== undefined) {
            const receveur = await this.db.getRepository(User).findOne({ where: { id: updateFacture.receveurId } });
            if (!receveur) {
                throw new Error("Receveur introuvable");
            }
            facture.receveur = receveur;
        }
    
        // Mises à jour des autres champs
        Object.assign(facture, updateFacture, { updatedAt: new Date() });
    
        // Sauvegarde de la facture mise à jour
        return await factureRepository.save(facture);
    }
    
    
    
    async deleteFacture(factureId: number): Promise<void> {
        const factureRepository = this.db.getRepository(Facture);
        const documentRepository = this.db.getRepository(Document);
    
        // Recherche de la facture avec les relations associées
        const factureSearch = await factureRepository.findOne({
            where: { id: factureId },
            relations: ["documents"]
        });
    
        if (factureSearch) {
            // Supprimer tous les documents associés à la facture
            if (factureSearch.documents && factureSearch.documents.length > 0) {
                await documentRepository.remove(factureSearch.documents);
            }
    
            // Supprimer la facture après la suppression des documents associés
            await factureRepository.remove(factureSearch);
        }
    }
    
}
