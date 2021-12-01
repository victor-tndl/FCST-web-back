import { getCustomRepository } from "typeorm";
import { Message } from "../entity/Message";
import { User } from "../entity/User";
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
     * Find all messages
     * @returns message[] | undefined
     */
    public findAll = async () => {
        const messages = await this.messageRepository.findAll();
        return messages;
    }

    /**
     * Find all messages by user (sent aand received)
     * @returns message[] | undefined
     */
    public findMessageByUser = async (user: User) => {
        const messages = await this.messageRepository.findMessageByUser(user);
        return messages;
    }

    /**
     * Find all messages sent by user 
     * @returns message[] | undefined
     */
     public findMessageSentByUser = async (user: User) => {
        const messages = await this.messageRepository.findMessageSentByUser(user);
        return messages;
    }

    /**
     * Find all messages received by user
     * @returns message[] | undefined
     */
     public findMessageReceivedByUser = async (user: User) => {
        const messages = await this.messageRepository.findMessageReceivedByUser(user);
        return messages;
    }

    /**
     * Create a new message entity
     * @param body Validated body of the request
     * @returns Message | null
     */
    public create = async (body: any) => {
        try {
            const message = await this.messageRepository.save(body);
            if (message !== undefined || message !== null) {
                // Success
                return message;
            }

            // Error while creating the new message (the message already exists)
            return null;
        } catch (err) {
            Logger.error(err);
            return null;
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
