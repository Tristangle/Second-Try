import { DataSource } from "typeorm";
import { Intervention } from "../../database/entities/intervention";
import { Prestation } from "../../database/entities/prestation";
import { InterventionPrestation } from "../../database/entities/interventionPrestation";
import { 
    CreateInterventionPrestationValidationRequest, 
    UpdateInterventionPrestationValidationRequest, 
    createInterventionPrestationValidation, 
    updateInterventionPrestationValidation 
} from "../../handlers/validators/interventionPrestation-validation";

export class InterventionPrestationUseCase {
    constructor(private readonly db: DataSource) {}

    // Ajouter une Prestation à une Intervention et incrémenter le coût
    async addPrestationToIntervention(createInterventionPrestation: CreateInterventionPrestationValidationRequest): Promise<Intervention> {
        // Validation des données d'entrée
        const { error } = createInterventionPrestationValidation.validate(createInterventionPrestation);
        if (error) {
            throw new Error(`Validation error: ${error.details[0].message}`);
        }

        const interventionRepository = this.db.getRepository(Intervention);
        const prestationRepository = this.db.getRepository(Prestation);
        const interventionPrestationRepository = this.db.getRepository(InterventionPrestation);

        const intervention = await interventionRepository.findOne({ where: { id: createInterventionPrestation.interventionId } });
        const prestation = await prestationRepository.findOne({ where: { id: createInterventionPrestation.prestationId } });

        if (!intervention || !prestation) {
            throw new Error("Intervention ou Prestation introuvable");
        }

        // Créer l'association entre l'intervention et la prestation avec le coût de la prestation récupéré
        const interventionPrestation = interventionPrestationRepository.create({
            intervention,
            prestation,
            cost: prestation.cost // Récupérer le coût de la prestation directement depuis la base de données
        });

        await interventionPrestationRepository.save(interventionPrestation);

        // Incrémenter le coût total de l'intervention
        intervention.price = Number(intervention.price) + Number(prestation.cost);
        await interventionRepository.save(intervention);

        return intervention;
    }

    // Mettre à jour une association InterventionPrestation et ajuster le coût de l'intervention
    async updateInterventionPrestation(id: number, updateInterventionPrestation: UpdateInterventionPrestationValidationRequest): Promise<InterventionPrestation | null> {
        // Validation des données d'entrée
        const { error } = updateInterventionPrestationValidation.validate(updateInterventionPrestation);
        if (error) {
            throw new Error(`Validation error: ${error.details[0].message}`);
        }

        const interventionPrestationRepository = this.db.getRepository(InterventionPrestation);

        const interventionPrestation = await interventionPrestationRepository.findOne({
            where: { id },
            relations: ["intervention", "prestation"]
        });

        if (!interventionPrestation) {
            return null;
        }

        // Mise à jour de l'association et ajustement du coût de l'intervention
        if (updateInterventionPrestation.prestationId !== undefined) {
            const prestation = await this.db.getRepository(Prestation).findOne({ where: { id: updateInterventionPrestation.prestationId } });
            if (!prestation) {
                throw new Error("Prestation introuvable");
            }

            // Ajuster le coût total de l'intervention
            const oldCost = interventionPrestation.cost;
            interventionPrestation.prestation = prestation;
            interventionPrestation.cost = prestation.cost;
            const intervention = interventionPrestation.intervention;
            intervention.price = Number(intervention.price) + (Number(prestation.cost) - Number(oldCost));
            await this.db.getRepository(Intervention).save(intervention);
        }

        if (updateInterventionPrestation.interventionId !== undefined) {
            const intervention = await this.db.getRepository(Intervention).findOne({ where: { id: updateInterventionPrestation.interventionId } });
            if (!intervention) {
                throw new Error("Intervention introuvable");
            }
            interventionPrestation.intervention = intervention;
        }

        return await interventionPrestationRepository.save(interventionPrestation);
    }

// Supprimer une association InterventionPrestation et décrémenter le coût
async removePrestationFromIntervention(interventionId: number, prestationId: number): Promise<Intervention> {
    const interventionRepository = this.db.getRepository(Intervention);
    const interventionPrestationRepository = this.db.getRepository(InterventionPrestation);

    // Rechercher l'intervention
    const intervention = await interventionRepository.findOne({ where: { id: interventionId } });

    if (!intervention) {
        throw new Error("Intervention introuvable");
    }

    // Rechercher l'association entre l'intervention et la prestation
    const interventionPrestation = await interventionPrestationRepository.findOne({
        where: { intervention: { id: interventionId }, prestation: { id: prestationId } },
        relations: ["prestation"]
    });

    if (!interventionPrestation) {
        throw new Error("L'association entre l'intervention et la prestation est introuvable");
    }

    // Vérifier et décrémenter le coût total de l'intervention
    if (interventionPrestation.cost) {
        const cost = Number(interventionPrestation.cost);
        if (!isNaN(cost)) {
            intervention.price = (intervention.price ?? 0) - cost;
        }
    }
    await interventionRepository.save(intervention);

    // Supprimer l'association intervention-prestation
    await interventionPrestationRepository.remove(interventionPrestation);

    return intervention;
}


    // Récupérer toutes les prestations associées à une intervention
    async getPrestationsForIntervention(interventionId: number): Promise<InterventionPrestation[]> {
        const interventionPrestationRepository = this.db.getRepository(InterventionPrestation);

        return interventionPrestationRepository.find({
            where: { intervention: { id: interventionId } },
            relations: ["prestation"]
        });
    }
}
