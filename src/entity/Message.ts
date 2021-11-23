import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";
import { User } from "./User";

/**
 * Initial class for one message
 * @class message
 */
@Entity()
export class Message {
    @PrimaryGeneratedColumn("uuid")
    id: String = '';

    @ManyToOne(() => User, user => user.id, {
        eager: true
    })
    @JoinColumn()
    sender!: User;

    @ManyToOne(() => User, user => user.id, {
        eager: true
    })
    @JoinColumn()
    receiver!: User;

    @CreateDateColumn()
    date: Date = new Date();

    @Column("text")
    content: String = '';
}
