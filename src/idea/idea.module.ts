import { Module } from '@nestjs/common';
import { IdeaService } from './idea.service';
import { IdeaController } from './idea.controller';
import { Idea } from './entities/idea.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Choice } from './entities/choice.entity';
import { AiChat } from './entities/ai-chat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Idea, Choice, AiChat])],
  controllers: [IdeaController],
  providers: [IdeaService],
})
export class IdeaModule {}
