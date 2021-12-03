import {EntityRepository, Repository} from "typeorm";
import {Product} from "../entity/Product";

@EntityRepository(Product)
export class ProductRepository extends Repository<Product> {
    public findById = (id: String) => {
        return this.createQueryBuilder("product")
            .where("product.id = :id", { id})
            .getOne();
    }

    public findByName = (name: String) => {
        return this.createQueryBuilder("product")
            .where("product.id = :id", { name})
            .getOne();
    }

    public findByproductType = (productType: String) => {
        return this.createQueryBuilder("product")
            .where("product.productType = :id", { productType})
            .getMany();
    }

    public findLast = () => {
        return this.createQueryBuilder("product")
            .where("product.status = 'OPENED'")
            .orderBy('product.id', 'DESC')
            .getOne();
    }
}
