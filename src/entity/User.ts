import {Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany, JoinTable} from "typeorm";
import { Product } from "./Product";

@Entity()
@Unique(["email"])
@Unique(["firstName", "lastName"])
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column("varchar", {nullable: false})
    email!: string;

    @Column("varchar", {nullable: false, select: false})
    private password!: string;

    @Column("varchar", {length: 300, nullable: true, select: false})
    token!: string;

    @Column("varchar", {nullable: false})
    firstName!: string;

    @Column("varchar", {nullable: false})
    lastName!: string;

    @OneToMany(() => Product, products => products.id)
    @JoinTable()
    products!: Product[];

    getPassword = (): string => {
        return this.password;
    }
}
