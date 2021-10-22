import {EntityRepository, Repository} from "typeorm";
import {Sell} from "../entity/Sell";

@EntityRepository(Sell)
export class SellRepository extends Repository<Sell> {
    public findById = (id: String) => {
        return this.createQueryBuilder("sell")
            .where("sell.id = :id", { id})
            .getOne();
    }

    public findByName = (name: String) => {
        return this.createQueryBuilder("sell")
            .where("sell.id = :id", { name})
            .getOne();
    }

    public findBysellType = (sellType: String) => {
        return this.createQueryBuilder("sell")
            .where("sell.sellType = :id", { sellType})
            .getMany();
    }

    public findTimeTable = () => {
        return this.createQueryBuilder("sell")
            .innerJoinAndSelect("sell.timeslots", "ts")
            .getMany();
    }
}
