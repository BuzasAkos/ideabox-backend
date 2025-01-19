import { ObjectId } from "mongodb";

export class Idea {
    _id: ObjectId;
    title: string;
    description?: string;
    voteCount: number;
    votes: Vote[];
    comments: Comment[];
    status: string;
    history: IdeaHistory[];
    createdBy: string;
    createdAt: Date;
    modifiedBy: string;
    modifiedAt: Date;
    boolId: boolean;
}

export class Vote {
    id: string;
    createdBy: string;
    createdAt: Date;
    modifiedBy: string;
    modifiedAt: Date;
    boolId: boolean;
}

export class Comment {
    id: string;
    text: string;
    createdBy: string;
    createdAt: Date;
    modifiedBy: string;
    modifiedAt: Date;
    boolId: boolean;
}

export class IdeaHistory {
    id: string;
    title?: string;
    description?: string;
    status?: string;
    createdBy: string;
    createdAt: Date;
}
