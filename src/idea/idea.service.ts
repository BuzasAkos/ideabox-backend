import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';
import { Idea } from './entities/idea.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class IdeaService {

  ideas: Idea[] = [];

  constructor() {}

  
  create(createIdeaDto: CreateIdeaDto) {
    const { title, description } = createIdeaDto;
    try {
      const newIdea = {
        title,
        description,
        _id: uuidv4(),
        status: 'submitted',
        voteCount: 0,
        votes: [],
        comments: [],
        createdAt: new Date(),
        createdBy: 'User',
        boolId: true
      }
      this.ideas.push(newIdea);
      return newIdea;
    } catch(error) {
      console.log(error);
      throw new HttpException('Idea posting failed', HttpStatus.NOT_ACCEPTABLE);
    }
  }

  findAll() {
    const ideas = this.ideas.filter(item => item.boolId === true);
    return ideas;
  }

  findOne(id: string) {
    const idea = this.ideas.find(item => item._id === id && item.boolId);
    if (!idea) {
      throw new HttpException('idea is not found with this id', HttpStatus.NOT_FOUND);
    }
    return idea;
  }

  update(id: string, updateIdeaDto: UpdateIdeaDto) {
    const idea = this.findOne(id);
    const { title, description } = updateIdeaDto;

    idea.title = title ?? idea.title;
    idea.description = description ?? idea.description;

    return this.saveIdea(idea);
  }

  remove(id: string) {
    const idea = this.findOne(id);

    idea.boolId = false;
    this.saveIdea(idea)

    return {message: 'idea deleted'};
  }

  saveIdea(idea: Idea) {
    const index = this.ideas.findIndex(item => item._id === idea._id && item.boolId);
    if (index === -1) return null;
    this.ideas[index] = idea;
    return this.ideas[index];
  }
}
