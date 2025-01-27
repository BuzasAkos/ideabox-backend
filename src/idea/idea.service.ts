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

  constructor(
    @InjectRepository(Idea)
    private ideaRepository: MongoRepository<Idea>
  ) { }

  // create and save a new idea document submitted by a user
  async createIdea(createIdeaDto: CreateIdeaDto, user: string) {
    const { title, description } = createIdeaDto;
    const status = 'new';

    const existingTitles = await this.getAllTitles();
    if (existingTitles.includes(title.toLowerCase())) {
      throw new HttpException('This title already exist', HttpStatus.CONFLICT);
    }
    
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

  // get all ideas ranked by votes, filtered embedded arrays by boolId
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
        $sort: { createdAt: -1 } 
      },
    ]
    const ideas: Idea[] = await this.ideaRepository.aggregate(pipeline).toArray();

    return { ideas };
  }

  // helper: get one idea document given by its id, throw error if not found
  async findOne(id: string) {
    const idea = await this.ideaRepository.findOne({
      where: { _id: new ObjectId(id), boolId: true }
    });
    if (!idea) {
      throw new HttpException('idea is not found with this id', HttpStatus.NOT_FOUND);
    }
    return idea;
  }

  // get one idea by id and return
  async getIdea(id: string) {
    const idea = await this.findOne(id);
    return this.filterValidItems( 
      await this.ideaRepository.save(idea) 
    );
  }

  // update idea title and/or description and/or status by user
  async updateIdea(id: string, updateIdeaDto: UpdateIdeaDto, user: string) {
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

    return this.filterValidItems( 
      await this.ideaRepository.save(idea) 
    );
  }

  // remove an idea (set boolId = false)
  async removeIdea(id: string, user: string) {
    const idea = await this.findOne(id);

    idea.modifiedBy = user;
    idea.modifiedAt = new Date();
    idea.boolId = false;
    await this.ideaRepository.save(idea);

    return {message: 'idea deleted'};
  }

  // add a vote to an idea by a user
  async addVote(id: string, user: string) {
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

    return this.filterValidItems( 
      await this.ideaRepository.save(idea) 
    );
  }

  // remove a vote from an idea by a user
  async removeVote(id: string, user: string) {
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

    return this.filterValidItems( 
      await this.ideaRepository.save(idea) 
    );
  }

  // add comment by user
  async addComment(id: string, text: string, user: string) {
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

    return this.filterValidItems( 
      await this.ideaRepository.save(idea) 
    );
  }

  // remove a specific comment
  async removeComment(id: string, commentId: string, user: string) {
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

  // bulk update idea status
  async statusUpdate(ideaIds: string[], status: string, user: string) {
    const now = new Date();
  
    const ideas = await this.ideaRepository.find({
      where: { _id: { $in: ideaIds.map(id => new ObjectId(id)) } },
    });
    
    let modCount = 0;
    for (const idea of ideas) {
      if (status !== idea.status) {
        idea.status = status;
        idea.modifiedAt = now;
        idea.modifiedBy = user;
        idea.history.push({
          id: uuidv4(),
          status,
          createdAt: now,
          createdBy: user,
        });
        modCount++
      }
    }
  
    await this.ideaRepository.save(ideas); 
    return { message: `Status updated for ${modCount} ideas.` };
  }

  // get all ideas that I voted for, sort by creation date, filtering on boolId in all embedded arrays
  async getFavouriteIdeas(user: string) {
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

  // helper: get existing idea titles
  async getAllTitles() {
    const ideas = await this.ideaRepository.find({
      where: {
        boolId: true, 
      },
      select: {
        title: true, 
      },
    });
  
    return ideas.map(idea => idea.title.toLowerCase());
  }

  // helper function: filter embedded arrays of an idea by boolId
  filterValidItems(idea: Idea): Idea {
    return {
      ...idea,
      votes: idea.votes.filter(i => i.boolId),
      comments: idea.comments.filter(i => i.boolId),
    }
  }

}
