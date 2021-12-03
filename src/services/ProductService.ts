import { getCustomRepository } from "typeorm";
import { ProductRepository } from "../repository/ProductRepository";
import Logger from "./Logger";

/**
 * Product service class
*/
export class ProductService {

    private productRepository: ProductRepository;

    constructor() {
        this.productRepository = getCustomRepository(ProductRepository);
    }

    /**
     * Get product by id
     * @param id 
     * @returns product | undefined
     */
    public findOne = async (id: String) => {
        const product = await this.productRepository.findById(id);
        return product;
    }

    /**
     * Get last product
     * @param id 
     * @returns product | undefined
     */
     public findLast = async () => {
        const product = await this.productRepository.findLast();
        return product;
    }

    /**
     * 
     * @returns product[] | undefined
     */
    public findAll = async () => {
        const products = await this.productRepository.find();
        return products;
    }

    /**
     * Create a new product entity
     * @param body Validated body of the request
     * @returns boolean
     */
     public create = async (body: any) => {
        try {
            body.image = Buffer.from(body.image);
            const product = await this.productRepository.save(body);

            if (product !== undefined || product !== null) {
                // Success
                return true;
            }

            // Error while creating the new product (the product already exists)
            return false;
        } catch (err) {
            Logger.error(err);
            return false;
        }
    }

    /**
     * Update one product
     * @param body Validated body of the request
     * @returns boolean
     */
     public update = async (body: Object, id: number) => {
        try {
            const product = await this.productRepository.findOne(id);
            if (product !== undefined) {
                this.productRepository.merge(product, body);
                const productResult = await this.productRepository.save(product);
                if (productResult !== undefined || productResult !== null) {
                    // Success
                    return true;
                }

                // Error while creating the new product (the product already exists)
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
     * @param id product's id to delete
     * @returns boolean
     */
     public delete = async (id: string) => {
        try {
            const results = await this.productRepository.delete(id);
            return results.affected;
        }  catch (err) {
            Logger.error(err);
            return false;
        }
    }
}
