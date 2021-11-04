import {EntityRepository, Repository} from "typeorm";
import {User} from "../entity/User";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    public findById = (id: String) => {
        return this.createQueryBuilder("user")
            .where("user.id = :id", { id })
            .getOne();
    }

    public findByName = (name: String) => {
        return this.createQueryBuilder("user")
            .where("user.id = :id", { name })
            .getOne();
    }

    public findByEmail = (email: String) => {
        return this.createQueryBuilder("user")
            .where("user.email = :email", { email })
            .getOne();
    }

    public findByEmailWithPassword = (email: String) => {
        return this.createQueryBuilder("user")
            .addSelect('user.password')
            .where("user.email = :email", { email })
            .getOne();
    }
}
