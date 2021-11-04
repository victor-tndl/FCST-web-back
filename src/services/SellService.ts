import { getCustomRepository } from "typeorm";
import { SellRepository } from "../repository/SellRepository";
import Logger from "./Logger";

/**
 * sell service class
*/
export class SellService {

    private sellRepository: SellRepository;

    constructor() {
        this.sellRepository = getCustomRepository(SellRepository);
    }

    /**
     * Get sell by id
     * @param id 
     * @returns sell | undefined
     */
    public findOne = async (id: String) => {
        const sell = await this.sellRepository.findById(id);
        return sell;
    }

    /**
     * 
     * @returns sell[] | undefined
     */
    public findAll = async () => {
        const sells = await this.sellRepository.find();
        return sells;
    }

    /**
     * Create a new sell entity
     * @param body Validated body of the request
     * @returns boolean
     */
     public create = async (body: Object) => {
        try {
            const sell = await this.sellRepository.save(body);
            if (sell !== undefined || sell !== null) {
                // Success
                return true;
            }

            // Error while creating the new sell (the sell already exists)
            return false;
        } catch (err) {
            Logger.error(err);
            return false;
        }
    }

    /**
     * Update one sell
     * @param body Validated body of the request
     * @returns boolean
     */
     public update = async (body: Object, id: number) => {
        try {
            const sell = await this.sellRepository.findOne(id);
            if (sell !== undefined) {
                this.sellRepository.merge(sell, body);
                const sellResult = await this.sellRepository.save(sell);
                if (sellResult !== undefined || sellResult !== null) {
                    // Success
                    return true;
                }

                // Error while creating the new sell (the sell already exists)
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
     * @param id sell's id to delete
     * @returns boolean
     */
     public delete = async (id: string) => {
        try {
            const results = await this.sellRepository.delete(id);
            return results.affected;
        }  catch (err) {
            Logger.error(err);
            return false;
        }
    }
}
