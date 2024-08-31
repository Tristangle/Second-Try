import { DataSource } from "typeorm";
import { Devis } from "../../database/entities/devis";
import { Facture, TauxTVA } from "../../database/entities/facture";
import { Immobilier } from "../../database/entities/immobilier";
import { Intervention } from "../../database/entities/intervention";
import { Document } from "../../database/entities/document";
import { AppDataSource } from "../../database/database";
import { devisUseCase } from "./devis-usecase";
import { InterventionPrestationUseCase } from "./interventionPrestation-usecase";
import { createInterventionValidationRequest, interventionListValidationRequest, updateInterventionValidationRequest } from "../../handlers/validators/intervention-validation";
import { UserAbonnement } from "../../database/entities/userAbonnement";
import { StripeService } from "../services/stripeService";
import { UserAbonnementUseCase } from "./userAbonnement-usecase";
import { factureUseCase } from "./facture-usecase";
import { createFactureValidation } from "../../handlers/validators/facture-validation";
export class interventionUseCase {
    private stripeService: StripeService;

    constructor(private readonly db: DataSource) {
        this.stripeService = new StripeService();

     }

    // List Interventions
    async interventionList(immobilierId: number, listIntervention: interventionListValidationRequest): Promise<{ intervention: Intervention[] }> {
        const query = this.db.getRepository(Intervention)
            .createQueryBuilder('intervention')
            .where('intervention.immobilierId = :immobilierId', { immobilierId })
            .take(listIntervention.result);

        const listeIntervention = await query.getMany();
        return { intervention: listeIntervention };
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
            price: 0 // Initialiser le coût à 0
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
        const devisUsecase = new devisUseCase(AppDataSource);
        const interventionPrestationUsecase = new InterventionPrestationUseCase(AppDataSource);

        const interventionSearch = await interventionRepository.findOne({
            where: { id: interventionId },
            relations: ["documents", "devis"]
        });

        if (interventionSearch) {
            // Supprimer toutes les prestations associées via InterventionPrestationUseCase
            const interventionPrestations = await interventionPrestationUsecase.getPrestationsForIntervention(interventionId);
            for (const interventionPrestation of interventionPrestations) {
                await interventionPrestationUsecase.removePrestationFromIntervention(interventionId, interventionPrestation.prestation.id);
            }

            // Supprimer tous les documents associés à l'intervention
            if (interventionSearch.documents && interventionSearch.documents.length > 0) {
                for (const document of interventionSearch.documents) {
                    await documentRepository.remove(document);
                }
            }

            // Supprimer le devis associé à l'intervention, si présent
            if (interventionSearch.devis) {
                await devisUsecase.deleteDevis(interventionSearch.devis.id);
            }

            // Supprimer l'intervention
            await interventionRepository.remove(interventionSearch);
        }
    }

    // Ajouter une Prestation à une Intervention via InterventionPrestationUseCase
    async addPrestationToIntervention(interventionId: number, prestationId: number): Promise<Intervention> {
        const interventionPrestationUsecase = new InterventionPrestationUseCase(this.db);
        return interventionPrestationUsecase.addPrestationToIntervention({ interventionId, prestationId });
    }
    async processPayment(interventionId: number, userId: number): Promise<Intervention> {
        const interventionRepository = this.db.getRepository(Intervention);
        const userAbonnementRepository = this.db.getRepository(UserAbonnement);

        const intervention = await interventionRepository.findOne({ where: { id: interventionId }, relations: ["immobilier"] });
        if (!intervention) {
            throw new Error("Intervention introuvable");
        }
        console.log("Intervention récupérée:", intervention);
        if (intervention.paye) {
            throw new Error("Cette intervention a déjà été payée.");
        }

        let totalCost = intervention.price * 100; // Convertir le prix en centimes pour Stripe

        // Vérifier si l'utilisateur a un abonnement avec une réduction
        const userAbonnementUsecase = new UserAbonnementUseCase(AppDataSource); // Assurez-vous que `UserAbonnementUseCase` est importé
        const userAbonnement = await userAbonnementUsecase.getAbonnementByUserId(userId);
        console.log("Abonnement trouvé:", userAbonnement);

        if (userAbonnement?.abonnement.id === 3) {
            totalCost *= 0.95
        }
        intervention.price = totalCost / 100;

        const successUrl = `${process.env.SERVER_URL}:3001/success`;
        const cancelUrl = `${process.env.SERVER_URL}:3001/cancel`;
        const reserveurEmail = intervention.immobilier.owner.email; // Supposant que 'owner' a un champ 'email'

        const paymentSession = await this.stripeService.createCheckoutSession(totalCost, "eur", successUrl, cancelUrl, reserveurEmail);

        // Mettre à jour l'intervention avec la session de paiement et marquer comme payée
        intervention.paymentSessionId = paymentSession.id;
        intervention.paye = true;
        const savedIntervention = await interventionRepository.save(intervention);

        // Création de la facture
        
        const factureUsecase = new factureUseCase(this.db); // Créer une instance du usecase de facture
        const factureData = {
        name: `Facture pour l'intervention ${intervention.name}`,
        emetteurId: intervention.immobilier.owner.id, // Propriétaire de l'immobilier comme émetteur
        receveurId: userId, // Utilisateur qui a effectué le paiement comme receveur
        immobilierId: intervention.immobilier.id,
        interventionId: intervention.id,
        date: new Date(),
        emailEmetteur: intervention.immobilier.owner.email,
        adresseEmetteur: intervention.immobilier.content?.adresse || "Adresse inconnue",
        content: [
            {
                quantite: 1, // Une intervention
                designation: intervention.name,
                tauxTVA: TauxTVA.TVA20, // Exemple avec une TVA de 20%
                prixUnitaire: intervention.price,
                totalHT: intervention.price,
                totalTTC: intervention.price * 1.2 // Exemple avec une TVA de 20%
            }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    };
    await factureUsecase.createFacture(factureData);

    return savedIntervention;
    }

}
