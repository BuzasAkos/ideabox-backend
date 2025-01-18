export class Idea {
    _id: string;
    title: string;
    description?: string;
    voteCount: number;
    votes: Vote[];
    comments: Comment[];
    status: string;
    createdBy: string;
    createdAt: Date;
    boolId: boolean;
}

export class Vote {
    id: string;
    createdBy: string;
    createdAt: Date;
    boolId: boolean;
}

export class Comment {
    id: string;
    text: string;
    createdBy: string;
    createdAt: Date;
    boolId: boolean;
}
