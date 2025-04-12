import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { IdeaService } from './idea.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { CreateChoiceDto } from './dto/create-choice.dto';

@UseGuards(JwtAuthGuard)
@Controller('ideabox')
export class IdeaController {
  constructor(private readonly ideaService: IdeaService) {}

  @Post('idea')
  async createIdea(@Body() createIdeaDto: CreateIdeaDto, @Req() req: any) {
    const user = req.user.name;
    return await this.ideaService.createIdea(createIdeaDto, user);
  }

  @Get('ideas')
  async getAllIdeas(@Query('favourite') favourite: boolean, @Query('search') searchText: string, @Req() req: any) {
    const user = "Ákos";
    if (favourite) {
      return await this.ideaService.getAllIdeas(user, searchText);
    }
    return await this.ideaService.getAllIdeas(undefined, searchText);
  }

  @Get('idea/:id')
  async getIdea(@Param('id') id: string) {
    return await this.ideaService.getIdea(id);
  }

  @Patch('idea/:id')
  async updateIdea(@Param('id') id: string, @Body() updateIdeaDto: UpdateIdeaDto, @Req() req: any) {
    const user = req.user.name;
    const roles = req.user.roles;
    return await this.ideaService.updateIdea(id, updateIdeaDto, user, roles);
  }

  @Delete('idea/:id')
  async removeIdea(@Param('id') id: string, @Req() req: any) {
    const user = req.user.name;
    const roles = req.user.roles;
    return await this.ideaService.removeIdea(id, user, roles);
  }

  @Patch('idea/:id/vote')
  async addVote(@Param('id') id: string, @Req() req: any) {
    const user = req.user.name;
    return await this.ideaService.addVote(id, user);
  }

  @Patch('idea/:id/unvote')
  async removeVote(@Param('id') id: string, @Req() req: any) {
    const user = req.user.name;
    return await this.ideaService.removeVote(id, user);
  }

  @Post('idea/:id/comment')
  async addComment(@Param('id') id: string, @Body('text') text: string, @Req() req: any) {
    const user = req.user.name;
    return await this.ideaService.addComment(id, text, user);
  }
  @Delete('idea/:id/comment/:commentId')
  async removeComment(@Param('id') id: string, @Param('commentId') commentId: string, @Req() req: any) {
    const user = req.user.name;
    return await this.ideaService.removeComment(id, commentId, user);
  }

  @Get('ideas/favourite')
  async getFavouriteIdeas(@Req() req: any) {
    const user = req.user.name;
    return await this.ideaService.getAllIdeas(user);
  }

  @Patch('ideas/status')
  async statusUpdate(@Body('ideaIds') ideaIds: string[], @Body('status') status: string, @Req() req: any) {
    const user = req.user.name;
    return await this.ideaService.statusUpdate(ideaIds, status, user);
  }

  @Post('choice')
  async createChoice(@Body() createChoiceDto: CreateChoiceDto) {
    return await this.ideaService.createChoice(createChoiceDto);
  }

  @Get('choices')
  async getChoices() {
    return await this.ideaService.getChoices();
  }

}
