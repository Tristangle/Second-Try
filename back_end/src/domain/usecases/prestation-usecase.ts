import { DataSource } from "typeorm";
import { Intervention } from "../../database/entities/intervention";
import { Prestation } from "../../database/entities/prestation";
import { User } from "../../database/entities/user";
import { createPrestationValidationRequest, updatePrestationValidationRequest } from "../../handlers/validators/prestation-validation";

export class prestationUseCase {
    constructor(private readonly db: DataSource) {}

    // Create Prestation
    async createPrestation(createPrestation: createPrestationValidationRequest): Promise<Prestation> {
        const prestationRepository = this.db.getRepository(Prestation);
    
        // Rechercher le prestataire (User)
        const prestataire = await this.db.getRepository(User).findOne({ where: { id: createPrestation.prestataireId } });
        if (!prestataire) {
            throw new Error("Prestataire introuvable");
        }
    
        // Rechercher l'intervention
        const intervention = await this.db.getRepository(Intervention).findOne({ where: { id: createPrestation.interventionId } });
        if (!intervention) {
            throw new Error("Intervention introuvable");
        }
    
        // Créer un nouvel objet avec toutes les propriétés nécessaires
        const prestationData = {
            ...createPrestation,
            prestataire,  // Associe le prestataire trouvé
            intervention,  // Associe l'intervention trouvée
            createdAt: new Date(),  // Ajoute la date de création
            updatedAt: new Date()  // Ajoute la date de mise à jour
        };
    
        // Utiliser prestationData pour créer une nouvelle instance de Prestation
        const newPrestation = prestationRepository.create(prestationData);
    
        return prestationRepository.save(newPrestation);
    }
    
    

    // Update Prestation
async updatePrestation(prestationId: number, updatePrestation: updatePrestationValidationRequest): Promise<Prestation | null> {
    const prestationRepository = this.db.getRepository(Prestation);
    const prestation = await prestationRepository.findOne({ where: { id: prestationId }, relations: ["prestataire", "intervention"] });

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

    if (updatePrestation.interventionId !== undefined) {
        const intervention = await this.db.getRepository(Intervention).findOne({ where: { id: updatePrestation.interventionId } });
        if (!intervention) {
            throw new Error("Intervention introuvable");
        }
        prestation.intervention = intervention;
    }

    // Mettre à jour les autres champs
    Object.assign(prestation, updatePrestation, { updatedAt: new Date() });

    return await prestationRepository.save(prestation);
}


    // Delete Prestation
    async deletePrestation(prestationId: number): Promise<void> {
        const prestationRepository = this.db.getRepository(Prestation);
        const prestationSearch = await prestationRepository.findOneBy({ id: prestationId });
        
        if (prestationSearch) {
            await prestationRepository.remove(prestationSearch);
        }
    }
}
