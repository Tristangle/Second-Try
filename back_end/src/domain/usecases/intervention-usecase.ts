import { DataSource } from "typeorm";
import { Devis } from "../../database/entities/devis";
import { Facture } from "../../database/entities/facture";
import { Immobilier } from "../../database/entities/immobilier";
import { Intervention } from "../../database/entities/intervention";
import { Prestation } from "../../database/entities/prestation";
import { createInterventionValidationRequest, interventionListValidationRequest, updateInterventionValidationRequest } from "../../handlers/validators/intervention-validation";
import { Document } from "../../database/entities/document";
import { AppDataSource } from "../../database/database";
import { devisUseCase } from "./devis-usecase";
import { prestationUseCase } from "./prestation-usecase";
export class interventionUseCase {
    constructor(private readonly db: DataSource) { }

        // List Inspection
                async interventionList(immobilierId: number,listIntervention: interventionListValidationRequest): Promise<{intervention: Intervention[]}>{
                    const query = this.db.getRepository(Intervention)
                        .createQueryBuilder('intervention')
                        .where('intervention.immobilierId = :immobilierId', { immobilierId })
                        .take(listIntervention.result);
                    
                        const listeIntervention = await query.getMany();
                        return {intervention: listeIntervention};
            }
    // Create intervention 
    async createIntervention(createIntervention: createInterventionValidationRequest): Promise<Intervention> {
        const interventionRepository = this.db.getRepository(Intervention);
    
        // Rechercher les entités associées
        let immobilier: Immobilier | null = null;
        let facture: Facture | null = null;
        let devis: Devis | null = null;
    
        if (createIntervention.immobilierId) {
            immobilier = await this.db.getRepository(Immobilier).findOne({ where: { id: createIntervention.immobilierId } });
            if (!immobilier) {
                throw new Error("Immobilier introuvable");
            }
        }
    
        if (createIntervention.factureId) {
            facture = await this.db.getRepository(Facture).findOne({ where: { id: createIntervention.factureId } });
            if (!facture) {
                throw new Error("Facture introuvable");
            }
        }
    
        if (createIntervention.devisId) {
            devis = await this.db.getRepository(Devis).findOne({ where: { id: createIntervention.devisId } });
            if (!devis) {
                throw new Error("Devis introuvable");
            }
        }
    
        // Créer la nouvelle intervention avec les relations associées
        const newIntervention = interventionRepository.create({
            ...createIntervention,
            immobilier: immobilier || undefined,
            facture: facture || undefined,
            devis: devis || undefined,
        });
    
        return interventionRepository.save(newIntervention);
    }
    
    
    // Update Intervention
    async updateIntervention(interventionId: number, updateIntervention: updateInterventionValidationRequest): Promise<Intervention | null> {
        const interventionRepository = this.db.getRepository(Intervention);
    
        const intervention = await interventionRepository.findOne({ where: { id: interventionId }, relations: ["immobilier", "facture", "devis"] });
        if (!intervention) {
            return null;
        }
    
        // Gérer les mises à jour des relations
        if (updateIntervention.immobilierId !== undefined) {
            const immobilier = await this.db.getRepository(Immobilier).findOne({ where: { id: updateIntervention.immobilierId } });
            if (!immobilier) {
                throw new Error("Immobilier introuvable");
            }
            intervention.immobilier = immobilier;
        }
    
        if (updateIntervention.factureId !== undefined) {
            const facture = await this.db.getRepository(Facture).findOne({ where: { id: updateIntervention.factureId } });
            if (!facture) {
                throw new Error("Facture introuvable");
            }
            intervention.facture = facture;
        }
    
        if (updateIntervention.devisId !== undefined) {
            const devis = await this.db.getRepository(Devis).findOne({ where: { id: updateIntervention.devisId } });
            if (!devis) {
                throw new Error("Devis introuvable");
            }
            intervention.devis = devis;
        }
    
        // Mettre à jour les autres champs de l'intervention
        Object.assign(intervention, updateIntervention, { updatedAt: new Date() });
    
        return await interventionRepository.save(intervention);
    }
    
    async deleteIntervention(interventionId: number): Promise<void> {
        const interventionRepository = this.db.getRepository(Intervention);
        const documentRepository = this.db.getRepository(Document);
        const prestationUsecase = new prestationUseCase(AppDataSource);  // Assurez-vous que le use case est correctement importé et initialisé
        const devisUsecase = new devisUseCase(AppDataSource);  // Assurez-vous que le use case est correctement importé et initialisé
    
        const interventionSearch = await interventionRepository.findOne({
            where: { id: interventionId },
            relations: ["documents", "devis", "prestations"]
        });
    
        if (interventionSearch) {
            if (interventionSearch.prestations && interventionSearch.prestations.length > 0) {
                for (const prestations of interventionSearch.prestations) {
                    await prestationUsecase.deletePrestation(prestations.id)
                }
            // Supprimer tous les documents associés à l'intervention
            if (interventionSearch.documents && interventionSearch.documents.length > 0) {
                for (const document of interventionSearch.documents) {
                    await documentRepository.remove(document);
                }
            }
    
            // Supprimer le devis associé à l'intervention, si présent
            if (interventionSearch.devis) {
                await devisUsecase.deleteDevis(interventionSearch.devis.id);  // Appel à la méthode deleteDevis du DevisUsecase
            }
    
            // Supprimer l'intervention
            await interventionRepository.remove(interventionSearch);
        }
    }
    }
}