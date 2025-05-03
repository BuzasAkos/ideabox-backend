import { ObjectId } from 'mongodb';
import { Entity, Column, ObjectIdColumn } from 'typeorm';

@Entity('ideas')
export class Idea {
    @ObjectIdColumn()
    _id: ObjectId;

    @Column()
    title: string;

    @Column()
    description?: string;

    @Column()
    voteCount: number;

    @Column('json')
    votes: Vote[];

    @Column('json')
    comments: Comment[];

    @Column()
    status: string;

    @Column('json')
    history?: IdeaHistory[];

    @Column()
    createdBy: string;

    @Column()
    createdAt: Date;

    @Column()
    modifiedBy: string;

    @Column()
    modifiedAt: Date;

    @Column()
    boolId: boolean;
}

export class Vote {
    
    @Column()
    id: string;

    @Column()
    createdBy: string;

    @Column()
    createdAt: Date;

    @Column()
    modifiedBy: string;

    @Column()
    modifiedAt: Date;

    @Column()
    boolId: boolean;
}

export class Comment {
    
    @Column()
    id: string;

    @Column()
    text: string;

    @Column()
    aiChatRef?: string;

    @Column()
    sentiment?: string;

    @Column()
    createdBy: string;

    @Column()
    createdAt: Date;

    @Column()
    modifiedBy: string;

    @Column()
    modifiedAt: Date;

    @Column()
    boolId: boolean;
}

export class IdeaHistory {
    
    @Column()
    id: string;

    @Column()
    title?: string;

    @Column()
    description?: string;

    @Column()
    status?: string;

    @Column()
    createdBy: string;

    @Column()
    createdAt: Date;
}
