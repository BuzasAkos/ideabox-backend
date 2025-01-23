import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IdeaService } from './idea.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';

@Controller('ideabox')
export class IdeaController {
  constructor(private readonly ideaService: IdeaService) {}

  @Post('idea')
  createIdea(@Body() createIdeaDto: CreateIdeaDto) {
    const user = 'Ákos';
    return this.ideaService.createIdea(createIdeaDto, user);
  }

  @Get('ideas')
  getAllIdeas() {
    return this.ideaService.getAllIdeas();
  }

  @Get('idea/:id')
  getIdea(@Param('id') id: string) {
    return this.ideaService.getIdea(id);
  }

  @Patch('idea/:id')
  updateIdea(@Param('id') id: string, @Body() updateIdeaDto: UpdateIdeaDto) {
    const user = 'Ákos';
    return this.ideaService.updateIdea(id, updateIdeaDto, user);
  }

  @Delete('idea/:id')
  removeIdea(@Param('id') id: string) {
    const user = 'Ákos';
    return this.ideaService.removeIdea(id, user);
  }
}
