import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';
import { Idea, IdeaHistory } from './entities/idea.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class IdeaService {

  ideas: Idea[] = [];

  constructor() {}

  // create and save a new idea document submitted by a user
  create(createIdeaDto: CreateIdeaDto) {
    const { title, description } = createIdeaDto;
    const user = 'Ákos';
    const status = 'new';
    try {
      const idea: Idea = {
        title,
        description,
        _id: uuidv4(),
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
      idea.history.push(this.createHistoryItem(idea, user));
      this.ideas.push(idea);
      return idea;
    } 
    catch(error) {
      console.log(error);
      throw new HttpException('Idea saving failed', HttpStatus.NOT_ACCEPTABLE);
    }
  }

  // get all existing ideas in an array
  findAll() {
    const ideas = this.ideas.filter(item => item.boolId === true);
    return ideas;
  }

  // get one idea document given by its id
  findOne(id: string) {
    const idea = this.ideas.find(item => item._id === id && item.boolId);
    if (!idea) {
      throw new HttpException('idea is not found with this id', HttpStatus.NOT_FOUND);
    }
    return idea;
  }

  // update idea title and/or description by user
  update(id: string, updateIdeaDto: UpdateIdeaDto) {
    const user = 'Ákos'
    const idea = this.findOne(id);
    const { title, description, status } = updateIdeaDto;
    if (!title && !description && !status) {
      return idea;
    }

    idea.title = title ?? idea.title;
    idea.description = description ?? idea.description;
    idea.status = status ?? idea.status;
    idea.modifiedBy = user;
    idea.modifiedAt = new Date()
    idea.history.push(this.createHistoryItem(idea, user));

    return this.saveIdea(idea);
  }

  // remove an idea (set boolId = false)
  remove(id: string) {
    const user = 'Ákos'
    const idea = this.findOne(id);

    idea.modifiedBy = user;
    idea.modifiedAt = new Date();
    idea.boolId = false;
    this.saveIdea(idea)

    return {message: 'idea deleted'};
  }

  // helper: generates a history item
  createHistoryItem(idea: Idea, user: string) {
    const historyItem: IdeaHistory = {
      id: uuidv4(),
      title: idea.title,
      description: idea.description,
      status: idea.status,
      createdBy: user,
      createdAt: new Date()
    }
    return historyItem;
  }

  // helper: saves an idea (in memory)
  saveIdea(idea: Idea) {
    const index = this.ideas.findIndex(item => item._id === idea._id && item.boolId);
    if (index === -1) return null;
    this.ideas[index] = idea;
    return this.ideas[index];
  }
}
