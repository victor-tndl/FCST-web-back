import {Entity, PrimaryGeneratedColumn, Unique, ManyToOne} from "typeorm";
import { Product } from "./Product";
import { User } from "./User";

@Entity()
@Unique(["user", "product"])
export class Sell {
    @PrimaryGeneratedColumn("uuid")
    id!: String;

    @ManyToOne(() => User, user => user.id)
    user!: User;

    @ManyToOne(() => Product, product => product.id)
    product!: Product;
}
