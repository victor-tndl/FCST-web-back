import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

export enum productState {
    'OPENED' = 'OPENED',
    'SOLD' = 'SOLD',
    'CLOSED' = 'CLOSED'
}

export enum productType {
    'COMPUTER' = 'COMPUTER',
    'PIECES' = 'PIECES'
}

/**
 * Initial class for one product
 * @class Product
 */
@Entity()
export class Product {
    @PrimaryGeneratedColumn("uuid")
    id: String = '';

    @Column("varchar")
    title: String = '';

    @Column("text")  
    description: String = '';

    @Column("float")
    price: number = 0;

    @Column({
        type: "enum",
        enum: ["OPENED" , "SOLD" , "CLOSED"],
        default: "OPENED"
    })
    status: String = productState.OPENED;

    @Column({
        type: "enum",
        enum: ["COMPUTER" , "PIECES"],
        default: "COMPUTER"
    })
    type: String = productType.COMPUTER;

    @Column("longtext")
    image: String='';

    @Column("text")
    seller: String='';

}
