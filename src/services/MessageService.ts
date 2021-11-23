import { getCustomRepository } from "typeorm";
import { MessageRepository } from "../repository/MessageRepository";
import Logger from "./Logger";

/**
 * Message service class
*/
export class MessageService {

    private messageRepository: MessageRepository;

    constructor() {
        this.messageRepository = getCustomRepository(MessageRepository);
    }

    /**
     * Get message by id
     * @param id 
     * @returns message | undefined
     */
    public findOne = async (id: String) => {
        const message = await this.messageRepository.findById(id);
        return message;
    }

    /**
     * 
     * @returns message[] | undefined
     */
    public findAll = async () => {
        const messages = await this.messageRepository.find();
        return messages;
    }

    /**
     * Create a new message entity
     * @param body Validated body of the request
     * @returns boolean
     */
    public create = async (body: Object) => {
        try {
            const message = await this.messageRepository.save(body);
            if (message !== undefined || message !== null) {
                // Success
                return true;
            }

            // Error while creating the new message (the message already exists)
            return false;
        } catch (err) {
            Logger.error(err);
            return false;
        }
    }

    /**
     * Update one message
     * @param body Validated body of the request
     * @returns boolean
     */
    public update = async (body: Object, id: number) => {
        try {
            const message = await this.messageRepository.findOne(id);
            if (message !== undefined) {
                this.messageRepository.merge(message, body);
                const messageResult = await this.messageRepository.save(message);
                if (messageResult !== undefined || messageResult !== null) {
                    // Success
                    return true;
                }

                // Error while creating the new message (the message already exists)
                return false;
            }
            return false;
        } catch (err) {
            Logger.error(err);
            return false;
        }
    }

    /**
     * 
     * @param id message's id to delete
     * @returns boolean
     */
    public delete = async (id: string) => {
        try {
            const results = await this.messageRepository.delete(id);
            return results.affected;
        }  catch (err) {
            Logger.error(err);
            return false;
        }
    }
}
