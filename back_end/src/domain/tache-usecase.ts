import { DataSource } from "typeorm";
import { Tache } from "../database/entities/tache";
import { User } from "../database/entities/user";
import { CreateTacheRequest } from "../handlers/validators/tache-validation";

export interface UpdateTacheParams {
    nom?: string
    description?: string
    date_debut?: Date
    date_fin?: Date
    type?: string 
    createur?: User
    executeur?: User

}
export class TacheUseCase{


    constructor(private readonly db: DataSource) { }


    async createTache(data: Omit<CreateTacheRequest, 'createur' | 'executeur'> & { createur: User, executeur: User }): Promise<Tache> {
      const tacheRepository = this.db.getRepository(Tache);

      const newTache = tacheRepository.create({
          nom: data.nom,
          description: data.description,
          date_debut: new Date(data.date_debut),
          date_fin: data.date_fin,
          type: data.type,
          createurTache: data.createur,
          executeurTache: data.executeur
      });

      return await tacheRepository.save(newTache);
  }
  // Get une tache
  async getTacheById(tacheId: number): Promise<Tache | null> {
    const tacheRepository = this.db.getRepository(Tache);
    const tache = await tacheRepository.findOne({
        where: { id: tacheId },
        relations: ['createurTache', 'executeurTache']
    });
    return tache;
}
    // Liste des taches

    async tacheList(userId: number): Promise<{ taches: Tache[] }> {
      const query = this.db.getRepository(Tache)
          .createQueryBuilder('tache')
          .leftJoinAndSelect('tache.createurTache', 'createur')
          .leftJoinAndSelect('tache.executeurTache', 'executeur')
          .where('executeur.id = :userId', { userId });

      const tacheList = await query.getMany();
      return { taches: tacheList };
  }

    // Edit de la tache
    async deleteTache(tacheId: number): Promise<void> {
        const tacheRepository = this.db.getRepository(Tache);
        const tache = await tacheRepository.findOneBy({ id: tacheId });
        if (tache) {
          await tacheRepository.remove(tache);
        }
    }
    async updateTache(id: number, params: UpdateTacheParams): Promise<Tache | null> {
        const repo = this.db.getRepository(Tache)
        const tacheFound = await repo.findOneBy({ id })

        if (!tacheFound) return null;
        Object.assign(tacheFound, params);

        const tacheUpdated = await repo.save(tacheFound);

        return tacheUpdated;
    }
    // Delete de la tache
}