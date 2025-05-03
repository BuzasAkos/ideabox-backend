import { ObjectId } from 'mongodb';
import { Entity, Column, ObjectIdColumn } from 'typeorm';

@Entity('ai-chat')
export class AiChat {
    @ObjectIdColumn()
    _id: ObjectId;

    @Column()
    type: string;

    @Column()
    systemPrompt: string;

    @Column()
    chatMessages: ChatMessage[];

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

export class ChatMessage {
    @Column()
    id: string;

    @Column()
    role: string;

    @Column()
    text: string;

    @Column()
    createdAt: Date;
}