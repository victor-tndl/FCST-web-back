import {Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany, JoinTable} from "typeorm";
import { Product } from "./Product";

@Entity()
@Unique(["email"])
@Unique(["firstName", "lastName"])
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: String;

    @Column()
    email!: string;

    @Column()
    firstName!: String;

    @Column()
    lastName!: String;

    @OneToMany(() => Product, products => products.id)
    @JoinTable()
    products!: Product[];
}
