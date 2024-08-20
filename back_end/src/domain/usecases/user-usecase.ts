import { DataSource } from "typeorm";
import { User } from "../../database/entities/user";
import { Role } from "../../database/entities/role";
import { hash } from "bcrypt";
import { Token } from "../../database/entities/token";
import { Immobilier } from "../../database/entities/immobilier";
import { Facture } from "../../database/entities/facture";
import { UserAbonnement } from "../../database/entities/userAbonnement";
import { immobilierUseCase } from "./immobilier-usecase";
import { AppDataSource } from "../../database/database";
import { documentUseCase } from "./document-usecase";
import { Document } from "../../database/entities/document";
import { factureUseCase } from "./facture-usecase";
import { abonnementUseCase } from "./abonnement-usecase";
import { UserAbonnementUseCase } from "./userAbonnement-usecase";
export interface listUserFilter{
    page: number,
    result: number
}
export interface UpdateUserParams {
    name?: string;
    email?: string;
    password?: string;
  }
export class UserUsecase {
    constructor(private readonly db: DataSource) { }

    async getUserById(userId: number): Promise<User | null> {
        const userRepository = this.db.getRepository(User);
        const user = await userRepository.findOne({
            where: { id: userId }
        });
        return user;
    }

    async userList(listUserFilter: listUserFilter): Promise<{ user: User[] }> {
        const query = this.db.getRepository(User)
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')  
            .take(listUserFilter.result)
            .skip((listUserFilter.page - 1) * listUserFilter.result);
    
        const listeUser = await query.getMany();
        return { user: listeUser };
    }

    async deleteUser(userId: number): Promise<void> {
        const userRepository = this.db.getRepository(User);
        const tokenRepository = this.db.getRepository(Token);
        const documentRepository = this.db.getRepository(Document);
        const immobilierRepository = this.db.getRepository(Immobilier);
        const factureRepository = this.db.getRepository(Facture);
        const userAbonnementRepository = this.db.getRepository(UserAbonnement);
    
        const immobilierUsecase = new immobilierUseCase(AppDataSource);
        const documentUsecase = new documentUseCase(AppDataSource);
        const factureUsecase = new factureUseCase(AppDataSource);
        const userAbonnementUsecase = new UserAbonnementUseCase(AppDataSource);
    
        // Rechercher l'utilisateur avec toutes les relations associées
        const userSearch = await userRepository.findOne({
            where: { id: userId },
            relations: [
                "documents",
                "ownedProperties",
                "rentedProperties",
                "facturesRecues",
                "userAbonnement"
            ]
        });
    
        if (!userSearch) {
            throw new Error("User not found");
        }
    
        // Supprimer les jetons associés
        await tokenRepository.delete({ user: { id: userId } });
    
        // Supprimer les documents créés par cet utilisateur
        if (userSearch.documents && userSearch.documents.length > 0) {
            for (const document of userSearch.documents) {
                await documentUsecase.deleteDocument(document.id);
            }
        }
    
        // Supprimer les abonnements utilisateur
        if (userSearch.userAbonnement && userSearch.userAbonnement.length > 0) {
            for (const userAbonnement of userSearch.userAbonnement) {
                await userAbonnementUsecase.deleteUserAbonnement(userAbonnement.id);
            }
        }
    
        // Supprimer les enregistrements immobiliers où l'utilisateur est propriétaire
        if (userSearch.ownedProperties && userSearch.ownedProperties.length > 0) {
            for (const immobilier of userSearch.ownedProperties) {
                await immobilierUsecase.deleteImmobilier(immobilier.id);
            }
        }
    
        // Supprimer les enregistrements immobiliers où l'utilisateur est locataire
        if (userSearch.rentedProperties && userSearch.rentedProperties.length > 0) {
            for (const immobilier of userSearch.rentedProperties) {
                immobilier.renter = null; // Si vous souhaitez simplement désassocier le locataire
                await immobilierRepository.save(immobilier);
            }
        }
    
        // Supprimer les factures reçues par cet utilisateur
        if (userSearch.facturesRecues && userSearch.facturesRecues.length > 0) {
            for (const facture of userSearch.facturesRecues) {
                await factureUsecase.deleteFacture(facture.id);
            }
        }
    
        // Supprimer l'utilisateur
        await userRepository.remove(userSearch);
    }

    async updateUserRole(userId: number, roleId: number): Promise<User | null> {
        const userRepository = this.db.getRepository(User);
        const roleRepository = this.db.getRepository(Role);
    
        const user = await userRepository.findOneBy({ id: userId });
        const role = await roleRepository.findOneBy({ id: roleId });
    
        if (user && role) {
            user.role = role;
            await userRepository.save(user);
            return user;
        }
        return null;
    }

    async update(userId: number, updateParams: UpdateUserParams): Promise<User | null> {
        const userRepository = this.db.getRepository(User);
        const user = await userRepository.findOneBy({ id: userId });

        if (!user) {
            return null;
        }
        if (updateParams.password) {
            const hashedPassword = await hash(updateParams.password, 10);
            updateParams.password = hashedPassword;
        }

        Object.assign(user, updateParams);
        await userRepository.save(user);
        return user;
    }
}
