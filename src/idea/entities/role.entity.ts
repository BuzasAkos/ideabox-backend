import { ObjectId } from 'mongodb';
import { Entity, Column, ObjectIdColumn } from 'typeorm';

@Entity('roles')
export class Role {
    @ObjectIdColumn()
    _id: ObjectId;

    @Column()
    userName: string;

    @Column()
    userRoles: string[];

    @Column()
    createdAt: Date;

    @Column()
    modifiedAt: Date;

    @Column()
    boolId: boolean;

}