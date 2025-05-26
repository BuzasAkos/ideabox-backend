import { Module } from '@nestjs/common';
import { IdeaService } from './idea.service';
import { IdeaController } from './idea.controller';
import { Idea } from './entities/idea.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Choice } from './entities/choice.entity';
import { AiChat } from './entities/ai-chat.entity';
import { User } from './entities/user.mysql-entity';
import { Contact } from './entities/contact.mysql-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Idea, Choice, AiChat]), 
    TypeOrmModule.forFeature([User, Contact], "mysql"),
  ],
  controllers: [IdeaController],
  providers: [IdeaService],
})
export class IdeaModule {}
