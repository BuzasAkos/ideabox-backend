import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IdeaService } from './idea.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';

@Controller('ideabox')
export class IdeaController {
  constructor(private readonly ideaService: IdeaService) {}

  @Post('idea')
  async createIdea(@Body() createIdeaDto: CreateIdeaDto) {
    const user = 'Ákos';
    return await this.ideaService.createIdea(createIdeaDto, user);
  }

  @Get('ideas')
  async getAllIdeas() {
    return await this.ideaService.getAllIdeas();
  }

  @Get('idea/:id')
  async getIdea(@Param('id') id: string) {
    return await this.ideaService.getIdea(id);
  }

  @Patch('idea/:id')
  async updateIdea(@Param('id') id: string, @Body() updateIdeaDto: UpdateIdeaDto) {
    const user = 'Ákos';
    return await this.ideaService.updateIdea(id, updateIdeaDto, user);
  }

  @Delete('idea/:id')
  async removeIdea(@Param('id') id: string) {
    const user = 'Ákos';
    return await this.ideaService.removeIdea(id, user);
  }
}
