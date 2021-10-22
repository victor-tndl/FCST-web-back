import {EntityRepository, Repository} from "typeorm";
import {User} from "../entity/User";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    public findById = (id: String) => {
        return this.createQueryBuilder("user")
            .where("user.id = :id", { id})
            .getOne();
    }

    public findByName = (name: String) => {
        return this.createQueryBuilder("user")
            .where("user.id = :id", { name})
            .getOne();
    }

    public findByuserType = (userType: String) => {
        return this.createQueryBuilder("user")
            .where("user.userType = :id", { userType})
            .getMany();
    }

    public findTimeTable = () => {
        return this.createQueryBuilder("user")
            .innerJoinAndSelect("user.timeslots", "ts")
            .getMany();
    }
}
