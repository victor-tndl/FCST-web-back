import { EntityRepository, Repository } from "typeorm";
import { Message} from "../entity/Message";

@EntityRepository(Message)
export class MessageRepository extends Repository<Message> {
    public findById = (id: String) => {
        return this.createQueryBuilder("message")
            .where("message.id = :id", { id})
            .getOne();
    }

    public findByName = (name: String) => {
        return this.createQueryBuilder("Message")
            .where("message.id = :id", { name})
            .getOne();
    }
}
