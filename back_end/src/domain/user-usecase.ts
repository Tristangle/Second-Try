import { DataSource } from "typeorm";
import { User } from "../database/entities/user";
import { AppDataSource } from "../database/database";
import { Err } from "joi";
import { Role } from "../database/entities/roles";

export interface listUserFilter{
    page: number,
    result: number
}

export class UserUsecase{
    constructor(private readonly db: DataSource) { }

    async userList(listUserFilter: listUserFilter): Promise<{ user: User[] }> {
        const query = this.db.getRepository(User)
          .createQueryBuilder('user')
          .leftJoinAndSelect('user.roles', 'role')  
          .take(listUserFilter.result)
          .skip((listUserFilter.page - 1) * listUserFilter.result);
    
        const listeUser = await query.getMany();
        return { user: listeUser };
      }

    async deleteUser(userId: number): Promise<void> {
        const userRepository = this.db.getRepository(User);
        const user = await userRepository.findOneBy({ id: userId });
        if (user) {
          await userRepository.remove(user);
        }
    }

    async updateUserRole(userId: number, roleId: number): Promise<User | null> {
        const userRepository = this.db.getRepository(User);
        const roleRepository = this.db.getRepository(Role);
    
        const user = await userRepository.findOneBy({ id: userId });
        const role = await roleRepository.findOneBy({ id: roleId });
    
        if (user && role) {
          user.roles = role;
          await userRepository.save(user);
          return user;
        }
        return null;
      }
    
}
