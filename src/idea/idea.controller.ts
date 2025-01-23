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

  @Patch('idea/:id/vote')
  async addVote(@Param('id') id: string) {
    const user = 'Ákos';
    return await this.ideaService.addVote(id, user);
  }

  @Patch('idea/:id/unvote')
  async removeVote(@Param('id') id: string) {
    const user = 'Ákos';
    return await this.ideaService.removeVote(id, user);
  }

  @Post('idea/:id/comment')
  async addComment(@Param('id') id: string, @Body('text') text: string) {
    const user = 'Ákos';
    return await this.ideaService.addComment(id, text, user);
  }

  @Delete('idea/:id/comment/:commentId')
  async removeComment(@Param('id') id: string, @Param('commentId') commentId: string) {
    const user = 'Ákos';
    return await this.ideaService.removeComment(id, commentId, user);
  }

  @Get('ideas/favourite')
  async getFavouriteIdeas() {
    const user = 'Ákos';
    return await this.ideaService.getFavouriteIdeas(user);
  }

  @Patch('ideas/status')
  async statusUpdate(@Body('ideaIds') ideaIds: string[], @Body('status') status: string) {
    const user = 'Ákos';
    return await this.ideaService.statusUpdate(ideaIds, status, user);
  }

}
