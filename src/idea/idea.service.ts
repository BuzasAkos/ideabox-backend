import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';
import { Idea, IdeaHistory } from './entities/idea.entity';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';

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
        _id: new ObjectId(),
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
    const idea = this.ideas.find(item => item._id.toString() === id && item.boolId);
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
    idea.history.push({
      id: uuidv4(),
      ...updateIdeaDto,
      createdAt: new Date(),
      createdBy: user,
    });

    return idea;
  }

  // remove an idea (set boolId = false)
  remove(id: string) {
    const user = 'Ákos'
    const idea = this.findOne(id);

    idea.modifiedBy = user;
    idea.modifiedAt = new Date();
    idea.boolId = false;

    return {message: 'idea deleted'};
  }

}
