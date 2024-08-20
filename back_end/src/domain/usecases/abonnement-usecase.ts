import { DataSource } from "typeorm";
import { Abonnement } from "../../database/entities/abonnement";
import { abonnementListValidationRequest, createAbonnementRequest, updateAbonnementRequest } from "../../handlers/validators/abonnement-validation";

export class abonnementUseCase {
    constructor(private readonly db: DataSource) { }

    // List abonnement
    async abonnementList(listAbonnement: abonnementListValidationRequest): Promise<{abonnement: Abonnement[]}>{
        const query = this.db.getRepository(Abonnement)
            .createQueryBuilder('abonnement')
            .take(listAbonnement.result);
        
            const listeAbonnement = await query.getMany();
            return {abonnement: listeAbonnement};
    }
    // Create Abonnement
    async createAbonnement(createAbonnement: createAbonnementRequest): Promise<Abonnement>{
        const abonnementRepository = this.db.getRepository(Abonnement);
        const newAbonnement = abonnementRepository.create({...createAbonnement, createdAt: new Date(), updatedAt: new Date()});
        return abonnementRepository.save(newAbonnement);
    }
    // Update abonnement
    async updateAbonnement(abonnementId: number,updateAbonnement: updateAbonnementRequest): Promise<Abonnement | null>{
        const abonnementRepository = this.db.getRepository(Abonnement);
        const abonnement = await abonnementRepository.findOneBy({id : abonnementId});
        if(!abonnement){
            return null;
        }
        Object.assign(abonnement, updateAbonnement, { updatedAt: new Date() });
        return await abonnementRepository.save(abonnement);
    }
    // Delete abonnement
    async deleteAbonnement(abonnementId: number): Promise<void>{
        const abonnementRepository = this.db.getRepository(Abonnement);
        const abonnementSearch =  await abonnementRepository.findOneBy({id: abonnementId});
        if(abonnementSearch){
            await abonnementRepository.remove(abonnementSearch);
        }
    }
}