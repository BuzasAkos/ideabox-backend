import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IdeaService } from './idea.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';

@Controller('idea')
export class IdeaController {
  constructor(private readonly ideaService: IdeaService) {}

  @Post()
  createIdea(@Body() createIdeaDto: CreateIdeaDto) {
    return this.ideaService.createIdea(createIdeaDto);
  }

  @Get()
  getAllIdeas() {
    return this.ideaService.getAllIdeas();
  }

  @Get(':id')
  getIdea(@Param('id') id: string) {
    return this.ideaService.getIdea(id);
  }

  @Patch(':id')
  updateIdea(@Param('id') id: string, @Body() updateIdeaDto: UpdateIdeaDto) {
    return this.ideaService.updateIdea(id, updateIdeaDto);
  }

  @Delete(':id')
  removeIdea(@Param('id') id: string) {
    return this.ideaService.removeIdea(id);
  }
}
