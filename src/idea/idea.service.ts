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
  async createIdea(createIdeaDto: CreateIdeaDto, user: string) {
    const { title, description } = createIdeaDto;
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
  async getAllIdeas() {
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

  // get one idea and return
  async getIdea(id: string) {
    const idea = await this.findOne(id);
    return idea;
  }

  // update idea title and/or description by user
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

    return await this.ideaRepository.save(idea);
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

}
