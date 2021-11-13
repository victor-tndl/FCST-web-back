import { getCustomRepository } from "typeorm";
import { User } from "../entity/User";
import { UserRepository } from "../repository/UserRepository";
import Logger from "./Logger";
const jwt = require("jsonwebtoken");

/**
 * User service class
*/
export class UserService {

    private userRepository: UserRepository;

    constructor() {
        this.userRepository = getCustomRepository(UserRepository);
    }

    /**
     * Get user by id
     * @param id 
     * @returns user | undefined
     */
    public findOne = async (id: String) => {
        const user = await this.userRepository.findById(id);
        return user;
    }

    /**
     * 
     * @returns user[] | undefined
     */
    public findAll = async () => {
        const users = await this.userRepository.find();
        return users;
    }

    /**
     * 
     * @returns user | undefined
     */
    public findByEmail = async (email: string) => {
        const user = await this.userRepository.findByEmail(email);
        return user;
    }

    /**
     * 
     * @returns user | undefined
     */
     public findByEmailWithPassword = async (email: string) => {
        const user = await this.userRepository.findByEmailWithPassword(email);
        return user;
    }

    /**
     * Create a new user entity
     * @param body Validated body of the request
     * @returns boolean
     */
     public create = async (body: User) => {
        try {
            const user = await this.userRepository.save(body);
            if (user !== undefined || user !== null) {
                const token = jwt.sign(
                    { 
                        user_id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                    },
                    process.env.TOKEN_KEY,
                    {
                        expiresIn: "2h",
                    }
                );
        
                user.token = token;
                await this.userRepository.save(user);
                // Success
                return user;
            }

            // Error while creating the new user (the user already exists)
            return false;
        } catch (err) {
            Logger.error(err);
            return false;
        }
    }

    /**
     * Save a new user entity
     * @param body Validated body of the request
     * @returns boolean
     */
     public save = async (user: Object) => {
        try {
            const userSaved = await this.userRepository.save(user);
            if (userSaved !== undefined || userSaved !== null) {
                // Success
                return true;
            }

            // Error while creating the new user (the user already exists)
            return false;
        } catch (err) {
            Logger.error(err);
            return false;
        }
    }

    /**
     * Update one user
     * @param body Validated body of the request
     * @returns boolean
     */
     public update = async (body: Object, id: number) => {
        try {
            const user = await this.userRepository.findOne(id);
            if (user !== undefined) {
                this.userRepository.merge(user, body);
                const userResult = await this.userRepository.save(user);
                if (userResult !== undefined || userResult !== null) {
                    // Success
                    return true;
                }

                // Error while creating the new user (the user already exists)
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
     * @param id user's id to delete
     * @returns boolean
     */
     public delete = async (id: string) => {
        try {
            const results = await this.userRepository.delete(id);
            return results.affected;
        }  catch (err) {
            Logger.error(err);
            return false;
        }
    }
}
