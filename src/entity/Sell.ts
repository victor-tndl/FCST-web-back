import {Entity, PrimaryGeneratedColumn, Unique, ManyToOne} from "typeorm";
import { Product } from "./Product";
import { User } from "./User";

@Entity()
@Unique(["seller", "buyer", "product"])
export class Sell {
    @PrimaryGeneratedColumn("uuid")
    id!: String;

    @ManyToOne(() => User, user => user.id)
    seller!: User;

    @ManyToOne(() => User, user => user.id)
    buyer!: User;

    @ManyToOne(() => Product, product => product.id)
    product!: Product;
}
