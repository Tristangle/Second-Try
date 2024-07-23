import { DataSource } from "typeorm";
import { Role } from "../database/entities/roles";

export interface ListRoleFilter {
    page: number;
    result: number;
}

export class RoleUsecase {
    constructor(private readonly db: DataSource) { }

    async roleList(listRoleFilter: ListRoleFilter): Promise<{ role: Role[] }> {
        const query = this.db.getRepository(Role)
            .createQueryBuilder('role')
            .take(listRoleFilter.result)
            .skip((listRoleFilter.page - 1) * listRoleFilter.result);

        try {
            const listeRole = await query.getMany();
            return { role: listeRole };
        } catch (error) {
            console.error('Error fetching roles:', error);
            throw new Error('Error fetching roles');
        }
    }
}