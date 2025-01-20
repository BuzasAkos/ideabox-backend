import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IdeaService } from './idea.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';

@Controller('idea')
export class IdeaController {
  constructor(private readonly ideaService: IdeaService) {}

  @Post()
  async create(@Body() createIdeaDto: CreateIdeaDto) {
    return await this.ideaService.create(createIdeaDto);
  }

  @Get()
  async getAllIdeas() {
    return await this.ideaService.getAllIdeas();
  }

  @Get('favourite')
  async getFavouriteIdeas() {
    return await this.ideaService.getFavouriteIdeas();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.ideaService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateIdeaDto: UpdateIdeaDto) {
    return await this.ideaService.update(id, updateIdeaDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.ideaService.remove(id);
  }

  @Patch(':id/vote')
  async addVote(@Param('id') id: string) {
    return await this.ideaService.addVote(id);
  }

  @Patch(':id/unvote')
  async removeVote(@Param('id') id: string) {
    return await this.ideaService.removeVote(id);
  }

  @Post(':id/comment')
  async addComment(@Param('id') id: string, @Body('text') text: string) {
    return await this.ideaService.addComment(id, text);
  }

  @Delete(':id/comment/:commentId')
  async removeComment(@Param('id') id: string, @Param('commentId') commentId: string) {
    return await this.ideaService.removeComment(id, commentId);
  }

}
