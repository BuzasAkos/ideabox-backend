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

  @Get('favourite')
  async getFavouriteIdeas() {
    return await this.ideaService.getFavouriteIdeas();
  }

  @Get(':id')
  async getIdea(@Param('id') id: string) {
    return await this.ideaService.getIdea(id);
  }

  @Patch('status')
  async statusUpdate(@Body('ideaIds') ideaIds: string[], @Body('status') status: string) {
    return await this.ideaService.statusUpdate(ideaIds, status);
  }

  @Patch(':id')
  async updateIdea(@Param('id') id: string, @Body() updateIdeaDto: UpdateIdeaDto) {
    return await this.ideaService.updateIdea(id, updateIdeaDto);
  }

  @Delete(':id')
  async removeIdea(@Param('id') id: string) {
    return await this.ideaService.removeIdea(id);
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
