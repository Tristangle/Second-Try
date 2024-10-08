import { Request, Response } from "express";
import { AppDataSource } from "../../database/database";
import { createUserValidation, loginUserValidation, updateUserValidation, userListValidation, userUpdateRoleValidation } from "../../handlers/validators/user-validator";
import { generateValidationErrorMessage } from "../../handlers/validators/generate-validation-message";
import { User } from "../../database/entities/user";
import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { Token } from "../../database/entities/token";
import { Role } from "../../database/entities/role";
import { UserUsecase } from "../usecases/user-usecase";
import { getUserIdFromToken } from "../../handlers/utils/getUserId";
import { UserAbonnementUseCase } from "../usecases/userAbonnement-usecase";
import { UserAbonnementStatus } from "../../database/entities/userAbonnement";
import { Bannissement } from "../../database/entities/bannissement";

export class userController {
    private userUsecase: UserUsecase;
    private userAbonnementUseCase: UserAbonnementUseCase;


    constructor() {
        this.userUsecase = new UserUsecase(AppDataSource);
        this.userAbonnementUseCase = new UserAbonnementUseCase(AppDataSource);
    }

    async signup(req: Request, res: Response): Promise<Response> {
        try {
            const userValidation = createUserValidation.validate(req.body);
            if (userValidation.error) {
                return res.status(400).send(generateValidationErrorMessage(userValidation.error.details));
            }

            const createUserRequest = userValidation.value;
            const hashedPassword = await hash(createUserRequest.password, 10);

            const userRepository = AppDataSource.getRepository(User);
            const roleRepository = AppDataSource.getRepository(Role);

            const role = await roleRepository.findOneBy({ id: 2 });
            if (!role) {
                return res.status(400).send({ error: 'Role not found' });
            }

            const user = userRepository.create({
                username: createUserRequest.username,
                email: createUserRequest.email,
                password: hashedPassword,
                role: role,
            });

            await userRepository.save(user);


            // Assignation automatique de l'abonnement "Free"
            const freeAbonnementId = 1; 

            await this.userAbonnementUseCase.createUserAbonnement({
                userId: user.id,
                abonnementId: freeAbonnementId,
                startDate: new Date(),
                endDate: undefined, // L'abonnement "Free" n'expire pas
                status: UserAbonnementStatus.Active,
                createdAt: new Date(),
                updatedAt: new Date(),
            }); // isAnnual = false pour l'abonnement "Free"


            return res.status(201).send({ id: user.id, email: user.email, role: user.role });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ error: 'Internal error retry later' });
        }
    }

    async login(req: Request, res: Response): Promise<Response> {
        try {
            const userValidation = loginUserValidation.validate(req.body);
            if (userValidation.error) {
                return res.status(400).send(generateValidationErrorMessage(userValidation.error.details));
            }

            const loginUserRequest = userValidation.value;
            const user = await AppDataSource.getRepository(User).findOneBy({ username: loginUserRequest.username });
            if (!user) {
                return res.status(400).send({ error: "Le username ou password n'est pas valide" });
            }

            const isValid = await compare(loginUserRequest.password, user.password);
            if (!isValid) {
                return res.status(400).send({ error: "Le username ou password n'est pas valide" });
            }

            const secret = process.env.JWT_SECRET ?? "";
            const token = sign({ userId: user.id, username: user.username, roles: user.role.id }, secret, { expiresIn: '1d' });
            await AppDataSource.getRepository(Token).save({ token: token, user: user });

            return res.status(200).json({ token });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ error: "internal error retry later" });
        }
    }

    async logout(req: Request, res: Response): Promise<Response> {
        try {
            const tokenRepository = AppDataSource.getRepository(Token);
            const authToken = req.headers.authorization;
            const token = authToken!.replace(/"/g, '').split(' ')[1];
            await tokenRepository.delete({ token: token });
            return res.status(201).send({ message: "Déconnexion réussie" });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ "error": "pas connecté : internal error retry later" });
        }
    }

    async getUsers(req: Request, res: Response): Promise<Response> {
        const usersValidation = userListValidation.validate(req.body);
        if (usersValidation.error) {
            return res.status(400).send(generateValidationErrorMessage(usersValidation.error.details));
        }

        const userList = usersValidation.value;
        const result = userList.result || 20;
        const page = userList.page || 1;

        try {
            const listUser = await this.userUsecase.userList({ ...userList, page, result });
            return res.status(200).send(listUser);
        } catch (error) {
            console.log(error);
            return res.status(500).send({ error: "Internal error" });
        }
    }

    async getUserById(req: Request, res: Response): Promise<Response> {
        try {
            const userId = parseInt(req.params.id, 10);
            const userRepository = AppDataSource.getRepository(User);
            const bannissementRepository = AppDataSource.getRepository(Bannissement);

            const user = await userRepository.findOne({ where: { id: userId }, relations: ['role'] });

            if (!user) {
                return res.status(404).json({ error: 'Utilisateur non trouvé' });
            }

            // Vérifiez si l'utilisateur est banni
            const bannissement = await bannissementRepository.findOne({
                where: { user: { id: userId } },
                order: { startDate: 'DESC' }
            });

            if (bannissement && (bannissement.isPermanent || new Date(bannissement.endDate) > new Date())) {
                return res.status(403).json({ error: 'Utilisateur banni' });
            }

            return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
    }

    async updateUser(req: Request, res: Response): Promise<Response> {
        const userId = getUserIdFromToken(req);
        const updateParams = req.body;
    
        const { error } = updateUserValidation.validate(updateParams);
        if (error) {
            return res.status(400).json({ message: 'Invalid request data', error: error.details });
        }
    
        try {
            const updatedUser = await this.userUsecase.update(userId!, updateParams);
            if (updatedUser) {
                return res.json(updatedUser);
            } else {
                return res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async updateAdminUser(req: Request, res: Response): Promise<Response> {
        const userId = parseInt(req.params.userId);  // Récupère l'ID de l'utilisateur à partir de l'URL
        const updateParams = req.body;
      
        const { error } = updateUserValidation.validate(updateParams);
        if (error) {
          return res.status(400).json({ message: 'Invalid request data', error: error.details });
        }
      
        try {
          const updatedUser = await this.userUsecase.update(userId, updateParams);
          if (updatedUser) {
            return res.json(updatedUser);
          } else {
            return res.status(404).json({ message: 'User not found' });
          }
        } catch (error) {
            console.error('Error updating user:', error);  // Ajoutez un log de l'erreur
          return res.status(500).json({ message: 'Internal server error' });
        }
      }

    async deleteUser(req: Request, res: Response): Promise<Response> {
        const userId = parseInt(req.params.id, 10);
        
        try {
            await this.userUsecase.deleteUser(userId);
            return res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Internal error' });
        }
    }

    async updateUserRole(req: Request, res: Response): Promise<Response> {
        const userId = parseInt(req.params.id, 10);
        const { roleId } = req.body;
      
        const validation = userUpdateRoleValidation.validate({ roleId });
        if (validation.error) {
            return res.status(400).send(generateValidationErrorMessage(validation.error.details));
        }
      
        try {
            const updatedUser = await this.userUsecase.updateUserRole(userId, roleId);
            if (updatedUser) {
                return res.status(200).json({ message: 'Role updated successfully', user: updatedUser });
            } else {
                return res.status(404).json({ error: 'User or Role not found' });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Internal error' });
        }
    }

    getUserId(req: Request, res: Response): Response {
        const userId = getUserIdFromToken(req);
        if (userId) {
            return res.json({ userId });
        } else {
            return res.status(404).send('Utilisateur non trouvé');
        }
    }
}
export const userControllerInstance = new userController();
