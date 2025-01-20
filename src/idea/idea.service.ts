import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';
import { Idea, IdeaHistory } from './entities/idea.entity';
import { v4 as uuidv4 } from 'uuid';
import { MongoRepository, WithoutId } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';

@Injectable()
export class IdeaService {

  // ideas: Idea[] = [];

  constructor(
    @InjectRepository(Idea)
    private ideaRepository: MongoRepository<Idea>
  ) { }

  // create and save a new idea document submitted by a user
  async create(createIdeaDto: CreateIdeaDto) {
    const { title, description } = createIdeaDto;
    const user = 'Ákos';
    const status = 'new';
    try {
      const idea: WithoutId<Idea> = {
        title,
        description,
        status,
        voteCount: 0,
        votes: [],
        comments: [],
        createdAt: new Date(),
        createdBy: user,
        modifiedAt: new Date(),
        modifiedBy: user,
        boolId: true,
        history: []
      }
      idea.history.push({
        id: uuidv4(),
        title,
        description,
        status,
        createdAt: new Date(),
        createdBy: user,
      });
      
      return await this.ideaRepository.save(idea);
    } 
    catch(error) {
      console.log(error);
      throw new HttpException('Idea saving failed', HttpStatus.NOT_ACCEPTABLE);
    }
  }

  // get all existing ideas in an array
  async findAll() {
    const ideas = await this.ideaRepository.find({
      where: { boolId: true }
    });
    return ideas;
  }

  // get one idea document given by its id
  async findOne(id: string) {
    const idea = await this.ideaRepository.findOne({
      where: { _id: new ObjectId(id), boolId: true }
    });
    if (!idea) {
      throw new HttpException('idea is not found with this id', HttpStatus.NOT_FOUND);
    }
    return idea;
  }

  // update idea title and/or description by user
  async update(id: string, updateIdeaDto: UpdateIdeaDto) {
    const user = 'Ákos'
    const idea = await this.findOne(id);
    const { title, description, status } = updateIdeaDto;
    if (!title && !description && !status) {
      return idea;
    }

    idea.title = title ?? idea.title;
    idea.description = description ?? idea.description;
    idea.status = status ?? idea.status;
    idea.modifiedBy = user;
    idea.modifiedAt = new Date()
    idea.history.push({
      id: uuidv4(),
      ...updateIdeaDto,
      createdAt: new Date(),
      createdBy: user,
    });

    return await this.ideaRepository.save(idea);
  }

  // remove an idea (set boolId = false)
  async remove(id: string) {
    const user = 'Ákos';
    const idea = await this.findOne(id);

    idea.modifiedBy = user;
    idea.modifiedAt = new Date();
    idea.boolId = false;
    await this.ideaRepository.save(idea);

    return {message: 'idea deleted'};
  }

  // add a vote to an idea by a user
  async addVote(id: string) {
    const user = 'Ákos';
    const idea = await this.findOne(id);
    if (idea.votes.find(item => item.boolId && item.createdBy === user)) {
      throw new HttpException('You have already voted for this idea.', HttpStatus.NOT_ACCEPTABLE);
    }

    idea.votes.push({
      id: uuidv4(),
      createdBy: user,
      createdAt: new Date(),
      modifiedBy: user,
      modifiedAt: new Date(),
      boolId: true
    });
    idea.voteCount = idea.votes.filter(item => item.boolId).length;
    idea.modifiedBy = user
    idea.modifiedAt = new Date();

    return await this.ideaRepository.save(idea);
  }

  // remove a vote from an idea by a user
  async removeVote(id: string) {
    const user = 'Ákos';
    const idea = await this.findOne(id);
    const vote= idea.votes.find(item => item.createdBy === user && item.boolId);
    if (!vote) {
      throw new HttpException('Vote not found by this user.', HttpStatus.NOT_FOUND);
    }

    vote.boolId = false;
    vote.modifiedBy = user
    vote.modifiedAt = new Date();
    idea.voteCount = idea.votes.filter(item => item.boolId).length;
    idea.modifiedBy = user
    idea.modifiedAt = new Date();

    return await this.ideaRepository.save(idea);
  }

  // add comment by user
  async addComment(id: string, text: string) {
    const user = 'Ákos';
    const idea = await this.findOne(id);

    idea.comments.push({
      id: uuidv4(),
      text,
      createdBy: user,
      createdAt: new Date(),
      modifiedBy: user,
      modifiedAt: new Date(),
      boolId: true
    });

    return await this.ideaRepository.save(idea);
  }

  // remove a specific comment
  async removeComment(id: string, commentId: string) {
    const user = 'Ákos';
    const idea = await this.findOne(id);
    const comment = idea.comments.find(item => item.boolId && item.id === commentId);
    if (!comment) {
      throw new HttpException('Comment not found with this id.', HttpStatus.NOT_FOUND);
    }
    if (comment.createdBy !== user) {
      throw new HttpException('You are not authorized to delete this comment', HttpStatus.UNAUTHORIZED);
    }

    comment.boolId = false;
    comment.modifiedAt = new Date();
    comment.modifiedBy = user;

    await this.ideaRepository.save(idea);
    return {message: 'comment deleted'}
  }

  // get all ideas that I voted for, sort by submission date, filtering on boolId in all embedded arrays
  async getFavouriteIdeas() {
    const user = 'Ákos';

    const pipeline = [
      { 
        $match: { 
          boolId: true, 
          votes: { 
            $elemMatch: { createdBy: user, boolId: true } 
          }
        } 
      },
      { 
        $addFields: { 
          comments: { $filter: { 
            input: "$comments",      
            as: "comment",
            cond: { $eq: ["$$comment.boolId", true] }
          } } 
        } 
      },
      { 
        $addFields: { 
          votes: { $filter: { 
            input: "$votes",      
            as: "vote",
            cond: { $eq: ["$$vote.boolId", true] }
          } } 
        } 
      },
      { 
        $unset: "history" 
      },
      { 
        $sort: { voteCount: -1, createdAt: -1 } 
      },
    ]
    const ideas = await this.ideaRepository.aggregate(pipeline).toArray();

    return { ideas };
  }

  // get all ideas ranked by votes, filtered by boolId, sorting embedded comments by creation date
  async getAllIdeas() {
    const pipeline = [
      { 
        $match: { boolId: true } 
      },
      { 
        $addFields: { 
          comments: { $filter: { 
            input: "$comments",      
            as: "comment",
            cond: { $eq: ["$$comment.boolId", true] }
          } } 
        } 
      },
      { 
        $addFields: { 
          comments: { $sortArray: { 
            input: "$comments",      
            sortBy: { createdAt: -1 }
          } } 
        } 
      },
      { 
        $addFields: { 
          votes: { $filter: { 
            input: "$votes",      
            as: "vote",
            cond: { $eq: ["$$vote.boolId", true] }
          } } 
        } 
      },
      { 
        $unset: "history" 
      },
      { 
        $sort: { voteCount: -1, createdAt: -1 } 
      },
    ]
    const ideas: Idea[] = await this.ideaRepository.aggregate(pipeline).toArray();

    return { ideas };
  }

}
