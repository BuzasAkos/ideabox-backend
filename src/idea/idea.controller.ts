import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IdeaService } from './idea.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';

@Controller('idea')
export class IdeaController {
  constructor(private readonly ideaService: IdeaService) {}

  @Post()
  async createIdea(@Body() createIdeaDto: CreateIdeaDto) {
    return await this.ideaService.createIdea(createIdeaDto);
  }

  @Get()
  async getAllIdeas() {
    return await this.ideaService.getAllIdeas();
  }

  @Get(':id')
  async getIdea(@Param('id') id: string) {
    return await this.ideaService.getIdea(id);
  }

  @Patch(':id')
  async updateIdea(@Param('id') id: string, @Body() updateIdeaDto: UpdateIdeaDto) {
    return await this.ideaService.updateIdea(id, updateIdeaDto);
  }

  @Delete(':id')
  async removeIdea(@Param('id') id: string) {
    return await this.ideaService.removeIdea(id);
  }
}
