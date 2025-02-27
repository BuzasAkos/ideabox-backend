import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { IdeaService } from './idea.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { CreateChoiceDto } from './dto/create-choice.dto';

@Controller('ideabox')
export class IdeaController {
  constructor(private readonly ideaService: IdeaService) {}

  @UseGuards(JwtAuthGuard)
  @Post('idea')
  async createIdea(@Body() createIdeaDto: CreateIdeaDto, @Req() req: any) {
    const user = req.user.name;
    return await this.ideaService.createIdea(createIdeaDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('ideas')
  async getAllIdeas(@Query('favourite') favourite: boolean, @Req() req: any) {
    const user = req.user.name;
    if (favourite) {
      return await this.ideaService.getAllIdeas(user);
    }
    return await this.ideaService.getAllIdeas();
  }

  @Get('idea/:id')
  async getIdea(@Param('id') id: string) {
    return await this.ideaService.getIdea(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('idea/:id')
  async updateIdea(@Param('id') id: string, @Body() updateIdeaDto: UpdateIdeaDto, @Req() req: any) {
    const user = req.user.name;
    return await this.ideaService.updateIdea(id, updateIdeaDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('idea/:id')
  async removeIdea(@Param('id') id: string, @Req() req: any) {
    const user = req.user.name;
    return await this.ideaService.removeIdea(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('idea/:id/vote')
  async addVote(@Param('id') id: string, @Req() req: any) {
    const user = req.user.name;
    return await this.ideaService.addVote(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('idea/:id/unvote')
  async removeVote(@Param('id') id: string, @Req() req: any) {
    const user = req.user.name;
    return await this.ideaService.removeVote(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('idea/:id/comment')
  async addComment(@Param('id') id: string, @Body('text') text: string, @Req() req: any) {
    const user = req.user.name;
    return await this.ideaService.addComment(id, text, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('idea/:id/comment/:commentId')
  async removeComment(@Param('id') id: string, @Param('commentId') commentId: string, @Req() req: any) {
    const user = req.user.name;
    return await this.ideaService.removeComment(id, commentId, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('ideas/favourite')
  async getFavouriteIdeas(@Req() req: any) {
    const user = req.user.name;
    return await this.ideaService.getAllIdeas(user);
  }

  @UseGuards(JwtAuthGuard)
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
