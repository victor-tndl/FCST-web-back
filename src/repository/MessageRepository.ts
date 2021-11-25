import { EntityRepository, Repository } from "typeorm";
import { Message} from "../entity/Message";
import { User } from "../entity/User";

@EntityRepository(Message)
export class MessageRepository extends Repository<Message> {
    public findById = (id: String) => {
        return this.createQueryBuilder("message")
            .where("message.id = :id", { id})
            .getOne();
    }

    public findByName = (name: String) => {
        return this.createQueryBuilder("message")
            .where("message.id = :id", { name})
            .getOne();
    }

    public findMessageByUser = (user: User) => {
        return this.createQueryBuilder("message")
            .where("message.sender = :id OR message.receiver = :id", { id: user.id })
            .innerJoinAndSelect("message.sender", "sd")
            .innerJoinAndSelect("message.receiver", "rv")
            .getMany();
    }

    public findMessageSentByUser = (user: User) => {
        return this.createQueryBuilder("message")
            .where("message.sender = :id", { id: user.id })
            .innerJoinAndSelect("message.sender", "sd")
            .innerJoinAndSelect("message.receiver", "rv")
            .getMany();
    }

    public findMessageReceivedByUser = (user: User) => {
        return this.createQueryBuilder("message")
            .where("message.receiver = :id", { id: user.id })
            .innerJoinAndSelect("message.sender", "sd")
            .innerJoinAndSelect("message.receiver", "rv")
            .getMany();
    }
}
