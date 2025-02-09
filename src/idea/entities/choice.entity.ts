import { ObjectId } from 'mongodb';
import { Entity, Column, ObjectIdColumn } from 'typeorm';

@Entity('choices')
export class Choice {
    @ObjectIdColumn()
    _id: ObjectId;

    @Column()
    field: string;

    @Column()
    code: string;

    @Column()
    displayName: string;

    @Column()
    createdAt: Date;

    @Column()
    isSelectable: boolean;

}