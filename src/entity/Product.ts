import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

export enum productState {
    'PENDING' = 'PENDING',
    'ACCEPTED' = 'ACCEPTED',
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

    @Column({
        type: "enum",
        enum: ["PENDING" , "ACCEPTED" , "CLOSED"],
        default: "PENDING"
    })
    state: String = productState.PENDING;

    @Column({
        type: "enum",
        enum: ["COMPUTER" , "PIECES"],
        default: "COMPUTER"
    })
    type: String = productType.COMPUTER;
}
