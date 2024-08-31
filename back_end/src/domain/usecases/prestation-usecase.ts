import { DataSource } from "typeorm";
import { Intervention } from "../../database/entities/intervention";
import { Prestation } from "../../database/entities/prestation";
import { User } from "../../database/entities/user";
import { InterventionPrestationUseCase } from "./interventionPrestation-usecase";
import { createPrestationValidationRequest, prestationListValidationRequest, updatePrestationValidationRequest } from "../../handlers/validators/prestation-validation";
import { InterventionPrestation } from "../../database/entities/interventionPrestation";
import { Notation } from "../../database/entities/notation";

export class prestationUseCase {
    constructor(private readonly db: DataSource) {}

    async getPrestations(listRequest: prestationListValidationRequest): Promise<Prestation[]> {
        const prestationRepository = this.db.getRepository(Prestation);

        // Fournir des valeurs par défaut si page ou result sont undefined
        const page = listRequest.page || 1;
        const result = listRequest.result || 10;

        const query = prestationRepository.createQueryBuilder('prestation')
            .skip((page - 1) * result)
            .take(result);

        return await query.getMany();
    }
    
    // Récupérer une Prestation par ID
    async getPrestationByID(prestationId: number): Promise<Prestation | null> {
        const prestationRepository = this.db.getRepository(Prestation);
        return await prestationRepository.findOne({ where: { id: prestationId }, relations: ["prestataire"] });
    }

    // Récupérer toutes les Prestations par User ID
    async getPrestationsByUserId(userId: number): Promise<Prestation[]> {
        const prestationRepository = this.db.getRepository(Prestation);
        return await prestationRepository.find({
            where: { prestataire: { id: userId } }
        });
    }

    // Créer Prestation
    async createPrestation(createPrestation: createPrestationValidationRequest): Promise<Prestation> {
        const prestationRepository = this.db.getRepository(Prestation);
        const interventionPrestationUsecase = new InterventionPrestationUseCase(this.db);

        // Rechercher le prestataire (User)
        const prestataire = await this.db.getRepository(User).findOne({ where: { id: createPrestation.prestataireId } });
        if (!prestataire) {
            throw new Error("Prestataire introuvable");
        }

        // Créer la nouvelle Prestation sans l'intervention (car cela passe par InterventionPrestation)
        const prestationData = {
            ...createPrestation,
            prestataire,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const newPrestation = await prestationRepository.save(prestationData);

        // Si une intervention est associée, créer une InterventionPrestation via InterventionPrestationUseCase
        if (createPrestation.interventionId) {
            await interventionPrestationUsecase.addPrestationToIntervention({
                interventionId: createPrestation.interventionId,
                prestationId: newPrestation.id,
            });
        }

        return newPrestation;
    }

    // Update Prestation
    async updatePrestation(prestationId: number, updatePrestation: updatePrestationValidationRequest): Promise<Prestation | null> {
        const prestationRepository = this.db.getRepository(Prestation);
        const interventionPrestationUsecase = new InterventionPrestationUseCase(this.db);

        const prestation = await prestationRepository.findOne({ where: { id: prestationId }, relations: ["prestataire"] });

        if (!prestation) {
            return null;
        }

        // Gérer la mise à jour des relations
        if (updatePrestation.prestataireId !== undefined) {
            const prestataire = await this.db.getRepository(User).findOne({ where: { id: updatePrestation.prestataireId } });
            if (!prestataire) {
                throw new Error("Prestataire introuvable");
            }
            prestation.prestataire = prestataire;
        }

        // Gérer la mise à jour de l'intervention via InterventionPrestationUsecase
        if (updatePrestation.interventionId !== undefined) {
            const intervention = await this.db.getRepository(Intervention).findOne({ where: { id: updatePrestation.interventionId } });
            if (!intervention) {
                throw new Error("Intervention introuvable");
            }

            const existingInterventionPrestation = await interventionPrestationUsecase.getPrestationsForIntervention(intervention.id);

            const matchingInterventionPrestation = existingInterventionPrestation.find(
                ip => ip.prestation.id === prestationId
            );

            if (matchingInterventionPrestation) {
                // Si l'association existe déjà, mettre à jour le coût via InterventionPrestationUseCase
                await interventionPrestationUsecase.updateInterventionPrestation(
                    matchingInterventionPrestation.id,
                    { prestationId: prestationId }
                );
            } else {
                // Créer une nouvelle association si elle n'existe pas
                await interventionPrestationUsecase.addPrestationToIntervention({
                    interventionId: updatePrestation.interventionId,
                    prestationId: prestationId,
                });
            }
        }

        // Mettre à jour les autres champs de la prestation
        Object.assign(prestation, updatePrestation, { updatedAt: new Date() });

        return await prestationRepository.save(prestation);
    }
    async deletePrestation(prestationId: number): Promise<void> {
        const prestationRepository = this.db.getRepository(Prestation);
        const interventionPrestationUsecase = new InterventionPrestationUseCase(this.db);
        const notationRepository = this.db.getRepository(Notation); 
    
        const prestationSearch = await prestationRepository.findOne({ where: { id: prestationId } });
    
        if (prestationSearch) {
            // Supprimer les notations associées à cette prestation
            await notationRepository.delete({ prestation: { id: prestationId } });
    
            // Supprimer toutes les associations InterventionPrestation liées à cette Prestation
            const interventionPrestations = await interventionPrestationUsecase.getPrestationsForIntervention(prestationSearch.id);
            for (const interventionPrestation of interventionPrestations) {
                await interventionPrestationUsecase.removePrestationFromIntervention(interventionPrestation.intervention.id, prestationId);
            }
    
            // Supprimer la prestation elle-même
            await prestationRepository.remove(prestationSearch);
        }
    }
    async getNonExploratorPrestations(): Promise<Prestation[]> {
        return await this.db.getRepository(Prestation).find({
            where: { exploratorOnly: false },
        });
    }

    



}
